<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const darkMode = computed(() => store.state.darkMode)

// ✅ تحويل إلى computed property لتحديث الترجمة تلقائياً
const steps = computed(() => [
  {
    icon: 'fa-solid fa-users',
    iconBgClass: 'step-icon-red',
    title: t('landing.step1Title') || 'Create Workspace',
    desc: t('landing.step1Desc') || 'Sign up and invite your team members. Organize by department or project.'
  },
  {
    icon: 'fa-solid fa-file-import',
    iconBgClass: 'step-icon-orange',
    title: t('landing.step2Title') || 'Import or Create',
    desc: t('landing.step2Desc') || 'Import tasks from Trello/Asana or start fresh with our templates.'
  },
  {
    icon: 'fa-solid fa-rocket',
    iconBgClass: 'step-icon-blue',
    title: t('landing.step3Title') || 'Start Working',
    desc: t('landing.step3Desc') || 'Assign tasks, track progress, and celebrate wins with the team.'
  }
])
</script>

<template>
  <section class="how-it-works-section py-5" :class="darkMode ? 'bg-dark' : 'bg-white'">
    <div class="container">
      <div class="text-center mx-auto mb-5 how-it-works-header">
        <h2 class="display-5 fw-bold mb-3" :class="darkMode ? 'text-white' : 'text-dark'">
          {{ t('landing.howItWorksTitle') || 'Get started in 3 steps' }}
        </h2>
        <p class="lead" :class="darkMode ? 'text-secondary' : 'text-muted'">
          {{ t('landing.howItWorksSubtitle') || 'No credit card required. Up and running in minutes.' }}
        </p>
      </div>

      <div class="row g-4 g-lg-5">
        <div v-for="(step, index) in steps" :key="index" class="col-md-4">
          <div class="step-card rounded h-100 p-4 p-lg-5" :class="darkMode
            ? 'bg-secondary'
            : 'bg-white'">
            <div class="step-icon rounded-circle d-flex align-items-center justify-content-center mb-4"
              :class="step.iconBgClass">
              <i :class="step.icon"></i>
            </div>
            <h3 class="h4 fw-bold mb-3" :class="darkMode ? 'text-white' : 'text-dark'">
              {{ step.title }}
            </h3>
            <p class="step-description" :class="darkMode ? 'text-secondary' : 'text-muted'">
              {{ step.desc }}
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
.how-it-works-section {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

.how-it-works-header {
  max-width: 48rem;
}

.step-card {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: none;
}

.step-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.step-icon {
  width: 3rem;
  height: 3rem;
  font-size: 1.25rem;
}

/* Red Icon - مثل الصورة */
.step-icon-red {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}

/* Orange Icon - مثل الصورة */
.step-icon-orange {
  background-color: #fed7aa !important;
  color: #ea580c !important;
}

/* Blue Icon - مثل الصورة */
.step-icon-blue {
  background-color: #dbeafe !important;
  color: #2563eb !important;
}

.step-description {
  line-height: 1.75;
  color: #6b7280;
}

.dark-version .step-description {
  color: #9ca3af;
}
</style>
