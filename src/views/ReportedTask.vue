<!-- src/views/RoutineTask.vue -->
<script setup>
import { ref, computed, onBeforeMount, watch, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
import ReportedTaskTable from "@/views/components/ReportedTaskTable.vue";

const store = useStore();
const router = useRouter();
const route = useRoute();

const userData = computed(() => store.getters.user);
const departments = computed(() => store.getters.departments);
const isOwner = computed(() => store.getters.isOwner);

// Unified report status filter (for owner)
const activeQuery = reactive({
  // '', 'reported', 'not_reported', 'done', 'not_done'
  reportStatus: "",
});

const formattedDepartments = computed(() => {
  return departments.value.map((department) => ({
    value: department.id,
    label: department.name,
  }));
});

import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
} from "@/utils/permissions.js";

const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.id) || {}
);

// عند تحميل الصفحة لأول مرة، حفظ الصلاحيات في localStorage
onBeforeMount(async () => {
  if (!permissions.value || Object.keys(permissions.value).length === 0) {
    const extractedPermissions = extractPermissionsFromAPI(
      userData.value?.roles
    );
    permissions.value = extractedPermissions;
    savePermissionsToLocalStorage(permissions.value, userData.value?.id);
  }
  await store.dispatch("getCompanyUsers");
});

// const dataFromApi = computed(() => store.getters.dataFromApi);

// const employeeOptions = computed(() => {
//   return dataFromApi.value.map((employee) => ({
//     value: employee.id,
//     label: employee.name,
//   }));
// });

const showAlert = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showSuccess = ref(false);
const routineTaskName = ref(""); // تعديل المتغيرات
const showPopup = ref(false);
const routineTasksReport = ref([]); // تعديل المتغيرات
const notReportedTasks = ref([]);
const evaluatedTasks = ref([]);
const componentKey = ref(0);
const body = document.getElementsByTagName("body")[0];
const isLoading = ref(false);
const routineTaskDescription = ref(""); // تعديل المتغيرات
const startDate = ref("");
const fromDate = ref("");
const toDate = ref("");
const isNotReportedLoading = ref(false); // متغير تحميل خاص بـ Not Reported Tasks
const searchQuery = ref("");
const selectedDepartmentForNotReported = ref([]);
const dynamicDepartmentsForNotReported = ref([]);
const rundomTask = ref([]);


const selectedManager = ref("");
const taskType = ref("");
const dayOfMonth = ref("");
const deptId = ref("");
const taskTypeOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "last_day_of_month", label: "Last Day of Month" },
];

const recurrentDays = ref([]);

// دالة لإضافة أو إزالة اليوم من المصفوفة
const toggleRecurrentDay = (dayValue, isChecked) => {
  if (isChecked) {
    if (!recurrentDays.value.includes(dayValue)) {
      recurrentDays.value.push(dayValue);
    }
  } else {
    const index = recurrentDays.value.indexOf(dayValue);
    if (index > -1) {
      recurrentDays.value.splice(index, 1);
    }
  }
};

const getRundomTask = async () => {
  try {
    const response = await store.dispatch("getRundomTask");
    console.log("rundomTask dddd:", response.data);
    rundomTask.value = response.data;
  } catch (error) {
    console.error("Error fetching rundom task:", error);
  }
};

watch(
  () => recurrentDays.value,
  (newVal) => {
    console.log("Recurrent Days:", newVal);
  }
);

// غلق المودال
const closePopup = () => {
  showPopup.value = false;
  routineTaskName.value = "";
  routineTaskDescription.value = "";
  startDate.value = "";
  fromDate.value = "";
  toDate.value = "";
  selectedManager.value = "";
  taskType.value = "";
  dayOfMonth.value = "";
  deptId.value = "";
  recurrentDays.value = [];
};

onBeforeMount(async () => {
  body.classList.remove("bg-gray-100");
  const isRTL = store.getters.currentLanguage === "ar";
  document
    .querySelector("html")
    .setAttribute("lang", store.getters.currentLanguage);
  document.querySelector("html").setAttribute("dir", isRTL ? "rtl" : "ltr");
  document.querySelector("#app").classList.toggle("rtl", isRTL);
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");

  // initialize from URL
  if (route.query.reportStatus) {
    const rs = String(route.query.reportStatus);
    if (rs === 'reported' || rs === 'not_reported') {
      // tabs control reported/not_reported
      reportActiveTab.value = rs;
    } else if (rs === 'done' || rs === 'not_done') {
      // select controls done/not_done
      activeQuery.reportStatus = rs;
    }
  }

  await fetchTasksReports();
  await fetchNotReportedTasks();
  await fetchEvaluatedTasks();
  await getRundomTask();
});

