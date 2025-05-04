<!-- src/views/RoutineTask.vue -->
<script setup>
import { ref, computed, onBeforeMount, watch, onMounted } from "vue";
import { useStore } from "vuex";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
import ReportedTaskTable from "@/views/components/ReportedTaskTable.vue";

const store = useStore();

const userData = computed(() => store.getters.user);
const departments = computed(() => store.getters.departments);

const formattedDepartments = computed(() => {
  return departments.value.map((department) => ({
    value: department.id,
    label: department.name,
  }));
});

import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
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

// const dataFromApi = computed(() => store.getters.dataFromApi);

// const employeeOptions = computed(() => {
//   return dataFromApi.value.map((employee) => ({
//     value: employee.id,
//     label: employee.name,
//   }));
// });

const showAlert = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showSuccess = ref(false);
const routineTaskName = ref(""); // تعديل المتغيرات
const showPopup = ref(false);
const routineTasksReport = ref([]); // تعديل المتغيرات
const notReportedTasks = ref([]);
const evaluatedTasks = ref([]);
const componentKey = ref(0);
const body = document.getElementsByTagName("body")[0];
const isLoading = ref(false);
const routineTaskDescription = ref(""); // تعديل المتغيرات
const startDate = ref("");
const fromDate = ref("");
const toDate = ref("");
const isNotReportedLoading = ref(false); // متغير تحميل خاص بـ Not Reported Tasks
const searchQuery = ref("");
const selectedDepartmentForNotReported = ref([]);
const dynamicDepartmentsForNotReported = ref([]);

const selectedManager = ref("");
const taskType = ref("");
const dayOfMonth = ref("");
const deptId = ref("");
const taskTypeOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "last_day_of_month", label: "Last Day of Month" },
];

const recurrentDays = ref([]);

// دالة لإضافة أو إزالة اليوم من المصفوفة
const toggleRecurrentDay = (dayValue, isChecked) => {
  if (isChecked) {
    if (!recurrentDays.value.includes(dayValue)) {
      recurrentDays.value.push(dayValue);
    }
  } else {
    const index = recurrentDays.value.indexOf(dayValue);
    if (index > -1) {
      recurrentDays.value.splice(index, 1);
    }
  }
};

watch(
  () => recurrentDays.value,
  (newVal) => {
    console.log("Recurrent Days:", newVal);
  }
);

// غلق المودال
const closePopup = () => {
  showPopup.value = false;
  routineTaskName.value = "";
  routineTaskDescription.value = "";
  startDate.value = "";
  fromDate.value = "";
  toDate.value = "";
  selectedManager.value = "";
  taskType.value = "";
  dayOfMonth.value = "";
  deptId.value = "";
  recurrentDays.value = [];
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

  await fetchTasksReports();
  await fetchNotReportedTasks();
  await fetchEvaluatedTasks();
});

const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

const selectedDateForNotReported = ref(new Date().toISOString().split("T")[0]);

const reportActiveTab = ref(
  sessionStorage.getItem("reportActiveTab") || "reported"
);

const setActiveTab = (tab) => {
  reportActiveTab.value = tab;
  sessionStorage.setItem("reportActiveTab", tab);
  console.log(reportActiveTab.value);
};

watch(
  () => reportActiveTab.value,
  () => {
    // Reset the date when tab switches
    const today = new Date().toISOString().split("T")[0];
    if (reportActiveTab.value === "reported") {
      selectedDate.value = today;
    } else {
      selectedDateForNotReported.value = today;
    }
  }
);

const fetchNotReportedTasks = async (
  date = selectedDateForNotReported.value
) => {
  selectedDateForNotReported.value = date;
  isNotReportedLoading.value = true;

  try {
    const response = await store.dispatch("fetchNotReportedTasks", date);
    console.log("response fetchNotReportedTasks:", response);

    if (response.status === 200) {
      notReportedTasks.value = store.getters.notReportedTasks.tasks;
      console.log(
        "response fetchNotReportedTaskssssssss:",
        notReportedTasks.value
      );


      buildDynamicDepartments();


      console.log("notReportedTasks:", notReportedTasks.value);
      componentKey.value += 1;
    }
  } catch (error) {
    showAlert.value = true;
    errorMessage.value = t("generalError");
  } finally {
    isNotReportedLoading.value = false;
  }
};

