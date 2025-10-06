<script setup>
import { ref, computed, onBeforeMount, watch } from "vue";
import ShBar from "@/components/charts/ShBar.vue";
import { useStore } from "vuex";

const store = useStore();

const t = (key) => {
    return translations[currentLanguage.value][key] || key;
};

const translations = {
    en: {
        chartsAndAnalytics: "Charts and Analytics",
        visualRepresentation: "Visual representation of department and task performance",
        taskProgressByDept: "Task Progress by Department",
        comparisonOfTasks: "Comparison of completed and incomplete tasks",
        reportsStatus: "Reports Status",
        reportedAndUnreported: "Reported and unreported tasks",
        departmentPerformance: "Department Performance",
        overallPerformanceRate: "Overall performance rate by department",
        done: "Done",
        notDone: "Not Done",
        reported: "Reported",
        notReported: "Not Reported",
        performance: "Performance",
        noDataHere: "No Data Here in this range",
        from: "From",
        to: "To",
        getData: "Get Data",
        loading: "Loading...",
        department: "Department"
    },
    ar: {
        chartsAndAnalytics: "الرسوم البيانية والتحليلات",
        visualRepresentation: "تمثيل مرئي لأداء الأقسام والمهام",
        taskProgressByDept: "تقدم المهام حسب القسم",
        comparisonOfTasks: "مقارنة المهام المنجزة وغير المنجزة",
        reportsStatus: "حالة التقارير",
        reportedAndUnreported: "المهام المُبلغ عنها وغير المُبلغ عنها",
        departmentPerformance: "أداء الأقسام",
        overallPerformanceRate: "معدل الأداء الإجمالي حسب القسم",
        done: "منجز",
        notDone: "غير منجز",
        reported: "مُبلغ عنها",
        notReported: "لم يُبلغ عنها",
        performance: "الأداء",
        noDataHere: "لا يوجد بيانات هنا في هذه الفترة",
        from: "من",
        to: "إلى",
        getData: "جلب البيانات",
        loading: "جاري التحميل...",
        department: "القسم"
    }
};

const currentLanguage = computed(() => store.getters.currentLanguage);

const fromDate = ref("");
const toDate = ref("");

// Watch for from date changes
watch(fromDate, (newFrom) => {
    if (newFrom && toDate.value < newFrom) {
        toDate.value = newFrom;
    }
});

// Watch for to date changes
watch(toDate, (newTo) => {
    if (newTo && fromDate.value > newTo) {
        fromDate.value = newTo;
    }
});

const isLoading = ref(true);

// Dashboard data for daily tasks
const dashboardData = computed(() => store.state.dashboardData);

// Department performance data
const chartDeptPerformance = computed(() => store.state.chartDeptPerformance);

// Computed data for Task Progress chart
const taskProgressData = computed(() => {
    const depts = dashboardData.value?.DailyTasks?.DailyTaskDepts || [];
    return depts.map(dept => ({
        dept: dept.department_name || t('undefined'),
        [t('done')]: dept.done_reports || 0,
        [t('notDone')]: dept.not_done_reports || 0
    }));
});

// Computed data for Reports Status chart
const reportsStatusData = computed(() => {
    const depts = dashboardData.value?.DailyTasks?.DailyTaskDepts || [];
    return depts.map(dept => ({
        dept: dept.department_name || t('undefined'),
        [t('reported')]: dept.total_reports || 0,
        [t('notReported')]: (dept.total_tasks || 0) - (dept.total_reports || 0)
    }));
});

// Computed data for Department Performance chart
const deptPerformanceData = computed(() => {
    const depts = chartDeptPerformance.value?.data?.dept_performance || [];
    return depts.map(dept => ({
        dept: dept.department_name || t('undefined'),
        [t('performance')]: dept.total_rate || 0
    }));
});

const hasData = computed(() => {
    return taskProgressData.value.length > 0 || reportsStatusData.value.length > 0;
});

const getChartData = async () => {
    try {
        isLoading.value = true;

        const range = {
            from: fromDate.value,
            to: toDate.value,
        };

        if (!range.to) {
            range.to = range.from;
        }

        // Fetch both datasets in parallel
        await Promise.all([
            store.dispatch("fetchDashboardData"),
            store.dispatch("getChartDeptPerformance", range)
        ]);

        // Update dates from API response
        if (chartDeptPerformance.value?.range) {
            fromDate.value = chartDeptPerformance.value.range.from;
            toDate.value = chartDeptPerformance.value.range.to;
        }
    } finally {
        isLoading.value = false;
    }
};

onBeforeMount(async () => {
    await getChartData();
});
</script>

