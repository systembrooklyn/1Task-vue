<script setup>
import { computed, ref, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

// Props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});
// import { useRouter } from "vue-router";
// import SidenavDrop from "./SidenavDrop.vue";

// const router = useRouter();

// const route = useRoute();

import SidenavItem from "./SidenavItem.vue";
// import SidenavCard from "./SidenavCard.vue";
// import SidenavDrop from "./SidenavDrop.vue";
import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
  // hasPermission,
} from "@/utils/permissions.js";

// حالة فتح/إغلاق القائمة
// const showMenu = ref(false);

const store = useStore();
const isRTL = computed(() => store.state.isRTL);
// const layout = computed(() => store.state.layout);
// const sidebarType = computed(() => store.state.sidebarType);
// const darkMode = computed(() => store.state.darkMode);
// const planInfo = computed(() => store.getters.planInfo);

// جلب بيانات المستخدم من Vuex
const userData = computed(() => store.getters.user);
const currentCompanyName = computed(
  () => store.getters.companyName || "DefaultCompany"
);
const companyNameNormalized = currentCompanyName.value.replace(/\s+/g, "-"); // مثلاً

const isOwner = computed(() => store.getters.isOwner);
// console.log(userData.value);

// استدعاء الصلاحيات من localStorage بناءً على المستخدم الحالي
const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.id) || {}
);

console.log(permissions.value);

// عند تحميل الصفحة لأول مرة، حفظ الصلاحيات في localStorage
onBeforeMount(() => {
  if (!permissions.value || Object.keys(permissions.value).length === 0) {
    const extractedPermissions = extractPermissionsFromAPI(
      userData.value?.roles
    );
    permissions.value = extractedPermissions;
    savePermissionsToLocalStorage(permissions.value, userData.value?.id);
  }
});

// التحقق من صلاحية معينة
// const canCreateDepartment = computed(() =>
//   hasPermission(permissions.value, "create-department")
// );

// watch(route, () => {
//   showMenu.value = false; // أغلق القائمة عند تغيير المسار
// });

// أمثلة على استخدام الصلاحيات
// const canAddUser = computed(() =>
//   hasPermission(permissions.value, "canAddUser")
// );

// Get route function to determine current route
const getRoute = () => {
  const route = useRoute();
  const routeArr = route.path.split("/");
  return routeArr[1];
};

// const handleSignOut = () => {
//   console.log("handleSignOut");
//   store
//     .dispatch("signOut")
//     .then(() => {
//       router.push({ name: "Signin" });
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// };

// const closeMenu = () => {
//   setTimeout(() => {
//     showMenu.value = false;
//   }, 100);
// };
const collapsibleSections = ref({
  workForce: false,
  tasks: false,
  reports: false,
  accountPages: false,
});

const toggleSection = (section) => {
  collapsibleSections.value[section] = !collapsibleSections.value[section];
};
</script>

