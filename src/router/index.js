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
  const isOwner = localStorage.getItem("isOwner");
  const companyName = companyNameValue.value;
  const isOwnerValue = isOwner;

  return {
    companyName: companyName.replace(/\s+/g, "-"),
    isOwner: isOwnerValue,
  };
}

// في ملف router.js أو guards.js
const requiredPermission = (...requiredPermissions) => {
  return async (to, from, next) => {
    const store = useStore();
    await store.dispatch("fetchUserPermissions"); // Ensure permissions are loaded

    const isOwner = localStorage.getItem("isOwner");
    const userPermissions = computed(() => store.getters.permissions);

    // Check if user is owner OR has any of the required permissions
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.value[permission]
    );

    if (isOwner || hasPermission) {
      next();
    } else {
      const { companyName } = getCompanyName();
      next({
        name: "routine task", // Redirect to a safe route
        params: { companyName },
      });
    }
  };
};

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
    beforeEnter: requiredPermission("view-dashboard", "view-dashboard-owner"),
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
  // {
  //   path: "/:companyName/upload",
  //   name: "Upload",
  //   component: () => import("@/views/Upload.vue"),
  //   meta: { requiresAuth: true },
  // },
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
  {
    path: "/:companyName/chart-reported",
    name: "chart reported",
    component: () => import("@/views/ChartReported.vue"),
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
    return next({
      name: "Dashboard",
      params: { companyName: getCompanyName() },
    });
  }

  // 3) التحقق من companyName (لو المسار يحتوي عليه)
  const userCompanyName = getCompanyName().companyName; // دالة هننشئها أسفل للكشف من الـ Store
  const isOwner = getCompanyName().isOwner;
  if (
    to.params.companyName &&
    to.meta.requiresAuth &&
    (to.meta.requiredPermission || to.meta.isOwner)
  ) {
    // لو الشركة غير مطابقة
    if (to.params.companyName !== userCompanyName) {
      // حمايتك: إما توجيهه لصفحة خطأ، أو صفحة الشركة الصحيحة
      // return next({ name: "Error" });
      // أو:
      return next({
        name: "Dashboard",
        params: { companyName: userCompanyName, isOwner: true },
      });
    } else if (to.meta.isOwner && !isOwner) {
      return next({
        name: "routine task",
        params: { companyName: userCompanyName, isOwner: true },
      });
    }
  }

  return next(); // السماح بالانتقال
});

router.afterEach((to) => {
  window.gtag("config", "G-VGLP578ZCJ", {
    page_path: to.fullPath,
  });
});

export default router;
