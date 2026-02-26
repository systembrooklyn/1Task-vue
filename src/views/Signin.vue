<script setup>
import { ref, computed, onBeforeMount, onBeforeUnmount, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

import LandingNavbar from "@/components/landing/LandingNavbar.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import FooterSection from "@/views/landing/sections/FooterSection.vue";
import { loadPermissionsFromLocalStorage } from "@/utils/permissions.js";

const store = useStore();
const router = useRouter(); // لاستخدام التوجيه بعد تسجيل الدخول
const email = ref(""); // البريد الإلكتروني المدخل
const password = ref(""); // كلمة المرور المدخلة
const showPassword = ref(false); // للتحكم في عرض/إخفاء كلمة المرور
const showAlert = ref(false); // حالة التحكم في عرض التنبيه
const errorMessage = ref(""); // رسالة الخطأ التي ستظهر عند الفشل
const passwordValid = ref(false); // للتحقق من صحة كلمة المرور
const isOwner = computed(() => store.getters.isOwner);

const body = document.getElementsByTagName("body")[0];
const isLoading = ref(false);
const userData = computed(() => store.getters.user);

const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.id) || {}
);

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  store.state.showNavbar = false;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");

  const isRTL = store.getters.currentLanguage === "ar";
  document
    .querySelector("html")
    .setAttribute("lang", store.getters.currentLanguage);
  document.querySelector("html").setAttribute("dir", isRTL ? "rtl" : "ltr");
  document.querySelector("#app").classList.toggle("rtl", isRTL);
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});

// دالة التحقق من قوة كلمة المرور
const validatePassword = (password) => {
  const regex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_#-])[A-Za-z\d@$!%*?&_#-]{8,}$/;
  return regex.test(password);
};

// مراقبة إدخال كلمة المرور والتحقق منها
watch(password, (newPassword) => {
  passwordValid.value = validatePassword(newPassword);
});

// دالة التحقق من البريد الإلكتروني وكلمة المرور
const signIn = async () => {
  isLoading.value = true;
  if (!passwordValid.value) {
    errorMessage.value =
      store.getters.currentLanguage === "ar"
        ? "كلمة المرور غير مطابقة للشروط."
        : "Password does not meet the requirements.";
    showAlert.value = true;

    // إخفاء التنبيه بعد 3 ثوانٍ
    setTimeout(() => {
      isLoading.value = false;
      showAlert.value = false;
    }, 3000);
    return;
  }

  try {
    const formData = {
      email: email.value,
      password: password.value,
    };

    console.log("formData:", formData);
    // إرسال البيانات إلى المسار للتحقق من تسجيل الدخول
    const response = await store.dispatch("signIn", formData);
    console.log("response:", response);
    if (response.status === 200) {
      isLoading.value = false;
      const user = store.getters.user;
      console.log("useRRRRRRRRr:", user);
      const companyName = user.user.company.name;
      const companyNameNormalized = companyName.replace(/\s+/g, "-"); // مثلاً

      console.log("companyNamEEEEEe:", companyName);

      // إعادة تحميل الصلاحيات بعد تسجيل الدخول الناجح
      const userId = user.user.id;

      // محاولة تحميل الصلاحيات من localStorage أولاً، ثم من store
      let updatedPermissions = loadPermissionsFromLocalStorage(userId);
      if (!updatedPermissions || Object.keys(updatedPermissions).length === 0) {
        updatedPermissions = store.getters.permissions || {};
      }

      // تحديث permissions.value بالصلاحيات الجديدة
      permissions.value = updatedPermissions;

      console.log("Updated permissions after login:", updatedPermissions);
      console.log("isOwner value:", isOwner.value);
      console.log("has view-dashboard:", updatedPermissions['view-dashboard']);
      console.log("has view-dashboard-owner:", updatedPermissions['view-dashboard-owner']);

      // التحقق من ظهور tab الداشبورد (نفس الشرط المستخدم في SidenavList.vue)
      // الشرط: isOwner أو view-dashboard أو view-dashboard-owner
      const hasDashboardAccess =
        isOwner.value ||
        updatedPermissions['view-dashboard'] === true ||
        updatedPermissions['view-dashboard-owner'] === true;

      console.log("hasDashboardAccess:", hasDashboardAccess);

      if (hasDashboardAccess) {
        router.push({
          name: "Dashboard",
          params: {
            companyName: companyNameNormalized,
          },
        });
      } else {
        router.push({
          name: "routine task",
          params: {
            companyName: companyNameNormalized,
          },
        });
      }
    } else {
      isLoading.value = false;
      errorMessage.value = t("loginError");
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 3000);
    }
  } catch (error) {
    isLoading.value = false;
    console.error("Error logging in:", error);
    errorMessage.value = t("loginError");
    showAlert.value = true;

    // إخفاء التنبيه بعد 3 ثوانٍ
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
  }
};

const showForgotPasswordForm = () => {
  router.push("/forgot-password");
};

