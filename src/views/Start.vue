<script setup>
import { ref, computed, onBeforeMount, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

// import AppFooter from "@/examples/PageLayout/Footer.vue";
import ArgonInput from "@/components/ArgonInput.vue";
// import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
// import languageSwitcher from "@/views/components/LanguageSwitcher.vue";

// جلب الـ store والـ router
const store = useStore();
const router = useRouter();

// متغيرات الحالة
const email = ref("");
const errorMessage = ref("");
const showAlert = ref(false);
const body = document.getElementsByTagName("body")[0];

// الترجمة
const translations = {
  en: {
    myTask: "1Task",
    newOrganization: "New Organization",
    enterDetails: "Enter your new company workspace details",
    email: "Enter Your Email To Start with 1Task",
    agreeTerms: "I agree to the Terms and Conditions",
    getStarted: "Get Started",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In",
    attentionIsNewCurrency: '"Attention is the new currency"',
    effortlessWriting:
      "The more effortless the writing looks, the more effort the writer actually put into the process.",
    errorMessage: errorMessage.value,
    manageYourTasks: "Manage Your",
    fastAndEasyAndSmart: "Fast,Easy and Smart",
  },
  ar: {
    myTask: "مهمتي",
    newOrganization: "منظمة جديدة",
    enterDetails: "أدخل تفاصيل مساحة عمل شركتك الجديدة",
    email: "ادخل بريدك الإلكتروني لبدء مع 1Task",
    agreeTerms: "أوافق على الشروط والأحكام",
    getStarted: "البدء",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    signIn: "تسجيل الدخول",
    attentionIsNewCurrency: '"الانتباه هو العملة الجديدة"',
    effortlessWriting:
      "كلما بدت الكتابة أكثر سهولة، كلما بذل الكاتب مجهودًا أكبر في العملية.",
    errorMessage: errorMessage.value,
    manageYourTasks: "أدر",
    fastAndEasyAndSmart: "بسرعة وسهولة وذكاء",
  },
};

const currentLanguage = computed(() => store.getters.currentLanguage);

const t = (key) => {
  return translations[currentLanguage.value][key];
};

// دالة لإرسال البيانات
const submitForm = async () => {
  try {
    const emailExists = await store.dispatch("checkEmailExists", email.value);
    if (emailExists) {
      if (store.getters.currentLanguage === "ar") {
        errorMessage.value =
          "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد آخر.";
      } else {
        errorMessage.value =
          "This email is already registered. Please use another email.";
      }
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 3000);
    } else {
      store.commit("SET_TEMP_EMAIL", email.value);
      router.push("/signup");
      showAlert.value = false;
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    errorMessage.value = "حدث خطأ أثناء التسجيل. حاول مرة أخرى لاحقًا.";
    showAlert.value = true;
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
  }
};

// التحكم في نمط الصفحة عند الدخول والخروج
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
</script>

<template>
  <!-- Navbar ثابت بأصناف Bootstrap 5 -->
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow ">
    <div class="container d-flex justify-content-between">
      <!-- شعار الموقع (يمكن استبداله بالنص أو أي عنصر آخر) -->
      <a class="navbar-brand fw-bold" href="/start">
        <img
          class="navbar-brand-img w-20 mx-auto"
          src="https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1)%20(1).png?updatedAt=1730567921316"
          alt=""
        />
      </a>

      <!-- زر القوائم عند الشاشات الصغيرة -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- عناصر القائمة -->
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <!-- مثال على عناصر القائمة -->
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#"> Home </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Pricing</a>
          </li>
          <!-- مثال على زر تسجيل الدخول -->
          <li class="nav-item"></li>
          <!-- <li class="nav-item">
            <language-switcher />
          </li> -->
        </ul>
      </div>
      <argon-button class="btn my-2 my-sm-0" href="/signin">
        {{ t("signIn") }}
      </argon-button>
    </div>
  </nav>

  <!-- Hero Section -->
  <main class="main-content">
    <section class="hero-section d-flex align-items-center">
      <div class="container mt-5 pt-5">
        <div class="row">
          <!-- قسم النموذج -->
          <div class="col-xl-5 col-lg-6 col-md-8 d-flex flex-column">
            <div class="card card-plain">
              <div class="border-0 p-4 rounded-3">
                <div class="text-start pb-0 z-index-1">
                  <!-- يمكنك وضع شعار أو صورة في الأعلى -->
                  <h1 class="fw-bold mb-2">{{ t("manageYourTasks") }}</h1>
                  <img
                    style="width: 50%"
                    src="https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1)%20(1).png?updatedAt=1737223784516"
                    alt="task"
                    class="img-fluid"
                  />
                  <h3 class="mb-4">{{ t("fastAndEasyAndSmart") }}</h3>

                  <!-- <p class="mb-3">{{ t("enterDetails") }}</p> -->
                </div>
                <div class="card-body z-index-1">
                  <form role="form" @submit.prevent="submitForm">
                    <!-- حقل البريد الإلكتروني -->
                    <argon-input
                      id="email"
                      type="email"
                      v-model="email"
                      :placeholder="t('email')"
                      :aria-label="t('email')"
                    />
                    <!-- تنبيه الخطأ -->

                    <!-- الموافقة على الشروط -->
                    <!-- <argon-checkbox checked class="mt-3">
                    <label class="form-check-label" for="flexCheckDefault">
                      {{ t("agreeTerms") }}
                    </label>
                  </argon-checkbox> -->
                    <!-- زر البدء -->
                    <div class="text-center">
                      <argon-button
                        class="mt-4"
                        color="success"
                        
                        size="lg"
                        >{{ t("getStarted") }} <i class="ml-2 fas fa-arrow-right"></i
                      ></argon-button>
                    </div>
                  </form>
                  <argon-alert
                    id="alert"
                    v-if="showAlert"
                    color="danger"
                    dismissible
                    class="mt-3"
                  >
                    {{ errorMessage }}
                  </argon-alert>
                </div>
                <!-- <div class="card-footer text-center px-lg-2 pt-0 px-1 z-index-1">
                <p class="mb-0 text-sm mx-auto">
                  {{ t("alreadyHaveAccount") }}
                  <a href="/signin" class="text-success font-weight-bold ms-1">
                    {{ t("signIn") }}
                  </a>
                </p>
              </div> -->
              </div>
            </div>
          </div>

          <!-- قسم الصورة أو المحتوى الإعلاني -->
          <div
            class="col-xl-7 col-lg-6 d-flex align-items-center justify-content-end mt-1 mt-lg-0"
          >
            <div class="text-center position-relative">
              <img
                src="https://ik.imagekit.io/ts7pphpbz3/Blog_Task-Management_Hero-Banner-removebg-preview.png?updatedAt=1737041133541"
                class="img-fluid rounded position-absolute top-10 start-50 translate-middle-x"
                alt="Hero Image"
                style=""
              />
              <svg
                width="550"
                height="550"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#A7C858"
                  d="M43.5,-77.4C55.6,-68.3,64.1,-55.1,67.5,-41.5C70.9,-27.9,69.3,-14,67.1,-1.3C64.8,11.4,62,22.8,58.9,36.9C55.7,50.9,52.2,67.7,42.4,72.8C32.5,77.9,16.3,71.2,1.4,68.9C-13.5,66.5,-27,68.3,-38,63.9C-49.1,59.5,-57.6,48.8,-65.9,37.1C-74.3,25.4,-82.5,12.7,-83.2,-0.4C-83.8,-13.5,-77,-27,-68.9,-39.3C-60.9,-51.5,-51.7,-62.6,-40.1,-72C-28.4,-81.4,-14.2,-89.1,0.7,-90.4C15.7,-91.7,31.4,-86.6,43.5,-77.4Z"
                  transform="translate(100 100)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- <app-footer /> -->
</template>

<style scoped>
/* تضبيط الحاوية لتحت navbar الثابت */
main.main-content {
  margin-top: 70px; /* تعديل حسب ارتفاع النافبار */
  /* background-image: url("https://ik.imagekit.io/ts7pphpbz3/layered-waves-haikei%20(1).png");
  background-size: cover;
  background-position: center; */
}

/* Hero Section تخصيص */
.hero-section {
  min-height: calc(100vh - 70px); /* ناقص ارتفاع النافبار */
  background-color: #f4f7fb; /* لون خلفية خفيف لإبراز الهيرو */
  /* background-image: url("https://ik.imagekit.io/ts7pphpbz3/layered-waves-haikei%20(1).png");
  background-size: cover;
  background-position: center; */
  padding: 40px 0;
}

h1 {
  font-family: "Poppins", sans-serif;
  font-weight: bold;
  color: #040029;
}

h3 {
  font-family: "Pacifico";
  font-weight: bold;
  color: #040029;
}

/* لمحة بسيطة لبطاقة النموذج */
.card.card-plain {
  /* background-color: #a7c858;
  background-image: linear-gradient(
    to bottom,
    #a7c858,
    #f4f7fb
  );  */
  /* background-color: #fff; */
  box-shadow:
    0 4px 6px rgba(50, 50, 93, 0.11),
    0 1px 3px rgba(0, 0, 0, 0.08);
  border-radius: 0.375rem;
  padding: 1.5rem;
  margin: 1rem 0;
  overflow: hidden;
}

/* تضبيط الصورة الرئيسية في الهيرو */
.hero-section img {
  max-width: 100%;
  height: auto;
  /* background-image: url("https://ik.imagekit.io/ts7pphpbz3/layered-waves-haikei%20(1).png");
  background-size: cover;
  background-position: center; */
}

.hero-section-div {
  background-image: url("https://ik.imagekit.io/ts7pphpbz3/layered-waves-haikei%20(1).png");
  background-size: cover;
  background-position: center;
}

/* الطبقات */
.z-index-1 {
  z-index: 1;
}

/* التوافق مع RTL */
.rtl .hero-section {
  direction: rtl;
}

.card .card-body {
  padding: 1.5rem 1.5rem 1.5rem 0;
}
</style>
