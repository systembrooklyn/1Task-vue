// Dashboard.vue
<script setup>
import {  ref, watch, onMounted, onUnmounted } from "vue";
import MiniStatisticsCard from "@/examples/Cards/MiniStatisticsCard.vue";
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";
import { useStore } from "vuex";


const store = useStore();
// const userName = computed(() => store.getters.userName);

// Loading and error states
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');

// Dashboard data with localStorage persistence
const dashboardData = ref(localStorage.getItem('dashboardData') ? 
  JSON.parse(localStorage.getItem('dashboardData')) : 
  {
    AllDailyTasks: { active: 0, inActive: 0, total: 0 },
    DailyTasks: {
      DailyTaskDepts: [],
      done_reports: 0,
      not_done_reports: 0,
      total_reports: 0,
    },
    Departments: { Departments: [], total: 0 },
    Emps: { invited: 0, pending: 0, total: 0 },
    lastUpdated: null
  }
);

// Auto-refresh interval (every 5 minutes)
const refreshInterval = ref(null);

// Fetch and save dashboard data
const fetchAndSaveDashboardData = async () => {
  try {
    isLoading.value = true;
    hasError.value = false;
    errorMessage.value = '';
    
    const freshData = await store.dispatch("fetchDashboardData");
    console.log("freshData", freshData);
    if (freshData) {
      dashboardData.value = {
        ...freshData,
        lastUpdated: new Date().toLocaleString()
      };
      localStorage.setItem('dashboardData', JSON.stringify(dashboardData.value));
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    hasError.value = true;
    errorMessage.value = error.message || 'Failed to fetch dashboard data';
  } finally {
    isLoading.value = false;
  }
};

// Watch for store changes and update local data
watch(() => store.getters.dashboardData, (newData) => {
  if (newData) {
    dashboardData.value = {
      ...newData,
      lastUpdated: new Date().toLocaleString()
    };
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData.value));
  }
});

// Auto-refresh functionality
const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    fetchAndSaveDashboardData();
  }, 300000); // Refresh every 5 minutes
};

// Cleanup on component unmount
onMounted(() => {
  fetchAndSaveDashboardData();
  startAutoRefresh();
});

