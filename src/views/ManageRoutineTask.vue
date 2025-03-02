// src/views/ManageRoutineTask.vue

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
import ManageRoutineTaskTable from "@/views/components/ManageRoutineTaskTable.vue";
// import ArgonSwitch from "@/components/ArgonSwitch.vue";
import Swal from "sweetalert2";

onMounted(async () => {
  await store.dispatch("fetchDepartments");
  await store.dispatch("fetchProjects");
});

const store = useStore();

const userData = computed(() => store.getters.user);
const departments = computed(() => store.getters.departments);
const projects = computed(() => store.getters.projects);
console.log("projectssssssssssss:", projects.value);

const formattedDepartments = computed(() => {
  return departments.value.map((department) => ({
    value: department.id,
    label: department.name,
  }));
});

const formattedProjects = computed(() => {
  return projects.value.map((project) => ({
    value: project.id,
    label: project.name,
  }));
});

console.log("formattedProjectsssssssssss:", formattedProjects.value);

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

console.log("employeeOptions:", employeeOptions.value);

const isOwner = computed(() => store.getters.isOwner);

const canCreateRoutineTask = computed(
  () => hasPermission(permissions.value, "create-dailytask") // تعديل صلاحية
);

const showAlert = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showSuccess = ref(false);
const routineTaskName = ref(""); // تعديل المتغيرات
const showPopup = ref(false);
const allroutineTasks = ref([]); // تعديل المتغيرات
const componentKey = ref(0);
const body = document.getElementsByTagName("body")[0];
const isLoading = ref(false);
const routineTaskDescription = ref(""); // تعديل المتغيرات
const startDate = ref("");
const fromDate = ref("");
const toDate = ref("");
// const showAdvancedSettings = ref(false);
const selectedManager = ref("");
const searchQuery = ref("");

// const routineTaskStatus = ref(false); // تعديل المتغيرات
const taskType = ref("");
const dayOfMonth = ref("");
const deptId = ref("");
const projectId = ref("");
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

// Modify pagination configuration
const pagination = ref({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
});

// فلتر: نوع المهمة
const selectedTaskType = ref("");
// فلتر: حالة المهمة
const selectedStatus = ref("");
// فلتر: الأقسام المختارة
const selectedDepartments = ref([]);
// فلتر: المشروعات المختارة
const selectedProjects = ref([]);

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
  projectId.value = "";
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

  await fetchRoutineTasks(); // تعديل الدالة
});

const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

const currentUserId = computed(() => store.getters.userId);
console.log("currentUserId:", currentUserId.value);
// Modify fetchRoutineTasks to get all data
const fetchRoutineTasks = async () => {
  isLoading.value = true;
  // طلب الـ API أو Vuex
  const response = await store.dispatch("fetchAllRoutineTasks");
  if (response.status === 200) {
    // كل المهام
    allroutineTasks.value = store.getters.allRoutineTasks.tasks;
    // حساب عدد الصفحات أوّل مرة
    pagination.value.total = allroutineTasks.value.length;
    pagination.value.last_page = Math.ceil(
      allroutineTasks.value.length / pagination.value.per_page
    );
  } else {
    console.error("Error fetching tasks:", response);
  }
  isLoading.value = false;
};

const filteredTasks = computed(() => {
  // خد نسخة من المهام عشان ما تعملش تعديل على الأصل
  let tasks = [...allroutineTasks.value];

  // 1. فلتر حسب الـ taskType (لو مش فاضي)
  if (selectedTaskType.value) {
    tasks = tasks.filter((t) => t.task_type === selectedTaskType.value);
  }

  // 2. فلتر حسب حالة المهمة (active / inactive - على حسب هي متخزنة إزاي)
  //   - انتبه لطريقة تخزين الحالة في الـ API: هل هي active/inactive boolean ولا status= 'done'/'not_done'...؟
  if (selectedStatus.value) {
    if (selectedStatus.value === "active") {
      tasks = tasks.filter((t) => t.active === true);
    } else if (selectedStatus.value === "inactive") {
      tasks = tasks.filter((t) => t.active === false);
    }
    // أو لو عندك منطق مختلف للـ status، عدّله هنا
  }

  // 3. فلتر حسب الأقسام المختارة
  if (selectedDepartments.value.length > 0) {
    const selectedDeptIds = selectedDepartments.value.map((dept) => dept.id);
    tasks = tasks.filter((task) => {
      // تأكد الـ task.dept_id ضمن الـ selectedDeptIds
      return selectedDeptIds.includes(task.department?.dept_id);
    });
  }

  // 5. فلتر حسب المشروعات المختارة
  if (selectedProjects.value.length > 0) {
    const selectedProjectIds = selectedProjects.value.map(
      (project) => project.id
    );
    console.log("selectedProjectIds:", selectedProjectIds);
    tasks = tasks.filter((task) => {
      // تأكد الـ task.project_id ضمن الـ selectedProjectIds
      return selectedProjectIds.includes(task.project?.id);
    });
  }

  // search
  tasks = tasks.filter((task) => searchMatch(task));

  return tasks;
});

