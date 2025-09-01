<template>
  <div class="card">
    <div class="card-header pb-0 d-flex justify-content-between align-items-center">
      <h6 class="mb-0 font-weight-bold">{{ t("employeesTable") }}</h6>
    </div>
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-3" :key="componentKey">
        <!-- Spinner عند عدم وجود بيانات -->
        <div v-if="!dataFromApi || dataFromApi.length === 0" class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- عرض الجدول -->
        <table v-else class="table align-items-center table-hover mb-0">
          <thead class="thead-light">
            <tr>
              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                {{ t("name") }}
              </th>
              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                {{ t("email") }}
              </th>
              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                {{ t("roles") }}
              </th>
              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                {{ t("department") }}
              </th>
              <th class="text-secondary opacity-7"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in dataFromApi" :key="employee.id">
              <td>
                <div class="d-flex px-2 py-1">
                  <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-0 text-sm">{{ employee.name }} {{ employee.last_name }}</h6>
                  </div>
                </div>
              </td>
              <td>
                <p class="text-xs text-secondary mb-0">{{ employee.email }}</p>
              </td>
              <td>
                <div v-if="employee.roles.length" class="selected-options">
                  <span v-for="roleName in employee.roles" :key="roleName" class="selected-option">
                    {{ roleName }}
                    <button v-show="canEditUser || isOwner" type="button" class="btn-remove"
                      @click="confirmRemoveRole(employee, roleName)">
                      ×
                    </button>
                  </span>
                </div>
                <p v-else class="text-xs font-weight-bold mb-0">No Role</p>
              </td>
              <td>
                <div v-if="employee.departments.length" class="selected-options">
                  <span v-for="departmentName in employee.departments" :key="departmentName" class="selected-option">
                    {{ departmentName }}
                    <button v-show="canEditUser || isOwner" type="button" class="btn-remove"
                      @click="confirmRemoveDepartment(employee, departmentName)">
                      ×
                    </button>
                  </span>
                </div>
                <p v-else class="text-xs font-weight-bold mb-0">
                  No Department
                </p>
              </td>
              <td class="align-middle">
                <a v-show="canEditUser || isOwner" href="javascript:;"
                  class="text-secondary font-weight-bold text-xs me-2" @click="openEditModal(employee)">
                  {{ t("edit") }}
                </a>
                <a v-show="canDeleteUser || isOwner" href="javascript:;" class="text-danger font-weight-bold text-xs"
                  @click="confirmDelete(employee)">
                  {{ t("delete") }}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- <div v-if="isLoading" class="spinner-border text-primary m-3" role="status">
        <span class="sr-only">Loading...</span>
      </div> -->
    </div>

    <!-- الـ Modal -->
    <div v-if="isModalOpen" class="popup-overlay">
      <transition name="modal-fade">
        <ArgonModal v-if="isModalOpen" :title="t('editEmployee')" @close="closeModal">
          <template #default>

            <div class="d-flex gap-3 mb-3">
              <div class="w-50">
                <label class="form-label">{{ t("firstName") }} <span class="text-danger">*</span>:</label>
                <argon-input v-model="selectedEmployee.name" :placeholder="t('firstName')"
                  :class="{ 'is-invalid': !selectedEmployee.name || !selectedEmployee.name.trim() }"
                  required />
                <div v-if="!selectedEmployee.name || !selectedEmployee.name.trim()" class="invalid-feedback">
                  {{ t("firstNameRequired") }}
                </div>
              </div>
              <div class="w-50">
                <label class="form-label">{{ t("lastName") }} <span class="text-danger">*</span>:</label>
                <argon-input v-model="selectedEmployee.last_name" :placeholder="t('lastName')"
                  :class="{ 'is-invalid': !selectedEmployee.last_name || !selectedEmployee.last_name.trim() }" required />
                <div v-if="!selectedEmployee.last_name || !selectedEmployee.last_name.trim()" class="invalid-feedback">
                  {{ t("lastNameRequired") }}
                </div>
              </div>
            </div>

            <label class="form-label">{{ t("roles") }}:</label>
            <argon-multiple-select v-model="selectedEmployee.rolesIds" :model-names="selectedEmployee.rolesNames"
              :options="formattedRoles" :placeholder="t('roles')" class="form-control mb-3" />

            <label class="form-label">{{ t("department") }}:</label>
            <argon-multiple-select v-model="selectedEmployee.departmentId"
              :model-names="selectedEmployee.departmentNames" :options="formattedDepartments"
              :placeholder="t('department')" class="form-control" />
          </template>

          <template #footer>
            <argon-button variant="success" @click="saveChanges" :disabled="isLoading || !isFormValid">
              <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              {{ isLoading ? t("saving") : t("saveChanges") }}
            </argon-button>
            <argon-button variant="secondary" @click="closeModal">{{
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

    <argon-alert v-if="successMessage" color="success" dismissible class="m-3">
      {{ successMessage }}
    </argon-alert>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonMultipleSelect from "@/components/ArgonMultipleSelect.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import Swal from "sweetalert2";
import {
  savePermissionsToLocalStorage,
  loadPermissionsFromLocalStorage,
  hasPermission,
} from "@/utils/permissions.js";

const store = useStore();

const userData = computed(() => store.getters.user);
const isOwner = computed(() => store.getters.isOwner);
console.log("isOwner:", isOwner.value);

// استدعاء الصلاحيات من localStorage بناءً على المستخدم الحالي
const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.user?.id) || {}
);

