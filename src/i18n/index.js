import { createI18n } from "vue-i18n";
import en from "./locales/en";
import ar from "./locales/ar";

// الحصول على اللغة المحفوظة من localStorage أو استخدام اللغة الافتراضية
const savedLanguage = localStorage.getItem("language") || "en";
const isRTL = savedLanguage === "ar";

// إعدادات i18n
const i18n = createI18n({
  legacy: false, // استخدام Composition API
  locale: savedLanguage, // اللغة الحالية
  fallbackLocale: "en", // اللغة الاحتياطية
  messages: {
    en,
    ar,
  },
  // إعدادات إضافية
  globalInjection: true, // جعل $t متاحًا في جميع المكونات
  warnHtmlMessage: false, // تعطيل تحذيرات HTML في الرسائل
});

// دالة لتغيير اللغة وتحديث RTL
export const setLocale = (locale) => {
  if (typeof document === "undefined") return locale;

  i18n.global.locale.value = locale;
  localStorage.setItem("language", locale);

  // تحديث اتجاه الصفحة
  const isRTL = locale === "ar";
  const appElement = document.querySelector("#app");

  document.documentElement.setAttribute("lang", locale);
  document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");

  if (appElement) {
    // إزالة class القديم وإضافة الجديد
    appElement.classList.remove("rtl", "ltr");
    appElement.classList.add(isRTL ? "rtl" : "ltr");

    // تحديث body أيضاً
    document.body.classList.remove("rtl", "ltr");
    document.body.classList.add(isRTL ? "rtl" : "ltr");
  }

  // تحديث store إذا كان متاحاً
  if (typeof window !== "undefined" && window.store) {
    window.store.commit("SET_LANGUAGE", locale);
  }

  return locale;
};

// تهيئة اتجاه الصفحة عند التحميل
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("lang", savedLanguage);
  document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  if (document.querySelector("#app")) {
    document.querySelector("#app").classList.toggle("rtl", isRTL);
  }
}

export default i18n;
