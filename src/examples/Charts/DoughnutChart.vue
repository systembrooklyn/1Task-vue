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
    default: "200",
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
      cutout: "70%", // Create doughnut hole
      plugins: {
        legend: {
          display: false // Hide default legend
        },
        datalabels: {
          formatter: (value) => {
            if (value === 0) return "";
            return `${value}%`;
          },
          color: "#fff",
          font: {
            size: 14,
            weight: "bold"
          }
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
            <h4>{{ props.chart.compPerformance }}</h4>
            <p>Company Performance</p>
          </div>
        </div>

        <!-- Custom legend -->
        <div class="legend" style="width: 50%;">
          <div v-for="(item, index) in chart.datasets[0].data" :key="index" class="legend-item d-flex align-items-center">
            <span 
              class="color-box"
              :style="{ background: chart.datasets[0].backgroundColor[index] }"
            ></span>
            <span class="label">{{ chart.labels[index] }}</span>
            <span class="percentage ms-auto">{{ item }}%</span>
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
}

.color-box {
  width: 15px;
  height: 15px;
  margin-right: 10px;
}

.label {
  flex: 1;
}

.percentage {
  margin-left: auto;
}

@media (max-width: 768px) {
  .d-flex {
    flex-direction: column;
  }

  .chart-container, .legend {
    width: 100%;
  }

  .legend {
    padding-left: 0;
    margin-top: 20px;
  }
}

.legend-item {
  /* padding: 5px 0; */
  border-bottom: 1px solid #eee;
}

.color-box {
  min-width: 15px;
}

.percentage {
  min-width: 50px;
  text-align: right;
}
</style>