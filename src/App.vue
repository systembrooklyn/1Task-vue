<script setup>
import { computed, onBeforeMount, onMounted, watch, ref } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import Sidenav from "./examples/Sidenav";
import Configurator from "@/examples/Configurator.vue";
import Navbar from "@/examples/Navbars/Navbar.vue";
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
  // تحميل اللغة بغض النظر عن حالة تسجيل الدخول
  const language = localStorage.getItem("language");
  if (language) {
    store.commit("setLanguage", language);
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
</style>
