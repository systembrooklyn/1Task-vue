// src/services/geminiAIService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiAIService {
  constructor() {
    // API Key - يمكن تخزينه في localStorage أو environment variable
    // محاولة قراءة من .env أولاً
    let apiKey = null;

    // محاولة قراءة من import.meta.env (Vite)
    if (typeof import.meta !== "undefined" && import.meta.env) {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }

    // إذا لم يوجد في .env، جرب localStorage
    if (!apiKey) {
      apiKey = localStorage.getItem("gemini_api_key");
    }

    // إذا لم يوجد، استخدم القيمة الافتراضية
    if (!apiKey) {
      apiKey = "AIzaSyD89iXRI1iIrxSxvz_jn0uucFi0N0jy6I0";
    }

    console.log(
      "Gemini API Key loaded:",
      apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND"
    );

    if (!apiKey) {
      throw new Error("Gemini API Key is required");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // استخدام gemini-1.5-flash كما طلبت
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  /**
   * تحليل شامل للداشبورد باستخدام AI
   */
  async analyzeDashboard(dashboardData, language = "ar") {
    try {
      // التحقق من البيانات المرسلة
      console.log("Dashboard Data received:", dashboardData);

      if (!dashboardData || Object.keys(dashboardData).length === 0) {
        throw new Error("لا توجد بيانات للتحليل");
      }

      const prompt = this.buildAnalysisPrompt(dashboardData, language);
      console.log("Sending request to Gemini AI...");

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("Gemini AI Response:", text.substring(0, 200) + "...");

      // Parse JSON response
      return this.parseAIResponse(text);
    } catch (error) {
      console.error("Gemini AI Error Details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response,
      });

      // رسالة خطأ أكثر تفصيلاً
      const errorMessage =
        error.message || "فشل في تحليل البيانات. يرجى المحاولة مرة أخرى.";
      throw new Error(errorMessage);
    }
  }

  /**
   * بناء الـ Prompt للتحليل
   */
  buildAnalysisPrompt(dashboardData, language) {
    const dataSummary = this.formatDataForPrompt(dashboardData);

    const prompt =
      language === "ar"
        ? `
أنت محلل أعمال ذكي متخصص في تحليل أداء الشركات. قم بتحليل البيانات التالية وأعطني تحليل شامل ومفيد.

البيانات:
${dataSummary}

قم بتحليل البيانات وأعطني إجابة بصيغة JSON فقط (بدون أي نص إضافي قبل أو بعد JSON) تحتوي على:

{
  "dayAssessment": {
    "status": "excellent|good|average|poor|critical",
    "summary": "ملخص قصير يصف حالة اليوم",
    "positivePoints": ["نقطة إيجابية 1", "نقطة إيجابية 2"],
    "negativePoints": ["نقطة سلبية 1", "نقطة سلبية 2"]
  },
  "potentialProblems": [
    {
      "title": "عنوان المشكلة",
      "description": "وصف تفصيلي للمشكلة",
      "severity": "critical|high|medium|low",
      "recommendation": "التوصية لحل المشكلة"
    }
  ],
  "todayExpectations": {
    "expectations": ["توقع 1", "توقع 2"],
    "risks": ["خطر 1", "خطر 2"],
    "opportunities": ["فرصة 1", "فرصة 2"]
  },
  "alerts": [
    {
      "type": "critical|warning|info",
      "title": "عنوان التنبيه",
      "message": "رسالة التنبيه",
      "actionRequired": "الإجراء المطلوب"
    }
  ],
  "recommendations": [
    {
      "title": "عنوان التوصية",
      "description": "وصف التوصية",
      "priority": "high|medium|low",
      "steps": ["خطوة 1", "خطوة 2", "خطوة 3"]
    }
  ],
  "executiveSummary": {
    "summary": "ملخص تنفيذي قصير",
    "keyPoints": ["نقطة رئيسية 1", "نقطة رئيسية 2"],
    "overallScore": 85
  }
}

**مهم جداً**: 
- كن دقيقاً ومفيداً
- ركز على المعلومات العملية
- استخدم اللغة العربية بشكل صحيح
- أعد JSON صالح فقط بدون أي نص إضافي قبل أو بعد JSON
- overallScore يجب أن يكون رقم من 0-100

أعد الإجابة بصيغة JSON فقط:
`
        : `
You are an intelligent business analyst specialized in company performance analysis. Analyze the following data and provide comprehensive insights.

Data:
${dataSummary}

Analyze the data and provide a JSON response (ONLY JSON, no additional text) containing:

{
  "dayAssessment": {
    "status": "excellent|good|average|poor|critical",
    "summary": "Brief summary of the day",
    "positivePoints": ["point 1", "point 2"],
    "negativePoints": ["point 1", "point 2"]
  },
  "potentialProblems": [
    {
      "title": "Problem title",
      "description": "Problem description",
      "severity": "critical|high|medium|low",
      "recommendation": "Recommendation"
    }
  ],
  "todayExpectations": {
    "expectations": ["expectation 1", "expectation 2"],
    "risks": ["risk 1", "risk 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  },
  "alerts": [
    {
      "type": "critical|warning|info",
      "title": "Alert title",
      "message": "Alert message",
      "actionRequired": "Required action"
    }
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Recommendation description",
      "priority": "high|medium|low",
      "steps": ["step 1", "step 2"]
    }
  ],
  "executiveSummary": {
    "summary": "Executive summary",
    "keyPoints": ["key point 1", "key point 2"],
    "overallScore": 85
  }
}

Return ONLY valid JSON:
`;

    return prompt;
  }

  /**
   * تنسيق البيانات للـ Prompt
   */
  formatDataForPrompt(dashboardData) {
    const { AllDailyTasks, DailyTasks, Emps, Projects, Tasks } = dashboardData;

    // حساب معدلات الأداء
    const taskCompletionRate =
      DailyTasks?.total_reports > 0
        ? ((DailyTasks.done_reports / DailyTasks.total_reports) * 100).toFixed(
            1
          )
        : 0;

    const employeeActivityRate =
      Emps?.total > 0 ? ((Emps.invited / Emps.total) * 100).toFixed(1) : 0;

    const projectHealthRate =
      Projects?.total > 0
        ? ((Projects.active / Projects.total) * 100).toFixed(1)
        : 0;

    return `
**المهام الروتينية:**
- إجمالي المهام: ${AllDailyTasks?.total || 0}
- المهام النشطة: ${AllDailyTasks?.active || 0}
- المهام غير النشطة: ${AllDailyTasks?.inActive || 0}

**تقارير اليوم:**
- التقارير المنجزة: ${DailyTasks?.done_reports || 0}
- التقارير غير المنجزة: ${DailyTasks?.not_done_reports || 0}
- إجمالي التقارير: ${DailyTasks?.total_reports || 0}
- إجمالي مهام اليوم: ${DailyTasks?.today_total_daily_tasks || 0}
- معدل إنجاز المهام: ${taskCompletionRate}%

**الأقسام:**
${(DailyTasks?.DailyTaskDepts || [])
  .map(
    (dept) => `
- ${dept.department_name || "غير محدد"}:
  * المهام المنجزة: ${dept.done_reports || 0}
  * المهام غير المنجزة: ${dept.not_done_reports || 0}
  * إجمالي المهام: ${dept.total_tasks || 0}
  * إجمالي التقارير: ${dept.total_reports || 0}
  * معدل الإنجاز: ${dept.total_reports > 0 ? ((dept.done_reports / dept.total_reports) * 100).toFixed(1) : 0}%
`
  )
  .join("")}

**الموظفين:**
- إجمالي الموظفين: ${Emps?.total || 0}
- الموظفين النشطين: ${Emps?.invited || 0}
- الموظفين المعلقين: ${Emps?.pending || 0}
- معدل نشاط الموظفين: ${employeeActivityRate}%

**المشاريع:**
- إجمالي المشاريع: ${Projects?.total || 0}
- المشاريع النشطة: ${Projects?.active || 0}
- المشاريع غير النشطة: ${Projects?.inactive || 0}
- معدل صحة المشاريع: ${projectHealthRate}%

**المهام لمرة واحدة:**
- المهام المعلقة: ${Tasks?.pending || 0}
- قيد التنفيذ: ${Tasks?.inProgress || 0}
- قيد المراجعة: ${Tasks?.review || 0}
- المنجزة: ${Tasks?.done || 0}
- المتأخرة: ${Tasks?.overdue || 0}
- المستحقة اليوم: ${Tasks?.dueToday || 0}
- المستحقة قريباً: ${Tasks?.dueSoon || 0}
- عاجلة: ${Tasks?.urgent || 0}

**التاريخ والوقت:** ${new Date().toLocaleString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
`;
  }

  /**
   * تحليل استجابة AI
   */
  parseAIResponse(text) {
    try {
      // تنظيف النص من markdown code blocks إذا وجدت
      let cleanedText = text.trim();

      // إزالة markdown code blocks
      cleanedText = cleanedText.replace(/```json\n?/g, "");
      cleanedText = cleanedText.replace(/```\n?/g, "");

      // محاولة استخراج JSON من النص
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // التحقق من وجود الحقول الأساسية
        return this.validateAndFixResponse(parsed);
      }
      throw new Error("No JSON found in response");
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.error("Response text:", text);
      // Fallback response
      return this.getFallbackResponse();
    }
  }

  /**
   * التحقق من صحة الاستجابة وإصلاحها
   */
  validateAndFixResponse(response) {
    // التأكد من وجود جميع الحقول المطلوبة
    if (!response.dayAssessment) {
      response.dayAssessment = {
        status: "unknown",
        summary: "لا توجد معلومات كافية",
        positivePoints: [],
        negativePoints: [],
      };
    }

    if (!response.potentialProblems) {
      response.potentialProblems = [];
    }

    if (!response.todayExpectations) {
      response.todayExpectations = {
        expectations: [],
        risks: [],
        opportunities: [],
      };
    }

    if (!response.alerts) {
      response.alerts = [];
    }

    if (!response.recommendations) {
      response.recommendations = [];
    }

    if (!response.executiveSummary) {
      response.executiveSummary = {
        summary: "لا توجد معلومات كافية",
        keyPoints: [],
        overallScore: 0,
      };
    }

    // التأكد من أن overallScore رقم صحيح
    if (typeof response.executiveSummary.overallScore !== "number") {
      response.executiveSummary.overallScore = 0;
    }

    return response;
  }

  /**
   * استجابة احتياطية في حالة فشل AI
   */
  getFallbackResponse() {
    return {
      dayAssessment: {
        status: "unknown",
        summary: "تعذر تحليل البيانات. يرجى المحاولة مرة أخرى.",
        positivePoints: [],
        negativePoints: [],
      },
      potentialProblems: [],
      todayExpectations: {
        expectations: [],
        risks: [],
        opportunities: [],
      },
      alerts: [
        {
          type: "warning",
          title: "خطأ في التحليل",
          message: "تعذر تحليل البيانات. يرجى المحاولة مرة أخرى.",
          actionRequired: "تحديث البيانات والمحاولة مرة أخرى",
        },
      ],
      recommendations: [],
      executiveSummary: {
        summary: "تعذر تحليل البيانات",
        keyPoints: [],
        overallScore: 0,
      },
    };
  }

  /**
   * تحليل سريع (Quick Analysis)
   */
  async quickAnalysis(dashboardData, language = "ar") {
    const prompt =
      language === "ar"
        ? `
قم بتحليل سريع للبيانات التالية وأعطني:
1. حالة اليوم في جملة واحدة
2. أهم مشكلة واحدة
3. أهم توصية واحدة

البيانات:
${this.formatDataForPrompt(dashboardData)}

أعد JSON فقط:
{
  "status": "excellent|good|average|poor|critical",
  "mainIssue": "نص المشكلة",
  "mainRecommendation": "نص التوصية"
}
`
        : `
Quick analysis:
${this.formatDataForPrompt(dashboardData)}

Return JSON with status, mainIssue, mainRecommendation.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (error) {
      console.error("Quick analysis error:", error);
      return null;
    }
  }
}

export default new GeminiAIService();
