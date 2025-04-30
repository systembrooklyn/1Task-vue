// Dashboard.vue
<script setup>
import { onBeforeMount, ref, computed } from "vue";
import MiniStatisticsCard from "@/examples/Cards/MiniStatisticsCard.vue";
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";
// import Carousel from "./components/Carousel.vue";
import { useStore } from "vuex";

const store = useStore();
// const userName = computed(() => store.getters.userName);

const isLoading = ref(true);  // Flag to control the loading state
const dashboardData = computed(() => store.getters.dashboardData || {
  AllDailyTasks: { active: 0, inActive: 0, total: 0 },
  DailyTasks: {
    DailyTaskDepts: [],
    done_reports: 0,
    not_done_reports: 0,
    total_reports: 0,
  },
  Departments: { Departments: [], total: 0 },
  Emps: { invited: 0, pending: 0, total: 0 },
});

const fetchDashboardData = async () => {
  try {
    await store.dispatch("fetchDashboardData");
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;  // Set loading to false once data is fetched
  }
};

onBeforeMount(async () => {
  await fetchDashboardData();
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div v-if="!isLoading">
      <!-- If data is loaded, display dashboard content -->
      <div class="row">
        <!-- <h4>Welcome, {{ userName }}</h4> -->
        <div class="col-lg-12">
          <!-- Statistics Cards -->
          <div class="row">
            <!-- AllDailyTasks -->
            <div class="col-lg-3 col-md-6 col-12 d-flex align-items-stretch">
              <mini-statistics-card
                v-if="!isLoading"
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
                v-if="!isLoading"
                class="flex-fill"
                title="Today's Reports"
                :value="`${dashboardData?.DailyTasks?.today_total_daily_tasks || 0}`"
                :description="`
                <span class='text-sm font-weight-bolder '>
                  ${dashboardData?.DailyTasks?.total_reports || 0}
                </span> 
                  (<span class='text-sm font-weight-bolder text-success'>
                    ${dashboardData?.DailyTasks?.done_reports || 0}
                  </span> Done  /
                  <span class='text-sm font-weight-bolder text-danger'>
                    ${dashboardData?.DailyTasks?.not_done_reports || 0}
                  </span> not Done) <br>
                  <span class='text-sm font-weight-bolder text-danger'>
                    ${dashboardData?.DailyTasks?.today_total_daily_tasks -  dashboardData?.DailyTasks?.total_reports || 0}
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
                v-if="!isLoading"
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
                v-if="!isLoading"
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

          <!-- Charts & Carousel Row -->
          <div class="row mt-4">
            <div class="col-lg-6 mb-lg">
              <div class="card z-index-2">
                <gradient-line-chart
                  v-if="!isLoading"
                  id="chart-line"
                  title="Tasks Progress"
                  description="Daily tasks distribution"
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
            <div class="col-lg-6 mb-lg mt-4 mt-lg-0">
              <div class="card z-index-2">
                <gradient-line-chart
                  v-if="!isLoading"
                  id="chart-line2"
                  title="Tasks Progress"
                  description="Daily tasks distribution"
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
                        ).map((dept) => dept.total_tasks - (dept.total_reports || 0) || 0),
                      }
                    ],
                  }"
                />
              </div>
            </div>
            <div class="col-lg-5">
              <!-- Carousel component (if any) -->
            </div>
          </div>

          <!-- Departments Tables -->
          <div class="row mt-4">
            <!-- Daily Tasks by Department -->
            <div class="col-lg-7 mb-lg-0 mb-4">
              <div class="card">
                <div class="p-3 pb-0 card-header">
                  <h6 class="mb-2">Daily Tasks by Department</h6>
                </div>
                <div class="table-responsive">
                  <table class="table align-items-center">
                    <thead>
                      <tr>
                        <th class="text-center">Department</th>
                        <th class="text-center">Total Tasks</th>
                        <th class="text-center">Done Tasks</th>
                        <th class="text-center">not Done Tasks</th>
                        <th class="text-center">Reported</th>
                        <th class="text-center">Not Reported</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(dept, index) in dashboardData?.DailyTasks
                          ?.DailyTaskDepts || []"
                        :key="index"
                      >
                        <td class="text-center">
                          {{ dept.department_name || "N/A" }}
                        </td>
                        <td class="text-center">{{ dept.total_tasks || 0 }}</td>
                        <td class="text-center text-success">
                          {{ dept.done_reports || 0 }}
                        </td>
                        <td class="text-center text-danger">
                          {{ dept.not_done_reports || 0 }}
                        </td>
                        <td class="text-center">
                          {{ dept.total_reports || 0 }}
                        </td>
                        <td class="text-center">
                          {{ dept.total_tasks - dept.total_reports || 0 }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Department Users -->
            <div class="col-lg-5">
              <div class="card h-100">
                <div class="p-3 pb-0 card-header">
                  <h6 class="mb-2">Departments Overview</h6>
                </div>
                <div class="table-responsive">
                  <table class="table align-items-center">
                    <thead>
                      <tr>
                        <th class="text-center">Department ({{ dashboardData?.Departments?.total || 0 }})</th>
                        <th class="text-center">Users ({{ dashboardData?.Emps?.total || 0 }})</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(dept, index) in dashboardData?.Departments
                          ?.Departments || []"
                        :key="index"
                      >
                        <td class="text-center">
                          {{ dept.department_name || "N/A" }}
                        </td>
                        <td class="text-center">{{ dept.total_users || 0 }}</td>
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

    <!-- Skeleton Loader if data is loading -->
    <div v-else class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>
