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
                <div class="text-end">
                  <h4 v-if="!isPromoApplied" class="mb-0 fw-bold">${{ selectedPlan.price }} / month</h4>
                  <div v-else class="mb-0">
                    <span class="text-decoration-line-through text-muted me-2">${{ originalPrice }} / month</span>
                    <span class="fw-bold text-success">→ ${{ discountedPrice }} / month</span>
                  </div>
                </div>
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
                <input type="text" id="promoCode" class="form-control" :class="{ 'is-invalid': promoError }"
                  :placeholder="t('enterCode')" v-model="promoCode" :disabled="isSubscribing || isApplyingPromo"
                  @keyup.enter="applyPromoCode">
                <button class="btn btn-outline-primary " type="button" @click="applyPromoCode"
                  :disabled="isSubscribing || isApplyingPromo || !promoCode.trim()">
                  <span v-if="isApplyingPromo">
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ t("applying") }}
                  </span>
                  <span v-else>{{ t("apply") }}</span>
                </button>
              </div>
              <div v-if="promoError" class="text-danger small mt-1">{{ promoError }}</div>
              <div v-if="isPromoApplied && !promoError" class="text-success small mt-1">
                <i class="fas fa-check-circle me-1"></i>{{ t("promoApplied") }}
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
const isApplyingPromo = ref(false);
const promoError = ref('');
const originalPrice = ref(null);
const discountedPrice = ref(null);
const isPromoApplied = ref(false);

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
    apply: "Apply",
    applying: "Applying...",
    promoApplied: "Promo code applied successfully",
    invalidPromoCode: "Invalid or expired promo code",
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
    apply: "تطبيق",
    applying: "جاري التطبيق...",
    promoApplied: "تم تطبيق الكود الترويجي بنجاح",
    invalidPromoCode: "كود ترويجي غير صحيح أو منتهي الصلاحية",
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
  if (selectedPlan.value) {
    originalPrice.value = selectedPlan.value.price;
  }
  isLoading.value = false;
});

// 4. دالة تطبيق البرومو كود
const applyPromoCode = async () => {
  if (!promoCode.value.trim()) {
    promoError.value = t("invalidPromoCode");
    return;
  }

  if (!selectedPlan.value) {
    return;
  }

  isApplyingPromo.value = true;
  promoError.value = '';
  isPromoApplied.value = false;

  try {
    const payload = {
      plan_id: selectedPlan.value.id,
      promo_code: promoCode.value.trim()
    };

    console.log("Applying promo code with payload:", payload);

    // استخدام store.dispatch بدلاً من apiClient مباشرة
    const responseData = await store.dispatch('checkPromoDiscount', payload);

    console.log("Promo discount response data:", responseData);
    console.log("Full response data:", responseData);

    // التحقق من وجود السعر الجديد في الاستجابة
    if (responseData) {
      // البحث عن السعر الجديد في الاستجابة
      // السعر موجود في responseData.data.finalPrice حسب الاستجابة الفعلية من API
      const newPrice = responseData.data?.finalPrice ||
        responseData.finalPrice ||
        responseData.data?.final_price ||
        responseData.price ||
        responseData.final_price ||
        responseData.discounted_price ||
        responseData.new_price;

      if (newPrice !== undefined && newPrice !== null) {
        discountedPrice.value = newPrice;
        isPromoApplied.value = true;
        promoError.value = '';
        console.log("Promo code applied successfully. New price:", newPrice);
      } else {
        // إذا لم نجد السعر في الاستجابة، نستخدم السعر الأصلي
        console.warn("Price not found in response, using original price");
        console.warn("Response structure:", responseData);
        promoError.value = t("invalidPromoCode");
        isPromoApplied.value = false;
      }
    } else {
      promoError.value = t("invalidPromoCode");
      isPromoApplied.value = false;
    }
  } catch (error) {
    console.error("Error applying promo code:", error);
    isPromoApplied.value = false;

    // استخراج رسالة الخطأ من الاستجابة
    if (error?.response?.data?.message) {
      promoError.value = error.response.data.message;
    } else if (error?.response?.data?.error) {
      promoError.value = error.response.data.error;
    } else {
      promoError.value = t("invalidPromoCode");
    }
  } finally {
    isApplyingPromo.value = false;
  }
};

