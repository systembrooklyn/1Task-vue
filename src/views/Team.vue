<script setup>
import { ref, onBeforeMount, onBeforeUnmount, watch, computed } from "vue";
import { useStore } from "vuex";
import AuthorsTable from "./components/AuthorsTable.vue";
// import LanguageSwitcher from "@/views/components/LanguageSwitcher.vue";
// import Swal from "sweetalert2";

const store = useStore();
// const showAlert = ref(false); // التحكم في عرض التنبيه
// const errorMessage = ref(""); // رسالة الخطأ
// const successMessage = ref(""); // رسالة النجاح
// const showSuccess = ref(false); // التحكم في عرض النجاح
const employees = ref([]); // لتخزين بيانات الموظفين
const componentKey = ref(0); // متغير لتغيير المفتاح وإعادة تحميل المكون
const body = document.getElementsByTagName("body")[0];
const isLoading = ref(false);    // <-- نضيف هذا لتتبع حالة التحميل


// دالة جلب بيانات الموظفين
const fetchEmployees = async () => {
  try {

    isLoading.value = true; // بدأ التحميل

    // جلب بيانات الموظفين من الـ Vuex store
    const response = await store.dispatch("getCompanyUsers");

    if (response.status === 200) {
    
    employees.value = store.getters.dataFromApi; // تخزين بيانات الموظفين في المتغير employees
    console.log("Employees Data:", employees.value.users);
    isLoading.value = false;

    componentKey.value += 1; // تحديث المفتاح لإعادة تحميل المكون
    } 
    // else {
    //   errorMessage.value = t("generalError");
    //   showAlert.value = true;
    //   setTimeout(() => {
    //     showAlert.value = false;
    //   }, 3000);
    // }


  } catch (error) {
    console.error("Error fetching employees data:", error);

    isLoading.value = false;
  }
};

const translations = {
  en: {
    noEmployees: "No employees found",
    inviteEmployees: "Invite employees to your company",
    employeesTable: "Employees Table",
    here: "here",
  },
  ar: {
    noEmployees: "لا يوجد موظفين",
    inviteEmployees: " ادعو الموظفين لشركتك",
    employeesTable: "جدول الموظفين",
    here: "هنا",
  },
};

const currentLanguage = computed(() => store.getters.currentLanguage);
const t = (key) => translations[currentLanguage.value][key];


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
  <!-- <LanguageSwitcher /> -->
  <div class="py-1 container-fluid">
    <div class="row">
      <div class="col-12">

        <div v-if="isLoading" class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="employees.length === 0" class="d-flex justify-content-center py-5 flex-column align-items-center">
          <h5>{{ t("noEmployees") }}</h5>
          <p>
            {{ t("inviteEmployees") }}
            <a href="/addUser" class="text-primary">{{ t("here") }}</a>
          </p>
        </div>

        <authors-table 
          v-else
          :key="componentKey"
          :employees="employees"
        />
      </div>
    </div>
  </div>
</template>

