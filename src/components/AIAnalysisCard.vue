<template>
    <div class="ai-analysis-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-animation">
                <div class="ai-loader">
                    <div class="loader-brain">
                        <div class="brain-wave"></div>
                        <div class="brain-wave"></div>
                        <div class="brain-wave"></div>
                    </div>
                </div>
                <div class="loading-text">
                    <h4>{{ t('analyzing') }}</h4>
                    <p>{{ t('analyzingData') }}</p>
                </div>
            </div>
        </div>

        <!-- Analysis Content -->
        <div v-else-if="analysis" class="analysis-content">
            <!-- Overall Performance Card -->
            <div class="performance-card smart-card">
                <div class="card-header-modern">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="header-text">
                            <h4 class="card-title">{{ t('overallPerformance') }}</h4>
                            <p class="card-subtitle">AI-Powered Performance Analysis</p>
                        </div>
                    </div>
                    <div class="header-badge">
                        <span class="performance-badge"
                            :class="getPerformanceBadgeClass(analysis.performance.performanceScore)">
                            {{ analysis.performance.performanceScore }}/100
                        </span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <!-- <div class="col-md-6">
                            <div class="performance-score">
                                <div class="score-circle" :class="getScoreClass(analysis.performance.performanceScore)">
                                    <span class="score-number">{{ analysis.performance.performanceScore }}</span>
                                    <span class="score-label">/100</span>
                                </div>
                                <h4 class="text-center mt-3">{{ analysis.performance.overallPerformance }}</h4>
                            </div>
                        </div> -->
                        <div class="col-md-12">
                            <div class="performance-metrics-modern">
                                <div class="metric-card">
                                    <div class="metric-header">
                                        <i class="fas fa-tasks metric-icon"></i>
                                        <span class="metric-label">{{ t('taskCompletionRate') }}</span>
                                    </div>
                                    <div class="metric-content">
                                        <div class="metric-progress">
                                            <div class="progress-ring">
                                                <svg class="progress-ring-svg" width="60" height="60">
                                                    <circle class="progress-ring-background" cx="30" cy="30" r="25">
                                                    </circle>
                                                    <circle class="progress-ring-fill" cx="30" cy="30" r="25"
                                                        :style="{ strokeDashoffset: getCircleOffset(analysis.performance.metrics.taskCompletionRate) }"
                                                        :class="getProgressClass(analysis.performance.metrics.taskCompletionRate)">
                                                    </circle>
                                                </svg>
                                                <div class="progress-text">{{
                                                    analysis.performance.metrics.taskCompletionRate }}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="metric-card">
                                    <div class="metric-header">
                                        <i class="fas fa-users metric-icon"></i>
                                        <span class="metric-label">{{ t('employeeEfficiency') }}</span>
                                    </div>
                                    <div class="metric-content">
                                        <div class="metric-progress">
                                            <div class="progress-ring">
                                                <svg class="progress-ring-svg" width="60" height="60">
                                                    <circle class="progress-ring-background" cx="30" cy="30" r="25">
                                                    </circle>
                                                    <circle class="progress-ring-fill" cx="30" cy="30" r="25"
                                                        :style="{ strokeDashoffset: getCircleOffset(analysis.performance.metrics.employeeEfficiency) }"
                                                        :class="getProgressClass(analysis.performance.metrics.employeeEfficiency)">
                                                    </circle>
                                                </svg>
                                                <div class="progress-text">{{
                                                    analysis.performance.metrics.employeeEfficiency }}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="metric-card">
                                    <div class="metric-header">
                                        <i class="fas fa-project-diagram metric-icon"></i>
                                        <span class="metric-label">{{ t('projectHealth') }}</span>
                                    </div>
                                    <div class="metric-content">
                                        <div class="metric-progress">
                                            <div class="progress-ring">
                                                <svg class="progress-ring-svg" width="60" height="60">
                                                    <circle class="progress-ring-background" cx="30" cy="30" r="25">
                                                    </circle>
                                                    <circle class="progress-ring-fill" cx="30" cy="30" r="25"
                                                        :style="{ strokeDashoffset: getCircleOffset(analysis.performance.metrics.projectHealth) }"
                                                        :class="getProgressClass(analysis.performance.metrics.projectHealth)">
                                                    </circle>
                                                </svg>
                                                <div class="progress-text">{{ analysis.performance.metrics.projectHealth
                                                    }}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alerts Section -->
            <div v-if="analysis.alerts.length > 0" class="alerts-card smart-card">
                <div class="card-header-modern alert-header">
                    <div class="header-content">
                        <div class="header-icon danger">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="header-text">
                            <h4 class="card-title">{{ t('importantAlerts') }}</h4>
                            <p class="card-subtitle">Critical Issues Requiring Attention</p>
                        </div>
                    </div>
                    <div class="alert-count">
                        <span class="count-badge">{{ analysis.alerts.length }}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div v-for="alert in analysis.alerts" :key="alert.title" class="alert-item">
                        <div class="alert" :class="getAlertClass(alert.type)">
                            <i :class="'fas fa-' + alert.icon + ' me-2'"></i>
                            <strong>{{ alert.title }}</strong>
                            <p class="mb-0 mt-1">{{ alert.message }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Insights Section -->
            <div v-if="analysis.insights.length > 0" class="insights-card smart-card">
                <div class="card-header-modern insight-header">
                    <div class="header-content">
                        <div class="header-icon info">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div class="header-text">
                            <h4 class="card-title">{{ t('insightsAnalytics') }}</h4>
                            <p class="card-subtitle">Data-Driven Business Insights</p>
                        </div>
                    </div>
                    <div class="insight-count">
                        <span class="count-badge">{{ analysis.insights.length }}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div v-for="insight in analysis.insights" :key="insight.title" class="col-md-6 mb-3">
                            <div class="insight-card" :class="getInsightClass(insight.type)">
                                <div class="insight-header">
                                    <i :class="'fas fa-' + getInsightIcon(insight.type) + ' me-2'"></i>
                                    <strong>{{ insight.title }}</strong>
                                </div>
                                <div class="insight-body">
                                    {{ insight.message }}
                                </div>
                                <div class="insight-priority">
                                    <span class="badge" :class="getPriorityClass(insight.priority)">
                                        {{ getPriorityText(insight.priority) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recommendations Section -->
            <div v-if="analysis.recommendations.length > 0" class="recommendations-card smart-card">
                <div class="card-header-modern success-header">
                    <div class="header-content">
                        <div class="header-icon success">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <div class="header-text">
                            <h4 class="card-title">{{ t('recommendationsActions') }}</h4>
                            <p class="card-subtitle">Strategic Action Plans</p>
                        </div>
                    </div>
                    <div class="recommendation-count">
                        <span class="count-badge">{{ analysis.recommendations.length }}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div v-for="recommendation in analysis.recommendations" :key="recommendation.title"
                        class="recommendation-item mb-4">
                        <div class="recommendation-header">
                            <h6 class="mb-1">{{ recommendation.title }}</h6>
                            <span class="badge" :class="getPriorityClass(recommendation.priority)">
                                {{ getPriorityText(recommendation.priority) }}
                            </span>
                        </div>
                        <p class="recommendation-description">{{ recommendation.description }}</p>
                        <div class="recommendation-actions">
                            <h6 class="mb-2">{{ t('suggestedActions') }}</h6>
                            <ul class="action-list">
                                <li v-for="action in recommendation.actions" :key="action">{{ action }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Department Performance -->
            <div v-if="analysis.trends.departmentPerformance.length > 0" class="department-card smart-card">
                <div class="card-header-modern warning-header">
                    <div class="header-content">
                        <div class="header-icon warning">
                            <i class="fas fa-building"></i>
                        </div>
                        <div class="header-text">
                            <h4 class="card-title">{{ t('departmentPerformance') }}</h4>
                            <p class="card-subtitle">Departmental Analysis & Rankings</p>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>{{ t('bestDepartment') }}</h6>
                            <div v-if="analysis.trends.bestDepartment" class="department-card best">
                                <strong>{{ analysis.trends.bestDepartment.department }}</strong>
                                <div class="completion-rate">{{ analysis.trends.bestDepartment.completionRate }}% {{
                                    t('completion') }}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6>{{ t('worstDepartment') }}</h6>
                            <div v-if="analysis.trends.worstDepartment" class="department-card worst">
                                <strong>{{ analysis.trends.worstDepartment.department }}</strong>
                                <div class="completion-rate">{{ analysis.trends.worstDepartment.completionRate }}% {{
                                    t('completion') }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <h6>{{ t('averageCompletionRate') }} {{ analysis.trends.averageCompletionRate }}%</h6>
                    </div>
                </div>
            </div>

            <!-- Executive Summary -->
            <div class="executive-card smart-card">
                <div class="card-header-modern executive-header">
                    <div class="header-content">
                        <div class="header-icon executive">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                        <div class="header-text">
                            <h4 class="card-title">{{ t('executiveSummary') }}</h4>
                            <p class="card-subtitle">Key Performance Overview</p>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4 text-center">
                            <div class="summary-stat">
                                <div class="stat-number">{{ analysis.summary.overview.totalTasks }}</div>
                                <div class="stat-label">{{ t('totalTasks') }}</div>
                            </div>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="summary-stat">
                                <div class="stat-number">{{ analysis.summary.overview.activeEmployees }}</div>
                                <div class="stat-label">{{ t('activeEmployees') }}</div>
                            </div>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="summary-stat">
                                <div class="stat-number">{{ analysis.summary.overview.activeProjects }}</div>
                                <div class="stat-label">{{ t('activeProjects') }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12 text-center">
                            <div class="overall-status">
                                <span class="badge" :class="'bg-' + analysis.summary.status.color">
                                    <i :class="'fas fa-' + analysis.summary.status.icon + ' me-1'"></i>
                                    {{ analysis.summary.status.status }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
            <div class="error-content">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="error-text">
                    <h4>{{ t('analysisError') }}</h4>
                    <p>{{ error }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import aiAnalysisService from '@/services/aiAnalysisService.js';
import { useStore } from 'vuex';

const props = defineProps({
    dashboardData: {
        type: Object,
        required: true
    }
});

const store = useStore();
const analysis = ref(null);
const isLoading = ref(false);
const error = ref(null);

// Translation system
const translations = {
    en: {
        // Loading and error states
        analyzing: "Analyzing...",
        analyzingData: "Analyzing data...",
        analysisError: "Analysis Error:",
        errorAnalyzing: "An error occurred while analyzing data",

        // Performance section
        overallPerformance: "Overall Company Performance",
        taskCompletionRate: "Task Completion Rate",
        employeeEfficiency: "Employee Efficiency",
        projectHealth: "Project Health",

        // Performance levels
        excellent: "Excellent",
        veryGood: "Very Good",
        good: "Good",
        acceptable: "Acceptable",
        needsImprovement: "Needs Improvement",

        // Alerts section
        importantAlerts: "Important Alerts",

        // Insights section
        insightsAnalytics: "Insights & Analytics",

        // Recommendations section
        recommendationsActions: "Recommendations & Actions",
        suggestedActions: "Suggested Actions:",

        // Department performance
        departmentPerformance: "Department Performance",
        bestDepartment: "Best Department:",
        worstDepartment: "Worst Department:",
        averageCompletionRate: "Average Completion Rate:",
        completion: "completion",

        // Executive summary
        executiveSummary: "Executive Summary",
        totalTasks: "Total Tasks",
        activeEmployees: "Active Employees",
        activeProjects: "Active Projects",

        // Priority levels
        high: "High",
        medium: "Medium",
        low: "Low",
        undefined: "Undefined"
    },
    ar: {
        // Loading and error states
        analyzing: "جاري التحليل...",
        analyzingData: "جاري تحليل البيانات...",
        analysisError: "خطأ في التحليل:",
        errorAnalyzing: "حدث خطأ أثناء تحليل البيانات",

        // Performance section
        overallPerformance: "الأداء العام للشركة",
        taskCompletionRate: "معدل إنجاز المهام",
        employeeEfficiency: "كفاءة الموظفين",
        projectHealth: "صحة المشاريع",

        // Performance levels
        excellent: "ممتاز",
        veryGood: "جيد جداً",
        good: "جيد",
        acceptable: "مقبول",
        needsImprovement: "يحتاج تحسين",

        // Alerts section
        importantAlerts: "التنبيهات المهمة",

        // Insights section
        insightsAnalytics: "الرؤى والتحليلات",

        // Recommendations section
        recommendationsActions: "التوصيات والإجراءات",
        suggestedActions: "الإجراءات المقترحة:",

        // Department performance
        departmentPerformance: "أداء الأقسام",
        bestDepartment: "أفضل قسم:",
        worstDepartment: "أقل قسم أداءً:",
        averageCompletionRate: "متوسط معدل الإنجاز:",
        completion: "إنجاز",

        // Executive summary
        executiveSummary: "الملخص التنفيذي",
        totalTasks: "إجمالي المهام",
        activeEmployees: "الموظفين النشطين",
        activeProjects: "المشاريع النشطة",

        // Priority levels
        high: "عالية",
        medium: "متوسطة",
        low: "منخفضة",
        undefined: "غير محدد"
    }
};

const currentLanguage = computed(() => store.getters.currentLanguage);
const t = (key) => translations[currentLanguage.value][key] || key;

// تحليل البيانات
const analyzeData = async () => {
    if (!props.dashboardData) return;

    isLoading.value = true;
    error.value = null;

    try {
        analysis.value = await aiAnalysisService.analyzeDashboardData(props.dashboardData);
    } catch (err) {
        error.value = err.message || t('errorAnalyzing');
        console.error('Analysis error:', err);
    } finally {
        isLoading.value = false;
    }
};

// Helper functions for styling
// const getScoreClass = (score) => {
//     if (score >= 85) return 'excellent';
//     if (score >= 70) return 'good';
//     if (score >= 55) return 'average';
//     if (score >= 40) return 'poor';
//     return 'critical';
// };

const getProgressClass = (rate) => {
    if (rate >= 80) return 'bg-success';
    if (rate >= 60) return 'bg-warning';
    return 'bg-danger';
};

const getAlertClass = (type) => {
    switch (type) {
        case 'critical': return 'alert-danger';
        case 'warning': return 'alert-warning';
        case 'info': return 'alert-info';
        default: return 'alert-secondary';
    }
};

const getInsightClass = (type) => {
    switch (type) {
        case 'warning': return 'insight-warning';
        case 'info': return 'insight-info';
        default: return 'insight-default';
    }
};

const getInsightIcon = (type) => {
    switch (type) {
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'info-circle';
        default: return 'lightbulb';
    }
};

const getPriorityClass = (priority) => {
    switch (priority) {
        case 'high': return 'bg-danger';
        case 'medium': return 'bg-warning';
        case 'low': return 'bg-info';
        default: return 'bg-secondary';
    }
};

const getPriorityText = (priority) => {
    switch (priority) {
        case 'high': return t('high');
        case 'medium': return t('medium');
        case 'low': return t('low');
        default: return t('undefined');
    }
};

// New functions for enhanced design
const getPerformanceBadgeClass = (score) => {
    if (score >= 85) return 'badge-excellent';
    if (score >= 70) return 'badge-good';
    if (score >= 55) return 'badge-average';
    if (score >= 40) return 'badge-poor';
    return 'badge-critical';
};

const getCircleOffset = (percentage) => {
    const circumference = 2 * Math.PI * 25; // radius = 25
    return circumference - (percentage / 100) * circumference;
};

// Watch for data changes
watch(() => props.dashboardData, analyzeData, { immediate: true });

// Initial analysis
onMounted(() => {
    if (props.dashboardData) {
        analyzeData();
    }
});
</script>

<style scoped>
.ai-analysis-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: transparent;
    border-radius: 0;
    padding: 0;
}

/* Enhanced Loading State */
.loading-state {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-animation {
    text-align: center;
}

.ai-loader {
    margin-bottom: 2rem;
}

.loader-brain {
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

.loading-text h4 {
    color: #2d3748;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.loading-text p {
    color: #718096;
    margin: 0;
}

/* Smart Card Design */
.smart-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
    overflow: hidden;
    transition: all 0.3s ease;
}

.smart-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

/* Modern Card Headers */
.card-header-modern {
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
}

.header-icon.danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.header-icon.info {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.header-icon.success {
    background: linear-gradient(135deg, #10b981, #059669);
}

.header-icon.warning {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.header-icon.executive {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.header-text .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a202c;
    margin: 0;
}

.header-text .card-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
}

/* Performance Badge */
.performance-badge {
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-weight: 700;
    font-size: 0.9rem;
    color: white;
}

.badge-excellent {
    background: linear-gradient(135deg, #10b981, #059669);
}

.badge-good {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.badge-average {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.badge-poor {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.badge-critical {
    background: linear-gradient(135deg, #6b7280, #4b5563);
}

/* Count Badges */
.count-badge {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8rem;
}

/* Modern Performance Metrics */
.performance-metrics-modern {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.75rem;
}

.metric-card {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 10px;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
}

.metric-card:hover {
    transform: translateX(3px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.metric-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.metric-icon {
    color: #667eea;
    font-size: 1.1rem;
}

.metric-label {
    font-weight: 600;
    color: #2d3748;
    font-size: 0.9rem;
}

/* Circular Progress Rings */
.progress-ring {
    position: relative;
    display: inline-block;
}

.progress-ring-svg {
    transform: rotate(-90deg);
}

.progress-ring-background {
    fill: none;
    stroke: #e2e8f0;
    stroke-width: 4;
}

.progress-ring-fill {
    fill: none;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-dasharray: 157;
    /* 2 * Math.PI * 25 */
    transition: stroke-dashoffset 1s ease-in-out;
}

.progress-ring-fill.bg-success {
    stroke: #10b981;
}

.progress-ring-fill.bg-warning {
    stroke: #f59e0b;
}

.progress-ring-fill.bg-danger {
    stroke: #ef4444;
}

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 700;
    font-size: 0.8rem;
    color: #2d3748;
}

/* Error State */
.error-state {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.error-content {
    text-align: center;
    padding: 2rem;
}

.error-icon {
    font-size: 3rem;
    color: #ef4444;
    margin-bottom: 1rem;
}

.error-text h4 {
    color: #dc2626;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.error-text p {
    color: #6b7280;
    margin: 0;
}

/* Keep existing styles and add responsive design */
.analysis-content {
    animation: fadeIn 0.8s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Enhanced Performance Score Circle */
.performance-score {
    text-align: center;
    padding: 1rem;
}

.score-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    color: white;
    font-weight: bold;
    position: relative;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    animation: scoreGlow 2s infinite alternate;
}

@keyframes scoreGlow {
    0% {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    100% {
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
    }
}

.score-circle.excellent {
    background: linear-gradient(135deg, #10b981, #059669, #047857);
}

.score-circle.good {
    background: linear-gradient(135deg, #06b6d4, #0891b2, #0e7490);
}

.score-circle.average {
    background: linear-gradient(135deg, #f59e0b, #d97706, #b45309);
}

.score-circle.poor {
    background: linear-gradient(135deg, #ef4444, #dc2626, #b91c1c);
}

.score-circle.critical {
    background: linear-gradient(135deg, #6b7280, #4b5563, #374151);
}

.score-number {
    font-size: 2rem;
    line-height: 1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.score-label {
    font-size: 1rem;
    opacity: 0.9;
    margin-top: 0.25rem;
}

/* Responsive Design */
@media (max-width: 992px) {
    .performance-metrics-modern {
        gap: 0.75rem;
    }

    .metric-card {
        padding: 0.5rem;
    }
}

@media (max-width: 768px) {
    .ai-analysis-container {
        padding: 0.5rem;
    }

    .score-circle {
        width: 100px;
        height: 100px;
    }

    .score-number {
        font-size: 1.75rem;
    }

    .card-header-modern {
        padding: 0.75rem;
    }

    .header-content {
        gap: 0.5rem;
    }

    .header-icon {
        width: 35px;
        height: 35px;
        font-size: 1.1rem;
    }

    .performance-metrics-modern {
        gap: 0.75rem;
        padding: 0.5rem;
    }
}
</style>