// في حال عدم وجود صلاحيات في localStorage، جلبها من Vuex
if (!permissions.value || Object.keys(permissions.value).length === 0) {
  const userRolePermissions = userData.value?.user?.role?.permissions[0] || {};
  permissions.value = userRolePermissions;

  savePermissionsToLocalStorage(permissions.value, userData.value?.user?.id);
}

// استخدام الصلاحيات للتحكم في ظهور الأزرار
const canEditUser = computed(() =>
  hasPermission(permissions.value, "edit-user")
);
const canDeleteUser = computed(() =>
  hasPermission(permissions.value, "delete-user")
);

// الحصول على الأدوار من الـ Vuex Store
const roles = computed(() => store.getters.roles);

console.log("roles:", roles.value);
const formattedRoles = computed(() => {
  return roles.value.map((role) => ({
    value: role.role_id,
    label: role.role_name,
  }));
});

console.log("formattedRoles:", formattedRoles.value);

// الحصول على الأقسام من الـ Vuex Store
const departments = computed(() => store.getters.departments);
console.log("departments:", departments.value);

const formattedDepartments = computed(() => {
  return departments.value.map((department) => ({
    value: department.id,
    label: department.name,
  }));
});

// الترجمات
const translations = {
  en: {
    employeesTable: "Employees Table",
    name: "Name",
    email: "Email",
    roles: "Roles",
    editUser: "Edit User",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    saveChanges: "Save Changes",
    firstName: "First Name",
    lastName: "Last Name",
    firstNameRequired: "First Name is required",
    lastNameRequired: "Last Name is required",
    saving: "Saving...",
    updateSuccess: "Data updated successfully!",
    deleteConfirmationText: "Are you sure you want to delete this user?",
    deleteRoleFromUser:
      "Are you sure you want to delete this role from this user?",
    deleteSuccess: "User deleted successfully!",
    department: "Department",
    position: "Position",
    editEmployee: "Edit Employee",
    deleteConfirmationTitle: "Are you sure?",
    unassignRoleSuccess: "Role unassigned successfully!",
    assignRoleSuccess: "Role assigned successfully!",
    assignRole: "Assign Role",
    deleteDepartmentFromUser:
      "Are you sure you want to remove this department from this user?",
    owner: "Owner",
    noRole: "No Role",
    nameRequired: "Name is required",
  },
  ar: {
    employeesTable: "جدول الموظفين",
    name: "الاسم",
    email: "البريد الإلكتروني",
    roles: "الدور",
    editUser: "تعديل المستخدم",
    edit: "تعديل",
    delete: "حذف",
    close: "إغلاق",
    saveChanges: "حفظ التغييرات",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    firstNameRequired: "الاسم الأول مطلوب",
    lastNameRequired: "الاسم الأخير مطلوب",
    saving: "جارٍ الحفظ...",
    updateSuccess: "تم تحديث البيانات بنجاح!",
    deleteConfirmationText: "هل تريد حذف هذا المستخدم؟",
    deleteRoleFromUser: "هل تريد حذف هذا الدور من هذا المستخدم؟",
    deleteSuccess: "تم حذف المستخدم بنجاح!",
    department: "القسم",
    position: "منصب",
    editEmployee: "تعديل الموظف",
    deleteConfirmationTitle: "هل أنت متأكد؟",
    unassignRoleSuccess: "تم فصل الدور بنجاح!",
    assignRoleSuccess: "تم تعيين الدور بنجاح!",
    assignRole: "تعيين الدور",
    deleteDepartmentFromUser: "هل تريد حذف هذا القسم من هذا المستخدم؟",
    owner: "مالك",
    noRole: "لا دور",
    nameRequired: "الاسم مطلوب",
  },
};

