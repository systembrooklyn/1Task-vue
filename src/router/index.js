import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Tables from "../views/Tables.vue";
import Billing from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";
import RTL from "../views/Rtl.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import Signin from "../views/Signin.vue";
import ErrorPage from "@/views/ErrorPage.vue";

const routes = [
  {
    path: "/",
    name: "/",
    component: () => import("../views/Start.vue"),
    meta: { public: true },
  },
  {
    path: "/dashboard-default",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/tables",
    name: "Tables",
    component: Tables,
    meta: { requiresAuth: true },
  },
  {
    path: "/billing",
    name: "Billing",
    component: Billing,
    meta: { requiresAuth: true },
  },
  {
    path: "/virtual-reality",
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
    path: "/profile",
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
    path: "/icon",
    name: "icon",
    component: () => import("../views/icon.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/addUser",
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
    path: "/team",
    name: "team",
    component: () => import("@/views/Team.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/add-role",
    name: "add role",
    component: () => import("@/views/AddRole.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/error",
    name: "Error",
    component: ErrorPage,
    meta: { public: true },
  },
  {
    path: "/department",
    name: "department",
    component: () => import("@/views/Department.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/project",
    name: "project",
    component: () => import("@/views/Project.vue"),
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

  if (to.meta.requiresAuth && !isAuthenticated) {
    // إذا كانت الصفحة تحتاج إلى تسجيل دخول والمستخدم غير مسجل
    next({ name: "Signin" });
  } else if (isAuthenticated && to.meta.public && to.name === "Signin") {
    // إذا كان المستخدم مسجلًا ويحاول الوصول إلى صفحة عامة مثل تسجيل الدخول
    next({ name: "Dashboard" });
  } else {
    next(); // السماح بالانتقال
  }
});

export default router;
