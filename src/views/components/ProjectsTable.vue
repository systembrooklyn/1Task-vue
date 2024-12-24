<template>
  <div class="card-body px-0 pt-0 pb-2" :key="componentKey">
    <div class="table-responsive p-3">
      <table class="table align-items-center table-hover mb-0">
        <thead class="thead-light">
          <tr>
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("status") }}
            </th>
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("projectName") }}
            </th>
            <!-- <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                {{ t("discription") }}
              </th> -->
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("assignManager") }}
            </th>
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("taskOwner") }}
            </th>
            <!-- <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                {{ t("viceManager") }}
              </th> -->
            <th class="text-secondary opacity-7"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="Project in props.projects" :key="Project.id">
            <td>
              <div class="px-2 py-1">
                <div class="d-flex justify-content-center text-sm">
                  <argon-switch
                    :checked="Boolean(Project.status)"
                    @update:checked="
                      (newStatus) => toggleStatus(Project.id, newStatus)
                    "
                  >
                    {{ Project.status ? t("active") : t("inactive") }}
                  </argon-switch>
                </div>
              </div>
            </td>

            <td>
              <div class="d-flex px-2 py-1 position-relative">
                <div class="d-flex flex-column justify-content-center text-sm">
                  <h6 class="mb-0 text-sm">{{ Project.name }}</h6>
                </div>
                <!-- أيقونة العرض -->
                <div
                  class="hover-icon"
                  @click="openDescriptionModal(Project)"
                  title="Open Description"
                >
                  <i class="fas fa-expand-arrows-alt"></i>
                </div>
              </div>
            </td>

            <!-- <td>
                <div class=" px-2 py-1">
                  <div class="d-flex flex-column justify-content-center text-sm">
                    <h6 class="mb-0 text-sm ">{{ Project.desc }}</h6>
                  </div>
                </div>
              </td> -->
            <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ Project.leader_name || "No Manager" }}
              </p>
            </td>
            <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ Project.created_by_name }}
              </p>
            </td>
            <!-- <td>
                <p class="text-xs font-weight-bold mb-0">
                  {{ Project.vice_manager_name || 'No Vice Manager' }}
                </p>
              </td> -->
            <td class="align-middle">
              <a
                href="javascript:;"
                class="text-secondary font-weight-bold text-xs me-2"
                @click="openEditModal(Project)"
              >
                {{ t("edit") }}
              </a>
              <a
                href="javascript:;"
                class="text-danger font-weight-bold text-xs"
                @click="confirmDelete(Project)"
              >
                {{ t("delete") }}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showEditPopup" class="popup-overlay">
      <transition name="modal-fade">
        <ArgonModal
          v-if="showEditPopup"
          :title="t('editDepartment')"
          @close="closeEditPopup"
        >
          <template #default>
            <label class="form-label">{{ t("departmentName") }}:</label>
            <input
              v-model="selectedDepartment.name"
              class="form-control mb-3"
            />

            <div v-if="employeeOptions.length > 0" class="mb-3">
              <label class="form-label">{{ t("assignManager") }}:</label>
              <argon-select
                v-model="selectedManager"
                :options="employeeOptions"
                :placeholder="t('assignManager')"
                class="form-control"
              />
            </div>
            <div v-if="employees.length > 0" class="mb-3">
              <label class="form-label">{{ t("viceManager") }}:</label>
              <argon-select
                v-model="selectedViceManager"
                :options="employeeOptions"
                :placeholder="t('viceManager')"
                class="form-control"
              />
            </div>
          </template>

          <template #footer>
            <argon-button variant="secondary" @click="closeEditPopup">{{
              t("close")
            }}</argon-button>
            <argon-button
              variant="success"
              @click="updateProject"
              :disabled="isLoading"
            >
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ isLoading ? t("saving") : t("update") }}
            </argon-button>
          </template>

          <template #title>
            <i class="fas fa-user-edit me-2"></i>
            {{ t("editDepartment") }}
          </template>
        </ArgonModal>
      </transition>
    </div>
  </div>
  <ArgonModal
    v-if="showDescriptionModal"
    :title="selectedProjectName"
    @close="closeDescriptionModal"
    style="width: 100%; height: 100%; overflow-y: auto; overflow-x: hidden;"
  >
    <template #default>
      <div class="modal-body">
        <!-- التبويبات -->
        <ul class="nav nav-tabs custom-tabs" role="tablist">
          <li class="nav-item">
            <argon-button
              class="nav-link"
              :class="{ active: activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              Info
            </argon-button>
          </li>
          <li class="nav-item">
            <argon-button
              class="nav-link"
              :class="{ active: activeTab === 'log' }"
              @click="activeTab = 'log'"
            >
              Log
            </argon-button>
          </li>
        </ul>
        <div class="tab-content mt-3">
          <div v-if="activeTab === 'info'">
            <h5>Project Description</h5>
            <p>{{ selectedDescription }}</p>
          </div>
          <div v-if="activeTab === 'log'">
            <p>No Log available yet.</p>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <argon-button variant="secondary" @click="closeDescriptionModal">
        Close
      </argon-button>
    </template>
  </ArgonModal>
