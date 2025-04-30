<script setup>
import { ref, computed, onBeforeMount, watch } from "vue";
import DoughnutChart from "@/examples/Charts/DoughnutChart.vue";
import { useStore } from "vuex";

const store = useStore();

const fromDate = ref("");
const toDate = ref("");

// Watch for from date changes
watch(fromDate, (newFrom) => {
  if (newFrom && toDate.value < newFrom) {
    toDate.value = newFrom; // Auto-correct invalid selections
  }
});

// Watch for to date changes (optional)
watch(toDate, (newTo) => {
  if (newTo && fromDate.value > newTo) {
    fromDate.value = newTo; // Maintain consistency
  }
});

const isLoading = ref(true);
const chartData = computed(() => store.state.chartDeptPerformance || {});

const getChartData = async () => {
  try {
    isLoading.value = true;

    const range = {
      from: fromDate.value,
      to: toDate.value,
    };

    if (!range.to) {
      range.to = range.from;
    }

    // Only send non-empty ranges
    await store.dispatch("getChartDeptPerformance", range);
  } finally {
    isLoading.value = false;
  }
};

onBeforeMount(getChartData);
</script>

<template>
  <div class="d-flex gap-2 justify-content-center">
    <!-- From Date -->
    <div class="input-group mb-3 w-25">
      <span class="input-group-text">From :</span>
      <input
        type="date"
        v-model="fromDate"
        class="form-control"
        placeholder="From Date"
        :max="toDate || undefined"
      />
    </div>

    <!-- To Date -->
    <div class="input-group mb-3 w-25">
      <span class="input-group-text">To :</span>
      <input
        type="date"
        v-model="toDate"
        class="form-control"
        placeholder="To Date"
        :min="fromDate || undefined"
      />
    </div>

    <button class="btn btn-primary" @click="getChartData">Get Data</button>
  </div>
  <div v-if="!isLoading" class="mx-auto" style="width: 95%;">
    <DoughnutChart
      :id="'deptPerformanceChart'"
      :title="`Department Performance (${chartData.range?.from} to ${chartData.range?.to})`"
      :chart="{
        labels: chartData.dept_performance.map((d) => d.department_name),
        datasets: [
          {
            data: chartData.dept_performance.map((d) => d.total_rate),
            backgroundColor: [
              '#9A59E2',
              '#B6B6B6',
              '#3498DB',
              '#4CAF50',
              '#FFA07A',
              '#E74C3C',
              '#2ECC71',
              '#F1C40F',
              '#8E44AD',
              '#34495E',
            ],
          },
        ],
        compPerformance: chartData.company_performance,
      }"
    />
  </div>
  <div v-else class="text-center">
    <div class="spinner-border mx-auto" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<style scoped>
/* Add custom validation styles if needed */
input:invalid {
  border-color: #dc3545;
}
</style>
