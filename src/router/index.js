// router/index.js

import { createRouter, createWebHistory } from "vue-router";
import { computed } from "vue";
import { useStore } from "vuex";

// 1. استيراد دالة فك التشفير من ملف الـ store
import { decryptData } from "@/store/index.js";

// --- استيراد المكونات (Views) ---
import Dashboard from "../views/Dashboard.vue";
import Tables from "../views/Tables.vue";
import Billing from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";
import RTL from "../views/Rtl.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import Subscription from "../views/Subscription.vue";
import Signin from "../views/Signin.vue";
import ErrorPage from "@/views/ErrorPage.vue";

// 2. دالة getCompanyName المعدلة التي تقرأ وتفك تشفير البيانات من localStorage
function getCompanyName() {
  const rawCompanyName = localStorage.getItem("companyName");
  const rawIsOwner = localStorage.getItem("isOwner");

  const companyName = decryptData(rawCompanyName);
  const isOwner = decryptData(rawIsOwner);

  const formattedCompanyName = companyName ? companyName.replace(/\s+/g, "-") : "";

  return {
    companyName: formattedCompanyName,
    isOwner: !!isOwner, // تحويلها إلى boolean
  };
}

// 3. دالة التحقق من الصلاحيات (مع تعديل بسيط لضمان عملها عند التحديث)
const requiredPermission = (...requiredPermissions) => {
  return async (to, from, next) => {
    const store = useStore();
    
    // تأكد من جلب الصلاحيات الحديثة دائماً
    await store.dispatch("fetchUserPermissions");

    // احصل على حالة المالك بشكل موثوق
    const { isOwner } = getCompanyName();
    const userPermissions = computed(() => store.getters.permissions);

    // التحقق إذا كان المستخدم مالكاً أو يملك أحد الصلاحيات المطلوبة
    const hasPermission = requiredPermissions.some(permission =>
      userPermissions.value[permission]
    );

    if (isOwner || hasPermission) {
      next();
    } else {
      const { companyName } = getCompanyName();
      next({
        name: "routine task", // إعادة توجيه إلى صفحة آمنة
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
    meta: { public: true },
  },
  {
    path: "/signup-Ar",
    name: "SignupArabic",
    component: () => import("../views/Rtlsignup.vue"),
    meta: { public: true },
  },
  {
    path: "/:companyName/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/subscription",
    name: "Subscription",
    component: Subscription,
    meta: { requiresAuth: true },
  },
  {
    path: "/checkout/:planId",
    name: "Checkout",
    component: () => import("@/views/Checkout.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
    meta: { public: true },
  },
  {
    path: "/pricing",
    name: "Pricing",
    component: () => import("@/views/PricingTable.vue"),
    meta: { public: true },
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
    meta: { requiresAuth: true }, // يفترض أن يكون محميًا بصلاحية معينة
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

function isUserAuthenticated() {
  return !!localStorage.getItem("token");
}

// 4. حارس المسارات العام (Global Navigation Guard) المحدّث والكامل
router.beforeEach((to, from, next) => {
  const isAuthenticated = isUserAuthenticated();
  const { companyName: userCompanyName, isOwner } = getCompanyName();

  // الحالة الأولى: المسار يتطلب تسجيل دخول، والمستخدم غير مسجل
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: "Signin" });
  }

  // الحالة الثانية: المستخدم مسجل بالفعل ويحاول الوصول لصفحة عامة (تسجيل دخول، بداية)
  if (isAuthenticated && to.meta.public && (to.name === "Signin" || to.name === "start" || to.name === "/")) {
    if (userCompanyName) { // تأكد من وجود اسم الشركة قبل التوجيه
      return next({
        name: "Dashboard",
        params: { companyName: userCompanyName },
      });
    }
  }

  // الحالة الثالثة: التحقق من تطابق اسم الشركة في الرابط (إذا كان المسار يتطلب مصادقة)
  if (to.params.companyName && isAuthenticated && to.params.companyName !== userCompanyName) {
    // إذا كان اسم الشركة في الرابط خاطئًا، قم بتصحيحه وإعادة التوجيه
    return next({
      ...to,
      params: { ...to.params, companyName: userCompanyName },
    });
  }

  // الحالة الرابعة: التحقق إذا كان المسار يتطلب صلاحية المالك (`isOwner`)
  // هذا هو المنطق الذي طلبت الحفاظ عليه
  if (to.meta.isOwner && !isOwner) {
    // إذا كان المسار للمالك فقط والمستخدم الحالي ليس مالكًا
    return next({
      name: "routine task", // أو "Dashboard" أو أي صفحة أخرى مناسبة
      params: { companyName: userCompanyName },
    });
  }

  // إذا مرت كل الشروط، اسمح بالانتقال
  return next();
});

router.afterEach((to) => {
  window.gtag("config", "G-VGLP578ZCJ", {
    page_path: to.fullPath,
  });
});

export default router;