const fetchEvaluatedTasks = async (date = selectedDateForNotReported.value) => {
  selectedDateForNotReported.value = date;
  isNotReportedLoading.value = true;

  try {
    const response = await store.dispatch("fetchEvaluatedTasks", date);
    console.log("response fetchEvaluatedTasks:", response);

    if (response.status === 200) {
      evaluatedTasks.value = store.getters.evaluatedTasks.data;
      console.log(
        "response fetchEvaluatedTasksسسسسسسسس:",
        evaluatedTasks.value
      );
      buildDynamicDepartments();

      componentKey.value += 1;
    }
  } catch (error) {
    showAlert.value = true;
    errorMessage.value = t("generalError");
  } finally {
    isNotReportedLoading.value = false;
  }
};

const fetchTasksReports = async (date = selectedDateForNotReported.value) => {
  selectedDateForNotReported.value = date;
  isNotReportedLoading.value = true;

  try {
    const response = await store.dispatch("fetchTaskReports", date);
    console.log("response routineTasksReportttttttttttttt:", response);

    if (response.status === 200) {
      routineTasksReport.value = store.getters.routineTasksReports.reports;
      console.log(
        "response routineTasksReportttttttttttttt:",
        routineTasksReport.value
      );
      buildDynamicDepartments();

      componentKey.value += 1;
    }
  } catch (error) {
    showAlert.value = true;
    errorMessage.value = t("generalError");
  } finally {
    isNotReportedLoading.value = false;
  }
};

watch(
  () => store.getters.routineTasksReports.reports,
  (newData) => {
    routineTasksReport.value = [...newData];
    componentKey.value += 1;
  }
);

// For storing selected departments in Not Reported tab
// const selectedDepartmentForNotReported = ref([]);

// Function that builds the unique departments from `notReportedTasks`
function buildDynamicDepartments() {
  const uniqueDepartments = new Map();

  if (reportActiveTab.value === "not_reported") {
    notReportedTasks.value.forEach((task) => {
      if (task.department && !uniqueDepartments.has(task.department.id)) {
        uniqueDepartments.set(task.department.id, {
          id: task.department.id,
          name: task.department.name,
        });
      }
    });
  } else if (reportActiveTab.value === "evaluated_Task") {
    evaluatedTasks.value.forEach((task) => {
      if (task.department && !uniqueDepartments.has(task.department.id)) {
        uniqueDepartments.set(task.department.id, {
          id: task.department.id,
          name: task.department.name,
        });
      }
    });
  } else if (reportActiveTab.value === "reported") {
    routineTasksReport.value.forEach((task) => {
      if (task.daily_task.department && !uniqueDepartments.has(task.daily_task.department.id)) {
        uniqueDepartments.set(task.daily_task.department.id, {
          id: task.daily_task.department.id,
          name: task.daily_task.department.name,
        });
      }
    });
  }

  dynamicDepartmentsForNotReported.value = Array.from(uniqueDepartments.values());
}

// 1) Watch when user switches tabs
watch(
  () => reportActiveTab.value,
  (newVal) => {
    if (newVal === "not_reported" || newVal === "evaluated_Task" || newVal === "reported") {
      buildDynamicDepartments();
    } else {
      dynamicDepartmentsForNotReported.value = [];
    }
  }
);

// 2) Watch notReportedTasks
watch(
  () => notReportedTasks.value,
  () => {
    if (reportActiveTab.value === "not_reported") {
      buildDynamicDepartments();
    }
  },
  { deep: true }
);

// 3) Watch evaluatedTasks
watch(
  () => evaluatedTasks.value,
  () => {
    if (reportActiveTab.value === "evaluated_Task") {
      buildDynamicDepartments();
    }
  },
  { deep: true }
);

// 4) Watch tasksReports
watch(
  () => routineTasksReport.value,
  () => {
    if (reportActiveTab.value === "reported") {
      buildDynamicDepartments();
    }
  },
  { deep: true }
);



// console.log("dynamicDepartmentsForNotReported:", dynamicDepartmentsForNotReported.value);

const currentLanguage = computed(() => store.getters.currentLanguage);

const t = (key) => {
  return translations[currentLanguage.value][key];
};

