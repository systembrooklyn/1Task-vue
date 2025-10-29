<script setup>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import ProfileCard from "../../views/components/ProfileCard.vue";
import defaultImg from "@/assets/img/userProfile.png";
import { useResponsive } from "@/composables/useResponsive";
import { useCompanyConfig } from "@/composables/useCompanyConfig";
import { getLogoStyles, formatCompanyName } from "@/utils/companyBranding";

// import Breadcrumbs from "../Breadcrumbs.vue";
// import LanguageSwitcher from "../../views/components/LanguageSwitcher.vue";

// const showMenu = ref(false);
const store = useStore();
const isRTL = computed(() => store.state.isRTL);
const darkMode = computed(() => store.state.darkMode);
const isOwner = computed(() => store.getters.isOwner);
// const profileData = computed(() => store.getters.profileData);


const route = useRoute();
const router = useRouter();

const planInfo = computed(() => store.getters.planInfo);

// اسم الباقة المشتقة لدعم أكثر من شكل للبيانات القادمة من الـ API
const planName = computed(() => {
  const p = planInfo.value;
  if (!p) return null;
  return (
    p.plan_name ||
    p.name ||
    p?.plan?.name ||
    p?.data?.plan_name ||
    p?.data?.name ||
    p?.data?.plan?.name ||
    p?.data?.expire_date ||
    null
  );
});

// التحقق من خطة Unlimited
const isUnlimitedPlan = computed(() => {
  const name = (planName.value || "").toString().trim().toLowerCase();
  return name === "unlimited" || name === "unlimited plan";
});

const currentRouteName = computed(() => {
  return route.name;
});
const currentDirectory = computed(() => {
  let dir = route.path.split("/")[1];
  return dir.charAt(0).toUpperCase() + dir.slice(1);
});

const currentCompanyName = computed(
  () => store.getters.companyName || "DefaultCompany"
);
const companyNameNormalized = currentCompanyName.value.replace(/\s+/g, "-"); // مثلاً

const userName = computed(() => store.getters.userName);
const lastName = computed(() => store.getters.lastName);
// const planExpireAt = computed(() => store.getters.planExpireAt);
console.log("username " + userName.value)

// Company Config Composables
const {
  companyLogo,
  companyName,
  hasLogo,
  logoSettings,
  navbarSettings,
} = useCompanyConfig();

// Responsive Composables
const { isMobile, isTablet, windowWidth } = useResponsive();

// Check if screen is small (less than 14 inch equivalent - around 1366px width)
const isSmallScreen = computed(() => {
  return windowWidth.value < 1366 || isMobile.value || isTablet.value;
});

// Sidebar state for hamburger animation
// Separate states for mobile and desktop
const sidebarExpandedMobile = ref(false); // Mobile only - never saved to localStorage
const sidebarExpandedDesktop = ref(false); // Desktop only - synced with localStorage

const minimizeSidebar = () => {
  // On mobile: toggle sidebar visibility (show/hide completely) - independent state
  if (isMobile.value || isTablet.value) {
    sidebarExpandedMobile.value = !sidebarExpandedMobile.value;
    // Dispatch event to Sidenav to toggle mobile sidebar
    window.dispatchEvent(new CustomEvent('mobileSidebarToggle'));
  } else {
    // On desktop: use normal collapse/expand - synced with localStorage
    store.commit("sidebarMinimize");
    // Sync desktop state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    sidebarExpandedDesktop.value = savedState !== 'true';
  }
};

// Computed property for hamburger icon state
const sidebarExpanded = computed(() => {
  if (isMobile.value || isTablet.value) {
    return sidebarExpandedMobile.value;
  }
  return sidebarExpandedDesktop.value;
});
const toggleConfigurator = () => store.commit("toggleConfigurator");

// Reactively get profile data from the Vuex store.
// I'm assuming the getter is named 'profileData'. If not, we may need to adjust this.
const profileData = computed(() => store.getters.profileData);

