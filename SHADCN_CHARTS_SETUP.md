# Shadcn-Vue Charts Setup Guide

## 📦 Installation Required

Before the new charts work, you need to install the shadcn-vue chart-bar component:

### Using npm:

```bash
npx shadcn-vue@latest add chart-bar
```

### Using pnpm:

```bash
pnpm dlx shadcn-vue@latest add chart-bar
```

### Using yarn:

```bash
yarn dlx shadcn-vue@latest add chart-bar
```

### Using bun:

```bash
bunx shadcn-vue@latest add chart-bar
```

## 📁 New Files Created

1. **`src/components/charts/ShBar.vue`**

   - Wrapper component for shadcn-vue Bar charts
   - Provides clean API with sensible defaults
   - Supports grouped/stacked charts, custom colors, tooltips, etc.

2. **`src/views/ChartReportedShadcn.vue`**

   - New advanced charts page
   - Features:
     - Date range filters (From/To)
     - Task Progress by Department chart (Done vs Not Done)
     - Reports Status chart (Reported vs Not Reported)
     - Department Performance chart (Performance %)
   - Fully responsive and bilingual (EN/AR)

3. **Route Added:** `/:companyName/charts-analytics`

## 🔌 Integration

### Current Files (Untouched):

- ✅ `src/views/ChartReported.vue` - Still works as before
- ✅ `src/examples/Charts/DoughnutChart.vue` - Still works as before

### New Route:

- Access via: `http://localhost:8080/{companyName}/charts-analytics`
- Route name: `"charts analytics"`

## 🎨 Features

### ShBar Component Props:

- `data`: Array of objects with chart data
- `index`: Key for X-axis (e.g., "dept")
- `categories`: Array of data series (e.g., ["Done", "Not Done"])
- `colors`: Array of hex colors (optional)
- `type`: "grouped" or "stacked"
- `showLegend`: Boolean (default: true)
- `showTooltip`: Boolean (default: true)
- `showGridLine`: Boolean (default: false)
- `roundedCorners`: Number (default: 8)
- `yFormatter`: Function to format Y-axis labels

### Data Sources:

1. **Dashboard Data** (`store.state.dashboardData`)

   - Used for Task Progress and Reports Status charts
   - Source: `DailyTasks.DailyTaskDepts`

2. **Department Performance** (`store.state.chartDeptPerformance`)
   - Used for Performance chart
   - Source: `data.dept_performance`
   - Filtered by date range

## 🚀 Usage Example

```vue
<ShBar
  :data="chartData"
  index="dept"
  :categories="['Done', 'Not Done']"
  :colors="['#10b981', '#ef4444']"
  type="grouped"
  :rounded-corners="8"
  :show-grid-line="true"
/>
```

## 📊 Chart Types Available

1. **Task Progress by Department**

   - Grouped bar chart
   - Green (Done) vs Red (Not Done)
   - Data: `done_reports`, `not_done_reports`

2. **Reports Status**

   - Grouped bar chart
   - Blue (Reported) vs Orange (Not Reported)
   - Data: `total_reports`, `total_tasks - total_reports`

3. **Department Performance**
   - Single bar chart
   - Green bars showing performance %
   - Data: `total_rate` from API

## 🌐 Bilingual Support

All text is translated (EN/AR):

- Chart titles
- Legends
- Button labels
- Date filters
- No data messages

## 📱 Responsive Design

- Desktop: Full width charts side by side
- Tablet: 2 columns
- Mobile: Stacked single column
- Adaptive font sizes and spacing

## 🎯 Next Steps

1. Run the installation command above
2. Restart your dev server
3. Navigate to `/{companyName}/charts-analytics`
4. (Optional) Add a navigation link in your sidebar/menu

## 📚 Documentation

Reference: https://www.shadcn-vue.com/docs/charts/bar.html

## ⚠️ Notes

- The old DoughnutChart continues to work on `/chart-reported`
- Both chart systems coexist independently
- No breaking changes to existing code
- All data comes from existing Vuex store (no new API calls)