// keep URL in sync
// keep URL in sync — moved below after reportActiveTab declaration to avoid TDZ

function resetReportStatus() {
  activeQuery.reportStatus = "";
}

const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

const selectedDateForNotReported = ref(new Date().toISOString().split("T")[0]);

const reportActiveTab = ref(
  sessionStorage.getItem("reportActiveTab") || "reported"
);

const setActiveTab = (tab) => {
  reportActiveTab.value = tab;
  sessionStorage.setItem("reportActiveTab", tab);
  console.log(reportActiveTab.value);
};

// keep URL in sync (after reportActiveTab is defined)
watch(
  [() => reportActiveTab.value, () => activeQuery.reportStatus],
  () => {
    const next = { ...route.query };
    if (reportActiveTab.value === 'reported' || reportActiveTab.value === 'not_reported') {
      next.reportStatus = reportActiveTab.value;
    } else if (activeQuery.reportStatus) {
      next.reportStatus = activeQuery.reportStatus;
    } else {
      delete next.reportStatus;
    }
    router.replace({ query: next });
  },
  { deep: false }
);

watch(
  () => reportActiveTab.value,
  () => {
    // Reset the date when tab switches
    const today = new Date().toISOString().split("T")[0];
    if (reportActiveTab.value === "reported") {
      selectedDate.value = today;
    } else {
      selectedDateForNotReported.value = today;
    }
  }
);

const fetchNotReportedTasks = async (
  date = selectedDateForNotReported.value
) => {
  selectedDateForNotReported.value = date;
  isNotReportedLoading.value = true;

  try {
    const response = await store.dispatch("fetchNotReportedTasks", date);
    console.log("response fetchNotReportedTasks:", response);

    if (response.status === 200) {
      notReportedTasks.value = store.getters.notReportedTasks.tasks;
      console.log(
        "response fetchNotReportedTaskssssssss:",
        notReportedTasks.value
      );


      buildDynamicDepartments();


      console.log("notReportedTasks:", notReportedTasks.value);
      componentKey.value += 1;
    }
  } catch (error) {
    showAlert.value = true;
    errorMessage.value = t("reportedTasks.generalError");
  } finally {
    isNotReportedLoading.value = false;
  }
};

const fetchEvaluatedTasks = async (date = selectedDateForNotReported.value) => {
  selectedDateForNotReported.value = date;
  isNotReportedLoading.value = true;

  try {
    const response = await store.dispatch("fetchEvaluatedTasks", date);
    console.log("response fetchEvaluatedTasks:", response);

    if (response.status === 200) {
      evaluatedTasks.value = store.getters.evaluatedTasks.data;
      console.log(
        "response fetchEvaluatedTasksسسسسسسسس:",
        evaluatedTasks.value
      );
      buildDynamicDepartments();

      componentKey.value += 1;
    }
  } catch (error) {
    showAlert.value = true;
    errorMessage.value = t("reportedTasks.generalError");
  } finally {
    isNotReportedLoading.value = false;
  }
};

const fetchTasksReports = async (date = selectedDateForNotReported.value) => {
  selectedDateForNotReported.value = date;
  isNotReportedLoading.value = true;

  try {
    const response = await store.dispatch("fetchTaskReports", date);
    console.log("response routineTasksReportttttttttttttt:", response);

    if (response.status === 200) {
      routineTasksReport.value = store.getters.routineTasksReports.reports;
      console.log(
        "response routineTasksReportttttttttttttt:",
        routineTasksReport.value
      );
      buildDynamicDepartments();

      componentKey.value += 1;
    }
  } catch (error) {
    showAlert.value = true;
    errorMessage.value = t("reportedTasks.generalError");
  } finally {
    isNotReportedLoading.value = false;
  }
};

watch(
  () => store.getters.routineTasksReports.reports,
  (newData) => {
    routineTasksReport.value = [...newData];
    componentKey.value += 1;
  }
);

// For storing selected departments in Not Reported tab
// const selectedDepartmentForNotReported = ref([]);

