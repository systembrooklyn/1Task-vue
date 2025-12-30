<template>
    <div class="gemini-analysis-card">
        <!-- زر التحليل -->
        <div class="analysis-trigger-section mb-4">
            <div class="card">
                <div class="card-body text-center">
                    <button @click="triggerAnalysis" :disabled="isAnalyzing" class="btn btn-primary btn-lg analysis-btn"
                        :class="{ 'loading': isAnalyzing }">
                        <span v-if="!isAnalyzing">
                            <i class="fas fa-brain me-2"></i>
                            {{ t('analyzeWithAI') }}
                        </span>
                        <span v-else>
                            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                            {{ t('analyzing') }}
                        </span>
                    </button>

                    <div v-if="lastAnalysisTime" class="last-analysis-time mt-3">
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>
                            {{ t('lastAnalyzed') }}: {{ lastAnalysisTime }}
                        </small>
                    </div>
                </div>
            </div>
        </div>

        <!-- حالة التحميل -->
        <div v-if="isAnalyzing" class="loading-state">
            <div class="card">
                <div class="card-body text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">{{ t('analyzingData') }}</p>
                    <p class="text-muted small">{{ t('pleaseWait') }}</p>
                </div>
            </div>
        </div>

        <!-- نتائج التحليل -->
        <div v-else-if="analysisResult" class="analysis-results">
            <!-- تقييم اليوم -->
            <div class="card mb-3 shadow-sm">
                <div class="card-header" :class="getStatusHeaderClass(analysisResult.dayAssessment?.status)">
                    <h5 class="mb-0">
                        <i class="fas fa-calendar-day me-2"></i>{{ t('dayAssessment') }}
                    </h5>
                </div>
                <div class="card-body">
                    <div class="day-status-badge mb-3" :class="getStatusClass(analysisResult.dayAssessment?.status)">
                        {{ getStatusText(analysisResult.dayAssessment?.status) }}
                    </div>
                    <p class="lead">{{ analysisResult.dayAssessment?.summary }}</p>

                    <div v-if="analysisResult.dayAssessment?.positivePoints?.length" class="positive-points mt-4">
                        <h6 class="text-success">
                            <i class="fas fa-check-circle me-2"></i>{{ t('positivePoints') }}
                        </h6>
                        <ul class="list-unstyled ms-3">
                            <li v-for="(point, index) in analysisResult.dayAssessment.positivePoints" :key="index"
                                class="mb-2">
                                <i class="fas fa-arrow-left text-success me-2"></i>{{ point }}
                            </li>
                        </ul>
                    </div>

                    <div v-if="analysisResult.dayAssessment?.negativePoints?.length" class="negative-points mt-4">
                        <h6 class="text-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>{{ t('negativePoints') }}
                        </h6>
                        <ul class="list-unstyled ms-3">
                            <li v-for="(point, index) in analysisResult.dayAssessment.negativePoints" :key="index"
                                class="mb-2">
                                <i class="fas fa-arrow-left text-danger me-2"></i>{{ point }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- التنبيهات -->
            <div v-if="analysisResult.alerts?.length" class="card mb-3 shadow-sm">
                <div class="card-header bg-warning text-dark">
                    <h5 class="mb-0">
                        <i class="fas fa-bell me-2"></i>{{ t('alerts') }}
                        <span class="badge bg-dark ms-2">{{ analysisResult.alerts.length }}</span>
                    </h5>
                </div>
                <div class="card-body">
                    <div v-for="(alert, index) in analysisResult.alerts" :key="index" class="alert mb-2"
                        :class="getAlertClass(alert.type)">
                        <div class="d-flex align-items-start">
                            <i :class="getAlertIcon(alert.type) + ' me-2 mt-1'"></i>
                            <div class="flex-grow-1">
                                <strong>{{ alert.title }}</strong>
                                <p class="mb-1 mt-1">{{ alert.message }}</p>
                                <small v-if="alert.actionRequired" class="d-block mt-2 text-muted">
                                    <strong>{{ t('actionRequired') }}:</strong> {{ alert.actionRequired }}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- المشاكل المحتملة -->
            <div v-if="analysisResult.potentialProblems?.length" class="card mb-3 shadow-sm">
                <div class="card-header bg-danger text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-exclamation-triangle me-2"></i>{{ t('potentialProblems') }}
                        <span class="badge bg-light text-dark ms-2">{{ analysisResult.potentialProblems.length }}</span>
                    </h5>
                </div>
                <div class="card-body">
                    <div v-for="(problem, index) in analysisResult.potentialProblems" :key="index"
                        class="problem-item mb-3 pb-3 border-bottom"
                        :class="{ 'border-0': index === analysisResult.potentialProblems.length - 1 }">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-2">{{ problem.title }}</h6>
                                <p class="text-muted mb-2">{{ problem.description }}</p>
                                <p v-if="problem.recommendation" class="text-info mb-0">
                                    <strong><i class="fas fa-lightbulb me-1"></i>{{ t('recommendation') }}:</strong>
                                    {{ problem.recommendation }}
                                </p>
                            </div>
                            <span class="badge ms-3" :class="getSeverityClass(problem.severity)">
                                {{ getSeverityText(problem.severity) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- التوقعات -->
            <div v-if="analysisResult.todayExpectations" class="card mb-3 shadow-sm">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-crystal-ball me-2"></i>{{ t('todayExpectations') }}
                    </h5>
                </div>
                <div class="card-body">
                    <div v-if="analysisResult.todayExpectations.expectations?.length" class="mb-4">
                        <h6 class="mb-3">
                            <i class="fas fa-eye me-2 text-info"></i>{{ t('expectations') }}
                        </h6>
                        <ul class="list-unstyled ms-3">
                            <li v-for="(exp, index) in analysisResult.todayExpectations.expectations" :key="index"
                                class="mb-2">
                                <i class="fas fa-arrow-left text-info me-2"></i>{{ exp }}
                            </li>
                        </ul>
                    </div>

                    <div v-if="analysisResult.todayExpectations.risks?.length" class="mb-4">
                        <h6 class="mb-3 text-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>{{ t('risks') }}
                        </h6>
                        <ul class="list-unstyled ms-3">
                            <li v-for="(risk, index) in analysisResult.todayExpectations.risks" :key="index"
                                class="mb-2">
                                <i class="fas fa-arrow-left text-warning me-2"></i>{{ risk }}
                            </li>
                        </ul>
                    </div>

                    <div v-if="analysisResult.todayExpectations.opportunities?.length">
                        <h6 class="mb-3 text-success">
                            <i class="fas fa-lightbulb me-2"></i>{{ t('opportunities') }}
                        </h6>
                        <ul class="list-unstyled ms-3">
                            <li v-for="(opp, index) in analysisResult.todayExpectations.opportunities" :key="index"
                                class="mb-2">
                                <i class="fas fa-arrow-left text-success me-2"></i>{{ opp }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- التوصيات -->
            <div v-if="analysisResult.recommendations?.length" class="card mb-3 shadow-sm">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-clipboard-list me-2"></i>{{ t('recommendations') }}
                        <span class="badge bg-light text-dark ms-2">{{ analysisResult.recommendations.length }}</span>
                    </h5>
                </div>
                <div class="card-body">
                    <div v-for="(rec, index) in analysisResult.recommendations" :key="index"
                        class="recommendation-item mb-4 pb-3 border-bottom"
                        :class="{ 'border-0': index === analysisResult.recommendations.length - 1 }">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="mb-0">{{ rec.title }}</h6>
                            <span class="badge ms-2" :class="getPriorityClass(rec.priority)">
                                {{ getPriorityText(rec.priority) }}
                            </span>
                        </div>
                        <p class="text-muted mb-2">{{ rec.description }}</p>
                        <div v-if="rec.steps?.length" class="mt-3">
                            <strong class="d-block mb-2">{{ t('steps') }}:</strong>
                            <ol class="mb-0">
                                <li v-for="(step, stepIndex) in rec.steps" :key="stepIndex" class="mb-1">
                                    {{ step }}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الملخص التنفيذي -->
            <div v-if="analysisResult.executiveSummary" class="card shadow-sm">
                <div class="card-header bg-dark text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-chart-line me-2"></i>{{ t('executiveSummary') }}
                    </h5>
                </div>
                <div class="card-body text-center">
                    <div class="overall-score mb-4">
                        <div class="score-circle mx-auto"
                            :class="getScoreClass(analysisResult.executiveSummary.overallScore)">
                            <div class="score-content">
                                <div class="score-number">{{ analysisResult.executiveSummary.overallScore }}</div>
                                <div class="score-label">/100</div>
                            </div>
                        </div>
                    </div>
                    <p class="lead">{{ analysisResult.executiveSummary.summary }}</p>
                    <div v-if="analysisResult.executiveSummary.keyPoints?.length" class="mt-4 text-start">
                        <h6 class="mb-3">{{ t('keyPoints') }}:</h6>
                        <ul class="list-unstyled ms-3">
                            <li v-for="(point, index) in analysisResult.executiveSummary.keyPoints" :key="index"
                                class="mb-2">
                                <i class="fas fa-check text-primary me-2"></i>{{ point }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- رسالة الخطأ -->
        <div v-if="error && !isAnalyzing" class="alert alert-danger shadow-sm">
            <div class="d-flex align-items-start">
                <i class="fas fa-exclamation-triangle me-2 mt-1"></i>
                <div>
                    <strong>{{ t('error') }}</strong>
                    <p class="mb-0 mt-1">{{ error }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
// import { useI18n } from 'vue-i18n';
import geminiAIService from '@/services/geminiAIService';

const props = defineProps({
    dashboardData: {
        type: Object,
        required: true
    }
});

const store = useStore();
// const { t: i18nT } = useI18n();

const isAnalyzing = ref(false);
const analysisResult = ref(null);
const error = ref(null);
const lastAnalysisTime = ref(null);

const currentLanguage = computed(() => store.getters.currentLanguage || 'ar');

// Translations
const translations = {
    en: {
        analyzeWithAI: 'Analyze with AI',
        analyzing: 'Analyzing...',
        analyzingData: 'Analyzing data with AI...',
        pleaseWait: 'Please wait while we analyze your data',
        lastAnalyzed: 'Last analyzed',
        dayAssessment: 'Day Assessment',
        positivePoints: 'Positive Points',
        negativePoints: 'Negative Points',
        alerts: 'Alerts',
        potentialProblems: 'Potential Problems',
        todayExpectations: 'Today\'s Expectations',
        expectations: 'Expectations',
        risks: 'Risks',
        opportunities: 'Opportunities',
        recommendations: 'Recommendations',
        executiveSummary: 'Executive Summary',
        keyPoints: 'Key Points',
        actionRequired: 'Action Required',
        recommendation: 'Recommendation',
        steps: 'Steps',
        error: 'Error',
        analysisError: 'Error analyzing data',
        excellent: 'Excellent',
        good: 'Good',
        average: 'Average',
        poor: 'Poor',
        critical: 'Critical',
        unknown: 'Unknown',
        high: 'High',
        medium: 'Medium',
        low: 'Low'
    },
    ar: {
        analyzeWithAI: 'تحليل ذكي بالذكاء الاصطناعي',
        analyzing: 'جاري التحليل...',
        analyzingData: 'جاري تحليل البيانات بالذكاء الاصطناعي...',
        pleaseWait: 'يرجى الانتظار بينما نقوم بتحليل بياناتك',
        lastAnalyzed: 'آخر تحليل',
        dayAssessment: 'تقييم اليوم',
        positivePoints: 'النقاط الإيجابية',
        negativePoints: 'النقاط السلبية',
        alerts: 'التنبيهات',
        potentialProblems: 'المشاكل المحتملة',
        todayExpectations: 'توقعات اليوم',
        expectations: 'التوقعات',
        risks: 'المخاطر',
        opportunities: 'الفرص',
        recommendations: 'التوصيات',
        executiveSummary: 'الملخص التنفيذي',
        keyPoints: 'النقاط الرئيسية',
        actionRequired: 'الإجراء المطلوب',
        recommendation: 'التوصية',
        steps: 'الخطوات',
        error: 'خطأ',
        analysisError: 'خطأ في تحليل البيانات',
        excellent: 'ممتاز',
        good: 'جيد',
        average: 'متوسط',
        poor: 'ضعيف',
        critical: 'حرج',
        unknown: 'غير معروف',
        high: 'عالية',
        medium: 'متوسطة',
        low: 'منخفضة'
    }
};

const t = (key) => {
    return translations[currentLanguage.value]?.[key] || translations['ar'][key] || key;
};

const triggerAnalysis = async () => {
    isAnalyzing.value = true;
    error.value = null;
    analysisResult.value = null;

    try {
        console.log("Triggering analysis with data:", props.dashboardData);
        console.log("Language:", currentLanguage.value);

        const result = await geminiAIService.analyzeDashboard(
            props.dashboardData,
            currentLanguage.value
        );

        analysisResult.value = result;
        lastAnalysisTime.value = new Date().toLocaleString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (err) {
        error.value = err.message || t('analysisError');
        console.error('Analysis error:', err);
    } finally {
        isAnalyzing.value = false;
    }
};

// Helper functions
const getStatusClass = (status) => {
    const classes = {
        excellent: 'bg-success',
        good: 'bg-info',
        average: 'bg-warning',
        poor: 'bg-danger',
        critical: 'bg-dark'
    };
    return classes[status] || 'bg-secondary';
};

const getStatusHeaderClass = (status) => {
    const classes = {
        excellent: 'bg-success text-white',
        good: 'bg-info text-white',
        average: 'bg-warning text-dark',
        poor: 'bg-danger text-white',
        critical: 'bg-dark text-white'
    };
    return classes[status] || 'bg-secondary text-white';
};

const getStatusText = (status) => {
    const texts = {
        excellent: t('excellent'),
        good: t('good'),
        average: t('average'),
        poor: t('poor'),
        critical: t('critical'),
        unknown: t('unknown')
    };
    return texts[status] || status || t('unknown');
};

const getAlertClass = (type) => {
    return `alert-${type === 'critical' ? 'danger' : type === 'warning' ? 'warning' : 'info'}`;
};

const getAlertIcon = (type) => {
    const icons = {
        critical: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-info-circle';
};

const getSeverityClass = (severity) => {
    const classes = {
        critical: 'bg-danger',
        high: 'bg-warning',
        medium: 'bg-info',
        low: 'bg-secondary'
    };
    return classes[severity] || 'bg-secondary';
};

const getSeverityText = (severity) => {
    return t(severity) || severity;
};

const getPriorityClass = (priority) => {
    const classes = {
        high: 'bg-danger',
        medium: 'bg-warning',
        low: 'bg-info'
    };
    return classes[priority] || 'bg-secondary';
};

const getPriorityText = (priority) => {
    return t(priority) || priority;
};

const getScoreClass = (score) => {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 55) return 'score-average';
    if (score >= 40) return 'score-poor';
    return 'score-critical';
};
</script>

<style scoped>
.gemini-analysis-card {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.analysis-btn {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 10px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.analysis-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.analysis-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.last-analysis-time {
    text-align: center;
    margin-top: 0.5rem;
    color: #6c757d;
}

.loading-state {
    animation: fadeIn 0.3s ease-in;
}

.day-status-badge {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
}

.score-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    margin: 0 auto;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    position: relative;
}

.score-content {
    text-align: center;
}

.score-number {
    font-size: 2.5rem;
    line-height: 1;
}

.score-label {
    font-size: 1rem;
    opacity: 0.9;
    margin-top: 0.25rem;
}

.score-excellent {
    background: linear-gradient(135deg, #10b981, #059669);
}

.score-good {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.score-average {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.score-poor {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.score-critical {
    background: linear-gradient(135deg, #6b7280, #4b5563);
}

.analysis-results {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card {
    border: none;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-2px);
}

.card-header {
    border-radius: 12px 12px 0 0 !important;
    font-weight: 600;
}

.problem-item:last-child,
.recommendation-item:last-child {
    border-bottom: none !important;
}

@media (max-width: 768px) {
    .score-circle {
        width: 100px;
        height: 100px;
    }

    .score-number {
        font-size: 2rem;
    }

    .analysis-btn {
        font-size: 1rem;
        padding: 0.875rem 1.5rem;
    }
}
</style>
