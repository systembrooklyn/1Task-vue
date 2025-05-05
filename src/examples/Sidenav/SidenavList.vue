<script setup>
import { computed, ref, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
// import SidenavDrop from "./SidenavDrop.vue";

const router = useRouter();

// const route = useRoute();

import SidenavItem from "./SidenavItem.vue";
// import SidenavCard from "./SidenavCard.vue";
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

const handleSignOut = () => {
  console.log("handleSignOut");
  store
    .dispatch("signOut")
    .then(() => {
      router.push({ name: "Signin" });
    })
    .catch((error) => {
      console.log(error);
    });
};

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
  <div
    class="collapse navbar-collapse w-auto h-auto h-100 max-height-vh-100"
    id="sidenav-collapse-main"
  >
    <ul class="navbar-nav">
      <!-- Tasks Section -->

      <li class="nav-item">
        <sidenav-item
          :to="{
            name: 'Dashboard',
            params: { companyName: companyNameNormalized },
          }"
          v-if="
            permissions['view-dashboard'] ||
            permissions['view-dashboard-owner'] ||
            isOwner
          "
          :class="getRoute() === 'dashboard-default' ? 'active' : ''"
          :navText="isRTL ? 'لوحة القيادة' : 'Dashboard'"
        >
          <template v-slot:icon>
            <i class="ni ni-tv-2 text-primary text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item" v-if="permissions['view-dailytask'] || isOwner">
        <sidenav-item
          :to="{
            name: 'routine task',
            params: { companyName: companyNameNormalized },
          }"
          :class="getRoute() === 'routine-task' ? 'active' : ''"
          :navText="isRTL ? ' المهام اليومية' : ' Routine Tasks'"
        >
          <template v-slot:icon>
            <i class="fa fa-tasks text-success text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>
      <!-- v-if="isOwner || permissions['view-task']" -->

      <li class="nav-item">
        <sidenav-item
          :to="{
            name: 'one time task',
            params: { companyName: companyNameNormalized },
          }"
          :class="getRoute() === 'one-time-task' ? 'active' : ''"
          :navText="isRTL ? 'المهام الاحتياطية' : 'One Time Tasks'"
        >
          <template v-slot:icon>
            <i class="fa fa-clock text-warning text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <div
          class="nav-link d-flex justify-content-between align-items-center cursor-pointer"
          v-if="permissions['view-alldailytask'] || isOwner"
          @click="toggleSection('tasks')"
        >
          <div class="d-flex align-items-center">
            <i class="fas fa-tasks text-success me-2"></i>
            <span>{{ isRTL ? "إعدادات المهام" : "Tasks Settings" }}</span>
          </div>
          <i
            class="fas fa-chevron-right transition-transform"
            :class="{ 'rotate-180': collapsibleSections.tasks }"
          ></i>
        </div>

        <transition name="dropdown">
          <ul
            v-if="collapsibleSections.tasks"
            class="nav nav-sm flex-column"
          >
            <li
              class="nav-item"
              v-if="permissions['view-alldailytask'] || isOwner"
            >
              <sidenav-item
                :to="{
                  name: 'manage routine task',
                  params: { companyName: companyNameNormalized },
                }"
                :class="getRoute() === 'manage-routine-task' ? 'active' : ''"
                :navText="
                  isRTL ? 'ادارة المهام اليومية' : 'Manage Routine Tasks'
                "
              >
                <template v-slot:icon>
                  <i class="fa fa-cogs text-info text-sm opacity-10"></i>
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

      <li
        class="nav-item"
        v-if="isOwner || permissions['view-dailyTaskReports']"
      >
        <div
          class="nav-link d-flex justify-content-between align-items-center cursor-pointer"
          @click="toggleSection('reports')"
        >
          <div class="d-flex align-items-center">
            <i class="fas fa-chart-line text-success me-2"></i>
            <span>{{ isRTL ? "تقارير" : "Reports" }}</span>
          </div>
          <i
            class="fas fa-chevron-right transition-transform"
            :class="{ 'rotate-180': collapsibleSections.reports }"
          ></i>
        </div>

        <transition name="dropdown">
          <ul
            v-if="collapsibleSections.reports"
            class="nav nav-sm flex-column"
          >
            <li
              class="nav-item"
              v-if="isOwner || permissions['view-dailyTaskReports']"
            >
              <sidenav-item
                :to="{
                  name: 'reported tasks',
                  params: { companyName: companyNameNormalized },
                }"
                :class="getRoute() === 'reported-tasks' ? 'active' : ''"
                :navText="isRTL ? ' تقرير المهام' : ' Task Reports'"
              >
                <template v-slot:icon>
                  <i
                    class="fas fa-clipboard-check text-primary text-sm opacity-10"
                  ></i>
                </template>
              </sidenav-item>
            </li>
            <li
              class="nav-item"
              v-if="isOwner || permissions['view-chartReports']"
            >
              <sidenav-item
                :to="{
                  name: 'chart reported',
                  params: { companyName: companyNameNormalized },
                }"
                :class="getRoute() === 'chart reported' ? 'active' : ''"
                :navText="isRTL ? ' تقرير المهام' : ' Chart Reports'"
              >
                <template v-slot:icon>
                  <i
                    class="fas fa-chart-pie text-warning text-sm opacity-10"
                  ></i>
                </template>
              </sidenav-item>
            </li>
          </ul>
        </transition>
      </li>

      <!-- Work Force Section -->
      <li
        class="nav-item"
        v-if="
          permissions['view-user'] ||
          permissions['invite-user'] ||
          permissions['view-role'] ||
          isOwner
        "
      >
        <div
          class="nav-link d-flex justify-content-between align-items-center cursor-pointer"
          @click="toggleSection('workForce')"
        >
          <div class="d-flex align-items-center">
            <i class="fas fa-users text-primary me-2"></i>
            <span>{{ isRTL ? "فريق العمل" : "Work Force" }}</span>
          </div>
          <i
            class="fas fa-chevron-right transition-transform"
            :class="{ 'rotate-180': collapsibleSections.workForce }"
          ></i>
        </div>

        <transition name="dropdown">
          <ul
            v-if="collapsibleSections.workForce"
            class="nav nav-sm flex-column"
          >
            <li class="nav-item">
              <sidenav-item
                :to="{
                  name: 'add user',
                  params: { companyName: companyNameNormalized },
                }"
                v-if="permissions['invite-user'] || isOwner"
                :class="getRoute() === 'addUser' ? 'active' : ''"
                :navText="isRTL ? 'اضافة موظفين' : 'Add Employees'"
              >
                <template v-slot:icon>
                  <i
                    class="ni ni-single-02 text-primary text-sm opacity-10"
                  ></i>
                </template>
              </sidenav-item>
            </li>
            <li class="nav-item">
              <sidenav-item
                :to="{
                  name: 'team',
                  params: { companyName: companyNameNormalized },
                }"
                v-if="permissions['view-user'] || isOwner"
                :class="getRoute() === 'team' ? 'active' : ''"
                :navText="isRTL ? 'فريق' : 'Team'"
              >
                <template v-slot:icon>
                  <i
                    class="ni ni-single-02 text-primary text-sm opacity-10"
                  ></i>
                </template>
              </sidenav-item>
            </li>
            <li class="nav-item">
              <sidenav-item
                :to="{
                  name: 'roles & permissions',
                  params: { companyName: companyNameNormalized },
                }"
                v-if="permissions['view-role'] || isOwner"
                :class="getRoute() === 'addRole' ? 'active' : ''"
                :navText="isRTL ? 'أدوار وصلاحيات' : 'Roles & Permissions'"
              >
                <template v-slot:icon>
                  <i class="fas fa-user-lock text-info text-sm opacity-10"></i>
                </template>
              </sidenav-item>
            </li>
          </ul>
        </transition>
      </li>

      <!-- Departments Section -->
      <li class="nav-item">
        <sidenav-item
          :to="{
            name: 'department',
            params: { companyName: companyNameNormalized },
          }"
          v-if="permissions['view-department'] || isOwner"
          :class="getRoute() === 'department' ? 'active' : ''"
          :navText="isRTL ? 'الاقسام' : 'Departments'"
        >
          <template v-slot:icon>
            <i class="ni ni-building text-primary text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li
        class="nav-item"
        v-if="
          permissions['view-project'] ||
          permissions['view-Allproject'] ||
          isOwner
        "
      >
        <sidenav-item
          :to="{
            name: 'project',
            params: { companyName: companyNameNormalized },
          }"
          :class="getRoute() === 'project' ? 'active' : ''"
          :navText="isRTL ? 'المشاريع' : 'Projects'"
        >
          <template v-slot:icon>
            <i class="ni ni-app text-success text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <!-- Account Pages Section -->
      <!-- <li class="mt-3 nav-item">
        <div 
          class="nav-link d-flex justify-content-between align-items-center cursor-pointer"
          @click="toggleSection('accountPages')"
        >
          <div class="d-flex align-items-center">
            <i class="fas fa-user-circle text-warning me-2"></i>
            <span>{{ isRTL ? 'صفحات المرافق' : 'Account Pages' }}</span>
          </div>
          <i 
            class="fas fa-chevron-right transition-transform" 
            :class="{ 'rotate-180': collapsibleSections.accountPages }"
          ></i>
        </div> -->

      <!-- <transition name="dropdown">
          <ul 
            v-if="collapsibleSections.accountPages" 
            class="nav nav-sm flex-column"
          > -->
      <!-- <li class="nav-item"> -->
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
      <!-- </li> -->
      <!-- </transition> -->
      <!-- </li> -->
    </ul>
  </div>
</template>

<style scoped>
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
  z-index: 1050; /* لجعل القائمة تظهر فوق العناصر الأخرى */
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
  background-color: rgba(0, 0, 0, 0.05);
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
</style>
