<script setup>
import { computed, onBeforeMount, onMounted, watch, ref } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import Sidenav from "./examples/Sidenav";
import Configurator from "@/examples/Configurator.vue";
import Navbar from "@/examples/Navbars/Navbar.vue";
import { activateDarkMode, deactivateDarkMode } from "@/assets/js/dark-mode";
// import AppFooter from "@/examples/Footer.vue";

const store = useStore();
const isNavFixed = computed(() => store.state.isNavFixed);
const darkMode = computed(() => store.state.darkMode);
const isAbsolute = computed(() => store.state.isAbsolute);
const showSidenav = computed(() => store.state.showSidenav);
const layout = computed(() => store.state.layout);
const showNavbar = computed(() => store.state.showNavbar);
// const showFooter = computed(() => store.state.showFooter);
const showConfig = computed(() => store.state.showConfig);
const hideConfigButton = computed(() => store.state.hideConfigButton);
const toggleConfigurator = () => store.commit("toggleConfigurator");

const navClasses = computed(() => {
  return {
    "position-sticky bg-white left-auto top-2 z-index-sticky":
      isNavFixed.value && !darkMode.value,
    "position-sticky bg-default left-auto top-2 z-index-sticky":
      isNavFixed.value && darkMode.value,
    "position-absolute px-4 mx-0 w-100 z-index-2": isAbsolute.value,
    "px-0 mx-4": !isAbsolute.value,
  };
});

// الحصول على اسم الشركة من Vuex
// const currentCompanyName = computed(() => localStorage.getItem("companyName") || "1Task");
const currentCompanyName = computed(() => store.getters.companyName);

// Sidebar state management for responsive main content
const sidebarCollapsed = ref(false);

// Watch for sidebar state changes
onMounted(() => {
  const updateSidebarState = () => {
    sidebarCollapsed.value = localStorage.getItem('sidebarCollapsed') === 'true';
  };

  updateSidebarState();

  // Listen for storage changes
  window.addEventListener('storage', updateSidebarState);

  // Listen for custom sidebar toggle events
  window.addEventListener('sidebarToggle', updateSidebarState);

  return () => {
    window.removeEventListener('storage', updateSidebarState);
    window.removeEventListener('sidebarToggle', updateSidebarState);
  };
});

// Computed class for main content responsive behavior
const mainContentClass = computed(() => {
  if (!showSidenav.value) return '';
  return sidebarCollapsed.value ? 'main-content-collapsed' : 'main-content-expanded';
});

console.log("currentCompanyName:", currentCompanyName.value);

const route = useRoute();
onBeforeMount(async () => {
  const token = localStorage.getItem("token");
  const isPublic = route.meta.public === true;
  try {
    if (token && !isPublic) {
      await store.dispatch("fetchPlanInfo");
      await store.dispatch("fetchProfileData");
    }
  } catch (err) {
    console.warn("Boot fetch failed:", err);
  }
  // تحميل اللغة وتطبيق RTL بغض النظر عن حالة تسجيل الدخول
  const language = localStorage.getItem("language") || "en";
  if (language) {
    store.commit("SET_LANGUAGE", language);
    // تطبيق RTL مباشرة
    const isRTL = language === "ar";
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    const appElement = document.querySelector("#app");
    if (appElement) {
      appElement.classList.remove("rtl", "ltr");
      appElement.classList.add(isRTL ? "rtl" : "ltr");
      document.body.classList.remove("rtl", "ltr");
      document.body.classList.add(isRTL ? "rtl" : "ltr");
    }
  }

  // تحميل حالة dark mode من localStorage
  const savedDarkMode = localStorage.getItem("darkMode");
  if (savedDarkMode === "true") {
    store.state.darkMode = true;
    activateDarkMode();
  } else {
    store.state.darkMode = false;
    deactivateDarkMode();
  }
});

// دالة لتحديث العنوان عندما يتغير اسم الشركة أو حالة تسجيل الدخول
const updateTitle = () => {
  const companyName = currentCompanyName.value;
  document.title = companyName || "1Task"; // تحديث العنوان حسب اسم الشركة أو 1Task إذا لم توجد شركة
};

