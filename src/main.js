// import { Tooltip } from 'bootstrap'

// const tooltipDirective = {
//   mounted(el, binding) {
//     el._tooltipInstance = new Tooltip(el, {
//       title: binding.value,
//       placement: binding.arg || 'top',
//     });
//   },
//   updated(el, binding) {
//     if (el._tooltipInstance) {
//       el._tooltipInstance.setContent({ '.tooltip-inner': binding.value });
//     }
//   },
//   unmounted(el) {
//     if (el._tooltipInstance) {
//       el._tooltipInstance.dispose();
//     }
//   }
// }

import { createApp, nextTick } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n, { setLocale } from "./i18n";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
// main.js
import "bootstrap-icons/font/bootstrap-icons.css";
// Z-Index Layer System - نظام موحد لإدارة الطبقات
import "./assets/css/z-layers.css";
import ArgonDashboard from "./argon-dashboard";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import setTooltip from "@/assets/js/tooltip";
import VueTelInput from "vue-tel-input";
// import "vue-tel-input/vue-tel-input.css";

const appInstance = createApp(App);

// appInstance.directive('tooltip', tooltipDirective);

const globalOptions = {
  height: 200,
  debug: "info",
  modules: {
    toolbar: ["bold", "italic", "underline"],
  },
  placeholder: "write your comment here...",
  readOnly: false,
  theme: "snow",
};
QuillEditor.props.globalOptions.default = () => globalOptions;

// Register the TinyMCE editor globally as 'vue-tinymce'
appInstance.component("QuillEditor", QuillEditor);
appInstance.use(store);
appInstance.use(router);
appInstance.use(i18n);
appInstance.use(ArgonDashboard);
appInstance.use(VueTelInput, {
  // Keep behavior close to our current UX; unknown options are ignored gracefully by the plugin
  mode: "international",
  autoDefaultCountry: true,
  validCharactersOnly: true,
});

// جعل i18n و store متاحاً عالمياً للوصول من store
appInstance.config.globalProperties.$i18n = i18n;
if (typeof window !== "undefined") {
  window.i18n = i18n;
  window.store = store;
  window.setLocale = setLocale;
}

// Load user data from localStorage
store.commit("LOAD_USER_FROM_STORAGE");

// Load company data from localStorage
store.commit("company/LOAD_FROM_STORAGE");

// مزامنة اللغة مع i18n عند التحميل
const savedLanguage = localStorage.getItem("language") || "en";
if (savedLanguage) {
  setLocale(savedLanguage);
}

appInstance.mount("#app");

// بعد أن يتم التركيب
nextTick(() => {
  setTooltip();
});
