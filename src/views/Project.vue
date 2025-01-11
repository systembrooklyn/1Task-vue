<script setup>
import { ref, computed, onBeforeMount, watch } from "vue";
import { useStore } from "vuex";
// import ArgonInput from "@/components/ArgonInput.vue";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
// import LanguageSwitcher from "@/views/components/LanguageSwitcher.vue";
import ProjectsTable from "@/views/components/ProjectsTable.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import Swal from "sweetalert2";
const store = useStore();


const userData = computed(() => store.getters.user);

import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
  hasPermission,
} from "@/utils/permissions.js";

const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.id) || {}
);

// عند تحميل الصفحة لأول مرة، حفظ الصلاحيات في localStorage
onBeforeMount(async () => {
  if (!permissions.value || Object.keys(permissions.value).length === 0) {
    const extractedPermissions = extractPermissionsFromAPI(
      userData.value?.roles
    );
    permissions.value = extractedPermissions;
    savePermissionsToLocalStorage(permissions.value, userData.value?.id);
  }
  await store.dispatch("getCompanyUsers");
});

const dataFromApi = computed(() => store.getters.dataFromApi);

const employeeOptions = computed(() => {
  return dataFromApi.value.map((employee) => ({
    value: employee.id,
    label: employee.name,
  }));
});

console.log("employeeOptionssssssssssss:", employeeOptions.value);

const isOwner = computed(() => store.getters.isOwner);

const canCreateProject = computed(() =>
  hasPermission(permissions.value, "create-project")
);

const showAlert = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showSuccess = ref(false);
const projectName = ref("");
const showPopup = ref(false);
const projects = ref([]);
const componentKey = ref(0);
const body = document.getElementsByTagName("body")[0];
const isLoading = ref(false);
const projectDescription = ref("");
const fromDate = ref("");
const toDate = ref("");
const showAdvancedSettings = ref(false);
// const projectManager = ref("");
const selectedManager = ref("");
const projectStatus = ref(false);

// التحكم في الإعدادات المتقدمة
const toggleAdvancedSettings = () => {
  showAdvancedSettings.value = !showAdvancedSettings.value;
};

// غلق المودال
const closePopup = () => {
  showPopup.value = false;
};

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

  await fetchProjects();
});

const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

const currentUserId = computed(() => store.getters.userId);
console.log("currentUserId:", currentUserId.value);

// const userName = computed(() => store.getters.userName);

const fetchProjects = async () => {
  isLoading.value = true;

  try {
    const response = await store.dispatch("fetchProjects");
    console.log("response:", response);
    if (response.status === 200) {
      projects.value = store.getters.projects;
      console.log("projects:", projects.value);
      componentKey.value += 1;
    } else {
      errorMessage.value = t("generalError");
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 3000);
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error fetching projects",
      text: error.message || "An unexpected error occurred.",
    });
  } finally {
    isLoading.value = false;
  }
};
// const departmentsGetters = computed(() => store.getters.departments.filter(
//   department => department.companyID == store.getters.companyId
// ));
// console.log("departmentsGetters", departmentsGetters.value);

