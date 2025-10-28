<template>
  <div class="card-body px-0 pt-0 pb-2" :key="componentKey">
    <div class="table-responsive p-3">
      <table class="table align-items-center table-hover mb-0">
        <thead class="thead-light">
          <tr>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("departmentName") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("assignManager") }}
            </th>
            <!-- <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("viceManager") }}
            </th> -->
            <th class="text-secondary opacity-7"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="department in props.departments" :key="department.id">
            <td>
              <div class="d-flex px-2 py-1">
                <div class="d-flex flex-column justify-content-center text-sm">
                  <h6 class="mb-0 text-sm ">{{ department.name }}</h6>
                </div>
              </div>
            </td>
            <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ department.manager_name || 'No Manager' }}
              </p>
            </td>
            <!-- <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ department.vice_manager_name || 'No Vice Manager' }}
              </p>
            </td> -->
            <td class="align-middle">
              <a href="javascript:;" v-show="permissions['edit-department'] || isOwner"
                class="text-secondary font-weight-bold text-xs me-2" @click="openEditModal(department)">
                {{ t("edit") }}
              </a>
              <a href="javascript:;" v-show="permissions['delete-department'] || isOwner"
                class="text-danger font-weight-bold text-xs" @click="confirmDelete(department)">
                {{ t("delete") }}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showEditPopup" class="popup-overlay">
      <transition name="modal-fade">
        <ArgonModal v-if="showEditPopup" :title="t('editDepartment')" @close="closeEditPopup">
          <template #default>
            <label class="form-label">{{ t("departmentName") }}:</label>
            <input v-model="selectedDepartment.name" class="form-control mb-3" />

            <div v-if="employeeOptions.length > 0" class="mb-3">
              <label class="form-label">{{ t("assignManager") }}:</label>
              <argon-select v-model="selectedManager" :options="employeeOptions" :placeholder="t('assignManager')"
                class="form-control" searchable searchPlaceholder="Search manager..." />
            </div>
            <div v-if="employees.length > 0" class="mb-3">
              <label class="form-label">{{ t("viceManager") }}:</label>
              <argon-select v-model="selectedViceManager" :options="employeeOptions" :placeholder="t('viceManager')"
                class="form-control" searchable searchPlaceholder="Search vice manager..." />
            </div>
          </template>

          <template #footer>
            <argon-button variant="success" @click="updateDepartment" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
              {{ isLoading ? t("saving") : t("update") }}
            </argon-button>
            <argon-button variant="secondary" @click="closeEditPopup">{{ t("close") }}</argon-button>
          </template>

          <template #title>
            <i class="fas fa-user-edit me-2"></i>
            {{ t("editDepartment") }}
          </template>
        </ArgonModal>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeMount } from "vue";
import { useStore } from "vuex";
import Swal from "sweetalert2";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
// import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
  // hasPermission,
} from "@/utils/permissions.js";

const store = useStore();
const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

const currentUserId = computed(() => store.getters.userId);
console.log("currentUserId:", currentUserId.value);

const props = defineProps({
  departments: {
    type: Array,
    required: true,
  },
});

const isOwner = computed(() => store.getters.isOwner);

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
    const extractedPermissions = extractPermissionsFromAPI(userData.value?.roles);
    permissions.value = extractedPermissions;
    savePermissionsToLocalStorage(permissions.value, userData.value?.id);
  }
});
// onMounted(() => {
//   store.dispatch("fetchPositions");
// });

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

const componentKey = ref(0);


onBeforeMount(async () => {
  savePermissionsToLocalStorage(permissions.value, userData.value?.user?.id);
  // fetchEmployees();
  await store.dispatch("getCompanyUsers");

});

const showEditPopup = ref(false);
// const editDepartmentName = ref("");
const currentEditingDepartmentId = ref(null);
const selectedManager = ref(null);
const selectedViceManager = ref(null);

const selectedDepartment = ref(null);
// const selectedPosition = ref(null);