onMounted(async () => {
  // Fetch initial data to populate the store when the component mounts.
  try {
    await Promise.all([
      store.dispatch("fetchProfileData"),
      store.dispatch("fetchPlanInfo"),
    ]);
  } catch (err) {
    console.warn("Navbar init data failed:", err);
  }

  // Initialize sidebar states based on device type
  if (isMobile.value || isTablet.value) {
    // Mobile: always start closed (independent state)
    sidebarExpandedMobile.value = false;
  } else {
    // Desktop: load from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    sidebarExpandedDesktop.value = savedState !== 'true';
  }

  // Listen for sidebar toggle events (desktop only)
  window.addEventListener('sidebarToggle', () => {
    if (!isMobile.value && !isTablet.value) {
      const newState = localStorage.getItem('sidebarCollapsed');
      sidebarExpandedDesktop.value = newState !== 'true';
    }
  });

  // Listen for mobile sidebar close events to sync hamburger icon
  window.addEventListener('mobileSidebarClose', () => {
    if (isMobile.value || isTablet.value) {
      sidebarExpandedMobile.value = false;
    }
  });

  // Listen for window resize to reset states when switching devices
  window.addEventListener('resize', () => {
    if (isMobile.value || isTablet.value) {
      // Switched to mobile - reset mobile state
      sidebarExpandedMobile.value = false;
    } else {
      // Switched to desktop - sync desktop state
      const savedState = localStorage.getItem('sidebarCollapsed');
      sidebarExpandedDesktop.value = savedState !== 'true';
    }
  });
});

console.log("profileData", profileData.value);

// const closeMenu = () => {
//   setTimeout(() => {
//     showMenu.value = false;
//   }, 100);
// };

const logout = () => {
  store
    .dispatch("signOut")
    .then(() => {
      router.push({ name: "Signin" });
    })
    .catch((error) => {
      console.log(error);
    });
};

