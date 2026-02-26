<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'
import { activateDarkMode, deactivateDarkMode } from '@/assets/js/dark-mode'

const store = useStore()
const route = useRoute()
const { t, locale } = useI18n()

const isAuthPage = computed(() => ['/signin', '/signup'].includes(route.path))

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)
const darkMode = computed(() => store.state.darkMode)

// ✅ استخدام locale من i18n كأولوية
const currentLanguage = computed(() => locale.value || store.state.language || 'en')
const isRTL = computed(() => currentLanguage.value === 'ar')

const toggleDarkMode = () => {
  if (store.state.darkMode) {
    store.state.darkMode = false
    deactivateDarkMode()
    localStorage.setItem('darkMode', 'false')
  } else {
    store.state.darkMode = true
    activateDarkMode()
    localStorage.setItem('darkMode', 'true')
  }
}

// ✅ استخدام setLocale مباشرة لتحديث i18n locale
const changeLanguage = (lang) => {
  setLocale(lang)
  store.commit('SET_LANGUAGE', lang)
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const lightModeLogo = "https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1)%20(1).png?ik-obj-version=9sTuepUtU27Iw3.FfIbdKOdc7MYL4WM0&updatedAt=1737223784202";
const darkModeLogo = "https://ik.imagekit.io/ts7pphpbz3/Gemini_Generated_Image_d9o2p5d9o2p5d9o2-removebg-preview.png";

const logoUrl = computed(() => {
  return darkMode.value ? darkModeLogo : lightModeLogo;
});

</script>

<template>
  <nav :class="[
    'position-fixed w-100 navbar-landing',
    isScrolled ? 'glass-nav py-2' : 'bg-transparent py-3',
    darkMode ? 'dark-version' : '',
    isRTL ? 'rtl' : 'ltr'
  ]">
    <div class="container d-flex justify-content-between align-items-center navbar-container">
      <router-link to="/" class="navbar-brand d-flex align-items-center" :class="darkMode ? 'text-white' : 'text-dark'">
        <div class="logo-container">
          <img :src="logoUrl" alt="Logo" class="logo-img"
            @error="$event.target.src = 'https://via.placeholder.com/128x64?text=Logo'" />
        </div>
      </router-link>

      <!-- Desktop Menu (hidden on Signin / Signup) -->
      <div v-if="!isAuthPage" class="d-none d-md-flex align-items-center navbar-nav-desktop">
        <a href="#features" class="nav-link" :class="darkMode ? 'text-light' : 'text-dark'">
          {{ t('landing.features') || 'Features' }}
        </a>
        <a href="#solution" class="nav-link" :class="darkMode ? 'text-light' : 'text-dark'">
          {{ t('landing.solutions') || 'Solutions' }}
        </a>
        <a href="#testimonials" class="nav-link" :class="darkMode ? 'text-light' : 'text-dark'">
          {{ t('landing.testimonials') || 'Testimonials' }}
        </a>
        <a href="#pricing" class="nav-link" :class="darkMode ? 'text-light' : 'text-dark'">
          {{ t('landing.pricing') || 'Pricing' }}
        </a>
      </div>

      <div class="d-none d-md-flex align-items-center navbar-actions">
        <!-- Language Switcher -->
        <button @click="changeLanguage(isRTL ? 'en' : 'ar')" class="btn btn-sm me-2"
          :class="darkMode ? 'btn-outline-light' : 'btn-outline-dark'">
          <span class="material-symbols-rounded me-1" style="font-size: 18px;">language</span>
          {{ isRTL ? 'EN' : 'AR' }}
        </button>

        <!-- Dark Mode Toggle -->
        <button @click="toggleDarkMode" class="btn btn-sm me-2"
          :class="darkMode ? 'btn-outline-light' : 'btn-outline-dark'"
          :title="darkMode ? (t('landing.lightMode') || 'Light Mode') : (t('landing.darkMode') || 'Dark Mode')">
          <span class="material-symbols-rounded" style="font-size: 18px;">
            {{ darkMode ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>

        <router-link to="/signup" class="btn btn-sm rounded-pill px-4 navbar-cta-button">
          {{ t('landing.getStarted') || 'Get Started' }}
        </router-link>
      </div>

      <!-- Mobile Menu Button -->
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="d-md-none btn btn-link"
        :class="darkMode ? 'text-white' : 'text-dark'">
        <span class="material-symbols-rounded" style="font-size: 24px;">
          {{ mobileMenuOpen ? 'close' : 'menu' }}
        </span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="mobile-menu d-md-none"
        :class="darkMode ? 'bg-dark border-dark' : 'bg-white border-light'">
        <template v-if="!isAuthPage">
          <a @click="mobileMenuOpen = false" href="#features" class="mobile-menu-link"
            :class="darkMode ? 'text-light' : 'text-dark'">
            {{ t('landing.features') || 'Features' }}
          </a>
          <a @click="mobileMenuOpen = false" href="#solution" class="mobile-menu-link"
            :class="darkMode ? 'text-light' : 'text-dark'">
            {{ t('landing.solutions') || 'Solutions' }}
          </a>
          <a @click="mobileMenuOpen = false" href="#testimonials" class="mobile-menu-link"
            :class="darkMode ? 'text-light' : 'text-dark'">
            {{ t('landing.testimonials') || 'Testimonials' }}
          </a>
          <a @click="mobileMenuOpen = false" href="#pricing" class="mobile-menu-link"
            :class="darkMode ? 'text-light' : 'text-dark'">
            {{ t('landing.pricing') || 'Pricing' }}
          </a>
          <hr :class="darkMode ? 'border-secondary' : 'border-light'" />
        </template>
        <div class="d-flex align-items-center justify-content-center gap-3 mb-3">
          <button @click="changeLanguage(isRTL ? 'en' : 'ar')" class="btn btn-sm"
            :class="darkMode ? 'btn-outline-light' : 'btn-outline-dark'">
            <span class="material-symbols-rounded me-1" style="font-size: 18px;">language</span>
            {{ isRTL ? 'EN' : 'AR' }}
          </button>
          <button @click="toggleDarkMode" class="btn btn-sm"
            :class="darkMode ? 'btn-outline-light' : 'btn-outline-dark'">
            <span class="material-symbols-rounded" style="font-size: 18px;">
              {{ darkMode ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>
        </div>
        <router-link to="/signin" class="mobile-menu-link text-center d-block mb-2"
          :class="darkMode ? 'text-light' : 'text-dark'">
          {{ t('landing.signIn') || 'Sign In' }}
        </router-link>
        <router-link to="/signin" class="btn w-100 rounded navbar-cta-button">
          {{ t('landing.getStarted') || 'Get Started' }}
        </router-link>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.navbar-landing {
  z-index: 1050;
  transition: background-color 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease;
  top: 0;
  left: 0;
  right: 0;
}

/* Blur background on scroll (works on Signin/Signup and Landing) */
.navbar-landing.glass-nav {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.navbar-landing.dark-version.glass-nav {
  background: rgba(26, 26, 26, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  width: 128px;
  height: 64px;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.navbar-nav-desktop {
  gap: 2rem;
}

.navbar-nav-desktop .nav-link {
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  padding: 0.5rem 0;
}

.navbar-nav-desktop .nav-link:hover {
  color: var(--primary-600) !important;
}

.navbar-actions {
  gap: 0.5rem;
}

/* Get Started Button - أخضر من الصورة */
.navbar-cta-button {
  background-color: var(--primary-600) !important;
  border-color: var(--primary-600) !important;
  color: white !important;
  font-weight: 500;
  box-shadow: 0 4px 6px -1px rgba(140, 168, 67, 0.3);
  transition: all 0.3s ease;
}

.navbar-cta-button:hover {
  background-color: var(--primary-700) !important;
  border-color: var(--primary-700) !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(140, 168, 67, 0.4);
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border-bottom: 1px solid;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-menu-link {
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  transition: color 0.3s ease;
  display: block;
}

.btn-sm {
  padding: 0.5rem 1rem;
}

.mobile-menu-link:hover {
  color: var(--primary-600) !important;
}

/* Mobile Menu Transition */
.mobile-menu-enter-active {
  transition: all 0.2s ease-out;
}

.mobile-menu-leave-active {
  transition: all 0.15s ease-in;
}

.mobile-menu-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* RTL Support */
.navbar-container {
  direction: ltr;
  /* Default LTR */
}

.rtl .navbar-container {
  direction: rtl;
  flex-direction: row-reverse;
  /* ✅ عكس الترتيب في RTL */
}

/* ✅ تعديل الترتيب للعناصر في RTL */
.rtl .navbar-actions {
  order: -1;
  /* ✅ Actions تظهر أولاً في RTL */
}

.rtl .navbar-nav-desktop {
  order: 0;
  /* ✅ Navigation في الوسط */
}

.rtl .navbar-brand {
  order: 1;
  /* ✅ Logo في النهاية في RTL */
}

/* ✅ تعديل الـ spacing في RTL */
.rtl .navbar-actions .btn {
  margin-left: 0.5rem;
  margin-right: 0;
}

.rtl .navbar-actions .btn:first-child {
  margin-left: 0;
}

/* 
.rtl .navbar-nav-desktop {
  gap: 0;
} */

.rtl .navbar-nav-desktop .nav-link {
  margin-left: 0;
  margin-right: 2rem;
}

.rtl .navbar-nav-desktop .nav-link:last-child {
  margin-right: 0;
}

/* ✅ تعديل Mobile Menu في RTL */
.rtl .mobile-menu {
  left: auto;
  right: 0;
}

/* Material Symbols Rounded utility classes */
.material-symbols-rounded {
  font-family: 'Material Symbols Rounded';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
}
</style>