const currentLanguage = computed(() => store.getters.currentLanguage);
const t = (key) => translations[currentLanguage.value][key];

const isModalOpen = ref(false);
const selectedEmployee = ref({
  name: "",
  last_name: "",
  departmentId: [],
  departmentNames: [],
  rolesIds: [],
  rolesNames: [],
});

// Computed property for form validation
const isFormValid = computed(() => {
  return selectedEmployee.value.name &&
    selectedEmployee.value.name.trim() &&
    selectedEmployee.value.last_name &&
    selectedEmployee.value.last_name.trim();
});

const isLoading = ref(false);
const successMessage = ref("");

// استخدام getter `dataFromApi`
const dataFromApi = computed(() => store.getters.dataFromApi);

// دالة فتح الـ Modal وتعبئة بيانات الموظف
const openEditModal = async (employee) => {
  // تأكد من أن الأدوار تم جلبها بالفعل
  if (store.getters.roles.length === 0) {
    await store.dispatch("fetchRoles");
  }

  // ربط أسماء الأدوار بمعرفاتها
  const roleIds = employee.roles
    .map((roleName) => {
      const role = store.getters.roles.find(
        (r) => r.role_name.toLowerCase() === roleName.toLowerCase()
      );
      if (!role) {
        console.warn(`Role "${roleName}" not found in store.roles`);
      }
      return role ? role.role_id : null;
    })
    .filter((id) => id !== null); // إزالة القيم null

  const departmentIds = employee.departments
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

  const roleNames = employee.roles; // أسماء الأدوار كما هي

  console.log("Roles from employee:", employee.roles);
  console.log("Roles from store:", store.getters.roles);
  console.log("Mapped roleIds:", roleIds);

  // Split the name into firstName and lastName
  const name = (employee.name || '')
  const last_name = (employee.last_name || '')


  selectedEmployee.value = {
    ...employee,
    name: name,
    last_name: last_name,
    rolesIds: roleIds,
    rolesNames: roleNames,
    departmentId: departmentIds,
    departmentNames: employee.departments,
  };
  isModalOpen.value = true;
  console.log("selectedEmployee.value:", selectedEmployee.value);
};

// دالة إغلاق الـ Modal
const closeModal = () => {
  isModalOpen.value = false;
  selectedEmployee.value = {
    name: "",
    last_name: "",
    departmentId: [],
    rolesIds: [],
    departmentNames: [],
    rolesNames: [],
  };
};

