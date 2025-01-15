<script setup>
import { ref, computed, onBeforeMount, watch } from "vue";
import { useStore } from "vuex";
// import ArgonInput from "@/components/ArgonInput.vue";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
// import LanguageSwitcher from "@/views/components/LanguageSwitcher.vue";
import DepartmentsTable from "@/views/components/DepartmentsTable.vue";
import Swal from "sweetalert2";
const store = useStore();
const showAlert = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showSuccess = ref(false);
const departmentName = ref("");
const showPopup = ref(false);
const departments = ref([]);
const componentKey = ref(0);
const body = document.getElementsByTagName("body")[0];
const isLoading = ref(false);

import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
  hasPermission,
} from "@/utils/permissions.js";

const userData = computed(() => store.getters.user);


const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.id) || {}
);

console.log(permissions.value);

// عند تحميل الصفحة لأول مرة، حفظ الصلاحيات في localStorage
onBeforeMount(() => {
  if (!permissions.value || Object.keys(permissions.value).length === 0) {
    const extractedPermissions = extractPermissionsFromAPI(userData.value?.roles);
    permissions.value = extractedPermissions;
    savePermissionsToLocalStorage(permissions.value, userData.value?.id);
  }
});

// التحقق من صلاحية معينة
const canCreateDepartment = computed(() =>
  hasPermission(permissions.value, "create-department")
);

const isOwner = computed(() => store.getters.isOwner);

onBeforeMount(async () => {
  body.classList.remove("bg-gray-100");
  const isRTL = store.getters.currentLanguage === "ar";
  document
    .querySelector("html")
    .setAttribute("lang", store.getters.currentLanguage);
  document.querySelector("html").setAttribute("dir", isRTL ? "rtl" : "ltr");
  document.querySelector("#app").classList.toggle("rtl", isRTL);
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");

  await fetchDepartments();
});

const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

const currentUserId = computed(() => store.getters.userId);
console.log("currentUserId:", currentUserId.value);

const fetchDepartments = async () => {
  isLoading.value = true;
  try {
    const response = await store.dispatch("fetchDepartments");
    console.log("response:", response);
    if (response.status === 200) {
      departments.value = store.getters.departments;
      componentKey.value += 1;
      console.log("departments:", departments.value);
    }
    // departments.value = store.getters.departments.filter(
    //   (department) =>
    //     (department.companyID == currentCompanyId.value ||
    //       department.companyID == currentUserId.value) &&
    //     department.companyID != null
    // );
  } catch (error) {
    showAlert.value = true;
    errorMessage.value = t("generalError");
  } finally {
    isLoading.value = false;
  }
};
// const departmentsGetters = computed(() => store.getters.departments.filter(
//   department => department.companyID == store.getters.companyId
// ));
// console.log("departmentsGetters", departmentsGetters.value);

watch(
  () => store.getters.departments,
  (newData) => {
    departments.value = [...newData];
    componentKey.value += 1; // إعادة تحميل المكون عند حدوث أي تحديث في البيانات
  }
);

const currentLanguage = computed(() => store.getters.currentLanguage);

const t = (key) => {
  return translations[currentLanguage.value][key];
};

const openPopup = () => {
  showPopup.value = true;
};

const closePopup = () => {
  showPopup.value = false;
};

const addDepartment = async () => {


  if (departmentName.value) {
    isLoading.value = true;
    const department = {
      name: departmentName.value,
    };
    try {
      const response = await store.dispatch("addDepartment", department);
      if (response.status === 400) {
        isLoading.value = false;
        Swal.fire({
          icon: "error",
          title: t("departmentAddedAlreadyExists"),
          showConfirmButton: false,
          timer: 2500,
        });
        closePopup();
        return;
      }
      Swal.fire({
        icon: "success",
        title: t("departmentAdded"),
        showConfirmButton: false,
        timer: 1500,
      });
      closePopup();
      await fetchDepartments();
      componentKey.value += 1;
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("departmentAddedAlreadyExists"),
        showConfirmButton: false,
        timer: 2500,
      });
      closePopup();
    } finally {
      isLoading.value = false;
    }
    departmentName.value = "";
  } else {
    Swal.fire({
      title: t("departmentNameRequired"),
      icon: "warning",
    });
    isLoading.value = false;
  }
};