const applyFilter = () => {
  console.log(
    "Applying filter for date:",
    reportActiveTab.value === "not_reported"
      ? selectedDateForNotReported.value
      : selectedDate.value
  );

  if (reportActiveTab.value === "not_reported") {
    isNotReportedLoading.value = true;
    fetchNotReportedTasks(selectedDateForNotReported.value);
  }

  if (reportActiveTab.value === "evaluated_Task") {
    isNotReportedLoading.value = true;
    fetchEvaluatedTasks(selectedDateForNotReported.value);
  }

  if (reportActiveTab.value === "reported") {
    isNotReportedLoading.value = true;
    fetchTasksReports(selectedDateForNotReported.value);
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
    routineTaskDeleted: "Routine Task deleted successfully.",
    routineTaskAdded: "Routine Task added successfully.",
    deleteConfirmationTitle: "Delete Routine Task",
    deleteConfirmationText:
      "Are you sure you want to delete this Routine Task?",
    delete: "Delete",
    addRoutineTask: "Add Routine Task",
    routineTaskName: "Routine Task Name",
    description: "Description",
    close: "Close",
    create: "Create",
    reportedTasksTable: "Reported Routine Tasks",
    routineTaskNameRequired: "Please enter the routine task name.",
    routineTaskAddedError:
      "An error occurred while adding the routine task. Please try again later.",
    from: "From",
    to: "To",
    routineTaskManager: "Routine Task Manager",
    assignManager: "Assign Manager",
    enterDescription: "Enter Description",
    enterRoutineTaskName: "Enter Routine Task Name",
    createRoutineTask: "Create Routine Task",
    saving: "Saving...",
    noRoutineTasks: "No routine tasks found.",
    createee: "Create your routine task ",
    inactive: "Inactive",
    active: "Active",
    advancedSettings: "Advanced Settings",
    taskNumber: "Task Number",

    taskType: "Task Type",
    selectTaskType: "Select Task Type",
    recurrentDays: "Recurrent Days",
    enterRecurrentDays: "Enter number of recurrent days",
    dayOfMonth: "Day of Month",
    enterDayOfMonth: "Enter day of the month ex: 1, 2,....31",
    department: "Department",
    selectDepartment: "Select Department",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    enterStartDate: "Enter start date",
    startDate: "Start Date",

    status: "Status",
    allTypes: "All Types",
    allStatuses: "All Statuses",
    allDepartments: "All Departments",
    weekly: "Weekly",
    monthly: "Monthly",
    last_day_of_month: "Last Day of Month",
    daily: "Daily",
    applyFilters: "Apply Filters",
    resetFilters: "Reset Filters",
    selectAll: "Select All",
    departmentsSelected: "Departments Selected",
    filterByDate: "Filter by Date",
    reported: "Reported",
    not_reported: "Not Reported",
    searchPlaceholder: "Search tasks...",
    evaluated_Task: "Evaluated Tasks",
  },
  ar: {
    addMember: "اضافة عضو",
    email: "البريد الالكتروني",
    emailExistsError:
      "هذا البريد الالكتروني مسجل بالفعل. يرجى استخدام بريد الكتروني اخر.",
    generalError: "حدث خطأ في التقديم. يرجى المحاولة مرة اخرى في وقت لاحق.",
    invalidCompanyIdOrUserId: "معرف الشركة أو معرف المستخدم غير صحيح.",
    routineTaskDeleted: "تم حذف المهمة الروتينية بنجاح.",
    routineTaskAdded: "تم اضافة المهمة الروتينية بنجاح.",
    deleteConfirmationTitle: "حذف المهمة الروتينية",
    deleteConfirmationText: "هل تريد حذف هذه المهمة الروتينية؟",
    delete: "حذف",
    addRoutineTask: "اضافة مهمة روتينية",
    routineTaskName: "اسم المهمة الروتينية",
    description: "وصف المشروع",
    close: "اغلاق",
    create: "اضافة",
    reportedTasksTable: "تقارير المهام الروتينية",
    routineTaskNameRequired: "يرجى ادخال اسم المهمة الروتينية.",
    routineTaskAddedError:
      "حدث خطأ في اضافة المهمة الروتينية. يرجى المحاولة مرة اخرى في وقت لاحق.",
    from: "من",
    to: "إلى",
    routineTaskManager: "مدير المهمة الروتينية",
    assignManager: "تعيين المدير",
    enterDescription: "ادخال الوصف",
    enterRoutineTaskName: "ادخال اسم المهمة الروتينية",
    createRoutineTask: "اضافة مهمة روتينية",
    saving: "يتم الحفظ...",
    noRoutineTasks: "لا يوجد مهام روتينية.",
    createee: "انشئ مهامك الروتينية ",
    inactive: "غير نشط",
    active: "نشط",
    advancedSettings: "الإعدادات المتقدمة",
    taskNumber: "رقم المهمة",

    taskType: "نوع المهمة",
    selectTaskType: "اختر نوع المهمة",
    recurrentDays: "أيام التكرار",
    enterRecurrentDays: "ادخل عدد أيام التكرار",
    dayOfMonth: "يوم الشهر",
    enterDayOfMonth: "ادخل يوم الشهر مثل 1, 2,....31",
    department: "قسم",
    selectDepartment: "اختر القسم",
    sunday: "الاحد",
    monday: "الاثنين",
    tuesday: "الثلاثاء",
    wednesday: "الاربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
    enterStartDate: "ادخل تاريخ البدء",
    startDate: "تاريخ البدء",

    status: "حالة",
    allTypes: "جميع النوايات",
    allStatuses: "جميع الحالات",
    allDepartments: "جميع القسوم",
    weekly: "اسبوعي",
    monthly: "شهري",
    last_day_of_month: "اخر يوم من الشهر",
    daily: "يومي",
    applyFilters: "تطبيق التصفيات",
    resetFilters: "اعادة تعيين التصفيات",
    selectAll: "اختر الكل",
    departmentsSelected: "اقسام محددة",
    filterByDate: "تصفية حسب التاريخ",
    reported: "تقرير",
    not_reported: "لم يتم التقرير",
    searchPlaceholder: "...ابحث هنا",
    evaluated_Task: "المهام المقيدة",
  },
};

