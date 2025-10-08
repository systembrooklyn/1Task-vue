<script setup>
import { computed } from 'vue'
import LineChart from './LineChart.vue'

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
    series: {
        type: Array, // array of { key: string, label: string }
        required: true,
        default: () => []
    },
    colors: {
        type: Array,
        default: () => ['#0ea5e9', '#f59e0b', '#10b981']
    },
    showLegend: {
        type: Boolean,
        default: true
    },
    showGridLine: {
        type: Boolean,
        default: true
    },
    yFormatter: {
        type: Function,
        default: (value) => value.toString()
  },
  theme: {
    type: String,
    default: 'light' // 'light' | 'dark'
  }
})

const chartData = computed(() => {
    if (!props.data || props.data.length === 0) {
        return { labels: [], datasets: [] }
    }
    const labels = props.data.map(item => item[props.index] || '')
    const datasets = props.series.map((s, idx) => ({
        label: s.label,
        data: props.data.map(item => item[s.key] || 0),
        borderColor: props.colors[idx % props.colors.length],
        backgroundColor: props.colors[idx % props.colors.length] + '33',
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4
    }))
    return { labels, datasets }
})

const chartOptions = computed(() => {
  const isDark = props.theme === 'dark'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: props.showLegend,
        position: 'top',
        labels: {
          color: isDark ? '#e5e7eb' : '#1f2937',
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: { enabled: true },
      chartAreaBackground: { color: isDark ? '#0f172a' : undefined }
    },
    scales: {
      x: {
        grid: { display: true, color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: isDark ? '#cbd5e1' : '#475569' }
      },
      y: {
        beginAtZero: true,
        grid: { display: props.showGridLine, color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: {
          color: isDark ? '#cbd5e1' : '#475569',
          callback: function (value) { return props.yFormatter(value) }
        }
      }
    }
  }
})
</script>

<template>
    <LineChart :id="`line-chart-${Math.random().toString(36).substr(2, 9)}`" :data="chartData" :options="chartOptions"
        height="350" />

</template>