const translations = {
  en: {
    addMember: "Add Member",
    email: "Email",
    emailExistsError:
      "This email is already registered. Please use another email.",
    generalError: "An error occurred while submitting. Please try again later.",
    invalidCompanyIdOrUserId: "Invalid Company ID or User ID.",
    departmentDeleted: "Department deleted successfully.",
    departmentAdded: "Department added successfully.",
    deleteConfirmationTitle: "Delete Department",
    deleteConfirmationText: "Are you sure you want to delete this department?",
    delete: "Delete",
    addDepartment: "Add Department",
    departmentName: "Department Name",
    close: "Close",
    add: "Add",
    departmentsTable: "Departments ",
    departmentNameRequired: "Please enter the department name.",
    departmentAddedError:
      "An error occurred while adding the department. Please try again later.",
      noDepartments: "No Departments",
      createDepartments: "Create Your Company Departments ",
      departmentAddedAlreadyExists: "Department already exists",
  },
  ar: {
    addMember: "إضافة عضو",
    email: "البريد الإلكتروني",
    emailExistsError:
      "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد آخر.",
    generalError: "حدث خطأ أثناء التسجيل. حاول مرة أخرى لاحقًا.",
    invalidCompanyIdOrUserId: "معرف الشركة او المستخدم غير صحيح.",
    departmentDeleted: "تم حذف القسم بنجاح.",
    departmentAdded: "تم إضافة القسم بنجاح.",
    deleteConfirmationTitle: "حذف القسم",
    deleteConfirmationText: "هل أنت متأكد أنك تريد حذف هذا القسم؟",
    delete: "حذف",
    addDepartment: "إضافة قسم",
    departmentName: "اسم القسم",
    close: "إغلاق",
    add: "إضافة",
    departmentsTable: " الأقسام",
    departmentNameRequired: "يرجى إدخال اسم القسم",
    departmentAddedError:
      "حدث خطأ أثناء إضافة القسم. يرجى المحاولة مرة أخرى لاحقًا.",
      noDepartments: "لا يوجد اقسام",
      createDepartments: "انشاء أقسام شركتك",
      departmentAddedAlreadyExists: "القسم موجود بالفعل",
  },
};
</script>

<template>
  <!-- <LanguageSwitcher /> -->
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header pb-0">
            <div class="d-flex align-items-center">
              <p class="mb-0 font-weight-bold">{{ t("departmentsTable") }}</p>
              <argon-button v-if="canCreateDepartment || isOwner" class="ml-auto mx-2" @click="openPopup">
                <i class="fas fa-plus"></i>
              </argon-button>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent>
              <argon-alert
                v-if="showAlert"
                color="danger"
                dismissible
                class="mt-3"
              >
                {{ errorMessage }}
              </argon-alert>
              <argon-alert
                v-if="showSuccess"
                color="success"
                dismissible
                class="mt-3"
              >
                {{ successMessage }}
              </argon-alert>
            </form>
            <div v-if="isLoading" class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="departments.length === 0" class="d-flex justify-content-center py-5 flex-column align-items-center">
          <h5>{{ t("noDepartments") }}</h5>
          <p>
            {{ t("createDepartments") }}
          </p>
        </div>
            <departments-table
              v-else
              :departments="departments"
              :key="componentKey"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showPopup" class="popup-overlay">
    <transition name="modal-fade">
      <ArgonModal
        v-if="showPopup"
        :title="t('addDepartment')"
        @close="closePopup"
      >
        <template #default>
          <label>{{ t("departmentName") }}:</label>
          <input v-model="departmentName" class="form-control" />
        </template>

        <template #footer>
          
          <argon-button @click="addDepartment" :disabled="isLoading">
            <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
            ></span>
            {{ isLoading ? t("saving") : t("add") }}
          </argon-button>
          <argon-button @click="closePopup">{{ t("close") }}</argon-button>
        </template>

        <template #title>
          <i class="fas fa-user-edit me-2"></i>
          {{ t("addDepartment") }}
        </template>
      </ArgonModal>
    </transition>
  </div>
</template>

<style>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
