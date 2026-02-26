<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const darkMode = computed(() => store.state.darkMode)

const lightModeLogo = "https://ik.imagekit.io/ts7pphpbz3/Subheading%20(1)%20(1).png?ik-obj-version=9sTuepUtU27Iw3.FfIbdKOdc7MYL4WM0&updatedAt=1737223784202";
const darkModeLogo = "https://ik.imagekit.io/ts7pphpbz3/Gemini_Generated_Image_d9o2p5d9o2p5d9o2-removebg-preview.png";

const logoUrl = computed(() => {
  return darkMode.value ? darkModeLogo : lightModeLogo;
});
</script>

<template>
  <footer class="footer-section border-top pt-5 pb-3" :class="darkMode
    ? 'bg-dark border-secondary'
    : 'bg-white border-light'">
    <div class="container">
      <div class="row g-4 g-lg-5 mb-4">
        <div class="col-md-3">
          <router-link to="/" class="d-flex align-items-center mb-4 footer-logo"
            :class="darkMode ? 'text-white' : 'text-dark'">
            <div class="footer-logo-container">
              <img :src="logoUrl" alt="Logo" class="footer-logo-img"
                @error="$event.target.src = 'https://via.placeholder.com/120x60?text=Logo'" />
            </div>
          </router-link>
          <p class="small footer-description" :class="darkMode ? 'text-secondary' : 'text-muted'">
            {{ t('landing.footerDescription') || 'The all-in-one workspace for your tasks, notes, and projects. simple, flexible, and powerful.' }}
          </p>
        </div>
        <div class="col-md-3">
          <h4 class="fw-bold mb-3" :class="darkMode ? 'text-white' : 'text-dark'">
            {{ t('landing.footerProduct') || 'Product' }}
          </h4>
          <ul class="list-unstyled small footer-links" :class="darkMode ? 'text-secondary' : 'text-muted'">
            <li class="mb-2"><a href="#features" class="footer-link">{{ t('landing.features') || 'Features' }}</a></li>
            <li class="mb-2"><a href="#" class="footer-link">{{ t('landing.integrations') || 'Integrations' }}</a></li>
            <li class="mb-2"><a href="#pricing" class="footer-link">{{ t('landing.pricing') || 'Pricing' }}</a></li>
            <li class="mb-2"><a href="#" class="footer-link">{{ t('landing.changelog') || 'Changelog' }}</a></li>
          </ul>
        </div>
        <div class="col-md-3">
          <h4 class="fw-bold mb-3" :class="darkMode ? 'text-white' : 'text-dark'">
            {{ t('landing.footerCompany') || 'Company' }}
          </h4>
          <ul class="list-unstyled small footer-links" :class="darkMode ? 'text-secondary' : 'text-muted'">
            <li class="mb-2"><a href="#" class="footer-link">{{ t('landing.aboutUs') || 'About Us' }}</a></li>
            <li class="mb-2"><a href="#" class="footer-link">{{ t('landing.careers') || 'Careers' }}</a></li>
            <li class="mb-2"><a href="#" class="footer-link">{{ t('landing.blog') || 'Blog' }}</a></li>
            <li class="mb-2"><a href="#" class="footer-link">{{ t('landing.contact') || 'Contact' }}</a></li>
          </ul>
        </div>
        <div class="col-md-3">
          <h4 class="fw-bold mb-3" :class="darkMode ? 'text-white' : 'text-dark'">
            {{ t('landing.footerLegal') || 'Legal' }}
          </h4>
          <ul class="list-unstyled small footer-links" :class="darkMode ? 'text-secondary' : 'text-muted'">
            <li class="mb-2"><a href="#" class="footer-link">{{ t('landing.privacyPolicy') || 'Privacy Policy' }}</a>
            </li>
            <li class="mb-2"><a href="#" class="footer-link">{{ t('landing.termsOfService') || 'Terms of Service' }}</a>
            </li>
            <li class="mb-2"><a href="#" class="footer-link">{{ t('landing.security') || 'Security' }}</a></li>
          </ul>
        </div>
      </div>
      <div class="border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 pt-3"
        :class="darkMode ? 'border-secondary' : 'border-light'">
        <p class="small mb-0" :class="darkMode ? 'text-muted' : 'text-muted'">
          {{ t('landing.footerCopyright') || '© 2024 Brooklyn Task. All rights reserved.' }}
        </p>
        <div class="d-flex gap-3" :class="darkMode ? 'text-muted' : 'text-muted'">
          <a href="#" class="footer-social-link"><i class="fab fa-twitter"></i></a>
          <a href="#" class="footer-social-link"><i class="fab fa-linkedin"></i></a>
          <a href="#" class="footer-social-link"><i class="fab fa-github"></i></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-section {
  padding-top: 4rem;
  padding-bottom: 2rem;
}

.footer-logo-container {
  width: 120px;
  height: 60px;
}

.footer-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.footer-description {
  line-height: 1.75;
}

.footer-links {
  line-height: 2;
}

.footer-link {
  text-decoration: none;
  transition: color 0.3s ease;
  color: inherit;
}

.footer-link:hover {
  color: var(--primary-600) !important;
}

.footer-social-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.3s ease;
  font-size: 1.25rem;
}

.footer-social-link:hover {
  color: var(--primary-600) !important;
}
</style>
