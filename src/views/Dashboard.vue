// Dashboard.vue
<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import ShBar from "../components/charts/ShBar.vue";
// import ShLine from "../components/charts/ShLine.vue";
import AIAnalysisCard from "@/components/AIAnalysisCard.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonMultipleSelect from "@/components/ArgonMultipleSelect.vue";
import ArgonTagsInput from "@/components/ArgonTagsInput.vue";
import ArgonTextarea from "@/components/ArgonTextarea.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import { useStore } from "vuex";
import Swal from 'sweetalert2';

const store = useStore();
const router = useRouter();
const route = useRoute();
// const userName = computed(() => store.getters.userName);

// Loading and error states
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');

// Dashboard data with localStorage persistence
const dashboardData = ref(localStorage.getItem('dashboardData') ?
  JSON.parse(localStorage.getItem('dashboardData')) :
  {
    AllDailyTasks: { active: 0, inActive: 0, total: 0 },
    DailyTasks: {
      DailyTaskDepts: [],
      done_reports: 0,
      not_done_reports: 0,
      total_reports: 0,
    },
    Departments: { Departments: [], total: 0 },
    Emps: { invited: 0, pending: 0, total: 0 },
    Projects: { active: 0, inactive: 0, total: 0 },
    lastUpdated: null
  }
);

// Auto-refresh interval (every 5 minutes)
const refreshInterval = ref(null);

// AI Modal State
const isLoadingAI = ref(false);
const currentAIData = ref(null);
const aiLastUpdated = ref(null);
// const hasOpenedAI = ref(localStorage.getItem('hasOpenedAI') === 'true');
const showAIModal = ref(false);

// Quick Add State
const showQuickAddRoutine = ref(false);
const showQuickAddOneTime = ref(false);
const isSubmittingRoutine = ref(false);
const isSubmittingOneTime = ref(false);
const buttonPositionRoutine = ref({ top: 0, left: 0, buttonTop: 0, buttonLeft: 0 });
const buttonPositionOneTime = ref({ top: 0, left: 0, buttonTop: 0, buttonLeft: 0 });

// Gmail Toolbar State
const showCompactPeople = ref(false);
const showClearIcon = ref(null);
const showProjectDropdown = ref(false);
const showPriorityDropdown = ref(false);
const showStartDatePicker = ref(false);
const showEndDatePicker = ref(false);
const showCcFields = ref(false);
const showBccFields = ref(false);

// Validation errors
const validationErrors = ref({});

// Quick Add Form Data - Matches API structure
const quickRoutineTask = ref({
  task_name: '',          // API field
  description: '',        // API field
  task_type: '',          // API field (daily/weekly/monthly/custom)
  start_date: '',         // API field
  dept_id: '',            // API field
  from: '',               // Optional time field
  to: '',                 // Optional time field
  // Conditional fields for weekly/monthly/last_day_of_month
  recurrent_days: [],     // For weekly: [1,2,3,4,5] (Mon-Fri)
  day_of_month: '',       // For monthly: 1-31
  last_day_of_month: ''   // For last_day_of_month: last_day
});

const quickOneTimeTask = ref({
  title: '',                    // API field (NOT task_name!)
  description: '',              // API field
  start_date: '',              // API field
  deadline: '',                // API field (NOT end_date!)
  priority: '',                // API field (low/normal/high/urgent)
  assigned_user_id: [],        // API field (array!)
  project_id: null,            // Optional
  supervisor_user_id: null,    // Optional
  inform_user_id: [],          // Array for multiple selection
  consult_user_id: [],         // Array for multiple selection
  department_id: null          // Optional
});

// Fetch and save dashboard data
const fetchAndSaveDashboardData = async () => {
  try {
    isLoading.value = true;
    hasError.value = false;
    errorMessage.value = '';

    const freshData = await store.dispatch("fetchDashboardData");
    console.log("freshData", freshData);
    if (freshData) {
      dashboardData.value = {
        ...freshData,
        lastUpdated: new Date().toLocaleString()
      };
      localStorage.setItem('dashboardData', JSON.stringify(dashboardData.value));
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    hasError.value = true;
    errorMessage.value = error.message || 'Failed to fetch dashboard data';
  } finally {
    isLoading.value = false;
  }
};

// Watch for store changes and update local data
watch(() => store.getters.dashboardData, (newData) => {
  if (newData) {
    dashboardData.value = {
      ...newData,
      lastUpdated: new Date().toLocaleString()
    };
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData.value));
  }
});

// Auto-refresh functionality
const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    fetchAndSaveDashboardData();
  }, 300000); // Refresh every 5 minutes
};

// Cleanup on component unmount
onMounted(() => {
  fetchAndSaveDashboardData();
  startAutoRefresh();
});

// Cleanup interval on component unmount
onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

// Helper function for progress bar classes
// const getProgressBarClass = (percentage) => {
//   if (percentage >= 80) return 'bg-success';
//   if (percentage >= 60) return 'bg-warning';
//   if (percentage >= 40) return 'bg-info';
//   return 'bg-danger';
// };

// One-Time Tasks computed metrics
const oneTimeOpenTasks = computed(() => {
  const t = dashboardData.value?.Tasks || {};
  return (t.pending || 0) + (t.inProgress || 0);
});

const oneTimeUrgent = computed(() => (dashboardData.value?.Tasks?.urgent || 0));

// Generic navigator to One-Time Task with a query filter
const goToOneTimeTasks = (key, val) => {
  const companyName = route.params.companyName;
  router.push({
    name: "one time task",
    params: { companyName },
    query: { [key]: val }
  });
};

// Generic navigator to page
// Global page navigator
const goToPage = ({ name, params = {}, query = {} }) => {
  // Try pulling companyName from current route if not supplied
  if (!params.companyName && route && route.params && route.params.companyName) {
    params.companyName = route.params.companyName;
  }
  router.push({ name, params, query });
};

// Generic navigation function for all cards
const navigateToCard = (pageName) => {
  goToPage({ name: pageName });
};

// Data for Quick Add forms
const dataFromApi = computed(() => store.getters.dataFromApi || []);
const departments = computed(() => store.getters.departments || []);
const projects = computed(() => store.getters.projects || []);

const employeeOptions = computed(() => {
  return dataFromApi.value.map((employee) => ({
    value: employee.id,
    label: employee.name,
  }));
});

// Gmail Toolbar Computed Properties
const hasSelectedPeople = computed(() => {
  return quickOneTimeTask.value.assigned_user_id &&
    quickOneTimeTask.value.assigned_user_id.length > 0;
});

const getEmployeeName = (userId) => {
  const employee = dataFromApi.value.find(emp => emp.id === userId);
  return employee ? employee.name : '';
};

// OneTime Gmail toolbar state/data
const projectId = ref(null);
const priorityValue = ref('');
const projectSearchQuery = ref('');
const prioritySearchQuery = ref('');
const filteredProjects = ref([]);
const filteredPriorities = ref([
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]);

const formattedProjects = computed(() => {
  return projects.value
    .filter((project) => project.status == true)
    .map((project) => ({ value: project.id, label: project.name }));
});


const formattedDepartments = computed(() => {
  return departments.value.map((department) => ({
    value: department.id,
    label: department.name,
  }));
});

// Task type options for Routine Task (4 options)
const taskTypeOptions = computed(() => [
  { value: "daily", label: t('daily') },
  { value: "weekly", label: t('weekly') },
  { value: "monthly", label: t('monthly') },
  { value: "last_day_of_month", label: t('lastDayOfMonth') }
]);

// Conditional field visibility for Routine Task
const showWeeklyOptions = computed(() => quickRoutineTask.value.task_type === 'weekly');
const showMonthlyOptions = computed(() => quickRoutineTask.value.task_type === 'monthly');
const showLastDayOfMonthOptions = computed(() => quickRoutineTask.value.task_type === 'last_day_of_month');

// Day options for weekly task type
const weekDaysOptions = computed(() => [
  { value: 1, label: t('monday') },
  { value: 2, label: t('tuesday') },
  { value: 3, label: t('wednesday') },
  { value: 4, label: t('thursday') },
  { value: 5, label: t('friday') },
  { value: 6, label: t('saturday') },
  { value: 7, label: t('sunday') }
]);

// Day of month options for monthly task type
const monthDaysOptions = computed(() => {
  const days = [];
  for (let i = 1; i <= 31; i++) {
    days.push({ value: i, label: i.toString() });
  }
  return days;
});

// Options for last day of month (no additional options needed)
const lastDayOfMonthOptions = computed(() => [
  { value: 'last_day', label: t('lastDayOfMonth') }
]);

