<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const darkMode = computed(() => store.state.darkMode)
</script>

<template>
  <section class="position-relative hero-section hero-bg overflow-hidden">
    <div class="container text-center position-relative">
      <div class="badge badge-pill d-inline-flex align-items-center mb-4 animate-fade-in-up hero-badge" :class="darkMode
        ? 'bg-dark hero-badge-dark'
        : 'hero-badge-light'">
        <span class="pulse-dot position-relative me-2">
          <span class="pulse-ring position-absolute"></span>
          <span class="pulse-core position-relative"></span>
        </span>
        {{ t('landing.newVersion') || 'New Version 2.0 is Live' }}
      </div>

      <h1 class="display-1 fw-bold mb-4 animate-fade-in-up hero-title" :class="darkMode ? 'text-white' : 'text-dark'"
        style="animation-delay: 0.1s">
        {{ t('landing.heroTitle') || 'Manage Tasks with' }} <br />
        <span class="hero-subtitle-green">{{ t('landing.heroSubtitle') || 'Absolute Clarity' }}</span>
      </h1>

      <p class="lead mb-4 mx-auto hero-description animate-fade-in-up"
        :class="darkMode ? 'text-secondary' : 'text-muted'" style="animation-delay: 0.2s">
        {{ t('landing.heroDescription') || 'Brooklyn Task empowers teams to organize, prioritize, and track work significantly faster.Stop drowning in chaos and start delivering results.' }}
      </p>

      <div
        class="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3 mb-5 animate-fade-in-up"
        style="animation-delay: 0.3s">
        <router-link to="/signup" class="btn btn-lg rounded-pill px-5 w-100 w-sm-auto hero-cta-primary">
          {{ t('landing.startForFree') || 'Start for Free' }}
        </router-link>
        <a href="#"
          class="btn btn-lg rounded-pill px-5 w-100 w-sm-auto d-flex align-items-center justify-content-center hero-cta-secondary">
          <i class="fas fa-play me-2 hero-play-icon"></i>
          {{ t('landing.watchDemo') || 'Watch Demo' }}
        </a>
      </div>

      <!-- Dashboard Mockup -->
      <div class="position-relative mx-auto mt-4 animate-fade-in-up dashboard-mockup" style="animation-delay: 0.5s">
        <div class="dashboard-glow position-absolute"></div>
        <img src="/dashboard_mockup.png" alt="Dashboard"
          class="position-relative rounded shadow-lg border w-100 animate-float dashboard-img"
          :class="darkMode ? 'border-secondary' : 'border-light'"
          @error="$event.target.src = 'https://via.placeholder.com/1200x600?text=Dashboard+Mockup'" />
      </div>

      <!-- Social Proof -->
      <!-- <div class="mt-5 pt-4 border-top social-proof" :class="darkMode ? 'border-secondary' : 'border-light'">
        <p class="small text-uppercase fw-semibold mb-4 letter-spacing" :class="darkMode ? 'text-muted' : 'text-muted'">
          {{ t('landing.trustedBy') || 'Trusted by innovative teams at' }}
        </p>
        <div class="d-flex flex-wrap justify-content-center align-items-center gap-4 social-logos">
          <div class="d-flex align-items-center social-logo" :class="darkMode ? 'text-white' : 'text-dark'">
            <i class="fab fa-aws me-2"></i> <span class="fw-bold">Amazon</span>
          </div>
          <div class="d-flex align-items-center social-logo" :class="darkMode ? 'text-white' : 'text-dark'">
            <i class="fab fa-google me-2"></i> <span class="fw-bold">Google</span>
          </div>
          <div class="d-flex align-items-center social-logo" :class="darkMode ? 'text-white' : 'text-dark'">
            <i class="fab fa-airbnb me-2"></i> <span class="fw-bold">Airbnb</span>
          </div>
          <div class="d-flex align-items-center social-logo" :class="darkMode ? 'text-white' : 'text-dark'">
            <i class="fab fa-uber me-2"></i> <span class="fw-bold">Uber</span>
          </div>
          <div class="d-flex align-items-center social-logo" :class="darkMode ? 'text-white' : 'text-dark'">
            <i class="fab fa-spotify me-2"></i> <span class="fw-bold">Spotify</span>
          </div>
        </div>
      </div> -->
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  padding-top: 8rem;
  padding-bottom: 5rem;
  background-color: white;
  position: relative;
}

