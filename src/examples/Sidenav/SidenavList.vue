<script setup>
import { computed, ref, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import SidenavDrop from "./SidenavDrop.vue";

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
</script>

<template>
  <div
    class="collapse navbar-collapse w-auto h-auto h-100"
    id="sidenav-collapse-main"
  >
    <ul class="navbar-nav">

      <li class="nav-item" v-show="permissions['view-dailytask'] || isOwner">
        <sidenav-item
          to="/routine-task"
          :class="getRoute() === 'routine-task' ? 'active' : ''"
          :navText="isRTL ? ' المهام اليومية' : ' Routine Task'"
        >
          <template v-slot:icon>
            <i class="fa fa-tasks text-success text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>
      <!-- <li class="nav-item">
        <sidenav-item
          to="/dashboard-default"
          :class="getRoute() === 'dashboard-default' ? 'active' : ''"
          :navText="isRTL ? 'لوحة القيادة' : 'Dashboard'"
        >
          <template v-slot:icon>
            <i class="ni ni-tv-2 text-primary text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li> -->

      <!-- <li
        class="nav-item dropdown"
        v-show="
          permissions['view-user'] ||
          permissions['view-role'] ||
          permissions['invite-user'] ||
          isOwner
        "
      >
        <a
          class="nav-link dropdown-toggle d-flex align-items-center"
          href="#"
          id="navbarDropdown"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          @click="showMenu = !showMenu"
          :class="[
            showMenu ? 'show' : '',
            darkMode ? 'text-white' : 'text-dark',
          ]"
          @blur="closeMenu"
        >
        
          <i class="ni ni-single-02 text-info text-sm opacity-10 text-center"></i>
          <span class="nav-link-text ms-1">Work Force</span>
        </a>
        <ul
          :class="['dropdown-menu dropdown-menu-end', showMenu ? 'show' : '']"
          aria-labelledby="navbarDropdown"
          style="z-index: 1050; position: absolute; top: 100%; left: 0"
        >
          <sidenav-item
            to="/addUser"
            v-show="permissions['invite-user'] || isOwner"
            :class="getRoute() === 'addUser' ? 'active' : ''"
            :navText="isRTL ? 'اضافة مستخدم' : 'Add User'"
          >
            <template v-slot:icon>
              <i class="ni ni-single-02 text-primary text-sm opacity-10"></i>
            </template>
          </sidenav-item>
          <sidenav-item
            to="/team"
            v-show="permissions['view-user'] || isOwner"
            :class="getRoute() === 'team' ? 'active' : ''"
            :navText="isRTL ? 'فريق' : 'Team'"
          >
            <template v-slot:icon>
              <i class="ni ni-single-02 text-primary text-sm opacity-10"></i>
            </template>
          </sidenav-item>
          <sidenav-item
            to="/add-role"
            v-show="permissions['view-role'] || isOwner"
            :class="getRoute() === 'addRole' ? 'active' : ''"
            :navText="isRTL ? 'اضافة دور' : 'Add Role'"
          >
            <template v-slot:icon>
              <i class="ni ni-single-02 text-primary text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </ul>
      </li> -->

      <li>
        <SidenavDrop
          title="Work Force"
          :items="[
            {
              to: '/addUser',
              label: isRTL ? 'اضافة مستخدم' : 'Add User',
              icon: 'ni ni-single-02 text-primary',
              active: getRoute() === 'addUser',
            },
            {
              to: '/team',
              label: isRTL ? 'فريق' : 'Team',
              icon: 'ni ni-single-02 text-primary',
              active: getRoute() === 'team',
            },
            {
              to: '/add-role',
              label: isRTL ? 'اضافة دور' : 'Add Role',
              icon: 'ni ni-single-02 text-primary',
              active: getRoute() === 'addRole',
            },
          ]"
          icon="ni ni-single-02"
          :darkMode="darkMode"
        ></SidenavDrop>
      </li>

      <!-- v-if="canCreateDepartment" -->
      <li class="nav-item">
        <sidenav-item
          to="/department"
          v-show="permissions['view-department'] || isOwner"
          :class="getRoute() === 'department' ? 'active' : ''"
          :navText="isRTL ? 'الاقسام' : 'Department'"
        >
          <template v-slot:icon>
            <i class="ni ni-building text-primary text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item" v-show="permissions['view-project'] || isOwner">
        <sidenav-item
          to="/project"
          :class="getRoute() === 'project' ? 'active' : ''"
          :navText="isRTL ? 'المشاريع' : 'Project'"
        >
          <template v-slot:icon>
            <i class="ni ni-app text-success text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item" v-show="permissions['view-alldailytask'] || isOwner">
        <sidenav-item
          to="/manage-routine-task"
          :class="getRoute() === 'manage-routine-task' ? 'active' : ''"
          :navText="isRTL ? 'ادارة المهام اليومية' : 'Manage Routine Task'"
        >
          <template v-slot:icon>
            <i class="fa fa-cogs text-info text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      

      <!-- <li class="nav-item">
        <sidenav-item
          to="/tables"
          :class="getRoute() === 'tables' ? 'active' : ''"
          :navText="isRTL ? 'الجداول' : 'Tables'"
        >
          <template v-slot:icon>
            <i
              class="ni ni-calendar-grid-58 text-warning text-sm opacity-10"
            ></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          to="/billing"
          :class="getRoute() === 'billing' ? 'active' : ''"
          :navText="isRTL ? 'الفواتیر' : 'Billing'"
        >
          <template v-slot:icon>
            <i class="ni ni-credit-card text-success text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          to="/virtual-reality"
          :class="getRoute() === 'virtual-reality' ? 'active' : ''"
          :navText="isRTL ? 'الواقع الافتراضي' : 'Virtual Reality'"
        >
          <template v-slot:icon>
            <i class="ni ni-app text-info text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li> -->

      <!-- <li class="nav-item">
        <sidenav-item
          :to="isRTL ? '/dashboard-default' : '/rtl-page'"
          :class="
            getRoute() === (isRTL ? '/dashboard-default' : '/rtl-page')
              ? 'active'
              : ''
          "
          :navText="isRTL ? 'LTR' : 'RTL'"
        >
          <template v-slot:icon>
            <i class="ni ni-world-2 text-danger text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li> -->

      <li class="mt-3 nav-item">
        <h6
          v-if="isRTL"
          class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6"
          :class="isRTL ? 'me-4' : 'ms-2'"
        >
          صفحات المرافق
        </h6>

        <h6
          v-else
          class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6"
          :class="isRTL ? 'me-4' : 'ms-2'"
        >
          ACCOUNT PAGES
        </h6>
      </li>

      <!-- <li class="nav-item">
        <sidenav-item
          to="/profile"
          :class="getRoute() === 'profile' ? 'active' : ''"
          :navText="isRTL ? 'حساب تعريفي' : 'Profile'"
        >
          <template v-slot:icon>
            <i class="ni ni-single-02 text-dark text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li> -->

      <!-- <li class="nav-item">
        <sidenav-item
          to="/signin"
          :class="getRoute() === 'signin' ? 'active' : ''"
          :navText="isRTL ? 'تسجيل الدخول' : 'Sign In'"
        >
          <template v-slot:icon>
            <i class="ni ni-single-copy-04 text-danger text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li> -->

      <li class="nav-item">
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
      </li>

      <!-- <li class="nav-item">
        <sidenav-item
          to="/signup"
          :class="getRoute() === 'signup' ? 'active' : ''"
          :navText="isRTL ? 'اشتراك' : 'Sign Up'"
        >
          <template v-slot:icon>
            <i class="ni ni-collection text-info text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li> -->
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
</style>