// Translation system
const translations = {
  en: {
    // Header
    dashboard: "Dashboard",
    dashboardSubtitle: "Comprehensive overview of company performance",
    refreshData: "Refresh Data",
    lastUpdated: "Last updated",

    // Error messages
    errorLoadingData: "Error loading data",
    retry: "Retry",
    loadingData: "Loading dashboard data...",
    gatheringInfo: "We are gathering the latest information for you",

    // AI Analysis
    aiAnalysis: "AI Analysis",
    aiAnalysisTitle: "AI Company Performance Analysis",
    aiAnalysisSubtitle: "Comprehensive data analysis using artificial intelligence",
    refresh: "Refresh",
    analyzingLatestData: "Analyzing Latest Data...",
    gatheringInsights: "Gathering intelligent insights from your data",
    lastAnalyzed: "Last analyzed",
    close: "Close",
    reanalyze: "Re-analyze",

    // Statistics section
    statisticsTitle: "Key Statistics",
    statisticsSubtitle: "Quick overview of important indicators",

    // Stats cards
    totalDailyTasks: "Total Routine Tasks",
    todayTasks: "Today's Routine Tasks",
    employees: "Employees",
    projects: "Projects",
    active: "Active",
    inactive: "Inactive",
    completed: "Completed",
    pending: "Pending",
    reported: "Reported",
    notReported: "Not Reported",
    task: "Tasks",
    // One-Time tasks labels
    oneTimeTasks: "One-Time Tasks",
    openTasks: "Open Tasks",
    inProgress: "In Progress",
    overdue: "Overdue",
    dueToday: "Due Today",
    dueSoon: "Due Soon",
    review: "Review",
    urgent: "Urgent",

    // Charts section
    chartsTitle: "Charts and Analytics",
    chartsSubtitle: "Visual representation of department and task performance",
    performanceTrends: "Performance Trends",
    performanceTrendsSubtitle: "Open, Review and Done over time",
    taskProgressByDept: "Task Progress by Department",
    taskProgressSubtitle: "Comparison of completed and incomplete tasks",
    reportsStatus: "Reports Status",
    reportsStatusSubtitle: "Reported and unreported tasks",

    // Tables section
    tablesTitle: "Detailed Data",
    tablesSubtitle: "Task and employee details by department",
    dailyTasksByDept: "Daily Tasks by Department",
    dailyTasksSubtitle: "Performance breakdown for each department",
    employeesByDept: "Employees by Department",
    employeesSubtitle: "Employee distribution across departments",

    // Table headers
    department: "Department",
    totalTasks: "Total Tasks",
    reportedTasks: "Reported",
    notReportedTasks: "Not Reported",
    completionRate: "Completion Rate",
    count: "Count",

    // Status indicators
    done: "Done",
    notDone: "Not Done",
    stopped: "Stopped",
    undefined: "Undefined",
    stable: "Stable",
    viewDetails: "View details",

    // Quick Add
    quickAddTask: "Quick Add",
    quickAddRoutineTask: "Quick Add Routine Task",
    quickAddOneTimeTask: "Quick Add One-Time Task",
    taskName: "Task Name",
    description: "Description",
    assignTo: "Assign To",
    selectAssignee: "Select Assignee",
    selectDepartment: "Select Department",
    selectTaskType: "Select Task Type",
    selectPriority: "Select Priority",
    selectProject: "Select Project",
    startDate: "Start Date",
    endDate: "End Date",
    deadline: "Deadline",
    priority: "Priority",
    project: "Project",
    taskType: "Task Type",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    high: "High",
    normal: "Normal",
    medium: "Medium",
    low: "Low",
    cancel: "Cancel",
    create: "Create",
    saving: "Saving...",
    fillRequiredFields: "Please fill all required fields",
    validationError: "Validation Error",
    success: "Success",
    error: "Error",
    routineTaskAdded: "Routine task added successfully",
    oneTimeTaskAdded: "One-time task added successfully",
    routineTaskAddedError: "Error adding routine task",
    oneTimeTaskAddedError: "Error adding one-time task",
    enterTaskName: "Enter task name",
    enterDescription: "Enter description",
    searchEmployees: "Search Employees",
    searchProjects: "Search Projects",
    clickToAddPeople: "Click to add Employees",
    clickToEdit: "Click to edit",
    lastDayOfMonth: "Last Day of Month",
    selectLastDayOfMonth: "Select Last Day of Month",
    selectDays: "Select Days",
    selectDaysOfWeek: "Select Days of Week",
    dayOfMonth: "Day of Month",
    selectDayOfMonth: "Select Day of Month",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
  },
  ar: {
    // Header
    dashboard: "لوحة التحكم",
    dashboardSubtitle: "نظرة شاملة على أداء الشركة",
    refreshData: "تحديث البيانات",
    lastUpdated: "آخر تحديث",

    // Error messages
    errorLoadingData: "خطأ في تحميل البيانات",
    retry: "إعادة المحاولة",
    loadingData: "جاري تحميل البيانات...",
    gatheringInfo: "نحن نجمع أحدث المعلومات لك",

    // AI Analysis
    aiAnalysis: "التحليل الذكي",
    aiAnalysisTitle: "تحليل ذكي لأداء الشركة",
    aiAnalysisSubtitle: "تحليل شامل للبيانات باستخدام الذكاء الاصطناعي",
    refresh: "تحديث",
    analyzingLatestData: "جاري تحليل أحدث البيانات...",
    gatheringInsights: "جمع رؤى ذكية من بياناتك",
    lastAnalyzed: "آخر تحليل",
    close: "إغلاق",
    reanalyze: "إعادة التحليل",

    // Statistics section
    statisticsTitle: "الإحصائيات الرئيسية",
    statisticsSubtitle: "نظرة سريعة على أهم المؤشرات",

    // Stats cards
    totalDailyTasks: "إجمالي المهام الروتينية",
    todayTasks: "مهام اليوم الروتينية",
    employees: "الموظفين",
    projects: "المشاريع",
    active: "نشط",
    inactive: "غير نشط",
    completed: "منجز",
    pending: "معلق",
    reported: "مُبلغ عنها",
    notReported: "لم يُبلغ عنها",
    task: "مهمة",
    // One-Time tasks labels
    oneTimeTasks: "مهام لمرة واحدة",
    openTasks: "مهام مفتوحة",
    inProgress: "قيد التنفيذ",
    overdue: "متأخرة",
    dueToday: "مستحقة اليوم",
    dueSoon: "مستحقة قريبًا",
    review: "قيد المراجعة",
    urgent: "عاجلة",

    // Charts section
    chartsTitle: "الرسوم البيانية والتحليلات",
    chartsSubtitle: "تصور مرئي لأداء الأقسام والمهام",
    taskProgressByDept: "تقدم المهام حسب القسم",
    taskProgressSubtitle: "مقارنة المهام المنجزة وغير المنجزة",
    reportsStatus: "حالة التقارير",
    reportsStatusSubtitle: "المهام المُبلغ عنها وغير المُبلغ عنها",
    performanceTrends: "اتجاهات الأداء",
    performanceTrendsSubtitle: "المهام المفتوحة والمراجعة والمنجزة عبر الزمن",

    // Tables section
    tablesTitle: "البيانات التفصيلية",
    tablesSubtitle: "تفاصيل المهام والموظفين حسب الأقسام",
    dailyTasksByDept: "المهام اليومية حسب القسم",
    dailyTasksSubtitle: "تفصيل أداء كل قسم في المهام اليومية",
    employeesByDept: "الموظفين حسب القسم",
    employeesSubtitle: "توزيع الموظفين على الأقسام",

    // Table headers
    department: "القسم",
    totalTasks: "إجمالي المهام",
    reportedTasks: "المُبلغ عنها",
    notReportedTasks: "لم يُبلغ عنها",
    completionRate: "معدل الإنجاز",
    count: "العدد",

    // Status indicators
    done: "منجز",
    notDone: "غير منجز",
    stopped: "متوقف",
    undefined: "غير محدد",
    stable: "مستقر",
    viewDetails: "عرض التفاصيل",

    // Quick Add
    quickAddTask: "إضافة سريعة",
    quickAddRoutineTask: "إضافة مهمة روتينية",
    quickAddOneTimeTask: "إضافة مهمة لمرة واحدة",
    taskName: "اسم المهمة",
    description: "الوصف",
    assignTo: "تعيين إلى",
    selectAssignee: "اختر المكلف",
    selectDepartment: "اختر القسم",
    selectTaskType: "اختر نوع المهمة",
    selectPriority: "اختر الأولوية",
    selectProject: "اختر المشروع",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    deadline: "الموعد النهائي",
    priority: "الأولوية",
    project: "المشروع",
    taskType: "نوع المهمة",
    daily: "يومي",
    weekly: "أسبوعي",
    monthly: "شهري",
    high: "عالية",
    normal: "عادية",
    medium: "متوسطة",
    low: "منخفضة",
    cancel: "إلغاء",
    create: "إنشاء",
    saving: "جاري الحفظ...",
    fillRequiredFields: "يرجى ملء جميع الحقول المطلوبة",
    validationError: "خطأ في التحقق",
    success: "نجح",
    error: "خطأ",
    routineTaskAdded: "تم إضافة المهمة الروتينية بنجاح",
    oneTimeTaskAdded: "تم إضافة المهمة بنجاح",
    routineTaskAddedError: "خطأ في إضافة المهمة الروتينية",
    oneTimeTaskAddedError: "خطأ في إضافة المهمة",
    enterTaskName: "أدخل اسم المهمة",
    enterDescription: "أدخل الوصف",
    searchEmployees: "ابحث عن الموظفين",
    searchProjects: "ابحث عن المشاريع",
    clickToAddPeople: "اضغط لإضافة موظفين",
    clickToEdit: "اضغط للتعديل",
    lastDayOfMonth: "آخر يوم من الشهر",
    selectLastDayOfMonth: "اختر آخر يوم من الشهر",
    selectDays: "اختر الأيام",
    selectDaysOfWeek: "اختر أيام الأسبوع",
    dayOfMonth: "يوم الشهر",
    selectDayOfMonth: "اختر يوم الشهر",
    monday: "الاثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
    sunday: "الأحد"
  }
};

const currentLanguage = computed(() => store.getters.currentLanguage);

const t = (key) => {
  return translations[currentLanguage.value][key] || key;
};

// Bar Chart Data - Task Progress
const taskProgressChartData = computed(() => {
  const depts = dashboardData.value?.DailyTasks?.DailyTaskDepts || [];
  return depts.map(dept => ({
    dept: dept.department_name || t('undefined'),
    [t('done')]: dept.done_reports || 0,
    [t('notDone')]: dept.not_done_reports || 0
  }));
});

// Bar Chart Data - Reports Status
const reportsStatusChartData = computed(() => {
  const depts = dashboardData.value?.DailyTasks?.DailyTaskDepts || [];
  return depts.map(dept => ({
    dept: dept.department_name || t('undefined'),
    [t('reported')]: dept.total_reports || 0,
    [t('notReported')]: (dept.total_tasks || 0) - (dept.total_reports || 0)
  }));
});

// Toggle between charts in a single card
const activeChartIndex = ref(0); // 0 = Task Progress, 1 = Reports Status
const chartsConfig = computed(() => ([
  {
    key: 'taskProgress',
    titleIconClass: 'fas fa-chart-area me-2 text-primary',
    title: t('taskProgressByDept'),
    subtitle: t('taskProgressSubtitle'),
    data: taskProgressChartData.value,
    categories: [t('done'), t('notDone')],
    colors: ['#10b981', '#ef4444']
  },
  {
    key: 'reportsStatus',
    titleIconClass: 'fas fa-chart-bar me-2 text-info',
    title: t('reportsStatus'),
    subtitle: t('reportsStatusSubtitle'),
    data: reportsStatusChartData.value,
    categories: [t('reported'), t('notReported')],
    colors: ['#3b82f6', '#f59e0b']
  }
]));

const activeChart = computed(() => chartsConfig.value[activeChartIndex.value]);

const nextChart = () => {
  activeChartIndex.value = (activeChartIndex.value + 1) % chartsConfig.value.length;
};

const prevChart = () => {
  activeChartIndex.value = (activeChartIndex.value - 1 + chartsConfig.value.length) % chartsConfig.value.length;
};

// Line chart data (Open, Review, Done over time)
// We keep a small rolling history in localStorage keyed by day
// const lineHistoryKey = 'oneTimeTasksHistory';

// function snapshotOneTimeTasks() {
//   const t = dashboardData.value?.Tasks || {};
//   const open = (t.pending || 0) + (t.inProgress || 0);
//   const review = t.review || 0;
//   const done = t.done || 0;
//   const label = new Date().toLocaleDateString();
//   return { label, open, review, done };
// }

// function loadHistory() {
//   try {
//     const raw = localStorage.getItem(lineHistoryKey);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// }

// function saveHistory(history) {
//   localStorage.setItem(lineHistoryKey, JSON.stringify(history));
// }

// Update history whenever dashboardData changes (per fetch)
// watch(() => dashboardData.value?.Tasks, (val) => {
//   if (!val) return;
//   const history = loadHistory();
//   const snap = snapshotOneTimeTasks();
//   // avoid duplicate for same label (day), replace last
//   if (history.length > 0 && history[history.length - 1].label === snap.label) {
//     history[history.length - 1] = snap;
//   } else {
//     history.push(snap);
//   }
//   // keep last 14 entries
//   const trimmed = history.slice(-14);
//   saveHistory(trimmed);
// }, { deep: true });

const performanceLineData = computed(() => {
  const tasks = dashboardData.value?.Tasks || {};
  return [{
    date: new Date().toLocaleDateString(),
    [t('openTasks')]: (tasks.pending || 0) + (tasks.inProgress || 0),
    [t('review')]: tasks.review || 0,
    [t('done')]: tasks.done || 0
  }];
});

// AI Modal Functions
// const openAIModal = async () => {
//   // Mark as opened
//   hasOpenedAI.value = true;
//   localStorage.setItem('hasOpenedAI', 'true');

//   // Show modal
//   showAIModal.value = true;

//   // Load fresh data for AI analysis
//   await refreshAIAnalysis();
// };

const closeAIModal = () => {
  showAIModal.value = false;
};

const refreshAIAnalysis = async () => {
  try {
    isLoadingAI.value = true;

    // Fetch latest dashboard data
    const freshData = await store.dispatch("fetchDashboardData");
    if (freshData) {
      currentAIData.value = freshData;
      aiLastUpdated.value = new Date().toLocaleString();
    }
  } catch (error) {
    console.error('Error refreshing AI analysis:', error);
  } finally {
    isLoadingAI.value = false;
  }
};

// Quick Add Methods
const openQuickAddRoutine = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const dropdownHeight = 500;

  // Calculate position to appear above the card
  let topPosition = rect.top - dropdownHeight - 20;

  // If not enough space above, position below
  if (topPosition < 20) {
    topPosition = rect.bottom + 10;
  }

  buttonPositionRoutine.value = {
    top: topPosition,
    left: Math.max(20, rect.right - 450),
    buttonTop: rect.top + rect.height / 2,
    buttonLeft: rect.left + rect.width / 2
  };

  showQuickAddRoutine.value = true;
  showQuickAddOneTime.value = false;
};

const openQuickAddOneTime = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const dropdownHeight = 450;

  let topPosition = rect.top - dropdownHeight - 20;

  if (topPosition < 20) {
    topPosition = rect.bottom + 10;
  }

  buttonPositionOneTime.value = {
    top: topPosition,
    left: Math.max(20, rect.right - 450),
    buttonTop: rect.top + rect.height / 2,
    buttonLeft: rect.left + rect.width / 2
  };

  showQuickAddOneTime.value = true;
  showQuickAddRoutine.value = false;
};

const closeQuickAdd = () => {
  showQuickAddRoutine.value = false;
  showQuickAddOneTime.value = false;

  // Clear Gmail toolbar state
  showCompactPeople.value = false;
  showClearIcon.value = null;
  showProjectDropdown.value = false;
  showPriorityDropdown.value = false;
  showStartDatePicker.value = false;
  showEndDatePicker.value = false;

  // Clear validation errors
  validationErrors.value = {};

  // Reset forms
  quickRoutineTask.value = {
    task_name: '',
    description: '',
    task_type: '',
    start_date: '',
    dept_id: '',
    from: '',
    to: '',
    recurrent_days: [],
    day_of_month: '',
    last_day_of_month: ''
  };

  quickOneTimeTask.value = {
    title: '',                    // Correct API field
    description: '',
    start_date: '',
    deadline: '',                 // Correct API field
    priority: '',
    assigned_user_id: [],         // Correct API field
    project_id: null,
    supervisor_user_id: null,
    inform_user_id: [],           // Array for multiple selection
    consult_user_id: [],          // Array for multiple selection
    department_id: null
  };
};

