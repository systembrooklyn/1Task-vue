<template>
  <div class="row g-4 justify-content-center">
    <div v-for="plan in props.plans.data" :key="plan.id" class="col-md-6 col-lg-3">
      <div class="card pricing-card h-100 border-0 shadow-sm position-relative" :class="{
        'border-popular': plan.isPopular,
        'current-plan': plan.id === currentPlanId && !isPlanExpired,
        'expired-plan': plan.id === currentPlanId && isPlanExpired
      }">
        <!-- Most Popular Badge -->
        <div v-if="plan.isPopular" class="position-absolute w-100 text-center" style="z-index: 10">
          <span class="badge bg-gradient-primary rounded-pill px-3 py-2 mt-n3">
            <i class="fas fa-star me-1"></i> Most Popular
          </span>
        </div>

        <!-- Current Plan Badge -->
        <div v-if="plan.id === currentPlanId && !isPlanExpired" class="position-absolute top-0 start-0 m-3"
          style="z-index: 11">
          <span class="badge rounded-pill px-4 py-2 current-plan-badge">
            <i class="fas fa-crown me-2"></i> Current Plan
          </span>
        </div>

        <!-- Expired Plan Badge -->
        <div v-if="plan.id === currentPlanId && isPlanExpired" class="position-absolute top-0 start-0 m-3"
          style="z-index: 11">
          <span class="badge bg-expired rounded-pill px-4 py-2 expired-plan-badge">
            <i class="fas fa-exclamation-triangle me-2"></i> Expired
          </span>
        </div>

        <!-- Card Header -->
        <div class="card-header bg-transparent border-0 pt-5">
          <div class="text-center">
            <h5 class="mt-2 fw-bold">
              <span class="plan-name-badge">{{ plan.name }}</span>
            </h5>
            <p v-if="plan.description" class="text-sm text-muted mb-0">
              {{ plan.description }}
            </p>
          </div>
        </div>

        <!-- Price Section -->
        <div class="card-body pt-0">
          <div class="d-flex justify-content-center align-items-baseline ">
            <h2 class="mb-0 me-1 price-display">
              ${{ formatPrice(plan) }}
            </h2>
            <span class="text-sm text-muted">/month</span>
          </div>

          <!-- Features List -->
          <ul class="list-group list-group-flush flex-grow-1">
            <li v-for="(feature, idx) in plan.features" :key="idx"
              class="list-group-item d-flex align-items-center px-0 py-2"
              :style="{ 'background-color': 'var(--brand)' }">
              <!-- <i class="fas fa-check text-success me-2"></i> -->
              <span>{{ feature.name }}</span>
              <span class="ms-auto fw-bold">
                {{ feature.value }}
                <span v-if="feature.name.toLowerCase().includes('storage')" class="text-sm"> MB</span>
                <span v-if="feature.name.toLowerCase().includes('one time task')" class="text-sm"> / per month</span>
              </span>
            </li>
          </ul>
        </div>

        <!-- Action Button -->
        <div class="card-footer bg-transparent border-0 pt-3 pb-5">
          <button type="button" class="btn w-100" :class="getButtonClass(plan)" @click="selectPlan(plan)"
            :disabled="isButtonDisabled(plan)">
            <span v-if="isSubscribing">
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Processing...
            </span>
            <span v-else>{{ getButtonText(plan) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
  plans: {
    type: Object,
    required: true,
    default: () => ({ data: [] }), // Expecting an object with "data" array
  },
  isSubscribing: {
    type: Boolean,
    default: false,
  },
  currentPlanId: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(["select"]);

// Check if current plan is expired
const isPlanExpired = computed(() => store.state.planExpired);

// Get button state for each plan
const getButtonState = (plan) => {
  const isCurrentPlan = plan.id === props.currentPlanId;

  if (isCurrentPlan && !isPlanExpired.value) {
    return 'active'; // Current active plan
  } else if (isCurrentPlan && isPlanExpired.value) {
    return 'expired'; // Current but expired plan
  } else {
    return 'available'; // Available to choose
  }
};

// Get button text based on state
const getButtonText = (plan) => {
  const state = getButtonState(plan);

  if (props.isSubscribing) return 'Processing...';

  switch (state) {
    case 'active':
      return 'Current Plan';
    case 'expired':
      return 'Renew Plan';
    case 'available':
      return 'Choose Plan';
    default:
      return 'Choose Plan';
  }
};

// Get button class based on state
const getButtonClass = (plan) => {
  const state = getButtonState(plan);

  switch (state) {
    case 'active':
      return 'btn-current-active';
    case 'expired':
      return 'btn-expired';
    case 'available':
      return 'btn-outline-primary';
    default:
      return 'btn-outline-primary';
  }
};

// Check if button should be disabled
const isButtonDisabled = (plan) => {
  const state = getButtonState(plan);
  // Only disable if subscribing OR if it's the current active plan (not expired)
  return props.isSubscribing || state === 'active';
};

// Format price display
const formatPrice = (plan) => {
  console.log('Plan data:', plan); // للتحقق من البيانات

  // Try different possible price fields
  const price = plan.price || plan.amount || plan.cost || plan.monthly_price || 0;

  console.log('Extracted price:', price); // للتحقق من السعر المستخرج

  // Handle different data types
  if (typeof price === 'string') {
    return parseFloat(price) || 0;
  }

  return price || 0;
};

function selectPlan(plan) {
  // Don't proceed if button is disabled
  if (isButtonDisabled(plan)) {
    return;
  }
  emit("select", plan);
}

//   function selectPlan(plan) {
//     // Toggle selection status
//     plan.isSelected = !plan.isSelected;
//     emit('select', plan);
//   }
</script>

<style scoped>
/* Brand */
:root {
  --brand: #90B140;
  --brand-600: #7a9a33;
  /* a touch darker for contrast */
  --brand-100: rgba(144, 177, 64, 0.1);
  --brand-200: rgba(144, 177, 64, 0.18);
}

.text-gradient-primary {
  background: linear-gradient(45deg, var(--brand), var(--brand-600));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-gradient-primary {
  background: linear-gradient(45deg, var(--brand), var(--brand-600));
  color: #fff !important;
}

/* Card polish + shapes */
.pricing-card {
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.pricing-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.12);
}

/* Decorative shapes */
.pricing-card::before,
.pricing-card::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.pricing-card::before {
  width: 140px;
  height: 140px;
  top: -60px;
  right: -60px;
  background: var(--brand-100);
  filter: blur(1px);
}

.pricing-card::after {
  width: 220px;
  height: 220px;
  bottom: -110px;
  left: -110px;
  background: var(--brand-200);
  filter: blur(2px);
}

/* Popular and Current plan frames */
.border-popular {
  border: 2px solid var(--brand);
}

.current-plan {
  border: 4px solid var(--brand) !important;
  background: rgba(144, 177, 64, 0.05);
  box-shadow:
    0 0 0 8px rgba(144, 177, 64, 0.2),
    0 12px 40px rgba(144, 177, 64, 0.3),
    inset 0 0 0 2px rgba(255, 255, 255, 0.8);
  transform: scale(1.05);
  position: relative;
  z-index: 5;
}

.current-plan::before {
  background: linear-gradient(135deg, rgba(144, 177, 64, 0.15), rgba(144, 177, 64, 0.08)) !important;
  filter: blur(0.5px);
}

.current-plan::after {
  background: linear-gradient(225deg, rgba(144, 177, 64, 0.25), rgba(144, 177, 64, 0.12)) !important;
  filter: blur(1px);
}

.current-plan:hover {
  transform: scale(1.02) translateY(-6px);
}

/* Expired plan styles */
.expired-plan {
  border: 3px solid #dc3545;
  box-shadow:
    0 0 0 6px rgba(220, 53, 69, 0.15),
    0 8px 32px rgba(220, 53, 69, 0.25);
  transform: scale(1.02);
  position: relative;
  opacity: 0.9;
}

.expired-plan::before {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.15), rgba(220, 53, 69, 0.08)) !important;
  filter: blur(0.5px);
}

