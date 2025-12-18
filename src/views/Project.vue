<script setup>
import { ref, computed, onBeforeMount, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
// import ArgonInput from "@/components/ArgonInput.vue";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
// import LanguageSwitcher from "@/views/components/LanguageSwitcher.vue";
import ProjectsTable from "@/views/components/ProjectsTable.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import ArgonMultipleSelect from "@/components/ArgonMultipleSelect.vue";

import Swal from "sweetalert2";
const store = useStore();
const { t } = useI18n();


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

// في الـ component
onMounted(async () => {
  try {
    await store.dispatch("fetchDepartments");
    console.log("Departments:", store.getters.departments); // تحقق من البيانات
  } catch (error) {
    console.error("Error:", error);
  }
});

const departments = computed(() => store.getters.departments || []);
const formattedDepartments = computed(() => {
  return departments.value?.map(dept => ({
    value: dept.id,
    label: dept.name
  })) || [];
});

const dataFromApi = computed(() => store.getters.dataFromApi);


const employeeOptions = computed(() => {
  return dataFromApi.value.map((employee) => ({
    value: employee.id,
    label: `${employee.first_name ?? employee.name ?? ''} ${employee.last_name ?? ''}`.trim(),
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
const departmentNames = ref([]);
const departmentIds = ref([]);

// التحكم في الإعدادات المتقدمة
const toggleAdvancedSettings = () => {
  showAdvancedSettings.value = !showAdvancedSettings.value;
};

// غلق المودال
const closePopup = () => {
  showPopup.value = false;
  projectName.value = "";
  projectDescription.value = "";
  fromDate.value = "";
  toDate.value = "";
  selectedManager.value = "";
  departmentIds.value = [];
  projectStatus.value = false;
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
      errorMessage.value = t("projects.generalError");
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 3000);
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: t("projects.errorFetchingProjects"),
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

const openPopup = () => {
  showPopup.value = true;
};

const addProject = async () => {
  isLoading.value = true;
  const project = {
    name: projectName.value,
    desc: projectDescription.value,
    start_date: fromDate.value,
    deadline: toDate.value,
    leader_id: selectedManager.value,
    status: projectStatus.value,
    department_ids: departmentIds.value,
  };

  console.log("project:", project);
  try {
    const response = await store.dispatch("addProject", project);
    if (response.status === 201) {
      Swal.fire({
        icon: "success",
        title: t("projects.projectAdded"),
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
      title: t("projects.errorOccurred"),
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




</script>

<template>
  <!-- <LanguageSwitcher /> -->
  <div class="py-1 container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header ">
            <div class="d-flex align-items-center">
              <p class="mb-0 font-weight-bold">
                {{ t("projects.projectsTable") }}
                <span v-if="projects && projects.length > 0" class="text-muted" style="font-size: 0.95em;">
                  ({{ projects.length }})
                </span>
              </p>
              <argon-button v-show="canCreateProject || isOwner" class="ml-auto mx-2" @click="openPopup">
                <i class="fas fa-plus"></i>
              </argon-button>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent>
              <argon-alert v-if="showAlert" color="danger" dismissible class="mt-3">
                {{ errorMessage }}
              </argon-alert>
              <argon-alert v-if="showSuccess" color="success" dismissible class="mt-3">
                {{ successMessage }}
              </argon-alert>
            </form>
            <div v-if="isLoading" class="d-flex justify-content-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ t("projects.loading") }}</span>
              </div>
            </div>

            <div v-else-if="projects.length === 0"
              class="d-flex justify-content-center py-5 flex-column align-items-center">
              <h5>{{ t("projects.noProjects") }}</h5>
              <p>
                {{ t("projects.createee") }}
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
      <ArgonModal v-if="showPopup" :title="t('projects.createProject')" @close="closePopup" class="project-modal">
        <template #default>
          <div class="modal-content-scroll">

            <div class="form-group mb-3">
              <label class="form-label">{{ t("projects.projectName") }}:</label>
              <input v-model="projectName" class="form-control" :placeholder="t('projects.enterProjectName')" />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("projects.description") }}:</label>
              <textarea v-model="projectDescription" class="form-control"
                :placeholder="t('projects.enterDescription')"></textarea>
            </div>

            <div v-if="employeeOptions.length > 0" class="mb-3">
              <label class="form-label">{{ t("projects.projectManager") }}:</label>
              <argon-select v-model="selectedManager" :options="employeeOptions"
                :placeholder="t('projects.projectManager')" class="form-control" searchable
                :searchPlaceholder="t('projects.searchEmployees')" />
            </div>

            <div class="mb-3">
              <label class="form-label">{{ t("projects.departments") }}:</label>
              <argon-multiple-select v-model="departmentIds" :model-names="departmentNames"
                :options="formattedDepartments" :placeholder="t('projects.selectDepartment')"
                class="form-control mb-3" />
            </div>

            <!-- زر الإعدادات المتقدمة -->
            <div class="d-flex align-items-center">
              <ArgonButton class="btn btn-link mb-3" @click="toggleAdvancedSettings">
                {{ t("projects.advancedSettings") }}
              </ArgonButton>

              <div class="d-flex align-items-center ms-auto">
                <span class="me-2">{{ t("projects.inactive") }}</span>
                <argon-switch class="custom-switch-modal" v-model:checked="projectStatus" aria-label="Project Status"
                  role="switch"></argon-switch>
                <span class="ms-2">{{ t("projects.active") }}</span>
              </div>
            </div>

            <!-- الإعدادات المتقدمة -->
            <transition name="fade">
              <div v-if="showAdvancedSettings" class="advanced-settings">
                <div class="form-group mb-3">
                  <label class="form-label">{{ t("projects.from") }}:</label>
                  <input type="date" v-model="fromDate" class="form-control" />
                </div>
                <div class="form-group mb-3">
                  <label class="form-label">{{ t("projects.to") }}:</label>
                  <input type="date" v-model="toDate" class="form-control" />
                </div>
              </div>
            </transition>

          </div>
        </template>

        <template #footer>

          <argon-button variant="success" @click="addProject" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isLoading ? t("projects.saving") : t("projects.create") }}
          </argon-button>
          <argon-button variant="secondary" @click="closePopup">
            {{ t("projects.close") }}
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

.project-modal {
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  scrollbar-width: none;
  scrollbar-color: transparent transparent;
}

/* إضافة هذه الأنماط لشريط التمرير */
.modal-content-scroll {
  overflow-y: auto;
  /* تفعيل التمرير الرأسي */
  overflow-x: hidden;
  /* إخفاء التمرير الأفقي */
  max-height: 65vh;
  /* الحد الأقصى لارتفاع المحتوى */
  scrollbar-width: thin;
  /* لـ Firefox */
  scrollbar-color: #888 #f1f1f1;
  /* لـ Firefox */
}

/* إصلاح عرض المودال لتجنب التمرير الأفقي\ */

/* إخفاء التمرير الأفقي في المحتوى الداخلي */
.modal-content-scroll::-webkit-scrollbar {
  width: 8px;
  /* عرض شريط التمرير الرأسي */
  height: 0px;
  /* تعطيل شريط التمرير الأفقي */
}

/* حل مشكلة العرض الزائد */
.modal-content-scroll>.row {
  max-width: 100%;
  margin: 0 auto;
}

/* إصلاح حجم الحقول */
.modal-content-scroll input,
.modal-content-scroll select,
.modal-content-scroll textarea {
  max-width: 100%;
  box-sizing: border-box;
}

.project-modal .modal-content-scroll {
  overflow-y: auto;
  flex: 1;
  max-height: 65vh;
}
</style>