// Gmail Toolbar Functions
const expandPeopleSection = () => {
  showCompactPeople.value = !showCompactPeople.value;
};

// Close all dropdowns when clicking on content
const onContentClick = (event) => {
  // Check if click is not on toolbar icons or dropdowns
  if (!event.target.closest('.gmail-toolbar-icon-group') &&
    !event.target.closest('.toolbar-dropdown') &&
    !event.target.closest('.gmail-people-section') &&
    !event.target.closest('.gmail-compact-people-bar')) {
    // Close all toolbar dropdowns
    showProjectDropdown.value = false;
    showPriorityDropdown.value = false;
    showStartDatePicker.value = false;
    showEndDatePicker.value = false;
    // Close people section
    showCompactPeople.value = false;
  }
};

const removeAssignee = (userId) => {
  const index = quickOneTimeTask.value.assigned_user_id.indexOf(userId);
  if (index > -1) {
    quickOneTimeTask.value.assigned_user_id.splice(index, 1);
  }
};

// Match OneTimeTask behavior: clear supervisor and remove from informer/consultant arrays
const removeSupervisor = () => {
  quickOneTimeTask.value.supervisor_user_id = null;
};

const removeInformer = (userId) => {
  const list = quickOneTimeTask.value.inform_user_id;
  const idx = list ? list.indexOf(userId) : -1;
  if (idx > -1) {
    list.splice(idx, 1);
  }
};

const removeConsultant = (userId) => {
  const list = quickOneTimeTask.value.consult_user_id;
  const idx = list ? list.indexOf(userId) : -1;
  if (idx > -1) {
    list.splice(idx, 1);
  }
};

const toggleProjectDropdown = () => {
  showProjectDropdown.value = !showProjectDropdown.value;
  showPriorityDropdown.value = false;
  showStartDatePicker.value = false;
  showEndDatePicker.value = false;

  // Initialize filtered projects when opening
  if (showProjectDropdown.value) {
    filteredProjects.value = formattedProjects.value;
    projectSearchQuery.value = '';
  }
};

const togglePriorityDropdown = () => {
  showPriorityDropdown.value = !showPriorityDropdown.value;
  showProjectDropdown.value = false;
  showStartDatePicker.value = false;
  showEndDatePicker.value = false;

  // Initialize filtered priorities when opening
  if (showPriorityDropdown.value) {
    prioritySearchQuery.value = '';
  }
};

const toggleStartDatePicker = () => {
  showStartDatePicker.value = !showStartDatePicker.value;
  showProjectDropdown.value = false;
  showPriorityDropdown.value = false;
  showEndDatePicker.value = false;
};

const toggleEndDatePicker = () => {
  showEndDatePicker.value = !showEndDatePicker.value;
  showProjectDropdown.value = false;
  showPriorityDropdown.value = false;
  showStartDatePicker.value = false;
};

const clearProject = () => {
  quickOneTimeTask.value.project_id = null;
  projectId.value = null;
  showProjectDropdown.value = false;
};

const clearPriority = () => {
  quickOneTimeTask.value.priority = '';
  priorityValue.value = '';
  showPriorityDropdown.value = false;
};

const clearStartDate = () => {
  quickOneTimeTask.value.start_date = '';
  showStartDatePicker.value = false;
};

const clearEndDate = () => {
  quickOneTimeTask.value.deadline = '';
  showEndDatePicker.value = false;
};

// Toolbar Helpers
const getProjectTooltip = () => {
  if (quickOneTimeTask.value.project_id) {
    const p = formattedProjects.value.find(p => p.value === quickOneTimeTask.value.project_id);
    return p ? `${t('project')}: ${p.label}` : t('project');
  }
  return t('selectProject');
};

const getPriorityTooltip = () => {
  if (quickOneTimeTask.value.priority) {
    const opt = filteredPriorities.value.find(p => p.value === quickOneTimeTask.value.priority);
    return opt ? `${t('priority')}: ${opt.label}` : t('priority');
  }
  return t('selectPriority');
};

// eslint-disable-next-line no-unused-vars
const filterProjects = () => {
  if (!projectSearchQuery.value.trim()) {
    filteredProjects.value = formattedProjects.value;
  } else {
    const q = projectSearchQuery.value.toLowerCase();
    filteredProjects.value = formattedProjects.value.filter(p => p.label.toLowerCase().includes(q));
  }
};

// eslint-disable-next-line no-unused-vars
const filterPriorities = () => {
  const base = [
    { value: 'low', label: t('low') },
    { value: 'normal', label: t('normal') },
    { value: 'high', label: t('high') },
    { value: 'urgent', label: t('urgent') }
  ];
  if (!prioritySearchQuery.value.trim()) {
    filteredPriorities.value = base;
  } else {
    const q = prioritySearchQuery.value.toLowerCase();
    filteredPriorities.value = base.filter(pr => pr.label.toLowerCase().includes(q));
  }
};

// eslint-disable-next-line no-unused-vars
const selectProject = (project) => {
  projectId.value = project.value;
  quickOneTimeTask.value.project_id = project.value;
  projectSearchQuery.value = '';
  showProjectDropdown.value = false;
};

// eslint-disable-next-line no-unused-vars
const selectPriority = (priorityOption) => {
  priorityValue.value = priorityOption.value;
  quickOneTimeTask.value.priority = priorityOption.value;
  prioritySearchQuery.value = '';
  showPriorityDropdown.value = false;
};

// Simple tooltips for dates
const getStartDateTooltip = () => {
  return quickOneTimeTask.value.start_date ? `${t('startDate')}: ${quickOneTimeTask.value.start_date}` : t('enterStartDate');
};

const getEndDateTooltip = () => {
  return quickOneTimeTask.value.deadline ? `${t('endDate')}: ${quickOneTimeTask.value.deadline}` : t('endDate');
};

// Dropdown positioning
const dropdownStyleRoutine = computed(() => ({
  top: `${buttonPositionRoutine.value.top}px`,
  left: `${buttonPositionRoutine.value.left}px`,
  '--btn-top': `${buttonPositionRoutine.value.buttonTop}px`,
  '--btn-left': `${buttonPositionRoutine.value.buttonLeft}px`
}));

const dropdownStyleOneTime = computed(() => ({
  top: `${buttonPositionOneTime.value.top}px`,
  left: `${buttonPositionOneTime.value.left}px`,
  '--btn-top': `${buttonPositionOneTime.value.buttonTop}px`,
  '--btn-left': `${buttonPositionOneTime.value.buttonLeft}px`
}));

// Validation function for Routine Task
const validateRoutineTask = () => {
  validationErrors.value = {
    task_name: !quickRoutineTask.value.task_name,
    task_type: !quickRoutineTask.value.task_type,
    start_date: !quickRoutineTask.value.start_date
  };

  // Add validation for conditional fields if required
  if (quickRoutineTask.value.task_type === 'weekly' && quickRoutineTask.value.recurrent_days.length === 0) {
    validationErrors.value.recurrent_days = true;
  }
  if (quickRoutineTask.value.task_type === 'monthly' && !quickRoutineTask.value.day_of_month) {
    validationErrors.value.day_of_month = true;
  }

  return !Object.values(validationErrors.value).some(v => v === true);
};

// Submit Routine Task - API Integration
const submitQuickRoutineTask = async () => {
  // Clear previous errors
  validationErrors.value = {};

  // Validate
  if (!validateRoutineTask()) {
    Swal.fire({
      icon: 'warning',
      title: t('validationError'),
      text: t('fillRequiredFields'),
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  try {
    isSubmittingRoutine.value = true;

    // Call Vuex action which calls API
    const response = await store.dispatch('addRoutineTask', quickRoutineTask.value);

    if (response.status === 201) {
      Swal.fire({
        icon: 'success',
        title: t('success'),
        text: t('routineTaskAdded'),
        timer: 1500,
        showConfirmButton: false
      });

      closeQuickAdd();

      // Refresh dashboard data
      await fetchAndSaveDashboardData();
    }
  } catch (error) {
    console.error('Error creating routine task:', error);

    Swal.fire({
      icon: 'error',
      title: t('error'),
      html: error.response?.data?.message || error.message || t('routineTaskAddedError'),
      confirmButtonText: t('close')
    });
  } finally {
    isSubmittingRoutine.value = false;
  }
};

// Validation function for One-Time Task
const validateOneTimeTask = () => {
  validationErrors.value = {
    title: !quickOneTimeTask.value.title,
    assigned_user_id: !quickOneTimeTask.value.assigned_user_id ||
      quickOneTimeTask.value.assigned_user_id.length === 0
  };

  return !Object.values(validationErrors.value).some(v => v === true);
};

// Submit One-Time Task - API Integration
const submitQuickOneTimeTask = async () => {
  // Clear previous errors
  validationErrors.value = {};

  // Validate
  if (!validateOneTimeTask()) {
    Swal.fire({
      icon: 'warning',
      title: t('validationError'),
      text: t('fillRequiredFields'),
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  try {
    isSubmittingOneTime.value = true;

    // Ensure assigned_user_id is array (matching OneTimeTask.vue structure)
    const taskData = {
      ...quickOneTimeTask.value,
      assigned_user_id: Array.isArray(quickOneTimeTask.value.assigned_user_id)
        ? quickOneTimeTask.value.assigned_user_id
        : [quickOneTimeTask.value.assigned_user_id].filter(Boolean)
    };

    // Call Vuex action which calls API
    const response = await store.dispatch('createOneTimeTask', taskData);

    if (response.status === 201 || response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: t('success'),
        text: t('oneTimeTaskAdded'),
        timer: 1500,
        showConfirmButton: false
      });

      closeQuickAdd();

      // Refresh dashboard data
      await fetchAndSaveDashboardData();
    }
  } catch (error) {
    console.error('Error creating one-time task:', error);

    Swal.fire({
      icon: 'error',
      title: t('error'),
      html: error.response?.data?.message || error.message || t('oneTimeTaskAddedError'),
      confirmButtonText: t('close')
    });
  } finally {
    isSubmittingOneTime.value = false;
  }
};

// Fetch employees, departments, and projects on mount
onMounted(async () => {
  try {
    await store.dispatch("getCompanyUsers");
    await store.dispatch("fetchDepartments");
    await store.dispatch("fetchProjects");
  } catch (error) {
    console.warn("Error fetching users/departments/projects:", error);
  }

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeQuickAdd();
    }
  };
  document.addEventListener('keydown', handleEscape);

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape);
  });
});
</script>