.expired-plan::after {
  background: linear-gradient(225deg, rgba(220, 53, 69, 0.25), rgba(220, 53, 69, 0.12)) !important;
  filter: blur(1px);
}

.expired-plan:hover {
  transform: scale(1.02) translateY(-6px);
}

/* Badges */
.bg-current {
  background: var(--brand);
  color: #fff;
}

.current-plan-badge {
  background: var(--brand) !important;
  color: #000000 !important;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(144, 177, 64, 0.4);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {

  0%,
  100% {
    box-shadow: 0 4px 12px rgba(144, 177, 64, 0.4);
  }

  50% {
    box-shadow: 0 4px 20px rgba(144, 177, 64, 0.6);
  }
}

.bg-expired {
  background: #dc3545;
  color: #fff;
}

.expired-plan-badge {
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  animation: pulse-warning 2s infinite;
}

@keyframes pulse-warning {

  0%,
  100% {
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  }

  50% {
    box-shadow: 0 4px 20px rgba(220, 53, 69, 0.6);
  }
}

/* Buttons */
.btn-outline-primary {
  color: var(--brand);
  border: 1px solid var(--brand);
  background-color: #fff;
}

.btn-outline-primary:hover {
  background-color: var(--brand);
  color: #fff;
  border-color: var(--brand);
}