// const uploadProfileImage = async (file) => {
//   // هنا تضيف كود رفع الصورة على الخادم
//   try {
//     // مثال: استخدام Axios
//     const formData = new FormData();
//     formData.append('image', file);
//     await store.dispatch("uploadProfileImage", formData);    // تحديث الرابط النهائي بعد الرفع
//     profileData.value.profile.ppUrl = 'رابط_الصورة_الجديدة';
//   } catch (error) {
//     console.error('Error uploading image:', error);
//   }
// };
</script>
<template>
  <nav class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl" :class="[
    isRTL ? 'top-0 position-sticky z-index-sticky' : '',
    { 'navbar-small-screen': isSmallScreen },
  ]" v-bind="$attrs" id="navbarBlur" data-scroll="true">
    <!-- <language-switcher /> -->
    <div class="px-3 py-1 container-fluid navbar-container-fluid">
      <!-- Small Screen Layout: Hamburger + Logo + Avatar -->
      <div v-if="isSmallScreen" class="navbar-small-header d-flex align-items-center justify-content-between w-100">
        <!-- Menu Toggle Button (Left Side) -->
        <button class="navbar-toggler p-0 border-0 bg-transparent" type="button" @click="minimizeSidebar"
          :aria-label="isRTL ? 'فتح القائمة' : 'Open menu'">
          <div class="sidenav-toggler-inner mobile-hamburger" :class="{ 'active': sidebarExpanded }">
            <span class="sidenav-toggler-line" :class="darkMode ? 'bg-white' : 'bg-dark'"></span>
            <span class="sidenav-toggler-line" :class="darkMode ? 'bg-white' : 'bg-dark'"></span>
            <span class="sidenav-toggler-line" :class="darkMode ? 'bg-white' : 'bg-dark'"></span>
          </div>
        </button>

        <!-- Company Logo Section (Center) -->
        <div class="navbar-logo-section d-flex align-items-center">
          <img v-if="hasLogo && navbarSettings.showLogo" :src="companyLogo" :alt="companyName"
            class="company-logo-small" :style="getLogoStyles(logoSettings, isMobile)" />
          <span v-else-if="companyName && navbarSettings.showLogo" class="company-name-small"
            :class="darkMode ? 'text-white' : 'text-dark'">
            {{ formatCompanyName(companyName, 15) }}
          </span>
        </div>

        <!-- User Info Compact (Right Side) -->
        <div class="navbar-user-compact d-flex align-items-center gap-2">
          <!-- Avatar Only on Mobile -->
          <div class="nav-item dropdown navbar-avatar-container" v-if="userName">
            <button class="btn btn-link nav-link text-body p-0 d-flex align-items-center navbar-avatar-btn"
              type="button" :id="isMobile ? 'dropdownMenuButtonMobile' : 'dropdownMenuButtonTablet'"
              data-bs-toggle="dropdown" aria-expanded="false" :class="darkMode ? 'text-white' : 'text-dark'">
              <img class="navbar-profile-image-small" :src="profileData?.data?.profile?.ppUrl || defaultImg"
                alt="Profile" />
            </button>

            <div class="dropdown-menu dropdown-menu-end mt-2 py-0 z-index-1000"
              :aria-labelledby="isMobile ? 'dropdownMenuButtonMobile' : 'dropdownMenuButtonTablet'"
              :style="{ minWidth: '180px', borderRadius: '8px' }">
              <router-link :to="{
                name: 'Profile',
                params: { companyName: companyNameNormalized },
              }">
                <profile-card :user="profileData?.data" context="navbar" />
              </router-link>
              <div class="dropdown-divider my-0"></div>
              <div v-if="isOwner && !isUnlimitedPlan" class="px-2">
                <router-link to="/subscription" class="btn bg-gradient-success w-100 py-2">
                  <i class="fas fa-crown me-2" aria-hidden="true"></i>
                  Upgrade Plan
                </router-link>
              </div>
              <div v-if="isOwner && !isUnlimitedPlan" class="dropdown-divider my-0"></div>
              <router-link to="/signin" @click.prevent="logout"
                class="dropdown-item d-flex align-items-center py-2 px-3 text-danger">
                <i class="fa fa-sign-out-alt me-2"></i>Sign Out
              </router-link>
            </div>
          </div>

          <!-- حالة عدم وجود مستخدم مسجل على Small Screen -->
          <router-link v-else :to="isRTL ? '/ar/login' : '/login'"
            class="px-0 nav-link font-weight-bold d-flex align-items-center"
            :class="darkMode ? 'text-white' : 'text-dark'">
            <i class="fa fa-user"></i>
          </router-link>
        </div>
      </div>

      <!-- Desktop/Large Screen Layout -->
      <template v-else>
        <breadcrumbs :current-page="currentRouteName" :current-directory="currentDirectory" />
        <div class="mt-2 collapse navbar-collapse mt-sm-0 me-md-0 me-sm-4" :class="isRTL ? 'px-0' : 'me-sm-4'"
          id="navbar">
          <div class="pe-md-3 d-flex align-items-center" :class="isRTL ? 'me-md-auto' : 'ms-md-auto'">
            <!-- <div class="input-group">
            <span class="input-group-text text-body">
              <i class="fas fa-search" aria-hidden="true"></i>
            </span>
            <input
              type="text"
              class="form-control"
              :placeholder="isRTL ? 'أكتب هنا...' : 'Type here...'"
            />
          </div> -->
          </div>
          <ul class="navbar-nav justify-content-end">
            <li class="nav-item d-flex align-items-center">
              <div class="nav-item dropdown" v-if="userName">
                <button class="btn btn-link nav-link text-body p-0 dropdown-toggle d-flex align-items-center"
                  type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false"
                  :class="darkMode ? 'text-white' : 'text-dark'">
                  <!-- <i class="fa fa-user me-sm-2"></i> -->
                  <img class="navbar-profile-image" :src="profileData?.data?.profile?.ppUrl || defaultImg"
                    alt="Profile" />
                  <div class="d-flex flex-column text-start ms-2">
                    <h6 class="d-sm-inline mb-0 lh-1 font-weight-bold">Hi, {{ userName }} {{ lastName }} </h6>
                    <small v-if="isOwner" class="d-sm-inline lh-1"><span class="font-weight-bold">Plan:</span> {{
                      planName || "Free"
                    }}</small>
                    <small v-if="isOwner" class="d-sm-inline lh-1 font-weight-bold">
                      <span class="font-weight-bold">Expire At:</span>
                      {{ planInfo?.expire_date }}
                    </small>

                    <small class="d-sm-inline lh-1 font-weight-bold"> {{
                      profileData ? profileData.data.profile?.position : "Free"
                    }}</small>
                  </div>
                </button>

                <div class="dropdown-menu dropdown-menu-end mt-2 py-0 z-index-1000" aria-labelledby="dropdownMenuButton"
                  :style="{ minWidth: '180px', borderRadius: '8px' }">
                  <router-link :to="{
                    name: 'Profile',
                    params: { companyName: companyNameNormalized },
                  }">
                    <profile-card :user="profileData?.data" context="navbar" />
                  </router-link>
                  <div class="dropdown-divider my-0"></div>
                  <div v-if="isOwner && !isUnlimitedPlan" class="px-2">
                    <router-link to="/subscription" class="btn bg-gradient-success w-100 py-2">
                      <i class="fas fa-crown me-2" aria-hidden="true"></i>
                      Upgrade Plan
                    </router-link>
                  </div>
                  <div v-if="isOwner && !isUnlimitedPlan" class="dropdown-divider my-0"></div>
                  <router-link to="/signin" @click.prevent="logout"
                    class="dropdown-item d-flex align-items-center py-2 px-3 text-danger">
                    <i class="fa fa-sign-out-alt me-2"></i>Sign Out
                  </router-link>
                </div>
              </div>

              <!-- حالة عدم وجود مستخدم مسجل -->
              <router-link v-else :to="isRTL ? '/ar/login' : '/login'"
                class="px-0 nav-link font-weight-bold d-flex align-items-center"
                :class="darkMode ? 'text-white' : 'text-dark'">
                <i class="fa fa-user" :class="isRTL ? 'ms-sm-2' : 'me-sm-2'"></i>
                <span class="d-sm-inline d-none">{{
                  isRTL ? "يسجل دخول" : "Sign In"
                }}</span>
              </router-link>
            </li>
            <li class="nav-item d-xl-none ps-3 d-flex align-items-center">
              <a href="#" @click="minimizeSidebar" class="p-0 nav-link text-white" id="iconNavbarSidenav">
                <div class="sidenav-toggler-inner">
                  <i class="sidenav-toggler-line" :class="darkMode ? 'bg-white' : 'bg-dark'"></i>
                  <i class="sidenav-toggler-line" :class="darkMode ? 'bg-white' : 'bg-dark'"></i>
                  <i class="sidenav-toggler-line" :class="darkMode ? 'bg-white' : 'bg-dark'"></i>
                </div>
              </a>
            </li>
            <li class="px-3 nav-item d-flex align-items-center">
              <a class="p-0 nav-link" @click="toggleConfigurator" :class="darkMode ? 'text-white' : 'text-dark'">
                <!-- <i class="cursor-pointer fa fa-cog fixed-plugin-button-nav"></i> -->
              </a>
            </li>
            <!-- <li
            class="nav-item dropdown d-flex align-items-center"
            :class="isRTL ? 'ps-2' : 'pe-2'"
          >
            <a
              href="#"
              class="p-0 nav-link "
              :class="[showMenu ? 'show' : '', darkMode ? 'text-white' : 'text-dark']"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              @click="showMenu = !showMenu"
              @blur="closeMenu"
            >
              <i class="cursor-pointer fa fa-bell"></i>
            </a>
            <ul
              class="px-2 py-3 dropdown-menu dropdown-menu-end me-sm-n4"
              :class="showMenu ? 'show' : ''"
              aria-labelledby="dropdownMenuButton"
            >
              <li class="mb-2">
                <a class="dropdown-item border-radius-md" href="javascript:;">
                  <div class="py-1 d-flex">
                    <div class="my-auto">
                      <img
                        src="../../assets/img/team-2.jpg"
                        class="avatar avatar-sm me-3"
                        alt="user image"
                      />
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                      <h6 class="mb-1 text-sm font-weight-normal">
                        <span class="font-weight-bold">New message</span> from
                        Laur
                      </h6>
                      <p class="mb-0 text-xs text-secondary">
                        <i class="fa fa-clock me-1"></i>
                        13 minutes ago
                      </p>
                    </div>
                  </div>
                </a>
              </li>
              <li class="mb-2">
                <a class="dropdown-item border-radius-md" href="javascript:;">
                  <div class="py-1 d-flex">
                    <div class="my-auto">
                      <img
                        src="../../assets/img/small-logos/logo-spotify.svg"
                        class="avatar avatar-sm bg-gradient-dark me-3"
                        alt="logo spotify"
                      />
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                      <h6 class="mb-1 text-sm font-weight-normal">
                        <span class="font-weight-bold">New album</span> by
                        Travis Scott
                      </h6>
                      <p class="mb-0 text-xs text-secondary">
                        <i class="fa fa-clock me-1"></i>
                        1 day
                      </p>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <a class="dropdown-item border-radius-md" href="javascript:;">
                  <div class="py-1 d-flex">
                    <div
                      class="my-auto avatar avatar-sm bg-gradient-secondary me-3"
                    >
                      <svg
                        width="12px"
                        height="12px"
                        viewBox="0 0 43 36"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                      >
                        <title>credit-card</title>
                        <g
                          stroke="none"
                          stroke-width="1"
                          fill="none"
                          fill-rule="evenodd"
                        >
                          <g
                            transform="translate(-2169.000000, -745.000000)"
                            fill="#FFFFFF"
                            fill-rule="nonzero"
                          >
                            <g transform="translate(1716.000000, 291.000000)">
                              <g transform="translate(453.000000, 454.000000)">
                                <path
                                  class="color-background"
                                  d="M43,10.7482083 L43,3.58333333 C43,1.60354167 41.3964583,0 39.4166667,0 L3.58333333,0 C1.60354167,0 0,1.60354167 0,3.58333333 L0,10.7482083 L43,10.7482083 Z"
                                  opacity="0.593633743"
                                />
                                <path
                                  class="color-background"
                                  d="M0,16.125 L0,32.25 C0,34.2297917 1.60354167,35.8333333 3.58333333,35.8333333 L39.4166667,35.8333333 C41.3964583,35.8333333 43,34.2297917 43,32.25 L43,16.125 L0,16.125 Z M19.7083333,26.875 L7.16666667,26.875 L7.16666667,23.2916667 L19.7083333,23.2916667 L19.7083333,26.875 Z M35.8333333,26.875 L28.6666667,26.875 L28.6666667,23.2916667 L35.8333333,23.2916667 L35.8333333,26.875 Z"
                                />
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                      <h6 class="mb-1 text-sm font-weight-normal">
                        Payment successfully completed
                      </h6>
                      <p class="mb-0 text-xs text-secondary">
                        <i class="fa fa-clock me-1"></i>
                        2 days
                      </p>
                    </div>
                  </div>
                </a>
              </li>
            </ul>
          </li> -->
          </ul>
        </div>
      </template>
    </div>
  </nav>