const translations = {
  en: {
    signIn: "Sign In",
    enterEmailAndPassword: "Enter your email and password to sign in",
    email: "Email",
    password: "Password",
    rememberMe: "Remember me",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign Up",
    attentionIsNewCurrency: '"Attention is the new currency"',
    effortlessWriting:
      "The more effortless the writing looks, the more effort the writer actually put into the process.",
    forgotPassword: "Forgot password?",
    passwordRequirements:
      "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.",
    passwordValid: "Password is valid ✅",
    showPassword: "Show Password",
    hidePassword: "Hide Password",
    showForgotPasswordForm: "Show Forgot Password Form",
    loginError: "Email or password is incorrect.",
    generalError: "There was an error logging in. Please try again.",
  },
  ar: {
    signIn: "تسجيل الدخول",
    enterEmailAndPassword: "أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    rememberMe: "تذكرني",
    dontHaveAccount: "ليس لديك حساب؟",
    signUp: "تسجيل",
    attentionIsNewCurrency: '"الانتباه هو العملة الجديدة"',
    effortlessWriting:
      "كلما بدت الكتابة أكثر سهولة، كلما بذل الكاتب مجهودًا أكبر في العملية.",
    forgotPassword: "نسيت كلمة المرور؟",
    passwordRequirements:
      "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وتشمل حرفًا كبيرًا، وحرفًا صغيرًا، ورقمًا، وحرفًا خاصًا.",
    passwordValid: "كلمة المرور مطابقة للشروط ✅",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    showForgotPasswordForm: "اظهار نموذج نسيت كلمة المرور",
    loginError: "البريد الإلكتروني او كلمة المرور غير صحيح",
    generalError: "حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.",
  },
};

const currentLanguage = computed(() => store.getters.currentLanguage);
const darkMode = computed(() => store.state.darkMode);

const t = (key) => {
  return translations[currentLanguage.value][key];
};
</script>

<template>
  <div class="signin-page antialiased" :class="{ 'dark-version': darkMode }">
    <LandingNavbar />
    <main class="signin-main">
      <section class="signin-hero hero-bg">
        <div class="page-header min-vh-100">
          <div class="container signin-container">
            <div class="row align-items-center">
              <!-- Form column -->
              <div class="col-lg-6 col-md-7 d-flex flex-column mx-lg-0 mx-auto order-lg-1"
                :class="currentLanguage === 'ar' ? 'order-2' : ''">
                <div class="card signin-card card-plain animate-fade-in-up">
                  <div class="card-header signin-card-header pb-0 text-center">
                    <h1 class="signin-title font-weight-bolder mb-2">
                      <span class="gradient-text">{{ t("signIn") }}</span>
                    </h1>
                    <p class="signin-subtitle mb-0">{{ t("enterEmailAndPassword") }}</p>
                  </div>
                  <div class="card-body">
                    <form role="form" @submit.prevent="signIn">
                      <div class="mb-3">
                        <argon-input v-model="email" id="email" type="email" :placeholder="t('email')" name="email"
                          size="lg" />
                      </div>
                      <div class="mb-3 position-relative">
                        <div class="position-relative">
                          <argon-input v-model="password" id="password" :type="showPassword ? 'text' : 'password'"
                            :placeholder="t('password')" name="password" size="lg" />
                          <span @click="showPassword = !showPassword"
                            class="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer signin-toggle-pwd">
                            <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                          </span>
                        </div>
                        <p v-if="passwordValid" class="text-success mt-2 mb-0 small">
                          {{ t("passwordValid") }}
                        </p>
                        <p v-if="!passwordValid" class="text-danger mt-2 mb-0 small">
                          {{ t("passwordRequirements") }}
                        </p>
                      </div>
                      <p class="mx-auto mb-4 text-sm text-center">
                        <a href="javascript:;" @click="showForgotPasswordForm" class="signin-link font-weight-bold">
                          {{ t("forgotPassword") }}
                        </a>
                      </p>
                      <argon-alert v-if="showAlert" color="danger">
                        {{ errorMessage }}
                      </argon-alert>
                      <div class="text-center">
                        <argon-button class="signin-btn-primary mt-4 d-flex align-items-center justify-content-center rounded-pill px-5"
                          variant="gradient" color="success" fullWidth size="lg" :disabled="!passwordValid">
                          <span class="me-2">{{ t("signIn") }}</span>
                          <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        </argon-button>
                      </div>
                    </form>
                  </div>
                  <div class="card-footer signin-card-footer px-lg-2 text-center">
                    <p class="mx-auto mb-0 text-sm">
                      {{ t("dontHaveAccount") }}
                      <a href="/signup" class="signin-link font-weight-bold">{{ t("signUp") }}</a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Illustration column -->
              <div class="col-lg-6 order-lg-2">
                <div class="hero-image-wrapper animate-fade-in-up">
                  <img src="https://ik.imagekit.io/ts7pphpbz3/Copy%20of%201task%20(8).gif" alt="Task Management Interface"
                    class="hero-img rounded-3" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <FooterSection />
  </div>