.btn-current-active {
  background-color: var(--brand);
  color: #fff;
  border: 1px solid var(--brand);
  cursor: default;
}

.btn-current-active:disabled {
  opacity: 1;
}

.btn-expired {
  background-color: #dc3545;
  color: #fff;
  border: 1px solid #dc3545;
  animation: pulse-button 2s infinite;
}

.btn-expired:hover {
  background-color: #c82333;
  border-color: #c82333;
}

@keyframes pulse-button {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
  }

  50% {
    box-shadow: 0 0 0 8px rgba(220, 53, 69, 0);
  }
}

/* Price styling */
.price-display {
  font-weight: 700 !important;
  font-size: 2.5rem !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.current-plan .price-display {
  font-size: 2.8rem !important;
  text-shadow: 0 3px 6px rgba(144, 177, 64, 0.3);
}

/* Misc */
.card {
  border-radius: 1rem;
}

.card-footer {
  padding-top: 2rem;
}

.list-group-item {
  border: none;
  padding: 0.5rem 0;
}

/* Buttons visibility + polish */
.pricing-card .btn {
  border-width: 2px;
  border-radius: 0.65rem;
  font-weight: 600;
}

.pricing-card .btn-outline-primary,
.pricing-card .btn-outline-primary:visited {
  color: var(--brand) !important;
  border-color: var(--brand) !important;
  background-color: #fff !important;
}

.pricing-card .btn-outline-primary:hover,
.pricing-card .btn-outline-primary:focus {
  background-color: var(--brand) !important;
  color: #000000 !important;
  border-color: var(--brand) !important;
  box-shadow: 0 0 0 0.25rem rgba(144, 177, 64, 0.25);
}

.pricing-card .btn-current-active {
  background-color: #fff !important;
  color: var(--brand) !important;
  border-color: var(--brand) !important;
  font-weight: 700;
  box-shadow: 0 0 0 3px rgba(144, 177, 64, 0.2);
  cursor: not-allowed;
  opacity: 0.8;
}

.pricing-card .btn-current-active:disabled {
  background-color: #fff !important;
  color: var(--brand) !important;
  border-color: var(--brand) !important;
  opacity: 0.8;
  cursor: not-allowed;
}

.pricing-card .btn-expired {
  background-color: #dc3545 !important;
  border-color: #dc3545 !important;
  color: #fff !important;
}

/* Current plan readability */
.current-plan,
.current-plan h5,
.current-plan p,
.current-plan .list-group-item span,
.current-plan .price-display,
.current-plan .text-muted {
  color: #1f2937 !important;
  /* slate-800 */
}

.current-plan .text-muted {
  color: #6b7280 !important;
  /* slate-500 */
}

/* Plan name badge */
.plan-name-badge {
  display: inline-block;
  padding: 0.35rem 0.9rem;
  border: 2px solid var(--brand);
  color: var(--brand);
  background: #fff;
  border-radius: 9999px;
  line-height: 1;
  box-shadow: 0 4px 10px rgba(144, 177, 64, 0.15);
}

.border-popular .plan-name-badge {
  background: linear-gradient(45deg, #fff, #f9fff0);
}

.expired-plan .plan-name-badge {
  border-color: #dc3545;
  color: #dc3545;
  box-shadow: 0 4px 10px rgba(220, 53, 69, 0.15);
}

.current-plan .plan-name-badge {
  border-color: var(--brand-600);
  color: var(--brand-600);
  background: #fff;
}
</style>
