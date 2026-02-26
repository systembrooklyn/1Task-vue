<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const darkMode = computed(() => store.state.darkMode)

// ✅ تحويل إلى computed property لتحديث الترجمة تلقائياً
const features = computed(() => [
  {
    title: t('landing.feature1Title') || 'Routine Tasks',
    desc: t('landing.feature1Desc') || 'Streamline recurring daily operations.',
    icon: 'fa-solid fa-rotate',
    iconClass: 'feature-icon-indigo'
  },
  {
    title: t('landing.feature2Title') || 'Goal Tracking',
    desc: t('landing.feature2Desc') || 'Connect tasks to company objectives.',
    icon: 'fa-solid fa-bullseye',
    iconClass: 'feature-icon-emerald'
  },
  {
    title: t('landing.feature3Title') || 'Departments',
    desc: t('landing.feature3Desc') || 'Organize workforce by specific units.',
    icon: 'fa-solid fa-building-user',
    iconClass: 'feature-icon-blue'
  },
  {
    title: t('landing.feature4Title') || 'Work Force',
    desc: t('landing.feature4Desc') || 'Manage agreements and employee data.',
    icon: 'fa-solid fa-users',
    iconClass: 'feature-icon-orange'
  },
  {
    title: t('landing.feature5Title') || 'Automations',
    desc: t('landing.feature5Desc') || 'Trigger actions on task updates.',
    icon: 'fa-solid fa-robot',
    iconClass: 'feature-icon-pink'
  },
  {
    title: t('landing.feature6Title') || 'Reports & Insights',
    desc: t('landing.feature6Desc') || 'Visual charts for performance trends.',
    icon: 'fa-solid fa-chart-line',
    iconClass: 'feature-icon-yellow'
  },
  {
    title: t('landing.feature7Title') || 'Multilingual',
    desc: t('landing.feature7Desc') || 'Full support for English and Arabic.',
    icon: 'fa-solid fa-language',
    iconClass: 'feature-icon-slate'
  },
  {
    title: t('landing.feature8Title') || 'Integrations',
    desc: t('landing.feature8Desc') || 'Connects with your favorite apps.',
    icon: 'fa-solid fa-plug',
    iconClass: 'feature-icon-purple'
  }
])
</script>

<template>
  <section id="features" class="features-section py-5" :class="darkMode ? 'bg-secondary' : 'bg-white'">
    <div class="container">
      <div class="text-center mx-auto mb-5 features-header">
        <h3 class="display-5 fw-bold mb-3" :class="darkMode ? 'text-white' : 'text-dark'">
          {{ t('landing.featuresTitle') || 'Everything you need to ship faster' }}
        </h3>
        <p class="lead" :class="darkMode ? 'text-secondary' : 'text-muted'">
          {{ t('landing.featuresSubtitle') || 'Powerful features wrapped in a simple, intuitive interface.' }}
        </p>
      </div>

      <div class="row g-4">
        <div v-for="(feature, index) in features" :key="index" class="col-md-6 col-lg-3">
          <div class="feature-card rounded-3 border p-3" :class="darkMode
            ? 'bg-dark border-secondary'
            : 'bg-white border-light'">
            <div class="feature-icon rounded d-flex align-items-center justify-content-center mb-3 text-white"
              :class="feature.iconClass">
              <i :class="feature.icon"></i>
            </div>
            <h5 class="fw-bold mb-2" :class="darkMode ? 'text-white' : 'text-dark'">
              {{ feature.title }}
            </h5>
            <p class="text-sm" :class="darkMode ? 'text-secondary' : 'text-muted'">
              {{ feature.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
// ✅ استيراد المتغيرات من _dark-version.scss
@import "~@/assets/scss/argon-dashboard/variables/dark-version";
.features-section {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

.features-header {
  max-width: 48rem;
}

.feature-card {
  transition: all 0.3s ease;
}

.feature-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-icon {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1.125rem;
  transition: transform 0.3s ease;
}

/* Icon Colors - من الصورة */
.feature-icon-indigo {
  background-color: var(--indigo) !important;
}

.feature-icon-emerald {
  background-color: var(--emerald) !important;
}

.feature-icon-blue {
  background-color: var(--blue) !important;
}

.feature-icon-orange {
  background-color: var(--orange) !important;
}

.feature-icon-pink {
  background-color: var(--pink) !important;
}

.feature-icon-yellow {
  background-color: var(--yellow) !important;
}

.feature-icon-slate {
  background-color: var(--slate) !important;
}

.feature-icon-purple {
  background-color: var(--purple) !important;
}

/* Dark mode background only */
.features-section.bg-secondary {
  background-color: #{$dark-version-bg-color} !important;
}

.feature-card.bg-dark {
  background-color: #{$dark-version-card-bg-color} !important;
}

.feature-card.bg-dark:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  border-color: #{$dark-version-border-color} !important;
}
</style>