watch(
  () => store.getters.projects,
  (newData) => {
    projects.value = [...newData];
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

const addProject = async () => {
    isLoading.value = true;
    const project = {
      name: projectName.value,
      desc: projectDescription.value,
      from: fromDate.value,
      to: toDate.value,
      leader_id: selectedManager.value,
      status: projectStatus.value,
    };

    console.log("project:", project);
    try {
      const response = await store.dispatch("addProject", project);
      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: t("projectAdded"),
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      
      closePopup();
      await fetchProjects();
      componentKey.value += 1;
    }
    } catch (error) {
    console.log("error:", error);
      // استخراج الأخطاء من الرد
  
  
      Swal.fire({
        icon: "warning",
        title: t("errorOccurred"),
        html: error, 
        showConfirmButton: true,
        backdrop: 'rgba(0,0,0,0.5)', 
        heightAuto: false, 
        customClass: {
          popup: 'swal-above-modal', 
        }
      });
    } finally {
    isLoading.value = false;
  }
  }



const translations = {
  en: {
    addMember: "Add Member",
    email: "Email",
    emailExistsError:
      "This email is already registered. Please use another email.",
    generalError: "An error occurred while submitting. Please try again later.",
    invalidCompanyIdOrUserId: "Invalid Company ID or User ID.",
    projectDeleted: "Project deleted successfully.",
    projectAdded: "Project added successfully.",
    deleteConfirmationTitle: "Delete Project",
    deleteConfirmationText: "Are you sure you want to delete this Project?",
    delete: "Delete",
    addProject: "Add Project",
    projectName: "Project Name *",
    description: "Description",
    close: "Close",
    create: "create",
    projectsTable: "Projects ",
    projectNameRequired: "Please enter the project name.",
    projectAddedError:
      "An error occurre while adding the project. Please try again later.",
    from: "From",
    to: "To",
    projectManager: "Project Manager",
    assignManager: "Assign Manager",
    enterDescription: "Enter Description",
    enterProjectName: "Enter Project Name",
    createProject: "Create Project",
    saving: "Saving...",
    noProjects: "No projects found.",
    createee: "Create your project",
  },
  ar: {
    addMember: "اضافة عضو",
    email: "البريد الالكتروني",
    emailExistsError:
      "هذا البريد الالكتروني مسجل بالفعل. يرجى استخدام بريد الكتروني اخر.",
    generalError: "حدث خطأ في التقديم. يرجى المحاولة مرة اخرى في وقت لاحق.",
    invalidCompanyIdOrUserId: "معرف الشركة غير صحيح.",
    projectDeleted: "تم حذف المشروع بنجاح.",
    projectAdded: "تم اضافة المشروع بنجاح.",
    deleteConfirmationTitle: "حذف المشروع",
    deleteConfirmationText: "هل تريد حذف هذا المشروع؟",
    delete: "حذف",
    addProject: "اضافة مشروع",
    projectName: "*اسم المشروع",
    description: "وصف المشروع",
    close: "اغلاق",
    create: "اضافة",
    projectsTable: "المشاريع",
    projectNameRequired: "يرجى ادخال اسم المشروع.",
    projectAddedError:
      "حدث خطأ في اضافة المشروع. يرجى المحاولة مرة اخرى في وقت لاحق.",
    from: "من",
    to: "إلى",
    projectManager: "مدير المشروع",
    assignManager: "تعيين المدير",
    enterDescription: "ادخال الوصف",
    enterProjectName: "ادخال اسم المشروع",
    createProject: "اضافة مشروع",
    saving: "يتم الحفظ...",
    noProjects: "لا يوجد مشاريع.",
    createee: "انشئ مشروعك من الزر المتواجد بالاعلي",
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
              <p class="mb-0 font-weight-bold">{{ t("projectsTable") }}</p>
              <argon-button
                v-show="canCreateProject || isOwner"
                class="ml-auto mx-2"
                @click="openPopup"
              >
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

        <div v-else-if="projects.length === 0" class="d-flex justify-content-center py-5 flex-column align-items-center">
          <h5>{{ t("noProjects") }}</h5>
          <p>
            {{ t("createee") }}
          </p>
        </div>
            <projects-table v-else :projects="projects" :key="componentKey" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showPopup" class="popup-overlay">
    <transition name="modal-fade">
      <ArgonModal
        v-if="showPopup"
        :title="t('createProject')"
        @close="closePopup"
      >
        <template #default>
          <div class="form-group mb-3">
            <label class="form-label">{{ t("projectName") }}:</label>
            <input
              v-model="projectName"
              class="form-control"
              :placeholder="t('enterProjectName')"
            />
          </div>

          <div class="form-group mb-3">
            <label class="form-label">{{ t("description") }}:</label>
            <textarea
              v-model="projectDescription"
              class="form-control"
              :placeholder="t('enterDescription')"
            ></textarea>
          </div>

          <div v-if="employeeOptions.length > 0" class="mb-3">
            <label class="form-label">{{ t("projectManager") }}:</label>
            <argon-select
              v-model="selectedManager"
              :options="employeeOptions"
              :placeholder="t('assignManager')"
              class="form-control"
            />
          </div>

          <!-- زر الإعدادات المتقدمة -->
          <div class="d-flex align-items-center">
            <ArgonButton
              class="btn btn-link mb-3"
              @click="toggleAdvancedSettings"
            >
              Advanced Settings
            </ArgonButton>

            <div class="d-flex align-items-center ms-auto">
              <span class="me-2">{{ t("inactive") }}</span>
              <argon-switch
                class="custom-switch-modal"
                v-model:checked="projectStatus"
                aria-label="Project Status"
                role="switch"
              ></argon-switch>
              <span class="ms-2">{{ t("active") }}</span>
            </div>
          </div>

          <!-- الإعدادات المتقدمة -->
          <transition name="fade">
            <div v-if="showAdvancedSettings" class="advanced-settings">
              <div class="form-group mb-3">
                <label class="form-label">{{ t("from") }}:</label>
                <input
                  type="date"
                  v-model="fromDate"
                  class="form-control"
                />
              </div>
              <div class="form-group mb-3">
                <label class="form-label">{{ t("to") }}:</label>
                <input
                  type="date"
                  v-model="toDate"
                  class="form-control"
                />
              </div>
            </div>
          </transition>
        </template>

        <template #footer>
          
          <argon-button
            variant="success"
            @click="addProject"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isLoading ? t("saving") : t("create") }}
          </argon-button>
          <argon-button variant="secondary" @click="closePopup">
            {{ t("close") }}
          </argon-button>
        </template>
      </ArgonModal>
    </transition>
  </div>
</template>


<style>
/* تأثيرات الظهور والإخفاء */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* الإعدادات المتقدمة */
.advanced-settings {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  background-color: #f9f9f9;
}
</style>
