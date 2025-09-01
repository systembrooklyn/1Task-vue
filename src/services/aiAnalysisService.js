// src/services/aiAnalysisService.js
// AI Analysis Service for Dashboard Data

import store from "@/store";

// Translation system for AI Analysis
const translations = {
  en: {
    // Performance levels
    excellent: "Excellent",
    veryGood: "Very Good",
    good: "Good",
    acceptable: "Acceptable",
    needsImprovement: "Needs Improvement",

    // Overall status
    criticalPerformance: "Critical Performance",
    lowPerformanceAlert:
      "Very low performance that requires immediate intervention",
    employeeManagementIssue: "Employee Management Issue",
    pendingEmployeesAlert:
      "Number of pending employees is greater than active ones",
    lowReportingRate: "Low Reporting Rate",
    lowReportingAlert: "Less than 50% of tasks have been reported",

    // Insights
    taskCompletionDecline: "Decline in Task Completion Rate",
    taskCompletionMessage:
      "Number of incomplete tasks ({0}) is greater than completed tasks ({1})",
    lowReportingRateInsight: "Low Reporting Rate",
    lowReportingMessage: "Only {0}% of tasks have been reported",
    pendingEmployeesInsight: "Large Number of Pending Employees",
    pendingEmployeesMessage: "{0} pending employees out of {1} total employees",
    inactiveProjects: "Inactive Projects",
    inactiveProjectsMessage:
      "Number of inactive projects ({0}) is greater than active ones ({1})",

    // Recommendations
    improveTaskManagement: "Improve Task Management",
    taskManagementDescription:
      "Review task distribution process and provide necessary support to employees",
    reviewTaskDistribution: "Review task distribution across departments",
    provideAdditionalTraining: "Provide additional training for employees",
    improveFollowupSystem: "Improve follow-up system",

    improveReportingSystem: "Improve Reporting System",
    reportingSystemDescription: "Encourage employees to submit reports on time",
    sendReminders: "Send reminders to employees",
    simplifyReporting: "Simplify reporting process",
    provideIncentives: "Provide incentives for committed employees",

    handlePendingEmployees: "Handle Pending Employees",
    pendingEmployeesDescription:
      "Follow up with pending employees and activate their accounts",
    followUpPending: "Follow up with pending employees",
    sendReminderEmails: "Send reminder emails",
    reviewRegistrationProcess: "Review registration process",

    activateInactiveProjects: "Activate Inactive Projects",
    inactiveProjectsDescription:
      "Review inactive projects and identify reasons for stoppage",
    reviewInactiveProjects: "Review status of inactive projects",
    identifyStoppageReasons: "Identify reasons for stoppage",
    createReactivationPlan: "Create a plan to reactivate important projects",
  },
  ar: {
    // Performance levels
    excellent: "ممتاز",
    veryGood: "جيد جداً",
    good: "جيد",
    acceptable: "مقبول",
    needsImprovement: "يحتاج تحسين",

    // Overall status
    criticalPerformance: "أداء منخفض جداً",
    lowPerformanceAlert: "معدل إنجاز المهام منخفض جداً ويحتاج تدخل فوري",
    employeeManagementIssue: "مشكلة في إدارة الموظفين",
    pendingEmployeesAlert: "عدد الموظفين المعلقين أكبر من النشطين",
    lowReportingRate: "معدل تقرير منخفض",
    lowReportingAlert: "أقل من 50% من المهام تم الإبلاغ عنها",

    // Insights
    taskCompletionDecline: "انخفاض في معدل إنجاز المهام",
    taskCompletionMessage:
      "عدد المهام غير المنجزة ({0}) أكبر من المهام المنجزة ({1})",
    lowReportingRateInsight: "معدل تقرير منخفض",
    lowReportingMessage: "فقط {0}% من المهام تم الإبلاغ عنها",
    pendingEmployeesInsight: "عدد كبير من الموظفين المعلقين",
    pendingEmployeesMessage: "{0} موظف معلق من أصل {1} إجمالي الموظفين",
    inactiveProjects: "مشاريع غير نشطة",
    inactiveProjectsMessage:
      "عدد المشاريع غير النشطة ({0}) أكبر من النشطة ({1})",

    // Recommendations
    improveTaskManagement: "تحسين إدارة المهام",
    taskManagementDescription:
      "يجب مراجعة عملية توزيع المهام وتوفير الدعم اللازم للموظفين",
    reviewTaskDistribution: "مراجعة توزيع المهام على الأقسام",
    provideAdditionalTraining: "توفير تدريب إضافي للموظفين",
    improveFollowupSystem: "تحسين نظام المتابعة",

    improveReportingSystem: "تحسين نظام التقارير",
    reportingSystemDescription:
      "يجب تشجيع الموظفين على تقديم التقارير في الوقت المحدد",
    sendReminders: "إرسال تذكيرات للموظفين",
    simplifyReporting: "تبسيط عملية التقرير",
    provideIncentives: "تقديم حوافز للموظفين الملتزمين",

    handlePendingEmployees: "معالجة الموظفين المعلقين",
    pendingEmployeesDescription: "يجب متابعة الموظفين المعلقين وتفعيل حساباتهم",
    followUpPending: "متابعة الموظفين المعلقين",
    sendReminderEmails: "إرسال رسائل تذكير",
    reviewRegistrationProcess: "مراجعة عملية التسجيل",

    activateInactiveProjects: "تفعيل المشاريع غير النشطة",
    inactiveProjectsDescription:
      "يجب مراجعة المشاريع غير النشطة وتحديد أسباب توقفها",
    reviewInactiveProjects: "مراجعة حالة المشاريع غير النشطة",
    identifyStoppageReasons: "تحديد أسباب التوقف",
    createReactivationPlan: "وضع خطة لإعادة تفعيل المشاريع المهمة",
  },
};

