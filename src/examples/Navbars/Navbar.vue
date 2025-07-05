<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import ProfileCard from "../../views/components/ProfileCard.vue";
import defaultImg from "@/assets/img/userProfile.png";

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

console.log("planInfo", planInfo.value);

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

const minimizeSidebar = () => store.commit("sidebarMinimize");
const toggleConfigurator = () => store.commit("toggleConfigurator");

// Reactively get profile data from the Vuex store.
// I'm assuming the getter is named 'profileData'. If not, we may need to adjust this.
const profileData = computed(() => store.getters.profileData);

onMounted(() => {
  // Fetch initial data to populate the store when the component mounts.
  store.dispatch("fetchProfileData");
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
  <nav
    class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl"
    :class="isRTL ? 'top-0 position-sticky z-index-sticky' : ''"
    v-bind="$attrs"
    id="navbarBlur"
    data-scroll="true"
  >
    <!-- <language-switcher /> -->
    <div class="px-3 py-1 container-fluid">
      <breadcrumbs
        :current-page="currentRouteName"
        :current-directory="currentDirectory"
      />
      <div
        class="mt-2 collapse navbar-collapse mt-sm-0 me-md-0 me-sm-4"
        :class="isRTL ? 'px-0' : 'me-sm-4'"
        id="navbar"
      >
        <div
          class="pe-md-3 d-flex align-items-center"
          :class="isRTL ? 'me-md-auto' : 'ms-md-auto'"
        >
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
              <button
                class="btn btn-link nav-link text-body p-0 dropdown-toggle d-flex align-items-center"
                type="button"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                :class="darkMode ? 'text-white' : 'text-dark'"
              >
                <!-- <i class="fa fa-user me-sm-2"></i> -->
                <img
                  class="navbar-profile-image"
                  :src="profileData?.data?.profile?.ppUrl || defaultImg"
                  alt="Profile"
                />
                <div class="d-flex flex-column text-start ms-2">
                  <h6 class="d-sm-inline mb-0 lh-1 font-weight-bold">Hi, {{ userName }}</h6>
                  <small v-if="isOwner" class="d-sm-inline lh-1"><span class="font-weight-bold">Plan:</span> {{
                    planInfo ? planInfo.plan_name : "Free"
                  }}</small>

                  <small class="d-sm-inline lh-1 font-weight-bold" > {{
                    profileData ? profileData.data.profile?.position : "Free"
                  }}</small>
                </div>
              </button>

              <div
                class="dropdown-menu dropdown-menu-end mt-2 py-0"
                aria-labelledby="dropdownMenuButton"
                :style="{ minWidth: '180px', borderRadius: '8px' }"
              >
                <router-link
                  :to="{
                    name: 'Profile',
                    params: { companyName: companyNameNormalized },
                  }"
                >
                  <profile-card :user="profileData?.data" context="navbar" />
                </router-link>
                <div class="dropdown-divider my-0"></div>
                <router-link
                  to="/signin"
                  @click.prevent="logout"
                  class="dropdown-item d-flex align-items-center py-2 px-3 text-danger"
                >
                  <i class="fa fa-sign-out-alt me-2"></i>Sign Out
                </router-link>
              </div>
            </div>

            <!-- حالة عدم وجود مستخدم مسجل -->
            <router-link
              v-else
              :to="isRTL ? '/ar/login' : '/login'"
              class="px-0 nav-link font-weight-bold d-flex align-items-center"
              :class="darkMode ? 'text-white' : 'text-dark'"
            >
              <i class="fa fa-user" :class="isRTL ? 'ms-sm-2' : 'me-sm-2'"></i>
              <span class="d-sm-inline d-none">{{
                isRTL ? "يسجل دخول" : "Sign In"
              }}</span>
            </router-link>
          </li>
          <li class="nav-item d-xl-none ps-3 d-flex align-items-center">
            <a
              href="#"
              @click="minimizeSidebar"
              class="p-0 nav-link text-white"
              id="iconNavbarSidenav"
            >
              <div class="sidenav-toggler-inner">
                <i
                  class="sidenav-toggler-line"
                  :class="darkMode ? 'bg-white' : 'bg-dark'"
                ></i>
                <i
                  class="sidenav-toggler-line"
                  :class="darkMode ? 'bg-white' : 'bg-dark'"
                ></i>
                <i
                  class="sidenav-toggler-line"
                  :class="darkMode ? 'bg-white' : 'bg-dark'"
                ></i>
              </div>
            </a>
          </li>
          <li class="px-3 nav-item d-flex align-items-center">
            <a
              class="p-0 nav-link"
              @click="toggleConfigurator"
              :class="darkMode ? 'text-white' : 'text-dark'"
            >
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
</style>
