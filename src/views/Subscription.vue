<template>
  <div class="container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card">
          <div class="card-header text-center">
            <h2 class="text-gradient text-primary">Choose the best plan for your business</h2>
            <p class="mb-0">You have Free Unlimited Updates and Premium Support on each package.</p>
          </div>
          <div class="card-body">

            <!-- <div class="row justify-content-center">
              <div class="col-lg-5 col-md-7 mb-4">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-tag"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Enter Promo Code (Optional)" 
                    v-model="promoCode"
                  >
                </div>
              </div>
            </div> -->
            <div v-if="isLoading" class="text-center py-5">
            </div>

            <div v-else-if="error" class="text-center py-5 alert alert-danger">
            </div>

            <div v-else>
              <div v-if="plansForCard && plansForCard.data && plansForCard.data.length">
                <PricingCard :plans="plansForCard" :is-subscribing="isSubscribing" :current-plan-id="currentPlanId"
                  @select="selectPlanAndGoToCheckout" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue"; // استيراد ref
import { useStore } from "vuex";
import PricingCard from "@/examples/PricingCard.vue"; // تأكد من أن المسار صحيح
import { useRouter } from "vue-router";


const store = useStore();
const router = useRouter();
// --- حالات جديدة لإدارة التحميل والخطأ ---
const isLoading = ref(true); // نبدأ بحالة التحميل افتراضياً
const error = ref(null); // لا يوجد خطأ في البداية
const isSubscribing = ref(false); // حالة جديدة لتتبع عملية الاشتراك نفسها
const currentPlanId = computed(() => store.state.planInfo?.id);

console.log("currentPlanId", currentPlanId.value);
// const promoCode = ref("");


const plansForCard = computed(() => {
  return { data: store.state.plans };
});

onMounted(async () => {
  try {
    // إعادة تعيين الحالات عند كل تحميل
    isLoading.value = true;
    error.value = null;

    // جلب البيانات
    await store.dispatch("fetchPlans");
    console.log("plans", store.state.plans);
  } catch (e) {
    // في حالة حدوث خطأ، قم بتخزين رسالة الخطأ
    console.error("Error fetching plans:", e);
    error.value = "Failed to load subscription plans. Please try again later.";
  } finally {
    // في كل الأحوال (نجاح أو فشل)، قم بإنهاء حالة التحميل
    isLoading.value = false;
  }
});

// --- الدالة المعدلة ---
// --- تعديل دالة subscribe لترسل الكود ---
const selectPlanAndGoToCheckout = (plan) => {
  // استخدام router.push للتوجيه إلى صفحة الـ Checkout
  // مع تمرير ID الخطة كـ param
  router.push({ name: 'Checkout', params: { planId: plan.id } });
};
</script>
