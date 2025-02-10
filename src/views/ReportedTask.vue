// src/views/RoutineTask.vue

<script setup>
import { ref, computed, onBeforeMount, watch, onMounted } from "vue";
import { useStore } from "vuex";
// import ArgonInput from "@/components/ArgonInput.vue";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
// import LanguageSwitcher from "@/views/components/LanguageSwitcher.vue";
import ReportedTaskTable from "@/views/components/ReportedTaskTable.vue";
// import ArgonSwitch from "@/components/ArgonSwitch.vue";
// import Swal from "sweetalert2";

const store = useStore();

// const emit = defineEmits(['toggle-tasks']);
// const showAllTasks = ref(false);

// const toggleTasks = () => {
//   showAllTasks.value = !showAllTasks.value;
//   console.log(showAllTasks.value);
//   emit('toggle-tasks', showAllTasks.value);
// };

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
  // hasPermission,
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

console.log("employeeOptions:", employeeOptions.value);

// const isOwner = computed(() => store.getters.isOwner);

// const canCreateRoutineTask = computed(
//   () => hasPermission(permissions.value, "create-dailytask") // تعديل صلاحية
// );

const showAlert = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showSuccess = ref(false);
const routineTaskName = ref(""); // تعديل المتغيرات
const showPopup = ref(false);
const routineTasksReport = ref([]); // تعديل المتغيرات
const notReportedTasks = ref([]);
const componentKey = ref(0);
const body = document.getElementsByTagName("body")[0];
const isLoading = ref(false);
const routineTaskDescription = ref(""); // تعديل المتغيرات
const startDate = ref("");
const fromDate = ref("");
const toDate = ref("");
const isNotReportedLoading = ref(false); // متغير تحميل خاص بـ Not Reported Tasks

// const showAdvancedSettings = ref(false);
const selectedManager = ref("");
// const routineTaskStatus = ref(false); // تعديل المتغيرات
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

// مراقبة التغييرات في `recurrentDays`
watch(
  () => recurrentDays.value,
  (newVal) => {
    console.log("Recurrent Days:", newVal);
    // يمكنك إضافة أي عملية أخرى هنا بناءً على التغييرات
  }
);

// const pagination = ref({
//   total: 0,
//   current_page: 1,
//   per_page: 10,
//   last_page: 1,
//   next_page_url: null,
//   prev_page_url: null,
// });

// التحكم في الإعدادات المتقدمة
// const toggleAdvancedSettings = () => {
//   showAdvancedSettings.value = !showAdvancedSettings.value;
// };

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

  await fetchTasksReports(); // تعديل الدالة
  await fetchNotReportedTasks(); // تعديل الدالة
});

const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

// const currentUserId = computed(() => store.getters.userId);
// console.log("currentUserId:", currentUserId.value);

const selectedDateForNotReported = ref(new Date().toISOString().split("T")[0]); // التاريخ الافتراضي اليوم

// watch(
//   () => selectedDateForNotReported,
//   (newVal) => {
//     selectedDateForNotReported.value = newVal;
//   }
// );

const reportActiveTab = ref(
  sessionStorage.getItem("reportActiveTab") || "reported"
);

const setActiveTab = (tab) => {
  reportActiveTab.value = tab;
  sessionStorage.setItem("reportActiveTab", tab); // حفظ التبويب الحالي
console.log(reportActiveTab.value);

};

watch(
  () => reportActiveTab.value,
  () => {
    // Reset the date when tab switches
    const today = new Date().toISOString().split("T")[0];
    if (reportActiveTab.value === 'reported') {
      selectedDate.value = today;
    } else {
      selectedDateForNotReported.value = today;
    }
  }
);


