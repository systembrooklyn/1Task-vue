<script setup>
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import SidenavList from "./SidenavList.vue";
// import logo from "@/assets/img/logo-ct-dark.png";
// import logoWhite from "@/assets/img/logo-ct.png";

// const logo1Task = 'https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1).png?updatedAt=1730567034766'

const store = useStore();
const isRTL = computed(() => store.state.isRTL);
const layout = computed(() => store.state.layout);
const sidebarType = computed(() => store.state.sidebarType);
// const darkMode = computed(() => store.state.darkMode);

// Sidebar collapse state
const collapsed = ref(false);

onMounted(() => {
  const savedState = localStorage.getItem('sidebarCollapsed');
  collapsed.value = savedState === 'true';
});

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
  localStorage.setItem('sidebarCollapsed', String(collapsed.value));

  // Dispatch custom event for main content to listen
  window.dispatchEvent(new CustomEvent('sidebarToggle'));
};
</script>
<template>
  <!-- <div
    v-show="layout === 'default'"
    class="min-height-300 position-absolute w-100"
    :class="`${darkMode ? 'bg-transparent' : 'bg-success'}`"
  /> -->

  <aside class="sidenav navbar navbar-vertical navbar-expand-xs sidebar-transition sidebar-overlay" :class="`${isRTL ? 'rotate-caret' : ''}    
      ${layout === 'landing' ? 'bg-transparent shadow-none' : ' '
    } ${sidebarType} ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`" id="sidenav-main">
    <div class="sidenav-header d-flex align-items-center justify-content-between px-3">
      <router-link class="navbar-brand m-0" to="#" v-if="!collapsed">
        <img
          src="https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1)%20(1).png?ik-obj-version=9sTuepUtU27Iw3.FfIbdKOdc7MYL4WM0&updatedAt=1737223784202"
          class="navbar-brand-img h-100" alt="main_logo" style="max-height: 40px;" />
      </router-link>
      <button class="sidebar-toggle-btn" @click="toggleSidebar"
        :title="collapsed ? (isRTL ? 'توسيع الشريط الجانبي' : 'Expand Sidebar') : (isRTL ? 'طي الشريط الجانبي' : 'Collapse Sidebar')">
        <div class="hamburger-icon" :class="{ 'active': !collapsed }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>

    <!-- <i
        class="top-0 p-3 cursor-pointer fas fa-times text-secondary opacity-5 position-absolute end-0 d-none d-xl-none"
        aria-hidden="true"
        id="iconSidenav"
      ></i> -->

    <!-- :src="darkMode || sidebarType === 'bg-default' ? logo1Task : logo" -->
    <!-- <span class="ms-2 font-weight-bold me-2">1Task</span> -->


    <hr class="mt-0 horizontal dark" />

    <sidenav-list :collapsed="collapsed" />
  </aside>
</template>

<style scoped>
/* Sidebar overlay positioning */
.sidebar-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  height: 100vh !important;
  z-index: 1050 !important;
  background: white !important;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1) !important;
  border: none !important;
  margin: 0 !important;
  overflow-y: auto !important;
}

/* Sidebar width transitions */
.sidebar-transition {
  transition: width 0.3s ease, min-width 0.3s ease;
}

.sidebar-expanded {
  width: 260px !important;
  min-width: 260px !important;
}

.sidebar-collapsed {
  width: 80px !important;
  min-width: 80px !important;
}

/* Hamburger Toggle Button Styling */
.sidebar-toggle-btn {
  border: none;
  background: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.sidebar-toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-toggle-btn:focus {
  outline: none;
  box-shadow: none;
}

/* Hamburger Icon */
.hamburger-icon {
  width: 20px;
  height: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger-icon span {
  display: block;
  height: 2px;
  width: 100%;
  background-color: #6c757d;
  border-radius: 1px;
  transition: all 0.3s ease;
  transform-origin: center;
}

/* Active state (when sidebar is expanded) - X shape */
.hamburger-icon.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger-icon.active span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.hamburger-icon.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Collapsed state - hamburger lines */
.hamburger-icon:not(.active) span:nth-child(1) {
  transform: translateY(0) rotate(0);
}

.hamburger-icon:not(.active) span:nth-child(2) {
  opacity: 1;
  transform: scaleX(1);
}

.hamburger-icon:not(.active) span:nth-child(3) {
  transform: translateY(0) rotate(0);
}

/* Header adjustments */
.sidenav-header {
  min-height: 60px;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

/* Logo adjustments for collapsed state */
.sidebar-collapsed .navbar-brand-img {
  display: none;
}

/* Material Symbols Rounded utility classes */
.material-symbols-rounded {
  font-family: 'Material Symbols Rounded';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 1rem;
  line-height: 1;
  display: inline-block;
}

.sidebar-icon .material-symbols-rounded {
  font-size: 1.125rem;
}
</style>
