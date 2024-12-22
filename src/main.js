import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
import ArgonDashboard from "./argon-dashboard";

// if (process.env.NODE_ENV === 'production') {
//     appInstance.config.errorHandler = () => {
//       console.error('An error occurred. Please try again later.');
//     };
//   }
  



// تحميل بيانات المستخدم من `localStorage` عند بدء التطبيق
store.commit("LOAD_USER_FROM_STORAGE");

const appInstance = createApp(App);
appInstance.use(store);
appInstance.use(router);
appInstance.use(ArgonDashboard);
appInstance.mount("#app");