watch(
  () => filteredTasks.value.length,
  (newLength) => {
    // Update pagination data here (instead of inside computed)
    pagination.value.total = newLength;
    pagination.value.last_page = Math.ceil(
      newLength / pagination.value.per_page
    );

    // If current page is now out of range, reset to last valid page
    if (pagination.value.current_page > pagination.value.last_page) {
      pagination.value.current_page = pagination.value.last_page || 1;
    }
  },
  { immediate: true }
);

// Add computed for paginated data
const paginatedTasks = computed(() => {
  const start = (pagination.value.current_page - 1) * pagination.value.per_page;
  const end = start + pagination.value.per_page;
  return filteredTasks.value.slice(start, end);
});

// Update page change handler
const handlePageChange = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page;
  }
};

watch(
  () => store.getters.allRoutineTasks.tasks, // تعديل الـ getter
  (newData) => {
    allroutineTasks.value = [...newData];
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

const addRoutineTask = async () => {
  isLoading.value = true;
  const routineTask = {
    task_name: routineTaskName.value,
    description: routineTaskDescription.value,
    start_date: startDate.value,
    task_type: taskType.value,
    recurrent_days: recurrentDays.value,
    day_of_month: dayOfMonth.value,
    from: fromDate.value,
    to: toDate.value,
    dept_id: deptId.value,
    project_id: projectId.value,
    assigned_to: selectedManager.value,
  };

  console.log("routineTask:", routineTask);

  try {
    const response = await store.dispatch("addRoutineTask", routineTask);
    if (response.status === 201) {
      Swal.fire({
        icon: "success",
        title: t("routineTaskAdded"),
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      closePopup();
      await fetchRoutineTasks();
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
      backdrop: "rgba(0,0,0,0.5)",
      heightAuto: false,
      customClass: {
        popup: "swal-above-modal",
      },
    });
  } finally {
    isLoading.value = false;
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
    routineTasksTable: "Manage Routine Tasks", // تعديل الترجمة
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

    selectProject: "Select Project",
    project: "Project",
    allProjects: "All Projects",
    projectsSelected: "Projects Selected",
    searchPlaceholder: "Search tasks...",


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
    routineTasksTable: "أدارة المهام الروتينية", // تعديل الترجمة
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
    projectsSelected: "مشاريع محددة",
    // taskType: 'نوع المهمة',
    // status: 'الحالة',
    // department: 'القسم',
    // allTypes: 'جميع النوايات',
    // allStatuses: 'جميع الحالات',
    // allDepartments: 'جميع القسوم',

    // active: 'نشط',
    // inactive: 'غير نشط',

    project: "مشروع",
    selectProject: "اختر المشروع",
    allProjects: "جميع المشاريع",
    searchPlaceholder: "...ابحث هنا",

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
// const handlePageChange = (page) => {
//   fetchRoutineTasks(page);
// };

// Filter variables
// const selectedTaskType = ref('');
// const selectedDepartments = ref([]);
console.log("formattedDepartments:", formattedDepartments.value);
const toggleAllDepartments = () => {
  if (selectedDepartments.value.length === formattedDepartments.value.length) {
    // If all are selected, deselect all
    selectedDepartments.value = [];
  } else {
    // Select all departments
    selectedDepartments.value = formattedDepartments.value.map((dept) => ({
      id: dept.value,
      name: dept.label,
    }));
  }
};

// 4. فلتر حسب المشروعات المختارة
const toggleAllProjects = () => {
  if (selectedProjects.value.length === formattedProjects.value.length) {
    selectedProjects.value = [];
  } else {
    selectedProjects.value = formattedProjects.value.map((project) => ({
      id: project.value,
      name: project.label,
    }));
  }
};

// const applyFilters = () => {
//   // Implement filter logic
//   const filters = {
//     task_type: selectedTaskType.value,
//     dept_filter: selectedDepartments.value.map(dept => dept.id)
//   };

//   console.log("Filters:", filters);

//   // Dispatch action to fetch filtered routine tasks
//   store.dispatch('fetchRoutineTasks', { filters });
// };

const resetFilters = () => {
  // Reset all filter variables
  selectedTaskType.value = "";
  selectedDepartments.value = [];
  selectedProjects.value = [];
  selectedStatus.value = "";

  // Fetch all routine tasks without filters
  store.dispatch("fetchRoutineTasks");
};

// search
const searchMatch = (task) => {
  const query = searchQuery.value.toLowerCase();
  const taskName = (task.task_name || "").toLowerCase();
  const taskNo = (task.task_no || "").toLowerCase();

  return taskName.includes(query) || taskNo.includes(query);
};
</script>

<template>
  <!-- <LanguageSwitcher /> -->
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header pb-0">
            <div class="container">
              <div class="row align-items-center">
                <!-- القسم الأيسر: العنوان وزر الإضافة -->
                <div class="col-12 col-md-4 d-flex align-items-center">
                  <p class="mb-0 font-weight-bold me-2">
                    {{ t("routineTasksTable") }}
                  </p>
                  <argon-button
                    v-show="canCreateRoutineTask || isOwner"
                    @click="openPopup"
                  >
                    <i class="fas fa-plus"></i>
                  </argon-button>
                </div>

                <!-- القسم الأوسط: شريط البحث -->
                <div class="col-12 col-md-4 text-center my-2 my-md-0">
                  <div class="input-group" style="max-width: 100%">
                    <input
                      type="text"
                      class="form-control"
                      :placeholder="t('searchPlaceholder')"
                      v-model="searchQuery"
                    />
                  </div>
                </div>

                <!-- القسم الأيمن: زر الفلتر -->
                <div class="col-12 col-md-4 text-md-end text-end">
                  <button
                    class="btn btn-link"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#filterCollapse"
                    aria-expanded="false"
                    aria-controls="filterCollapse"
                  >
                    <i class="fas fa-filter"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="collapse" id="filterCollapse">
              <div class="card card-body">
                <div class="row">
                  <!-- Filter by Task Type -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("taskType") }}</label>
                    <select class="form-select" v-model="selectedTaskType">
                      <option value="">{{ t("allTypes") }}</option>
                      <option value="weekly">{{ t("weekly") }}</option>
                      <option value="monthly">{{ t("monthly") }}</option>
                      <option value="daily">{{ t("daily") }}</option>
                      <option value="last_day_of_month">
                        {{ t("last_day_of_month") }}
                      </option>
                    </select>
                  </div>

                  <!-- Filter by Status -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("status") }}</label>
                    <select class="form-select" v-model="selectedStatus">
                      <option value="">{{ t("allStatuses") }}</option>
                      <option value="active">{{ t("active") }}</option>
                      <option value="inactive">{{ t("inactive") }}</option>
                    </select>
                  </div>

                  <!-- Filter by Department -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("department") }}</label>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        id="departmentDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
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
                        <li class="px-2">
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              id="selectAllDepartments"
                              :checked="
                                selectedDepartments.length ===
                                formattedDepartments.length
                              "
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
                        <li><hr class="dropdown-divider" /></li>
                        <li
                          v-for="department in formattedDepartments"
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
                  <!-- toggleAllProjects -->

                  <!-- filter by project -->

                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("project") }}</label>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        id="projectDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {{
                          selectedProjects.length === 0
                            ? t("allProjects")
                            : selectedProjects.length === 1
                              ? selectedProjects[0].name
                              : `${selectedProjects.length} ${t("projectsSelected")}`
                        }}
                      </button>
                      <ul
                        class="dropdown-menu w-100"
                        aria-labelledby="projectDropdown"
                      >
                        <li class="px-2">
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              id="selectAllProjects"
                              :checked="
                                selectedProjects.length ===
                                formattedProjects.length
                              "
                              @change="toggleAllProjects"
                            />
                            <label
                              class="form-check-label"
                              for="selectAllProjects"
                            >
                              {{ t("selectAll") }}
                            </label>
                          </div>
                        </li>
                        <li><hr class="dropdown-divider" /></li>
                        <li
                          v-for="project in formattedProjects"
                          :key="project.value"
                          class="px-2"
                        >
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              :id="'project-' + project.value"
                              :value="{
                                id: project.value,
                                name: project.label,
                              }"
                              v-model="selectedProjects"
                            />
                            <label
                              class="form-check-label"
                              :for="'project-' + project.value"
                            >
                              {{ project.label }}
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <!-- <button 
                    class="btn btn-primary me-2" 
                    @click="applyFilters"
                  >
                    {{ t("applyFilters") }}
                  </button> -->
                  <button class="btn btn-secondary" @click="resetFilters">
                    {{ t("resetFilters") }}
                  </button>
                </div>
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

            <div
              v-else-if="allroutineTasks.length === 0"
              class="d-flex justify-content-center py-5 flex-column align-items-center"
            >
              <h5>{{ t("noRoutineTasks") }}</h5>
              <!-- تعديل الترجمة -->
              <p>
                {{ t("createee") }}
              </p>
            </div>
            <ManageRoutineTaskTable
              v-else
              :allroutineTasks="paginatedTasks"
              :key="componentKey"
              @page-changed="handlePageChange"
              :pagination="pagination"
            />
            <!-- تعديل المكون والخصائص -->
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

            <!-- select box for weekly task -->
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

            <!-- select Department -->
            <div class="form-group mb-3">
              <label class="form-label">{{ t("department") }}:</label>
              <argon-select
                v-model="deptId"
                :options="formattedDepartments"
                :placeholder="t('selectDepartment')"
                class="form-control"
              />
            </div>

            <!-- select project -->
            <div class="form-group mb-3">
              <label class="form-label">{{ t("project") }}:</label>
              <argon-select
                v-model="projectId"
                :options="formattedProjects"
                :placeholder="t('selectProject')"
                class="form-control"
              />
            </div>

            <!-- start date -->
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
</style>
