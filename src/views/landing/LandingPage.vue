<script setup>
import { computed, onBeforeMount, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'
import { activateDarkMode, deactivateDarkMode } from '@/assets/js/dark-mode'

import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import HeroSection from './sections/HeroSection.vue'
import ProblemsSection from './sections/ProblemsSection.vue'
import SolutionsSection from './sections/SolutionsSection.vue'
import FeaturesSection from './sections/FeaturesSection.vue'
import PricingSection from './sections/PricingSection.vue'
// import HowItWorksSection from './sections/HowItWorksSection.vue'
// import TestimonialsSection from './sections/TestimonialsSection.vue'
import CtaSection from './sections/CtaSection.vue'
import FooterSection from './sections/FooterSection.vue'

const store = useStore()
// eslint-disable-next-line no-unused-vars
const { t } = useI18n() // Will be used in future sections

const darkMode = computed(() => store.state.darkMode)
const isRTL = computed(() => store.state.isRTL)

onBeforeMount(() => {
  store.state.hideConfigButton = true
  store.state.showNavbar = false
  store.state.showSidenav = false
  store.state.showFooter = false

  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === 'true') {
    store.state.darkMode = true
    activateDarkMode()
  } else {
    store.state.darkMode = false
    deactivateDarkMode()
  }

  // ✅ استخدام setLocale مباشرة لتحديث i18n locale
  const language = localStorage.getItem('language') || 'en'
  if (language) {
    setLocale(language)
    store.commit('SET_LANGUAGE', language)
    const isRTL = language === 'ar'
    document.documentElement.setAttribute('lang', language)
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
  }
})

onBeforeUnmount(() => {
  store.state.hideConfigButton = false
  store.state.showNavbar = true
  store.state.showSidenav = true
  store.state.showFooter = true
})
</script>

<template>
  <div class="landing-page antialiased scroll-smooth" :class="{
    'dark-version': darkMode,
    'rtl': isRTL
  }">
    <LandingNavbar />
    <main>
      <HeroSection />
      <ProblemsSection />
      <SolutionsSection />
      <FeaturesSection />
      <PricingSection />
      <!-- <HowItWorksSection /> -->
      <!-- <TestimonialsSection /> -->
      <CtaSection />
    </main>
    <FooterSection />
  </div>
</template>

<style lang="scss" scoped>
// ✅ استيراد المتغيرات من _dark-version.scss (نفس طريقة المشروع)
@import "~@/assets/scss/argon-dashboard/variables/dark-version";

/* CSS Variables for Landing Page Colors - مطابقة الصورة */
.landing-page {
  /* Primary Green Colors - الأخضر الأساسي من الصورة */
  --primary-50: #f7faef;
  --primary-100: #ecf4dc;
  --primary-500: #a6c95a;
  --primary-600: #8ca843;
  --primary-700: #73883a;
  --primary-900: #3d4a1e;

  /* Problems Cards Colors - ألوان كروت المشاكل */
  --red-bg: #fee2e2;
  --red-text: #dc2626;
  --orange-bg: #fed7aa;
  --orange-text: #ea580c;
  --blue-bg: #dbeafe;
  --blue-text: #2563eb;

  /* Features Icons Colors - ألوان أيقونات المميزات */
  --indigo: #6366f1;
  --emerald: #10b981;
  --blue: #3b82f6;
  --orange: #f97316;
  --pink: #ec4899;
  --yellow: #eab308;
  --slate: #475569;
  --purple: #a855f7;

  /* Text & Background Colors */
  --text-light: #475569;
  --text-dark: #0f172a;
  --bg-light: #ffffff;
  --bg-dark: #0f172a;
  --border-light: #e2e8f0;
  --border-dark: #1e293b;
}

.landing-page.dark-version {
  /* ✅ استخدام المتغيرات من _dark-version.scss */
  --text-light: #{$dark-version-body-color};
  --text-dark: rgba(255, 255, 255, 0.9);
  --bg-light: #{$dark-version-card-bg-color};
  --bg-dark: #{$dark-version-bg-color};
  --border-light: #{$dark-version-border-color};
  --border-dark: #{$dark-version-border-color};
  --text-secondary: #{$dark-version-table-color};
}

[v-cloak] {
  display: none;
}

.landing-page {
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.landing-page:not(.dark-version) {
  background-color: var(--bg-light);
  color: var(--text-light);
}

.landing-page.dark-version {
  background-color: var(--bg-dark);
  color: var(--text-light);
}

.glass-nav {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.dark-version .glass-nav {
  background: rgba(26, 26, 26, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-500) 0%, #aef63b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-bg {
  background-image: radial-gradient(circle at top right, var(--primary-100) 0%, transparent 40%),
    radial-gradient(circle at bottom left, var(--primary-100) 0%, transparent 40%);
}

.dark-version .hero-bg {
  background-image: radial-gradient(circle at top right, rgba(166, 201, 90, 0.1) 0%, transparent 40%),
    radial-gradient(circle at bottom left, rgba(166, 201, 90, 0.1) 0%, transparent 40%);
}

.landing-page .container {
  max-width: 1280px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
