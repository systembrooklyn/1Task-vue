<script setup>
import { ref, onBeforeMount, onBeforeUnmount, watch } from "vue";
import { useStore } from "vuex";
import AuthorsTable from "./components/AuthorsTable.vue";
import LanguageSwitcher from "@/views/components/LanguageSwitcher.vue";

const store = useStore();
const showAlert = ref(false); // التحكم في عرض التنبيه
const errorMessage = ref(""); // رسالة الخطأ
const successMessage = ref(""); // رسالة النجاح
const showSuccess = ref(false); // التحكم في عرض النجاح
const employees = ref([]); // لتخزين بيانات الموظفين
const componentKey = ref(0); // متغير لتغيير المفتاح وإعادة تحميل المكون
const body = document.getElementsByTagName("body")[0];

// دالة جلب بيانات الموظفين
const fetchEmployees = async () => {
  try {
    // جلب بيانات الموظفين من الـ Vuex store
    await store.dispatch("getCompanyUsers");
    
    employees.value = store.getters.dataFromApi; // تخزين بيانات الموظفين في المتغير employees
    console.log("Employees Data:", employees.value.users);
    componentKey.value += 1; // تحديث المفتاح لإعادة تحميل المكون

    // عرض رسالة نجاح بناءً على اللغة
    if (store.getters.currentLanguage === "ar") {
      successMessage.value = "تم جلب بيانات الموظفين بنجاح.";
    } else {
      successMessage.value = "Employees data fetched successfully.";
    }

    showSuccess.value = true; // إظهار التنبيه بالنجاح
  } catch (error) {
    console.error("Error fetching employees data:", error);

    // عرض رسالة خطأ بناءً على اللغة
    if (store.getters.currentLanguage === "ar") {
      errorMessage.value =
        "حدث خطأ أثناء جلب بيانات الموظفين. حاول مرة أخرى لاحقًا.";
    } else {
      errorMessage.value =
        "An error occurred while fetching employees data. Please try again later.";
    }

    showAlert.value = true; // إظهار التنبيه بالخطأ

    // إخفاء التنبيه بعد 3 ثوانٍ
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
  }
};

// استدعاء جلب البيانات عند تحميل المكون
onBeforeMount(async () => {
  body.classList.remove("bg-gray-100");

  // تحديث اتجاه النص واللغة عند تحميل المكون
  const isRTL = store.getters.currentLanguage === "ar";
  document
    .querySelector("html")
    .setAttribute("lang", store.getters.currentLanguage);
  document.querySelector("html").setAttribute("dir", isRTL ? "rtl" : "ltr");
  document.querySelector("#app").classList.toggle("rtl", isRTL);

  // جلب بيانات الموظفين عند تحميل الصفحة
  await fetchEmployees(); // استدعاء دالة جلب البيانات هنا
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});

// مراقبة التحديثات في الموظفين وإعادة تحميل الكومبوننت
watch(
  () => store.getters.dataFromApi,
  (newData) => {
    console.log("newData:", [...newData]);
    employees.value = [...newData];
    // componentKey.value += 1; // إعادة تحميل المكون عند حدوث أي تحديث في البيانات
  }
);
</script>

<template>
  <LanguageSwitcher />
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <!-- تمرير بيانات الموظفين إلى authors-table -->
        <authors-table :key="componentKey" :employees="employees" />
      </div>
    </div>
  </div>
</template>