</template>

<style scoped>
button {
  background-color: transparent;
  border: none;
}

.navbar-profile-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

/* ===== Small Screen Styles ===== */
.navbar-small-screen {
  min-height: 64px;
  padding: 8px 0;
}

.navbar-small-screen .navbar-container-fluid {
  display: flex;
  align-items: center;
  height: 100%;
  padding-top: 0;
  padding-bottom: 0;
}

.navbar-small-header {
  padding: 0 12px;
  width: 100%;
  gap: 12px;
  align-items: center;
  height: 100%;
  min-height: inherit;
}

.navbar-logo-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.company-logo-small {
  max-height: 32px;
  max-width: 100px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.company-name-small {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  display: inline-block;
}

.navbar-user-compact {
  flex: 0 0 auto;
  justify-content: flex-end;
  min-width: 0;
  gap: 8px;
  align-items: center;
  height: 100%;
}

.navbar-avatar-container {
  height: 100%;
  display: flex;
  align-items: center;
}

.navbar-profile-image-small {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin: 0;
}

/* Hide dropdown arrow */
.navbar-avatar-btn::after {
  display: none !important;
  content: none !important;
}

.navbar-avatar-btn.dropdown-toggle::after {
  display: none !important;
  content: none !important;
}

.navbar-avatar-btn {
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0 !important;
}

.navbar-avatar-btn:focus,
.navbar-avatar-btn:active {
  box-shadow: none !important;
  outline: none !important;
}

.navbar-toggler {
  flex: 0 0 auto;
  padding: 4px 8px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.navbar-toggler:hover {
  opacity: 0.8;
}

.sidenav-toggler-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Default state - hamburger icon (only on desktop) */
.sidenav-toggler-line {
  width: 20px;
  height: 2px;
  transition: all 0.3s ease;
  display: block;
  border-radius: 1px;
  transform-origin: center;
}

/* Mobile hamburger icon - same style as hamburger-icon in Sidenav */
.mobile-hamburger {
  width: 20px;
  height: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0;
}

.mobile-hamburger .sidenav-toggler-line {
  width: 100%;
  height: 2px;
  display: block;
  border-radius: 1px;
  transition: all 0.3s ease;
  transform-origin: center;
}

/* Active state (when sidebar is expanded) - X shape */
.mobile-hamburger.active .sidenav-toggler-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.mobile-hamburger.active .sidenav-toggler-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.mobile-hamburger.active .sidenav-toggler-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Collapsed state - hamburger lines */
.mobile-hamburger:not(.active) .sidenav-toggler-line:nth-child(1) {
  transform: translateY(0) rotate(0);
}

.mobile-hamburger:not(.active) .sidenav-toggler-line:nth-child(2) {
  opacity: 1;
  transform: scaleX(1);
}

.mobile-hamburger:not(.active) .sidenav-toggler-line:nth-child(3) {
  transform: translateY(0) rotate(0);
}

/* ===== Responsive Adjustments ===== */
@media (max-width: 767px) {
  .navbar-main {
    margin: 0 !important;
    padding: 0 !important;
  }

  .navbar-small-header {
    padding: 0 8px;
    gap: 8px;
  }

  .navbar-logo-section {
    flex: 0 0 auto;
  }

  .company-logo-small {
    max-height: 28px;
    max-width: 80px;
  }

  .company-name-small {
    font-size: 12px;
    max-width: 100px;
  }

  .navbar-profile-image-small {
    width: 44px;
    height: 44px;
  }

  .navbar-user-compact {
    gap: 4px;
  }

  .navbar-toggler {
    padding: 4px;
  }

  .sidenav-toggler-line {
    width: 18px;
  }

  .mobile-hamburger {
    width: 18px;
    height: 14px;
  }

  .mobile-hamburger.active .sidenav-toggler-line:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
  }

  .mobile-hamburger.active .sidenav-toggler-line:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
  }
}

/* Tablet specific (768px - 1365px) */
@media (min-width: 768px) and (max-width: 1365px) {
  .navbar-small-header {
    padding: 0 12px;
    gap: 16px;
  }

  .company-logo-small {
    max-height: 36px;
    max-width: 110px;
  }

  .company-name-small {
    font-size: 14px;
    max-width: 140px;
  }

  .navbar-profile-image-small {
    width: 46px;
    height: 46px;
  }
}

/* Large screens (1366px+) - Desktop */
@media (min-width: 1366px) {
  /* Desktop styles remain as is */
}

/* Dark mode adjustments */
.navbar-small-screen.dark-mode .company-logo-small,
.navbar-small-screen.dark-mode .company-name-small {
  filter: brightness(1.1);
}

/* RTL Support */
[dir="rtl"] .navbar-small-header {
  flex-direction: row-reverse;
}
</style>