</template>

<style lang="scss" scoped>
@import "~@/assets/scss/argon-dashboard/variables/dark-version";

/* Design tokens - match LandingPage */
.signin-page {
  --primary-50: #f7faef;
  --primary-100: #ecf4dc;
  --primary-500: #a6c95a;
  --primary-600: #8ca843;
  --primary-700: #73883a;
  --text-light: #475569;
  --text-dark: #0f172a;
  --bg-light: #ffffff;
  --bg-dark: #0f172a;
  --border-light: #e2e8f0;
  --border-dark: #1e293b;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.signin-page.dark-version {
  --text-light: #{$dark-version-body-color};
  --text-dark: rgba(255, 255, 255, 0.9);
  --bg-light: #{$dark-version-card-bg-color};
  --bg-dark: #{$dark-version-bg-color};
  --border-light: #{$dark-version-border-color};
  --border-dark: #{$dark-version-border-color};
}

.signin-page:not(.dark-version) {
  background-color: var(--bg-light);
  color: var(--text-dark);
}

.signin-page.dark-version {
  background-color: var(--bg-dark);
  color: var(--text-light);
}

/* Hero background - same as landing */
.hero-bg {
  background-image: radial-gradient(circle at top right, var(--primary-100) 0%, transparent 40%),
    radial-gradient(circle at bottom left, var(--primary-100) 0%, transparent 40%);
}

.signin-page.dark-version .hero-bg {
  background-image: radial-gradient(circle at top right, rgba(166, 201, 90, 0.1) 0%, transparent 40%),
    radial-gradient(circle at bottom left, rgba(166, 201, 90, 0.1) 0%, transparent 40%);
}

.signin-main {
  padding-top: 0;
}

.signin-hero {
  padding-top: 6rem;
  padding-bottom: 4rem;
  min-height: 100vh;
}

.signin-container {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

/* Card */
.signin-card {
  background: var(--bg-light) !important;
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.signin-page.dark-version .signin-card {
  background: var(--bg-light) !important;
  border-color: var(--border-dark);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.signin-card-header {
  background: transparent !important;
  border-bottom: none !important;
  padding-top: 1.5rem;
}

.signin-card-footer {
  background: transparent !important;
  border-top: 1px solid var(--border-light);
  padding: 1rem 1.5rem;
}

.signin-page.dark-version .signin-card-footer {
  border-top-color: var(--border-dark);
}

/* Typography */
.signin-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.2;
}

.signin-page.dark-version .signin-title {
  color: var(--text-dark);
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-500) 0%, #aef63b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.signin-subtitle {
  font-size: 1rem;
  color: var(--text-light);
}

/* Primary button - match landing CTA */
.signin-btn-primary {
  background: linear-gradient(135deg, #aef63b 0%, var(--primary-600) 100%) !important;
  border: none !important;
  color: #0f172a !important;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(140, 168, 67, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.signin-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(140, 168, 67, 0.4);
}

.signin-btn-primary:disabled {
  opacity: 0.7;
}

/* Links */
.signin-link {
  color: var(--primary-600) !important;
  text-decoration: none;
  transition: opacity 0.2s;
}

.signin-link:hover {
  opacity: 0.85;
}

.signin-page.dark-version .signin-link {
  color: var(--primary-500) !important;
}

.signin-toggle-pwd {
  color: var(--text-light);
}

/* Illustration */
.hero-image-wrapper {
  position: relative;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 1rem;
  transform: rotate(2deg);
  transition: transform 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.hero-image-wrapper::before {
  content: "";
  position: absolute;
  inset: -10px;
  background: linear-gradient(45deg, var(--primary-500) 30%, var(--primary-600) 70%);
  border-radius: 1rem;
  z-index: -1;
  transform: rotate(-2deg);
  filter: blur(12px);
  opacity: 0.25;
  transition: opacity 0.3s ease;
}

.hero-image-wrapper:hover {
  transform: rotate(3deg) scale(1.02);
}

.hero-image-wrapper:hover::before {
  opacity: 0.4;
}

.hero-img {
  width: 100%;
  height: 500px;
  object-fit: cover;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hero-image-wrapper:hover .hero-img {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(166, 201, 90, 0.3);
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* RTL */
.rtl .hero-image-wrapper {
  transform: rotate(-2deg);
}

.rtl .hero-image-wrapper:hover {
  transform: rotate(-3deg) scale(1.02);
}

.rtl .hero-image-wrapper::before {
  transform: rotate(2deg);
}

/* Responsive */
@media (max-width: 991.98px) {
  .signin-hero {
    padding-top: 5rem;
    padding-bottom: 3rem;
  }

  .hero-image-wrapper {
    display: none;
  }
}

@media (max-width: 767.98px) {
  .signin-title {
    font-size: 1.75rem;
  }

  .signin-subtitle {
    font-size: 0.9375rem;
  }
}
</style>
