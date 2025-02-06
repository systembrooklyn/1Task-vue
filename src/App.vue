<script setup>
import { computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
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

console.log("currentCompanyName:", currentCompanyName.value);

// دالة لتحديث العنوان عندما يتغير اسم الشركة أو حالة تسجيل الدخول
const updateTitle = () => {
  const companyName = currentCompanyName.value;
  document.title = companyName || "1Task"; // تحديث العنوان حسب اسم الشركة أو 1Task إذا لم توجد شركة
};

// عند تحميل الصفحة أو عند تحديث اسم الشركة
onMounted(() => {
  updateTitle();
});

// مراقبة التغييرات على حالة المستخدم (عند تسجيل الدخول أو الخروج)
watch(
  () => store.getters.companyName,
  () => {
    updateTitle(); // تحديث العنوان عند تغيير حالة المستخدم
  }
);

// مراقبة التغيرات في `token` داخل `localStorage`، إذا كان غير موجود يعيد العنوان إلى 1Task
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

  <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg">
    <!-- nav -->

    <navbar :class="[navClasses]" v-if="showNavbar" />

    <router-view />

    <!-- <app-footer v-show="showFooter" /> -->

    <configurator :toggle="toggleConfigurator" :class="[showConfig ? 'show' : '', hideConfigButton ? 'd-none' : '']" />
  </main>
</template>