// دالة حفظ التغييرات
const saveChanges = async () => {
  console.log("saveChanges called");
  isLoading.value = true;
  try {
    // Validate required fields
    if (!selectedEmployee.value.name || !selectedEmployee.value.name.trim()) {
      Swal.fire({
        icon: "error",
        title: t("firstNameRequired"),
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: "swal-above-modal",
        },
      });
      return;
    }

    if (!selectedEmployee.value.last_name || !selectedEmployee.value.last_name.trim()) {
      Swal.fire({
        icon: "error",
        title: t("lastNameRequired"),
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: "swal-above-modal",
        },
      });
      return;
    }
    // إعداد البيانات للإرسال
    const payloadforName = {
      user_id: selectedEmployee.value.id,
      name: selectedEmployee.value.name,
      last_name: selectedEmployee.value.last_name,
    };

    await store.dispatch("updateUserName", payloadforName);

    const payloadForRoles = {
      user_id: selectedEmployee.value.id,
      role_ids: selectedEmployee.value.rolesIds, // الـ IDs
    };

    const payloadForDepartments = {
      user_id: selectedEmployee.value.id,
      department_ids: selectedEmployee.value.departmentId, // الـ IDs
    };

    console.log("payloadForRoles:", payloadForRoles);
    console.log("payloadForDepartments:", payloadForDepartments);

    // إرسال البيانات إلى Vuex Actions
    if (payloadForRoles.role_ids.length > 0) {
      await store.dispatch("updateRoles", payloadForRoles);
    } else {
      console.log("No roles to update");
    }

    if (payloadForDepartments.department_ids.length > 0) {
      await store.dispatch("updateDepartments", payloadForDepartments);
    } else {
      console.log("No departments to update");
    }

    // جلب البيانات الجديدة بعد التحديث
    await store.dispatch("getCompanyUsers");

    // إظهار رسالة النجاح
    Swal.fire({
      icon: "success",
      text: t("updateSuccess"),
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: "swal-above-modal",
      },
    });

    // إغلاق الـ Modal
    closeModal();
  } catch (error) {
    console.error("Error updating employee:", error);
    // إضافة رسالة خطأ إذا رغبت
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "حدث خطأ أثناء تحديث البيانات. حاول مرة أخرى!",
    });
  } finally {
    isLoading.value = false;
  }
};

const confirmRemoveDepartment = (employee, departmentName) => {
  const department = store.getters.departments.find(
    (d) => d.name.toLowerCase() === departmentName.toLowerCase()
  );

  if (!department) {
    console.warn(
      `Department "${departmentName}" not found in store.departments`
    );
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: `القسم "${departmentName}" غير موجود.`,
    });
    return;
  }
  Swal.fire({
    title: t("deleteConfirmationTitle"),
    text: t("deleteDepartmentFromUser"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("delete"),
    cancelButtonText: t("close"),
  }).then(async (result) => {
    if (result.isConfirmed) {
      await unassignDepartment(employee, department.id);
    }
  });
};

const unassignDepartment = async (employee, departmentId) => {
  console.log(
    "unassignRole called for employee:",
    employee.id,
    " and department:",
    departmentId
  );
  try {
    const data = {
      user_id: employee.id,
      department_id: departmentId,
    };
    console.log("data:", data);
    // إرسال البيانات كـ Array من معرفات الأدوار
    await store.dispatch("unassignDepartment", data);

    // جلب البيانات المحدثة بعد الإزالة
    await store.dispatch("getCompanyUsers");

    // إظهار رسالة النجاح
    Swal.fire({
      icon: "success",
      title: t("success"),
      text: t("updateSuccess"),
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: "swal-above-modal",
      },
    });
  } catch (error) {
    console.error("Error unassigning role:", error);
    // إظهار رسالة خطأ
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: t("deleteError"),
    });
  }
};

// دالة تأكيد إزالة الدور من الموظف
const confirmRemoveRole = (employee, roleName) => {
  console.error("roleName is not a string:", roleName);

  // العثور على الدور في Vuex Store بناءً على الاسم
  // العثور على الدور في Vuex Store بناءً على الاسم
  // @type {import("@/types/role").Role | undefined}
  const role = store.getters.roles.find(
    (r) => r.role_name.toLowerCase() === roleName.toLowerCase()
  );

  if (!role) {
    console.warn(`Role "${roleName}" not found in store.roles`);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: `الدور "${roleName}" غير موجود.`,
    });
    return;
  }

  Swal.fire({
    title: t("deleteConfirmationTitle"),
    text: t("deleteRoleFromUser"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("delete"),
    cancelButtonText: t("close"),
  }).then(async (result) => {
    if (result.isConfirmed) {
      await unassignRole(employee, role.role_id, role.role_name);
    }
  });
};

