<script setup>
import { ref, computed, onBeforeMount, onBeforeUnmount, watch } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router"; // استدعاء Vue Router
// import Swal from "sweetalert2";

// import Navbar from "@/examples/PageLayout/Navbar.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();
const id = ref(route.query.id ? Number(atob(decodeURIComponent(route.query.id))) : 0);
const userId = ref(null); // لتخزين الـ userId بعد الحصول عليه
const password = ref(""); // لتخزين كلمة المرور الجديدة المدخلة
const confirmPassword = ref(""); // لتخزين تأكيد كلمة المرور الجديدة
const passwordValid = ref(false); // للتحقق من صحة كلمة المرور
const showAlert = ref(false); // حالة التحكم في عرض التنبيه
const errorMessage = ref(""); // رسالة الخطأ التي ستظهر عند الفشل
const successMessage = ref(""); // رسالة النجاح التي ستظهر عند التمام
const showSuccess = ref(false); // حالة التحكم في عرض النجاح
const showPassword = ref(false);
const passwordsMatch = ref(false);



// دالة التحقق من قوة كلمة المرور
const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&-_]{8,}$/;
  return regex.test(password);
};

// مراقبة إدخال كلمة المرور والتحقق منها
watch(password, (newPassword) => {
  passwordValid.value = validatePassword(newPassword);
});

watch([password, confirmPassword], () => {
  passwordsMatch.value = password.value === confirmPassword.value;
});

// const expiryTime = ref(route.query.expiry ? Number(atob(decodeURIComponent(route.query.expiry))) : 0);
// console.log(expiryTime.value);

const token = ref(route.query.token ? route.query.token : '');
const email = ref(route.query.token ? route.query.email : '');


const body = document.getElementsByTagName("body")[0];

// onBeforeMount(() => {
//   const currentTime = new Date().getTime();
//   if (currentTime > expiryTime.value) {
//     // If the link has expired, show an error message and redirect to an appropriate page
//     const Toast = Swal.mixin({
//       toast: true,
//       position: "center",
//       showConfirmButton: true,
//       timer: 6000,
//       timerProgressBar: true,
//       didOpen: (toast) => {
//         toast.addEventListener("mouseenter", Swal.stopTimer);
//         toast.addEventListener("mouseleave", Swal.resumeTimer);
//       },
//     });

//     Toast.fire({
//       icon: "error",
//       title: "This reset password link has expired. Please request a new link.",
//     });

//     // Redirect to forgot-password page after displaying the toast
//     setTimeout(() => {
//       router.push("/forgot-password");
//     }, 3000);
//   }
// });