// Function that builds the unique departments from `notReportedTasks`
function buildDynamicDepartments() {
  const uniqueDepartments = new Map();

  if (reportActiveTab.value === "not_reported") {
    notReportedTasks.value.forEach((task) => {
      if (task.department && !uniqueDepartments.has(task.department.id)) {
        uniqueDepartments.set(task.department.id, {
          id: task.department.id,
          name: task.department.name,
        });
      }
    });
  } else if (reportActiveTab.value === "evaluated_Task") {
    evaluatedTasks.value.forEach((task) => {
      if (task.department && !uniqueDepartments.has(task.department.id)) {
        uniqueDepartments.set(task.department.id, {
          id: task.department.id,
          name: task.department.name,
        });
      }
    });
  } else if (reportActiveTab.value === "reported") {
    routineTasksReport.value.forEach((task) => {
      if (task.daily_task.department && !uniqueDepartments.has(task.daily_task.department.id)) {
        uniqueDepartments.set(task.daily_task.department.id, {
          id: task.daily_task.department.id,
          name: task.daily_task.department.name,
        });
      }
    });
  }

  dynamicDepartmentsForNotReported.value = Array.from(uniqueDepartments.values());
}

// 1) Watch when user switches tabs
watch(
  () => reportActiveTab.value,
  (newVal) => {
    if (newVal === "not_reported" || newVal === "evaluated_Task" || newVal === "reported") {
      buildDynamicDepartments();
    } else {
      dynamicDepartmentsForNotReported.value = [];
    }
  }
);

// 2) Watch notReportedTasks
watch(
  () => notReportedTasks.value,
  () => {
    if (reportActiveTab.value === "not_reported") {
      buildDynamicDepartments();
    }
  },
  { deep: true }
);

// 3) Watch evaluatedTasks
watch(
  () => evaluatedTasks.value,
  () => {
    if (reportActiveTab.value === "evaluated_Task") {
      buildDynamicDepartments();
    }
  },
  { deep: true }
);

// 4) Watch tasksReports
watch(
  () => routineTasksReport.value,
  () => {
    if (reportActiveTab.value === "reported") {
      buildDynamicDepartments();
    }
  },
  { deep: true }
);



// console.log("dynamicDepartmentsForNotReported:", dynamicDepartmentsForNotReported.value);

const { t } = useI18n();

const applyFilter = () => {
  console.log(
    "Applying filter for date:",
    reportActiveTab.value === "not_reported"
      ? selectedDateForNotReported.value
      : selectedDate.value
  );

  if (reportActiveTab.value === "not_reported") {
    isNotReportedLoading.value = true;
    fetchNotReportedTasks(selectedDateForNotReported.value);
  }

  if (reportActiveTab.value === "evaluated_Task") {
    isNotReportedLoading.value = true;
    fetchEvaluatedTasks(selectedDateForNotReported.value);
  }

  if (reportActiveTab.value === "reported") {
    isNotReportedLoading.value = true;
    fetchTasksReports(selectedDateForNotReported.value);
  }

};

const daysOfWeek = computed(() => [
  { label: t("reportedTasks.sunday"), value: 0 },
  { label: t("reportedTasks.monday"), value: 1 },
  { label: t("reportedTasks.tuesday"), value: 2 },
  { label: t("reportedTasks.wednesday"), value: 3 },
  { label: t("reportedTasks.thursday"), value: 4 },
  { label: t("reportedTasks.friday"), value: 5 },
  { label: t("reportedTasks.saturday"), value: 6 },
]);

// التعامل مع تغيير الصفحة
const handlePageChange = (page) => {
  fetchTasksReports(page);
};

const today = new Date().toISOString().split("T")[0];
const selectedDate = ref(today);

// Fetch departments on mount
onMounted(async () => {
  await store.dispatch("fetchDepartments");
  selectedDate.value = today;
  selectedDateForNotReported.value = today;
});

// Define userDepartment (alias for formattedDepartments)
const userDepartment = computed(() => formattedDepartments.value);

// Selected departments for filtering
const selectedDepartments = ref([]);
// const selectedDepartmentForNotReported = ref([]);

// Toggle "Select All" functionality
const toggleAllDepartments = (event) => {
  if (event.target.checked) {
    // Select all departments
    selectedDepartments.value = userDepartment.value.map((dept) => ({
      id: dept.value,
      name: dept.label,
    }));
  } else {
    // Deselect all departments
    selectedDepartments.value = [];
  }
};