<template>
    <div class="charts-container">
        <!-- Header Section -->
        <div class="charts-header">
            <div class="container-fluid">
                <div class="section-header text-center mb-4">
                    <h3 class="section-title">
                        <i class="fas fa-chart-line me-2"></i>
                        {{ t('chartsAndAnalytics') }}
                    </h3>
                    <p class="section-subtitle">{{ t('visualRepresentation') }}</p>
                </div>

                <!-- Date Filters -->
                <div class="date-filters d-flex gap-3 justify-content-center mb-4">
                    <div class="input-group" style="max-width: 250px;">
                        <span class="input-group-text">
                            <i class="fas fa-calendar me-2"></i>{{ t('from') }}:
                        </span>
                        <input type="date" v-model="fromDate" class="form-control" :max="toDate || undefined" />
                    </div>

                    <div class="input-group" style="max-width: 250px;">
                        <span class="input-group-text">
                            <i class="fas fa-calendar me-2"></i>{{ t('to') }}:
                        </span>
                        <input type="date" v-model="toDate" class="form-control" :min="fromDate || undefined" />
                    </div>

                    <button class="btn btn-primary px-4" @click="getChartData" :disabled="isLoading">
                        <i class="fas fa-sync-alt me-2" :class="{ 'fa-spin': isLoading }"></i>
                        {{ t('getData') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container text-center py-5">
            <div class="spinner-border text-primary mx-auto" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">{{ t('loading') }}</span>
            </div>
            <p class="mt-3 text-muted">{{ t('loading') }}</p>
        </div>

        <!-- No Data State -->
        <div v-else-if="!hasData" class="no-data-container">
            <div class="no-tasks-container">
                <img src="https://ik.imagekit.io/ts7pphpbz3/9318688.jpg" alt="no-tasks" class="no-tasks-image" />
                <p class="no-tasks-text">
                    {{ t("noDataHere") }}
                    {{ chartDeptPerformance?.range?.from || fromDate }}
                    <span v-if="chartDeptPerformance?.range?.to || toDate"> {{ t('to') }} </span>
                    {{ chartDeptPerformance?.range?.to || toDate }}
                </p>
            </div>
        </div>

        <!-- Charts Grid -->
        <div v-else class="container-fluid">
            <div class="row g-4">

                <!-- Task Progress by Department Chart -->
                <div class="col-lg-6 col-12">
                    <div class="chart-card">
                        <div class="chart-card-header">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <h5 class="chart-title mb-1">
                                        <i class="fas fa-chart-area me-2 text-primary"></i>
                                        {{ t('taskProgressByDept') }}
                                    </h5>
                                    <p class="chart-subtitle">{{ t('comparisonOfTasks') }}</p>
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
                            <ShBar v-if="taskProgressData.length > 0" :data="taskProgressData" index="dept"
                                :categories="[t('done'), t('notDone')]" :colors="['#10b981', '#ef4444']" type="grouped"
                                :rounded-corners="8" :show-grid-line="true" />
                        </div>
                    </div>
                </div>

                <!-- Reports Status Chart -->
                <div class="col-lg-6 col-12">
                    <div class="chart-card">
                        <div class="chart-card-header">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <h5 class="chart-title mb-1">
                                        <i class="fas fa-chart-bar me-2 text-info"></i>
                                        {{ t('reportsStatus') }}
                                    </h5>
                                    <p class="chart-subtitle">{{ t('reportedAndUnreported') }}</p>
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
                            <ShBar v-if="reportsStatusData.length > 0" :data="reportsStatusData" index="dept"
                                :categories="[t('reported'), t('notReported')]" :colors="['#3b82f6', '#f59e0b']"
                                type="grouped" :rounded-corners="8" :show-grid-line="true" />
                        </div>
                    </div>
                </div>

                <!-- Department Performance Chart -->
                <div class="col-12" v-if="deptPerformanceData.length > 0">
                    <div class="chart-card">
                        <div class="chart-card-header">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <h5 class="chart-title mb-1">
                                        <i class="fas fa-trophy me-2 text-warning"></i>
                                        {{ t('departmentPerformance') }}
                                    </h5>
                                    <p class="chart-subtitle">{{ t('overallPerformanceRate') }}</p>
                                </div>
                                <div class="chart-legend">
                                    <span class="legend-item">
                                        <span class="legend-color bg-success"></span>
                                        {{ t('performance') }} (%)
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="chart-card-body">
                            <ShBar :data="deptPerformanceData" index="dept" :categories="[t('performance')]"
                                :colors="['#10b981']" type="grouped" :rounded-corners="8" :show-grid-line="true"
                                :y-formatter="(value) => `${value}%`" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.charts-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 2rem 0;
}

.charts-header {
    margin-bottom: 2rem;
}

.section-header {
    text-align: center;
    margin-bottom: 2rem;
}

.section-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 0.5rem;
}

.section-subtitle {
    font-size: 1.1rem;
    color: #64748b;
    margin: 0;
}

.date-filters {
    padding: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    max-width: 900px;
    margin: 0 auto;
}

.input-group-text {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    font-weight: 500;
    color: #495057;
}

.form-control {
    border: 1px solid #dee2e6;
}

.form-control:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

.no-tasks-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 3rem 1rem;
    text-align: center;
}

.no-tasks-image {
    max-width: 350px;
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 12px;
}

.no-tasks-text {
    font-size: 1.2rem;
    font-weight: 600;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
}

/* Chart Cards */
.chart-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    height: 100%;
    transition: all 0.3s ease;
}

.chart-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.chart-card-header {
    padding: 1.5rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-bottom: 1px solid #e2e8f0;
}

.chart-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0;
}

.chart-subtitle {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
}

.chart-legend {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: #4a5568;
    font-weight: 500;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    display: inline-block;
}

.chart-card-body {
    padding: 1.5rem;
    min-height: 350px;
}

/* Responsive */
@media (max-width: 768px) {
    .section-title {
        font-size: 1.5rem;
    }

    .date-filters {
        flex-direction: column;
    }

    .input-group {
        max-width: 100% !important;
    }

    .chart-legend {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .chart-card-body {
        padding: 1rem;
        min-height: 300px;
    }
}
</style>
