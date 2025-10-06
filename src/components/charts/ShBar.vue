<script setup>
import { computed } from 'vue'
import BarChart from './BarChart.vue'

const props = defineProps({
    data: {
        type: Array,
        required: true,
        default: () => []
    },
    index: {
        type: String,
        required: true
    },
    categories: {
        type: Array,
        required: true,
        default: () => []
    },
    colors: {
        type: Array,
        default: () => ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']
    },
    type: {
        type: String,
        default: 'grouped' // 'grouped' or 'stacked'
    },
    showLegend: {
        type: Boolean,
        default: true
    },
    showTooltip: {
        type: Boolean,
        default: true
    },
    showGridLine: {
        type: Boolean,
        default: false
    },
    roundedCorners: {
        type: Number,
        default: 8
    },
    yFormatter: {
        type: Function,
        default: (value) => value.toString()
    }
})

// Transform data for Chart.js
const chartData = computed(() => {
    if (!props.data || props.data.length === 0) {
        return { labels: [], datasets: [] }
    }

    // Extract labels from data using index prop
    const labels = props.data.map(item => item[props.index] || '')

    // Create datasets for each category
    const datasets = props.categories.map((category, idx) => ({
        label: category,
        data: props.data.map(item => item[category] || 0),
        backgroundColor: props.colors[idx % props.colors.length],
        borderColor: props.colors[idx % props.colors.length],
        borderWidth: 0,
        borderRadius: props.roundedCorners,
        barPercentage: 0.7,
        categoryPercentage: 0.8
    }))

    return {
        labels,
        datasets
    }
})

// Chart options
const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: props.showLegend,
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
            enabled: props.showTooltip,
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
                    label += props.yFormatter(context.parsed.y);
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
            stacked: props.type === 'stacked',
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
            stacked: props.type === 'stacked',
            beginAtZero: true,
            grid: {
                display: props.showGridLine,
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
            },
            ticks: {
                font: {
                    size: 11
                },
                padding: 10,
                callback: function (value) {
                    return props.yFormatter(value);
                }
            }
        }
    }
}))
</script>

<template>
    <BarChart :id="`bar-chart-${Math.random().toString(36).substr(2, 9)}`" :data="chartData" :options="chartOptions"
        height="350" />
</template>
