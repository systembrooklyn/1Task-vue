<template>
  <div class="card-body px-0 pt-0 pb-2" :key="componentKey">
    <div class="table-responsive p-3">
      <table class="table align-items-center table-hover mb-0">
        <thead class="thead-light">
          <tr>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("projects.status") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("projects.projectName") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("projects.projectManager") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("projects.projectCreatedBy") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("projects.departmentName") }}
            </th>
            <th class="text-secondary opacity-7"
              v-if="isOwner || permissions['edit-project'] || permissions['delete-project']"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="Project in props.projects" :key="Project.id">
            <td :class="{ 'disabled-cell': !(isOwner || permissions['edit-project']) }">
              <div class="px-2 py-1"
                :style="!(isOwner || permissions['edit-project']) ? 'pointer-events: none; opacity: 0.6;' : ''">
                <div class="d-flex justify-content-center text-sm">
                  <argon-switch :checked="Boolean(Project.status)" :disabled="!(isOwner || permissions['edit-project'])"
                    @update:checked="() => {
                      if (isOwner || permissions['edit-project']) {
                        toggleStatus(Project.id)
                      }
                    }">
                    {{ Project.status ? t("projects.active") : t("projects.inactive") }}
                  </argon-switch>
                </div>
              </div>
            </td>

            <!-- <td>
              <div class="d-flex px-2 py-1 position-relative">
                <div class="d-flex flex-column justify-content-center text-sm">
                  <h6 class="mb-0 text-sm">{{ Project.name }}</h6>
                </div>
                <div
                  class="hover-icon"
                  @click="openDescriptionModal(Project)"
                  title="Open Description"
                >
                  <i class="fas fa-expand-arrows-alt"></i>
                </div>
              </div>
            </td> -->

            <td>
              <div class="d-flex px-2 py-1 align-items-center justify-content-center position-relative">
                <div class="d-flex justify-content-center align-items-center task-name text-center w-100 cursor-pointer"
                  @click="openDescriptionModal(Project)" :title="t('projects.openTaskDescription')">
                  <h6 class="mb-0 text-sm hover-effect mx-1" style="direction: rtl">
                    {{ Project.name }}
                  </h6>
                  <div v-if="loadingTaskId === Project.id" class="spinner-border spinner-border-sm text-primary"
                    role="status">
                    <span class="visually-hidden">{{ t("projects.loading") }}</span>
                  </div>
                </div>
              </div>
            </td>

            <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ Project.leader_name || t("projects.noManager") }}
              </p>
            </td>
            <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ Project.created_by_name }}
              </p>
            </td>

            <td>
              <div v-if="Project.department_name.length" class="selected-options">
                <span v-for="departmentName in Project.department_name" :key="departmentName" class="selected-option">
                  {{ departmentName }}
                  <!-- <button
                    v-show="canEditUser || isOwner"
                    type="button"
                    class="btn-remove"
                    @click="confirmRemoveDepartment(Project, departmentName)"
                  >
                    ×
                  </button> -->
                </span>
              </div>
              <p v-else class="text-xs font-weight-bold mb-0">{{ t("projects.noDepartment") }}</p>
            </td>

            <td v-if="isOwner || permissions['edit-project'] || permissions['delete-project']" class="align-middle">
              <a href="javascript:;" v-if="permissions['edit-project'] || isOwner"
                class="text-secondary font-weight-bold text-xs me-2" @click="openEditModal(Project)">
                {{ t("projects.edit") }}
              </a>
              <a href="javascript:;" v-if="permissions['delete-project'] || isOwner"
                class="text-danger font-weight-bold text-xs" @click="confirmDelete(Project)">
                {{ t("projects.delete") }}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showEditPopup" class="popup-overlay">
      <transition name="modal-fade">
        <ArgonModal v-if="showEditPopup" :title="selectedProject.name" @close="closeEditPopup">
          <template #default>
            <label class="form-label">{{ t("projects.projectName") }}:</label>
            <input v-model="selectedProject.name" class="form-control mb-3" />

            <label class="form-label">{{ t("projects.description") }}:</label>
            <input v-model="selectedProject.desc" class="form-control mb-3" />

            <div v-if="employeeOptions.length > 0" class="mb-3">
              <label class="form-label">{{ t("projects.projectManager") }}:</label>
              <argon-select v-model="selectedProject.leader_id" :options="employeeOptions"
                :placeholder="t('projects.projectManager')" class="form-control" searchable
                :searchPlaceholder="t('projects.searchManager')" />
            </div>

            <label class="form-label">{{ t("projects.startDate") }}:</label>
            <input v-model="selectedProject.start_date" type="date" class="form-control mb-3" />

            <label class="form-label">{{ t("projects.deadline") }}:</label>
            <input v-model="selectedProject.deadline" type="date" class="form-control mb-3" />

            <label class="form-label">{{ t("projects.departments") }}:</label>
            <argon-multiple-select v-model="selectedProject.departmentIds"
              :model-names="selectedProject.departmentNames" :options="departmentOptions"
              :placeholder="t('projects.selectDepartment')" class="form-control mb-3" />

            <label style="display: none" class="form-label">{{ t("projects.status") }}:</label>
            <argon-switch style="display: none" v-model:checked="selectedProject.status">
              {{ selectedProject.status ? t("projects.active") : t("projects.inactive") }}
            </argon-switch>
          </template>

          <template #footer>
            <argon-button variant="success" @click="updateProject" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
              {{ isLoading ? t("projects.saving") : t("projects.update") }}
            </argon-button>
            <argon-button variant="secondary" @click="closeEditPopup">
              {{ t("projects.close") }}
            </argon-button>
          </template>

          <!-- <template #title>
            <i class="fas fa-user-edit me-2"></i>
            {{ t("editProject") }}
          </template> -->
        </ArgonModal>
      </transition>
    </div>

    <!-- مودال الوصف المعدل -->
    <ArgonModal v-if="showDescriptionModal" :title="selectedProjectName" @close="closeDescriptionModal">
      <template #default>
        <div class="modal-body">
          <!-- التبويبات -->
          <ul class="nav nav-tabs custom-tabs" role="tablist">
            <li class="nav-item">
              <argon-button class="nav-link" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">
                {{ t("projects.info") }}
              </argon-button>
            </li>
            <li class="nav-item">
              <argon-button class="nav-link" :class="{ active: activeTab === 'log' }" @click="activeTab = 'log'">
                {{ t("projects.log") }}
              </argon-button>
            </li>
          </ul>
          <div class="tab-content">
            <div v-if="activeTab === 'info'">
              <!-- <h5>{{ t('projects.projectDetails') }}</h5> -->
              <dl class="row">
                <dt v-if="selectedDescription" class="col-sm-3">
                  {{ t("projects.description") }}:
                </dt>
                <dd v-if="selectedDescription" class="col-sm-9">
                  {{ selectedDescription || "N/A" }}
                </dd>

                <dt class="col-sm-3">{{ t("projects.createdAt") }}:</dt>
                <dd class="col-sm-9">
                  {{ formatDate(selectedProjectCreationDate) || "N/A" }}
                </dd>

                <dt v-if="selectedProjectStartDate" class="col-sm-3">
                  {{ t("projects.startDate") }}:
                </dt>
                <dd v-if="selectedProjectStartDate" class="col-sm-9">
                  {{ formatDate(selectedProjectStartDate) || "N/A" }}
                </dd>

                <dt v-if="selectedProjectDeadline" class="col-sm-3">
                  {{ t("projects.deadline") }}:
                </dt>
                <dd v-if="selectedProjectDeadline" class="col-sm-9">
                  {{ formatDate(selectedProjectDeadline) || " N/A" }}
                </dd>
              </dl>
            </div>
            <div v-if="activeTab === 'log'">
              <div v-if="projectLogs.length > 0">
                <ul class="log-list">
                  <li v-for="log in projectLogs" :key="log.id" class="log-item">
                    {{ t("projects.onDate") }}
                    <strong>{{ formatDate(log.changed_at) }}</strong>,
                    <strong>{{ log.changed_by }}</strong>
                    {{ t("projects.changedTheField") }}
                    "<strong>{{ log.field }}</strong>"
                    {{ t("projects.from") }}
                    "<strong>{{ log.old_value }}</strong>"
                    {{ t("projects.to") }}
                    "<strong>{{ log.new_value }}</strong>".
                  </li>
                </ul>
              </div>
              <div v-else>
                <p>{{ t("projects.noLogsAvailable") }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <argon-button variant="secondary" @click="closeDescriptionModal">
          {{ t("projects.close") }}
        </argon-button>
      </template>
    </ArgonModal>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeMount, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import Swal from "sweetalert2";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonMultipleSelect from "@/components/ArgonMultipleSelect.vue";

import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
} from "@/utils/permissions.js";