// const toggleAllDepartmentsForNotReported = (event) => {
//   if (event.target.checked) {
//     // Select all departments
//     selectedDepartmentForNotReported.value = userDepartment.value.map((dept) => ({
//       id: dept.value,
//       name: dept.label,
//     }));
//   } else {
//     // Deselect all departments
//     selectedDepartmentForNotReported.value = [];
//   }
// };

// Check if all departments are selected
const areAllDepartmentsSelected = computed(() => {
  return selectedDepartments.value.length === userDepartment.value.length;
});

// Clear all departments
const clearAllDepartments = () => {
  selectedDepartments.value = [];
};

// Reset filters
const resetFilters = () => {
  // Clear department selections for both tabs
  // selectedDepartments.value = [];
  selectedDepartmentForNotReported.value = [];

  // Reset date for the active tab
  const today = new Date().toISOString().split("T")[0];
  if (reportActiveTab.value === "reported") {
    selectedDate.value = today;
  } else {
    selectedDateForNotReported.value = today;
  }

  // Rebuild departments for the active tab
  if (reportActiveTab.value === "not_reported" || reportActiveTab.value === "evaluated_Task" || reportActiveTab.value === "reported") {
    buildDynamicDepartments();
  } else {
    // If the user goes back to "reported", we can clear out the dynamic list
    dynamicDepartmentsForNotReported.value = [];
  }

  // Clear report status filter as well
  activeQuery.reportStatus = "";

  // Finally apply the filter
  applyFilter();
};


// // Filter departments for not reported tasks
// const uniqueDepartments = new Set();

// selectedDepartmentForNotReported.value = notReportedTasks.value.filter((dept) => {
//   const id = dept.department?.id;

//   if (!uniqueDepartments.has(id)) {
//     uniqueDepartments.add(id);
//     return true; // Include this department
//   }
//   return false; // Exclude this department
// }).map((dept) => ({
//   id: dept.department?.id,
//   name: dept.department?.name,
// }));

// const uniqueDepartmentsForNotReported = computed(() => {
//   return [...selectedDepartmentForNotReported.value];
// });

// console.log("uniqueDepartmentsForNotReported:", uniqueDepartmentsForNotReported.value);

// const searchMatch = (task) => {
//   const query = searchQuery.value.toLowerCase();
//   const taskName = (task.daily_task.task_name || "").toLowerCase();
//   const taskNo = (task.daily_task.task_no || "").toLowerCase();

//   return taskName.includes(query) || taskNo.includes(query);
// };

// For reported tasks: Add safety checks for `task.name`
const filteredTasks = computed(() => {
  const query = searchQuery.value.toLowerCase();

  return routineTasksReport.value.filter((task) => {
    const taskName = (task.daily_task.task_name || "").toLowerCase();
    const taskNo = (task.daily_task.task_no || "").toLowerCase();

    // Department match: if the user hasn't selected any department,
    // all departments are shown; otherwise, check if the task's department is selected
    const departmentMatch =
      selectedDepartmentForNotReported.value.length === 0 ||
      selectedDepartmentForNotReported.value.some(
        (dept) => dept.id === task.daily_task.department?.id
      );

    // Combine text-search filter with department filter
    return (taskName.includes(query) || taskNo.includes(query)) && departmentMatch;
  });
});

//task_no
// For non-reported tasks: Add safety checks for `task.name` or `task.description`
// In your <script setup>:
const filteredNotReportedTasks = computed(() => {
  const query = searchQuery.value.toLowerCase();

  return notReportedTasks.value.filter((task) => {
    const taskName = (task.daily_task.task_name || "").toLowerCase();
    const taskNo = (task.daily_task.task_no || "").toLowerCase();

    // Department match: if the user hasn't selected any department,
    // all departments are shown; otherwise, check if the task's department is selected
    const departmentMatch =
      selectedDepartmentForNotReported.value.length === 0 ||
      selectedDepartmentForNotReported.value.some(
        (dept) => dept.id === task.department?.id
      );

    // Combine text-search filter with department filter
    return (taskName.includes(query) || taskNo.includes(query)) && departmentMatch;
  });
});


