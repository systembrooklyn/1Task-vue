<script setup>
import { computed } from 'vue'
import BarChart from './BarChart.vue'
import { useResponsive } from '@/composables/useResponsive'

const { isMobile } = useResponsive()

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

// Calculate if chart needs horizontal scrolling on mobile
const needsHorizontalScroll = computed(() => {
    if (!isMobile.value || !props.data || props.data.length === 0) {
        return false;
    }
    // If we have more than 5 items, chart likely needs scrolling on mobile
    return props.data.length > 5;
});

// Chart options
const chartOptions = computed(() => {
    const mobileMode = isMobile.value;

    return {
        indexAxis: 'x', // Always vertical bars (same as desktop)
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: props.showLegend,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: mobileMode ? 10 : 15,
                    font: {
                        size: mobileMode ? 10 : 12,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                enabled: props.showTooltip,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: mobileMode ? 10 : 12,
                borderRadius: 8,
                titleFont: {
                    size: mobileMode ? 12 : 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: mobileMode ? 11 : 13
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
                    size: mobileMode ? 9 : 10,
                    weight: 'bold'
                },
                color: '#1a202c',
                formatter: function (value, context) {
                    // Get the value from dataset.data array (most reliable)
                    let dataValue = null;

                    if (context?.dataset?.data && typeof context.dataIndex === 'number' && context.dataIndex >= 0) {
                        const rawData = context.dataset.data[context.dataIndex];
                        if (rawData !== undefined && rawData !== null && !isNaN(rawData)) {
                            dataValue = rawData;
                        }
                    }

                    // Fallback to parsed.y (vertical bars)
                    if ((dataValue === null || dataValue === undefined || isNaN(dataValue)) &&
                        context?.parsed?.y !== undefined && !isNaN(context.parsed.y)) {
                        dataValue = context.parsed.y;
                    }

                    // Fallback to context.raw
                    if ((dataValue === null || dataValue === undefined || isNaN(dataValue)) &&
                        context?.raw !== undefined && context.raw !== null && !isNaN(context.raw)) {
                        dataValue = context.raw;
                    }

                    // Last fallback: use value parameter
                    if (dataValue === null || dataValue === undefined || isNaN(dataValue)) {
                        const parsedValue = typeof value === 'number' ? value : parseFloat(value);
                        if (!isNaN(parsedValue)) {
                            dataValue = parsedValue;
                        }
                    }

                    const numValue = typeof dataValue === 'number' ? dataValue : parseFloat(dataValue);

                    if (isNaN(numValue) || numValue === 0) {
                        return '';
                    }

                    return props.yFormatter(numValue);
                }
            }
        },
        scales: {
            // Vertical bars - labels on X axis, values on Y axis (same for mobile and desktop)
            x: {
                stacked: props.type === 'stacked',
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: mobileMode ? 10 : 11
                    },
                    maxRotation: mobileMode ? 90 : 45,
                    minRotation: mobileMode ? 45 : 0,
                    callback: function (value) {
                        const label = this.getLabelForValue(value);
                        if (mobileMode && label && label.length > 12) {
                            return label.substring(0, 10) + '...';
                        } else if (!mobileMode && label && label.length > 12) {
                            return label.substring(0, 10) + '...';
                        }
                        return label;
                    },
                    padding: mobileMode ? 5 : 10
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
                        size: mobileMode ? 10 : 11
                    },
                    padding: mobileMode ? 5 : 10,
                    callback: function (value) {
                        return props.yFormatter(value);
                    }
                }
            }
        },
        barPercentage: 0.7,
        categoryPercentage: 0.8
    }
})
</script>

<template>
    <div class="sh-bar-wrapper" :class="{ 'needs-scroll': needsHorizontalScroll && isMobile }">
        <div class="chart-scroll-container" v-if="needsHorizontalScroll && isMobile">
            <div class="chart-inner-wrapper">
                <BarChart :id="`bar-chart-${Math.random().toString(36).substr(2, 9)}`" :data="chartData"
                    :options="chartOptions" height="350" />
            </div>
        </div>
        <BarChart v-else :id="`bar-chart-${Math.random().toString(36).substr(2, 9)}`" :data="chartData"
            :options="chartOptions" height="350" />

        <!-- Scroll hint for mobile -->
        <div v-if="needsHorizontalScroll && isMobile" class="mobile-scroll-hint">
            <i class="fas fa-arrows-alt-h me-2"></i>
            Swipe to see more
        </div>
    </div>
</template>

<style scoped>
.sh-bar-wrapper {
    width: 100%;
    height: 100%;
}

.chart-scroll-container {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    padding-bottom: 10px;
}

.chart-inner-wrapper {
    min-width: max-content;
    width: max-content;
}

/* Custom scrollbar for mobile */
.chart-scroll-container::-webkit-scrollbar {
    height: 8px;
}

.chart-scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.chart-scroll-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.chart-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #555;
}

@media (max-width: 768px) {
    .chart-inner-wrapper {
        min-width: 600px;
    }
}

.mobile-scroll-hint {
    text-align: center;
    padding: 8px;
    font-size: 0.75rem;
    color: #64748b;
    background: #f8f9fa;
    border-radius: 6px;
    margin-top: 8px;
}
</style>
