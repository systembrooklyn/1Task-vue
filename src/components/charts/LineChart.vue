<script setup>
import { onMounted, watch, nextTick } from "vue";
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
    data: {
        type: Object,
        required: true,
        default: () => ({ labels: [], datasets: [] }),
    },
    options: {
        type: Object,
        default: () => ({}),
    },
});

let chartInstance = null;

// Plugin to paint chart area background (supports dark theme)
const chartAreaBackgroundPlugin = {
  id: 'chartAreaBackground',
  beforeDraw: (chart, args, pluginOptions) => {
    if (!pluginOptions || !pluginOptions.color) return;
    const {ctx, chartArea} = chart;
    if (!chartArea) return;
    ctx.save();
    ctx.fillStyle = pluginOptions.color;
    ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
    ctx.restore();
  }
}

const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
        line: { tension: 0.35, borderWidth: 3, borderCapStyle: 'round', borderJoinStyle: 'round' },
        point: { radius: 0, hoverRadius: 4, hitRadius: 8 },
    },
    plugins: {
        legend: {
            display: true,
            position: "top",
            labels: {
                usePointStyle: true,
                padding: 15,
                font: { size: 12, weight: "500" },
            },
        },
        tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            borderRadius: 8,
            titleFont: { size: 14, weight: "bold" },
            bodyFont: { size: 13 },
        },
        datalabels: {
            display: false,
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
        },
        y: {
            beginAtZero: true,
            grid: { color: "rgba(0, 0, 0, 0.05)", drawBorder: false },
            ticks: { font: { size: 11 }, padding: 10 },
        },
    },
};

const createChart = () => {
    const ctx = document.getElementById(props.id);
    if (!ctx) return;

    if (chartInstance) chartInstance.destroy();

    const mergedOptions = { ...defaultOptions, ...props.options };

    chartInstance = new Chart(ctx.getContext("2d"), {
        type: "line",
        data: props.data,
    options: mergedOptions,
    plugins: [chartAreaBackgroundPlugin]
    });
};

onMounted(() => {
    nextTick(() => {
        createChart();
    });
});

watch(
    () => props.data,
    () => {
        createChart();
    },
    { deep: true }
);

onMounted(() => {
    return () => {
        if (chartInstance) chartInstance.destroy();
    };
});
</script>

<template>
    <div class="chart-container">
        <canvas :id="props.id" :height="props.height"></canvas>
    </div>
</template>

<style scoped>
.chart-container {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>