// const filteredNotReportedTasksByDepartment = computed(() => {
//   // const query = searchQuery.value.toLowerCase();
//   return notReportedTasks.value.filter((task) => {
//     const taskDepartment = task.daily_task.department?.department_name || "";
//     return taskDepartment.includes(selectedDepartment.value.toLowerCase());
//   });
// });

// console.log("filteredNotReportedTasksByDepartment:", filteredNotReportedTasksByDepartment.value);

const filteredEvaluatedTasks = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return evaluatedTasks.value.filter((task) => {
    const taskName = (task.daily_task.task_name || "").toLowerCase();
    const taskNo = (task.daily_task.task_no || "").toLowerCase();

    // Department match: if the user hasn't selected any department,
    // all departments are shown; otherwise, check if the task's department is selected
    const departmentMatch =
      selectedDepartmentForNotReported.value.length === 0 ||
      selectedDepartmentForNotReported.value.some(
        (dept) => dept.id === task.department?.id
      );


    return (taskName.includes(query) || taskNo.includes(query)) && departmentMatch;
  });
});
</script>

<template>
  <div class="py-1 container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header pb-0">
            <p class="mb-0 font-weight-bold">{{ t("reportedTasks.reportedTasksTable") }}</p>

            <div class="row g-2 align-items-center">
              <!-- Tabs -->
              <div class="col">
                <ul class="nav custom-tabs flex-nowrap overflow-x-auto">
                  <li class="nav-item">
                    <argon-button class="nav-link" :class="{ active: reportActiveTab === 'reported' }"
                      @click="setActiveTab('reported')">
                      {{ t("reportedTasks.reported") }}
                    </argon-button>
                  </li>
                  <li class="nav-item">
                    <argon-button class="nav-link" :class="{ active: reportActiveTab === 'not_reported' }"
                      @click="setActiveTab('not_reported')">
                      {{ t("reportedTasks.not_reported") }}
                    </argon-button>
                  </li>
                  <li class="nav-item">
                    <argon-button class="nav-link" :class="{ active: reportActiveTab === 'evaluated_Task' }"
                      @click="setActiveTab('evaluated_Task')">
                      {{ t("reportedTasks.evaluated_Task") }}
                    </argon-button>
                  </li>
                </ul>
              </div>

              <!-- Search -->
              <div class="col-12 col-md-auto">
                <div class="input-group" style="max-width: 100%">
                  <input type="text" class="form-control" :placeholder="t('reportedTasks.searchPlaceholder')"
                    v-model="searchQuery" />
                </div>
              </div>

              <!-- Filter Button -->
              <div class="col-12 col-md-4 text-end">
                <button class="btn btn-link" type="button" data-bs-toggle="collapse" data-bs-target="#filterCollapse">
                  <i class="fas fa-filter"></i>
                </button>
              </div>
            </div>
            <!-- Owner-only report status quick filters moved to filter panel as select -->
            <!-- Filter Panel -->
            <div class="collapse" id="filterCollapse">
              <div class="card card-body">
                <div class="row">
                  <!-- Report Status (Owner only) -->
                  <div class="col-md-6 mb-3" v-if="isOwner">
                    <label class="form-label">{{ t("reportedTasks.status") }}</label>
                    <select class="form-select" v-model="activeQuery.reportStatus">
                      <option value="">{{ t("reportedTasks.allStatuses") }}</option>
                      <option value="reported">{{ t("reportedTasks.reported") }}</option>
                      <option value="not_reported">{{ t("reportedTasks.not_reported") }}</option>
                      <option value="done">{{ t("reportedTasks.done") }}</option>
                      <option value="not_done">{{ t("reportedTasks.notDone") }}</option>
                    </select>
                  </div>
                  <!-- Filter by Department (shown only in 'reported' tab) -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ t("reportedTasks.department") }}</label>
                    <div class="dropdown">
                      <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button"
                        id="departmentDropdown" data-bs-toggle="dropdown" aria-expanded="false" :aria-label="selectedDepartments.length === 0
                          ? 'All Departments'
                          : selectedDepartments.length === 1
                            ? selectedDepartments[0].name
                            : `${selectedDepartments.length} Departments Selected`
                          ">
                        {{
                          selectedDepartments.length === 0
                            ? t("reportedTasks.allDepartments")
                            : selectedDepartments.length === 1
                              ? selectedDepartments[0].name
                              : `${selectedDepartments.length} ${t("reportedTasks.departmentsSelected")}`
                        }}
                      </button>
                      <ul class="dropdown-menu w-100" aria-labelledby="departmentDropdown">
                        <!-- Select All Checkbox -->
                        <li class="px-2">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="selectAllDepartments"
                              :checked="areAllDepartmentsSelected" @change="toggleAllDepartments" />
                            <label class="form-check-label" for="selectAllDepartments">
                              {{ t("reportedTasks.selectAll") }}
                            </label>
                          </div>
                        </li>
                        <li class="px-2">
                          <button class="btn btn-link text-danger" @click="clearAllDepartments">
                            {{ t("reportedTasks.clearAll") }}
                          </button>
                        </li>
                        <li>
                          <hr class="dropdown-divider" />
                        </li>

                        <!-- Department Checkboxes -->
                        <!-- <li
                          v-for="department in userDepartment"
                          v-show="reportActiveTab === 'reported'"
                          :key="department.value"
                          class="px-2"
                        >
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              :id="'department-' + department.value"
                              :value="{
                                id: department.value,
                                name: department.label,
                              }"
                              v-model="selectedDepartments"
                            />
                            <label
                              class="form-check-label"
                              :for="'department-' + department.value"
                            >
                              {{ department.label }}
                            </label>
                          </div>
                        </li> -->
                        <li v-for="department in dynamicDepartmentsForNotReported"
                          v-show="reportActiveTab === 'not_reported' || reportActiveTab === 'evaluated_Task' || reportActiveTab === 'reported'"
                          :key="department.id" class="px-2">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox"
                              :id="'notreported-department-' + department.id" :value="department"
                              v-model="selectedDepartmentForNotReported" />
                            <label class="form-check-label" :for="'notreported-department-' + department.id">
                              {{ department.name }}
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Filter by Specific Date -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ t("reportedTasks.filterByDate") }}</label>
                    <div v-if="reportActiveTab === 'reported'">
                      <input type="date" class="form-control" v-model="selectedDateForNotReported"
                        @change="applyFilter" />
                    </div>
                    <div v-if="reportActiveTab === 'not_reported'">
                      <input type="date" class="form-control" v-model="selectedDateForNotReported"
                        @change="applyFilter" />
                    </div>
                    <div v-if="reportActiveTab === 'evaluated_Task'">
                      <input type="date" class="form-control" v-model="selectedDateForNotReported"
                        @change="applyFilter" />
                    </div>
                  </div>
                </div>

                <!-- Reset Filters -->
                <div class="d-flex justify-content-end">
                  <button class="btn btn-outline-secondary me-2" v-if="activeQuery.reportStatus"
                    @click="resetReportStatus">
                    {{ t("reportedTasks.resetFilters") }}
                  </button>
                  <button class="btn btn-secondary" @click="resetFilters">
                    {{ t("reportedTasks.resetFilters") }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- alert for errors and success -->
          <div class="card-body">
            <form @submit.prevent>
              <argon-alert v-if="showAlert" color="danger" dismissible class="mt-3">
                {{ errorMessage }}
              </argon-alert>
              <argon-alert v-if="showSuccess" color="success" dismissible class="mt-3">
                {{ successMessage }}
              </argon-alert>
            </form>

            <div v-if="isLoading" class="d-flex justify-content-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <ReportedTaskTable v-else :routineTasksReport="filteredTasks" :notReportedTasks="filteredNotReportedTasks"
              :evaluatedTasks="filteredEvaluatedTasks" :reportActiveTab="reportActiveTab"
              :isNotReportedLoading="isNotReportedLoading" :selectedDateForNotReported="selectedDateForNotReported"
              :selectedDate="selectedDate" :rundomTask="rundomTask" :active-query="activeQuery" :key="componentKey"
              @page-changed="handlePageChange" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Routine Task Modal -->
  <div v-if="showPopup" class="popup-overlay">
    <transition name="modal-fade">
      <ArgonModal v-if="showPopup" :title="t('reportedTasks.createRoutineTask')" @close="closePopup"
        class="routine-task-modal">
        <template #default>
          <div class="modal-content-scroll">
            <div class="form-group mb-3">
              <label class="form-label">{{ t("reportedTasks.routineTaskName") }}:</label>
              <input v-model="routineTaskName" class="form-control"
                :placeholder="t('reportedTasks.enterRoutineTaskName')" />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("reportedTasks.description") }}:</label>
              <textarea v-model="routineTaskDescription" class="form-control"
                :placeholder="t('reportedTasks.enterDescription')"></textarea>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("reportedTasks.taskType") }}:</label>
              <argon-select v-model="taskType" :options="taskTypeOptions"
                :placeholder="t('reportedTasks.selectTaskType')" class="form-control" />
            </div>

            <div v-show="taskType === 'weekly'" class="form-group mb-3">
              <label class="form-label">{{ t("reportedTasks.recurrentDays") }}:</label>
              <div class="d-flex flex-wrap">
                <div v-for="day in daysOfWeek" :key="day.value" class="form-check me-3">
                  <argon-checkbox :id="'day-' + day.value" :name="'recurrentDays'" :value="day.value"
                    :modelValue="recurrentDays" @update:modelValue="
                      (checked) => toggleRecurrentDay(day.value, checked)
                    ">
                    {{ day.label }}
                  </argon-checkbox>
                </div>
              </div>
            </div>

            <div v-show="taskType === 'monthly'" class="form-group mb-3">
              <label class="form-label">{{ t("reportedTasks.dayOfMonth") }}:</label>
              <input type="number" v-model="dayOfMonth" class="form-control"
                :placeholder="t('reportedTasks.enterDayOfMonth')" min="1" max="31" />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("reportedTasks.department") }}:</label>
              <argon-select v-model="deptId" :options="formattedDepartments"
                :placeholder="t('reportedTasks.selectDepartment')" class="form-control" searchable
                searchPlaceholder="Search departments..." />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("reportedTasks.startDate") }}:</label>
              <input type="date" v-model="startDate" class="form-control"
                :placeholder="t('reportedTasks.enterStartDate')" />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("reportedTasks.from") }}:</label>
              <input type="time" v-model="fromDate" class="form-control" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">{{ t("reportedTasks.to") }}:</label>
              <input type="time" v-model="toDate" class="form-control" />
            </div>
          </div>
        </template>

        <template #footer>
          <argon-button variant="success" @click="addRoutineTask" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isLoading ? t("reportedTasks.saving") : t("reportedTasks.create") }}
          </argon-button>
          <argon-button variant="secondary" @click="closePopup">
            {{ t("reportedTasks.close") }}
          </argon-button>
        </template>
      </ArgonModal>
    </transition>
  </div>
