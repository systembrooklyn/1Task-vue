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
  <div class="chart-report-container">
    <div class="date-range-selector">
      <!-- From Date -->
      <div class="input-group mb-3 date-input-wrapper">
        <span class="input-group-text">From :</span>
        <input type="date" v-model="fromDate" class="form-control" placeholder="From Date" :max="toDate || undefined" />
      </div>

      <!-- To Date -->
      <div class="input-group mb-3 date-input-wrapper">
        <span class="input-group-text">To :</span>
        <input type="date" v-model="toDate" class="form-control" placeholder="To Date" :min="fromDate || undefined" />
      </div>

      <button class="btn btn-primary get-data-btn" @click="getChartData">Get Data</button>
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
        <p class="no-tasks-text">{{ t("noDataHere") }} {{ chartData.range?.from }} <span
            v-if="chartData.range?.to">to</span> {{
              chartData.range?.to }}</p>
      </div>
    </div>

    <!-- حالة وجود بيانات -->
    <div v-else class="chart-wrapper">
      <DoughnutChart :id="'deptPerformanceChart'"
        :title="`Department Performance (${chartData.data?.range?.from} to ${chartData.data?.range?.to})`" :chart="{
          labels: chartData.data?.dept_performance?.map((d) => d.department_name) ?? [],
          datasets: [
            {
              data: chartData.data?.dept_performance?.map((d) => d.total_rate) ?? [],
              backgroundColor: [
                '#9A59E2', // Purple
                '#B6B6B6', // Gray
                '#3498DB', // Light Blue
                '#4CAF50', // Green
                '#FFA07A', // Light Orange
                '#E74C3C', // Red
                '#2ECC71', // Light Green
                '#F1C40F', // Yellow
                '#8E44AD', // Dark Purple
                '#34495E', // Dark Gray
                '#1ABC9C', // Turquoise
                '#E67E22', // Orange
                '#16A085', // Dark Turquoise
                '#C0392B', // Dark Red
                '#D35400', // Dark Orange
                '#27AE60', // Dark Green
                '#2980B9', // Dark Blue
                '#7F8C8D', // Medium Gray
                '#95A5A6', // Light Gray
                '#F39C12', // Gold
                '#E91E63', // Pink
                '#9C27B0', // Deep Purple
                '#3F51B5', // Indigo
                '#00BCD4', // Cyan
                '#009688', // Teal
                '#8BC34A', // Light Green
                '#FFC107', // Amber
                '#FF9800', // Deep Orange
                '#795548', // Brown
                '#607D8B', // Blue Grey
              ],
            },
          ],
          compPerformance: chartData.data?.company_performance ?? 0,
        }" />
    </div>
  </div>
</template>

<style scoped>
/* Add custom validation styles if needed */
input:invalid {
  border-color: #dc3545;
}

.chart-report-container {
  padding: 1rem;
}

.date-range-selector {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.date-input-wrapper {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.get-data-btn {
  flex-shrink: 0;
  align-self: flex-end;
  white-space: nowrap;
}

.chart-wrapper {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 0.5rem;
}

.chart-wrapper :deep(.card-header h6) {
  font-size: 1rem;
  word-wrap: break-word;
  line-height: 1.4;
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
  padding: 1rem;
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

/* Tablet Styles */
@media (max-width: 991px) {
  .chart-report-container {
    padding: 0.75rem;
  }

  .date-range-selector {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .date-input-wrapper {
    max-width: 100%;
    width: 100%;
    margin-bottom: 0;
  }

  .date-input-wrapper .input-group-text {
    min-width: 70px;
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }

  .date-input-wrapper .form-control {
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }

  .get-data-btn {
    width: 100%;
    align-self: stretch;
    padding: 0.6rem 1rem;
    font-size: 0.95rem;
  }

  .chart-wrapper {
    padding: 0;
    margin-top: 1rem;
  }

  .chart-wrapper :deep(.card-header h6) {
    font-size: 0.95rem;
  }

  .no-tasks-container {
    margin-top: 1.5rem;
    padding: 0.75rem;
  }

  .no-tasks-image {
    max-width: 280px;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .chart-report-container {
    padding: 0.5rem;
  }

  .date-range-selector {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .date-input-wrapper {
    min-width: 100%;
    margin-bottom: 0;
  }

  .date-input-wrapper .input-group-text {
    min-width: 60px;
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  .date-input-wrapper .form-control {
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  .get-data-btn {
    width: 100%;
    margin-top: 0;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .chart-wrapper {
    padding: 0;
    margin-top: 0.75rem;
  }

  .chart-wrapper :deep(.card-header h6) {
    font-size: 0.9rem;
    line-height: 1.3;
  }

  .no-tasks-container {
    margin-top: 1rem;
    padding: 0.5rem;
    gap: 0.75rem;
  }

  .no-tasks-image {
    max-width: 250px;
  }

  .no-tasks-text {
    font-size: 0.95rem;
    margin: 0 0.5rem;
    line-height: 1.5;
  }
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  .chart-report-container {
    padding: 0.5rem;
  }

  .date-range-selector {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .date-input-wrapper .input-group-text {
    min-width: 55px;
    font-size: 0.8rem;
    padding: 0.4rem 0.5rem;
  }

  .date-input-wrapper .form-control {
    font-size: 0.8rem;
    padding: 0.4rem 0.5rem;
  }

  .get-data-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .chart-wrapper {
    margin-top: 0.5rem;
  }

  .chart-wrapper :deep(.card-header h6) {
    font-size: 0.85rem;
    line-height: 1.3;
  }

  .no-tasks-container {
    margin-top: 0.75rem;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .no-tasks-image {
    max-width: 200px;
  }

  .no-tasks-text {
    font-size: 0.85rem;
    margin: 0 0.25rem;
    line-height: 1.4;
  }
}
</style>
