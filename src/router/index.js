import { createRouter, createWebHistory } from "vue-router";
import { computed } from "vue";
import Dashboard from "../views/Dashboard.vue";
import Tables from "../views/Tables.vue";
import Billing from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";
import RTL from "../views/Rtl.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import Signin from "../views/Signin.vue";
import ErrorPage from "@/views/ErrorPage.vue";

import { useStore } from "vuex";

// خارج حارس المسارات أو داخله في نفس الملف
function getCompanyName() {
  // لو عندك user => user.company => company.name
  // اعمل أي Normalization للمسافات أو الرموز
  const store = useStore();
  const companyNameValue = computed(() => store.getters.companyName);
  const companyName = companyNameValue.value;

  return companyName.replace(/\s+/g, "-");
}

const routes = [
  {
    path: "/",
    name: "/",
    component: () => import("../views/Start.vue"),
    meta: { public: true },
  },
  {
    path: "/:companyName/dashboard-default",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/:companyName/tables",
    name: "Tables",
    component: Tables,
    meta: { requiresAuth: true },
  },
  {
    path: "/:companyName/billing",
    name: "Billing",
    component: Billing,
    meta: { requiresAuth: true },
  },
  {
    path: "/:companyName/virtual-reality",
    name: "Virtual Reality",
    component: VirtualReality,
    meta: { requiresAuth: true },
  },
  {
    path: "/rtl-page",
    name: "RTL",
    component: RTL,
    meta: { public: true }, // صفحة عامة
  },
  {
    path: "/signup-Ar",
    name: "SignupArabic",
    component: () => import("../views/Rtlsignup.vue"),
    meta: { public: true }, // صفحة عامة
  },
  {
    path: "/:companyName/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
    meta: { public: true }, // صفحة عامة
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
    meta: { public: true },
  },
  {
    path: "/start",
    name: "start",
    component: () => import("../views/Start.vue"),
    meta: { public: true },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("../views/ForgotPassword.vue"),
    meta: { public: true },
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: () => import("../views/ResetPassword.vue"),
    meta: { public: true },
  },
  {
    path: "/:companyName/icon",
    name: "icon",
    component: () => import("../views/icon.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:companyName/addUser",
    name: "add user",
    component: () => import("@/views/AddUser.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/user-information",
    name: "user information",
    component: () => import("@/views/userInformation.vue"),
    meta: { public: true },
  },
  {
    path: "/:companyName/team",
    name: "team",
    component: () => import("@/views/Team.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:companyName/add-role&permissions",
    name: "roles & permissions",
    component: () => import("@/views/AddRole.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:companyName/task-reports",
    name: "reported tasks",
    component: () => import("@/views/ReportedTask.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/error",
    name: "Error",
    component: ErrorPage,
    meta: { public: true },
  },
  {
    path: "/:companyName/department",
    name: "department",
    component: () => import("@/views/Department.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:companyName/project",
    name: "project",
    component: () => import("@/views/Project.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:companyName/manage-routine-task",
    name: "manage routine task",
    component: () => import("@/views/ManageRoutineTask.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:companyName/routine-task",
    name: "routine task",
    component: () => import("@/views/RoutineTask.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:companyName/one-time-task",
    name: "one time task",
    component: () => import("@/views/OneTimeTask.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.VUE_APP_BASE_URL),
  routes,
  linkActiveClass: "active",
});

// وظيفة للتحقق من المصادقة
function isUserAuthenticated() {
  return !!localStorage.getItem("token"); // تحقق إذا كان `token` موجودًا
}


// حراسة المسارات
router.beforeEach((to, from, next) => {
  const isAuthenticated = isUserAuthenticated();

  // 1) لو المسار يحتاج تسجيل دخول، والمستخدم مش مسجّل، نوديه للـ Signin
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: "Signin" });
  }

  // 2) لو المستخدم مسجّل، والصفحة عامة، واسمها Signin (مثال)، نوديه للـ Dashboard
  if (isAuthenticated && to.meta.public && to.name === "Signin") {
    return next({ name: "Dashboard", params: { companyName: getCompanyName() } });
  }

  // 3) التحقق من companyName (لو المسار يحتوي عليه)
  const userCompanyName = getCompanyName(); // دالة هننشئها أسفل للكشف من الـ Store
  if (to.params.companyName && to.meta.requiresAuth) {
    // لو الشركة غير مطابقة
    if (to.params.companyName !== userCompanyName) {
      // حمايتك: إما توجيهه لصفحة خطأ، أو صفحة الشركة الصحيحة
      // return next({ name: "Error" });
      // أو:
      return next({ name: "Dashboard", params: { companyName: userCompanyName } });
    }
  }

  return next(); // السماح بالانتقال
});


router.afterEach((to) => {
  window.gtag('config', 'G-VGLP578ZCJ', {
    page_path: to.fullPath
  });
});


export default router;