// 5. دالة الدفع النهائي
const confirmAndPay = async () => {
  isSubscribing.value = true;
  try {
    const payload = {
      plan_id: selectedPlan.value.id,
      promo_code: isPromoApplied.value ? promoCode.value.trim() : ''
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

/* تنسيقات input-group بشكل عام */
.input-group {
  border-radius: 0.375rem;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

.input-group .form-control {
  border-right: none;
  border-radius: 0.375rem 0 0 0.375rem !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  border-width: 1px;
  border-style: solid;
  padding: 0.5rem 0.75rem;
  line-height: 1.5;
  box-sizing: border-box;
  margin: 0;
}

.input-group .form-control:focus {
  border-right: none;
}

/* تنسيقات زر Apply في Light Mode */
.input-group .btn {
  border-left: 0;
  min-width: 100px;
  transition: all 0.3s ease;
  font-weight: 600;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  border-radius: 0 0.375rem 0.375rem 0 !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-width: 1px;
  border-style: solid;
  padding: 0.5rem 0.75rem;
  line-height: 1.5;
  box-sizing: border-box;
  margin: 0;
}

.input-group .btn-outline-primary {
  border-color: var(--brand, #90B140);
  color: var(--brand, #90B140);
  background-color: transparent;
  border-left: 1px solid var(--brand, #90B140);
  font-weight: 600;
}

.input-group .btn-outline-primary:hover:not(:disabled) {
  background: linear-gradient(45deg, var(--brand, #90B140), var(--brand-600, #7a9a33));
  color: #fff;
  border-color: var(--brand, #90B140);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(144, 177, 64, 0.3);
  z-index: 3;
}

.input-group .btn-outline-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(144, 177, 64, 0.4);
}

.input-group .btn-outline-primary:focus {
  box-shadow: 0 0 0 0.25rem rgba(144, 177, 64, 0.25);
  z-index: 3;
}

.input-group .btn-outline-primary:focus:not(:hover) {
  background-color: transparent;
  color: var(--brand, #90B140);
}

.input-group .btn-outline-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* تحسين التوافق بين الـ input والزر */
.input-group .form-control:focus+.btn-outline-primary {
  border-color: #86b7fe;
  border-left-color: #86b7fe;
}

.input-group .form-control.is-invalid+.btn-outline-primary {
  border-color: #dc3545;
  border-left-color: #dc3545;
}

/* تنسيقات Input في Light Mode */
.input-group .form-control {
  transition: all 0.3s ease;
}

.input-group .form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  z-index: 3;
}

.input-group .form-control.is-invalid {
  border-color: #dc3545;
}

.input-group .form-control.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.text-decoration-line-through {
  text-decoration: line-through;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* تنسيقات Dark Mode */
:deep(.dark-version) .input-group {
  border-radius: 0.375rem;
  display: flex;
  align-items: stretch;
}

:deep(.dark-version) .input-group .form-control {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-right: none !important;
  border-radius: 0.375rem 0 0 0.375rem !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  border-width: 1px !important;
  border-style: solid !important;
  padding: 0.5rem 0.75rem !important;
  line-height: 1.5 !important;
  box-sizing: border-box !important;
  margin: 0 !important;
}

:deep(.dark-version) .input-group .form-control::placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.dark-version) .input-group .btn {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  height: auto !important;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  border-radius: 0 0.375rem 0.375rem 0 !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-width: 1px !important;
  border-style: solid !important;
  padding: 0.5rem 0.75rem !important;
  line-height: 1.5 !important;
  box-sizing: border-box !important;
  margin: 0 !important;
}

:deep(.dark-version) .input-group .btn-outline-primary {
  border-color: rgba(144, 177, 64, 0.8) !important;
  color: rgba(144, 177, 64, 1) !important;
  background-color: transparent !important;
  border-left: 1px solid rgba(144, 177, 64, 0.8) !important;
  font-weight: 600 !important;
}

:deep(.dark-version) .input-group .btn-outline-primary:hover:not(:disabled) {
  background: linear-gradient(45deg, rgba(144, 177, 64, 0.95), rgba(122, 154, 51, 0.95)) !important;
  color: rgba(255, 255, 255, 1) !important;
  border-color: rgba(144, 177, 64, 1) !important;
  box-shadow: 0 4px 12px rgba(144, 177, 64, 0.4) !important;
  transform: translateY(-1px);
  z-index: 3;
}

:deep(.dark-version) .input-group .btn-outline-primary:active:not(:disabled) {
  background: linear-gradient(45deg, rgba(144, 177, 64, 1), rgba(122, 154, 51, 1)) !important;
  box-shadow: 0 6px 20px rgba(144, 177, 64, 0.5) !important;
  transform: translateY(0);
}

:deep(.dark-version) .input-group .btn-outline-primary:focus {
  box-shadow: 0 0 0 0.25rem rgba(144, 177, 64, 0.3) !important;
  z-index: 3;
}

:deep(.dark-version) .input-group .btn-outline-primary:focus:not(:hover) {
  background-color: transparent !important;
  color: rgba(144, 177, 64, 1) !important;
}

:deep(.dark-version) .input-group .btn-outline-primary:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

/* تحسين التوافق بين الـ input والزر في dark mode */
:deep(.dark-version) .input-group .form-control:focus+.btn-outline-primary {
  border-color: rgba(144, 177, 64, 0.6) !important;
  border-left-color: rgba(144, 177, 64, 0.6) !important;
}

:deep(.dark-version) .input-group .form-control.is-invalid+.btn-outline-primary {
  border-color: rgba(239, 68, 68, 0.6) !important;
  border-left-color: rgba(239, 68, 68, 0.6) !important;
}

:deep(.dark-version) .input-group .form-control:focus {
  border-color: rgba(144, 177, 64, 0.6) !important;
  box-shadow: 0 1px 3px rgba(144, 177, 64, 0.2) !important;
  background-color: rgba(255, 255, 255, 0.05) !important;
  z-index: 3;
}

:deep(.dark-version) .input-group .form-control.is-invalid {
  border-color: rgba(239, 68, 68, 0.6) !important;
}

:deep(.dark-version) .input-group .form-control.is-invalid:focus {
  border-color: rgba(239, 68, 68, 0.6) !important;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2) !important;
}
</style>