const fetchNotReportedTasks = async (
  date = selectedDateForNotReported.value
) => {
  selectedDateForNotReported.value = date; // تحديث التاريخ المختار
  isNotReportedLoading.value = true; // تشغيل اللودر قبل جلب البيانات

  // isLoading.value = true;

  try {
    const response = await store.dispatch("fetchNotReportedTasks", date); // Pass the date parameter
    console.log("response fetchNotReportedTasks:", response);

    if (response.status === 200) {
      notReportedTasks.value = store.getters.notReportedTasks.tasks;
      console.log(
        "response fetchNotReportedTaskssssssss:",
        notReportedTasks.value
      );

      console.log("notReportedTasks:", notReportedTasks.value);
      componentKey.value += 1;
    }
  } catch (error) {
    showAlert.value = true;
    errorMessage.value = t("generalError");
  } finally {
    isNotReportedLoading.value = false; // إيقاف اللودر بعد جلب البيانات
  }
};

const fetchTasksReports = async (page = 1) => {
  // تعديل الدالة
  isLoading.value = true;

  try {
    const response = await store.dispatch("fetchTaskReports", page); // تعديل الـ action
    console.log("response:", response);
    if (response.status === 200) {
      routineTasksReport.value = store.getters.routineTasksReports.reports; // تعديل الـ getter
      console.log("routineTasksReport:", response);
      // pagination.value = store.getters.routineTasksReports.pagination; // تعديل الـ getter
      componentKey.value += 1;
    }
  } catch (error) {
    showAlert.value = true;
    errorMessage.value = t("generalError");
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => store.getters.routineTasksReports.tasks, // تعديل الـ getter
  (newData) => {
    routineTasksReport.value = [...newData];
    componentKey.value += 1; // إعادة تحميل المكون عند حدوث أي تحديث في البيانات
  }
);

const currentLanguage = computed(() => store.getters.currentLanguage);

const t = (key) => {
  return translations[currentLanguage.value][key];
};

// const openPopup = () => {
//   showPopup.value = true;
// };

// const addRoutineTask = async () => {
//   isLoading.value = true;
//   const routineTask = {
//     task_name: routineTaskName.value,
//     description: routineTaskDescription.value,
//     start_date: startDate.value,
//     task_type: taskType.value,
//     recurrent_days: recurrentDays.value,
//     day_of_month: dayOfMonth.value,
//     from: fromDate.value,
//     to: toDate.value,
//     dept_id: deptId.value,
//     assigned_to: selectedManager.value,
//   };

//   console.log("routineTask:", routineTask);

//   try {
//     const response = await store.dispatch("addRoutineTask", routineTask);
//     if (response.status === 201) {
//       Swal.fire({
//         icon: "success",
//         title: t("routineTaskAdded"),
//         showConfirmButton: false,
//         timer: 1500,
//         timerProgressBar: true,
//       });
//       closePopup();
//       await fetchRoutineTasks();
//       componentKey.value += 1;
//     }
//   } catch (error) {
//     console.log("error:", error);
//       // استخراج الأخطاء من الرد

//       Swal.fire({
//         icon: "warning",
//         title: t("errorOccurred"),
//         html: error,
//         showConfirmButton: true,
//         backdrop: 'rgba(0,0,0,0.5)',
//         heightAuto: false,
//         customClass: {
//           popup: 'swal-above-modal',
//         }
//       });
//     } finally {
//     isLoading.value = false;
//   }
// };

const applyFilter = () => {
  console.log("Applying filter for date:", 
    (reportActiveTab.value === 'not_reported' ? selectedDateForNotReported.value : selectedDate.value)
  );

  // Fetch tasks based on selected date and active tab
  if (reportActiveTab.value === 'not_reported') {
    isNotReportedLoading.value = true;
    fetchNotReportedTasks(selectedDateForNotReported.value); // Fetch tasks for 'not_reported' tab
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
    routineTaskDeleted: "Routine Task deleted successfully.", // تعديل الترجمة
    routineTaskAdded: "Routine Task added successfully.", // تعديل الترجمة
    deleteConfirmationTitle: "Delete Routine Task", // تعديل الترجمة
    deleteConfirmationText:
      "Are you sure you want to delete this Routine Task?", // تعديل الترجمة
    delete: "Delete",
    addRoutineTask: "Add Routine Task", // تعديل الترجمة
    routineTaskName: "Routine Task Name", // تعديل الترجمة
    description: "Description",
    close: "Close",
    create: "Create",
    reportedTasksTable: "Reported Routine Tasks", // تعديل الترجمة
    routineTaskNameRequired: "Please enter the routine task name.", // تعديل الترجمة
    routineTaskAddedError:
      "An error occurred while adding the routine task. Please try again later.", // تعديل الترجمة
    from: "From",
    to: "To",
    routineTaskManager: "Routine Task Manager", // تعديل الترجمة
    assignManager: "Assign Manager",
    enterDescription: "Enter Description",
    enterRoutineTaskName: "Enter Routine Task Name", // تعديل الترجمة
    createRoutineTask: "Create Routine Task", // تعديل الترجمة
    saving: "Saving...",
    noRoutineTasks: "No routine tasks found.", // تعديل الترجمة
    createee: "Create your routine task ", // تعديل الترجمة
    inactive: "Inactive", // إضافة ترجمة للحالة
    active: "Active",
    advancedSettings: "Advanced Settings", // إضافة ترجمة
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

    // active: 'Active',
    // inactive: 'Inactive',
    applyFilters: "Apply Filters",
    resetFilters: "Reset Filters",
    selectAll: "Select All",
    departmentsSelected: "Departments Selected",
    filterByDate: "Filter by Date",
    reported: "Reported",
    not_reported: "Not Reported",

    // التحكم في الإعدادات المتقدمة
  },
  ar: {
    addMember: "اضافة عضو",
    email: "البريد الالكتروني",
    emailExistsError:
      "هذا البريد الالكتروني مسجل بالفعل. يرجى استخدام بريد الكتروني اخر.",
    generalError: "حدث خطأ في التقديم. يرجى المحاولة مرة اخرى في وقت لاحق.",
    invalidCompanyIdOrUserId: "معرف الشركة أو معرف المستخدم غير صحيح.",
    routineTaskDeleted: "تم حذف المهمة الروتينية بنجاح.", // تعديل الترجمة
    routineTaskAdded: "تم اضافة المهمة الروتينية بنجاح.", // تعديل الترجمة
    deleteConfirmationTitle: "حذف المهمة الروتينية", // تعديل الترجمة
    deleteConfirmationText: "هل تريد حذف هذه المهمة الروتينية؟", // تعديل الترجمة
    delete: "حذف",
    addRoutineTask: "اضافة مهمة روتينية", // تعديل الترجمة
    routineTaskName: "اسم المهمة الروتينية", // تعديل الترجمة
    description: "وصف المشروع",
    close: "اغلاق",
    create: "اضافة",
    reportedTasksTable: "تقارير المهام الروتينية", // تعديل الترجمة
    routineTaskNameRequired: "يرجى ادخال اسم المهمة الروتينية.", // تعديل الترجمة
    routineTaskAddedError:
      "حدث خطأ في اضافة المهمة الروتينية. يرجى المحاولة مرة اخرى في وقت لاحق.", // تعديل الترجمة
    from: "من",
    to: "إلى",
    routineTaskManager: "مدير المهمة الروتينية", // تعديل الترجمة
    assignManager: "تعيين المدير",
    enterDescription: "ادخال الوصف",
    enterRoutineTaskName: "ادخال اسم المهمة الروتينية", // تعديل الترجمة
    createRoutineTask: "اضافة مهمة روتينية", // تعديل الترجمة
    saving: "يتم الحفظ...",
    noRoutineTasks: "لا يوجد مهام روتينية.", // تعديل الترجمة
    createee: "انشئ مهامك الروتينية ", // تعديل الترجمة
    inactive: "غير نشط", // إضافة ترجمة للحالة
    active: "نشط",
    advancedSettings: "الإعدادات المتقدمة", // إضافة ترجمة
    taskNumber: "رقم المهمة",

    taskType: "نوع المهمة",
    selectTaskType: "اختر نوع المهمة",
    recurrentDays: "أيام التكرار",
    enterRecurrentDays: "ادخل عدد أيام التكرار",
    dayOfMonth: "يوم الشهر",
    enterDayOfMonth: "ادخل يوم الشهر مثل 1, 2,....31",
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
    department: "قسم",
    allTypes: "جميع النوايات",
    allStatuses: "جميع الحالات",
    allDepartments: "جميع القسوم",
    weekly: "اسبوعي",
    monthly: "شهري",
    daily: "يومي",
    last_day_of_month: "اخر يوم من الشهر",
    // active: 'نشط',
    // inactive: 'غير نشط',
    applyFilters: "تطبيق التصفيات",
    resetFilters: "اعادة تعيين التصفيات",
    selectAll: "اختر الكل",
    departmentsSelected: "اقسام محددة",
    filterByDate: "تصفية حسب التاريخ",
    reported: "تقرير",
    not_reported: "لم يتم التقرير",

    // taskType: 'نوع المهمة',
    // status: 'الحالة',
    // department: 'القسم',
    // allTypes: 'جميع النوايات',
    // allStatuses: 'جميع الحالات',
    // allDepartments: 'جميع القسوم',

    // active: 'نشط',
    // inactive: 'غير نشط',
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
onMounted(async () => {
  await store.dispatch("fetchDepartments");
  selectedDate.value = today;
  selectedDateForNotReported.value = today; // Optional if already initialized
});


// Define userDepartment (alias for formattedDepartments)
const userDepartment = computed(() => formattedDepartments.value);

// Selected departments for filtering
const selectedDepartments = ref([]);
const selectedDate = ref(new Date().toISOString().split("T")[0]);  // Today's date as default

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

// Check if all departments are selected
const areAllDepartmentsSelected = computed(() => {
  return selectedDepartments.value.length === userDepartment.value.length;
});

// Update the resetFilters function
const resetFilters = () => {
  selectedDepartments.value = [];

  // Reset the date filter to today based on the active tab
  const today = new Date().toISOString().split("T")[0]; // Get today's date
  if (reportActiveTab.value === 'not_reported') {
    selectedDateForNotReported.value = today;
  } else {
    selectedDate.value = today;
  }

    // Optionally, call `applyFilter` to apply the reset filter immediately
    applyFilter();
};



// Clear all departments
const clearAllDepartments = () => {
  selectedDepartments.value = [];
};

// Filtered tasks based on selected departments and date
// Update the filteredTasks computed property
const filteredTasks = computed(() => {
  return routineTasksReport.value.filter((task) => {
    // Filter by department
    const departmentMatch =
      selectedDepartments.value.length === 0 ||
      selectedDepartments.value.some(
        (dept) => dept.id === task.daily_task.department?.id
      );

    // Filter by selected date
    const taskDate = new Date(task.created_at).toISOString().split("T")[0];
    const dateMatch = !selectedDate.value || taskDate === selectedDate.value;

    return departmentMatch && dateMatch;
  });
});
</script>

<template>
  <!-- <LanguageSwitcher /> -->
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header pb-0">
            <p class="mb-0 font-weight-bold">{{ t("reportedTasksTable") }}</p>
            <div class="d-flex nav-tabs align-items-center">
              <!-- <argon-button
                v-show="canCreateRoutineTask || isOwner"
                class="ml-auto mx-2"
                @click="openPopup"
              >
                <i class="fas fa-plus"></i>
              </argon-button> -->
              <!-- Tabs Navigation -->
              <ul class="nav custom-tabs" role="ttttablist">
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
              </ul>
              <button
                class="btn btn-link ms-auto"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#filterCollapse"
                aria-expanded="false"
                aria-controls="filterCollapse"
              >
                <i class="fas fa-filter"></i>
              </button>
            </div>
            <div class="collapse" id="filterCollapse">
              <div class="card card-body">
                <div class="row">
                  <!-- Filter by Department -->
                  <div v-if="reportActiveTab === 'reported'" class="col-md-6 mb-3">
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
                        <li
                          v-for="department in userDepartment"
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
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Filter by Specific Date -->
                  <!-- Filter by Specific Date -->
<div class="col-md-6 mb-3">
  <label class="form-label">{{ t("filterByDate") }}</label>
  <div v-if="reportActiveTab === 'reported'">
    <input
      type="date"
      class="form-control"
      v-model="selectedDate"
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
</div>

                </div>

                <!-- Reset Filters -->
                <div class="d-flex justify-content-end">
                  <button class="btn btn-secondary" @click="resetFilters">
                    {{ t("resetFilters") }}
                  </button>
                </div>
                <!-- <div class="d-flex justify-content-end mb-3">
      <button
        class="btn btn-sm btn-primary"
        @click="showAllTasks = !showAllTasks"
      >
        {{ showAllTasks ? "Show Today's Tasks" : "Show All Tasks" }}
      </button>
    </div> -->
                <!-- <div class="d-flex align-items-center">
              <button
                class="btn btn-sm btn-primary ms-auto"
                @click="toggleTasks"
              >
                {{ showAllTasks ? "Show Today's Tasks" : "Show All Tasks" }}
              </button>
            </div> -->
              </div>
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

            <!-- <div
              v-else-if="allroutineTasks.length === 0"
              class="d-flex justify-content-center py-5 flex-column align-items-center"
            >
              <h5>{{ t("noRoutineTasks") }}</h5>
              <p>
                {{ t("createee") }}
              </p>
            </div> -->
            <ReportedTaskTable
              v-else
              :routineTasksReport="filteredTasks"
              :notReportedTasks="notReportedTasks"
              :reportActiveTab="reportActiveTab"
              :isNotReportedLoading="isNotReportedLoading"
              :key="componentKey"
              @page-changed="handlePageChange"
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
        :title="t('createRoutineTask')"
        @close="closePopup"
        class="routine-task-modal"
      >
        <template #default>
          <div class="modal-content-scroll">
            <!-- غلاف للمحتوى -->
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

            <!-- الحقول الجديدة -->
            <div class="form-group mb-3">
              <label class="form-label">{{ t("taskType") }}:</label>
              <argon-select
                v-model="taskType"
                :options="taskTypeOptions"
                :placeholder="t('selectTaskType')"
                class="form-control"
              />
            </div>

            <!-- <div class="form-group mb-3">
            <label class="form-label">{{ t("recurrentDays") }}:</label>
            <input
              type="date"
              v-model="recurrentDays"
              class="form-control"
              :placeholder="t('enterRecurrentDays')"
              min="1"
            />
          </div> -->

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
                min="1"
                max="31"
              />
            </div>

            <!-- زر الإعدادات المتقدمة -->
            <div class="d-flex align-items-center">
              <!-- <ArgonButton
              class="btn btn-link mb-3"
              @click="toggleAdvancedSettings"
            >
              {{ t("advancedSettings") }} 
            </ArgonButton> -->

              <!-- <div class="d-flex align-items-center ms-auto">
              <span class="me-2">{{ t("inactive") }}</span> 
              <argon-switch
                class="custom-switch-modal"
                v-model:checked="routineTaskStatus"
                aria-label="Routine Task Status"
                role="switch"
              ></argon-switch>
              <span class="ms-2">{{ t("active") }}</span> 
            </div> -->
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("from") }}:</label>
              <input type="time" v-model="fromDate" class="form-control" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">{{ t("to") }}:</label>
              <input type="time" v-model="toDate" class="form-control" />
            </div>

            <!-- الإعدادات المتقدمة -->
            <!-- <transition name="fade">
            <div v-if="showAdvancedSettings" class="advanced-settings mx-3">
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
          </transition> -->
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

/* src/views/RoutineTask.vue */

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
  max-height: 80vh; /* تحديد الحد الأقصى للارتفاع */
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
  color: #ffffff; /* نص أبيض عند التمرير */
  background-color: #a9ca5c; /* خلفية أخضر فاتح عند التمرير */
}
</style>
