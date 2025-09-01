<script setup>
import { ref, computed, onBeforeMount, watch } from "vue";
import DoughnutChart from "@/examples/Charts/DoughnutChart.vue";
import { useStore } from "vuex";

const t = (key) => {
  return translations[currentLanguage.value][key];
};
console.log("t", t);

const translations = {
  en: {
    noDataHere: "No Data Here in this range",
  },
  ar: {
    noDataHere: "لا يوجد بيانات هنا في هذه الفترة",
  },
};
const currentLanguage = computed(() => store.getters.currentLanguage);



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
const chartData = computed(() => {
  return store.state.chartDeptPerformance;
});
const getChartData = async () => {
  console.log("chartData", chartData.value);

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

    // ✅ تحديث التواريخ بالقيم القادمة من API بعد التحميل
    if (chartData.value?.range) {
      fromDate.value = chartData.value.range.from;
      toDate.value = chartData.value.range.to;
    }
  } finally {
    isLoading.value = false;
  }
};

onBeforeMount(async () => {
  await getChartData(); // سيُشغل الدالة ويُحمل البيانات
});
</script>

<template>
  <div class="d-flex gap-2 justify-content-center">
    <!-- From Date -->
    <div class="input-group mb-3 w-25">
      <span class="input-group-text">From :</span>
      <input type="date" v-model="fromDate" class="form-control" placeholder="From Date" :max="toDate || undefined" />
    </div>

    <!-- To Date -->
    <div class="input-group mb-3 w-25">
      <span class="input-group-text">To :</span>
      <input type="date" v-model="toDate" class="form-control" placeholder="To Date" :min="fromDate || undefined" />
    </div>

    <button class="btn btn-primary" @click="getChartData">Get Data</button>
  </div>

  <!-- حالة التحميل -->
  <div v-if="isLoading" class="text-center">
    <div class="spinner-border mx-auto" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- حالة عدم وجود بيانات -->
  <div v-else-if="!chartData?.data?.dept_performance || chartData.data.dept_performance.length === 0">
    <div class="no-tasks-container">
      <img src="https://ik.imagekit.io/ts7pphpbz3/9318688.jpg" alt="no-tasks" class="no-tasks-image" />
      <p class="no-tasks-text">{{ t("noDataHere") }} {{ chartData.range?.from }} <span v-if="chartData.range?.to">to</span> {{
        chartData.range?.to }}</p>
    </div>
  </div>

  <!-- حالة وجود بيانات -->
  <div v-else class="mx-auto" style="width: 95%">
    <DoughnutChart :id="'deptPerformanceChart'"
      :title="`Department Performance (${chartData.data?.range?.from} to ${chartData.data?.range?.to})`" :chart="{
        labels: chartData.data?.dept_performance?.map((d) => d.department_name) ?? [],
        datasets: [
          {
            data: chartData.data?.dept_performance?.map((d) => d.total_rate) ?? [],
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
        compPerformance: chartData.data?.company_performance ?? 0,
      }" />
  </div>
</template>

<style scoped>
/* Add custom validation styles if needed */
input:invalid {
  border-color: #dc3545;
}

.no-tasks-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  text-align: center;
  width: 100%;
}

.no-tasks-image {
  max-width: 300px;
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
}

.no-tasks-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  margin: 0 1rem;
  line-height: 1.4;
}
</style>
