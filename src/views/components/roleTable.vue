<template :key="componentKey">
  <div class="card-body px-0 pt-0 pb-2">
    <div class="d-flex justify-content-between align-items-center px-3 pt-3">
      <!-- عرض التنبيهات -->
      <div class="w-100 me-3">
        <argon-alert
          v-if="errorMessage"
          color="danger"
          dismissible
          class="mb-2"
        >
          {{ errorMessage }}
        </argon-alert>
        <argon-alert
          v-if="successMessage"
          color="success"
          dismissible
          class="mb-2"
        >
          {{ successMessage }}
        </argon-alert>
      </div>
    </div>
    <div class="table-responsive p-3" :key="componentKey">
      <!-- إذا لم يوجد بيانات في rolesList، عرض السبينر -->
      <div
        v-if="!props.rolesList || props.rolesList.length === 0"
        class="d-flex justify-content-center py-5"
      >
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- عرض الجدول عندما تتوفر البيانات -->
      <table v-else class="table align-items-center table-hover mb-0">
        <thead>
          <tr>
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("roleName") }}
            </th>
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("permissions") }}
            </th>
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            ></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in props.rolesList" :key="role.role_id">
            <td>
              <h6 class="mb-0 text-sm">{{ role.role_name }}</h6>
            </td>
            <td>
              <div v-if="role.permissions && role.permissions.length">
                <span class="text-sm">
                  {{
                    role.permissions.map((p) => p.permission_name).join(", ")
                  }}
                </span>
              </div>
              <div v-else>
                <span class="text-xs text-muted">{{ t("noPermissions") }}</span>
              </div>
            </td>
            <td class="align-middle">
              <a
                href="javascript:;"
                class="text-secondary font-weight-bold text-xs"
                v-show="permissions['edit-role'] || isOwner"
                @click="handleEditClick(role)"
              >
                {{ t("edit") }}
              </a>
              <!-- In the roles table row -->
              <a
                href="javascript:;"
                v-show="permissions['delete-role'] || isOwner"
                class="text-danger font-weight-bold text-xs ms-2"
                @click="confirmDelete(role)"
              >
                <!-- <template v-if="!deletingRoles[role.role_id]">
    {{ t("delete") }}
  </template> -->
                <!-- <template v-else> -->
                <span
                  v-if="deletingRoles[role.role_id]"
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ !deletingRoles[role.role_id] ? t("delete") : t("deleting") }}
                <!-- </template> -->
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- الـ Modal -->
    <div v-if="showEditPopup" class="popup-overlay">
      <transition name="modal-fade">
        <ArgonModal
          v-if="showEditPopup"
          :title="t('editEmployee')"
          @close="closeEditPopup"
          class="routine-task-modal"
        >
          <template #default>
            <div class="modal-content-scroll">
              <!-- عرض لودينج سبينر أثناء جلب البيانات -->
              <div
                v-if="isLoadingData"
                class="d-flex justify-content-center my-5"
              >
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <!-- عرض البيانات بعد الجلب -->
              <div v-else>
                <label>{{ t("name") }}:</label>
                <input
                  v-model="editRoleData.role_name"
                  class="form-control mb-3"
                />

                <label>{{ t("permissions") }}:</label>
                <div class="d-flex flex-wrap">
                  <div
                    v-for="permission in props.permissionsList"
                    :key="permission.id"
                    class="form-check me-4 mb-2"
                    style="min-width: 150px"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="`edit-permission-${permission.id}`"
                      :value="permission.id"
                      v-model="editRoleData.permissions"
                    />
                    <label
                      class="form-check-label ms-1"
                      :for="`edit-permission-${permission.id}`"
                    >
                      {{ permission.name }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <argon-button @click="saveChanges" :disabled="isSaving">
              <span
                v-if="isSaving"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              {{ isSaving ? t("saving") : t("update") }}
            </argon-button>
            <argon-button @click="closeEditPopup">{{
              t("close")
            }}</argon-button>
          </template>

          <template #title>
            <i class="fas fa-user-edit me-2"></i>
            {{ t("editEmployee") }}
          </template>
        </ArgonModal>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, ref } from "vue";
