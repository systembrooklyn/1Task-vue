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
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
// main.js
import "bootstrap-icons/font/bootstrap-icons.css";
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
appInstance.use(ArgonDashboard);
appInstance.use(VueTelInput, {
  // Keep behavior close to our current UX; unknown options are ignored gracefully by the plugin
  mode: "international",
  autoDefaultCountry: true,
  validCharactersOnly: true,
});

// Load user data from localStorage
store.commit("LOAD_USER_FROM_STORAGE");

appInstance.mount("#app");

// بعد أن يتم التركيب
nextTick(() => {
  setTooltip();
});
