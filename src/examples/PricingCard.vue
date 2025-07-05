<template>
  <div class="row g-4">
    <!-- Ensure we're iterating over the "data" property of the plans object -->
    <div
      v-for="plan in props.plans.data"
      :key="plan.id"
      class="col-md-6 col-lg-3"
    >
      <div
        class="card h-100 border-0 shadow-sm position-relative"
        :class="{ 'border-popular': plan.isPopular }"
      >
        <!-- Most Popular Badge -->
        <div
          v-if="plan.isPopular"
          class="position-absolute w-100 text-center"
          style="z-index: 10"
        >
          <span class="badge bg-gradient-primary rounded-pill px-3 py-2 mt-n3">
            <i class="fas fa-star me-1"></i> Most Popular
          </span>
        </div>

        <!-- Card Header -->
        <div class="card-header bg-transparent border-0 pt-5">
          <div class="text-center">
            <h5 class="mb-1 fw-bold">{{ plan.name }}</h5>
            <p v-if="plan.description" class="text-sm text-muted mb-0">
              {{ plan.description }}
            </p>
          </div>
        </div>

        <!-- Price Section -->
        <div class="card-body pt-0">
          <div class="d-flex justify-content-center align-items-baseline my-4">
            <h2 class="mb-0 me-1 text-gradient-primary">${{ plan.price }}</h2>
            <span class="text-sm text-muted">/month</span>
          </div>

          <!-- Features List -->
          <ul class="list-group list-group-flush flex-grow-1">
            <li
              v-for="(feature, idx) in plan.features"
              :key="idx"
              class="list-group-item d-flex align-items-center px-0 py-2"
            >
              <i class="fas fa-check text-success me-2"></i>
              <span>{{ feature.name }}</span>
              <span class="ms-auto fw-bold">{{ feature.value }}</span>
            </li>
          </ul>
        </div>

        <!-- Action Button -->
        <div class="card-footer bg-transparent border-0 pt-3 pb-5">
          <a
            href="#"
            class="btn btn-outline-primary w-100"
            @click.prevent="selectPlan(plan)"
            :disabled="isSubscribing"
          >
            <span v-if="isSubscribing">
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Processing...
            </span>
            <span v-else-if="!isSubscribing && plan.id !== currentPlanId"> Choose Plan </span>
            <span v-else-if="!isSubscribing && plan.id === currentPlanId"> Your Plan </span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

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

function selectPlan(plan) {
  emit("select", plan);
}

//   function selectPlan(plan) {
//     // Toggle selection status
//     plan.isSelected = !plan.isSelected;
//     emit('select', plan);
//   }
</script>

<style scoped>
.text-gradient-primary {
  background: linear-gradient(45deg, #a7c858, #8aab3a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-gradient-primary {
  background: linear-gradient(45deg, #a7c858, #8aab3a);
  color: white !important;
}

.card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border-radius: 1rem;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.border-popular {
  border: 2px solid #a7c858;
}

.list-group-item {
  border: none;
  padding: 0.5rem 0;
}

.btn-outline-dark:hover {
  background-color: #212529;
  color: #fff;
  border-color: #212529;
}

.badge.bg-primary {
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-footer {
  padding-top: 2rem;
}
</style>
