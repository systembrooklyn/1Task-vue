<template>
  <div class="container mt-5 mb-5">
    <div class="row justify-content-center">
      <div class="col-lg-7 col-md-9">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">{{ t("loadingPlan") }}</p>
        </div>

        <div v-else-if="!selectedPlan" class="card text-center py-5">
          <div class="card-body">
            <h4 class="card-title text-danger">{{ t("planNotFound") }}</h4>
            <p>{{ t("planNotFoundMessage") }}</p>
            <router-link to="/subscription" class="btn btn-primary mt-3">{{ t("backToPlans") }}</router-link>
          </div>
        </div>

        <div v-else class="card">
          <div class="card-header bg-light p-4">
            <h3 class="mb-0 text-center">{{ t("completeSubscription") }}</h3>
          </div>
          <div class="card-body p-4">
            <h4 class="mb-3">{{ t("subscribingTo") }}</h4>

            <div class="border rounded p-3 mb-4">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 text-primary">{{ selectedPlan.name }}</h5>
                <h4 class="mb-0 fw-bold">${{ selectedPlan.price }} / month</h4>
              </div>
              <hr>
              <ul class="list-unstyled mb-0">
                <li v-for="feature in selectedPlan.features" :key="feature.name" class="d-flex align-items-center mb-2">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  <span>{{ feature.name }}: {{ feature.value }}</span>
                </li>
              </ul>
            </div>

            <div class="mb-4">
              <label for="promoCode" class="form-label">{{ t("havePromoCode") }}</label>
              <div class="input-group">
                <input type="text" id="promoCode" class="form-control" :placeholder="t('enterCode')" v-model="promoCode"
                  :disabled="isSubscribing">
              </div>
            </div>

            <div class="d-grid">
              <button class="btn btn-lg btn-primary" @click="confirmAndPay" :disabled="isSubscribing">
                <span v-if="isSubscribing">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  {{ t("processing") }}
                </span>
                <span v-else>{{ t("confirmAndPay") }}</span>
              </button>
            </div>
            <div class="text-center mt-3">
              <router-link to="/subscription">&larr; {{ t("goBackToPlans") }}</router-link>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import Swal from "sweetalert2";

// 1. الحصول على instances مهمة
const store = useStore();
const route = useRoute();

// 2. تعريف الحالات المحلية للصفحة
const selectedPlan = ref(null);
const isLoading = ref(true);
const promoCode = ref('');
const isSubscribing = ref(false);

// الترجمة
const translations = {
  en: {
    loadingPlan: "Loading your plan...",
    planNotFound: "Plan Not Found",
    planNotFoundMessage: "The selected plan could not be found. It might be invalid or no longer available.",
    backToPlans: "Back to Plans",
    completeSubscription: "Complete Your Subscription",
    subscribingTo: "You are subscribing to:",
    havePromoCode: "Have a Promo Code?",
    enterCode: "Enter your code",
    processing: "Processing...",
    confirmAndPay: "Confirm & Proceed to Payment",
    goBackToPlans: "Or go back to choose another plan",
    error: "Error",
    promoCodeError: "Promo Code Error",
    couldNotRetrievePaymentLink: "Error: Could not retrieve payment link.",
    errorOccurred: "An error occurred. Please try again.",
    ok: "OK"
  },
  ar: {
    loadingPlan: "جاري تحميل الخطة...",
    planNotFound: "الخطة غير موجودة",
    planNotFoundMessage: "تعذر العثور على الخطة المحددة. قد تكون غير صالحة أو لم تعد متاحة.",
    backToPlans: "العودة إلى الخطط",
    completeSubscription: "إكمال الاشتراك",
    subscribingTo: "أنت تشترك في:",
    havePromoCode: "هل لديك كود ترويجي؟",
    enterCode: "أدخل الكود الخاص بك",
    processing: "جاري المعالجة...",
    confirmAndPay: "تأكيد والمتابعة للدفع",
    goBackToPlans: "أو العودة لاختيار خطة أخرى",
    error: "خطأ",
    promoCodeError: "خطأ في الكود الترويجي",
    couldNotRetrievePaymentLink: "خطأ: تعذر الحصول على رابط الدفع.",
    errorOccurred: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    ok: "حسناً"
  }
};

const currentLanguage = computed(() => store.getters.currentLanguage);

const t = (key) => {
  return translations[currentLanguage.value]?.[key] || translations.en[key] || key;
};

// 3. عند تحميل الصفحة، ابحث عن الخطة المختارة
onMounted(async () => {
  const planId = parseInt(route.params.planId, 10);

  console.log(planId);

  if (isNaN(planId)) {
    isLoading.value = false;
    selectedPlan.value = null;
    return;
  }

  if (store.state.plans.length === 0) {
    await store.dispatch('fetchPlans');
  }

  selectedPlan.value = store.state.plans.find(p => p.id === planId);
  isLoading.value = false;
});

// 4. دالة الدفع النهائي
const confirmAndPay = async () => {
  isSubscribing.value = true;
  try {
    const payload = {
      plan_id: selectedPlan.value.id,
      promo_code: promoCode.value.trim()
    };

    console.log("payloadيييييي", payload);

    const response = await store.dispatch('subscribeToPlan', payload);

    if (response && response.iframe_url) {
      window.location.href = response.iframe_url;
    } else {
      Swal.fire({
        icon: 'error',
        title: t("error"),
        text: t("couldNotRetrievePaymentLink"),
        confirmButtonText: t("ok"),
        confirmButtonColor: '#dc3545'
      });
    }
  } catch (error) {
    console.error("Payment confirmation failed:", error);

    // استخراج رسالة الخطأ من الاستجابة
    let errorMessage = t("errorOccurred");
    let errorTitle = t("error");

    // التحقق من وجود رسالة خطأ محددة من الباك اند
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
      // إذا كانت الرسالة خاصة بالكود الترويجي
      if (errorMessage.toLowerCase().includes('promo') || errorMessage.toLowerCase().includes('code')) {
        errorTitle = t("promoCodeError");
      }
    } else if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // عرض الخطأ باستخدام SweetAlert
    Swal.fire({
      icon: 'error',
      title: errorTitle,
      text: errorMessage,
      confirmButtonText: t("ok"),
      confirmButtonColor: '#dc3545'
    });
  } finally {
    isSubscribing.value = false;
  }
};
</script>

<style scoped>
/* يمكنك إضافة بعض التنسيقات هنا إذا احتجت */
.card {
  border: 1px solid #e9ecef;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
</style>