</template>

<script setup>
import { computed, ref, onBeforeMount } from "vue";
import { useStore } from "vuex";
import Swal from "sweetalert2";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
// import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
  // hasPermission,
} from "@/utils/permissions.js";
// import Project from "@/views/Project.vue";

const store = useStore();
const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

const currentUserId = computed(() => store.getters.userId);
console.log("currentUserId:", currentUserId.value);

const props = defineProps({
  projects: {
    type: Array,
    required: true,
  },
});

const userData = computed(() => store.getters.user);
// console.log(userData.value);

// استدعاء الصلاحيات من localStorage بناءً على المستخدم الحالي
const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.id) || {}
);

console.log(permissions.value);

// عند تحميل الصفحة لأول مرة، حفظ الصلاحيات في localStorage
onBeforeMount(() => {
  if (!permissions.value || Object.keys(permissions.value).length === 0) {
    const extractedPermissions = extractPermissionsFromAPI(
      userData.value?.roles
    );
    permissions.value = extractedPermissions;
    savePermissionsToLocalStorage(permissions.value, userData.value?.id);
  }
});
// onMounted(() => {
//   store.dispatch("fetchPositions");
// });

const selectedDescription = ref(false); // لتخزين وصف المشروع
const showDescriptionModal = ref(false);
const selectedProjectName = ref("");

const openDescriptionModal = (Project) => {
  selectedDescription.value = Project.desc; // تعيين الوصف
  selectedProjectName.value = Project.name; // تعيين اسم المشروع
  showDescriptionModal.value = true; // إظهار المودال
};

const closeDescriptionModal = () => {
  showDescriptionModal.value = false; // إغلاق المودال
};

const activeTab = ref("info"); // علامة تبويب البداية

const employees = ref([]);
// const componentKey = ref(0); // متغير لتغيير المفتاح وإعادة تحميل المكون
// const showEditPopup = ref(false);
// const editDepartmentName = ref("");
// const currentEditingDepartmentId = ref(null);
// const isLoading = ref(false);
// const successMessage = ref("");
// const errorMessage = ref("");
// const showSuccess = ref(false);
// const showAlert = ref(false);
// const selectedEmployeeId = ref(null);  // متغير لتحديد ID الموظف
// const selectedPosition = ref(null);  // متغير لتحديد المنصب الجديد

// const fetchEmployees = async () => {
//   try {
//     // جلب بيانات الموظفين من الـ Vuex store
//     await store.dispatch("fetchDataFromApi");

//     console.log("Employees Data:", employees.value);

//     componentKey.value += 1; // تحديث المفتاح لإعادة تحميل المكون
//     return (employees.value = store.getters.dataFromApi.filter(
//       (employee) =>
//         (employee.companyId == currentCompanyId.value ||
//           employee.companyId == currentUserId.value) &&
//         employee.companyId != null
//     ));
//   } catch (error) {
//     console.error("Error fetching employees data:", error);

//     // عرض رسالة خطأ بناءً على اللغة
//     if (store.getters.currentLanguage === "ar") {
//       errorMessage.value =
//         "حدث خطأ أثناء جلب بيانات الموظفين. حاول مرة أخرى لاحقًا.";
//     } else {
//       errorMessage.value =
//         "An error occurred while fetching employees data. Please try again later.";
//     }

//     showAlert.value = true; // إظهار التنبيه بالخطأ

