<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import PricingCard from '@/examples/PricingCard.vue'

const store = useStore()
const router = useRouter()
const { t } = useI18n()

const darkMode = computed(() => store.state.darkMode)
const isLoading = ref(false)
const plans = ref({ data: [] })

// ✅ نص الزر المخصص من الترجمة
const buttonText = computed(() => t('landing.tryForFree') || 'Try for Free')

onMounted(async () => {
    isLoading.value = true
    try {
        const response = await store.dispatch('getPlans')
        // التأكد من أن البيانات في الشكل الصحيح
        if (response && response.data) {
            plans.value = Array.isArray(response.data)
                ? { data: response.data }
                : response.data
        } else {
            plans.value = { data: [] }
        }
    } catch (error) {
        console.error('Error fetching plans:', error)
        plans.value = { data: [] }
    } finally {
        isLoading.value = false
    }
})

const handleSelectPlan = (plan) => {
    // Redirect to signup with plan
    router.push({ path: '/signup', query: { plan: plan.id } })
}
</script>

<template>
    <section id="pricing" class="pricing-section py-5" :class="darkMode ? 'bg-dark' : 'bg-white'">
        <div class="container">
            <!-- Header -->
            <div class="text-center mx-auto pricing-header">
                <h2 class="pricing-title fw-bold mb-3" :class="darkMode ? 'text-white' : 'text-dark'">
                    {{ t('landing.pricingTitle') || 'Simple, transparent pricing' }}
                </h2>
                <p class="pricing-subtitle" :class="darkMode ? 'text-secondary' : 'text-muted'">
                    {{ t('landing.pricingSubtitle') || 'Choose the perfect plan for your team' }}
                </p>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border" :class="darkMode ? 'text-primary' : 'text-primary'" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>

            <!-- Pricing Cards -->
            <div v-else-if="plans.data && plans.data.length > 0" class="pricing-cards-wrapper">
                <PricingCard :plans="plans" :is-subscribing="false" :current-plan-id="null"
                    :custom-button-text="buttonText" @select="handleSelectPlan" />
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-5">
                <p :class="darkMode ? 'text-secondary' : 'text-muted'">
                    {{ t('landing.noPlansAvailable') || 'No plans available at the moment' }}
                </p>
            </div>
        </div>
    </section>
</template>

<style lang="scss" scoped>
// ✅ استيراد المتغيرات من _dark-version.scss
@import "~@/assets/scss/argon-dashboard/variables/dark-version";

.pricing-section {
    padding-top: 6rem;
    padding-bottom: 6rem;
}

.pricing-header {
    max-width: 48rem;
    margin-bottom: 4rem;
}

.pricing-title {
    font-size: 2.5rem;
    line-height: 1.2;
    color: #1f2937;
    margin-bottom: 1rem;
}

.pricing-subtitle {
    font-size: 1.125rem;
    line-height: 1.75;
    color: #6b7280;
    margin-bottom: 0;
}

/* Dark mode adjustments */
.dark-version .pricing-title {
    color: rgba(255, 255, 255, 0.9) !important;
}

.dark-version .pricing-subtitle {
    color: #{$dark-version-table-color} !important;
}

@media (max-width: 768px) {
    .pricing-title {
        font-size: 2rem;
    }

    .pricing-subtitle {
        font-size: 1rem;
    }

    .pricing-header {
        margin-bottom: 3rem;
    }
}

/* ✅ تطبيق الـ styling من PricingCard.vue في light mode فقط */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.pricing-card) {
    background-color: #ffffff !important;
    border-radius: 1rem !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    border: none !important;
    overflow: hidden !important;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease !important;
}

.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.pricing-card:hover) {
    transform: translateY(-6px) !important;
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.12) !important;
}

/* ✅ إظهار badge "CURRENT PLAN" مع styling أخضر فاتح من الصورة */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.current-plan-badge) {
    display: block !important;
    /* ✅ إظهار بدلاً من إخفاء */
    background-color: #a6c95a !important;
    /* أخضر فاتح */
    color: #1f2937 !important;
    /* نص داكن */
    border: none !important;
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    margin: 1rem !important;
    z-index: 11 !important;
    border-radius: 9999px !important;
    padding: 0.5rem 1rem !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
    box-shadow: none !important;
    animation: none !important;
    /* إزالة الـ animation */
}

/* ✅ أيقونة التاج في badge */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.current-plan-badge i) {
    color: #1f2937 !important;
    /* لون التاج داكن */
}

