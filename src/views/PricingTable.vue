<script setup>
import { ref, computed, onBeforeMount, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
// import { useRouter } from "vue-router";

import AppFooter from "@/examples/PageLayout/Footer.vue";
// import ArgonInput from "@/components/ArgonInput.vue";
// import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
// import ArgonButton from "@/components/ArgonButton.vue";
// import ArgonAlert from "@/components/ArgonAlert.vue";
import PricingCard from "@/examples/PricingCard.vue";
// import languageSwitcher from "@/views/components/LanguageSwitcher.vue";

// جلب الـ store والـ router
const store = useStore();
// const router = useRouter();

const selectedPlan = ref(null);

function handleSelectPlan(plan) {
  selectedPlan.value = plan;
}

const fetchPlans = async () => {
  try {
    const response = await store.dispatch("getPlans");
    plans.value = response.data;
    console.log("plans:", plans.value);
  } catch (error) {
    console.error("Error fetching plans:", error);
  }
};

const plans = ref([]);

onBeforeMount(() => {
  fetchPlans();
});

// // const plans = [
//   // Your plan data from the API response
//   {
//     id: 1,
//     name: "Basic",
//     price: "10",
//     currency: "USD",
//     description: "Basic plan description",
//     features: [
//       { name: "Feature 1", value: "Value 1" },
//       { name: "Feature 2", value: "Value 2" },
//       { name: "Feature 3", value: "Value 3" },
//     ],
//   },
//   {
//     id: 2,
//     name: "Standard",
//     price: "20",
//     currency: "USD",
//     description: "Standard plan description",
//     features: [
//       { name: "Feature 1", value: "Value 1" },
//       { name: "Feature 2", value: "Value 2" },
//       { name: "Feature 3", value: "Value 3" },
//     ],
//   },
// ];

// متغيرات الحالة
// const email = ref("");
const errorMessage = ref("");
// const showAlert = ref(false);
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
    pricing: "Pricing",
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
    pricing: "الأسعار",
  },
};

const currentLanguage = computed(() => store.getters.currentLanguage);

const t = (key) => {
  return translations[currentLanguage.value][key];
};

// دالة لإرسال البيانات
// const submitForm = async () => {
//   try {
//     const emailExists = await store.dispatch("checkEmailExists", email.value);
//     if (emailExists) {
//       if (store.getters.currentLanguage === "ar") {
//         errorMessage.value =
//           "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد آخر.";
//       } else {
//         errorMessage.value =
//           "This email is already registered. Please use another email.";
//       }
//       showAlert.value = true;
//       setTimeout(() => {
//         showAlert.value = false;
//       }, 3000);
//     } else {
//       store.commit("SET_TEMP_EMAIL", email.value);
//       router.push("/signup");
//       showAlert.value = false;
//     }
//   } catch (error) {
//     console.error("Error submitting form:", error);
//     errorMessage.value = "حدث خطأ أثناء التسجيل. حاول مرة أخرى لاحقًا.";
//     showAlert.value = true;
//     setTimeout(() => {
//       showAlert.value = false;
//     }, 3000);
//   }
// };

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
  <!-- Enhanced Navbar -->
  <nav
    class="navbar navbar-expand-lg navbar-light bg-white fixed-top border-bottom"
  >
    <div class="container">
      <a class="navbar-brand" href="/start">
        <img
          src="https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1)%20(1).png?ik-obj-version=9sTuepUtU27Iw3.FfIbdKOdc7MYL4WM0&updatedAt=1737223784202"
          alt="Logo"
          class="navbar-logo"
        />
      </a>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <i class="fas fa-bars"></i>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <!-- <li class="nav-item">
            <a class="nav-link" href="#">Home</a>
          </li> -->
          <!-- <li class="nav-item">
            <a class="nav-link" href="#">Pricing</a>
          </li> -->
          <li class="nav-item ms-3">
            <a class="nav-link active" href="/pricing">
              {{ t("pricing") }}
            </a>
          </li>
          <li class="nav-item ms-3">
              <a class="signin btn" href="/signin">
                  {{ t("signIn") }}
                </a>
            </li>
            <li class="nav-item ms-3">
              <a class="btn" href="/start">
                {{ t("getStarted") }}
              </a>
            </li>
          
        </ul>
      </div>
    </div>
  </nav>

  <!-- Professional Hero Section -->
  <main class="main-content">
    <section class="hero-section">
      <!-- <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-6 order-lg-1">
            <div class="content-card p-5">
              <h1 class="display-4 fw-bold mb-4">{{ t("manageYourTasks") }}</h1>
              <img
                src="https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1)%20(1).png?updatedAt=1737223784516"
                alt="Task Management"
                class="brand-img mb-4"
              />
              <h3 class="display-4 mb-4">{{ t("fastAndEasyAndSmart") }}</h3>

              <form @submit.prevent="submitForm">
                <argon-input
                  id="email"
                  type="email"
                  v-model="email"
                  :placeholder="t('email')"
                  class="mb-4"
                />
                <argon-button
                  color="success"
                  size="lg"
                  class="w-100 py-3 fw-bold"
                >
                  {{ t("getStarted") }}
                  <i class="fas fa-arrow-right ms-2"></i>
                </argon-button>
              </form>

              <argon-alert
                v-if="showAlert"
                color="danger"
                dismissible
                class="mt-4"
              >
                {{ errorMessage }}
              </argon-alert>
            </div>
          </div>

          <div class="col-lg-6 order-lg-2">
            <div class="hero-image-wrapper">
              <img
                src="https://ik.imagekit.io/ts7pphpbz3/WhatsApp%20Image%202025-02-19%20at%2011.46.25%20PM.jpeg"
                alt="Task Management Interface"
                class="hero-img rounded-3"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div> -->
      <div class="row mx-5 g-4">
        <PricingCard :plans="plans" @select="handleSelectPlan"/>
      </div>  
      <a 
              href="/start"
              class="btn btn-outline-dark mt-4 d-block text-center w-25 mx-auto"
            >
              Choose Plan within registration
            </a>
    </section>

  </main>

  <!-- Footer -->
  <AppFooter />
