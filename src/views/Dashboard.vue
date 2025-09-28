// Dashboard.vue
<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";
import AIAnalysisCard from "@/components/AIAnalysisCard.vue";
import { useStore } from "vuex";


const store = useStore();
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
const hasOpenedAI = ref(localStorage.getItem('hasOpenedAI') === 'true');
const showAIModal = ref(false);

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
const getProgressBarClass = (percentage) => {
  if (percentage >= 80) return 'bg-success';
  if (percentage >= 60) return 'bg-warning';
  if (percentage >= 40) return 'bg-info';
  return 'bg-danger';
};

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
    totalDailyTasks: "Total Daily Tasks",
    todayTasks: "Today's Tasks",
    employees: "Employees",
    projects: "Projects",
    active: "Active",
    inactive: "Inactive",
    completed: "Completed",
    pending: "Pending",
    reported: "Reported",
    notReported: "Not Reported",

    // Charts section
    chartsTitle: "Charts and Analytics",
    chartsSubtitle: "Visual representation of department and task performance",
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
    undefined: "Undefined"
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
    totalDailyTasks: "إجمالي المهام اليومية",
    todayTasks: "مهام اليوم",
    employees: "الموظفين",
    projects: "المشاريع",
    active: "نشط",
    inactive: "غير نشط",
    completed: "منجز",
    pending: "معلق",
    reported: "مُبلغ عنها",
    notReported: "لم يُبلغ عنها",

    // Charts section
    chartsTitle: "الرسوم البيانية والتحليلات",
    chartsSubtitle: "تصور مرئي لأداء الأقسام والمهام",
    taskProgressByDept: "تقدم المهام حسب القسم",
    taskProgressSubtitle: "مقارنة المهام المنجزة وغير المنجزة",
    reportsStatus: "حالة التقارير",
    reportsStatusSubtitle: "المهام المُبلغ عنها وغير المُبلغ عنها",

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
    undefined: "غير محدد"
  }
};

const currentLanguage = computed(() => store.getters.currentLanguage);

const t = (key) => {
  return translations[currentLanguage.value][key] || key;
};