</template>

<style>
/* تأثيرات الظهور والإخفاء */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* الإعدادات المتقدمة */
.advanced-settings {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
  background-color: #f9f9f9;
}

/* كلاس مخصص للمودال لجعله قابلًا للتمرير */
.routine-task-modal {
  max-height: 100vh;
  /* تحديد الحد الأقصى للارتفاع */
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  /* تمكين التمرير العمودي */
  scrollbar-width: none;
  /* تحديد حجم الشريط الخلفي */
  scrollbar-color: transparent transparent;
  /* تحديد لون الشريط الخلفي والخلفية */
}

.routine-task-modal .modal-content-scroll {
  overflow-y: auto;
  /* تمكين التمرير العمودي */
  flex: 1;
  /* السماح للمحتوى بالتمدد لملء المساحة المتاحة */
  max-height: 80vh;
  max-height: 65vh;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.routine-task-modal .modal-header,
.routine-task-modal .modal-footer {
  flex-shrink: 0;
}

.routine-task-modal .modal-body {
  flex: 1;
}

/* Ensure Swal appears above other elements */
.swal2-container {
  z-index: 100000 !important;
}

.swal-above-modal {
  z-index: 100001 !important;
}

/* تصميم الـ tabs */
.custom-tabs {
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

.custom-tabs .nav-item {
  margin-right: 1rem;
}

.custom-tabs .nav-link {
  display: flex;
  align-items: center;
  color: #a9ca5c;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background-color: transparent;
  transition:
    color 0.3s ease,
    background-color 0.3s ease;
}

.custom-tabs .nav-link.active {
  color: #ffffff;
  /* نص أبيض */
  border-radius: 5px;
  background-color: #a9ca5c;
  /* خلفية أخضر فاتح */
}

.custom-tabs .nav-link:hover {
  color: #ffffff;
  background-color: #a9ca5c;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .custom-tabs {
    overflow-x: auto;
    white-space: nowrap;
  }

  .nav-item {
    display: inline-block;
    float: none;
  }

  .input-group {
    max-width: 100% !important;
  }
}
</style>