onMounted(() => {
  updateTitle();
});

watch(
  () => store.getters.companyName,
  () => {
    updateTitle();
  }
);

watch(
  () => localStorage.getItem("token"), // مراقبة الـ token في localStorage
  (newToken) => {
    if (!newToken) {
      document.title = "1Task"; // عند عدم وجود الـ token، إعادة العنوان إلى 1Task
    }
  }
);
</script>

<template>
  <div v-show="layout === 'landing'" class="landing-bg h-100 bg-gradient-primary position-fixed w-100"></div>

  <sidenav v-if="showSidenav" />

  <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg" :class="mainContentClass">
    <!-- nav -->

    <navbar :class="[navClasses]" v-if="showNavbar" />

    <router-view />

    <!-- <app-footer v-show="showFooter" /> -->

    <configurator :toggle="toggleConfigurator" :class="[showConfig ? 'show' : '', hideConfigButton ? 'd-none' : '']" />
  </main>



</template>

<style>
/* ========================================
   Z-Index Global Management - حل نهائي وقوي
   ======================================== */
/* منع قص الـ dropdowns في المودال فقط */
.quick-add-dropdown {
  overflow: visible !important;
}

/* استهداف العناصر المحددة فقط بدلاً من كل شيء */
.quick-add-dropdown .gmail-toolbar,
.quick-add-dropdown .gmail-toolbar-icon-group,
.quick-add-dropdown .toolbar-dropdown,
.quick-add-dropdown .toolbar-dropdown-content,
.quick-add-dropdown .gmail-quick-content,
.quick-add-dropdown .gmail-quick-scroll {
  overflow: visible !important;
}

/* خاصة للمكونات داخل المودال */
.gmail-people-section,
.gmail-toolbar {
  overflow: visible !important;
}

/* ====== جعل جميع الـ dropdowns مرئية (Global) ====== */
body,
.main-content,
.gmail-toolbar,
.gmail-toolbar-icon-group {
  overflow: visible !important;
}

/* Main content responsive behavior */
.main-content-expanded {
  margin-left: 260px !important;
  transition: margin-left 0.3s ease;
}

.main-content-collapsed {
  margin-left: 80px !important;
  transition: margin-left 0.3s ease;
}

/* Ensure main content takes full width when no sidebar */
.main-content {
  transition: margin-left 0.3s ease;
}

@media (max-width: 1199px) {

  .main-content-expanded,
  .main-content-collapsed {
    margin-left: 0 !important;
  }
}

/* ===== Mobile & Tablet: Reduce Side Padding for Better Space Utilization ===== */
@media (max-width: 991px) {

  /* Reduce container padding on mobile and tablet */
  .container-fluid {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }

  /* Reduce card margins on mobile and tablet */
  .card {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
  }

  /* Reduce general page padding */
  .mx-4 {
    margin-left: 0.5rem !important;
    margin-right: 0.5rem !important;
  }

  .px-3 {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}

/* Mobile specific (max-width: 767px) */
@media (max-width: 767px) {
  .container-fluid {
    padding-left: 0.25rem !important;
    padding-right: 0.25rem !important;
  }

  .card {
    margin-left: 0.125rem;
    margin-right: 0.125rem;
  }

  .mx-4 {
    margin-left: 0.25rem !important;
    margin-right: 0.25rem !important;
  }

  .px-3 {
    padding-left: 0.25rem !important;
    padding-right: 0.25rem !important;
  }
}

/* Tablet specific (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .container-fluid {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }

  .card {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
  }

  .mx-4 {
    margin-left: 0.5rem !important;
    margin-right: 0.5rem !important;
  }

  .px-3 {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}

/* ========================================
   RTL Support - دعم اللغة العربية
   ======================================== */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="ltr"] {
  direction: ltr;
  text-align: left;
}

/* عكس margin و padding في RTL */
[dir="rtl"] .ms-1 {
  margin-right: 0.25rem !important;
  margin-left: 0 !important;
}

