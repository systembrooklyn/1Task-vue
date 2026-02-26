<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="cta-section py-5 position-relative overflow-hidden bg-primary-soft">
    <div class="container position-relative text-center">
      <div class="cta-container mx-auto rounded-3 rounded-lg-4 shadow-lg position-relative overflow-hidden">
        <div class="cta-glow cta-glow-top position-absolute"></div>
        <div class="cta-glow cta-glow-bottom position-absolute"></div>

        <h2 class="display-4 fw-bold text-white mb-4">
          {{ t('landing.ctaTitle') || 'Ready to regain control?' }}
        </h2>
        <p class="cta-description text-white mb-5 mx-auto">
          {{ t('landing.ctaDescription') || 'Join thousands of companies using Brooklyn Task to deliver projects on time, every time.' }}
        </p>
        <div class="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3 mb-4">
          <router-link to="/signup" class="btn btn-lg rounded-pill px-5 cta-button-primary">
            {{ t('landing.getStartedForFree') || 'Get Started for Free' }}
          </router-link>
          <button class="btn btn-lg rounded-pill px-5 cta-button-secondary">
            {{ t('landing.scheduleDemo') || 'Schedule Demo' }}
          </button>
        </div>
        <p class="small cta-footer text-white">
          {{ t('landing.ctaFooter') || 'No credit card required • 14-day free trial' }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

.cta-container {
  max-width: 64rem;
  background-color: var(--primary-600) !important;
  padding: 3rem 1.5rem;
}

@media (min-width: 992px) {
  .cta-container {
    padding: 5rem;
  }
}

.cta-glow {
  width: 20rem;
  height: 20rem;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(60px);
}

.cta-glow-top {
  top: 0;
  right: 0;
  transform: translate(5rem, -5rem);
  background-color: var(--primary-500);
}

.cta-glow-bottom {
  bottom: 0;
  left: 0;
  transform: translate(-5rem, 5rem);
  background-color: var(--primary-700);
}

.cta-description {
  font-size: 1.125rem;
  max-width: 32rem;
}

@media (min-width: 992px) {
  .cta-description {
    font-size: 1.25rem;
  }
}

.cta-button-primary {
  background-color: white !important;
  border-color: white !important;
  color: var(--primary-600) !important;
  font-weight: 700;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.cta-button-primary:hover {
  background-color: #f8f9fa !important;
  border-color: #f8f9fa !important;
  color: var(--primary-600) !important;
}

.cta-button-secondary {
  background-color: transparent !important;
  border: 2px solid var(--primary-400) !important;
  color: white !important;
  font-weight: 700;
  transition: all 0.3s ease;
}

.cta-button-secondary:hover {
  background-color: var(--primary-700) !important;
  border-color: var(--primary-700) !important;
  color: white !important;
}

.cta-footer {
  opacity: 0.8;
}
</style>
