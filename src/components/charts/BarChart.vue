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

const getDefaultOptions = () => {
    const darkMode = document.body.classList.contains('dark-version');

    return {
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
                    },
                    color: darkMode ? '#ffffff' : '#1a202c'
                }
            },
            tooltip: {
                backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                borderRadius: 8,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                titleColor: darkMode ? '#ffffff' : '#1a202c',
                bodyColor: darkMode ? '#ffffff' : '#1a202c',
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
                color: darkMode ? '#ffffff' : '#1a202c',
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
                    minRotation: 0,
                    color: darkMode ? '#ffffff' : '#1a202c'
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    padding: 10,
                    color: darkMode ? '#ffffff' : '#1a202c'
                }
            }
        },
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        borderRadius: 8,
        borderSkipped: false
    };
};

const createChart = () => {
    const ctx = document.getElementById(props.id);
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Get default options with current dark mode state
    const defaultOptions = getDefaultOptions();

    // Merge options
    const mergedOptions = {
        ...defaultOptions,
        ...props.options,
        plugins: {
            ...defaultOptions.plugins,
            ...(props.options?.plugins || {}),
            datalabels: {
                ...defaultOptions.plugins.datalabels,
                ...(props.options?.plugins?.datalabels || {})
            }
        }
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

// Watch for dark mode class changes on body
const darkModeObserver = new MutationObserver(() => {
    if (chartInstance) {
        createChart();
    }
});

onMounted(() => {
    // Observe body class changes for dark mode
    darkModeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
});

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
