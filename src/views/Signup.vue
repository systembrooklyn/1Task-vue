<script setup>
import {
  ref,
  computed,
  onBeforeMount,
  onBeforeUnmount,
  watch,
  onMounted,
} from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router"; // استدعاء Vue Router

import LandingNavbar from "@/components/landing/LandingNavbar.vue";
import FooterSection from "@/views/landing/sections/FooterSection.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
import ArgonButton from "@/components/ArgonButton.vue";

const store = useStore();
const router = useRouter(); // لإنشاء التوجيه
const userId = computed(() => store.getters.userId);
const dataFromApi = computed(() => store.state.dataFromApi);

const email = computed(() => store.getters.tempEmail);

// تعريف المتغيرات لتخزين القيم المدخلة
const name = ref("");
const lastName = ref("");
const companyName = ref("");
const password = ref("");
const passwordValid = ref(false); // للتحقق من صحة كلمة المرور
const showPassword = ref(false); // للتحكم في إظهار كلمة المرور
const confirmPassword = ref("");
const passwordsMatch = computed(() => confirmPassword.value === password.value);

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

watch([password, confirmPassword], () => {
  passwordsMatch.value = password.value === confirmPassword.value;
});

// إرسال البيانات عند الضغط على الزر
const submitForm = async () => {
  if (!passwordValid.value) {
    console.error("Password does not meet the requirements");
    return;
  }

  try {
    const formData = {
      name: name.value,
      last_name: lastName.value,
      company_name: companyName.value,
      password: password.value,
      email: email.value,
      password_confirmation: confirmPassword.value,
      companySize: selectedCompanySize.value,
      industry: selectedIndustry.value,
    };

    await store.dispatch("submitEmail", formData);
    router.push("/signin");
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

// جلب بيانات المستخدم
onMounted(() => {
  console.log("User ID:", userId.value);
  if (userId.value) {
    store.dispatch("fetchDataFromApi", userId.value);
  }
});

console.log(dataFromApi.value);

const body = document.getElementsByTagName("body")[0];

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
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});

// تعريف الترجمات داخل المكون
const translations = {
  en: {
    name: "User Name *",
    firstName: "First Name *",
    lastName: "Last Name *",
    myTask: "My Task",
    newOrganization: "New Organization",
    enterDetails: "Enter your new company workspace details",
    companyName: "Company Name *",
    email: "Email",
    password: "Password *",
    repeatPassword: "Repeat Password",
    phone: "Phone",
    companySize: "Company Size",
    industry: "Industry",
    agreeTerms: "I agree to the Terms and Conditions",
    signUp: "Sign Up",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In",
    attentionIsNewCurrency: '"Attention is the new currency"',
    effortlessWriting:
      "The more effortless the writing looks, the more effort the writer actually put into the process.",
    finance: "Finance",
    manufacturing: "Manufacturing",
    retail: "Retail",
    other: "Other",
    passwordRequirements:
      "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.",
    passwordValid: "Password is valid ✅",
    confirmationPassword: "Confirm your Password *",
    passwordsMatch: "Passwords match ✅",
    passwordsDoNotMatch: "Passwords do not match",
  },
  ar: {
    name: "*أسم المستخدم",
    firstName: "*الاسم الأول",
    lastName: "*الاسم الأخير",
    myTask: "مهمتي",
    newOrganization: "منظمة جديدة",
    enterDetails: "أدخل تفاصيل مساحة عمل شركتك الجديدة",
    companyName: "*اسم الشركة",
    email: "البريد الإلكتروني",
    password: "*كلمة المرور",
    repeatPassword: "تأكيد كلمة المرور",
    phone: "الهاتف",
    companySize: "حجم الشركة",
    industry: "الصناعة",
    agreeTerms: "أوافق على الشروط والأحكام",
    signUp: "تسجيل",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    signIn: "تسجيل الدخول",
    attentionIsNewCurrency: '"الانتباه هو العملة الجديدة"',
    effortlessWriting:
      "كلما بدت الكتابة أكثر سهولة، كلما بذل الكاتب مجهودًا أكبر في العملية.",
    finance: "المالية",
    manufacturing: "التصنيع",
    retail: "التجزئة",
    other: "أخرى",
    passwordRequirements:
      "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وتشمل حرفًا كبيرًا، حرفًا صغيرًا، رقمًا، وحرفًا خاصًا.",
    passwordValid: "كلمة المرور مطابقة للشروط ✅",
    confirmationPassword: "تأكيد كلمة المرور",
    passwordsMatch: " ✅كلمات المرور متطابقة",
    passwordsDoNotMatch: "كلمات المرور غير متطابقة",
  },
};

const currentLanguage = computed(() => store.getters.currentLanguage);
const darkMode = computed(() => store.state.darkMode);