// دالة إزالة الدور من الموظف
const unassignRole = async (employee, roleId) => {
  console.log(
    "unassignRole called for employee:",
    employee.id,
    " and roleId:",
    roleId
  );
  try {
    const data = {
      user_id: employee.id,
      role_ids: [roleId],
    };
    // إرسال البيانات كـ Array من معرفات الأدوار
    await store.dispatch("unassignRole", data);

    // جلب البيانات المحدثة بعد الإزالة
    await store.dispatch("getCompanyUsers");

    // إظهار رسالة النجاح
    Swal.fire({
      icon: "success",
      title: t("updateSuccess"),
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: "swal-above-modal",
      },
    });
  } catch (error) {
    console.error("Error unassigning role:", error);
    // إظهار رسالة خطأ
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: t("deleteError"),
      customClass: {
        popup: "swal-above-modal",
      },
    });
  }
};

// دالة تأكيد الحذف للموظف
const confirmDelete = (employee) => {
  Swal.fire({
    title: t("deleteConfirmationTitle"),
    text: t("deleteConfirmationText"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("delete"),
    cancelButtonText: t("close"),
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteEmployee(employee.id); // إذا تم تأكيد الحذف
    }
  });
};

// دالة الحذف للموظف
const deleteEmployee = async (employeeId) => {
  console.log("deleteEmployee called with id:", employeeId);
  try {
    const data = {
      user_id: employeeId,
    };
    const res = await store.dispatch("deleteEmployee", data); // استدعاء Vuex لحذف الموظف

    if (res.status === 200) {
      Swal.fire({
        icon: "success",
        title: t("deleteSuccess"),
        showConfirmButton: false,
        timer: 1500,
      });

      await store.dispatch("getCompanyUsers");
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("deleteError"),
      });
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    // إضافة رسالة خطأ إذا رغبت
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: t("deleteError"),
    });
  }
};

// جلب البيانات عند تحميل المكون
onMounted(async () => {
  await store.dispatch("fetchRoles");
  await store.dispatch("fetchDepartments");
  await store.dispatch("getCompanyUsers"); // جلب بيانات الموظفين عند تحميل المكون
});
</script>

<style scoped>
.table-responsive {
  background-color: #fff;
  border-radius: 10px;
}

/* تحسين مظهر الجدول */
.table thead th {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.table tbody tr:hover {
  background: #f1f1f1;
}

.table td,
.table th {
  vertical-align: middle;
}

/* تنسيق المحددات المختارة (roles & departments) */
.selected-options {
  display: flex;
  flex-wrap: wrap;
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

/* تنسيق الـ Modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: ease-in-out opacity 0.5s;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

/* تحسين شكل الـ spinner */
/* .spinner-border {
  width: 2rem;
  height: 2rem;
} */

/* تحسين شكل الـ Alerts */
.argon-alert {
  border-radius: 5px;
  font-size: 0.875rem;
}

/* كلاس مخصص للمودال لجعله قابلًا للتمرير */
.routine-task-modal {
  max-height: 100vh;
  /* تحديد الحد الأقصى للارتفاع */
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  /* تمكين التمرير العمودي */
  scrollbar-width: none;
  /* تحديد حجم الشريط الخلفي */
  scrollbar-color: transparent transparent;
  /* تحديد لون الشريط الخلفي والخلفية */
}

.routine-task-modal .modal-content-scroll {
  overflow-y: auto;
  /* تمكين التمرير العمودي */
  flex: 1;
  /* السماح للمحتوى بالتمدد لملء المساحة المتاحة */
  max-height: 80vh;
  /* تحديد الحد الأقصى للارتفاع */
  /* scroll-behavior: smooth;  */
  max-height: 65vh;
}

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

/* تحسين تصميم المودال الداخلي */
.routine-task-modal .modal-header,
.routine-task-modal .modal-footer {
  flex-shrink: 0;
  /* منع الانكماش */
}

.routine-task-modal .modal-body {
  flex: 1;
  /* السماح للمحتوى بالتمدد */
}

/* swal */

/* Ensure Swal appears above all other elements */
.swal2-container {
  z-index: 100000 !important;
}

.swal-above-modal {
  z-index: 100001 !important;
}
</style>
