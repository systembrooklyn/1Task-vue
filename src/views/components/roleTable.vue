<template :key="componentKey">
  <div class="card-body px-0 pt-0 pb-2">
    <div class="d-flex justify-content-between align-items-center px-3 pt-3">
      <!-- عرض التنبيهات -->
      <div class="w-100 me-3">
        <argon-alert v-if="errorMessage" color="danger" dismissible class="mb-2">
          {{ errorMessage }}
        </argon-alert>
        <argon-alert v-if="successMessage" color="success" dismissible class="mb-2">
          {{ successMessage }}
        </argon-alert>
      </div>
    </div>
    <div class="table-responsive p-3" :key="componentKey">
      <!-- إذا لم يوجد بيانات في rolesList، عرض السبينر -->
      <div v-if="!props.rolesList || props.rolesList.length === 0" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- عرض الجدول عندما تتوفر البيانات -->
      <table v-else class="table align-items-center table-hover mb-0">
        <thead>
          <tr>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("roleName") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("permissions") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"></th>
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
                  {{ role.permissions.map(p => p.permission_name).join(', ') }}
                </span>
              </div>
              <div v-else>
                <span class="text-xs text-muted">{{ t("noPermissions") }}</span>
              </div>
            </td>
            <td class="align-middle">
              <a href="javascript:;" class="text-secondary font-weight-bold text-xs"
                v-show="permissions['edit-role'] || isOwner"
                @click="handleEditClick(role)">
                {{ t("edit") }}
              </a>
              <a href="javascript:;"
                v-show="permissions['delete-role'] || isOwner"
                class="text-danger font-weight-bold text-xs ms-2" @click="confirmDelete(role)">
                {{ t("delete") }}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- الـ Modal -->
    <transition name="modal-fade">
      <ArgonModal v-if="showEditPopup" :title="t('editEmployee')" @close="closeEditPopup">
        <template #default>
          <!-- عرض لودينج سبينر أثناء جلب البيانات -->
          <div v-if="isLoadingData" class="d-flex justify-content-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <!-- عرض البيانات بعد الجلب -->
          <div v-else>
            <label>{{ t("name") }}:</label>
            <input v-model="editRoleData.role_name" class="form-control mb-3" />

            <label>{{ t("permissions") }}:</label>
            <div class="d-flex flex-wrap">
              <div
                v-for="permission in props.permissionsList"
                :key="permission.id"
                class="form-check me-4 mb-2"
                style="min-width: 150px;"
              >
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="`edit-permission-${permission.id}`"
                  :value="permission.id"
                  v-model="editRoleData.permissions"
                />
                <label class="form-check-label ms-1" :for="`edit-permission-${permission.id}`">
                  {{ permission.name }}
                </label>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <argon-button @click="closeEditPopup">{{ t("close") }}</argon-button>
          <argon-button @click="saveChanges" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isSaving ? t("saving") : t("update") }}
          </argon-button>
        </template>

        <template #title>
          <i class="fas fa-user-edit me-2"></i>
          {{ t("editEmployee") }}
        </template>
      </ArgonModal>
    </transition>
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

console.log( permissions.value);

// عند تحميل الصفحة لأول مرة، حفظ الصلاحيات في localStorage
onBeforeMount(() => {
  if (!permissions.value || Object.keys(permissions.value).length === 0) {
    const extractedPermissions = extractPermissionsFromAPI(userData.value?.roles);
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
        permissions: response.data.permissions.map(p => p.permission_id),
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
  console.log("Saving changes:", editRoleData.value);
  isSaving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  const data = {
    id: editRoleData.value.role_id,
    name: editRoleData.value.role_name,
    permissions: editRoleData.value.permissions,
  };

  try {
    const response = await store.dispatch("updateRole", data);

    if (response.status === 200) {
      console.log("Role updated successfully:", response.data);
      closeEditPopup();

      successMessage.value = t("updateSuccess");
      hideAlertAfterDelay();

      componentKey.value += 1;

      isLoadingData.value = true;

      // بعد التحديث الناجح، قم بجلب الأدوار مرة أخرى لتحديث الجدول
      await store.dispatch("fetchRoles");

      isLoadingData.value = false;
    } else {
      console.error("Error updating role:", response);
      errorMessage.value = t("updateError");
      hideAlertAfterDelay();
    }
  } catch (error) {
    console.error("Error updating role:", error);
    errorMessage.value = t("updateError");
    hideAlertAfterDelay();
    closeEditPopup();

  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = (role) => {
  console.log("Confirming delete for role:", role);
  // تنفيذ الحذف حسب الحاجة
  Swal.fire({
    title: t("deleteConfirmationTitle"),
    text: t("deleteConfirmationText"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("delete"),
    cancelButtonText: t("close"),
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteRole(role.role_id); // إذا تم تأكيد الحذف
    }
  });
};

const deleteRole = async (roleId) => {
  console.log("Deleting role with ID:", roleId);
  // تنفيذ الحذف حسب الحاجة
  try {
    await store.dispatch("deleteRole", roleId);
    componentKey.value += 1;
    await store.dispatch("fetchRoles");
    successMessage.value = t("deleteSuccess");
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Error deleting role:", error);
    errorMessage.value = t("deleteError");
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
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
.popup-overlay {
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
}
.modal-container {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  min-width: 400px;
  max-width: 90%;
}

/* اعتماد انتقال modal-fade من المثال */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

/* إضافة تنسيق لعمود النوت */
td {
  word-wrap: break-word; /* السماح للنص بالانكسار */
  white-space: pre-wrap; /* المحافظة على التنسيق والانكسار */
  max-width: 200px; /* يمكنك تخصيص العرض المناسب للعمود */
  overflow-wrap: break-word; /* السماح بانكسار النص */
}

</style>
