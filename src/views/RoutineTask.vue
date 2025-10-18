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
import RoutineTasksTable from "@/views/components/RoutineTaskTable.vue";
// import ArgonSwitch from "@/components/ArgonSwitch.vue";
// import Swal from "sweetalert2";

const refreshInterval = ref(null); // Will store our setInterval ID

const store = useStore();

const userData = computed(() => store.getters.user);
console.log("userDataaaaaaaaa:", userData.value);

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
  // await store.dispatch("fetchDepartments");
});

const dataFromApi = computed(() => store.getters.dataFromApi);

const employeeOptions = computed(() => {
  return dataFromApi.value.map((employee) => ({
    value: employee.id,
    label: employee.name,
  }));
});

const statuses = computed(() => {
  return currentLanguage.value === "ar"
    ? [
      { value: "", label: "جميع الحالات" },
      { value: "done", label: "مكتمل" },
      { value: "not_done", label: "غير مكتمل" },
      { value: "null", label: "غير مبلغ" },
      { value: "lated", label: "متاخر" },
    ]
    : [
      { value: "", label: "All Statuses" },
      { value: "done", label: "Done" },
      { value: "not_done", label: "Not Done" },
      { value: "null", label: "Not Paid" },
      { value: "lated", label: "Lated" },
    ];
});

console.log("employeeOptions:", employeeOptions.value);

const departments = computed(() => store.getters.departments);
// const projects = computed(() => store.getters.projects);

console.log("departmentssssssssssssss:", departments.value);

const formattedDepartments = computed(() => {
  return departments.value.map((department) => ({
    value: department.id,
    label: department.name,
  }));
});

const userDepartment = computed(() => {
  const user = userData.value;
  console.log("user.departments:", user);
  return user.user?.departments?.map((department) => ({
    value: department.id,
    label: department.name,
  }));
});

console.log("userDepartment:", userDepartment.value);

// const isOwner = computed(() => store.getters.isOwner);

// const canCreateRoutineTask = computed(
//   () => hasPermission(permissions.value, "create-routine-task") // تعديل صلاحية
// );

const showAlert = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showSuccess = ref(false);
const routineTaskName = ref(""); // تعديل المتغيرات
const showPopup = ref(false);
const routineTasks = ref([]); // تعديل المتغيرات
const componentKey = ref(0);
const body = document.getElementsByTagName("body")[0];
const isLoading = ref(false);
const routineTaskDescription = ref(""); // تعديل المتغيرات
const startDate = ref("");
const fromDate = ref("");
const toDate = ref("");
const searchQuery = ref("");

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