[dir="rtl"] .ms-2 {
  margin-right: 0.5rem !important;
  margin-left: 0 !important;
}

[dir="rtl"] .ms-3 {
  margin-right: 1rem !important;
  margin-left: 0 !important;
}

[dir="rtl"] .ms-4 {
  margin-right: 1.5rem !important;
  margin-left: 0 !important;
}

[dir="rtl"] .ms-5 {
  margin-right: 3rem !important;
  margin-left: 0 !important;
}

[dir="rtl"] .ms-auto {
  margin-right: auto !important;
  margin-left: 0 !important;
}

[dir="rtl"] .me-1 {
  margin-left: 0.25rem !important;
  margin-right: 0 !important;
}

[dir="rtl"] .me-2 {
  margin-left: 0.5rem !important;
  margin-right: 0 !important;
}

[dir="rtl"] .me-3 {
  margin-left: 1rem !important;
  margin-right: 0 !important;
}

[dir="rtl"] .me-4 {
  margin-left: 1.5rem !important;
  margin-right: 0 !important;
}

[dir="rtl"] .me-5 {
  margin-left: 3rem !important;
  margin-right: 0 !important;
}

[dir="rtl"] .me-auto {
  margin-left: auto !important;
  margin-right: 0 !important;
}

[dir="rtl"] .ps-1 {
  padding-right: 0.25rem !important;
  padding-left: 0 !important;
}

[dir="rtl"] .ps-2 {
  padding-right: 0.5rem !important;
  padding-left: 0 !important;
}

[dir="rtl"] .ps-3 {
  padding-right: 1rem !important;
  padding-left: 0 !important;
}

[dir="rtl"] .ps-4 {
  padding-right: 1.5rem !important;
  padding-left: 0 !important;
}

[dir="rtl"] .ps-5 {
  padding-right: 3rem !important;
  padding-left: 0 !important;
}

[dir="rtl"] .pe-1 {
  padding-left: 0.25rem !important;
  padding-right: 0 !important;
}

[dir="rtl"] .pe-2 {
  padding-left: 0.5rem !important;
  padding-right: 0 !important;
}

[dir="rtl"] .pe-3 {
  padding-left: 1rem !important;
  padding-right: 0 !important;
}

[dir="rtl"] .pe-4 {
  padding-left: 1.5rem !important;
  padding-right: 0 !important;
}

[dir="rtl"] .pe-5 {
  padding-left: 3rem !important;
  padding-right: 0 !important;
}

/* عكس text-align */
[dir="rtl"] .text-start {
  text-align: right !important;
}

[dir="rtl"] .text-end {
  text-align: left !important;
}

/* عكس float */
[dir="rtl"] .float-start {
  float: right !important;
}

[dir="rtl"] .float-end {
  float: left !important;
}

/* عكس position */
[dir="rtl"] .left-auto {
  left: auto !important;
  right: 0 !important;
}

[dir="rtl"] .right-auto {
  right: auto !important;
  left: 0 !important;
}

/* عكس main content margin */
[dir="rtl"] .main-content-expanded {
  margin-right: 260px !important;
  margin-left: 0 !important;
  transition: margin-right 0.3s ease;
}

[dir="rtl"] .main-content-collapsed {
  margin-right: 80px !important;
  margin-left: 0 !important;
  transition: margin-right 0.3s ease;
}

[dir="rtl"] .main-content {
  transition: margin-right 0.3s ease;
}

@media (max-width: 1199px) {

  [dir="rtl"] .main-content-expanded,
  [dir="rtl"] .main-content-collapsed {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
}

/* عكس border-radius في بعض الحالات */
[dir="rtl"] .border-radius-start {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-top-right-radius: 0.5rem !important;
  border-bottom-right-radius: 0.5rem !important;
}

[dir="rtl"] .border-radius-end {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  border-top-left-radius: 0.5rem !important;
  border-bottom-left-radius: 0.5rem !important;
}
</style>