const daysOfWeek = [
  { label: t("sunday"), value: 0 },
  { label: t("monday"), value: 1 },
  { label: t("tuesday"), value: 2 },
  { label: t("wednesday"), value: 3 },
  { label: t("thursday"), value: 4 },
  { label: t("friday"), value: 5 },
  { label: t("saturday"), value: 6 },
];

// التعامل مع تغيير الصفحة
const handlePageChange = (page) => {
  fetchTasksReports(page);
};

const today = new Date().toISOString().split("T")[0];
const selectedDate = ref(today);

// Fetch departments on mount
onMounted(async () => {
  await store.dispatch("fetchDepartments");
  selectedDate.value = today;
  selectedDateForNotReported.value = today;
});

// Define userDepartment (alias for formattedDepartments)
const userDepartment = computed(() => formattedDepartments.value);

// Selected departments for filtering
const selectedDepartments = ref([]);
// const selectedDepartmentForNotReported = ref([]);

// Toggle "Select All" functionality
const toggleAllDepartments = (event) => {
  if (event.target.checked) {
    // Select all departments
    selectedDepartments.value = userDepartment.value.map((dept) => ({
      id: dept.value,
      name: dept.label,
    }));
  } else {
    // Deselect all departments
    selectedDepartments.value = [];
  }
};

// const toggleAllDepartmentsForNotReported = (event) => {
//   if (event.target.checked) {
//     // Select all departments
//     selectedDepartmentForNotReported.value = userDepartment.value.map((dept) => ({
//       id: dept.value,
//       name: dept.label,
//     }));
//   } else {
//     // Deselect all departments
//     selectedDepartmentForNotReported.value = [];
//   }
// };

// Check if all departments are selected
const areAllDepartmentsSelected = computed(() => {
  return selectedDepartments.value.length === userDepartment.value.length;
});

// Clear all departments
const clearAllDepartments = () => {
  selectedDepartments.value = [];
};

// Reset filters
const resetFilters = () => {
  // Clear department selections for both tabs
  // selectedDepartments.value = [];
  selectedDepartmentForNotReported.value = [];

  // Reset date for the active tab
  const today = new Date().toISOString().split("T")[0];
  if (reportActiveTab.value === "reported") {
    selectedDate.value = today;
  } else {
    selectedDateForNotReported.value = today;
  }

  // Rebuild departments for the active tab
  if (reportActiveTab.value === "not_reported" || reportActiveTab.value === "evaluated_Task" || reportActiveTab.value === "reported") {
    buildDynamicDepartments();
  } else {
    // If the user goes back to "reported", we can clear out the dynamic list
    dynamicDepartmentsForNotReported.value = [];
  }

  // Finally apply the filter
  applyFilter();
};


