<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const darkMode = computed(() => store.state.darkMode)

// ✅ تحويل إلى computed property لتحديث الترجمة تلقائياً
const solutions = computed(() => [
  {
    image: '/image.png',
    badge: t('landing.solution1Badge') || 'Task Management',
    badgeClass: 'solution-badge-primary',
    title: t('landing.solution1Title') || 'Routine & One-Time Tasks',
    description: t('landing.solution1Desc') || 'Distinguish between recurring operational work and specific project milestones. Brooklyn Task organizes your "Routine Tasks" separately from "One-Time Tasks" for maximum clarity.',
    features: [
      t('landing.solution1Feature1') || 'Dedicated Routine Task workflows',
      t('landing.solution1Feature2') || 'One-Time Project Milestones',
      t('landing.solution1Feature3') || 'Advanced filtering by Department'
    ],
    iconClass: 'solution-icon-primary',
  },
  {
    image: '/image 2.png',
    badge: t('landing.solution2Badge') || 'Team & Goals',
    badgeClass: 'solution-badge-pink',
    title: t('landing.solution2Title') || 'Align Teams with Company Goals.',
    description: t('landing.solution2Desc') || 'Don\'t just track tasks—track impact. Connect individual work directly to high-level company Goals and Department KPIs.',
    features: [
      t('landing.solution2Feature1') || 'Visual Goal Tracking',
      t('landing.solution2Feature2') || 'Department-level Performance Reports',
      t('landing.solution2Feature3') || 'Automated Progress Trends'
    ],
    iconClass: 'solution-icon-pink',
    reverse: true
  }
])
</script>

<template>
  <section id="solution" class="solutions-section py-5" :class="darkMode ? 'bg-dark' : 'bg-secondary-soft'">
    <div class="container">
      <div v-for="(solution, index) in solutions" :key="index" :class="[
        'd-flex flex-column flex-lg-row align-items-center mb-5 solution-item',
        solution.reverse ? 'flex-lg-row-reverse' : ''
      ]">
        <div class="col-lg-6 mb-4 mb-lg-0">
          <div class="position-relative rounded overflow-hidden shadow-lg border solution-image-container" :class="darkMode
            ? 'bg-secondary border-secondary'
            : 'bg-white border-light'">
            <div class="position-absolute top-0 start-0 w-100 h-100 solution-overlay" :class="solution.overlayClass">
            </div>
            <img :src="solution.image" :alt="solution.title" class="w-100 solution-img"
              @error="$event.target.src = 'https://via.placeholder.com/800x600?text=Solution+Image'" />
          </div>
        </div>
        <div class="col-lg-6">
          <div class="d-inline-block px-3 py-1 rounded-pill small fw-semibold mb-3" :class="solution.badgeClass">
            {{ solution.badge }}
          </div>
          <h2 class="display-6 fw-bold mb-4" :class="darkMode ? 'text-white' : 'text-dark'">
            {{ solution.title }}
          </h2>
          <p class="lead mb-4" :class="darkMode ? 'text-secondary' : 'text-muted'">
            {{ solution.description }}
          </p>
          <ul class="list-unstyled solution-features">
            <li v-for="(feature, fIndex) in solution.features" :key="fIndex" class="d-flex align-items-start mb-3">
              <i :class="[solution.iconClass, 'fa-solid fa-check-circle me-3 mt-1']"></i>
              <span :class="darkMode ? 'text-light' : 'text-dark'">
                {{ feature }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
// ✅ استيراد المتغيرات من _dark-version.scss
@import "~@/assets/scss/argon-dashboard/variables/dark-version";
.solutions-section {
  padding-top: 6rem;
  padding-bottom: 6rem;
  background-color: var(--bs-secondary-soft);
}

.solution-item {
  gap: 4rem;
}

@media (min-width: 992px) {
  .solution-item {
    margin-bottom: 6rem;
  }
}

.solution-image-container {
  transition: all 0.3s ease;
}

.solution-image-container:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.solution-overlay {
  transition: opacity 0.3s ease;
  z-index: 1;
  pointer-events: none;
}

.solution-image-container:hover .solution-overlay {
  opacity: 0;
}

.solution-img {
  position: relative;
  z-index: 0;
  transition: transform 0.7s ease-out;
}

.solution-image-container:hover .solution-img {
  transform: scale(1.05);
}

/* Primary Badge - أخضر من الصورة */
.solution-badge-primary {
  background-color: var(--primary-50) !important;
  color: var(--primary-600) !important;
}

/* Dark mode - استخدام المتغيرات الموحدة */
.solutions-section.bg-dark {
  background-color: #{$dark-version-bg-color} !important;
}

/* Dark mode badge - أخضر فاتح مع نص أبيض */
.solutions-section.bg-dark .solution-badge-primary {
  background-color: #8CA843 !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* Pink Badge - من الصورة */
.solution-badge-pink {
  background-color: rgba(236, 72, 153, 0.1) !important;
  color: var(--pink) !important;
}

/* Dark mode pink badge */
.solutions-section.bg-dark .solution-badge-pink {
  background-color: #ec4899 !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* Primary Icon - أخضر من الصورة */
.solution-icon-primary {
  color: var(--primary-600) !important;
}

/* Pink Icon - من الصورة */
.solution-icon-pink {
  color: var(--pink) !important;
}

/* Primary Overlay - أخضر من الصورة */
.solution-overlay-primary {
  background-color: rgba(140, 168, 67, 0.1);
}

/* Pink Overlay - من الصورة */
.solution-overlay-pink {
  background-color: rgba(236, 72, 153, 0.1);
}

.solution-features {
  line-height: 1.75;
}

.bg-secondary-soft {
  background-color: #f8f9fa;
}
</style>