onBeforeMount(async () => {
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

  // الحصول على userId باستخدام البريد الإلكتروني
  if (id.value) {
    try {
      const response = await store.dispatch("checkIdExists", id.value);
      if (response) {
        userId.value = id.value;
        console.log("User ID:", userId.value);
      } else {
        errorMessage.value =
          store.getters.currentLanguage === "ar"
            ? "هذا البريد الإلكتروني غير موجود."
            : "This email does not exist.";
        showAlert.value = true;
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  }
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});

// دالة لتحديث كلمة المرور
// دالة لتحديث كلمة المرور
const updatePassword = async () => {
  if (!passwordValid.value) {
    errorMessage.value =
      store.getters.currentLanguage === "ar"
        ? "❌ كلمة المرور لا تتطابق مع الشروط المطلوبة. تأكد من أنها تحتوي على 8 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم، ورمز خاص."
        : "❌ Password does not meet the requirements. Ensure it has at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.";
    showAlert.value = true;
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value =
      store.getters.currentLanguage === "ar"
        ? "❌ كلمتا المرور غير متطابقتين. يرجى التأكد من إدخالهما بشكل صحيح."
        : "❌ Passwords do not match. Please ensure they are entered correctly.";
    showAlert.value = true;
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
    return;
  }

  try {
    const resetPassData = {
      token: token.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value
    };

    const responseMessage = await store.dispatch("updatePassword", resetPassData); // الحصول على الرسالة من الـ Vuex

    // التحقق من حالة الاستجابة
    if (responseMessage === "Your password has been reset.") {
      successMessage.value =
        store.getters.currentLanguage === "ar"
          ? " تم تحديث كلمة المرور بنجاح! "
          : " Password updated successfully! ";
      showSuccess.value = true;
      showAlert.value = false;

      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول بعد 3 ثوانٍ
      setTimeout(() => {
        router.push("/signin");
      }, 3000);

    } else {
      errorMessage.value =
        store.getters.currentLanguage === "ar"
          ? " حدث خطأ في تحديث كلمة المرور. حاول مرة أخرى لاحقًا."
          : " An error occurred while updating the password. Please try again later.";
      showAlert.value = true;

      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول بعد 3 ثوانٍ
      setTimeout(() => {
        showAlert.value = true;
      }, 3000);
    }

  } catch (error) {
    console.error("Error updating password:", error);
    errorMessage.value =
      store.getters.currentLanguage === "ar"
        ? "❌ حدث خطأ أثناء تحديث كلمة المرور. حاول مرة أخرى لاحقًا."
        : "❌ An error occurred while updating the password. Please try again later.";
    showAlert.value = true;
  }

  setTimeout(() => {
    showAlert.value = false;
  }, 3000);
};

const translations = {
  en: {
    signIn: "Sign In",
    enterEmailAndPassword: "Enter your email and password to sign in",
    enterEmail: "Enter your email",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    updatePassword: "Update Password",
    enterPassword: "Enter your new password",
    rememberMe: "Remember me",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign Up",
    attentionIsNewCurrency: '"Attention is the new currency"',
    effortlessWriting:
      "The more effortless the writing looks, the more effort the writer actually put into the process.",
    forgotPassword: "Forgot password",
    send: "send",
    passwordRequirements:
      "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.",
      passwordValid: "Password is valid ✅",
      confirmationPassword: "Confirm your Password *",
    passwordsMatch: "Passwords match ✅",
    passwordsDoNotMatch: "Passwords do not match",
    },
  ar: {
    confirmationPassword: "تأكيد كلمة المرور *",
    passwordsMatch: "كلمات المرور متطابقة ✅",
    passwordsDoNotMatch: "كلمات المرور غير متطابقة",


    signIn: "تسجيل الدخول",
    enterEmailAndPassword: "أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول",
    enterEmail: "أدخل بريدك الإلكتروني",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    updatePassword: "تحديث كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    enterPassword: "أدخل كلمة المرور الجديدة",
    rememberMe: "تذكرني",
    dontHaveAccount: "ليس لديك حساب؟",
    signUp: "تسجيل",
    attentionIsNewCurrency: '"الانتباه هو العملة الجديدة"',
    effortlessWriting:
      "كلما بدت الكتابة أكثر سهولة، كلما بذل الكاتب مجهودًا أكبر في العملية.",
    forgotPassword: "نسيت كلمة المرور",
    send: "إرسال",
    passwordRequirements:
      "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وتشمل حرفًا كبيرًا، حرفًا صغيرًا، رقمًا، وحرفًا خاصًا.",
    passwordValid: "كلمة المرور مطابقة للشروط ✅",
  },
};

const currentLanguage = computed(() => store.getters.currentLanguage);

const t = (key) => {
  return translations[currentLanguage.value][key];
};
</script>

<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <!-- <div class="col-12">
        <navbar
          isBlur="blur border-radius-lg my-3 py-2 start-0 end-0 mx-4 shadow"
          :darkMode="true"
          isBtn="bg-gradient-success"
        />
      </div> -->
    </div>
  </div>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row">
            <!-- قسم النموذج -->
            <div
              class="col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0 mx-auto"
              :class="currentLanguage === 'ar' ? 'order-2' : ''"
            >
              <div class="card card-plain">
                <div
                  class="pb-0 card-header"
                  :class="currentLanguage === 'ar' ? 'text-end' : 'text-start'"
                >
                  <h4 class="font-weight-bolder">{{ t("updatePassword") }}</h4>
                  <p class="mb-0">{{ t("enterPassword") }}</p>
                </div>
                <div class="card-body">
                  <form role="form" @submit.prevent="updatePassword">
                    <div class="mb-3 position-relative">
                  <div class="position-relative">
                    <argon-input v-model="password" id="password" :type="showPassword ? 'text' : 'password'"
                      :placeholder="t('password')" name="password" size="lg" required />
                    <span @click="showPassword = !showPassword"
                      class="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer">
                      <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                    </span>
                  </div>
                  <p v-if="passwordValid" class="text-success mt-2">{{ t("passwordValid") }}</p>
                  <p v-if="!passwordValid" class="text-danger mt-2">{{ t("passwordRequirements") }}</p>
                </div>
                <div class="mb-3 position-relative">
                  <div class="position-relative">
                    <argon-input v-model="confirmPassword" id="password" :type="showPassword ? 'text' : 'password'"
                      :placeholder="t('confirmationPassword')" name="password" size="lg" />
                    <span @click="showPassword = !showPassword"
                      class="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer">
                      <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                    </span>
                  </div>
                  <p v-if="passwordsMatch && confirmPassword" class="text-success mt-2"> {{ t("passwordsMatch") }}</p>
                  <p v-if="!passwordsMatch && confirmPassword" class="text-danger mt-2"> {{ t("passwordsDoNotMatch") }}</p>
                </div>
                    <argon-alert v-if="showAlert" color="danger">
                      {{ errorMessage }}
                    </argon-alert>
                    <argon-alert v-if="showSuccess" color="success">
                      {{ successMessage }}
                    </argon-alert>

                    <div class="text-center">
                      <argon-button
                        class="mt-4"
                        variant="gradient"
                        color="success"
                        fullWidth
                        size="lg"
                        :disabled="!passwordValid"
                      >{{ t("send") }}</argon-button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <!-- قسم الصورة والنص -->
          <div
            class="col-6 d-none d-lg-flex h-100 justify-content-center flex-column text-center my-auto top-0 position-absolute"
            :class="currentLanguage === 'ar' ? 'start-0 ps-0' : 'end-0 pe-0'"
          >
            <div
              class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden"
              style="
                background-image: url(&quot;https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signin-ill.jpg&quot;);
                background-size: cover;
              "
            >
              <span class="mask bg-gradient-success opacity-6"></span>
              <h4 class="mt-5 text-white font-weight-bolder position-relative">
                {{ t("attentionIsNewCurrency") }}
              </h4>
              <p class="text-white position-relative">
                {{ t("effortlessWriting") }}
              </p>
            </div>
          </div>
          <!-- نهاية قسم الصورة والنص -->
        </div>
      </div>
    </section>
  </main>
</template>