// // Filter departments for not reported tasks
// const uniqueDepartments = new Set();

// selectedDepartmentForNotReported.value = notReportedTasks.value.filter((dept) => {
//   const id = dept.department?.id;

//   if (!uniqueDepartments.has(id)) {
//     uniqueDepartments.add(id);
//     return true; // Include this department
//   }
//   return false; // Exclude this department
// }).map((dept) => ({
//   id: dept.department?.id,
//   name: dept.department?.name,
// }));

// const uniqueDepartmentsForNotReported = computed(() => {
//   return [...selectedDepartmentForNotReported.value];
// });

// console.log("uniqueDepartmentsForNotReported:", uniqueDepartmentsForNotReported.value);

// const searchMatch = (task) => {
//   const query = searchQuery.value.toLowerCase();
//   const taskName = (task.daily_task.task_name || "").toLowerCase();
//   const taskNo = (task.daily_task.task_no || "").toLowerCase();

//   return taskName.includes(query) || taskNo.includes(query);
// };

// For reported tasks: Add safety checks for `task.name`
const filteredTasks = computed(() => {
  const query = searchQuery.value.toLowerCase();

  return routineTasksReport.value.filter((task) => {
    const taskName = (task.daily_task.task_name || "").toLowerCase();
    const taskNo = (task.daily_task.task_no || "").toLowerCase();
    
    // Department match: if the user hasn't selected any department,
    // all departments are shown; otherwise, check if the task's department is selected
    const departmentMatch =
      selectedDepartmentForNotReported.value.length === 0 ||
      selectedDepartmentForNotReported.value.some(
        (dept) => dept.id === task.daily_task.department?.id
      );

    // Combine text-search filter with department filter
    return (taskName.includes(query) || taskNo.includes(query)) && departmentMatch;
  });
});

//task_no
// For non-reported tasks: Add safety checks for `task.name` or `task.description`
// In your <script setup>:
const filteredNotReportedTasks = computed(() => {
  const query = searchQuery.value.toLowerCase();
  
  return notReportedTasks.value.filter((task) => {
    const taskName = (task.daily_task.task_name || "").toLowerCase();
    const taskNo = (task.daily_task.task_no || "").toLowerCase();
    
    // Department match: if the user hasn't selected any department,
    // all departments are shown; otherwise, check if the task's department is selected
    const departmentMatch =
      selectedDepartmentForNotReported.value.length === 0 ||
      selectedDepartmentForNotReported.value.some(
        (dept) => dept.id === task.department?.id
      );

    // Combine text-search filter with department filter
    return (taskName.includes(query) || taskNo.includes(query)) && departmentMatch;
  });
});


// const filteredNotReportedTasksByDepartment = computed(() => {
//   // const query = searchQuery.value.toLowerCase();
//   return notReportedTasks.value.filter((task) => {
//     const taskDepartment = task.daily_task.department?.department_name || "";
//     return taskDepartment.includes(selectedDepartment.value.toLowerCase());
//   });
// });

// console.log("filteredNotReportedTasksByDepartment:", filteredNotReportedTasksByDepartment.value);

const filteredEvaluatedTasks = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return evaluatedTasks.value.filter((task) => {
    const taskName = (task.daily_task.task_name || "").toLowerCase();
    const taskNo = (task.daily_task.task_no || "").toLowerCase();

     // Department match: if the user hasn't selected any department,
    // all departments are shown; otherwise, check if the task's department is selected
    const departmentMatch =
      selectedDepartmentForNotReported.value.length === 0 ||
      selectedDepartmentForNotReported.value.some(
        (dept) => dept.id === task.department?.id
      );

      
      return (taskName.includes(query) || taskNo.includes(query)) && departmentMatch;
    });
});
</script>