//     // إخفاء التنبيه بعد 3 ثوانٍ
//     setTimeout(() => {
//       showAlert.value = false;
//     }, 3000);
//   }
// };
const toggleStatus = async (projectId, newStatus) => {
  try {
    console.log(`Project ID: ${projectId}, New Status: ${newStatus}`);
    // قم بتنفيذ تحديث الحالة هنا (إرسال الطلب إلى الـ API أو تحديث Vuex)
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

const componentKey = ref(0);

onBeforeMount(async () => {
  savePermissionsToLocalStorage(permissions.value, userData.value?.user?.id);
  // fetchEmployees();
  await store.dispatch("getCompanyUsers");
});

const showEditPopup = ref(false);
// const editDepartmentName = ref("");
const currentEditingProjectId = ref(null);
const selectedManager = ref(null);
//   const selectedViceManager = ref(null);

const selectedProject = ref(null);
// const selectedPosition = ref(null);

console.log("props.projects:", props.projects);

const currentLanguage = computed(() => store.getters.currentLanguage);
const t = (key) => translations[currentLanguage.value][key];

// const canEditDepartment = computed(() =>
//   hasPermission(permissions.value, "canEditDepartment")
// );
// const canDeleteDepartment = computed(() =>
//   hasPermission(permissions.value, "canDeleteDepartment")
// );

// const openEditModal = (department) => {
//   selectedDepartment.value = department;

//   // تأكد من أن department.employees غير فارغة
//   if (department.employees && department.employees.length > 0) {
//     const manager = department.employees.find(
//       (emp) => emp.position.name === "Manager"
//     );
//     const viceManager = department.employees.find(
//       (emp) => emp.position.name === "Vice Manager"
//     );

//     // console.log("manager:", manager);
//     // console.log("viceManager:", viceManager);

//     // تحديد المدير ونائب المدير
//     selectedManager.value = manager ? manager.id : null;
//     selectedViceManager.value = viceManager ? viceManager.id : null;

//     console.log("selectedManager:", selectedManager.value);
//     console.log("selectedViceManager:", selectedViceManager.value);
//   } else {
//     // في حالة عدم وجود موظفين
//     selectedManager.value = null;
//     selectedViceManager.value = null;
//   }

//   showEditPopup.value = true;
// };

const dataFromApi = computed(() => store.getters.dataFromApi);

const employeeOptions = computed(() => {
  return dataFromApi.value.map((employee) => ({
    value: employee.id,
    label: employee.name,
  }));
});

const openEditModal = (Project) => {
  selectedProject.value = Project;
  // selectedManager.value = department.managerId;
  // selectedViceManager.value = department.viceManagerId;

  showEditPopup.value = true;
};

const closeEditPopup = () => {
  showEditPopup.value = false;
  selectedProject.value = null;
  currentEditingProjectId.value = null;
};

const isLoading = ref(false);

const updateProject = async () => {
  isLoading.value = true;

  // تجهيز البيانات التي سيتم إرسالها
  const ProjectData = {
    id: selectedProject.value.id,
    name: selectedProject.value.name,
  };

  try {
    const ProjectManagerId = {
      user_id: selectedManager.value,
      Project_id: selectedProject.value.id,
    };

    // if (departmentManagerId) {
    //   departmentData.managerId = departmentManagerId;
    // }
    console.log("ProjectManagerId:", ProjectManagerId);

    const result = await store.dispatch("updateProject", ProjectData);

    if (ProjectManagerId !== null) {
      await store.dispatch("assignManager", ProjectManagerId);
    }

    if (result.status === 200) {
      // تحديث بيانات الموظفين
      Swal.fire({
        icon: "success",
        title: t("projectUpdatedSuccessfully"),
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      closeEditPopup();
      await store.dispatch("fetchProjects");
    } else {
      Swal.fire({
        icon: "error",
        title: result.message,
        showConfirmButton: true,
      });
    }
  } catch (error) {
    console.error("Error updating project:", error);
    Swal.fire({
      icon: "error",
      title: "Error updating project",
      text: error.message,
    });
  } finally {
    isLoading.value = false;
  }
};

// const saveChanges = async () => {
//     componentKey.value += 1;
// }

const confirmDelete = (Project) => {
  Swal.fire({
    title: t("deleteConfirmationTitle"),
    text: t("deleteConfirmationText"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("delete"),
    cancelButtonText: t("close"),
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteProject(Project.id);
    }
  });
};

const deleteProject = async (projectId) => {
  console.log(projectId);
  try {
    await store.dispatch("deleteProject", projectId);
    await store.dispatch("fetchProjects");
    componentKey.value += 1;
  } catch (error) {
    console.error("Error deleting project:", error);
  }
};

const translations = {
  en: {
    projectsTable: "Projects Table",
    projectName: "Project Name",
    edit: "Edit",
    delete: "Delete",
    deleteConfirmationTitle: "Delete Project",
    deleteConfirmationText: "Are you sure you want to delete this project?",
    close: "Close",
    saving: "Saving...",
    update: "Update",
    assignManager: "Project Manager",
    viceManager: "Vice Manager",
    projectUpdatedSuccessfully: "Project updated successfully",
    status: "Status",
    taskOwner: "Task Owner",
    discription: "Discription",
  },
  ar: {
    projectsTable: "جدول المشاريع",
    projectName: "اسم المشروع",
    edit: "تعديل",
    delete: "حذف",
    deleteConfirmationTitle: "حذف المشروع",
    deleteConfirmationText: "هل تريد حذف هذا المشروع؟",
    close: "إغلاق",
    saving: "يتم الحفظ...",
    update: "تحديث",
    assignManager: "مدير المشروع",
    viceManager: "مدير مساعد",
    projectUpdatedSuccessfully: "تم تحديث المشروع بنجاح",
    status: "حالة المشروع",
    taskOwner: "مدير المهمة",
    discription: "وصف المشروع",
  },
};

// const selectedEmployee = ref(null);
// console.log(selectedEmployee.value)

// Transform employees data into options for the select component
// const employeeOptions = computed(() => {
//   return employees.value.map((employee) => ({
//     label: employee.name, // Adjust the property name as needed
//     value: employee.id, // Adjust the property name as needed
//   }));
// });

console.log(employeeOptions.value);

// Function to get the manager's name
// const getManagerName = (department) => {
//   const manager = department.employees.find(
//     (emp) => emp.position.name === "Manager"
//   );
//   return manager ? manager.name : "No Manager";
// };

// // Function to get the vice manager's name
// const getViceManagerName = (department) => {
//   const viceManager = department.employees.find(
//     (emp) => emp.position.name === "Vice Manager"
//   );
//   return viceManager ? viceManager.name : "No Vice Manager";
// };
</script>

<style scoped>
.table-responsive {
  background-color: #fff;
  border-radius: 10px;
}

/* تنسيق رأس الجدول */
.table thead th {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  text-align: center; /* جعل النصوص في رأس الجدول في المنتصف */
}

/* تأثير hover على الصفوف */
.table tbody tr:hover {
  background: #f1f1f1;
}

.table td,
.table th {
  vertical-align: middle;
  text-align: center; /* جعل جميع النصوص في الأعمدة في المنتصف */
}

/* تنسيق الـ Modal */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

/* تحسين تنسيق النصوص */
.form-label {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 5px;
}

/* إضافة موضع للأيقونة */
.hover-icon {
  right: 10px; /* اجعل الأيقونة في أقصى اليمين */
  top: 50%; /* محاذاة رأسية */
  transform: translateY(-50%); /* تصحيح المحاذاة العمودية */
  position: absolute; /* تثبيت الأيقونة بالنسبة للحاوية */
  cursor: pointer;
  color: #4caf50; /* لون الموقع الأساسي */
  opacity: 0; /* الإخفاء الافتراضي */
  transform: translateY(-50%) scale(0.8); /* تقليل الحجم قليلاً */
  transition:
    opacity 0.3s ease,
    transform 0.3s ease; /* تأثير عند التبديل */
}

.hover-icon:hover {
  color: #4caf50; /* لون الموقع عند التمرير */
}

td:hover .hover-icon {
  opacity: 1; /* إظهار الأيقونة عند التمرير */
  transform: translateY(-50%) scale(1); /* إرجاع الحجم الطبيعي */
}

/* تحسين الحاوية */
.d-flex.position-relative {
  position: relative; /* تهيئة الحاوية للأيقونة */
  padding-right: 30px; /* إضافة مساحة للأيقونة */
}

/* tabs  */

/* تصميم الـ tabs */
.custom-tabs {
  display: flex;
  align-items: center;
  /* background-color: #1e2235;  */
  padding: 0.5rem;
}

.custom-tabs .nav-item {
  margin-right: 1rem;
}

.custom-tabs .nav-link {
  display: flex;
  align-items: center;
  color: #4caf50;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background-color: transparent;
  transition:
    color 0.3s ease,
    background-color 0.3s ease;
}

/* .custom-tabs .nav-link i {
  margin-right: 0.5rem; 
} */

.custom-tabs .nav-link.active {
  color: #ffffff; /* النص الأخضر */
  border-bottom: 2px solid #4caf50; /* خط أخضر أسفل التبويب النشط */
}

.custom-tabs .nav-link:hover {
  color: #4caf50; /* النص الأخضر عند التمرير */
}

.tab-content {
  padding: 1rem;
  background-color: #ffffff; /* اللون الأبيض */
  border-radius: 0.5rem; /* حواف ناعمة */
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-body {
  padding: 1rem;
  background-color: #ffffff; /* اللون الأبيض */
  border-radius: 0.5rem; /* حواف ناعمة */
  
}
</style>