// AI Modal Functions
const openAIModal = async () => {
  // Mark as opened
  hasOpenedAI.value = true;
  localStorage.setItem('hasOpenedAI', 'true');

  // Show modal
  showAIModal.value = true;

  // Load fresh data for AI analysis
  await refreshAIAnalysis();
};

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

        <div class="row g-4">
          <!-- Total Daily Tasks -->
          <div class="col-xl-3 col-lg-6 col-md-6 col-12">
            <div class="stats-card">
              <div class="stats-card-header bg-gradient-primary">
                <div class="stats-icon">
                  <i class="fas fa-tasks"></i>
                </div>
              </div>
              <div class="stats-card-body">
                <div class="stats-number">{{ dashboardData?.AllDailyTasks?.total || 0 }}</div>
                <div class="stats-title">{{ t('totalDailyTasks') }}</div>
                <div class="stats-details">
                  <span class="badge bg-success me-2">
                    <i class="fas fa-check-circle me-1"></i>
                    {{ dashboardData?.AllDailyTasks?.active || 0 }} {{ t('active') }}
                  </span>
                  <span class="badge bg-danger">
                    <i class="fas fa-times-circle me-1"></i>
                    {{ dashboardData?.AllDailyTasks?.inActive || 0 }} {{ t('inactive') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Today's Tasks -->
          <div class="col-xl-3 col-lg-6 col-md-6 col-12">
            <div class="stats-card">
              <div class="stats-card-header bg-gradient-info">
                <div class="stats-icon">
                  <i class="fas fa-calendar-day"></i>
                </div>
              </div>
              <div class="stats-card-body">
                <div class="stats-number">{{ dashboardData?.DailyTasks?.today_total_daily_tasks || 0 }}</div>
                <div class="stats-title">{{ t('todayTasks') }}</div>
                <div class="stats-details">
                  <div class="mb-1">
                    <span class="badge bg-primary me-2">
                      <i class="fas fa-file-alt me-1"></i>
                      {{ dashboardData?.DailyTasks?.total_reports || 0 }} {{ t('reported') }}
                    </span>
                  </div>
                  <div>
                    <span class="badge bg-success me-1">{{ dashboardData?.DailyTasks?.done_reports || 0 }} {{ t('done')
                    }}</span>
                    <span class="badge bg-danger me-1">{{ dashboardData?.DailyTasks?.not_done_reports || 0 }} {{
                      t('notDone') }}</span>
                    <span class="badge bg-warning">{{ (dashboardData?.DailyTasks?.today_total_daily_tasks || 0) -
                      (dashboardData?.DailyTasks?.total_reports || 0) }} {{ t('notReported') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Employees -->
          <div class="col-xl-3 col-lg-6 col-md-6 col-12">
            <div class="stats-card">
              <div class="stats-card-header bg-gradient-success">
                <div class="stats-icon">
                  <i class="fas fa-users"></i>
                </div>
              </div>
              <div class="stats-card-body">
                <div class="stats-number">{{ dashboardData?.Emps?.total || 0 }}</div>
                <div class="stats-title">{{ t('employees') }}</div>
                <div class="stats-details">
                  <span class="badge bg-success me-2">
                    <i class="fas fa-user-check me-1"></i>
                    {{ dashboardData?.Emps?.invited || 0 }} {{ t('active') }}
                  </span>
                  <span class="badge bg-warning">
                    <i class="fas fa-user-clock me-1"></i>
                    {{ dashboardData?.Emps?.pending || 0 }} {{ t('pending') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Projects -->
          <div class="col-xl-3 col-lg-6 col-md-6 col-12">
            <div class="stats-card">
              <div class="stats-card-header bg-gradient-warning">
                <div class="stats-icon">
                  <i class="fas fa-project-diagram"></i>
                </div>
              </div>
              <div class="stats-card-body">
                <div class="stats-number">{{ dashboardData?.Projects?.total || 0 }}</div>
                <div class="stats-title">{{ t('projects') }}</div>
                <div class="stats-details">
                  <span class="badge bg-success me-2">
                    <i class="fas fa-play-circle me-1"></i>
                    {{ dashboardData?.Projects?.active || 0 }} {{ t('active') }}
                  </span>
                  <span class="badge bg-secondary">
                    <i class="fas fa-pause-circle me-1"></i>
                    {{ dashboardData?.Projects?.inactive || 0 }} {{ t('stopped') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="container-fluid mb-5">
        <div class="section-header mb-4">
          <h3 class="section-title">
            <i class="fas fa-chart-line me-2"></i>
            {{ t('chartsTitle') }}
          </h3>
          <p class="section-subtitle">{{ t('chartsSubtitle') }}</p>
        </div>

        <div class="row g-4">
          <!-- Tasks Progress Chart -->
          <div class="col-lg-6 col-12">
            <div class="chart-card">
              <div class="chart-card-header">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <h5 class="chart-title mb-1">
                      <i class="fas fa-chart-area me-2 text-primary"></i>
                      {{ t('taskProgressByDept') }}
                    </h5>
                    <p class="chart-subtitle">{{ t('taskProgressSubtitle') }}</p>
                  </div>
                  <div class="chart-legend">
                    <span class="legend-item">
                      <span class="legend-color bg-success"></span>
                      {{ t('done') }}
                    </span>
                    <span class="legend-item">
                      <span class="legend-color bg-danger"></span>
                      {{ t('notDone') }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="chart-card-body">
                <gradient-line-chart v-if="!isLoading" id="chart-line" :chart="{
                  labels: (
                    dashboardData?.DailyTasks?.DailyTaskDepts || []
                  ).map((dept) => dept.department_name),
                  datasets: [
                    {
                      label: t('completed'),
                      data: (
                        dashboardData?.DailyTasks?.DailyTaskDepts || []
                      ).map((dept) => dept.done_reports || 0),
                    },
                    {
                      label: t('notDone'),
                      data: (
                        dashboardData?.DailyTasks?.DailyTaskDepts || []
                      ).map((dept) => dept.not_done_reports || 0),
                    }
                  ],
                }" />
              </div>
            </div>
          </div>

          <!-- Tasks Status Chart -->
          <div class="col-lg-6 col-12">
            <div class="chart-card">
              <div class="chart-card-header">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <h5 class="chart-title mb-1">
                      <i class="fas fa-chart-bar me-2 text-info"></i>
                      {{ t('reportsStatus') }}
                    </h5>
                    <p class="chart-subtitle">{{ t('reportsStatusSubtitle') }}</p>
                  </div>
                  <div class="chart-legend">
                    <span class="legend-item">
                      <span class="legend-color bg-primary"></span>
                      {{ t('reported') }}
                    </span>
                    <span class="legend-item">
                      <span class="legend-color bg-warning"></span>
                      {{ t('notReported') }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="chart-card-body">
                <gradient-line-chart v-if="!isLoading" id="chart-line2" :chart="{
                  labels: (
                    dashboardData?.DailyTasks?.DailyTaskDepts || []
                  ).map((dept) => dept.department_name),
                  datasets: [
                    {
                      label: t('reported'),
                      data: (
                        dashboardData?.DailyTasks?.DailyTaskDepts || []
                      ).map((dept) => dept.total_reports || 0),
                    },
                    {
                      label: t('notReported'),
                      data: (
                        dashboardData?.DailyTasks?.DailyTaskDepts || []
                      ).map((dept) => (dept.total_tasks || 0) - (dept.total_reports || 0)),
                    },
                  ],
                }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating AI Widget -->
      <div class="floating-ai-widget">
        <div class="ai-widget-trigger" @click="openAIModal" :class="{ 'pulse': !hasOpenedAI }">
          <div class="ai-icon">
            <i class="fas fa-robot"></i>
          </div>
          <div class="ai-label">
            <span class="ai-text">{{ t('aiAnalysis') }}</span>
            <div class="ai-badge-mini">AI</div>
          </div>
        </div>
      </div>

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
      <div class="container-fluid mb-5">
        <div class="section-header mb-4">
          <h3 class="section-title">
            <i class="fas fa-table me-2"></i>
            {{ t('tablesTitle') }}
          </h3>
          <p class="section-subtitle">{{ t('tablesSubtitle') }}</p>
        </div>

        <div class="row g-4">
          <!-- Daily Tasks by Department Table -->
          <div class="col-lg-8 col-12">
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
          </div>

          <!-- Employees by Department Table -->
          <div class="col-lg-4 col-12">
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
          </div>
        </div>
      </div>
    </div>
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

.spinner-border {
  width: 4rem;
  height: 4rem;
  border-width: 0.4rem;
}

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

/* Stats Cards */
.stats-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stats-card-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.stats-card-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent);
  /* animation: shimmer 3s infinite; */
}

/* @keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }

  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
} */

.stats-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.stats-icon i {
  font-size: 1.5rem;
  color: white;
}

.stats-card-body {
  padding: 1.5rem;
  text-align: center;
}

.stats-number {
  font-size: 3rem;
  font-weight: 800;
  color: #2d3748;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stats-title {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 1rem;
}

.stats-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.stats-details .badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
}

/* Chart Cards */
.chart-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
}

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

  .stats-number {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .chart-legend {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .department-info {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
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
</style>