<template>
  <div class="py-1 container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header pb-0">
            <p class="mb-0 font-weight-bold">{{ t("reportedTasksTable") }}</p>

            <div class="row g-2 align-items-center">
              <!-- Tabs -->
              <div class="col">
                <ul class="nav custom-tabs flex-nowrap overflow-x-auto">
                  <li class="nav-item">
                    <argon-button
                      class="nav-link"
                      :class="{ active: reportActiveTab === 'reported' }"
                      @click="setActiveTab('reported')"
                    >
                      {{ t("reported") }}
                    </argon-button>
                  </li>
                  <li class="nav-item">
                    <argon-button
                      class="nav-link"
                      :class="{ active: reportActiveTab === 'not_reported' }"
                      @click="setActiveTab('not_reported')"
                    >
                      {{ t("not_reported") }}
                    </argon-button>
                  </li>
                  <li class="nav-item">
                    <argon-button
                      class="nav-link"
                      :class="{ active: reportActiveTab === 'evaluated_Task' }"
                      @click="setActiveTab('evaluated_Task')"
                    >
                      {{ t("evaluated_Task") }}
                    </argon-button>
                  </li>
                </ul>
              </div>

              <!-- Search -->
              <div class="col-12 col-md-auto">
                <div class="input-group" style="max-width: 100%">
                  <input
                    type="text"
                    class="form-control"
                    :placeholder="t('searchPlaceholder')"
                    v-model="searchQuery"
                  />
                </div>
              </div>

              <!-- Filter Button -->
              <div class="col-12 col-md-4 text-end">
                <button
                  class="btn btn-link"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#filterCollapse"
                >
                  <i class="fas fa-filter"></i>
                </button>
              </div>
            </div>
            <!-- Filter Panel -->
            <div class="collapse" id="filterCollapse">
              <div class="card card-body">
                <div class="row">
                  <!-- Filter by Department (shown only in 'reported' tab) -->
                  <div
                    class="col-md-6 mb-3"
                  >
                    <label class="form-label">{{ t("department") }}</label>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        id="departmentDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        :aria-label="
                          selectedDepartments.length === 0
                            ? 'All Departments'
                            : selectedDepartments.length === 1
                              ? selectedDepartments[0].name
                              : `${selectedDepartments.length} Departments Selected`
                        "
                      >
                        {{
                          selectedDepartments.length === 0
                            ? t("allDepartments")
                            : selectedDepartments.length === 1
                              ? selectedDepartments[0].name
                              : `${selectedDepartments.length} ${t("departmentsSelected")}`
                        }}
                      </button>
                      <ul
                        class="dropdown-menu w-100"
                        aria-labelledby="departmentDropdown"
                      >
                        <!-- Select All Checkbox -->
                        <li class="px-2">
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              id="selectAllDepartments"
                              :checked="areAllDepartmentsSelected"
                              @change="toggleAllDepartments"
                            />
                            <label
                              class="form-check-label"
                              for="selectAllDepartments"
                            >
                              {{ t("selectAll") }}
                            </label>
                          </div>
                        </li>
                        <li class="px-2">
                          <button
                            class="btn btn-link text-danger"
                            @click="clearAllDepartments"
                          >
                            {{ t("clearAll") }}
                          </button>
                        </li>
                        <li><hr class="dropdown-divider" /></li>

                        <!-- Department Checkboxes -->
                        <!-- <li
                          v-for="department in userDepartment"
                          v-show="reportActiveTab === 'reported'"
                          :key="department.value"
                          class="px-2"
                        >
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              :id="'department-' + department.value"
                              :value="{
                                id: department.value,
                                name: department.label,
                              }"
                              v-model="selectedDepartments"
                            />
                            <label
                              class="form-check-label"
                              :for="'department-' + department.value"
                            >
                              {{ department.label }}
                            </label>
                          </div>
                        </li> -->
                        <li
                          v-for="department in dynamicDepartmentsForNotReported"
                          v-show="reportActiveTab === 'not_reported' || reportActiveTab === 'evaluated_Task' || reportActiveTab === 'reported'"
                          :key="department.id"
                          class="px-2"
                        >
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              :id="'notreported-department-' + department.id"
                              :value="department"
                              v-model="selectedDepartmentForNotReported"
                            />
                            <label
                              class="form-check-label"
                              :for="'notreported-department-' + department.id"
                            >
                              {{ department.name }}
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Filter by Specific Date -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ t("filterByDate") }}</label>
                    <div v-if="reportActiveTab === 'reported'">
                      <input
                        type="date"
                        class="form-control"
                        v-model="selectedDateForNotReported"
                        @change="applyFilter"
                      />
                    </div>
                    <div v-if="reportActiveTab === 'not_reported'">
                      <input
                        type="date"
                        class="form-control"
                        v-model="selectedDateForNotReported"
                        @change="applyFilter"
                      />
                    </div>
                    <div v-if="reportActiveTab === 'evaluated_Task'">
                      <input
                        type="date"
                        class="form-control"
                        v-model="selectedDateForNotReported"
                        @change="applyFilter"
                      />
                    </div>
                  </div>
                </div>

                <!-- Reset Filters -->
                <div class="d-flex justify-content-end">
                  <button class="btn btn-secondary" @click="resetFilters">
                    {{ t("resetFilters") }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- alert for errors and success -->
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

            <ReportedTaskTable
              v-else
              :routineTasksReport="filteredTasks"
              :notReportedTasks="filteredNotReportedTasks"
              :evaluatedTasks="filteredEvaluatedTasks"
              :reportActiveTab="reportActiveTab"
              :isNotReportedLoading="isNotReportedLoading"
              :selectedDateForNotReported="selectedDateForNotReported"
              :selectedDate="selectedDate"
              :key="componentKey"
              @page-changed="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Routine Task Modal -->
  <div v-if="showPopup" class="popup-overlay">
    <transition name="modal-fade">
      <ArgonModal
        v-if="showPopup"
        :title="t('createRoutineTask')"
        @close="closePopup"
        class="routine-task-modal"
      >
        <template #default>
          <div class="modal-content-scroll">
            <div class="form-group mb-3">
              <label class="form-label">{{ t("routineTaskName") }}:</label>
              <input
                v-model="routineTaskName"
                class="form-control"
                :placeholder="t('enterRoutineTaskName')"
              />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("description") }}:</label>
              <textarea
                v-model="routineTaskDescription"
                class="form-control"
                :placeholder="t('enterDescription')"
              ></textarea>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("taskType") }}:</label>
              <argon-select
                v-model="taskType"
                :options="taskTypeOptions"
                :placeholder="t('selectTaskType')"
                class="form-control"
              />
            </div>

            <div v-show="taskType === 'weekly'" class="form-group mb-3">
              <label class="form-label">{{ t("recurrentDays") }}:</label>
              <div class="d-flex flex-wrap">
                <div
                  v-for="day in daysOfWeek"
                  :key="day.value"
                  class="form-check me-3"
                >
                  <argon-checkbox
                    :id="'day-' + day.value"
                    :name="'recurrentDays'"
                    :value="day.value"
                    :modelValue="recurrentDays"
                    @update:modelValue="
                      (checked) => toggleRecurrentDay(day.value, checked)
                    "
                  >
                    {{ day.label }}
                  </argon-checkbox>
                </div>
              </div>
            </div>

            <div v-show="taskType === 'monthly'" class="form-group mb-3">
              <label class="form-label">{{ t("dayOfMonth") }}:</label>
              <input
                type="number"
                v-model="dayOfMonth"
                class="form-control"
                :placeholder="t('enterDayOfMonth')"
                min="1"
                max="31"
              />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("department") }}:</label>
              <argon-select
                v-model="deptId"
                :options="formattedDepartments"
                :placeholder="t('selectDepartment')"
                class="form-control"
              />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("startDate") }}:</label>
              <input
                type="date"
                v-model="startDate"
                class="form-control"
                :placeholder="t('enterStartDate')"
              />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("from") }}:</label>
              <input type="time" v-model="fromDate" class="form-control" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">{{ t("to") }}:</label>
              <input type="time" v-model="toDate" class="form-control" />
            </div>
          </div>
        </template>

        <template #footer>
          <argon-button
            variant="success"
            @click="addRoutineTask"
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
  padding: 12px;
  margin-top: 10px;
  background-color: #f9f9f9;
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
  max-height: 80vh;
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

.routine-task-modal .modal-header,
.routine-task-modal .modal-footer {
  flex-shrink: 0;
}

.routine-task-modal .modal-body {
  flex: 1;
}

/* Ensure Swal appears above other elements */
.swal2-container {
  z-index: 100000 !important;
}

.swal-above-modal {
  z-index: 100001 !important;
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
  color: #ffffff; /* نص أبيض */
  border-radius: 5px;
  background-color: #a9ca5c; /* خلفية أخضر فاتح */
}

.custom-tabs .nav-link:hover {
  color: #ffffff;
  background-color: #a9ca5c;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .custom-tabs {
    overflow-x: auto;
    white-space: nowrap;
  }
  .nav-item {
    display: inline-block;
    float: none;
  }
  .input-group {
    max-width: 100% !important;
  }
}
</style>