<template>
  <div class="collapse navbar-collapse w-auto h-auto h-100 max-height-vh-100" id="sidenav-collapse-main">
    <ul class="navbar-nav">
      <!-- Tasks Section -->

      <li class="nav-item">
        <sidenav-item :to="{
          name: 'Dashboard',
          params: { companyName: companyNameNormalized },
        }" v-if="
          permissions['view-dashboard'] ||
          permissions['view-dashboard-owner'] ||
          isOwner
        " :active="getRoute() === 'dashboard-default'" :navText="isRTL ? 'لوحة القيادة' : 'Dashboard'"
          :collapsed="props.collapsed">
          <template v-slot:icon>
            <span class="material-symbols-rounded text-primary" :class="isRTL ? 'me-3' : 'ms-3'">dashboard</span>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item" v-if="permissions['view-dailytask'] || isOwner">
        <sidenav-item :to="{
          name: 'routine task',
          params: { companyName: companyNameNormalized },
        }" :active="getRoute() === 'routine-task'" :navText="isRTL ? ' المهام اليومية' : ' Routine Tasks'"
          :collapsed="props.collapsed">
          <template v-slot:icon>
            <span class="material-symbols-rounded text-success" :class="isRTL ? 'me-3' : 'ms-3'">checklist</span>
          </template>
        </sidenav-item>
      </li>
      <!-- v-if="isOwner || permissions['view-task']" -->

      <li class="nav-item">
        <sidenav-item :to="{
          name: 'one time task',
          params: { companyName: companyNameNormalized },
        }" :active="getRoute() === 'one-time-task'" :navText="isRTL ? 'مهام المره الواحده' : 'One Time Tasks'"
          :collapsed="props.collapsed">
          <template v-slot:icon>
            <span class="material-symbols-rounded text-warning" :class="isRTL ? 'me-3' : 'ms-3'">schedule</span>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item" v-if="permissions['view-alldailytask'] || isOwner">
        <!-- Collapsed state: show as single icon -->
        <div v-if="props.collapsed" class="nav-link d-flex align-items-center cursor-pointer"
          :title="isRTL ? 'إعدادات المهام' : 'Tasks Settings'">
          <div
            class="icon icon-shape icon-sm text-center d-flex align-items-center justify-content-center sidebar-icon">
            <span class="material-symbols-rounded text-success" :class="isRTL ? 'me-3' : 'ms-3'">tune</span>
          </div>
        </div>

        <!-- Expanded state: show collapsible section -->
        <div v-else class="nav-link d-flex justify-content-between align-items-center cursor-pointer"
          @click="toggleSection('tasks')">
          <div class="d-flex align-items-center">
            <span class="material-symbols-rounded text-success" :class="isRTL ? 'me-3' : 'ms-3'">tune</span>
            <span>{{ isRTL ? "إعدادات المهام" : "Tasks Settings" }}</span>
          </div>
          <i class="fas fa-chevron-right transition-transform" :class="{ 'rotate-180': collapsibleSections.tasks }"></i>
        </div>

        <transition name="dropdown">
          <ul v-if="collapsibleSections.tasks && !props.collapsed" class="nav nav-sm flex-column">
            <li class="nav-item" v-if="permissions['view-alldailytask'] || isOwner">
              <sidenav-item :to="{
                name: 'manage routine task',
                params: { companyName: companyNameNormalized },
              }" :active="getRoute() === 'manage-routine-task'"
                :navText="isRTL ? 'ادارة المهام اليومية' : 'Manage Routine Tasks'" :collapsed="props.collapsed">
                <template v-slot:icon>
                  <span class="material-symbols-rounded text-info" :class="isRTL ? 'me-3' : 'ms-3'">settings</span>
                </template>
              </sidenav-item>
            </li>
            <!-- <li class="nav-item" v-if="isOwner">
              <sidenav-item
                to="/task-reports"
                :class="getRoute() === 'reported-tasks' ? 'active' : ''"
                :navText="isRTL ? ' تقرير المهام' : ' Task Reports'"
              >
                <template v-slot:icon>
                  <i class="fa  fa-check-square text-primary text-sm opacity-10"></i>
                </template>
              </sidenav-item>
            </li> -->
          </ul>
        </transition>
      </li>

      <!-- rport Section -->

      <li class="nav-item" v-if="isOwner || permissions['view-dailyTaskReports']">
        <!-- Collapsed state: show as single icon -->
        <div v-if="props.collapsed" class="nav-link d-flex align-items-center cursor-pointer"
          :title="isRTL ? 'تقارير' : 'Reports'">
          <div
            class="icon icon-shape icon-sm text-center d-flex align-items-center justify-content-center sidebar-icon">
            <span class="material-symbols-rounded text-success" :class="isRTL ? 'me-3' : 'ms-3'">insights</span>
          </div>
        </div>

        <!-- Expanded state: show collapsible section -->
        <div v-else class="nav-link d-flex justify-content-between align-items-center cursor-pointer"
          @click="toggleSection('reports')">
          <div class="d-flex align-items-center">
            <span class="material-symbols-rounded text-success" :class="isRTL ? 'me-3' : 'ms-3'">insights</span>
            <span>{{ isRTL ? "تقارير" : "Reports" }}</span>
          </div>
          <i class="fas fa-chevron-right transition-transform"
            :class="{ 'rotate-180': collapsibleSections.reports }"></i>
        </div>

        <transition name="dropdown">
          <ul v-if="collapsibleSections.reports && !props.collapsed" class="nav nav-sm flex-column">
            <li class="nav-item" v-if="isOwner || permissions['view-dailyTaskReports']">
              <sidenav-item :to="{
                name: 'reported tasks',
                params: { companyName: companyNameNormalized },
              }" :active="getRoute() === 'reported-tasks'" :navText="isRTL ? ' تقرير المهام' : ' Task Reports'"
                :collapsed="props.collapsed">
                <template v-slot:icon>
                  <span class="material-symbols-rounded text-primary"
                    :class="isRTL ? 'me-3' : 'ms-3'">assignment_turned_in</span>
                </template>
              </sidenav-item>
            </li>
            <li class="nav-item" v-if="isOwner || permissions['view-chartReports']">
              <sidenav-item :to="{
                name: 'chart reported',
                params: { companyName: companyNameNormalized },
              }" :active="getRoute() === 'chart reported'" :navText="isRTL ? ' تقرير المهام' : ' Chart Reports'"
                :collapsed="props.collapsed">
                <template v-slot:icon>
                  <span class="material-symbols-rounded text-warning" :class="isRTL ? 'me-3' : 'ms-3'">pie_chart</span>
                </template>
              </sidenav-item>
            </li>
          </ul>
        </transition>
      </li>

      <!-- Work Force Section -->
      <li class="nav-item" v-if="
        permissions['view-user'] ||
        permissions['invite-user'] ||
        permissions['view-role'] ||
        isOwner
      ">
        <!-- Collapsed state: show as single icon -->
        <div v-if="props.collapsed" class="nav-link d-flex align-items-center cursor-pointer"
          :title="isRTL ? 'فريق العمل' : 'Work Force'">
          <div
            class="icon icon-shape icon-sm text-center d-flex align-items-center justify-content-center sidebar-icon">
            <span class="material-symbols-rounded text-primary" :class="isRTL ? 'me-3' : 'ms-3'">group</span>
          </div>
        </div>

        <!-- Expanded state: show collapsible section -->
        <div v-else class="nav-link d-flex justify-content-between align-items-center cursor-pointer"
          @click="toggleSection('workForce')">
          <div class="d-flex align-items-center">
            <span class="material-symbols-rounded text-primary" :class="isRTL ? 'me-3' : 'ms-3'">group</span>
            <span>{{ isRTL ? "فريق العمل" : "Work Force" }}</span>
          </div>
          <i class="fas fa-chevron-right transition-transform"
            :class="{ 'rotate-180': collapsibleSections.workForce }"></i>
        </div>

        <transition name="dropdown">
          <ul v-if="collapsibleSections.workForce && !props.collapsed" class="nav nav-sm flex-column">
            <li class="nav-item">
              <sidenav-item :to="{
                name: 'add user',
                params: { companyName: companyNameNormalized },
              }" v-if="permissions['invite-user'] || isOwner" :active="getRoute() === 'addUser'"
                :navText="isRTL ? 'اضافة موظفين' : 'Add Employees'" :collapsed="props.collapsed">
                <template v-slot:icon>
                  <span class="material-symbols-rounded text-primary" :class="isRTL ? 'me-3' : 'ms-3'">person_add</span>
                </template>
              </sidenav-item>
            </li>
            <li class="nav-item">
              <sidenav-item :to="{
                name: 'team',
                params: { companyName: companyNameNormalized },
              }" v-if="permissions['view-user'] || isOwner" :active="getRoute() === 'team'"
                :navText="isRTL ? 'فريق' : 'Team'" :collapsed="props.collapsed">
                <template v-slot:icon>
                  <span class="material-symbols-rounded text-primary" :class="isRTL ? 'me-3' : 'ms-3'">groups</span>
                </template>
              </sidenav-item>
            </li>
            <li class="nav-item">
              <sidenav-item :to="{
                name: 'roles & permissions',
                params: { companyName: companyNameNormalized },
              }" v-if="permissions['view-role'] || isOwner" :active="getRoute() === 'addRole'"
                :navText="isRTL ? 'أدوار وصلاحيات' : 'Roles & Permissions'" :collapsed="props.collapsed">
                <template v-slot:icon>
                  <span class="material-symbols-rounded text-info"
                    :class="isRTL ? 'me-3' : 'ms-3'">admin_panel_settings</span>
                </template>
              </sidenav-item>
            </li>
          </ul>
        </transition>
      </li>

      <!-- Departments Section -->
      <li class="nav-item">
        <sidenav-item :to="{
          name: 'department',
          params: { companyName: companyNameNormalized },
        }" v-if="permissions['view-department'] || isOwner" :active="getRoute() === 'department'"
          :navText="isRTL ? 'الاقسام' : 'Departments'" :collapsed="props.collapsed">
          <template v-slot:icon>
            <span class="material-symbols-rounded text-primary" :class="isRTL ? 'me-3' : 'ms-3'">apartment</span>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item" v-if="
        permissions['view-project'] ||
        permissions['view-Allproject'] ||
        isOwner
      ">
        <sidenav-item :to="{
          name: 'project',
          params: { companyName: companyNameNormalized },
        }" :active="getRoute() === 'project'" :navText="isRTL ? 'المشاريع' : 'Projects'" :collapsed="props.collapsed">
          <template v-slot:icon>
            <span class="material-symbols-rounded text-success" :class="isRTL ? 'me-3' : 'ms-3'">folder_open</span>
          </template>
        </sidenav-item>
      </li>

      <!-- Goals Section -->
      <li class="nav-item" v-if="isOwner || permissions['view-goals']">
        <sidenav-item :to="{
          name: 'goals',
          params: { companyName: companyNameNormalized },
        }" :active="getRoute() === 'goals'" :navText="isRTL ? 'الأهداف' : 'Goals'" :collapsed="props.collapsed">
          <template v-slot:icon>
            <span class="material-symbols-rounded text-warning" :class="isRTL ? 'me-3' : 'ms-3'">flag_circle</span>
          </template>
        </sidenav-item>
      </li>

      <!-- Meetings Section -->
      <li class="nav-item" v-if="isOwner || permissions['view-meetings']">
        <sidenav-item :to="{
          name: 'meetings',
          params: { companyName: companyNameNormalized },
        }" :active="getRoute() === 'meetings'" :navText="isRTL ? 'الاجتماعات' : 'Meetings'"
          :collapsed="props.collapsed">
          <template v-slot:icon>
            <span class="material-symbols-rounded text-info" :class="isRTL ? 'me-3' : 'ms-3'">handshake</span>
          </template>
        </sidenav-item>
      </li>

      <!-- Automation Section -->
      <li class="nav-item" v-if="isOwner || permissions['view-automation']">
        <sidenav-item :to="{
          name: 'automation',
          params: { companyName: companyNameNormalized },
        }" :active="getRoute() === 'automation'" :navText="isRTL ? 'الأتمتة' : 'Automation'"
          :collapsed="props.collapsed">
          <template v-slot:icon>
            <span class="material-symbols-rounded text-primary" :class="isRTL ? 'me-3' : 'ms-3'">smart_toy</span>
          </template>
        </sidenav-item>
      </li>

      <!-- Apps Section -->
      <li class="nav-item" v-if="isOwner || permissions['view-apps']">
        <sidenav-item :to="{
          name: 'apps',
          params: { companyName: companyNameNormalized },
        }" :active="getRoute() === 'apps'" :navText="isRTL ? 'التطبيقات' : 'Apps'" :collapsed="props.collapsed">
          <template v-slot:icon>
            <span class="material-symbols-rounded text-success" :class="isRTL ? 'me-3' : 'ms-3'">extension</span>
          </template>
        </sidenav-item>
      </li>



      <!-- Account Pages Section -->
      <!-- <li class="nav-item">
        <sidenav-item
          to="/profile"
          :class="getRoute() === 'profile' ? 'active' : ''"
          :navText="'Profile'"
        >
          <template v-slot:icon>
            <i class="ni ni-single-02 text-yellow text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li> -->
      <!-- <li class="nav-item">
        <sidenav-item
          to="/signin"
          :class="getRoute() === 'signout' ? 'active' : ''"
          :navText="isRTL ? 'تسجيل الخروج' : 'Sign Out'"
          @click="handleSignOut"
        >
          <template v-slot:icon>
            <i class="ni ni-button-power text-danger text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li> -->
    </ul>
    <div class="sidenav-footer mx-3 mt-auto">
      <div v-if="planInfo" class="text-center card-plain shadow-none">
        <hr class="horizontal dark" />
        <h6 class="mt-3 text-sm">{{ planInfo.plan_name }}</h6>
        <p class="text-xs text-secondary">
          Expires on: {{ planInfo.expire_date }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidenav-footer {
  position: fixed;
  bottom: 0;
  background: inherit;
  padding-bottom: 1rem;
  margin-top: auto;
}

.nav-item .dropdown-toggle {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

/* .nav-item .dropdown-toggle .fas {
  margin-left: auto;
  transition: transform 0.3s ease;
} */

/* .nav-item .dropdown-toggle .rotate-icon {
  transform: rotate(180deg);
} */

.dropdown-menu {
  z-index: 1050;
  /* لجعل القائمة تظهر فوق العناصر الأخرى */
  position: absolute;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.dropdown-menu .active {
  background-color: #4caf50;
  color: #ffffff;
  border-radius: 5px;
}

.dropdown-menu .active:hover {
  background-color: #4caf50;
}

.nav-item .dropdown-menu-end {
  right: 0;
}

.nav-item .dropdown-menu-end.show {
  display: block;
}

/* Collapsible Sections Styling */
.cursor-pointer {
  cursor: pointer;
  user-select: none;
  padding: 0.5rem 1rem;
  transition: background-color 0.2s ease;
}

.cursor-pointer:hover {
  background-color: rgba(144, 177, 64, 0.15);
  color: #1a1a1a;
}

.transition-transform {
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(90deg);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
}

.dropdown-enter-from,
.dropdown-leave-to {
  max-height: 0;
  opacity: 0;
}

.dropdown-enter-to,
.dropdown-leave-from {
  max-height: 300px;
  opacity: 1;
}

/* Nested List Styling */
.nav-sm {
  padding-left: 1rem;
}

.nav-sm .nav-item {
  margin: 0.25rem 0;
}

/* Sidebar icon styling for collapsed sections */
.sidebar-icon {
  min-width: 24px;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

/* Collapsed section styling */
.nav-link {
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  border-radius: 0.375rem;
  margin: 0.125rem 0.5rem;
}

.nav-link:hover {
  background-color: rgba(144, 177, 64, 0.15);
  color: #1a1a1a;
}

/* RTL Support - عكس اتجاه الأسهم */
[dir="rtl"] .fa-chevron-right {
  transform: scaleX(-1);
}

/* عند الفتح في RTL: السهم يشير لأسفل */
[dir="rtl"] .fa-chevron-right.rotate-180 {
  transform: scaleX(-1) rotate(90deg);
}

/* Center icons when sidebar is collapsed - remove margin from icons */
/* Using global style to target parent class */
</style>

<style>
/* Global styles for collapsed sidebar - center icons */
.sidebar-collapsed .nav-link .sidebar-icon span,
.sidebar-collapsed .nav-link .sidebar-icon .material-symbols-rounded {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Center nav-link content when collapsed */
.sidebar-collapsed .nav-link {
  justify-content: center !important;
}

/* Remove margin from icons inside sidebar-icon when expanded - align icons in one column */
.sidebar-expanded .nav-link .sidebar-icon .material-symbols-rounded,
.sidebar-expanded .nav-link .sidebar-icon span,
.sidebar-expanded .nav-link .material-symbols-rounded,
.sidebar-expanded .nav-link>div>.material-symbols-rounded,
.sidebar-expanded .cursor-pointer>div>.material-symbols-rounded {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Ensure sidebar-icon has fixed width and alignment */
.sidebar-expanded .nav-link .sidebar-icon,
.sidebar-expanded .cursor-pointer>div>.material-symbols-rounded {
  width: 24px !important;
  min-width: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Ensure nav-link items are aligned properly when expanded */
.sidebar-expanded .nav-link,
.sidebar-expanded .cursor-pointer {
  align-items: center !important;
}

/* Unified spacing between icons and text in expanded sidebar - remove all existing margins first */
.sidebar-expanded .nav-link .nav-link-text {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Unified spacing for collapsible sections - remove margins from text */
.sidebar-expanded .cursor-pointer>div>span:not(.material-symbols-rounded) {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Apply unified spacing: 0.75rem between icon and text (works for both LTR and RTL) */
.sidebar-expanded .nav-link .sidebar-icon~.nav-link-text {
  margin-left: 0.75rem !important;
  margin-right: 0.75rem !important;
}

.sidebar-expanded .cursor-pointer>div>.material-symbols-rounded~span {
  margin-left: 0.75rem !important;
  margin-right: 0.75rem !important;
}
</style>