@media (min-width: 992px) {
  .hero-section {
    padding-top: 12rem;
    padding-bottom: 8rem;
  }
}

/* Hero Background - Vertical gradient on the right */
.hero-bg {
  background: linear-gradient(to left, rgba(236, 252, 203, 0.3) 0%, transparent 50%);
  background-position: right center;
  background-size: 50% 100%;
  background-repeat: no-repeat;
}

.dark-version .hero-bg {
  background: linear-gradient(to left, rgba(166, 201, 90, 0.1) 0%, transparent 50%);
  background-position: right center;
  background-size: 50% 100%;
  background-repeat: no-repeat;
}

/* Hero Badge - Light gray background */
.hero-badge {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.hero-badge-light {
  background-color: #f3f4f6 !important;
  /* Light gray */
  border: 1px solid #e5e7eb;
  color: var(--primary-600) !important;
}

.hero-badge-dark {
  border-color: var(--primary-500) !important;
  color: var(--primary-500) !important;
}

/* Pulse Dot - أخضر */
.pulse-dot {
  width: 0.5rem;
  height: 0.5rem;
}

.pulse-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--primary-500);
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  opacity: 0.75;
}

.pulse-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--primary-500);
  top: 0;
  left: 0;
}

@keyframes ping {

  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.hero-title {
  line-height: 1.2;
}

@media (min-width: 992px) {
  .hero-title {
    font-size: 4.5rem;
  }
}

/* Hero Subtitle - Bright lime green (not gradient) */
.hero-subtitle-green {
  color: #aef63b !important;
  /* Bright lime green */
}

.hero-description {
  max-width: 42rem;
  font-size: 1.125rem;
  color: #4b5563;
  /* Dark gray */
}

@media (min-width: 992px) {
  .hero-description {
    font-size: 1.25rem;
  }
}

/* CTA Primary Button - Gradient from light to medium green */
.hero-cta-primary {
  background: linear-gradient(135deg, #aef63b 0%, var(--primary-600) 100%) !important;
  border: none !important;
  color: white !important;
  font-weight: 700;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.hero-cta-primary:hover {
  background: linear-gradient(135deg, #b8f64a 0%, var(--primary-700) 100%) !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
}

/* CTA Secondary Button - White with light gray border */
.hero-cta-secondary {
  background-color: white !important;
  border: 1px solid #e5e7eb !important;
  /* Light gray border */
  color: #4b5563 !important;
  /* Dark gray text */
  font-weight: 600;
  transition: all 0.3s ease;
}

.hero-cta-secondary:hover {
  background-color: #f9fafb !important;
  border-color: #d1d5db !important;
  color: #4b5563 !important;
  transform: translateY(-2px);
}

.hero-play-icon {
  color: var(--primary-500) !important;
  font-size: 0.875rem;
}

/* Dashboard Mockup */
.dashboard-mockup {
  max-width: 72rem;
}

.dashboard-glow {
  inset: -0.25rem;
  background: linear-gradient(135deg, var(--primary-600), var(--pink));
  border-radius: 1rem;
  filter: blur(8px);
  opacity: 0.2;
  z-index: -1;
}

.dashboard-img {
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: float 6s ease-in-out infinite;
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

/* Social Proof */
.social-proof {
  margin-top: 5rem;
  padding-top: 2.5rem;
}

.social-logos {
  gap: 2rem;
  opacity: 0.6;
  filter: grayscale(100%);
  transition: all 0.5s ease;
}

.social-logos:hover {
  filter: grayscale(0);
  opacity: 1;
}

.social-logo {
  font-size: 1.5rem;
}

.letter-spacing {
  letter-spacing: 0.05em;
}
</style>