<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <!-- <div class="dashboard-header">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="dashboard-title">
              <i class="fas fa-tachometer-alt me-3"></i>
              {{ t('dashboard') }}
            </h1>
            <p class="dashboard-subtitle">{{ t('dashboardSubtitle') }}</p>
          </div>
          <div class="col-md-4 text-end">
            <div class="dashboard-controls">
              <button @click="fetchAndSaveDashboardData" class="btn btn-refresh" :disabled="isLoading">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                {{ t('refreshData') }}
              </button>
              <div class="last-update">
                <small>{{ t('lastUpdated') }}: {{ dashboardData.lastUpdated }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Error State -->
    <div v-if="hasError" class="container-fluid mt-4">
      <div class="alert alert-danger border-0 shadow-sm">
        <div class="d-flex align-items-center">
          <i class="fas fa-exclamation-triangle fa-2x text-danger me-3"></i>
          <div class="flex-grow-1">
            <h5 class="alert-heading mb-1">{{ t('errorLoadingData') }}</h5>
            <p class="mb-0">{{ errorMessage }}</p>
          </div>
          <button @click="fetchAndSaveDashboardData" class="btn btn-outline-danger">
            <i class="fas fa-redo me-2"></i>{{ t('retry') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-content">
        <div class="spinner-wrapper">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
        <h4 class="loading-title">{{ t('loadingData') }}</h4>
        <p class="loading-subtitle">{{ t('gatheringInfo') }}</p>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else class="dashboard-content">


      <!-- Statistics Section -->
      <div class="container-fluid mb-5">
        <!-- <div class="section-header mb-4">
          <h3 class="section-title">
            <i class="fas fa-chart-bar me-2"></i>
            {{ t('statisticsTitle') }}
          </h3>
          <p class="section-subtitle">{{ t('statisticsSubtitle') }}</p>
        </div> -->

        <div class="stats-row-container">
          <!-- Merged: Total Daily Tasks + Today's Tasks -->
          <div class="stats-card-v2">
            <div class="card-header-v2">
              <div class="card-icon-title">
                <div class="card-icon icon-primary">
                  <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="card-title-text">
                  {{ t('todayTasks') }}
                  <span class="material-symbols-rounded ms-2 clickable-title" @click="navigateToCard('routine task')"
                    title="Click to view Routine Tasks"
                    style="cursor:pointer; color:#2563eb; font-size: 1.1em; vertical-align: middle;">open_in_new</span>
                </div>
              </div>
              <!-- Quick Add Button -->
              <button @click="openQuickAddRoutine($event)" class="quick-add-btn-top" :title="t('quickAddTask')">
                <i class="fas fa-plus"></i>
              </button>
            </div>

            <div class="card-metric-section">
              <div class="metric-header">
                <div class="main-metric">{{ dashboardData?.DailyTasks?.today_total_daily_tasks || 0 }}</div>
                <span class="trend-badge"
                  :class="(dashboardData?.DailyTasks?.total_reports || 0) > 0 ? 'trend-up' : 'trend-neutral'">
                  <i
                    :class="(dashboardData?.DailyTasks?.total_reports || 0) > 0 ? 'fas fa-arrow-up' : 'fas fa-minus'"></i>
                  {{ dashboardData?.DailyTasks?.total_reports || 0 }} {{ t('reported') }}
                </span>
              </div>
              <div class="metric-subtitle">{{ t('task') }}</div>
            </div>
            <!-- <div class="metric-col">
                <div class="metric-subtitle">{{ t('totalTasks') }}</div>
              </div> -->
            <!-- <div class="metric-divider"></div> -->
            <!-- <div class="metric-col">
                <div class="main-metric">{{ dashboardData?.DailyTasks?.today_total_daily_tasks || 0 }}</div>
              </div> -->

            <div class="card-badges-section">
              <span class="status-pill pill-success">
                <span class="pill-dot"></span>
                {{ dashboardData?.DailyTasks?.done_reports || 0 }} {{ t('done') }}
              </span>
              <span class="status-pill pill-danger">
                <span class="pill-dot"></span>
                {{ dashboardData?.DailyTasks?.not_done_reports || 0 }} {{ t('notDone') }}
              </span>
              <!-- <span class="status-pill pill-primary">
                <span class="pill-dot"></span>
                {{ dashboardData?.DailyTasks?.total_reports || 0 }} {{ t('reported') }}
              </span> -->
              <span class="status-pill pill-warning">
                <span class="pill-dot"></span>
                {{ (dashboardData?.DailyTasks?.today_total_daily_tasks || 0) - (dashboardData?.DailyTasks?.total_reports
                  || 0) }} {{ t('notReported') }}
              </span>
            </div>

            <div class="card-footer-v2">
              <a href="#" class="card-link">{{ t('viewDetails') }} <i class="fas fa-arrow-right ms-1"></i></a>
            </div>
          </div>

          <!-- One-Time Tasks -->
          <div class="stats-card-v2">
            <div class="card-header-v2">
              <div class="card-icon-title">
                <div class="card-icon icon-info">
                  <i class="fas fa-tasks"></i>
                </div>
                <div class="card-title-text" style="font-weight:600;">
                  {{ t('oneTimeTasks') }}
                  <span class="material-symbols-rounded ms-2 clickable-title" @click="navigateToCard('one time task')"
                    title="Click to view One-Time Tasks"
                    style="cursor:pointer; color:#2563eb; font-size: 1.1em; vertical-align: middle;">open_in_new</span>
                </div>
              </div>
              <!-- Quick Add Button -->
              <button @click="openQuickAddOneTime($event)" class="quick-add-btn-top" :title="t('quickAddTask')">
                <i class="fas fa-plus"></i>
              </button>
            </div>

            <div class="card-metric-section">
              <div class="metric-header">
                <div class="main-metric">{{ oneTimeOpenTasks }}</div>
                <span class="trend-badge" :class="(oneTimeUrgent || 0) > 0 ? 'trend-down' : 'trend-neutral'"
                  @click="goToOneTimeTasks('priority', 'urgent')" style="cursor:pointer">
                  <i :class="(oneTimeUrgent || 0) > 0 ? 'fas fa-exclamation-triangle' : 'fas fa-minus'"></i>
                  {{ oneTimeUrgent }} {{ t('urgent') }}
                </span>
              </div>
              <div class="metric-subtitle">{{ t('openTasks') }}</div>
            </div>

            <div class="card-badges-section">
              <!-- <span class="status-pill pill-success">
                <span class="pill-dot"></span>
                {{ dashboardData?.Tasks?.done || 0 }} {{ t('done') }}
              </span> -->

              <!-- <span class="status-pill pill-warning">
                <span class="pill-dot"></span>
                {{ oneTimeOpenTasks }} {{ t('openTasks') }}
              </span> -->

              <!-- <span class="status-pill pill-danger">
                <span class="pill-dot"></span>
                {{ oneTimeUrgent }} {{ t('urgent') }}
              </span> -->

              <span class="status-pill pill-secondary" @click="goToOneTimeTasks('status', 'Review')"
                style="cursor:pointer">
                <span class="pill-dot"></span>
                {{ dashboardData?.Tasks?.review || 0 }} {{ t('review') }}
              </span>

              <span class="status-pill pill-warning" @click="goToOneTimeTasks('due', 'today')" style="cursor:pointer">
                <span class="pill-dot"></span>
                {{ dashboardData?.Tasks?.dueToday || 0 }} {{ t('dueToday') }}
              </span>

              <span class="status-pill pill-warning" @click="goToOneTimeTasks('due', 'soon')" style="cursor:pointer">
                <span class="pill-dot"></span>
                {{ dashboardData?.Tasks?.dueSoon || 0 }} {{ t('dueSoon') }}
              </span>

              <span class="status-pill pill-danger" @click="goToOneTimeTasks('due', 'overdue')" style="cursor:pointer">
                <span class="pill-dot"></span>
                {{ dashboardData?.Tasks?.overdue || 0 }} {{ t('overdue') }}
              </span>
            </div>

            <!-- <div class="card-footer-v2">
              <a href="#" class="card-link">{{ t('viewDetails') }} <i class="fas fa-arrow-right ms-1"></i></a>
            </div> -->
          </div>



          <!-- Projects -->
          <div class="stats-card-v2">
            <div class="card-header-v2">
              <div class="card-icon-title">
                <div class="card-icon icon-warning">
                  <i class="fas fa-folder-open"></i>
                </div>
                <div class="card-title-text">
                  {{ t('projects') }}
                  <span class="material-symbols-rounded ms-2 clickable-title" @click="navigateToCard('project')"
                    title="Click to view Projects"
                    style="cursor:pointer; color:#2563eb; font-size: 1.1em; vertical-align: middle;">open_in_new</span>
                </div>
              </div>
            </div>

            <div class="card-metric-section">
              <div class="metric-header">
                <div class="main-metric">{{ dashboardData?.Projects?.total || 0 }}</div>
                <span class="trend-badge" :class="dashboardData?.Projects?.active > 0 ? 'trend-up' : 'trend-neutral'">
                  <i :class="dashboardData?.Projects?.active > 0 ? 'fas fa-arrow-up' : 'fas fa-minus'"></i>
                  {{ dashboardData?.Projects?.active || 0 }} {{ t('active') }}
                </span>
              </div>
              <div class="metric-subtitle">{{ t('active') }} / {{ t('stopped') }}</div>
            </div>

            <div class="card-badges-section">
              <span class="status-pill pill-success">
                <span class="pill-dot"></span>
                {{ dashboardData?.Projects?.active || 0 }} {{ t('active') }}
              </span>
              <span class="status-pill pill-secondary">
                <span class="pill-dot"></span>
                {{ dashboardData?.Projects?.inactive || 0 }} {{ t('stopped') }}
              </span>
            </div>

            <div class="card-footer-v2">
              <a href="#" class="card-link">{{ t('viewDetails') }} <i class="fas fa-arrow-right ms-1"></i></a>
            </div>
          </div>

          <!-- Employees -->
          <div class="stats-card-v2">
            <div class="card-header-v2">
              <div class="card-icon-title">
                <div class="card-icon icon-success">
                  <i class="fas fa-users"></i>
                </div>
                <div class="card-title-text">
                  {{ t('employees') }}
                  <span class="material-symbols-rounded ms-2 clickable-title" @click="navigateToCard('team')"
                    title="Click to view Team/Employees"
                    style="cursor:pointer; color:#2563eb; font-size: 1.1em; vertical-align: middle;">open_in_new</span>
                </div>
              </div>
            </div>

            <div class="card-metric-section">
              <div class="metric-header">
                <div class="main-metric">{{ dashboardData?.Emps?.total || 0 }}</div>
                <!-- <span class="trend-badge" :class="dashboardData?.Emps?.invited > 0 ? 'trend-up' : 'trend-neutral'">
                  <i :class="dashboardData?.Emps?.invited > 0 ? 'fas fa-arrow-up' : 'fas fa-minus'"></i>
                  {{ dashboardData?.Emps?.invited || 0 }} {{ t('active') }}
                </span> -->
              </div>
              <div class="metric-subtitle">{{ t('active') }}</div>
            </div>

            <div class="card-badges-section">
              <!-- <span class="status-pill pill-success">
                <span class="pill-dot"></span>
                {{ dashboardData?.Emps?.invited || 0 }} {{ t('active') }}
              </span> -->
              <span class="status-pill pill-warning">
                <span class="pill-dot"></span>
                {{ dashboardData?.Emps?.pending || 0 }} {{ t('pending') }}
              </span>
            </div>

            <div class="card-footer-v2">
              <a href="#" class="card-link">{{ t('viewDetails') }} <i class="fas fa-arrow-right ms-1"></i></a>
            </div>
          </div>


        </div>
      </div>

      <!-- Charts Section (Merged with Toggle + Line Trends side by side) -->
      <div class="container-fluid mb-5">
        <div class="row g-4">
          <div class="col-lg-6 col-12">
            <div class="chart-card">
              <div class="chart-card-body-with-header">
                <div class="chart-inline-header">
                  <div>
                    <h5 class="chart-title-inline">
                      <i :class="activeChart.titleIconClass"></i>
                      {{ activeChart.title }}
                    </h5>
                    <p class="chart-subtitle-inline">{{ activeChart.subtitle }}</p>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-light" @click="prevChart" title="Prev">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="btn btn-sm btn-light" @click="nextChart" title="Next">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
                <div class="chart-content">
                  <ShBar v-if="!isLoading && activeChart.data.length > 0" :key="activeChart.key"
                    :data="activeChart.data" index="dept" :categories="activeChart.categories"
                    :colors="activeChart.colors" type="grouped" :show-grid-line="true" :rounded-corners="12" />
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6 col-12">
            <div class="chart-card">
              <div class="chart-card-body-with-header">
                <div class="chart-inline-header">
                  <div>
                    <h5 class="chart-title-inline">
                      <i class="fas fa-chart-bar me-2 text-primary"></i>
                      {{ t('performanceTrends') }}
                    </h5>
                    <p class="chart-subtitle-inline">{{ t('performanceTrendsSubtitle') }}</p>
                  </div>
                </div>
                <div class="chart-content">
                  <ShBar :data="performanceLineData" index="date" :categories="[t('openTasks'), t('review'), t('done')]"
                    :colors="['#f59e0b', '#3b82f6', '#10b981']" type="grouped" :show-grid-line="true"
                    :rounded-corners="12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating AI Widget -->
      <!-- <div class="floating-ai-widget">
        <div class="ai-widget-trigger" @click="openAIModal" :class="{ 'pulse': !hasOpenedAI }">
          <div class="ai-icon">
            <i class="fas fa-robot"></i>
          </div>
          <div class="ai-label">
            <span class="ai-text">{{ t('aiAnalysis') }}</span>
            <div class="ai-badge-mini">AI</div>
          </div>
        </div>
      </div> -->

      <!-- AI Analysis Sidebar -->
      <div v-if="showAIModal" class="ai-sidebar-overlay" @click="closeAIModal">
        <div class="ai-sidebar-container" @click.stop>
          <div class="ai-sidebar-content">
            <div class="ai-sidebar-header bg-gradient-primary text-white">
              <div class="d-flex align-items-center">
                <div class="sidebar-ai-icon me-3">
                  <i class="fas fa-robot"></i>
                </div>
                <div>
                  <h4 class="sidebar-title mb-1">
                    {{ t('aiAnalysisTitle') }}
                  </h4>
                  <p class="mb-0 opacity-75">{{ t('aiAnalysisSubtitle') }}</p>
                </div>
              </div>
              <!-- <div class="d-flex align-items-center gap-3">
                <button @click="refreshAIAnalysis" class="btn btn-outline-light btn-sm" :disabled="isLoadingAI">
                  <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoadingAI }"></i>
                  {{ t('refresh') }}
                </button>
                <button type="button" class="btn-close btn-close-white" @click="closeAIModal"
                  aria-label="Close"></button>
              </div> -->
            </div>
            <div class="ai-sidebar-body">
              <!-- Loading State for AI -->
              <div v-if="isLoadingAI" class="ai-sidebar-loading">
                <div class="ai-loading-animation">
                  <div class="ai-spinner">
                    <div class="ai-brain">
                      <div class="brain-wave"></div>
                      <div class="brain-wave"></div>
                      <div class="brain-wave"></div>
                    </div>
                  </div>
                  <h5 class="mt-3">{{ t('analyzingLatestData') }}</h5>
                  <p class="text-muted">{{ t('gatheringInsights') }}</p>
                </div>
              </div>

              <!-- AI Analysis Content -->
              <div v-else class="ai-sidebar-content-inner">
                <AIAnalysisCard :dashboard-data="currentAIData" />
              </div>
            </div>
            <div class="ai-sidebar-footer bg-light">
              <div class="d-flex justify-content-between align-items-center w-100">
                <small class="text-muted">
                  <i class="fas fa-clock me-1"></i>
                  {{ t('lastAnalyzed') }}: <br> {{ aiLastUpdated }}
                </small>
                <div>
                  <button type="button" class="btn btn-secondary me-2" @click="closeAIModal">
                    {{ t('close') }}
                  </button>
                  <button @click="refreshAIAnalysis" class="btn btn-primary" :disabled="isLoadingAI">
                    <i class="fas fa-redo me-1"></i>
                    {{ t('reanalyze') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Tables Section -->
      <!-- <div class="container-fluid mb-5"> -->
      <!-- <div class="section-header mb-4">
          <h3 class="section-title">
            <i class="fas fa-table me-2"></i>
            {{ t('tablesTitle') }}
          </h3>
          <p class="section-subtitle">{{ t('tablesSubtitle') }}</p>
        </div> -->

      <!-- <div class="row g-4"> -->
      <!-- Daily Tasks by Department Table -->
      <!-- <div class="col-lg-8 col-12">
            <div class="data-table-card">
              <div class="data-table-header">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <h5 class="table-title mb-1">
                      <i class="fas fa-clipboard-list me-2 text-primary"></i>
                      {{ t('dailyTasksByDept') }}
                    </h5>
                    <p class="table-subtitle">{{ t('dailyTasksSubtitle') }}</p>
                  </div>
                  <button @click="fetchAndSaveDashboardData" class="btn btn-refresh-table" :disabled="isLoading">
                    <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                  </button>
                </div>
              </div>
              <div class="data-table-body">
                <div class="table-responsive">
                  <table v-if="dashboardData" class="table table-modern">
                    <thead>
                      <tr>
                        <th class="table-header">
                          <i class="fas fa-building me-2"></i>
                          {{ t('department') }}
                        </th>
                        <th class="table-header text-center">
                          <i class="fas fa-tasks me-2"></i>
                          {{ t('totalTasks') }}
                        </th>
                        <th class="table-header text-center">
                          <i class="fas fa-file-alt me-2"></i>
                          {{ t('reportedTasks') }}
                        </th>
                        <th class="table-header text-center">
                          <i class="fas fa-file-excel me-2"></i>
                          {{ t('notReportedTasks') }}
                        </th>
                        <th class="table-header text-center">
                          <i class="fas fa-chart-pie me-2"></i>
                          {{ t('completionRate') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(dept, index) in dashboardData?.DailyTasks?.DailyTaskDepts || []" :key="index"
                        class="table-row">
                        <td class="department-cell">
                          <div class="department-info">
                            <div class="department-icon">
                              <i class="fas fa-users"></i>
                            </div>
                            <div class="department-name">{{ dept.department_name || t('undefined') }}</div>
                          </div>
                        </td>
                        <td class="text-center">
                          <span class="stats-badge bg-light text-dark">{{ dept.total_tasks || 0 }}</span>
                        </td>
                        <td class="text-center">
                          <div class="reported-stats">
                            <span class="stats-badge bg-primary text-white">{{ dept.total_reports || 0 }}</span>
                            <div class="mt-1">
                              <span class="mini-badge bg-success">{{ dept.done_reports || 0 }} {{ t('done') }}</span>
                              <span class="mini-badge bg-danger">{{ dept.not_done_reports || 0 }} {{ t('notDone')
                              }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="text-center">
                          <span class="stats-badge bg-warning text-dark">{{ (dept.total_tasks || 0) -
                            (dept.total_reports || 0) }}</span>
                        </td>
                        <td class="text-center">
                          <div class="progress-wrapper">
                            <div class="progress progress-sm">
                              <div class="progress-bar"
                                :class="getProgressBarClass((dept.total_reports > 0 ? (dept.done_reports / dept.total_reports * 100) : 0))"
                                :style="{ width: (dept.total_reports > 0 ? (dept.done_reports / dept.total_reports * 100) : 0) + '%' }">
                              </div>
                            </div>
                            <span class="progress-text">{{ dept.total_reports > 0 ? ((dept.done_reports /
                              dept.total_reports * 100).toFixed(1)) : 0 }}%</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div> -->

      <!-- Employees by Department Table -->
      <!-- <div class="col-lg-4 col-12">
            <div class="data-table-card">
              <div class="data-table-header">
                <div>
                  <h5 class="table-title mb-1">
                    <i class="fas fa-users me-2 text-success"></i>
                    {{ t('employeesByDept') }}
                  </h5>
                  <p class="table-subtitle">{{ t('employeesSubtitle') }}</p>
                </div>
              </div>
              <div class="data-table-body">
                <div class="table-responsive">
                  <table v-if="dashboardData" class="table table-modern">
                    <thead>
                      <tr>
                        <th class="table-header">
                          <i class="fas fa-building me-2"></i>
                          {{ t('department') }}
                        </th>
                        <th class="table-header text-center">
                          <i class="fas fa-user-friends me-2"></i>
                          {{ t('count') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(dept, index) in dashboardData?.Departments?.Departments || []" :key="index"
                        class="table-row">
                        <td class="department-cell">
                          <div class="department-info compact">
                            <div class="department-icon small">
                              <i class="fas fa-users"></i>
                            </div>
                            <div class="department-name">{{ dept.department_name || t('undefined') }}</div>
                          </div>
                        </td>
                        <td class="text-center">
                          <span class="stats-badge bg-success text-white">{{ dept.total_users || 0 }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div> -->
      <!-- </div> -->
      <!-- </div> -->
    </div>

    <!-- Quick Add Routine Task Dropdown -->
    <transition name="emerge-from-button">
      <div v-if="showQuickAddRoutine" class="quick-add-backdrop" @click="closeQuickAdd">
        <div class="quick-add-dropdown routine-dropdown" @click.stop :style="dropdownStyleRoutine">

          <!-- Gmail-style header -->
          <div class="gmail-quick-header">
            <div class="gmail-quick-header-left">
              <span class="gmail-quick-title">
                <i class="fas fa-sync me-2"></i>
                {{ t('quickAddRoutineTask') }}
              </span>
            </div>
            <div class="gmail-quick-header-right">
              <button @click="closeQuickAdd" class="gmail-quick-btn gmail-quick-close" title="Close">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div class="quick-add-body">
            <!-- Task Name -->
            <div>
              <!-- <label class="form-label small text-muted mb-1">{{ t('taskName') }} *</label> -->
              <ArgonInput id="quick-routine-task-name" v-model="quickRoutineTask.task_name" type="text"
                :placeholder="t('enterTaskName')" size="sm" :error="validationErrors.task_name" />
            </div>

            <!-- Description -->
            <div class="mb-2">
              <!-- <label class="form-label small text-muted mb-1">{{ t('description') }}</label> -->
              <ArgonTextarea id="quick-routine-description" v-model="quickRoutineTask.description"
                :placeholder="t('enterDescription')" :rows="2" />
            </div>

            <!-- Task Type -->
            <div class="mb-2">
              <!-- <label class="form-label small text-muted mb-1">{{ t('taskType') }} *</label> -->
              <ArgonSelect v-model="quickRoutineTask.task_type" :options="taskTypeOptions"
                :placeholder="t('selectTaskType')" :searchable="false" :error="validationErrors.task_type" />
            </div>

            <!-- Weekly Options -->
            <div v-if="showWeeklyOptions" class="row mb-2">
              <div class="col-12 ">
                <!-- <label class="form-label small text-muted mb-1">{{ t('selectDays') }}</label> -->
                <ArgonMultipleSelect v-model="quickRoutineTask.recurrent_days" :options="weekDaysOptions"
                  :placeholder="t('selectDaysOfWeek')" :searchable="false" class="w-100" />
              </div>
            </div>

            <!-- Monthly Options -->
            <div v-if="showMonthlyOptions" class="row mb-2">
              <div class="col-12 ">
                <!-- <label class="form-label small text-muted mb-1">{{ t('dayOfMonth') }}</label> -->
                <ArgonSelect v-model="quickRoutineTask.day_of_month" :options="monthDaysOptions"
                  :placeholder="t('selectDayOfMonth')" :searchable="true" />
              </div>
            </div>

            <!-- Last Day of Month Options (no additional fields needed) -->
            <div v-if="showLastDayOfMonthOptions" class="row mb-2">
              <div class="col-12 ">
                <!-- <label class="form-label small text-muted mb-1">{{ t('lastDayOfMonth') }}</label> -->
                <ArgonSelect v-model="quickRoutineTask.last_day_of_month" :options="lastDayOfMonthOptions"
                  :placeholder="t('selectLastDayOfMonth')" :searchable="true" />
              </div>
            </div>



            <div class="row mb-2">

              <!-- Department -->
              <div class="col-md-6 ">
                <!-- <label class="form-label small text-muted mb-1">{{ t('department') }}</label> -->
                <ArgonSelect v-model="quickRoutineTask.dept_id" :options="formattedDepartments"
                  :placeholder="t('selectDepartment')" :searchable="true" />
              </div>

              <!-- Start Date -->
              <div class="col-md-6 ">
                <!-- <label class="form-label small text-muted mb-1">{{ t('startDate') }} *</label> -->
                <ArgonInput id="quick-routine-start-date" type="date" v-model="quickRoutineTask.start_date" size="sm"
                  :error="validationErrors.start_date" />
              </div>
            </div>

            <div class="row mb-2">


              <!-- From Time -->
              <div class="col-md-6 ">
                <!-- <label class="form-label small text-muted mb-1">{{ t('from') }}</label> -->
                <ArgonInput id="quick-routine-from" type="time" v-model="quickRoutineTask.from" size="sm" />
              </div>

              <!-- To Time -->
              <div class="col-md-6 ">
                <!-- <label class="form-label small text-muted mb-1">{{ t('to') }}</label> -->
                <ArgonInput id="quick-routine-to" type="time" v-model="quickRoutineTask.to" size="sm" />
              </div>
            </div>


          </div>

          <div class="quick-add-footer">
            <ArgonButton color="light" size="sm" @click="closeQuickAdd" class="me-2">
              <i class="fas fa-times me-1"></i>
              {{ t('cancel') }}
            </ArgonButton>
            <ArgonButton color="success" size="sm" @click="submitQuickRoutineTask" :disabled="isSubmittingRoutine">
              <span v-if="isSubmittingRoutine" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
              {{ isSubmittingRoutine ? t('saving') : t('create') }}
            </ArgonButton>
          </div>
        </div>
      </div>
    </transition>

    <!-- Quick Add One-Time Task Dropdown -->
    <transition name="emerge-from-button">
      <div v-if="showQuickAddOneTime" class="quick-add-backdrop" @click="closeQuickAdd">
        <div class="quick-add-dropdown onetime-dropdown" @click.stop :style="dropdownStyleOneTime">

          <!-- Gmail-style header -->
          <div class="gmail-quick-header">
            <div class="gmail-quick-header-left">
              <span class="gmail-quick-title">
                <i class="fas fa-tasks me-2"></i>
                {{ t('quickAddOneTimeTask') }}
              </span>
            </div>
            <div class="gmail-quick-header-right">
              <button @click="closeQuickAdd" class="gmail-quick-btn gmail-quick-close" title="Close">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Gmail-style content -->
          <div class="gmail-quick-content" @click="onContentClick">
            <div class="gmail-quick-scroll">

              <!-- شريط الأشخاص المضغوط -->
              <div v-show="!showCompactPeople" class="gmail-compact-people-bar mb-2">
                <div class="gmail-compact-content" @click="expandPeopleSection">
                  <div class="gmail-compact-tags">
                    <template v-if="hasSelectedPeople">

                      <!-- Assign To -->
                      <span v-if="quickOneTimeTask.assigned_user_id && quickOneTimeTask.assigned_user_id.length > 0"
                        class="gmail-compact-tag assignee">
                        <i class="fas fa-user"></i>:
                      </span>
                      <span v-for="userId in quickOneTimeTask.assigned_user_id" :key="userId"
                        class="gmail-compact-person-name">
                        {{ getEmployeeName(userId) }}
                        <i class="fas fa-times mx-1" @click.stop="removeAssignee(userId)"></i>
                      </span>

                      <!-- Supervisor -->
                      <span v-if="quickOneTimeTask.supervisor_user_id" class="gmail-compact-tag supervisor">
                        <i class="fas fa-user-tie"></i>:
                      </span>
                      <span v-if="quickOneTimeTask.supervisor_user_id" class="gmail-compact-person-name">
                        {{ getEmployeeName(quickOneTimeTask.supervisor_user_id) }}
                        <i class="fas fa-times mx-1" @click.stop="removeSupervisor()"></i>
                      </span>

                      <!-- Informer -->
                      <span v-if="quickOneTimeTask.inform_user_id && quickOneTimeTask.inform_user_id.length > 0"
                        class="gmail-compact-tag informer">
                        <i class="fas fa-bell"></i>:
                      </span>
                      <span v-for="userId in quickOneTimeTask.inform_user_id" :key="userId"
                        class="gmail-compact-person-name">
                        {{ getEmployeeName(userId) }}
                        <i class="fas fa-times mx-1" @click.stop="removeInformer(userId)"></i>
                      </span>

                      <!-- Consultant -->
                      <span v-if="quickOneTimeTask.consult_user_id && quickOneTimeTask.consult_user_id.length > 0"
                        class="gmail-compact-tag consultant">
                        <i class="fas fa-user-graduate"></i>:
                      </span>
                      <span v-for="userId in quickOneTimeTask.consult_user_id" :key="userId"
                        class="gmail-compact-person-name">
                        {{ getEmployeeName(userId) }}
                        <i class="fas fa-times mx-1" @click.stop="removeConsultant(userId)"></i>
                      </span>
                    </template>
                    <template v-else>
                      <span class="gmail-compact-placeholder">
                        <i class="fas fa-users"></i>
                        {{ t('clickToAddPeople') }}
                      </span>
                    </template>
                  </div>
                  <span class="gmail-compact-hint">{{ t('clickToEdit') }}</span>
                </div>
              </div>

              <!-- حقول الأشخاص -->
              <div v-show="showCompactPeople" class="gmail-people-section mb-2" @click.stop>
                <!-- To Field (Assignee) -->
                <div class="gmail-people-row">
                  <div class="gmail-row-content w-100">
                    <div class="w-100">
                      <ArgonTagsInput v-model="quickOneTimeTask.assigned_user_id" :options="employeeOptions"
                        :placeholder="t('selectAssignee')" class="gmail-people-input" />
                    </div>
                    <div class="gmail-shortcuts">
                      <a href="#" @click.prevent="showCcFields = !showCcFields" class="gmail-shortcut-link">
                        {{ showCcFields ? '-' : '' }}SV
                      </a>
                      <a href="#" @click.prevent="showBccFields = !showBccFields" class="gmail-shortcut-link">
                        {{ showBccFields ? '-' : '' }}IN/CN
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Cc Field (Supervisor) -->
                <div v-show="showCcFields" class="gmail-people-row">
                  <div class="gmail-row-content w-100">
                    <ArgonSelect v-model="quickOneTimeTask.supervisor_user_id" :options="employeeOptions"
                      :placeholder="t('selectSupervisor')" class="gmail-people-input w-100" :searchable="true"
                      :search-placeholder="t('searchEmployees')" />
                  </div>
                </div>

                <!-- Bcc Fields (Informer + Consultant) -->
                <div v-show="showBccFields" class="gmail-people-row">
                  <div class="gmail-row-content w-100">
                    <!-- Informer -->
                    <div class="mb-2 w-100">
                      <ArgonTagsInput v-model="quickOneTimeTask.inform_user_id" :options="employeeOptions"
                        :placeholder="t('selectInformer')" class="gmail-people-input" />
                    </div>

                    <!-- Consultant -->
                    <div class="w-100">
                      <ArgonTagsInput v-model="quickOneTimeTask.consult_user_id" :options="employeeOptions"
                        :placeholder="t('selectConsultant')" class="gmail-people-input" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- حقل اسم المهمة -->
              <div class="gmail-field">
                <ArgonInput v-model="quickOneTimeTask.title" class="gmail-input gmail-title-input"
                  :placeholder="t('enterTaskName')" dir="auto" :error="validationErrors.title" />
              </div>

              <!-- حقل الوصف -->
              <div class="gmail-field">
                <ArgonTextarea v-model="quickOneTimeTask.description" class="gmail-textarea"
                  :placeholder="t('enterDescription')" :rows="2" dir="auto" />
              </div>

              <!-- شريط الأدوات مع الأيقونات -->
              <div class="gmail-toolbar mb-2">
                <!-- Project Icon -->
                <div class="gmail-toolbar-icon-group">
                  <div class="gmail-toolbar-icon" :class="{ 'has-value': quickOneTimeTask.project_id }"
                    @mouseenter="() => { }" :title="getProjectTooltip()" @click="toggleProjectDropdown">
                    <i class="fas fa-project-diagram"></i>
                    <span v-if="quickOneTimeTask.project_id" class="gmail-icon-indicator" @click.stop="clearProject">
                      <span v-if="showClearIcon === 'project'" class="clear-icon">✕</span>
                      <span v-else>✓</span>
                    </span>
                  </div>
                  <span class="gmail-icon-label">{{ t("project") }}</span>

                  <!-- Project Dropdown -->
                  <div v-show="showProjectDropdown" class="toolbar-dropdown" @click.stop>
                    <div class="toolbar-dropdown-content">
                      <div class="toolbar-search-container mb-3">
                        <input v-model="projectSearchQuery" type="text" class="toolbar-search-input"
                          :placeholder="t('searchProjects')" @input="filterProjects" />
                      </div>
                      <div class="toolbar-options-container">
                        <div v-for="project in filteredProjects" :key="project.value" class="toolbar-option-item"
                          :class="{ 'selected': quickOneTimeTask.project_id === project.value }"
                          @click="selectProject(project)">
                          <span class="toolbar-option-text">{{ project.label }}</span>
                          <i v-if="quickOneTimeTask.project_id === project.value"
                            class="fas fa-check toolbar-option-check"></i>
                        </div>
                        <div v-if="filteredProjects.length === 0" class="toolbar-no-results">
                          {{ t('noResultsFound') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Priority Icon -->
                <div class="gmail-toolbar-icon-group">
                  <div class="gmail-toolbar-icon" :class="{ 'has-value': quickOneTimeTask.priority }"
                    @mouseenter="() => { }" :title="getPriorityTooltip()" @click="togglePriorityDropdown">
                    <i class="fas fa-flag"></i>
                    <span v-if="quickOneTimeTask.priority" class="gmail-icon-indicator" @click.stop="clearPriority">
                      <span v-if="showClearIcon === 'priority'" class="clear-icon">✕</span>
                      <span v-else>✓</span>
                    </span>
                  </div>
                  <span class="gmail-icon-label">{{ t("priority") }}</span>

                  <!-- Priority Dropdown -->
                  <div v-show="showPriorityDropdown" class="toolbar-dropdown" @click.stop>
                    <div class="toolbar-dropdown-content">
                      <div class="toolbar-search-container mb-3">
                        <input v-model="prioritySearchQuery" type="text" class="toolbar-search-input"
                          :placeholder="t('searchPriorities')" @input="filterPriorities" />
                      </div>
                      <div class="toolbar-options-container">
                        <div v-for="priorityOption in filteredPriorities" :key="priorityOption.value"
                          class="toolbar-option-item"
                          :class="{ 'selected': quickOneTimeTask.priority === priorityOption.value }"
                          @click="selectPriority(priorityOption)">
                          <span class="toolbar-option-text">{{ priorityOption.label }}</span>
                          <i v-if="quickOneTimeTask.priority === priorityOption.value"
                            class="fas fa-check toolbar-option-check"></i>
                        </div>
                        <div v-if="filteredPriorities.length === 0" class="toolbar-no-results">
                          {{ t('noResultsFound') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Start Date Icon -->
                <div class="gmail-toolbar-icon-group">
                  <div class="gmail-toolbar-icon" :class="{ 'has-value': quickOneTimeTask.start_date }"
                    @mouseenter="() => { }" :title="getStartDateTooltip()" @click="toggleStartDatePicker">
                    <i class="fas fa-calendar-plus"></i>
                    <span v-if="quickOneTimeTask.start_date" class="gmail-icon-indicator" @click.stop="clearStartDate">
                      <span v-if="showClearIcon === 'startDate'" class="clear-icon">✕</span>
                      <span v-else>✓</span>
                    </span>
                  </div>
                  <span class="gmail-icon-label">{{ t("startDate") }}*</span>

                  <!-- Start Date Picker -->
                  <div v-show="showStartDatePicker" class="toolbar-dropdown" @click.stop>
                    <div class="toolbar-dropdown-content">
                      <ArgonInput type="date" v-model="quickOneTimeTask.start_date"
                        :placeholder="t('enterStartDate')" />
                    </div>
                  </div>
                </div>

                <!-- End Date Icon -->
                <div class="gmail-toolbar-icon-group">
                  <div class="gmail-toolbar-icon" :class="{ 'has-value': quickOneTimeTask.deadline }"
                    @mouseenter="() => { }" :title="getEndDateTooltip()" @click="toggleEndDatePicker">
                    <i class="fas fa-calendar-check"></i>
                    <span v-if="quickOneTimeTask.deadline" class="gmail-icon-indicator" @click.stop="clearEndDate">
                      <span v-if="showClearIcon === 'endDate'" class="clear-icon">✕</span>
                      <span v-else>✓</span>
                    </span>
                  </div>
                  <span class="gmail-icon-label">{{ t("endDate") }}</span>

                  <!-- End Date Picker -->
                  <div v-show="showEndDatePicker" class="toolbar-dropdown" @click.stop>
                    <div class="toolbar-dropdown-content">
                      <ArgonInput type="date" v-model="quickOneTimeTask.deadline" :placeholder="t('enterEndDate')" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Gmail-style footer -->
          <div class="gmail-quick-footer">
            <ArgonButton color="light" size="sm" @click="closeQuickAdd" class="me-2">
              <i class="fas fa-times me-1"></i>
              {{ t('cancel') }}
            </ArgonButton>
            <ArgonButton color="success" size="sm" @click="submitQuickOneTimeTask" :disabled="isSubmittingOneTime">
              <span v-if="isSubmittingOneTime" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
              {{ isSubmittingOneTime ? t('saving') : t('create') }}
            </ArgonButton>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Dashboard Container */
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

/* Header Styles */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dashboard-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

.dashboard-controls {
  text-align: right;
}

.btn-refresh {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
  transform: translateY(-2px);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.last-update {
  margin-top: 0.5rem;
  opacity: 0.8;
}

/* Loading Styles */
.loading-container {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
}

.spinner-wrapper {
  margin-bottom: 2rem;
}

/* .spinner-border {
  width: 4rem;
  height: 4rem;
  border-width: 0.4rem;
} */

.loading-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.loading-subtitle {
  color: #6c757d;
  margin: 0;
}

/* Dashboard Content */
.dashboard-content {
  padding-bottom: 3rem;
}

/* Section Headers */
.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

/* AI Analysis Section */
.ai-analysis-section {
  position: relative;
}

.ai-badge {
  position: absolute;
  top: -10px;
  right: 20px;
}

/* Stats Row Container */
.stats-row-container {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* ========================================
   V2 Card Design - Professional & Modern
   ======================================== */

.stats-card-v2 {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 18px;
  flex: 1;
  min-width: 220px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stats-card-v2::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, transparent);
  transition: all 0.3s ease;
}

.stats-card-v2:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.12);
}

.stats-card-v2:hover::before {
  background: linear-gradient(90deg, #667eea, #764ba2);
}

/* Card Header with Icon & Title */
.card-header-v2 {
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-icon-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  color: rgb(255, 255, 255);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.stats-card-v2:hover .card-icon {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

/* Helpers for merged metric layout (keeps existing style scale) */
.metric-split {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.metric-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-divider {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
}

.card-title-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.01em;
}

/* Main Metric Section */
.card-metric-section {
  margin-bottom: 12px;
}

.metric-header {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  margin-bottom: 4px;
  gap: 12px;
}

.main-metric {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1;
  letter-spacing: -0.03em;
}

.metric-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

/* Trend Section - Moved inside metric section */
.card-trend-section {
  margin-bottom: 12px;
}

.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.trend-badge i {
  font-size: 0.65rem;
}

.trend-up {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.trend-down {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.trend-neutral {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

/* Status Pills Section */
.card-badges-section {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.pill-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}

.status-pill.pill-success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-pill.pill-success .pill-dot {
  background: #10b981;
}

.status-pill.pill-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-pill.pill-danger .pill-dot {
  background: #ef4444;
}

.status-pill.pill-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-pill.pill-warning .pill-dot {
  background: #f59e0b;
}

.status-pill.pill-secondary {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

.status-pill.pill-secondary .pill-dot {
  background: #94a3b8;
}

.status-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Card Footer */
.card-footer-v2 {
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.card-link {
  color: #667eea;
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.card-link:hover {
  color: #5568d3;
  gap: 7px;
}

.card-link i {
  font-size: 0.65rem;
  transition: transform 0.2s ease;
}

/* Stats Cards - Professional Design */
.stats-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: visible;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
  min-width: 200px;
  position: relative;
}

.stats-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.08);
}

.stats-card-header {
  padding: 0.875rem 1rem 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  background: transparent;
}

.stats-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
}

.stats-card:hover .stats-icon {
  transform: scale(1.05);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.stats-icon::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.stats-icon i {
  font-size: 1.2rem;
  color: white;
  position: relative;
  z-index: 1;
}

.stats-card-body {
  padding: 0.5rem 1rem 0.875rem;
  text-align: left;
}

.stats-number {
  font-size: 1.625rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.1;
  margin-bottom: 0.125rem;
  letter-spacing: -0.02em;
}

.stats-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.stats-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: flex-start;
}

.stats-details .badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.2rem 0.45rem;
  border-radius: 5px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  line-height: 1.3;
}

/* Compact Stats Cards */
.stats-card.compact {
  padding: 0;
}

.stats-card.compact .stats-card-header {
  padding: 0.875rem 1rem 0;
}

.stats-card.compact .stats-card-body {
  padding: 0.5rem 1rem 0.875rem;
}

.stats-card.compact .stats-number {
  font-size: 1.625rem;
  margin-bottom: 0.125rem;
}

.stats-card.compact .stats-title {
  font-size: 0.7rem;
  margin-bottom: 0.5rem;
}

.stats-card.compact .stats-icon {
  width: 42px;
  height: 42px;
}

.stats-card.compact .stats-icon i {
  font-size: 1.2rem;
}

/* Icon Color Variants - Professional Gradients */
.card-icon.icon-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.icon-info {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.card-icon.icon-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.card-icon.icon-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stats-icon.icon-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.icon-info {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.stats-icon.icon-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stats-icon.icon-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

/* Badge Enhancements */
.stats-details .badge.bg-success {
  background: #10b981 !important;
  color: white;
}

.stats-details .badge.bg-danger {
  background: #ef4444 !important;
  color: white;
}

.stats-details .badge.bg-primary {
  background: #3b82f6 !important;
  color: white;
}

.stats-details .badge.bg-warning {
  background: #f59e0b !important;
  color: white;
}

.stats-details .badge.bg-secondary {
  background: #6b7280 !important;
  color: white;
}

/* Chart Cards */
.chart-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* New Inline Header Layout */
.chart-card-body-with-header {
  padding: 1.25rem;
}

.chart-inline-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.chart-title-inline {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.chart-subtitle-inline {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.chart-legend-inline {
  display: flex;
  gap: 0.875rem;
  align-items: center;
  flex-wrap: wrap;
}

.legend-item-inline {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: #4a5568;
  font-weight: 500;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.chart-content {
  min-height: 320px;
}

/* Old styles - keep for backward compatibility */
.chart-card-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #dee2e6;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.chart-subtitle {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #4a5568;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.chart-card-body {
  padding: 1.5rem;
}

/* Data Table Cards */
.data-table-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
}

.data-table-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #dee2e6;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.table-subtitle {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.btn-refresh-table {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-refresh-table:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.data-table-body {
  max-height: 500px;
  overflow-y: auto;
}

/* Modern Table Styles */
.table-modern {
  margin: 0;
  border-collapse: separate;
  border-spacing: 0;
}

.table-header {
  background: linear-gradient(135deg, #babcbe 0%, 0#808286 100%);
  color: rgb(0, 0, 0);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 1rem 0.75rem;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-header:first-child {
  border-top-left-radius: 0;
}

.table-header:last-child {
  border-top-right-radius: 0;
}

.table-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid #e2e8f0;
}

.table-row:hover {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.department-cell {
  padding: 1rem 0.75rem;
}

.department-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.department-info.compact {
  gap: 0.5rem;
}

.department-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
}

.department-icon.small {
  width: 32px;
  height: 32px;
  font-size: 0.8rem;
}

.department-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
}

.stats-badge {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  border: none;
  display: inline-block;
}

.mini-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  margin: 0 0.125rem;
}

.reported-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Progress Wrapper */
.progress-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-sm {
  height: 8px;
  background: #e2e8f0;
  border-radius: 50px;
  overflow: hidden;
  width: 80px;
}

.progress-bar {
  height: 100%;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stats-row-container {
    gap: 1.25rem;
  }

  .stats-card {
    min-width: 180px;
  }

  .stats-card-v2 {
    min-width: 220px;
  }
}

@media (max-width: 992px) {
  .stats-row-container {
    gap: 1rem;
  }

  .stats-card {
    flex: 1 1 calc(50% - 0.5rem);
    min-width: 160px;
  }

  .stats-card-v2 {
    flex: 1 1 calc(50% - 0.5rem);
    min-width: 200px;
    padding: 16px;
  }

  .main-metric {
    font-size: 2rem;
  }

  .card-header-v2 {
    margin-bottom: 10px;
  }

  .card-metric-section {
    margin-bottom: 10px;
  }

  .metric-header {
    gap: 8px;
  }

  .card-badges-section {
    margin-bottom: 10px;
  }
}

/* ====== ArgonMultipleSelect Width Fix ====== */
.selected-options {
  width: 100% !important;
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 120px;
  /* Limit height */
  overflow-y: auto;
  /* Scroll if too many */
}

.selected-option {
  display: inline-flex;
  align-items: center;
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  max-width: calc(33.333% - 4px);
  /* Max 3 per row */
  word-wrap: break-word;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-remove {
  margin-left: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #f44336;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.btn-remove:hover {
  background-color: #f44336;
  color: white;
}

@media (max-width: 768px) {
  .dashboard-title {
    font-size: 2rem;
  }

  .dashboard-subtitle {
    font-size: 1rem;
  }

  .dashboard-controls {
    text-align: center;
    margin-top: 1rem;
  }

  .stats-row-container {
    gap: 0.75rem;
  }

  .stats-card {
    flex: 1 1 calc(50% - 0.375rem);
    min-width: 140px;
  }

  .stats-number {
    font-size: 1.5rem;
  }

  .stats-card.compact .stats-number {
    font-size: 1.5rem;
  }

  .stats-card.compact .stats-icon {
    width: 40px;
    height: 40px;
  }

  .stats-card.compact .stats-icon i {
    font-size: 1.125rem;
  }

  .stats-title {
    font-size: 0.7rem;
  }

  .stats-details .badge {
    font-size: 0.625rem;
    padding: 0.2rem 0.4rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .chart-legend {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .chart-inline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .chart-legend-inline {
    gap: 0.5rem;
  }

  .department-info {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}

@media (max-width: 576px) {
  .stats-row-container {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-card {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .stats-card-v2 {
    flex: 1 1 100%;
    min-width: 100%;
    padding: 16px;
  }

  .main-metric {
    font-size: 1.875rem;
  }

  .card-icon {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }

  .card-title-text {
    font-size: 0.8125rem;
  }

  .status-pill {
    font-size: 0.65rem;
    padding: 4px 8px;
  }

  .trend-badge {
    font-size: 0.65rem;
    padding: 4px 8px;
  }

  .card-header-v2 {
    margin-bottom: 10px;
  }

  .card-metric-section {
    margin-bottom: 8px;
  }

  .metric-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .card-badges-section {
    margin-bottom: 8px;
  }

  .card-footer-v2 {
    padding-top: 10px;
  }
}

/* Floating AI Widget */
.floating-ai-widget {
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1040;
}

.ai-widget-trigger {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50px 0 0 50px;
  padding: 15px 20px 15px 15px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  transform: translateX(60px);
  min-width: 60px;
}

.ai-widget-trigger:hover {
  transform: translateX(0);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
}

.ai-widget-trigger.pulse {
  animation: pulseGlow 2s infinite;
}

@keyframes pulseGlow {

  0%,
  100% {
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    transform: translateX(60px);
  }

  50% {
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6), 0 0 30px rgba(102, 126, 234, 0.4);
    transform: translateX(45px);
  }
}

.ai-icon {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  font-size: 1.2rem;
}

.ai-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 100px;
}

.ai-text {
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1;
}

.ai-badge-mini {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-top: 2px;
  backdrop-filter: blur(10px);
}

/* AI Sidebar Styling */
.ai-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(3px);
  z-index: 1050;
  animation: fadeIn 0.3s ease;
}

.ai-sidebar-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  height: 100vh;
  background: white;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
  animation: slideInRight 0.4s ease;
  display: flex;
  flex-direction: column;
}

.ai-sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ai-sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.ai-sidebar-body {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
}

.ai-sidebar-content-inner {
  padding: 1rem;
  height: 100%;
}

.ai-sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  flex-shrink: 0;
}

.sidebar-ai-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  font-size: 1.5rem;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ai-modal-loading {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.ai-loading-animation {
  text-align: center;
}

.ai-spinner {
  margin-bottom: 2rem;
}

.ai-brain {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: brainPulse 2s infinite;
}

.brain-wave {
  width: 4px;
  height: 20px;
  background: white;
  margin: 0 2px;
  border-radius: 2px;
  animation: brainWave 1.5s infinite ease-in-out;
}

.brain-wave:nth-child(1) {
  animation-delay: 0s;
}

.brain-wave:nth-child(2) {
  animation-delay: 0.2s;
}

.brain-wave:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes brainPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

@keyframes brainWave {

  0%,
  100% {
    transform: scaleY(0.5);
    opacity: 0.7;
  }

  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.ai-modal-content {
  padding: 1.5rem;
}

/* Sidebar Responsiveness */
@media (max-width: 992px) {
  .ai-sidebar-container {
    width: 400px;
  }
}

@media (max-width: 768px) {
  .floating-ai-widget {
    right: 15px;
  }

  .ai-widget-trigger {
    padding: 12px 15px 12px 12px;
    transform: translateX(70px);
  }

  .ai-widget-trigger:hover {
    transform: translateX(10px);
  }

  .ai-label {
    min-width: 80px;
  }

  .ai-text {
    font-size: 0.8rem;
  }

  .ai-sidebar-container {
    width: 100%;
    max-width: 100vw;
  }

  .ai-sidebar-header {
    padding: 1rem;
  }

  .ai-sidebar-content-inner {
    padding: 0.75rem;
  }

  .ai-sidebar-footer {
    padding: 0.75rem 1rem;
  }

  .ai-sidebar-loading {
    min-height: 300px;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ai-loading-animation {
    text-align: center;
  }

  .ai-spinner {
    margin-bottom: 2rem;
  }

  .ai-brain {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(45deg, #667eea, #764ba2);
    margin: 0 auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
  }

  .brain-wave {
    width: 4px;
    height: 20px;
    background: white;
    margin: 0 2px;
    border-radius: 2px;
    animation: wave 1.5s infinite ease-in-out;
  }

  .brain-wave:nth-child(1) {
    animation-delay: 0s;
  }

  .brain-wave:nth-child(2) {
    animation-delay: 0.2s;
  }

  .brain-wave:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pulse {

    0%,
    100% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.1);
    }
  }

  @keyframes wave {

    0%,
    100% {
      transform: scaleY(0.5);
      opacity: 0.7;
    }

    50% {
      transform: scaleY(1);
      opacity: 1;
    }
  }
}

/* Enhanced Light Mode Styling */
.dashboard-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Better contrast for readability */
.section-title {
  color: #1a202c;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.section-subtitle {
  color: #4a5568;
}

/* Enhanced card visibility */
.stats-card,
.chart-card,
.data-table-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
}

/* Better text contrast */
.stats-number {
  color: #1a202c;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.chart-title,
.table-title {
  color: #1a202c;
}

/* ========================================
   Quick Add Feature Styles
   ======================================== */

/* Quick Add Button - Top Right */
.quick-add-btn-top {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.quick-add-btn-top:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.quick-add-btn-top:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.quick-add-btn-top i {
  transition: transform 0.3s ease;
}

.quick-add-btn-top:hover i {
  transform: rotate(90deg);
}

/* Backdrop */
.quick-add-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dropdown - Positioned Above Card */
.quick-add-dropdown {
  position: fixed;
  width: 450px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 9999;
  transform-origin: var(--btn-left, 50%) var(--btn-top, 50%);
}

.quick-add-header {
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.quick-add-header h5 {
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.btn-close-dropdown {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-dropdown:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.quick-add-body {
  padding: 0.9rem;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
  flex: 1;
}

.quick-add-body .form-label {
  font-weight: 500;
  color: #64748b;
}

.quick-add-body .form-control,
.quick-add-body .form-select {
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.quick-add-body .form-control:focus,
.quick-add-body .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.quick-add-footer {
  padding: 1rem 1.25rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Animation - Emerge from Button */
.emerge-from-button-enter-active {
  animation: emergeFromButton 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.emerge-from-button-leave-active {
  animation: shrinkToButton 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes emergeFromButton {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(50px);
    filter: blur(10px);
  }

  60% {
    opacity: 0.9;
    transform: scale(1.05) translateY(-5px);
    filter: blur(0px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0px);
  }
}

@keyframes shrinkToButton {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0px);
  }

  100% {
    opacity: 0;
    transform: scale(0.3) translateY(30px);
    filter: blur(10px);
  }
}

/* Backdrop animation */
.quick-add-backdrop {
  animation: backdropFadeIn 0.3s ease;
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }

  to {
    opacity: 1;
    backdrop-filter: blur(3px);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .quick-add-dropdown {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 90% !important;
    max-width: 400px !important;
  }

  .quick-add-btn-top {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .quick-add-body {
    padding: 1rem;
  }

  .quick-add-footer {
    padding: 0.875rem 1rem;
  }
}

/* RTL Support for Quick Add */
.rtl .quick-add-header {
  direction: rtl;
}

.rtl .quick-add-body {
  direction: rtl;
}

.rtl .quick-add-footer {
  direction: rtl;
  justify-content: flex-start;
}

/* ========================================
   Gmail-Style Quick Add Modal Styles
   ======================================== */

/* Gmail Header */
.gmail-quick-header {
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.gmail-quick-header-left {
  display: flex;
  align-items: center;
}

.gmail-quick-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.gmail-quick-header-right {
  display: flex;
  align-items: center;
}

.gmail-quick-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.gmail-quick-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.gmail-quick-close:hover {
  background: #ea4335;
  color: white;
}

/* Gmail Content */
.gmail-quick-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gmail-quick-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* Compact People Bar */
.gmail-compact-people-bar {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gmail-compact-people-bar:hover {
  border-color: #ccc;
  background: #f5f5f5;
}

.gmail-compact-content {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gmail-compact-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.gmail-compact-tag {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.gmail-compact-tag.assignee {
  color: #ffffff;
}

/* Align tag color variants with OneTimeTask.vue */
.gmail-compact-tag.supervisor {
  background: #28a745;
  color: #fff;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
}

.gmail-compact-tag.informer {
  background: #ffc107;
  color: #212529;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
}

.gmail-compact-tag.consultant {
  background: #6f42c1;
  color: #fff;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
}

.gmail-compact-person-name {
  background: #e9ecef;
  /* match OneTimeTask */
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #dee2e6;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.gmail-compact-placeholder {
  color: #999;
  font-size: 12px;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 4px;
}

.gmail-compact-hint {
  font-size: 11px;
  color: #666;
  font-style: italic;
}

/* People Section */
.gmail-people-section {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0;
  background: white;
}

.gmail-people-row {
  display: flex;
  align-items: flex-start;
  padding: 6px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.gmail-people-row:last-child {
  border-bottom: none;
}

.gmail-row-label {
  min-width: 50px;
  padding-top: 8px;
  color: #5f6368;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.gmail-row-content {
  flex: 1;
  /* display: flex; */
  align-items: center;
  /* gap: 8px; */
  /* flex-wrap: wrap; */
}

.gmail-row-content>.w-100 {
  flex: 0 0 100%;
}

.gmail-shortcuts {
  display: flex;
  gap: 8px;
  margin-left: 8px;
  padding-top: 8px;
  flex-shrink: 0;
}

.gmail-shortcut-link {
  color: #1a73e8;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  transition: color 0.2s;
  white-space: nowrap;
}

.gmail-shortcut-link:hover {
  color: #174ea6;
  text-decoration: underline;
}

.gmail-bcc-label {
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 4px;
  font-weight: 500;
}

.gmail-people-field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gmail-field-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  min-width: 60px;
  flex-shrink: 0;
}

.gmail-people-input {
  width: 100%;
}

/* Gmail Fields */
.gmail-field {
  margin-bottom: 4px;
}

/* إزالة تأثير form-group على جميع الحقول */
.gmail-field :deep(.form-group),
.gmail-field :deep(.input-group) {
  margin-bottom: 0 !important;
  border: none !important;
  padding: 0 !important;
  background: transparent !important;
}

/* تم نقل z-index إلى ملف z-index-variables.css الموحد */

.gmail-input {
  border: none;
  border-radius: 0;
  background: transparent;
  width: 100%;
  padding: 6px 8px;
}

.gmail-input:focus {
  border-bottom-color: #1a73e8;
  outline: none;
  box-shadow: none;
}

.gmail-title-input {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.gmail-textarea {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  background: white;
  width: 100%;
  min-height: 64px;
  line-height: 1.4;
  resize: vertical;
}

.gmail-textarea:focus {
  border-color: #1a73e8;
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

/* Gmail Toolbar */
.gmail-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  border-top: 1px solid #e0e0e0;
  margin-top: 8px;
}

.gmail-toolbar-icon-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}

.gmail-toolbar-icon {
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.gmail-toolbar-icon:hover {
  border-color: #ccc;
  background: #f5f5f5;
}

.gmail-toolbar-icon.has-value {
  border-color: #1a73e8;
  background: #e8f0fe;
  color: #1a73e8;
}

.gmail-toolbar-icon i {
  font-size: 16px;
}

.gmail-icon-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #1a73e8;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.clear-icon {
  font-size: 12px;
  font-weight: bold;
}

.gmail-icon-label {
  font-size: 11px;
  color: #666;
  text-align: center;
  font-weight: 500;
}

/* Toolbar Dropdown Styles */
.toolbar-dropdown {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  width: 255px;
  max-height: 300px;
  overflow: visible;
  animation: toolbarDropdownSlideUp 0.2s ease;
  z-index: 1000;
  margin-bottom: 8px;
}

/* للأيقونات في النهاية - يفتح من اليمين */
.gmail-toolbar-icon-group:nth-last-child(-n+2) .toolbar-dropdown {
  left: auto;
  right: auto;
  transform: none;
}

/* للأيقونات في البداية - يفتح من اليسار */
.gmail-toolbar-icon-group:nth-child(-n+2) .toolbar-dropdown {
  left: 0;
  right: auto;
  transform: none;
}

@keyframes toolbarDropdownSlideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation للأيقونات المتوسطة */
.gmail-toolbar-icon-group:nth-child(n+3):nth-last-child(n+3) .toolbar-dropdown {
  animation: toolbarDropdownSlideUpCenter 0.2s ease;
}

@keyframes toolbarDropdownSlideUpCenter {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toolbar-dropdown-content {
  display: flex;
  flex-direction: column;
  padding: 16px;
  max-height: 300px;
  overflow: hidden;
}

.toolbar-search-container {
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
  padding-bottom: 8px;
}

.toolbar-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.toolbar-search-input:focus {
  outline: none;
  border-color: #a6c956;
  box-shadow: 0 0 0 0.2rem rgba(166, 201, 86, 0.25);
}

.toolbar-options-container {
  flex: 1;
  overflow-y: auto;
  max-height: none;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
  scrollbar-width: thin;
  scrollbar-color: #ced4da #f8f9fa;
}

/* تحسين scrollbar في WebKit browsers */
.toolbar-options-container::-webkit-scrollbar {
  width: 6px;
}

.toolbar-options-container::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 3px;
}

.toolbar-options-container::-webkit-scrollbar-thumb {
  background: #ced4da;
  border-radius: 3px;
}

.toolbar-options-container::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

.toolbar-option-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.toolbar-option-item:last-child {
  border-bottom: none;
}

.toolbar-option-item:hover {
  background-color: #f8f9fa;
}

.toolbar-option-item.selected {
  background-color: #e8f5e8;
  border-left: 3px solid #a6c956;
}

.toolbar-option-text {
  color: #495057;
  font-size: 0.9rem;
}

.toolbar-option-check {
  color: #a6c956;
  font-size: 0.8rem;
}

.toolbar-no-results {
  padding: 20px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

/* Gmail Footer */
.gmail-quick-footer {
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

/* Mobile Responsive for Gmail Styles */
@media (max-width: 768px) {
  .gmail-toolbar {
    flex-wrap: wrap;
    gap: 12px;
  }

  .gmail-toolbar-icon-group {
    flex: 1;
    min-width: calc(50% - 6px);
  }

  .gmail-toolbar-icon {
    width: 36px;
    height: 36px;
  }

  .gmail-toolbar-icon i {
    font-size: 14px;
  }

  .gmail-icon-label {
    font-size: 10px;
  }

  .gmail-people-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .gmail-field-label {
    min-width: auto;
  }
}

/* RTL Support for Gmail Styles */
.rtl .gmail-quick-header {
  direction: rtl;
}

.rtl .gmail-quick-content {
  direction: rtl;
}

.rtl .gmail-quick-footer {
  direction: rtl;
  justify-content: flex-start;
}

.rtl .gmail-people-field {
  direction: rtl;
}

.rtl .gmail-toolbar {
  direction: rtl;
}

/* إزالة تأثير form-group على جميع الحقول في Routine Task */
.routine-dropdown .form-label,
.routine-dropdown .mb-1,
.routine-dropdown .col-md-6,
.routine-dropdown .col-12 {
  margin-bottom: 4px !important;
}

.routine-dropdown :deep(.form-group),
.routine-dropdown :deep(.input-group) {
  margin-bottom: 0 !important;
  border: none !important;
  padding: 0 !important;
  background: transparent !important;
}

.routine-dropdown :deep(.form-control),
.routine-dropdown :deep(.form-select) {
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px !important;
  padding: 6px 8px !important;
}

/* ====== Gmail-toolbar adjustments ====== */
.gmail-toolbar,
.gmail-toolbar-icon-group {
  overflow: visible;
}

/* ====== Dropdown نفسه ====== */
.toolbar-dropdown {
  overflow: visible;
}

/* ====== محتوى dropdown ====== */
.toolbar-dropdown-content {
  padding: 16px;
}

/* ====== قائمة الخيارات: Scroll هنا فقط ====== */
.toolbar-options-container {
  max-height: 220px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ced4da #f8f9fa;
}

/* WebKit Scrollbar */
.toolbar-options-container::-webkit-scrollbar {
  width: 6px;
}

.toolbar-options-container::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 3px;
}

.toolbar-options-container::-webkit-scrollbar-thumb {
  background: #ced4da;
  border-radius: 3px;
}

.toolbar-options-container::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}
</style>