import { useStore } from "vuex";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import Swal from "sweetalert2";

const store = useStore();
const userData = computed(() => store.getters.user);
const isOwner = computed(() => store.getters.isOwner);
console.log("isOwner:", isOwner.value);

import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
  // hasPermission,
} from "@/utils/permissions.js";

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

const props = defineProps({
  rolesList: {
    type: Array,
    required: true,
  },
  permissionsList: {
    type: Array,
    required: true,
  },
});

const componentKey = ref(0);

const translations = {
  en: {
    rolesTable: "Roles Table",
    roleName: "Role Name",
    permissions: "Permissions",
    noPermissions: "No Permissions",
    edit: "Edit",
    delete: "Delete",
    editEmployee: "Edit Role",
    name: "Role Name",
    saving: "Saving...",
    update: "Update",
    close: "Close",
    updateSuccess: "Data updated successfully!",
    updateError: "Error updating data.",
    deleteConfirmationText: "Are you sure you want to delete this role?",
    deleteSuccess: "Role deleted successfully!",
    deleting: "Deleting...",
  },
  ar: {
    rolesTable: "جدول الأدوار",
    roleName: "اسم الدور",
    permissions: "الأذونات",
    noPermissions: "لا توجد أذونات",
    edit: "تعديل",
    delete: "حذف",
    editEmployee: "تعديل الدور",
    name: "اسم الدور",
    saving: "يتم الحفظ...",
    update: "تحديث",
    close: "إغلاق",
    updateSuccess: "تم تحديث البيانات بنجاح!",
    updateError: "حدث خطأ أثناء تحديث البيانات.",
    deleteConfirmationText: "هل انت متاكد من حذف هذا الدور؟",
    deleteSuccess: "تم حذف الدور بنجاح!",
    deleting: "يتم الحذف...",
  },
};

const currentLanguage = computed(() => store.getters.currentLanguage);
const t = (key) => translations[currentLanguage.value][key];

const showEditPopup = ref(false);
const isLoadingData = ref(false);
const isSaving = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const editRoleData = ref({
  role_id: null,
  role_name: "",
  permissions: [],
});

const handleEditClick = async (role) => {
  showEditPopup.value = true;
  isLoadingData.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const response = await store.dispatch("fetchselectedRole", role.role_id);
    if (response.status === 200) {
      editRoleData.value = {
        role_id: response.data.role_id,
        role_name: response.data.role_name,
        permissions: response.data.permissions.map((p) => p.permission_id),
      };
    } else {
      console.error("Error fetching selected role data:", response);
      errorMessage.value = t("updateError");
      hideAlertAfterDelay();
    }
  } catch (error) {
    console.error("Error:", error);
    errorMessage.value = t("updateError");
    hideAlertAfterDelay();
  } finally {
    isLoadingData.value = false;
  }
};

const closeEditPopup = () => {
  showEditPopup.value = false;
  editRoleData.value = {
    role_id: null,
    role_name: "",
    permissions: [],
  };
};

// وظيفة لإخفاء التنبيهات بعد 3 ثوانٍ
const hideAlertAfterDelay = () => {
  setTimeout(() => {
    errorMessage.value = "";
    successMessage.value = "";
  }, 3000);
};

