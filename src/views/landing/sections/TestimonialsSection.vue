<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const darkMode = computed(() => store.state.darkMode)

const testimonials = [
  {
    text: t('landing.testimonial1Text') || 'Brooklyn Task completely transformed how our engineering team operates. We ship 2x faster now.',
    name: t('landing.testimonial1Name') || 'Sarah Jenkins',
    role: t('landing.testimonial1Role') || 'CTO at TechFlow',
    initials: 'SJ'
  },
  {
    text: t('landing.testimonial2Text') || 'The best UI I\'ve seen in a task manager. It\'s actually fun to use, which is rare for enterprise software.',
    name: t('landing.testimonial2Name') || 'Michael Chen',
    role: t('landing.testimonial2Role') || 'Product Manager',
    initials: 'MC'
  },
  {
    text: t('landing.testimonial3Text') || 'Finally, a tool that makes sense for both creative and technical teams. Highly recommended.',
    name: t('landing.testimonial3Name') || 'Jessica Alverez',
    role: t('landing.testimonial3Role') || 'Design Director',
    initials: 'JA'
  }
]
</script>

<template>
  <section id="testimonials" class="testimonials-section py-5" :class="darkMode ? 'bg-secondary' : 'bg-white'">
    <div class="container">
      <h2 class="display-5 fw-bold text-center mb-5" :class="darkMode ? 'text-white' : 'text-dark'">
        {{ t('landing.testimonialsTitle') || 'Loved by 10,000+ teams' }}
      </h2>

      <div class="row g-4">
        <div v-for="(testimonial, i) in testimonials" :key="i" class="col-md-4">
          <div class="testimonial-card rounded border h-100 p-4 p-lg-5" :class="darkMode
            ? 'bg-dark border-secondary'
            : 'bg-light border-light'">
            <div class="d-flex text-warning small mb-3">
              <i class="fas fa-star" v-for="s in 5" :key="s"></i>
            </div>
            <p class="fst-italic mb-4 testimonial-text" :class="darkMode ? 'text-light' : 'text-dark'">
              "{{ testimonial.text }}"
            </p>
            <div class="d-flex align-items-center gap-3">
              <div
                class="testimonial-avatar rounded-circle d-flex align-items-center justify-content-center small fw-bold"
                :class="darkMode
                  ? 'bg-secondary text-light'
                  : 'bg-secondary text-muted'">
                {{ testimonial.initials }}
              </div>
              <div>
                <h5 class="fw-bold small mb-0" :class="darkMode ? 'text-white' : 'text-dark'">
                  {{ testimonial.name }}
                </h5>
                <p class="small mb-0" :class="darkMode ? 'text-secondary' : 'text-muted'">
                  {{ testimonial.role }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonials-section {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

.testimonial-card {
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.testimonial-text {
  line-height: 1.75;
}

.testimonial-avatar {
  width: 3rem;
  height: 3rem;
}
</style>