const t = (key) => {
  return translations[currentLanguage.value][key];
};

// تعريف المتغيرات والخيارات للـ `<argon-select>`
const selectedCompanySize = ref("");
const companySizeOptions = [
  { value: "1", label: "1-10" },
  { value: "2", label: "11-50" },
  { value: "3", label: "51-100" },
  { value: "4", label: "101-500" },
];

const selectedIndustry = ref("");
const industryOptions = computed(() => [
  { value: "1", label: t("finance") },
  { value: "2", label: t("manufacturing") },
  { value: "3", label: t("retail") },
  { value: "4", label: t("other") },
]);
</script>

<template>
  <div class="signup-page antialiased" :class="{ 'dark-version': darkMode }">
    <LandingNavbar />
    <main class="signup-main">
      <section class="signup-hero hero-bg">
        <div class="page-header min-vh-100">
          <div class="container signup-container">
            <div class="row align-items-center">
              <!-- Form column -->
              <div class="col-lg-5 col-md-7 d-flex flex-column mx-lg-0 mx-auto order-lg-1"
                :class="currentLanguage === 'ar' ? 'order-2' : ''">
                <div class="card signup-card card-plain animate-fade-in-up">
                  <div class="signup-card-header text-center pb-0">
                    <img
                      src="https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1)%20(1).png?ik-obj-version=9sTuepUtU27Iw3.FfIbdKOdc7MYL4WM0&updatedAt=1737223784202"
                      alt="Task Management"
                      class="signup-logo mb-4 mx-auto w-50"
                    />
                    <h1 class="signup-title font-weight-bolder mb-2">
                      <span class="gradient-text">{{ t("newOrganization") }}</span>
                    </h1>
                    <p class="signup-subtitle mb-0">{{ t("enterDetails") }}</p>
                  </div>
                  <div class="card-body">
                    <form role="form" @submit.prevent="submitForm">
                      <div class="row">
                        <div class="col-6">
                          <argon-input
                            id="firstName"
                            type="text"
                            :placeholder="t('firstName')"
                            :aria-label="t('firstName')"
                            v-model="name"
                          />
                        </div>
                        <div class="col-6">
                          <argon-input
                            id="lastName"
                            type="text"
                            :placeholder="t('lastName')"
                            :aria-label="t('lastName')"
                            v-model="lastName"
                          />
                        </div>
                      </div>
                      <argon-input
                        id="companyName"
                        type="text"
                        :placeholder="t('companyName')"
                        :aria-label="t('companyName')"
                        v-model="companyName"
                      />
                      <argon-input
                        id="email"
                        class="email"
                        type="email"
                        :placeholder="t('email')"
                        :aria-label="t('email')"
                        v-model="email"
                      />
                      <div class="position-relative mb-3">
                        <div class="position-relative">
                          <argon-input
                            id="password"
                            :type="showPassword ? 'text' : 'password'"
                            :placeholder="t('password')"
                            :aria-label="t('password')"
                            v-model="password"
                          />
                          <span
                            @click="showPassword = !showPassword"
                            class="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer signup-toggle-pwd"
                          >
                            <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                          </span>
                        </div>
                        <p v-if="passwordValid" class="text-success mt-2 mb-0 small">{{ t("passwordValid") }}</p>
                        <p v-if="!passwordValid" class="text-danger mt-2 mb-0 small">{{ t("passwordRequirements") }}</p>
                      </div>
                      <div class="position-relative mb-3">
                        <div class="position-relative">
                          <argon-input
                            id="confirmationPassword"
                            :type="showPassword ? 'text' : 'password'"
                            :placeholder="t('confirmationPassword')"
                            :aria-label="t('confirmationPassword')"
                            v-model="confirmPassword"
                          />
                          <span
                            @click="showPassword = !showPassword"
                            class="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer signup-toggle-pwd"
                          >
                            <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                          </span>
                        </div>
                        <p v-if="passwordsMatch && confirmPassword" class="text-success mt-2 mb-0 small">{{ t("passwordsMatch") }}</p>
                        <p v-if="!passwordsMatch && confirmPassword" class="text-danger mt-2 mb-0 small">{{ t("passwordsDoNotMatch") }}</p>
                      </div>
                      <argon-select
                        id="company-size"
                        v-model="selectedCompanySize"
                        :options="companySizeOptions"
                        :placeholder="t('companySize')"
                        :aria-label="t('companySize')"
                      />
                      <argon-select
                        id="industry"
                        v-model="selectedIndustry"
                        :options="industryOptions"
                        :placeholder="t('industry')"
                        :aria-label="t('industry')"
                      />
                      <argon-checkbox checked>
                        <label class="form-check-label" for="flexCheckDefault">
                          {{ t("agreeTerms") }}
                        </label>
                      </argon-checkbox>
                      <div class="text-center">
                        <argon-button
                          class="signup-btn-primary mt-4 rounded-pill px-5"
                          variant="gradient"
                          color="success"
                          fullWidth
                          size="lg"
                          :disabled="!passwordValid || !passwordsMatch || companyName === ''"
                        >
                          {{ t("signUp") }}
                        </argon-button>
                      </div>
                    </form>
                  </div>
                  <div class="card-footer signup-card-footer text-center px-lg-2 pt-0 px-1">
                    <p class="mb-0 text-sm mx-auto">
                      {{ t("alreadyHaveAccount") }}
                      <a href="/signin" class="signup-link font-weight-bold">{{ t("signIn") }}</a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Illustration column -->
              <div class="col-lg-6 order-lg-2">
                <div class="hero-image-wrapper animate-fade-in-up">
                  <img
                    src="https://ik.imagekit.io/ts7pphpbz3/b3905bc5-dacf-4897-8f09-74fa2f122768.jpg"
                    alt="Task Management Interface"
                    class="hero-img rounded-3"
                    loading="lazy"
                  />
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