console.log("props.departments:", props.departments);

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
    label: `${employee.first_name ?? employee.name ?? ''} ${employee.last_name ?? ''}`.trim(),
  }));
});

const openEditModal = (department) => {
  selectedDepartment.value = department;
  // selectedManager.value = department.managerId;
  // selectedViceManager.value = department.viceManagerId;


  showEditPopup.value = true;
};


const closeEditPopup = () => {
  showEditPopup.value = false;
  selectedDepartment.value = null;
  currentEditingDepartmentId.value = null;
};

const isLoading = ref(false);

const updateDepartment = async () => {
  isLoading.value = true;

  // تجهيز البيانات التي سيتم إرسالها
  const departmentData = {
    id: selectedDepartment.value.id,
    name: selectedDepartment.value.name,
  };



  try {

    const departmentManagerId = {
      user_id: selectedManager.value,
      department_id: selectedDepartment.value.id,
    };

    // if (departmentManagerId) {
    //   departmentData.managerId = departmentManagerId;
    // }
    console.log("departmentManagerId:", departmentManagerId);


    const result = await store.dispatch('updateDepartment', departmentData);

    if (departmentManagerId !== null) {
      await store.dispatch("assignManager", departmentManagerId);
    }

    if (result.status === 200) {
      // تحديث بيانات الموظفين
      Swal.fire({
        icon: 'success',
        title: t("departmentUpdatedSuccessfully"),
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,

      });

      closeEditPopup();
      await store.dispatch("fetchDepartments");
    } else {
      Swal.fire({
        icon: 'error',
        title: result.message,
        showConfirmButton: true,
      });
    }
  } catch (error) {
    console.error("Error updating department:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error updating department',
      text: error.message,
    });
  } finally {
    isLoading.value = false;
  }
};



// const saveChanges = async () => {
//     componentKey.value += 1;
// }

const confirmDelete = (department) => {
  Swal.fire({
    title: t("deleteConfirmationTitle"),
    text: t("deleteConfirmationText"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("delete"),
    cancelButtonText: t("close"),
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteDepartment(department.id);
    }
  });
};

const deleteDepartment = async (departmentId) => {
  console.log(departmentId);
  try {
    await store.dispatch("deleteDepartment", departmentId);
    Swal.fire({
      icon: "success",
      title: t("departmentDeletedSuccessfully"),
      showConfirmButton: false,
      timer: 1500,
    });
    await store.dispatch("fetchDepartments");
    componentKey.value += 1;
  } catch (error) {
    console.error("Error deleting department:", error);
  }
};

const translations = {
  en: {
    departmentsTable: "Departments Table",
    departmentName: "Department Name",
    edit: "Edit",
    delete: "Delete",
    deleteConfirmationTitle: "Delete Department",
    deleteConfirmationText: "Are you sure you want to delete this department?",
    close: "Close",
    saving: "Saving...",
    update: "Update",
    assignManager: "Manager",
    viceManager: "Vice Manager",
    departmentUpdatedSuccessfully: "Department updated successfully",
    departmentDeletedSuccessfully: "Department deleted successfully",
  },
  ar: {
    departmentsTable: "جدول الأقسام",
    departmentName: "اسم القسم",
    edit: "تعديل",
    delete: "حذف",
    deleteConfirmationTitle: "حذف القسم",
    deleteConfirmationText: "هل تريد حذف هذا القسم؟",
    close: "إغلاق",
    saving: "يتم الحفظ...",
    update: "تحديث",
    assignManager: "المدير",
    viceManager: "مدير مساعد",
    departmentUpdatedSuccessfully: "تم تحديث القسم بنجاح",
    departmentDeletedSuccessfully: "تم حذف القسم بنجاح",
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
}

/* تأثير hover على الصفوف */
.table tbody tr:hover {
  background: #f1f1f1;
}

.table td,
.table th {
  vertical-align: middle;
}

/* تنسيق الـ Modal */
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
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

/* .spinner-border {
  width: 2rem;
  height: 2rem;
} */

.form-label {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 5px;
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