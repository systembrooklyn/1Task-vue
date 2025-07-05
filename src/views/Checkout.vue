<template>
    <div class="container mt-5 mb-5">
      <div class="row justify-content-center">
        <div class="col-lg-7 col-md-9">
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Loading your plan...</p>
          </div>
          
          <div v-else-if="!selectedPlan" class="card text-center py-5">
             <div class="card-body">
                <h4 class="card-title text-danger">Plan Not Found</h4>
                <p>The selected plan could not be found. It might be invalid or no longer available.</p>
                <router-link to="/subscription" class="btn btn-primary mt-3">Back to Plans</router-link>
              </div>
          </div>
  
          <div v-else class="card">
            <div class="card-header bg-light p-4">
              <h3 class="mb-0 text-center">Complete Your Subscription</h3>
            </div>
            <div class="card-body p-4">
              <h4 class="mb-3">You are subscribing to:</h4>
              
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
                <label for="promoCode" class="form-label">Have a Promo Code?</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    id="promoCode" 
                    class="form-control" 
                    placeholder="Enter your code" 
                    v-model="promoCode"
                    :disabled="isSubscribing"
                  >
                </div>
              </div>
  
              <div class="d-grid">
                <button 
                  class="btn btn-lg btn-primary" 
                  @click="confirmAndPay" 
                  :disabled="isSubscribing"
                >
                  <span v-if="isSubscribing">
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Processing...
                  </span>
                  <span v-else>Confirm & Proceed to Payment</span>
                </button>
              </div>
               <div class="text-center mt-3">
                  <router-link to="/subscription">&larr; Or go back to choose another plan</router-link>
              </div>
  
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useStore } from 'vuex';
  import { useRoute } from 'vue-router';
  
  // 1. الحصول على instances مهمة
  const store = useStore();
  const route = useRoute(); // للوصول لمعلومات المسار الحالي (مثل params)
//   const router = useRouter(); // للتوجيه
  
  // 2. تعريف الحالات المحلية للصفحة
  const selectedPlan = ref(null);
  const isLoading = ref(true);
  const promoCode = ref('');
  const isSubscribing = ref(false);
  
  // 3. عند تحميل الصفحة، ابحث عن الخطة المختارة
  onMounted(async () => {
    const planId = parseInt(route.params.planId, 10); // احصل على ID من URL

    console.log(planId);

     // إذا كان الرقم غير صالح (مثلاً /checkout/abc)، سيصبح NaN
  if (isNaN(planId)) {
    isLoading.value = false;
    selectedPlan.value = null; // سيؤدي هذا إلى عرض رسالة "Plan Not Found"
    return;
  }
    
    // تأكد أن الخطط محملة في الـ store
    if (store.state.plans.length === 0) {
      await store.dispatch('fetchPlans');
    }
  
    // ابحث عن الخطة المطابقة للـ ID
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
      
      // نفس الأكشن المستخدم سابقًا، لا حاجة لتغييره
      const response = await store.dispatch('subscribeToPlan', payload);
      
      if (response && response.iframe_url) {
        window.location.href = response.iframe_url;
      } else {
        alert('Error: Could not retrieve payment link.');
      }
    } catch (error) {
      console.error("Payment confirmation failed:", error);
      alert('An error occurred. Please try again.');
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
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }
  </style>