.email {
  pointer-events: none;
}

/* Design tokens - match LandingPage / Signin */
.signup-page {
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

.signup-page.dark-version {
  --text-light: #{$dark-version-body-color};
  --text-dark: rgba(255, 255, 255, 0.9);
  --bg-light: #{$dark-version-card-bg-color};
  --bg-dark: #{$dark-version-bg-color};
  --border-light: #{$dark-version-border-color};
  --border-dark: #{$dark-version-border-color};
}

.signup-page:not(.dark-version) {
  background-color: var(--bg-light);
  color: var(--text-dark);
}

.signup-page.dark-version {
  background-color: var(--bg-dark);
  color: var(--text-light);
}

.hero-bg {
  background-image: radial-gradient(circle at top right, var(--primary-100) 0%, transparent 40%),
    radial-gradient(circle at bottom left, var(--primary-100) 0%, transparent 40%);
}

.signup-page.dark-version .hero-bg {
  background-image: radial-gradient(circle at top right, rgba(166, 201, 90, 0.1) 0%, transparent 40%),
    radial-gradient(circle at bottom left, rgba(166, 201, 90, 0.1) 0%, transparent 40%);
}

.signup-main {
  padding-top: 0;
}

.signup-hero {
  padding-top: 6rem;
  padding-bottom: 4rem;
  min-height: 100vh;
}

.signup-container {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.signup-card {
  background: var(--bg-light) !important;
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.signup-page.dark-version .signup-card {
  background: var(--bg-light) !important;
  border-color: var(--border-dark);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.signup-card-header {
  padding-top: 1.5rem;
  padding-bottom: 0.5rem;
}

.signup-logo {
  max-width: 50%;
}

.signup-card-footer {
  background: transparent !important;
  border-top: 1px solid var(--border-light);
  padding: 1rem 1.5rem;
}

.signup-page.dark-version .signup-card-footer {
  border-top-color: var(--border-dark);
}

.signup-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-500) 0%, #aef63b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.signup-subtitle {
  font-size: 0.9375rem;
  color: var(--text-light);
}

.signup-btn-primary {
  background: linear-gradient(135deg, #aef63b 0%, var(--primary-600) 100%) !important;
  border: none !important;
  color: #0f172a !important;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(140, 168, 67, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.signup-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(140, 168, 67, 0.4);
}

.signup-btn-primary:disabled {
  opacity: 0.7;
}

.signup-link {
  color: var(--primary-600) !important;
  text-decoration: none;
  transition: opacity 0.2s;
}

.signup-link:hover {
  opacity: 0.85;
}

.signup-page.dark-version .signup-link {
  color: var(--primary-500) !important;
}

.signup-toggle-pwd {
  color: var(--text-light);
}

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
  transition: box-shadow 0.3s ease;
}

.hero-image-wrapper:hover .hero-img {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(166, 201, 90, 0.3);
}

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

.rtl .hero-image-wrapper {
  transform: rotate(-2deg);
}

.rtl .hero-image-wrapper:hover {
  transform: rotate(-3deg) scale(1.02);
}

.rtl .hero-image-wrapper::before {
  transform: rotate(2deg);
}

@media (max-width: 991.98px) {
  .signup-hero {
    padding-top: 5rem;
    padding-bottom: 3rem;
  }

  .hero-image-wrapper {
    display: none;
  }
}

@media (max-width: 767.98px) {
  .signup-title {
    font-size: 1.5rem;
  }

  .signup-subtitle {
    font-size: 0.875rem;
  }

  .signup-logo {
    max-width: 60%;
  }
}
</style>
