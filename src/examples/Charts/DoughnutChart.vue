<script setup>
import { onMounted } from "vue";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(ChartDataLabels);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    default: "300",
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  chart: {
    type: Object,
    required: true,
    default: () => ({
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: []
        }
      ],
      compPerformance: 0
    })
  }
});

onMounted(() => {
  const ctx = document.getElementById(props.id).getContext("2d");

  // Destroy existing chart instance
  const existingChart = Chart.getChart(props.id);
  if (existingChart) existingChart.destroy();

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: props.chart.labels,
      datasets: props.chart.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%", 
      plugins: {
        legend: {
          display: false 
        },
        datalabels: {
          formatter: (value) => {
            if (value === 0) return "";
            // Round to nearest integer to avoid long decimal numbers
            const rounded = Math.round(value);
            return `${rounded}%`;
          },
          color: "#fff",
          font: {
            size: 14,
            weight: "bold"
          },
          tooltip: {
            display: false,
          },
        }
      }
    }
  });
});
</script>

<template>
  <div class="card z-index-2">
    <div class="pb-0 card-header mb-0">
      <h6>{{ props.title }}</h6>
      <p v-if="props.description" class="text-sm">{{ props.description }}</p>
    </div>
    <div class="p-3 card-body">
      <div class="d-flex justify-content-between">
        <!-- Chart container -->
        <div class="chart-container position-relative" style="width: 50%;">
          <canvas :id="props.id" class="chart-canvas" width="300" :height="props.height"></canvas>
          <!-- Center text -->
          <div class="center-text">
            <h4>{{ Math.round(props.chart.compPerformance) }}</h4>
            <small>Company Performance</small>
          </div>
        </div>

        <!-- Custom legend -->
        <div class="legend" style="width: 50%;">
          <div v-for="(item, index) in chart.datasets[0].data" :key="index" class="legend-item">
            <span 
              class="color-box"
              :style="{ background: chart.datasets[0].backgroundColor[index] }"
            ></span>
            <span class="label">{{ chart.labels[index] }}</span>
            <span class="percentage">{{ Math.round(item) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
}

.center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.legend {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 400px;
  overflow-y: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  transition: background-color 0.2s ease;
}

.legend-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.legend-item:last-child {
  border-bottom: none;
}

.color-box {
  width: 16px;
  height: 16px;
  min-width: 16px;
  margin-right: 12px;
  border-radius: 3px;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.label {
  flex: 1;
  font-size: 0.95rem;
  color: #34495e;
  font-weight: 400;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 0.5rem;
}

.percentage {
  margin-left: auto;
  font-size: 0.95rem;
  color: #34495e;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
  flex-shrink: 0;
}

/* Tablet Styles */
@media (max-width: 991px) {
  .d-flex {
    flex-direction: column;
  }

  .chart-container {
    width: 100% !important;
    margin-bottom: 1.5rem;
  }

  .legend {
    width: 100% !important;
    padding-left: 0;
    margin-top: 1.5rem;
  }

  .card-body {
    padding: 1rem !important;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .d-flex {
    flex-direction: column;
  }

  .chart-container {
    width: 100% !important;
    margin-bottom: 1rem;
    min-height: 250px;
  }

  .legend {
    width: 100% !important;
    padding-left: 0;
    margin-top: 1rem;
  }

  .legend-item {
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .color-box {
    width: 14px;
    height: 14px;
    min-width: 14px;
    margin-right: 10px;
  }

  .label {
    font-size: 0.9rem;
  }

  .percentage {
    font-size: 0.9rem;
    min-width: 45px;
  }

  .center-text h4 {
    font-size: 1.5rem;
  }

  .center-text small {
    font-size: 0.75rem;
  }

  .card-header h6 {
    font-size: 1rem;
  }

  .card-body {
    padding: 0.75rem !important;
  }
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  .chart-container {
    min-height: 200px;
  }

  .legend-item {
    padding: 0.5rem 0.25rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .color-box {
    width: 12px;
    height: 12px;
    min-width: 12px;
    margin-right: 8px;
  }

  .label {
    font-size: 0.85rem;
  }

  .percentage {
    font-size: 0.85rem;
    min-width: 40px;
  }

  .center-text h4 {
    font-size: 1.25rem;
  }

  .center-text small {
    font-size: 0.7rem;
  }

  .card-header h6 {
    font-size: 0.9rem;
  }

  .card-body {
    padding: 0.5rem !important;
  }
}


</style>