// Helper function to get translation
const t = (key, ...args) => {
  const currentLanguage = store.getters.currentLanguage || "ar";
  let text = translations[currentLanguage][key] || key;

  // Replace placeholders {0}, {1}, etc. with arguments
  args.forEach((arg, index) => {
    text = text.replace(`{${index}}`, arg);
  });

  return text;
};

const aiAnalysisService = {
  // تحليل شامل للبيانات
  async analyzeDashboardData(dashboardData) {
    try {
      const analysis = {
        performance: this.analyzePerformance(dashboardData),
        trends: this.analyzeTrends(dashboardData),
        insights: this.generateInsights(dashboardData),
        recommendations: this.generateRecommendations(dashboardData),
        alerts: this.generateAlerts(dashboardData),
        summary: this.generateSummary(dashboardData),
      };

      return analysis;
    } catch (error) {
      console.error("Error analyzing dashboard data:", error);
      throw error;
    }
  },

  // تحليل الأداء العام
  analyzePerformance(dashboardData) {
    const { AllDailyTasks, DailyTasks, Emps, Projects } = dashboardData;

    // حساب معدلات الإنجاز
    const taskCompletionRate =
      DailyTasks.total_reports > 0
        ? ((DailyTasks.done_reports / DailyTasks.total_reports) * 100).toFixed(
            1
          )
        : 0;

    const employeeEfficiency =
      Emps.total > 0 ? ((Emps.invited / Emps.total) * 100).toFixed(1) : 0;

    const projectHealth =
      Projects.total > 0
        ? ((Projects.active / Projects.total) * 100).toFixed(1)
        : 0;

    // تقييم الأداء العام
    let overallPerformance = t("excellent");
    let performanceScore = 0;

    if (taskCompletionRate >= 90) performanceScore += 30;
    else if (taskCompletionRate >= 75) performanceScore += 20;
    else if (taskCompletionRate >= 60) performanceScore += 10;

    if (employeeEfficiency >= 90) performanceScore += 30;
    else if (employeeEfficiency >= 75) performanceScore += 20;
    else if (employeeEfficiency >= 60) performanceScore += 10;

    if (projectHealth >= 80) performanceScore += 40;
    else if (projectHealth >= 60) performanceScore += 25;
    else if (projectHealth >= 40) performanceScore += 15;

    if (performanceScore >= 85) overallPerformance = t("excellent");
    else if (performanceScore >= 70) overallPerformance = t("veryGood");
    else if (performanceScore >= 55) overallPerformance = t("good");
    else if (performanceScore >= 40) overallPerformance = t("acceptable");
    else overallPerformance = t("needsImprovement");

    return {
      overallPerformance,
      performanceScore,
      metrics: {
        taskCompletionRate: parseFloat(taskCompletionRate),
        employeeEfficiency: parseFloat(employeeEfficiency),
        projectHealth: parseFloat(projectHealth),
        totalTasks: AllDailyTasks.total,
        activeTasks: AllDailyTasks.active,
        inactiveTasks: AllDailyTasks.inActive,
        totalEmployees: Emps.total,
        activeEmployees: Emps.invited,
        pendingEmployees: Emps.pending,
        totalProjects: Projects.total,
        activeProjects: Projects.active,
        inactiveProjects: Projects.inactive,
      },
    };
  },

  // تحليل الاتجاهات
  analyzeTrends(dashboardData) {
    const { DailyTasks } = dashboardData;

    // تحليل أداء الأقسام
    const departmentPerformance =
      DailyTasks.DailyTaskDepts?.map((dept) => ({
        department: dept.department_name,
        completionRate:
          dept.total_reports > 0
            ? ((dept.done_reports / dept.total_reports) * 100).toFixed(1)
            : 0,
        totalTasks: dept.total_tasks,
        reportedTasks: dept.total_reports,
        notReported: (dept.total_tasks || 0) - (dept.total_reports || 0),
        efficiency:
          dept.total_tasks > 0
            ? ((dept.total_reports / dept.total_tasks) * 100).toFixed(1)
            : 0,
      })) || [];

    // تحديد أفضل وأسوأ الأقسام
    const sortedDepartments = [...departmentPerformance].sort(
      (a, b) => b.completionRate - a.completionRate
    );
    const bestDepartment = sortedDepartments[0];
    const worstDepartment = sortedDepartments[sortedDepartments.length - 1];

    return {
      departmentPerformance,
      bestDepartment,
      worstDepartment,
      averageCompletionRate:
        departmentPerformance.length > 0
          ? (
              departmentPerformance.reduce(
                (sum, dept) => sum + parseFloat(dept.completionRate),
                0
              ) / departmentPerformance.length
            ).toFixed(1)
          : 0,
    };
  },

  // توليد الرؤى
  generateInsights(dashboardData) {
    const insights = [];
    const { DailyTasks, Emps, Projects } = dashboardData;

    // رؤى المهام
    if (DailyTasks.not_done_reports > DailyTasks.done_reports) {
      insights.push({
        type: "warning",
        title: t("taskCompletionDecline"),
        message: t(
          "taskCompletionMessage",
          DailyTasks.not_done_reports,
          DailyTasks.done_reports
        ),
        priority: "high",
      });
    }

    if (DailyTasks.total_reports < DailyTasks.today_total_daily_tasks * 0.7) {
      const reportingPercentage = (
        (DailyTasks.total_reports / DailyTasks.today_total_daily_tasks) *
        100
      ).toFixed(1);
      insights.push({
        type: "info",
        title: t("lowReportingRateInsight"),
        message: t("lowReportingMessage", reportingPercentage),
        priority: "medium",
      });
    }

    // رؤى الموظفين
    if (Emps.pending > Emps.invited * 0.3) {
      insights.push({
        type: "warning",
        title: t("pendingEmployeesInsight"),
        message: t("pendingEmployeesMessage", Emps.pending, Emps.total),
        priority: "high",
      });
    }

    // رؤى المشاريع
    if (Projects.inactive > Projects.active) {
      insights.push({
        type: "warning",
        title: t("inactiveProjects"),
        message: t(
          "inactiveProjectsMessage",
          Projects.inactive,
          Projects.active
        ),
        priority: "medium",
      });
    }

    return insights;
  },

  // توليد التوصيات
  generateRecommendations(dashboardData) {
    const recommendations = [];
    const { DailyTasks, Emps, Projects } = dashboardData;

    // توصيات المهام
    if (DailyTasks.not_done_reports > DailyTasks.done_reports) {
      recommendations.push({
        category: "tasks",
        title: t("improveTaskManagement"),
        description: t("taskManagementDescription"),
        priority: "high",
        actions: [
          t("reviewTaskDistribution"),
          t("provideAdditionalTraining"),
          t("improveFollowupSystem"),
        ],
      });
    }

    if (DailyTasks.total_reports < DailyTasks.today_total_daily_tasks * 0.7) {
      recommendations.push({
        category: "reporting",
        title: t("improveReportingSystem"),
        description: t("reportingSystemDescription"),
        priority: "medium",
        actions: [
          t("sendReminders"),
          t("simplifyReporting"),
          t("provideIncentives"),
        ],
      });
    }

    // توصيات الموظفين
    if (Emps.pending > Emps.invited * 0.3) {
      recommendations.push({
        category: "employees",
        title: t("handlePendingEmployees"),
        description: t("pendingEmployeesDescription"),
        priority: "high",
        actions: [
          t("followUpPending"),
          t("sendReminderEmails"),
          t("reviewRegistrationProcess"),
        ],
      });
    }

    // توصيات المشاريع
    if (Projects.inactive > Projects.active) {
      recommendations.push({
        category: "projects",
        title: t("activateInactiveProjects"),
        description: t("inactiveProjectsDescription"),
        priority: "medium",
        actions: [
          t("reviewInactiveProjects"),
          t("identifyStoppageReasons"),
          t("createReactivationPlan"),
        ],
      });
    }

    return recommendations;
  },

  // توليد التنبيهات
  generateAlerts(dashboardData) {
    const alerts = [];
    const { DailyTasks, Emps } = dashboardData;

    // تنبيهات حرجة
    if (DailyTasks.not_done_reports > DailyTasks.done_reports * 2) {
      alerts.push({
        type: "critical",
        title: t("criticalPerformance"),
        message: t("lowPerformanceAlert"),
        icon: "exclamation-triangle",
      });
    }

    if (Emps.pending > Emps.invited) {
      alerts.push({
        type: "critical",
        title: t("employeeManagementIssue"),
        message: t("pendingEmployeesAlert"),
        icon: "user-times",
      });
    }

    // تنبيهات متوسطة
    if (DailyTasks.total_reports < DailyTasks.today_total_daily_tasks * 0.5) {
      alerts.push({
        type: "warning",
        title: t("lowReportingRate"),
        message: t("lowReportingAlert"),
        icon: "chart-line-down",
      });
    }

    return alerts;
  },

  // توليد ملخص تنفيذي
  generateSummary(dashboardData) {
    const { AllDailyTasks, DailyTasks, Emps, Projects } = dashboardData;

    const totalTasks = AllDailyTasks.total;
    const completedTasks = DailyTasks.done_reports;
    const totalEmployees = Emps.total;
    const activeEmployees = Emps.invited;
    const totalProjects = Projects.total;
    const activeProjects = Projects.active;

    const taskCompletionRate =
      DailyTasks.total_reports > 0
        ? ((DailyTasks.done_reports / DailyTasks.total_reports) * 100).toFixed(
            1
          )
        : 0;

    const employeeActivityRate =
      Emps.total > 0 ? ((Emps.invited / Emps.total) * 100).toFixed(1) : 0;

    const projectActivityRate =
      Projects.total > 0
        ? ((Projects.active / Projects.total) * 100).toFixed(1)
        : 0;

    return {
      overview: {
        totalTasks,
        completedTasks,
        totalEmployees,
        activeEmployees,
        totalProjects,
        activeProjects,
      },
      rates: {
        taskCompletion: parseFloat(taskCompletionRate),
        employeeActivity: parseFloat(employeeActivityRate),
        projectActivity: parseFloat(projectActivityRate),
      },
      status: this.getOverallStatus(
        taskCompletionRate,
        employeeActivityRate,
        projectActivityRate
      ),
    };
  },

  // تحديد الحالة العامة
  getOverallStatus(taskRate, employeeRate, projectRate) {
    const avgRate =
      (parseFloat(taskRate) +
        parseFloat(employeeRate) +
        parseFloat(projectRate)) /
      3;

    if (avgRate >= 85)
      return { status: t("excellent"), color: "success", icon: "check-circle" };
    if (avgRate >= 70)
      return { status: t("veryGood"), color: "info", icon: "thumbs-up" };
    if (avgRate >= 55)
      return { status: t("good"), color: "warning", icon: "exclamation" };
    if (avgRate >= 40)
      return {
        status: t("acceptable"),
        color: "warning",
        icon: "exclamation-triangle",
      };
    return {
      status: t("needsImprovement"),
      color: "danger",
      icon: "times-circle",
    };
  },

  // تحليل مقارن (إذا كان هناك بيانات تاريخية)
  async compareWithPreviousPeriod(currentData, previousData) {
    if (!previousData) return null;

    const currentPerformance = this.analyzePerformance(currentData);
    const previousPerformance = this.analyzePerformance(previousData);

    const changes = {
      taskCompletionRate: {
        current: currentPerformance.metrics.taskCompletionRate,
        previous: previousPerformance.metrics.taskCompletionRate,
        change:
          currentPerformance.metrics.taskCompletionRate -
          previousPerformance.metrics.taskCompletionRate,
        percentage:
          previousPerformance.metrics.taskCompletionRate > 0
            ? (
                ((currentPerformance.metrics.taskCompletionRate -
                  previousPerformance.metrics.taskCompletionRate) /
                  previousPerformance.metrics.taskCompletionRate) *
                100
              ).toFixed(1)
            : 0,
      },
      employeeEfficiency: {
        current: currentPerformance.metrics.employeeEfficiency,
        previous: previousPerformance.metrics.employeeEfficiency,
        change:
          currentPerformance.metrics.employeeEfficiency -
          previousPerformance.metrics.employeeEfficiency,
        percentage:
          previousPerformance.metrics.employeeEfficiency > 0
            ? (
                ((currentPerformance.metrics.employeeEfficiency -
                  previousPerformance.metrics.employeeEfficiency) /
                  previousPerformance.metrics.employeeEfficiency) *
                100
              ).toFixed(1)
            : 0,
      },
      projectHealth: {
        current: currentPerformance.metrics.projectHealth,
        previous: previousPerformance.metrics.projectHealth,
        change: currentPerformance.metrics.projectHealth - previousPerformance.metrics.projectHealth,
        percentage: previousPerformance.metrics.projectHealth > 0 ? ((currentPerformance.metrics.projectHealth - previousPerformance.metrics.projectHealth) / previousPerformance.metrics.projectHealth * 100).toFixed(1) : 0,
      },
    };

    return changes;
  },
};

export default aiAnalysisService;