/* ✅ إخفاء badge "Most Popular" إذا كان موجود */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.bg-gradient-primary) {
    display: none !important;
}

/* ✅ اسم الخطة - badge رمادي فاتح من الصورة */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.plan-name-badge) {
    background-color: #f3f4f6 !important;
    /* رمادي فاتح */
    color: #6b7280 !important;
    /* نص رمادي */
    border: 1px solid #e5e7eb !important;
    box-shadow: none !important;
    padding: 0.5rem 1.2rem !important;
    border-radius: 9999px !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
}

/* ✅ السعر - كبير وbold */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.price-display) {
    font-weight: 700 !important;
    font-size: 2.5rem !important;
    color: #1f2937 !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

/* ✅ زر "Try for Free" - أخضر فاتح مع نص داكن من الصورة */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.btn-outline-primary) {
    background-color: #a6c95a !important;
    /* أخضر فاتح */
    color: #1f2937 !important;
    /* نص داكن */
    border: 1px solid #a6c95a !important;
    box-shadow: none !important;
    border-width: 2px !important;
    border-radius: 0.65rem !important;
    font-weight: 600 !important;
}

.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.btn-outline-primary:hover) {
    background-color: #8ca843 !important;
    /* أخضر أغمق قليلاً */
    color: #1f2937 !important;
    border-color: #8ca843 !important;
    transform: translateY(-2px) !important;
}

/* ✅ زر "Current Plan" - أخضر فاتح مع نص داكن */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.btn-current-active) {
    background-color: #a6c95a !important;
    /* أخضر فاتح */
    color: #1f2937 !important;
    /* نص داكن */
    border: 1px solid #a6c95a !important;
    box-shadow: none !important;
    border-width: 2px !important;
    border-radius: 0.65rem !important;
    font-weight: 600 !important;
}

/* ✅ إزالة الـ decorative shapes في light mode */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.pricing-card::before),
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.pricing-card::after) {
    display: none !important;
}

/* ✅ إزالة الـ current-plan styling الخاص (border, shadow, etc) */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.current-plan) {
    border: none !important;
    background: #ffffff !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    transform: none !important;
}

.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.current-plan:hover) {
    transform: translateY(-6px) !important;
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.12) !important;
}

/* ✅ Features list styling */
.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.list-group-item) {
    background-color: transparent !important;
    border: none !important;
    padding: 0.5rem 0 !important;
    color: #1f2937 !important;
}

.pricing-section:not(.bg-dark) .pricing-cards-wrapper :deep(.list-group-item span) {
    color: #1f2937 !important;
}

/* ✅ Dark mode styling للـ pricing cards */
.pricing-section.bg-dark .pricing-cards-wrapper :deep(.pricing-card) {
    background-color: #{$dark-version-card-bg-color} !important;
    border-color: #{$dark-version-border-color} !important;
    color: rgba(255, 255, 255, 0.9) !important;
}

.pricing-section.bg-dark .pricing-cards-wrapper :deep(.plan-name-badge) {
    background-color: rgba(144, 177, 64, 0.2) !important;
    color: rgba(255, 255, 255, 0.9) !important;
    border-color: rgba(144, 177, 64, 0.4) !important;
}

.pricing-section.bg-dark .pricing-cards-wrapper :deep(.price-display) {
    color: rgba(255, 255, 255, 0.9) !important;
}

.pricing-section.bg-dark .pricing-cards-wrapper :deep(.list-group-item) {
    color: #{$dark-version-body-color} !important;
    border-color: #{$dark-version-border-color} !important;
}

.pricing-section.bg-dark .pricing-cards-wrapper :deep(.list-group-item span) {
    color: rgba(255, 255, 255, 0.9) !important;
}

.pricing-section.bg-dark .pricing-cards-wrapper :deep(.btn-outline-primary) {
    background-color: rgba(144, 177, 64, 0.9) !important;
    color: rgba(255, 255, 255, 0.9) !important;
    border-color: rgba(144, 177, 64, 0.8) !important;
}

.pricing-section.bg-dark .pricing-cards-wrapper :deep(.current-plan-badge) {
    background-color: rgba(144, 177, 64, 0.9) !important;
    color: rgba(255, 255, 255, 0.9) !important;
}

.pricing-section.bg-dark .pricing-cards-wrapper :deep(.btn-current-active) {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: rgba(144, 177, 64, 1) !important;
    border-color: rgba(144, 177, 64, 0.8) !important;
}
</style>