// Cleanup interval on component unmount
onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="py-1 container-fluid">
    <!-- Error State -->
    <div v-if="hasError" class="alert alert-danger">
      <strong>Error:</strong> {{ errorMessage }}
      <button @click="fetchAndSaveDashboardData" class="btn btn-sm btn-primary ms-2">
        Retry
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading dashboard data...</p>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else>
      <!-- Welcome Message -->
      <div class="row mb-4">
        <div class="col-12">
          <h4 class="text-primary">
            <small class="text-muted">
              Last updated: {{ dashboardData.lastUpdated }}
              <!-- <span class="badge bg-secondary">Auto-refreshing every 5 minutes</span> -->
            </small>
          </h4>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row">
        <!-- AllDailyTasks -->
        <div class="col-lg-3 col-md-6 col-12 d-flex align-items-stretch">
          <mini-statistics-card
            class="flex-fill"
            title="Total Daily Tasks"
            :value="`${dashboardData?.AllDailyTasks?.total || 0}`"
            :description="`
              <span class='text-sm font-weight-bolder text-success'>
                ${dashboardData?.AllDailyTasks?.active || 0}
              </span> Active
              <br>
              <span class='text-sm font-weight-bolder text-danger'>
                ${dashboardData?.AllDailyTasks?.inActive || 0}
              </span> Inactive
            `"
            :icon="{
              component: 'fa fa-tasks',
              background: 'bg-gradient-primary',
              shape: 'rounded-circle',
            }"
          />
        </div>

        <!-- DailyTasks -->
        <div class="col-lg-3 col-md-6 col-12 d-flex align-items-stretch">
          <mini-statistics-card
            class="flex-fill"
            title="Today's Daily Tasks"
            :value="`${dashboardData?.DailyTasks?.today_total_daily_tasks || 0}`"
            :description="`
            <span class='text-sm font-weight-bolder text-success'>
            ${dashboardData?.DailyTasks?.total_reports || 0} 
            </span> Reported
            <br>
              <span class='text-sm font-weight-bolder text-success'>
                ${dashboardData?.DailyTasks?.done_reports || 0}
              </span> Done / 
              <span class='text-sm font-weight-bolder text-danger'>
                ${dashboardData?.DailyTasks?.not_done_reports || 0}
              </span> Not Done
              <br>
              <span class='text-sm font-weight-bolder text-warning'>
                ${(dashboardData?.DailyTasks?.today_total_daily_tasks || 0) - (dashboardData?.DailyTasks?.total_reports || 0)}
              </span> Not Reported
            `"
            :icon="{
              component: 'fa fa-file-alt',
              background: 'bg-gradient-danger',
              shape: 'rounded-circle',
            }"
          />
        </div>

        <!-- Emps -->
        <div class="col-lg-3 col-md-6 col-12 d-flex align-items-stretch">
          <mini-statistics-card
            class="flex-fill"
            title="Employees"
            :value="`${dashboardData?.Emps?.invited || 0}`"
            :description="`
              <span class='text-sm font-weight-bolder text-success'>
                ${dashboardData?.Emps?.total || 0}
              </span> Active Employees <br>
              <span class='text-sm font-weight-bolder text-danger'>
                ${dashboardData?.Emps?.pending || 0}
              </span> Pending
            `"
            :icon="{
              component: 'ni ni-single-02',
              background: 'bg-gradient-success',
              shape: 'rounded-circle',
            }"
          />
        </div>

        <!-- Projects -->
        <div class="col-lg-3 col-md-6 col-12 d-flex align-items-stretch">
          <mini-statistics-card
            class="flex-fill"
            title="Projects"
            :value="`${dashboardData?.Projects?.total || 0}`"
            :description="`
              <span class='text-sm font-weight-bolder text-success'>
                ${dashboardData?.Projects?.active || 0}
              </span> Active Projects <br>
              <span class='text-sm font-weight-bolder text-danger'>
                ${dashboardData?.Projects?.inactive || 0}
              </span> Inactive
            `"
            :icon="{
              component: 'ni ni-building',
              background: 'bg-gradient-warning',
              shape: 'rounded-circle',
            }"
          />
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mt-4">
        <!-- First Chart -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header pb-0">
              <h6>Tasks Progress</h6>
              <!-- <p class="text-sm mb-0">
                <span class="text-success">
                  <i class="fa fa-arrow-up"></i>
                </span>
                <span class="font-weight-bold">Daily tasks distribution</span>
              </p> -->
            </div>
            <div class="card-body p-3">
              <gradient-line-chart
                v-if="!isLoading"
                id="chart-line"
                :chart="{
                  labels: (
                    dashboardData?.DailyTasks?.DailyTaskDepts || []
                  ).map((dept) => dept.department_name),
                  datasets: [
                    {
                      label: 'Done Tasks',
                      data: (
                        dashboardData?.DailyTasks?.DailyTaskDepts || []
                      ).map((dept) => dept.done_reports || 0),
                    },
                    {
                      label: 'Not Done Tasks',
                      data: (
                        dashboardData?.DailyTasks?.DailyTaskDepts || []
                      ).map((dept) => dept.not_done_reports || 0),
                    }
                  ],
                }"
              />
            </div>
          </div>
        </div>

        <!-- Second Chart -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header pb-0">
              <h6>Tasks Status</h6>
            </div>
            <div class="card-body p-3">
              <gradient-line-chart
                v-if="!isLoading"
                id="chart-line2"
                :chart="{
                  labels: (
                    dashboardData?.DailyTasks?.DailyTaskDepts || []
                  ).map((dept) => dept.department_name),
                  datasets: [
                    {
                      label: 'Reported Tasks',
                      data: (
                        dashboardData?.DailyTasks?.DailyTaskDepts || []
                      ).map((dept) => dept.total_reports || 0),
                    },
                    {
                      label: 'Not Reported Tasks',
                      data: (
                        dashboardData?.DailyTasks?.DailyTaskDepts || []
                      ).map((dept) => (dept.total_tasks || 0) - (dept.total_reports || 0)),
                    },
                  ],
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Data Tables Row -->
      <div class="row mt-4">
        <!-- Daily Tasks by Department Table -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header pb-0">
              <div class="row">
                <div class="col-8">
                  <h6>Daily Tasks by Department</h6>
                </div>
                <div class="col-4 text-end">
                  <button class="btn btn-sm btn-outline-primary mb-0" @click="fetchAndSaveDashboardData">
                    <i class="fa fa-sync-alt"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body px-0 pt-0 pb-2">
              <div class="table-responsive p-0">
                <table v-if="dashboardData" class="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Department
                      </th>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">
                        Tasks
                      </th>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">
                        Reported
                      </th>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">
                        Not Reported
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(dept, index) in dashboardData?.DailyTasks?.DailyTaskDepts || []" :key="index">
                      <td class="ps-4">
                        <h6 class="mb-0 text-sm">{{ dept.department_name || "N/A" }}</h6>
                      </td>
                      <td class="text-center">
                        <span class="text-secondary text-xs font-weight-bold">{{ dept.total_tasks || 0 }}</span>
                      </td>
                      <td class="text-center">
                        <span class="text-info text-xs font-weight-bold">{{ dept.total_reports || 0 }}</span>
                        <div class="text-xs">
                          (<span class="text-success">{{ dept.done_reports || 0 }}</span>/<span class="text-danger">{{ dept.not_done_reports || 0 }}</span>)
                        </div>
                      </td>
                      <td class="text-center">
                        <span class="text-secondary text-xs font-weight-bold">{{ (dept.total_tasks || 0) - (dept.total_reports || 0) }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Employees by Department Table -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header pb-0">
              <h6>Employees by Department</h6>
            </div>
            <div class="card-body px-0 pt-0 pb-2">
              <div class="table-responsive p-0">
                <table v-if="dashboardData" class="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Department
                      </th>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">
                        Employees
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(dept, index) in dashboardData?.Departments?.Departments || []" :key="index">
                      <td class="ps-4">
                        <h6 class="mb-0 text-sm">{{ dept.department_name || "N/A" }}</h6>
                      </td>
                      <td class="text-center">
                        <span class="text-secondary text-xs font-weight-bold">{{ dept.total_users || 0 }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