const store = useStore();
const { t } = useI18n();
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

console.log("props.projects:", props.projects);

const userData = computed(() => store.getters.user);
const isOwner = computed(() => store.getters.isOwner);

const loadingTaskId = ref(null);

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
  store.dispatch("getCompanyUsers");
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

const departmentOptions = computed(() => {
  return store.getters.departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
  }));
});

// تعريف المتغيرات الجديدة لتخزين بيانات المشروع
const selectedProjectName = ref("");
const selectedDescription = ref(""); // لتخزين وصف المشروع
const selectedProjectStartDate = ref(null);
const selectedProjectDeadline = ref(null);
const selectedProjectCreationDate = ref(null);
const selectedProjectId = ref(null);
const showDescriptionModal = ref(false);
const projectLogs = ref([]); // غير مستخدم حالياً
const departmentIds = ref([]);
// const departmentNames = ref([]);
const activeTab = ref("info"); // علامة تبويب البداية
// const employees = ref([]); // غير مستخدم حالياً

const toggleStatus = async (projectId) => {
  try {
    console.log(`Project ID: ${projectId}`);
    // قم بتنفيذ تحديث الحالة هنا (إرسال الطلب إلى الـ API أو تحديث Vuex)
    // مثال على تحديث الحالة في Vuex:
    const project = {
      id: projectId,
      company_id: 0, // استخدم الشركة الحالية
    };
    const response = await store.dispatch("updateProjectStatus", project);

    console.log("result:", response);
    // عرض إشعار النجاح
    if (response.status === 200) {
      Swal.fire({
        icon: "success",
        title: t("projects.statusUpdatedSuccessfully"),
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      await store.dispatch("fetchProjects");
    }
  } catch (error) {
    console.error("Error updating status:", error);
    Swal.fire({
      icon: "error",
      title: t("projects.errorUpdatingStatus"),
      text: error.message,
    });
  }
};

const componentKey = ref(0);

const showEditPopup = ref(false);
const currentEditingProjectId = ref(null);
const selectedManager = ref(null);
const selectedViceManager = ref(null);

const selectedProject = ref(null); // غير مستخدم حالياً

const currentLanguage = computed(() => store.getters.currentLanguage);

const dataFromApi = computed(() => store.getters.dataFromApi);

const employeeOptions = computed(() => {
  return dataFromApi.value.map((employee) => ({
    value: employee.id,
    label: `${employee.first_name ?? employee.name ?? ''} ${employee.last_name ?? ''}`.trim(),
  }));
});

const openEditModal = (Project) => {
  const departmentIds = Project.department_name
    .map((departmentName) => {
      const department = store.getters.departments.find(
        (d) => d.name.toLowerCase() === departmentName.toLowerCase()
      );
      if (!department) {
        console.warn(
          `Department "${departmentName}" not found in store.departments`
        );
      }
      return department ? department.id : null;
    })
    .filter((id) => id !== null); // إزالة القيم null
  selectedProject.value = { ...Project };
  selectedManager.value = Project.leader_id || null; // تأكد من أن الخاصية صحيحة
  console.log("selectedManager.value:", selectedManager.value);
  console.log("Project:", Project);
  selectedProject.value = {
    ...Project,
    departmentIds: departmentIds,
    departmentNames: Project.department_name,
  };
  showEditPopup.value = true;
  currentEditingProjectId.value = Project.id;
};

const closeEditPopup = () => {
  showEditPopup.value = false;
  selectedProject.value = null;
  currentEditingProjectId.value = null;
  selectedManager.value = null;
  selectedViceManager.value = null;
  departmentIds.value = [];
};

const isLoading = ref(false);

const updateProject = async () => {
  isLoading.value = true;

  // تجهيز البيانات التي سيتم إرسالها
  const ProjectData = {
    ...selectedProject.value,
    // leader_id: selectedManager.value,
    department_ids: selectedProject.value.departmentIds,
  };

  try {
    console.log("ProjectData:", ProjectData);

    const result = await store.dispatch("updateProject", ProjectData);

    if (result.status === 200) {
      // تحديث بيانات الموظفين
      Swal.fire({
        icon: "success",
        title: t("projects.projectUpdatedSuccessfully"),
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
      title: t("projects.errorUpdatingProject"),
      text: error.message,
    });
  } finally {
    isLoading.value = false;
  }
};

const confirmDelete = (Project) => {
  Swal.fire({
    title: t("projects.deleteConfirmationTitle"),
    text: t("projects.deleteConfirmationText"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("projects.delete"),
    cancelButtonText: t("projects.close"),
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
    Swal.fire({
      icon: "success",
      title: t("projects.projectDeletedSuccessfully"),
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    Swal.fire({
      icon: "error",
      title: t("projects.errorDeletingProject"),
      text: error.message,
    });
  }
};

const getProjectLogs = async (ProjectId) => {
  try {
    loadingTaskId.value = ProjectId; // تحديد الرقم المعرف للمهمة المحددة

    const response = await store.dispatch("fetchProjectLogs", ProjectId);
    if (response.status === 200) {
      console.log("Project logs fetched successfully:", response.data);
      projectLogs.value = response.data.revisions;
    } else {
      console.error("Failed to fetch logs, status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching project logs:", error);
  } finally {
    loadingTaskId.value = null; // تحديد الرقم المعرف للمهمة المحددة
  }
};

const openDescriptionModal = async (Project) => {
  // if (!Project || typeof Project !== 'object') {
  //   console.error("Invalid project data:", Project);
  //   return;
  // }
  selectedProjectName.value = Project.name; // تعيين اسم المشروع
  selectedDescription.value = Project.desc; // تعيين وصف المشروع
  selectedProjectStartDate.value = Project.start_date; // تعيين تاريخ بدء المشروع
  selectedProjectDeadline.value = Project.deadline; // تعيين تاريخ انتهاء المشروع
  selectedProjectCreationDate.value = Project.created_at; // تعيين تاريخ إنشاء المشروع
  selectedProjectId.value = Project.id;
  await getProjectLogs(Project.id);
  showDescriptionModal.value = true; // إظهار المودال
};

watch(
  () => projectLogs.value,
  (newLogs) => {
    console.log("Updated logs:", newLogs);
  }
);

const closeDescriptionModal = () => {
  showDescriptionModal.value = false; // إغلاق المودال
  selectedProjectName.value = "";
  selectedDescription.value = "";
  selectedProjectStartDate.value = null;
  selectedProjectDeadline.value = null;
  selectedProjectCreationDate.value = null;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(
    currentLanguage.value,
    options
  );
};

// will be updated in the future

// const confirmRemoveDepartment = async (Project, departmentName) => {
//   Swal.fire({
//     title: t("deleteConfirmationTitle"),
//     text: t("deleteConfirmationText"),
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonText: t("delete"),
//     cancelButtonText: t("close"),
//   }).then(async (result) => {
//     if (result.isConfirmed) {
//       await removeDepartment(Project.id, departmentName);
//     }
//   });
// };

// const removeDepartment = async (ProjectId, departmentName) => {
//   try {
//     await store.dispatch("removeDepartment", { ProjectId, departmentName });
//     await store.dispatch("fetchProjects");
//     componentKey.value += 1;
//     Swal.fire({
//       icon: "success",
//       title: t("projectDeletedSuccessfully"),
//       showConfirmButton: false,
//       timer: 1500,
//       timerProgressBar: true,
//     });
//   } catch (error) {
//     console.error("Error removing department:", error);
//     Swal.fire({
//       icon: "error",
//       title: "Error removing department",
//       text: error.message,
//     });
//   }
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
  text-align: center;
  /* جعل النصوص في رأس الجدول في المنتصف */
}

/* تأثير hover على الصفوف */
.table tbody tr:hover {
  background: #f1f1f1;
}

.table td,
.table th {
  vertical-align: middle;
  text-align: center;
  /* جعل جميع النصوص في الأعمدة في المنتصف */
}

/* تنسيق الـ Modal */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
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
  right: 10px;
  /* اجعل الأيقونة في أقصى اليمين */
  top: 50%;
  /* محاذاة رأسية */
  transform: translateY(-50%) scale(0.8);
  /* تصحيح المحاذاة العمودية وتقليل الحجم */
  position: absolute;
  /* تثبيت الأيقونة بالنسبة للحاوية */
  cursor: pointer;
  color: #4caf50;
  /* لون الموقع الأساسي */
  opacity: 0;
  /* الإخفاء الافتراضي */
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  /* تأثير عند التبديل */
}

.hover-icon:hover {
  color: #4caf50;
  /* لون الموقع عند التمرير */
}

td:hover .hover-icon {
  opacity: 1;
  /* إظهار الأيقونة عند التمرير */
  transform: translateY(-50%) scale(1);
  /* إرجاع الحجم الطبيعي */
}

/* تحسين الحاوية */
.d-flex.position-relative {
  position: relative;
  /* تهيئة الحاوية للأيقونة */
  padding-right: 30px;
  /* إضافة مساحة للأيقونة */
}

/* تصميم الـ tabs */
.custom-tabs {
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

.custom-tabs .nav-item {
  margin-right: 1rem;
}

.custom-tabs .nav-link {
  display: flex;
  align-items: center;
  color: #a9ca5c;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background-color: transparent;
  transition:
    color 0.3s ease,
    background-color 0.3s ease;
}

.custom-tabs .nav-link.active {
  color: #ffffff;
  /* نص أبيض */
  border-radius: 5px;
  background-color: #a9ca5c;
  /* خلفية أخضر فاتح */
}

.custom-tabs .nav-link:hover {
  color: #ffffff;
  /* نص أبيض عند التمرير */
  background-color: #a9ca5c;
  /* خلفية أخضر فاتح عند التمرير */
}

.tab-content {
  padding: 1rem;
  background-color: #ffffff;
  /* اللون الأبيض */
  border-radius: 0.5rem;
  /* حواف ناعمة */
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(70vh - 200px);
  /* لضمان ظهور المحتويات بشكل جيد */
}

.modal-body {
  padding: 0.2rem;
  background-color: #ffffff;
  /* اللون الأبيض */
  border-radius: 0.5rem;
  /* حواف ناعمة */
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 200px);
  /* لضمان ظهور المحتويات بشكل جيد */
  max-width: calc(100vw - 2rem);
}

/* تنسيق قائمة التعريفية داخل التبويب Info */
.modal-body dl.row {
  margin-bottom: 0;
}

.modal-body dt {
  font-weight: 600;
  text-align: right;
  padding-right: 1rem;
}

.modal-body dd {
  margin-left: 0;
  text-align: left;
  /* محاذاة النصوص إلى اليسار لتحسين القراءة */
}

.log-list {
  padding: 0;
  margin: 0;
  list-style-type: disc;
  /* أو circle، أو square، إلخ */
  padding-left: 1rem;
  /* لتظهر النقط يسارًا */
}

.log-item {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #333;
}

.log-item strong {
  color: #4caf50;
  /* لون النص البارز */
}

.hover-effect {
  transition: color 0.3s ease;
}

.hover-effect:hover {
  color: #a7c858;
  text-decoration: underline;
}

/* تنسيق المحددات المختارة (roles & departments) */
.selected-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  margin-top: 5px;
}

.selected-option {
  display: inline-flex;
  align-items: center;
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  position: relative;
  font-size: 11px;
  color: #333;
}

.selected-option:hover {
  background-color: #dee2e6;
}

.btn-remove {
  margin-left: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #dc3545;
  padding: 0;
}

.btn-remove:hover {
  color: #a71d2a;
}
</style>
