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
        default: () => ({
            labels: [],
            datasets: []
        })
    },
    options: {
        type: Object,
        default: () => ({})
    }
});

let chartInstance = null;

const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                    size: 12,
                    weight: '500'
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            titleFont: {
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                size: 13
            },
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    label += context.parsed.y;
                    return label;
                }
            }
        },
        datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            offset: 2,
            font: {
                size: 10,
                weight: 'bold'
            },
            color: '#1a202c',
            formatter: function (value) {
                return value === 0 ? '' : value;
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                font: {
                    size: 11
                },
                maxRotation: 45,
                minRotation: 0
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
            },
            ticks: {
                font: {
                    size: 11
                },
                padding: 10
            }
        }
    },
    barPercentage: 0.7,
    categoryPercentage: 0.8,
    borderRadius: 8,
    borderSkipped: false
};

const createChart = () => {
    const ctx = document.getElementById(props.id);
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Merge options
    const mergedOptions = {
        ...defaultOptions,
        ...props.options
    };

    chartInstance = new Chart(ctx.getContext("2d"), {
        type: "bar",
        data: props.data,
        options: mergedOptions
    });
};

onMounted(() => {
    nextTick(() => {
        createChart();
    });
});

// Watch for data changes
watch(() => props.data, () => {
    createChart();
}, { deep: true });

// Cleanup
onMounted(() => {
    return () => {
        if (chartInstance) {
            chartInstance.destroy();
        }
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