const formattedProjects = computed(() => {
  const uniqueProjects = new Set();
  return routineTasks.value
    .map((task) => ({
      value: task.project?.id,
      label: task.project?.name,
    }))
    .filter((project) => {
      if (!uniqueProjects.has(project.value)) {
        uniqueProjects.add(project.value);
        return true; // Include this project
      }
      return false; // Exclude duplicate project
    });
});

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

  try {
    isLoading.value = true;
    // Example of calling your Vuex action:
    const response = await store.dispatch("fetchRoutineTasks");
    if (response.status === 200) {
      // Filter out inactive tasks if desired:
      routineTasks.value = store.getters.routineTasks.tasks.filter(
        (task) => task.active === true
      );
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
  } finally {
    isLoading.value = false;
  }

  // Always clear the interval on unmount
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

// Method to fetch tasks and update local data
const refreshTasks = async () => {
  try {
    // Pass in page if needed: fetchRoutineTasks(pagination.value.current_page)
    const response = await store.dispatch("fetchRoutineTasks");
    if (response.status === 200) {
      routineTasks.value = store.getters.routineTasks.tasks;
      // Recompute pagination data
      // pagination.value.total = routineTasks.value.length;
      // pagination.value.last_page = Math.ceil(
      //   routineTasks.value.length / pagination.value.per_page
      // );
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

const currentUserId = computed(() => store.getters.userId);
console.log("currentUserId:", currentUserId.value);

// Pagination
const pagination = ref({
  current_page: 1, // Current page
  per_page: 10, // Items per page
  total: 0, // Total number of tasks
  last_page: 1, // Total number of pages
});

// Fetch all tasks from the API
// const fetchRoutineTasks = async () => {
//   try {
//     const response = await store.dispatch("fetchRoutineTasks");
//     if (response.status === 200) {
//       routineTasks.value = store.getters.routineTasks.tasks.filter(task => task.active === true);
//       pagination.value.total = routineTasks.value.length;
//       pagination.value.last_page = Math.ceil(routineTasks.value.length / pagination.value.per_page);
//     }
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//   }
// };

// Get tasks for the current page
// const paginatedTasks = computed(() => {
//   const start = (pagination.value.current_page - 1) * pagination.value.per_page;
//   const end = start + pagination.value.per_page;
//   return tasks.value.slice(start, end);
// });

const currentLanguage = computed(() => store.getters.currentLanguage);

watch(() => store.getters.currentLanguage);

const t = (key) => {
  return translations[currentLanguage.value][key];
};

// Departments logic
// const departments = ref([]);
// const formattedDepartments = computed(() => {
//   return departments.value.map((department) => ({
//     value: department.id,
//     label: department.name,
//   }));
// });

// Filter variables
const selectedTaskType = ref("");
const selectedDepartments = ref([]);
const selectedProjects = ref([]);

const selectedStatus = ref("");
console.log("userDepartment:", userDepartment.value);
// const toggleAllDepartments = () => {
//   if (selectedDepartments.value.length === userDepartment.value.length) {
//     // If all are selected, deselect all
//     selectedDepartments.value = [];
//     console.log("selectedDepartments:", selectedDepartments.value);
//   } else {
//     // Select all departments
//     selectedDepartments.value = userDepartment.value.map((dept) => ({
//       id: dept.value,
//       name: dept.label,
//     }));
//   }
// };

// const applyFilters = async () => {
//   const filters = {
//     dept_filter: selectedDepartments.value.map((dept) => dept.id),
//     // task_type: selectedTaskType.value,
//   };

//   console.log("Applying filters:", filters);

//   // هنا بنستدعي الدالة مع تمرير الصفحة والفلاتر
//   await store.dispatch("fetchRoutineTasks", 1, filters);

//   // بعد استلام الرد، بنحدث البيانات المُستخدمة في العرض
//   routineTasks.value = store.getters.routineTasks.tasks.filter(
//     (task) => task.active === true
//   );
//   pagination.value = store.getters.routineTasks.pagination;
//   componentKey.value += 1;
// };

// const resetFilters = () => {
//   // Reset all filter variables
//   selectedTaskType.value = "";
//   selectedDepartments.value = [];

//   // Fetch all routine tasks without filters
//   // store.dispatch('fetchRoutineTasks');
// };

// Watch for changes in the tasks array to recalculate pagination

// Compute the tasks for the current page
// const paginatedTasks = computed(() => {
//   const startIndex =
//     (pagination.value.current_page - 1) * pagination.value.per_page;
//   const endIndex = startIndex + pagination.value.per_page;
//   return routineTasks.value.slice(startIndex, endIndex);
// });

// const openPopup = () => {
//   showPopup.value = true;
// };

// const addRoutineTask = async () => {
//   // تعديل الدالة
//   if (routineTaskName.value) {
//     isLoading.value = true;
//     const routineTask = {
//       task_name: routineTaskName.value, // تعديل المفتاح ليتوافق مع الـ API
//       description: routineTaskDescription.value,
//       start_date: startDate.value, // assuming 'from' is the start_date
//       task_type: taskType.value,
//       recurrent_days: recurrentDays.value,
//       day_of_month: dayOfMonth.value,
//       to: toDate.value,
//       from: fromDate.value, // قد تحتاج إلى التأكد من تطابق الحقول مع الـ API
//       dept_id: deptId.value,
//       assigned_to: selectedManager.value,
//     };

//     console.log("routineTask:", routineTask);
//     try {
//       const response = await store.dispatch("addRoutineTask", routineTask); // تعديل الـ action
//       if (response.status === 201) {
//         Swal.fire({
//           icon: "success",
//           title: t("routineTaskAdded"), // تعديل الترجمة
//           showConfirmButton: false,
//           timer: 1500,
//           timerProgressBar: true,
//         });
//       }
//       closePopup();
//       await fetchRoutineTasks();
//       componentKey.value += 1;
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: t("routineTaskAddedError"), // تعديل الترجمة
//         showConfirmButton: false,
//         timer: 1500,
//         timerProgressBar: true,
//       });
//     } finally {
//       isLoading.value = false;
//     }
//   } else {
//     Swal.fire({
//       title: t("routineTaskNameRequired"), // تعديل الترجمة
//       icon: "warning",
//     });
//     isLoading.value = false;
//   }
// };

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
    routineTasksTable: "Routine Tasks", // تعديل الترجمة
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
    createee: "Create your routine tasks", // تعديل الترجمة
    inactive: "Inactive", // إضافة ترجمة للحالة
    active: "Active",
    advancedSettings: "Advanced Settings", // إضافة ترجمة
    taskNumber: "Task Number",

    // taskType: "Task Type",
    // selectTaskType: "Select Task Type",
    // recurrentDays: "Recurrent Days",
    // enterRecurrentDays: "Enter number of recurrent days",
    // dayOfMonth: "Day of Month",
    // enterDayOfMonth: "Enter day of the month ex: 1, 2,....31",
    // department: "Department",
    // selectDepartment: "Select Department",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    enterStartDate: "Enter start date",
    startDate: "Start Date",
    taskType: "Task Type",
    status: "Status",
    department: "Department",
    allTypes: "All Types",
    allStatuses: "All Status",
    allDepartments: "All Departments",
    weekly: "Weekly",
    monthly: "Monthly",
    daily: "Daily",
    // active: 'Active',
    // inactive: 'Inactive',
    applyFilters: "Apply Filters",
    resetFilters: "Reset Filters",
    selectAll: "Select All",
    departmentsSelected: "Departments Selected",
    done: "Done",
    not_done: "Not Done",
    not_reported: "Not Reported",
    LatedTasks: "Lated Tasks",
    allProjects: "All Projects",
    project: "Project",
    searchPlaceholder: "Search tasks...",
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
    routineTasksTable: "المهام الروتينية", // تعديل الترجمة
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
    createee: "انشئ مهامك الروتينية", // تعديل الترجمة
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
    department: "القسم",
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
    // taskType: 'نوع المهمة',
    // status: 'الحالة',
    // department: 'القسم',
    // allTypes: 'جميع النوايات',
    allStatuses: "جميع الحالات",
    allDepartments: "جميع الاقسام",
    allProjects: "جميع المشاريع",
    weekly: "اسبوعي",
    monthly: "شهري",
    daily: "يومي",
    // active: 'نشط',
    // inactive: 'غير نشط',
    applyFilters: "تطبيق التصفيات",
    resetFilters: "اعادة تعيين التصفيات",
    selectAll: "اختر الكل",
    departmentsSelected: "اقسام محددة",
    done: "تم",
    not_done: "لم يتم",
    not_reported: "لم يتم التقرير",
    LatedTasks: "مهام متاخرة",
    project: "المشروع",
    selectProject: "اختر المشروع",
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

// Handle page change event from child
// const handlePageChange = (page) => {
//   if (page >= 1 && page <= pagination.value.last_page) {
//     pagination.value.current_page = page;
//   }
// };

// onMounted(async () => {
//   await store.dispatch("fetchDepartments");
// });

// In created() or setup()
onMounted(async () => {
  // try {
  //   // Fetch departments from your API or Vuex store
  //   const fetchedDepartments = await store.dispatch("fetchDepartments");
  //   console.log("Fetched Departments:", fetchedDepartments);
  // } catch (error) {
  //   console.error("Error fetching departments:", error);
  // }

  await refreshTasks();

  // ====== Auto-refresh every 60 seconds ======
  refreshInterval.value = setInterval(async () => {
    console.log("Auto-refreshing tasks...");
    await refreshTasks();
  }, 60_000);
});

const nowTime = ref(new Date());
// const formatTime = (time) => {
//   return time.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false  // Use 24-hour format
//   });
// };
// const formattedNowTime = ref(formatTime(nowTime.value));

const filteredTasks = computed(() => {
  let tasks = [...routineTasks.value];
  console.log(tasks);

  // a) Filter by Task Type if selected
  // if (selectedTaskType.value) {
  //   tasks = tasks.filter((t) => t.task_type === selectedTaskType.value);
  // }

  // b) Filter by Status if selected
  if (selectedStatus.value) {
    // You need to know how "status" is stored in your tasks
    // e.g., t.active === true/false, or t.status === 'active'/'inactive'
    if (selectedStatus.value === "done") {
      tasks = tasks.filter((t) => t.today_report_status === "done");
    } else if (selectedStatus.value === "not_done") {
      tasks = tasks.filter((t) => t.today_report_status === "not_done");
    } else if (selectedStatus.value === "null") {
      tasks = tasks.filter((t) => t.today_report_status === null);
    } else if (selectedStatus.value === "lated") {
      tasks = tasks.filter((t) => {
        // Check if task is lated (time passed)
        if (!t.to) return false;

        // Parse task's 'to' time
        const [taskHours, taskMinutes] = t.to.split(":").map(Number);
        const taskTime = new Date();
        taskTime.setHours(taskHours, taskMinutes, 0, 0);

        // Check if task is not done or not reported
        const isNotDoneOrReported =
          t.today_report_status !== "done" &&
          t.today_report_status !== "not_done";

        // Return true if time has passed and task is not done
        return taskTime < nowTime.value && isNotDoneOrReported;
      });
    }
  }

  // c) Filter by selected departments
  if (selectedDepartments.value.length > 0) {
    const departmentIds = selectedDepartments.value.map((d) => d.id);
    console.log(departmentIds);
    tasks = tasks.filter(
      (t) =>
        // Ensure you have t.dept_id
        t.department.dept_id && departmentIds.includes(t.department.dept_id)
    );
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

// --------------------------------------
// 4) Paginated tasks from "filteredTasks"
// --------------------------------------
const paginatedTasks = computed(() => {
  const startIndex =
    (pagination.value.current_page - 1) * pagination.value.per_page;
  const endIndex = startIndex + pagination.value.per_page;
  return filteredTasks.value.slice(startIndex, endIndex);
});

// --------------------------------------
// 5) Handler for "Apply Filter" button
// --------------------------------------
// const applyFilters = () => {
//   // We do not need to call the backend if you want purely front-end filtering
//   // The computed "filteredTasks" will re-calc automatically.

//   // Reset to page 1 so we don't land on an out-of-range page
//   pagination.value.current_page = 1;
// };

// "Reset Filter" button
const resetFilters = () => {
  selectedTaskType.value = "";
  selectedStatus.value = "";
  selectedDepartments.value = [];
  selectedProjects.value = [];

  // Also reset to page 1
  pagination.value.current_page = 1;
};

// Toggling "Select All" departments
const toggleAllDepartments = () => {
  if (selectedDepartments.value.length === userDepartment.value.length) {
    selectedDepartments.value = [];
  } else {
    selectedDepartments.value = userDepartment.value.map((dept) => ({
      id: dept.value,
      name: dept.label,
    }));
  }
};

// 4. فلتر حسب المشروعات المختارة
const toggleAllProjects = () => {
  if (selectedProjects.value.length === formattedProjects.value.length) {
    selectedProjects.value = [];
    console.log(formattedProjects.value.length);
  } else {
    selectedProjects.value = formattedProjects.value.map((project) => ({
      id: project.value,
      name: project.label,
    }));
  }
};

// --------------------------------------
// 6) Pagination change from child
// --------------------------------------
const handlePageChange = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page;
  }
};

// If you're filtering tasks
const routineTasksCount = computed(() => {
  return filteredTasks.value.length;
  // or routineTasks.value.length, depending on what you want to display
});

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
  <div class="py-1 container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header pb-0">
            <div class="container">
              <div class="row align-items-center">
                <!-- القسم الأيسر: العنوان والعدد -->
                <div class="col-12 col-md-4 d-flex align-items-center">
                  <p class="mb-0 font-weight-bold me-2">
                    {{ t("routineTasksTable") }}
                  </p>
                  <small class="mb-0 font-weight-bold">
                    ({{ routineTasksCount }})
                  </small>
                </div>

                <!-- القسم الأوسط: شريط البحث -->
                <div class="col-12 col-md-4 my-2 my-md-0">
                  <div class="input-group">
                    <input type="text" class="form-control" :placeholder="t('searchPlaceholder')"
                      v-model="searchQuery" />
                  </div>
                </div>

                <!-- القسم الأيمن: زر الفلتر -->
                <div class="col-12 col-md-4" :class="currentLanguage === 'ar' ? 'text-md-start' : 'text-md-end'
                  ">
                  <button class="btn btn-link" type="button" data-bs-toggle="collapse" data-bs-target="#filterCollapse"
                    aria-expanded="false" aria-controls="filterCollapse">
                    <i class="fas fa-filter"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Collapsible Filter Panel -->
            <div class="collapse" id="filterCollapse">
              <div class="card card-body">
                <div class="row">
                  <!-- TaskType Filter -->
                  <!-- <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("taskType") }}</label>
                    <select class="form-select" v-model="selectedTaskType">
                      <option value="">{{ t("allTypes") }}</option>
                      <option value="weekly">{{ t("weekly") }}</option>
                      <option value="monthly">{{ t("monthly") }}</option>
                      <option value="daily">{{ t("daily") }}</option>
                    </select>
                  </div> -->

                  <!-- Department Filter -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("department") }}</label>
                    <div class="dropdown">
                      <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button"
                        id="departmentDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        {{
                          selectedDepartments.length === 0
                            ? t("allDepartments")
                            : selectedDepartments.length === 1
                              ? selectedDepartments[0].name
                              : `${selectedDepartments.length} ${t("departmentsSelected")}`
                        }}
                      </button>
                      <ul class="dropdown-menu w-100" aria-labelledby="departmentDropdown">
                        <li class="px-2">
                          <!-- "Select All" option -->
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="selectAllDepartments" :checked="selectedDepartments?.length ===
                              userDepartment?.length
                              " @change="toggleAllDepartments" />
                            <label class="form-check-label" for="selectAllDepartments">
                              {{ t("selectAll") }}
                            </label>
                          </div>
                        </li>
                        <li>
                          <hr class="dropdown-divider" />
                        </li>
                        <li v-for="dept in userDepartment" :key="dept.value" class="px-2">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" :id="'department-' + dept.value"
                              :value="{ id: dept.value, name: dept.label }" v-model="selectedDepartments" />
                            <label class="form-check-label" :for="'department-' + dept.value">
                              {{ dept.label }}
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- filter by project -->

                  <div v-if="formattedProjects.length !== 0" class="col-md-4 mb-3">
                    <label class="form-label">{{ t("project") }}</label>
                    <div class="dropdown">
                      <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button"
                        id="projectDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class="me-2">
                          {{
                            selectedProjects.length === 0
                              ? t("allProjects")
                              : selectedProjects.length === 1
                                ? selectedProjects[0].name
                                : `${selectedProjects.length} ${t("projectsSelected")}`
                          }}
                        </span>
                        <span class="ms-auto">
                          <i class="fas fa-angle-down"></i>
                        </span>
                      </button>
                      <ul class="dropdown-menu w-100" aria-labelledby="projectDropdown">
                        <li class="px-2">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="selectAllProjects" :checked="selectedProjects.length ===
                              formattedProjects.length
                              " @change="toggleAllProjects" />
                            <label class="form-check-label" for="selectAllProjects">
                              {{ t("selectAll") }}
                            </label>
                          </div>
                        </li>
                        <li>
                          <hr class="dropdown-divider" />
                        </li>
                        <li v-for="project in formattedProjects" :key="project.value" class="px-2">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" :id="'project-' + project.value" :value="{
                              id: project.value,
                              name: project.label,
                            }" v-model="selectedProjects" />
                            <label class="form-check-label" :for="'project-' + project.value">
                              {{ project.label }}
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Status Filter -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("status") }}</label>
                    <argon-select class="form-select" v-model="selectedStatus" :options="statuses">
                    </argon-select>
                  </div>
                </div>

                <!-- Filter Buttons -->
                <div class="d-flex justify-content-end">
                  <!-- <button class="btn btn-primary me-2" @click="applyFilters">
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
              <argon-alert v-if="showAlert" color="danger" dismissible class="mt-3">
                {{ errorMessage }}
              </argon-alert>
              <argon-alert v-if="showSuccess" color="success" dismissible class="mt-3">
                {{ successMessage }}
              </argon-alert>
            </form>
            <div v-if="isLoading" class="d-flex justify-content-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="routineTasks.length === 0"
              class="d-flex justify-content-center py-5 flex-column align-items-center">
              <h5>{{ t("noRoutineTasks") }}</h5>
              <!-- تعديل الترجمة -->
              <p>
                {{ t("createee") }}
              </p>
            </div>
            <routine-tasks-table v-else :routineTasks="paginatedTasks" :key="componentKey"
              @page-changed="handlePageChange" :pagination="pagination" @reload-tasks="refreshTasks" />
            <!-- تعديل المكون والخصائص -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showPopup" class="popup-overlay">
    <transition name="modal-fade">
      <ArgonModal v-if="showPopup" :title="t('createRoutineTask')" @close="closePopup" class="routine-task-modal">
        <template #default>
          <div class="modal-content-scroll">
            <div class="form-group mb-3">
              <label class="form-label">{{ t("routineTaskName") }}:</label>
              <input v-model="routineTaskName" class="form-control" :placeholder="t('enterRoutineTaskName')" />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("description") }}:</label>
              <textarea v-model="routineTaskDescription" class="form-control"
                :placeholder="t('enterDescription')"></textarea>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("taskType") }}:</label>
              <argon-select v-model="taskType" :options="taskTypeOptions" :placeholder="t('selectTaskType')"
                class="form-control" />
            </div>

            <div v-show="taskType === 'weekly'" class="form-group mb-3">
              <label class="form-label">{{ t("recurrentDays") }}:</label>
              <div class="d-flex flex-wrap">
                <div v-for="day in daysOfWeek" :key="day.value" class="form-check me-3">
                  <argon-checkbox :id="'day-' + day.value" :name="'recurrentDays'" :value="day.value"
                    :modelValue="recurrentDays" @update:modelValue="
                      (checked) => toggleRecurrentDay(day.value, checked)
                    ">
                    {{ day.label }}
                  </argon-checkbox>
                </div>
              </div>
            </div>

            <div v-show="taskType === 'monthly'" class="form-group mb-3">
              <label class="form-label">{{ t("dayOfMonth") }}:</label>
              <input type="number" v-model="dayOfMonth" class="form-control" :placeholder="t('enterDayOfMonth')" min="1"
                max="31" />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("department") }}:</label>
              <argon-select v-model="deptId" :options="formattedDepartments" :placeholder="t('selectDepartment')"
                class="form-control" />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("startDate") }}:</label>
              <input type="date" v-model="startDate" class="form-control" :placeholder="t('enterStartDate')" min="1"
                max="31" />
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
          <argon-button variant="success" @click="addRoutineTask" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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
  z-index: 9999;
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
</style>
