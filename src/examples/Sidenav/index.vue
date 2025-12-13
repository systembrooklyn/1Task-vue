<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import SidenavList from "./SidenavList.vue";
// import logo from "@/assets/img/logo-ct-dark.png";
// import logoWhite from "@/assets/img/logo-ct.png";

// const logo1Task = 'https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1).png?updatedAt=1730567034766'

// Logo URLs
const lightModeLogo = "https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1)%20(1).png?ik-obj-version=9sTuepUtU27Iw3.FfIbdKOdc7MYL4WM0&updatedAt=1737223784202";
const darkModeLogo = "https://ik.imagekit.io/ts7pphpbz3/Gemini_Generated_Image_d9o2p5d9o2p5d9o2-removebg-preview.png";

// Computed logo based on dark mode
const logoUrl = computed(() => {
  return isDarkMode.value ? darkModeLogo : lightModeLogo;
});

const store = useStore();
const isRTL = computed(() => store.state.isRTL);
const layout = computed(() => store.state.layout);
const isDarkMode = computed(() => store.state.darkMode);
// const sidebarType = computed(() => store.state.sidebarType);

// Sidebar collapse state (for desktop)
const collapsed = ref(false);

// Mobile sidebar visibility state (show/hide completely)
const isMobileOpen = ref(false);

// Check if mobile
const checkMobile = () => {
  return window.innerWidth < 992;
};

const updateMobileState = () => {
  // Reset mobile state when switching to desktop
  if (!checkMobile()) {
    if (isMobileOpen.value) {
      isMobileOpen.value = false;
      document.body.style.overflow = '';
    }
  } else {
    // On mobile, always start closed (independent of desktop state)
    isMobileOpen.value = false;
  }
};

onMounted(() => {
  // Desktop state - load from localStorage (only for desktop)
  if (checkMobile()) {
    // On mobile, don't load desktop state
    collapsed.value = false;
  } else {
    const savedState = localStorage.getItem('sidebarCollapsed');
    collapsed.value = savedState === 'true';
  }

  // Listen for mobile sidebar toggle events from Navbar
  window.addEventListener('mobileSidebarToggle', handleMobileToggle);
  window.addEventListener('mobileSidebarClose', closeMobileSidebar);
  window.addEventListener('resize', updateMobileState);

  // Initialize mobile state (always closed on mount)
  updateMobileState();
});

onUnmounted(() => {
  window.removeEventListener('mobileSidebarToggle', handleMobileToggle);
  window.removeEventListener('mobileSidebarClose', closeMobileSidebar);
  window.removeEventListener('resize', updateMobileState);
});

const handleMobileToggle = () => {
  if (checkMobile()) {
    isMobileOpen.value = !isMobileOpen.value;
    // Prevent body scroll when sidebar is open
    if (isMobileOpen.value) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
};

const closeMobileSidebar = () => {
  if (checkMobile()) {
    isMobileOpen.value = false;
    document.body.style.overflow = '';
  }
};

const toggleSidebar = () => {
  // Only toggle collapse on desktop - mobile uses handleMobileToggle
  if (checkMobile()) {
    // On mobile, this should not be called, but if it is, use mobile toggle
    handleMobileToggle();
    return;
  }

  // Desktop only: toggle and save to localStorage
  collapsed.value = !collapsed.value;
  localStorage.setItem('sidebarCollapsed', String(collapsed.value));

  // Dispatch custom event for main content to listen (desktop only)
  window.dispatchEvent(new CustomEvent('sidebarToggle'));
};

// Close mobile sidebar when clicking on backdrop
const handleBackdropClick = () => {
  closeMobileSidebar();
  window.dispatchEvent(new CustomEvent('mobileSidebarClose'));
};
</script>
<template>
  <!-- Mobile Backdrop Overlay -->
  <div v-if="isMobileOpen" class="sidebar-backdrop" @click="handleBackdropClick" @touchstart="handleBackdropClick">
  </div>

  <!-- <div
    v-show="layout === 'default'"
    class="min-height-300 position-absolute w-100"
    :class="`${darkMode ? 'bg-transparent' : 'bg-success'}`"
  /> -->

  <aside class="sidenav navbar navbar-vertical navbar-expand-xs sidebar-transition sidebar-overlay" :class="`${isRTL ? 'rotate-caret' : ''}    
      ${layout === 'landing' ? 'bg-transparent shadow-none' : ''}
      ${checkMobile() ? '' : (collapsed ? 'sidebar-collapsed' : 'sidebar-expanded')}
      ${checkMobile() ? (isMobileOpen ? 'mobile-sidebar-open' : 'mobile-sidebar-closed') : ''}`" id="sidenav-main">
    <div class="sidenav-header d-flex align-items-center justify-content-between px-3">
      <router-link class="navbar-brand m-0" to="#" v-if="!collapsed">
        <img :src="logoUrl" class="navbar-brand-img h-100" alt="main_logo" style="max-height: 40px;" />
      </router-link>
      <button class="sidebar-toggle-btn desktop-hamburger" @click="toggleSidebar"
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

/* RTL Support for Sidebar - Base */
[dir="rtl"] .sidebar-overlay {
  left: auto !important;
  right: 0 !important;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1) !important;
}

/* Sidebar width transitions */
.sidebar-transition {
  transition: width 0.3s ease, min-width 0.3s ease, transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
}

.sidebar-expanded {
  width: 260px !important;
  min-width: 260px !important;
}

.sidebar-collapsed {
  width: 80px !important;
  min-width: 80px !important;
}

/* Mobile Sidebar Styles - Full Overlay */
@media (max-width: 991px) {
  .sidebar-overlay {
    width: 100% !important;
    max-width: 320px !important;
    transform: translateX(-100%);
    opacity: 0;
    visibility: hidden;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mobile-sidebar-open {
    transform: translateX(0) !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .mobile-sidebar-closed {
    transform: translateX(-100%) !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }

  /* RTL Support for Mobile */
  [dir="rtl"] .sidebar-overlay {
    left: auto;
    right: 0;
    transform: translateX(100%);
  }

  [dir="rtl"] .mobile-sidebar-open {
    transform: translateX(0) !important;
  }

  [dir="rtl"] .mobile-sidebar-closed {
    transform: translateX(100%) !important;
  }
}

/* Desktop keeps normal behavior */
@media (min-width: 992px) {

  /* On desktop, ignore mobile classes */
  .mobile-sidebar-open,
  .mobile-sidebar-closed {
    transform: none !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* Ensure desktop sidebar always visible */
  .sidebar-overlay {
    transform: none !important;
    opacity: 1 !important;
    visibility: visible !important;
    width: auto !important;
    max-width: none !important;
  }

  /* RTL Support for Desktop Sidebar */
  [dir="rtl"] .sidebar-overlay {
    left: auto !important;
    right: 0 !important;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1) !important;
  }
}

/* On mobile, ignore desktop collapse/expand classes */
@media (max-width: 991px) {

  .sidebar-expanded,
  .sidebar-collapsed {
    width: 100% !important;
    max-width: 320px !important;
    min-width: auto !important;
  }
}

/* Mobile Backdrop */
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 992px) {
  .sidebar-backdrop {
    display: none;
  }
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

/* Hide hamburger icon on mobile - Navbar will handle it */
@media (max-width: 991px) {
  .desktop-hamburger {
    display: none !important;
  }
}

/* Show on desktop/tablet */
@media (min-width: 992px) {
  .desktop-hamburger {
    display: flex;
  }
}
</style>