const saveChanges = async () => {
  console.log("Saving changesssssssssssss:", editRoleData.value);
  isSaving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  const data = {
    id: editRoleData.value.role_id,
    name: editRoleData.value.role_name,
    permissions: editRoleData.value.permissions,
  };
  console.log("dataaaaaaaaaaa:", data);

  try {
    const response = await store.dispatch("updateRole", data);

    if (response.status === 200) {
      console.log("Role updated successfully:", response.data);
      closeEditPopup();

      Swal.fire({
        icon: "success",
        title: t("updateSuccess"),
        showConfirmButton: false,
        timer: 1500,
      });
      hideAlertAfterDelay();

      componentKey.value += 1;

      isLoadingData.value = true;

      // بعد التحديث الناجح، قم بجلب الأدوار مرة أخرى لتحديث الجدول
      await store.dispatch("fetchRoles");

      isLoadingData.value = false;
    }
  } catch (error) {
    Swal.fire({
      icon: "warning",
      title: t("errorOccurred"),
      html: error,
      showConfirmButton: true,
      backdrop: "rgba(0,0,0,0.5)",
      heightAuto: false,
      customClass: {
        popup: "swal-above-modal",
      },
    });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = (role) => {
  Swal.fire({
    title: t("deleteConfirmationText"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("delete"),
    cancelButtonText: t("close"),
    customClass: {
      popup: "swal-above-modal",
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteRole(role);
    }
  });
};

const deletingRoles = ref({});

const deleteRole = async (role) => {
  const roleId = role.role_id;

  // Set the deleting state for this specific role
  deletingRoles.value[roleId] = true;

  try {
    await store.dispatch("deleteRole", roleId);
    componentKey.value += 1;
    await store.dispatch("fetchRoles");

    Swal.fire({
      icon: "success",
      title: t("deleteSuccess"),
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: "swal-above-modal",
      },
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    Swal.fire({
      icon: "error",
      title: t("deleteError"),
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: "swal-above-modal",
      },
    });
  } finally {
    // Clear the deleting state for this role
    delete deletingRoles.value[roleId];
  }
};
</script>

<style scoped>
.table-responsive {
  background-color: #fff;
  border-radius: 10px;
}
.table thead th {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}
.table tbody tr:hover {
  background: #f8f9fa;
}
/* .spinner-border {
  width: 3rem;
  height: 3rem;
} */
/* .popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
} */
/* .modal-container {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  min-width: 400px;
  max-width: 90%;
} */

/* اعتماد انتقال modal-fade من المثال */
/* .modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
} */
/* .modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
} */

/* إضافة تنسيق لعمود النوت */
td {
  word-wrap: break-word; /* السماح للنص بالانكسار */
  white-space: pre-wrap; /* المحافظة على التنسيق والانكسار */
  max-width: 200px; /* يمكنك تخصيص العرض المناسب للعمود */
  overflow-wrap: break-word; /* السماح بانكسار النص */
}

/* تأثيرات الظهور والإخفاء */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* كلاس مخصص للمودال لجعله قابلًا للتمرير */
.routine-task-modal {
  max-height: 100vh; /* تحديد الحد الأقصى للارتفاع */
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth; /* تمكين التمرير العمودي */
  scrollbar-width: none; /* تحديد حجم الشريط الخلفي */
  scrollbar-color: transparent transparent; /* تحديد لون الشريط الخلفي والخلفية */
}

.routine-task-modal .modal-content-scroll {
  overflow-y: auto; /* تمكين التمرير العمودي */
  flex: 1; /* السماح للمحتوى بالتمدد لملء المساحة المتاحة */
  max-height: 80vh; /* تحديد الحد الأقصى للارتفاع */
  scroll-behavior: smooth;
  max-height: 65vh;
}

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

/* تحسين تصميم المودال الداخلي */
.routine-task-modal .modal-header,
.routine-task-modal .modal-footer {
  flex-shrink: 0; /* منع الانكماش */
}

.routine-task-modal .modal-body {
  flex: 1; /* السماح للمحتوى بالتمدد */
}

/* swal */

/* Ensure Swal appears above all other elements */
.swal2-container {
  z-index: 9999999999 !important;
}

.swal-above-modal {
  z-index: 9999999999 !important;
}
</style>
