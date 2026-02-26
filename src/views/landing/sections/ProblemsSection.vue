<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const darkMode = computed(() => store.state.darkMode)

// ✅ تحويل إلى computed property لتحديث الترجمة تلقائياً
const problems = computed(() => [
  {
    icon: 'fa-solid fa-chart-pie',
    iconBgClass: 'problem-icon-blue',
    title: t('landing.problem3Title') || 'Zero Visibility',
    description: t('landing.problem3Desc') || 'Managers spend hours just trying to figure out "who is doing what" instead of actually managing strategy.'
  },
  {
    icon: 'fa-solid fa-hourglass-end',
    iconBgClass: 'problem-icon-orange',
    title: t('landing.problem2Title') || 'Missed Deadlines',
    description: t('landing.problem2Desc') || 'Without clear visibility, critical tasks slip through the cracks. Projects get delayed, and clients get unhappy.'
  },
  {
    icon: 'fa-solid fa-tornado',
    iconBgClass: 'problem-icon-red',
    title: t('landing.problem1Title') || 'Communication Silos',
    description: t('landing.problem1Desc') || 'Updates are scattered across email, Slack, and spreadsheets. No one knows where to look for the "latest" version.'
  }
])
</script>

<template>
  <section class="problems-section py-5" :class="darkMode ? 'bg-dark' : 'bg-white'">
    <div class="container">
      <div class="text-center mx-auto problems-header">
        <h2 class="problems-title fw-bold mb-3" :class="darkMode ? 'text-white' : 'text-dark'">
          {{ t('landing.problemsTitle') || 'Why is work so chaotic?' }}
        </h2>
        <p class="problems-subtitle mb-5" :class="darkMode ? 'text-secondary' : 'text-muted'">
          {{ t('landing.problemsSubtitle') || "You're hiring great people, but the process is broken. The result? Missed deadlines, burnout, and confusion." }}
        </p>
      </div>

      <div class="row g-4 g-lg-5">
        <div v-for="(problem, index) in problems" :key="index" class="col-md-4">
          <div class="problem-card rounded h-100" :class="darkMode ? 'bg-secondary'
            : 'bg-secondary-soft'">
            <div class="problem-icon rounded-circle d-flex align-items-center justify-content-center mb-3"
              :class="problem.iconBgClass">
              <i :class="problem.icon"></i>
            </div>
            <h3 class="problem-card-title fw-bold mb-3" :class="darkMode ? 'text-white' : 'text-dark'">
              {{ problem.title }}
            </h3>
            <p class="problem-description mb-0" :class="darkMode ? 'text-white' : 'text-muted'">
              {{ problem.description }}
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

.problems-section {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

.problems-header {
  max-width: 48rem;
  margin-bottom: 3rem;
}

.problems-title {
  font-size: 2.5rem;
  line-height: 1.2;
  color: #1f2937;
  margin-bottom: 1rem;
}

.problems-subtitle {
  font-size: 1.125rem;
  line-height: 1.75;
  color: #6b7280;
  margin-bottom: 0;
}

.problem-card {
  background-color: var(--bs-secondary-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: none;
  padding: 2rem;
}

.bg-secondary-soft {
  background-color: #f8f9fa;
}

.problem-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.problem-icon {
  width: 3rem;
  height: 3rem;
  font-size: 1.25rem;
}

/* Red Icon - مثل الصورة */
.problem-icon-red {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}

/* Orange Icon - مثل الصورة */
.problem-icon-orange {
  background-color: #fed7aa !important;
  color: #ea580c !important;
}

/* Blue Icon - مثل الصورة */
.problem-icon-blue {
  background-color: #dbeafe !important;
  color: #2563eb !important;
}

.problem-card-title {
  font-size: 1.25rem;
  line-height: 1.5;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.problem-description {
  font-size: 1rem;
  line-height: 1.75;
  color: #6b7280;
}

/* Dark mode adjustments */
.dark-version .problem-description {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .problems-title {
    font-size: 2rem;
  }

  .problems-subtitle {
    font-size: 1rem;
  }

  .problem-card {
    padding: 1.5rem;
  }
}
</style>