</template>

<style scoped>
/* Professional Navbar Styling */
.navbar {
  padding: 1rem 0;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.navbar-logo {
  height: 40px;
}

/* Hero Section Styling */
.hero-section {
  padding: 120px 0 80px;
  background-image: url("https://ik.imagekit.io/ts7pphpbz3/background-gd-gradient-grey.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* .content-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
} */

.brand-img {
  width: 60%;
  max-width: 300px;
}

.hero-img {
  width: 100%;
  height: 500px;
  object-fit: cover;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
}

.hero-image-wrapper {
  position: relative;
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  transform: rotate(2deg);
}

.hero-image-wrapper::before {
  content: "";
  position: absolute;
  inset: -10px;
  background: linear-gradient(45deg, #a7c858, #8aab3a);
  border-radius: 1rem;
  z-index: -1;
  transform: rotate(-2deg);
}

/* Enhanced Featured Words */
.featured-words {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: start;
}

.featured-word {
  font-size: 1.75rem;
  font-weight: 700;
  position: relative;
  padding: 0.5rem 1rem;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  transition: transform 0.3s ease;
}

.featured-word::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  height: 3px;
  width: 0;
  transition: width 0.3s ease;
}

.featured-word:hover {
  transform: translateY(-3px);
}

.featured-word:hover::after {
  width: 100%;
}

.fast {
  background-image: linear-gradient(45deg, #ff6b6b, #ff8e53);
}

.fast::after {
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
}

.easy {
  background-image: linear-gradient(45deg, #4ecdc4, #45b7af);
}

.easy::after {
  background: linear-gradient(45deg, #4ecdc4, #45b7af);
}

.smart {
  background-image: linear-gradient(45deg, #a7c858, #8aab3a);
}

.smart::after {
  background: linear-gradient(45deg, #a7c858, #8aab3a);
}

.hero-img {
  width: 100%;
  height: 500px;
  object-fit: cover;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
}

.hero-image-wrapper {
  position: relative;
  padding: 1rem;
  border-radius: 1rem;
  transform: rotate(2deg);
  transition: transform 0.3s ease;
}

.hero-image-wrapper:hover {
  transform: rotate(3deg) scale(1.02);
}

.hero-image-wrapper::before {
  content: "";
  position: absolute;
  inset: -10px;
  background: linear-gradient(45deg, #a7c858 30%, #8aab3a 70%);
  border-radius: 1rem;
  z-index: -1;
  transform: rotate(-2deg);
  filter: blur(10px);
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.hero-image-wrapper:hover::before {
  opacity: 0.5;
}

/* RTL Adjustments */
.rtl .featured-words {
  justify-content: flex-end;
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

@media (max-width: 768px) {
  .featured-word {
    font-size: 1.5rem;
    padding: 0.5rem;
  }

  .hero-img {
    height: 400px;
  }
}

/* Typography */
h1 {
  color: #2d3436;
  letter-spacing: -0.05em;
}

/* .lead {
  font-size: 1.25rem;
  font-weight: 400;
} */

/* Responsive Adjustments */
@media (max-width: 992px) {
  .hero-section {
    padding: 100px 0 60px;
  }

  .content-card {
    padding: 2rem !important;
  }

  .hero-img {
    height: 400px;
  }

  .order-lg-1 {
    order: 2;
  }

  .order-lg-2 {
    order: 1;
    margin-bottom: 2rem;
  }

  .navbar-toggler {
    display: block !important;
  }
}

.signin {
  color: #fff;
  background-color: #a7c858;
  border-color: #a7c858;
}
</style>
