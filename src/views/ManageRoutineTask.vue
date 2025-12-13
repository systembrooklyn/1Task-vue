// src/views/ManageRoutineTask.vue

<script setup>
import { ref, computed, onBeforeMount, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
// import ArgonInput from "@/components/ArgonInput.vue";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
// import LanguageSwitcher from "@/views/components/LanguageSwitcher.vue";
import ManageRoutineTaskTable from "@/views/components/ManageRoutineTaskTable.vue";
// import ArgonSwitch from "@/components/ArgonSwitch.vue";
import Swal from "sweetalert2";

onMounted(async () => {
  await store.dispatch("fetchDepartments");
  await store.dispatch("fetchProjects");
});

const store = useStore();

const userData = computed(() => store.getters.user);
const departments = computed(() => store.getters.departments);
const projects = computed(() => store.getters.projects);
console.log("projectssssssssssss:", projects.value);

const formattedDepartments = computed(() => {
  return departments.value.map((department) => ({
    value: department.id,
    label: department.name,
  }));
});

const formattedProjects = computed(() => {
  return projects.value.map((project) => ({
    value: project.id,
    label: project.name,
  }));
});

console.log("formattedProjectsssssssssss:", formattedProjects.value);

import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
  hasPermission,
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

const dataFromApi = computed(() => store.getters.dataFromApi);

const employeeOptions = computed(() => {
  return dataFromApi.value.map((employee) => ({
    value: employee.id,
    label: `${employee.first_name ?? employee.name ?? ''} ${employee.last_name ?? ''}`.trim(),
  }));
});

console.log("employeeOptions:", employeeOptions.value);

const isOwner = computed(() => store.getters.isOwner);

const canCreateRoutineTask = computed(
  () => hasPermission(permissions.value, "create-dailytask") // تعديل صلاحية
);

const showAlert = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showSuccess = ref(false);
const routineTaskName = ref(""); // تعديل المتغيرات
const showPopup = ref(false);
const allroutineTasks = ref([]); // تعديل المتغيرات
const componentKey = ref(0);
const body = document.getElementsByTagName("body")[0];
const isLoading = ref(false);
const routineTaskDescription = ref(""); // تعديل المتغيرات
const startDate = ref("");
const fromDate = ref("");
const toDate = ref("");
// const showAdvancedSettings = ref(false);
const selectedManager = ref("");
const searchQuery = ref("");

// const routineTaskStatus = ref(false); // تعديل المتغيرات
const taskType = ref("");
const dayOfMonth = ref("");
const deptId = ref("");
const projectId = ref("");
const taskTypeOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "last_day_of_month", label: "Last Day of Month" },
];

const priority = ref("");
const prioritiesOptions = [
  { value: "normal", label: "Normal" },
  { value: "critical", label: "Critical" },
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

// مراقبة التغييرات في `recurrentDays`
watch(
  () => recurrentDays.value,
  (newVal) => {
    console.log("Recurrent Days:", newVal);
    // يمكنك إضافة أي عملية أخرى هنا بناءً على التغييرات
  }
);

// Modify pagination configuration
const pagination = ref({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
});

// فلتر: نوع المهمة
const selectedTaskType = ref("");
// فلتر: حالة المهمة
const selectedStatus = ref("");
// فلتر: الأقسام المختارة
const selectedDepartments = ref([]);
// فلتر: المشروعات المختارة
const selectedProjects = ref([]);

const selectedPriority = ref("");


// التحكم في الإعدادات المتقدمة
// const toggleAdvancedSettings = () => {
//   showAdvancedSettings.value = !showAdvancedSettings.value;
// };

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
  projectId.value = "";
  priority.value = "";
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

  await fetchRoutineTasks(); // تعديل الدالة
});

const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

const currentUserId = computed(() => store.getters.userId);
console.log("currentUserId:", currentUserId.value);
// Modify fetchRoutineTasks to get all data
const fetchRoutineTasks = async () => {
  isLoading.value = true;
  // طلب الـ API أو Vuex
  const response = await store.dispatch("fetchAllRoutineTasks");
  if (response.status === 200) {
    // كل المهام
    allroutineTasks.value = store.getters.allRoutineTasks.tasks;
    // حساب عدد الصفحات أوّل مرة
    pagination.value.total = allroutineTasks.value.length;
    pagination.value.last_page = Math.ceil(
      allroutineTasks.value.length / pagination.value.per_page
    );
  } else {
    console.error("Error fetching tasks:", response);
  }
  isLoading.value = false;
};

const filteredTasks = computed(() => {
  // خد نسخة من المهام عشان ما تعملش تعديل على الأصل
  let tasks = [...allroutineTasks.value];

  // 1. فلتر حسب الـ taskType (لو مش فاضي)
  if (selectedTaskType.value) {
    tasks = tasks.filter((t) => t.task_type === selectedTaskType.value);
  }

  // 2. فلتر حسب حالة المهمة (active / inactive - على حسب هي متخزنة إزاي)
  //   - انتبه لطريقة تخزين الحالة في الـ API: هل هي active/inactive boolean ولا status= 'done'/'not_done'...؟
  if (selectedStatus.value) {
    if (selectedStatus.value === "active") {
      tasks = tasks.filter((t) => t.active === true);
    } else if (selectedStatus.value === "inactive") {
      tasks = tasks.filter((t) => t.active === false);
    }
    // أو لو عندك منطق مختلف للـ status، عدّله هنا
  }

  // 3. فلتر حسب الأقسام المختارة
  if (selectedDepartments.value.length > 0) {
    const selectedDeptIds = selectedDepartments.value.map((dept) => dept.id);
    tasks = tasks.filter((task) => {
      // تأكد الـ task.dept_id ضمن الـ selectedDeptIds
      return selectedDeptIds.includes(task.department?.dept_id);
    });
  }

  // 5. فلتر حسب المشروعات المختارة
  if (selectedProjects.value.length > 0) {
    const selectedProjectIds = selectedProjects.value.map(
      (project) => project.id
    );
    console.log("selectedProjectIds:", selectedProjectIds);
    tasks = tasks.filter((task) => {
      // تأكد الـ task.project_id ضمن الـ selectedProjectIds
      return selectedProjectIds.includes(task.project?.id);
    });
  }

  // 6. فلتر حسب الأولوية المختارة
  if (selectedPriority.value) {
    tasks = tasks.filter((t) => t.priority === selectedPriority.value);
  }

  // search
  tasks = tasks.filter((task) => searchMatch(task));

  return tasks;
});

watch(
  () => filteredTasks.value.length,
  (newLength) => {
    // Update pagination data here (instead of inside computed)
    pagination.value.total = newLength;
    pagination.value.last_page = Math.ceil(
      newLength / pagination.value.per_page
    );

    // If current page is now out of range, reset to last valid page
    if (pagination.value.current_page > pagination.value.last_page) {
      pagination.value.current_page = pagination.value.last_page || 1;
    }
  },
  { immediate: true }
);

// Add computed for paginated data
const paginatedTasks = computed(() => {
  const start = (pagination.value.current_page - 1) * pagination.value.per_page;
  const end = start + pagination.value.per_page;
  return filteredTasks.value.slice(start, end);
});

// Update page change handler
const handlePageChange = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page;
  }
};

watch(
  () => store.getters.allRoutineTasks.tasks, // تعديل الـ getter
  (newData) => {
    allroutineTasks.value = [...newData];
    componentKey.value += 1; // إعادة تحميل المكون عند حدوث أي تحديث في البيانات
  }
);

const { t } = useI18n();

const openPopup = () => {
  showPopup.value = true;
};

const addRoutineTask = async () => {
  isLoading.value = true;
  const routineTask = {
    task_name: routineTaskName.value,
    description: routineTaskDescription.value,
    start_date: startDate.value,
    task_type: taskType.value,
    recurrent_days: recurrentDays.value,
    day_of_month: dayOfMonth.value,
    from: fromDate.value,
    to: toDate.value,
    dept_id: deptId.value,
    project_id: projectId.value,
    assigned_to: selectedManager.value,
    priority: priority.value,
  };

  console.log("routineTask:", routineTask);

  try {
    const response = await store.dispatch("addRoutineTask", routineTask);
    if (response.status === 201) {
      Swal.fire({
        icon: "success",
        title: t("manageRoutineTasks.routineTaskAdded"),
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      closePopup();
      await fetchRoutineTasks();
      componentKey.value += 1;
    }
  } catch (error) {
    console.log("error:", error);
    // استخراج الأخطاء من الرد

    Swal.fire({
      icon: "warning",
      title: t("manageRoutineTasks.errorOccurred"),
      html: error,
      showConfirmButton: true,
      backdrop: "rgba(0,0,0,0.5)",
      heightAuto: false,
      customClass: {
        popup: "swal-above-modal",
      },
    });
  } finally {
    isLoading.value = false;
  }
};

const daysOfWeek = computed(() => [
  { label: t("manageRoutineTasks.sunday"), value: 0 },
  { label: t("manageRoutineTasks.monday"), value: 1 },
  { label: t("manageRoutineTasks.tuesday"), value: 2 },
  { label: t("manageRoutineTasks.wednesday"), value: 3 },
  { label: t("manageRoutineTasks.thursday"), value: 4 },
  { label: t("manageRoutineTasks.friday"), value: 5 },
  { label: t("manageRoutineTasks.saturday"), value: 6 },
]);

// التعامل مع تغيير الصفحة
// const handlePageChange = (page) => {
//   fetchRoutineTasks(page);
// };

// Filter variables
// const selectedTaskType = ref('');
// const selectedDepartments = ref([]);
console.log("formattedDepartments:", formattedDepartments.value);
const toggleAllDepartments = () => {
  if (selectedDepartments.value.length === formattedDepartments.value.length) {
    // If all are selected, deselect all
    selectedDepartments.value = [];
  } else {
    // Select all departments
    selectedDepartments.value = formattedDepartments.value.map((dept) => ({
      id: dept.value,
      name: dept.label,
    }));
  }
};

// 4. فلتر حسب المشروعات المختارة
const toggleAllProjects = () => {
  if (selectedProjects.value.length === formattedProjects.value.length) {
    selectedProjects.value = [];
  } else {
    selectedProjects.value = formattedProjects.value.map((project) => ({
      id: project.value,
      name: project.label,
    }));
  }
};

// const applyFilters = () => {
//   // Implement filter logic
//   const filters = {
//     task_type: selectedTaskType.value,
//     dept_filter: selectedDepartments.value.map(dept => dept.id)
//   };

//   console.log("Filters:", filters);

//   // Dispatch action to fetch filtered routine tasks
//   store.dispatch('fetchRoutineTasks', { filters });
// };

const resetFilters = () => {
  // Reset all filter variables
  selectedTaskType.value = "";
  selectedDepartments.value = [];
  selectedProjects.value = [];
  selectedStatus.value = "";
  selectedPriority.value = "";

  // Fetch all routine tasks without filters
  store.dispatch("fetchRoutineTasks");
};

// search
const searchMatch = (task) => {
  const query = searchQuery.value.toLowerCase();
  const taskName = (task.task_name || "").toLowerCase();
  const taskNo = (task.task_no || "").toLowerCase();

  return taskName.includes(query) || taskNo.includes(query);
};
</script>

<template>
  <!-- <LanguageSwitcher /> -->
  <div class="py-1 container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header pb-0">
            <div class="container">
              <div class="row align-items-center">
                <!-- القسم الأيسر: العنوان وزر الإضافة -->
                <div class="col-12 col-md-4 d-flex align-items-center">
                  <p class="mb-0 font-weight-bold me-2">
                    {{ t("manageRoutineTasks.routineTasksTable") }}
                  </p>
                  <argon-button v-show="canCreateRoutineTask || isOwner" @click="openPopup">
                    <i class="fas fa-plus"></i>
                  </argon-button>
                </div>

                <!-- القسم الأوسط: شريط البحث -->
                <div class="col-12 col-md-4 text-center my-2 my-md-0">
                  <div class="input-group" style="max-width: 100%">
                    <input type="text" class="form-control" :placeholder="t('manageRoutineTasks.searchPlaceholder')"
                      v-model="searchQuery" />
                  </div>
                </div>

                <!-- القسم الأيمن: زر الفلتر -->
                <div class="col-12 col-md-4 text-md-end text-end">
                  <button class="btn btn-link" type="button" data-bs-toggle="collapse" data-bs-target="#filterCollapse"
                    aria-expanded="false" aria-controls="filterCollapse">
                    <i class="fas fa-filter"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="collapse" id="filterCollapse">
              <div class="card card-body">
                <div class="row">
                  <!-- Filter by Task Type -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("manageRoutineTasks.taskType") }}</label>
                    <select class="form-select" v-model="selectedTaskType">
                      <option value="">{{ t("manageRoutineTasks.allTypes") }}</option>
                      <option value="weekly">{{ t("manageRoutineTasks.weekly") }}</option>
                      <option value="monthly">{{ t("manageRoutineTasks.monthly") }}</option>
                      <option value="daily">{{ t("manageRoutineTasks.daily") }}</option>
                      <option value="last_day_of_month">
                        {{ t("manageRoutineTasks.last_day_of_month") }}
                      </option>
                    </select>
                  </div>

                  <!-- Filter by Status -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("manageRoutineTasks.status") }}</label>
                    <select class="form-select" v-model="selectedStatus">
                      <option value="">{{ t("manageRoutineTasks.allStatuses") }}</option>
                      <option value="active">{{ t("manageRoutineTasks.active") }}</option>
                      <option value="inactive">{{ t("manageRoutineTasks.inactive") }}</option>
                    </select>
                  </div>

                  <!-- Filter by Priority -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("manageRoutineTasks.priority") }}</label>
                    <select class="form-select" v-model="selectedPriority">
                      <option value="">{{ t("manageRoutineTasks.allPriorities") }}</option>
                      <option value="normal">{{ t("manageRoutineTasks.normal") }}</option>
                      <option value="critical">{{ t("manageRoutineTasks.critical") }}</option>
                    </select>
                  </div>

                  <!-- Filter by Department -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("manageRoutineTasks.department") }}</label>
                    <div class="dropdown">
                      <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button"
                        id="departmentDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        {{
                          selectedDepartments.length === 0
                            ? t("manageRoutineTasks.allDepartments")
                            : selectedDepartments.length === 1
                              ? selectedDepartments[0].name
                              : `${selectedDepartments.length} ${t("manageRoutineTasks.departmentsSelected")}`
                        }}
                      </button>
                      <ul class="dropdown-menu w-100" aria-labelledby="departmentDropdown">
                        <li class="px-2">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="selectAllDepartments" :checked="selectedDepartments.length ===
                              formattedDepartments.length
                              " @change="toggleAllDepartments" />
                            <label class="form-check-label" for="selectAllDepartments">
                              {{ t("manageRoutineTasks.selectAll") }}
                            </label>
                          </div>
                        </li>
                        <li>
                          <hr class="dropdown-divider" />
                        </li>
                        <li v-for="department in formattedDepartments" :key="department.value" class="px-2">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" :id="'department-' + department.value"
                              :value="{
                                id: department.value,
                                name: department.label,
                              }" v-model="selectedDepartments" />
                            <label class="form-check-label" :for="'department-' + department.value">
                              {{ department.label }}
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <!-- toggleAllProjects -->

                  <!-- filter by project -->

                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("manageRoutineTasks.project") }}</label>
                    <div class="dropdown">
                      <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button"
                        id="projectDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        {{
                          selectedProjects.length === 0
                            ? t("manageRoutineTasks.allProjects")
                            : selectedProjects.length === 1
                              ? selectedProjects[0].name
                              : `${selectedProjects.length} ${t("manageRoutineTasks.projectsSelected")}`
                        }}
                      </button>
                      <ul class="dropdown-menu w-100" aria-labelledby="projectDropdown">
                        <li class="px-2">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="selectAllProjects" :checked="selectedProjects.length ===
                              formattedProjects.length
                              " @change="toggleAllProjects" />
                            <label class="form-check-label" for="selectAllProjects">
                              {{ t("manageRoutineTasks.selectAll") }}
                            </label>
                          </div>
                        </li>
                        <li>
                          <hr class="dropdown-divider" />
                        </li>
                        <li v-for="project in formattedProjects" :key="project.value" class="px-2">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" :id="'project-' + project.value" :value="{
                              id: project.value,
                              name: project.label,
                            }" v-model="selectedProjects" />
                            <label class="form-check-label" :for="'project-' + project.value">
                              {{ project.label }}
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <!-- <button 
                    class="btn btn-primary me-2" 
                    @click="applyFilters"
                  >
                    {{ t("applyFilters") }}
                  </button> -->
                  <button class="btn btn-secondary" @click="resetFilters">
                    {{ t("manageRoutineTasks.resetFilters") }}
                  </button>
                </div>
              </div>
            </div>
          </div>
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

            <div v-else-if="allroutineTasks.length === 0"
              class="d-flex justify-content-center py-5 flex-column align-items-center">
              <h5>{{ t("manageRoutineTasks.noRoutineTasks") }}</h5>
              <!-- تعديل الترجمة -->
              <p>
                {{ t("manageRoutineTasks.createee") }}
              </p>
            </div>
            <ManageRoutineTaskTable v-else :allroutineTasks="paginatedTasks" :key="componentKey"
              @page-changed="handlePageChange" :pagination="pagination" />
            <!-- تعديل المكون والخصائص -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- create routine task popup -->
  <div v-if="showPopup" class="popup-overlay">
    <transition name="modal-fade">
      <ArgonModal v-if="showPopup" :title="t('manageRoutineTasks.createRoutineTask')" @close="closePopup" class="routine-task-modal">
        <template #default>
          <div class="modal-content-scroll">
            <!-- غلاف للمحتوى -->
            <div class="form-group mb-3">
              <label class="form-label">{{ t("manageRoutineTasks.routineTaskName") }}:</label>
              <input v-model="routineTaskName" class="form-control" :placeholder="t('manageRoutineTasks.enterRoutineTaskName')" />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("manageRoutineTasks.description") }}:</label>
              <textarea v-model="routineTaskDescription" class="form-control"
                :placeholder="t('manageRoutineTasks.enterDescription')"></textarea>
            </div>

            <!-- الحقول الجديدة -->
            <div class="form-group mb-3">
              <label class="form-label">{{ t("manageRoutineTasks.taskType") }}:</label>
              <argon-select v-model="taskType" :options="taskTypeOptions" :placeholder="t('manageRoutineTasks.selectTaskType')"
                class="form-control" />
            </div>

            <!-- <div class="form-group mb-3">
            <label class="form-label">{{ t("recurrentDays") }}:</label>
            <input
              type="date"
              v-model="recurrentDays"
              class="form-control"
              :placeholder="t('enterRecurrentDays')"
              min="1"
            />
          </div> -->

            <!-- select box for weekly task -->
            <div v-show="taskType === 'weekly'" class="form-group mb-3">
              <label class="form-label">{{ t("manageRoutineTasks.recurrentDays") }}:</label>
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
              <label class="form-label">{{ t("manageRoutineTasks.dayOfMonth") }}:</label>
              <input type="number" v-model="dayOfMonth" class="form-control" :placeholder="t('manageRoutineTasks.enterDayOfMonth')" min="1"
                max="31" />
            </div>

            <!-- select Department -->
            <div class="form-group mb-3">
              <label class="form-label">{{ t("manageRoutineTasks.department") }}:</label>
              <argon-select v-model="deptId" :options="formattedDepartments" :placeholder="t('manageRoutineTasks.selectDepartment')"
                class="form-control" />
            </div>

            <!-- select project -->
            <div class="form-group mb-3">
              <label class="form-label">{{ t("manageRoutineTasks.project") }}:</label>
              <argon-select v-model="projectId" :options="formattedProjects" :placeholder="t('manageRoutineTasks.selectProject')"
                class="form-control" />
            </div>

            <!-- أولوية (نصف العرض) -->
            <div class=" mb-3">
              <label class="form-label">{{ t("manageRoutineTasks.priority") }}:</label>
              <argon-select v-model="priority" :options="prioritiesOptions" :placeholder="t('manageRoutineTasks.selectPriority')"
                class="form-control" searchable searchPlaceholder="Search priorities..." required />
            </div>

            <!-- start date -->
            <div class="form-group mb-3">
              <label class="form-label">{{ t("manageRoutineTasks.startDate") }}:</label>
              <input type="date" v-model="startDate" class="form-control" :placeholder="t('manageRoutineTasks.enterStartDate')" min="1"
                max="31" />
            </div>

            <!-- زر الإعدادات المتقدمة -->
            <div class="d-flex align-items-center">
              <!-- <ArgonButton
              class="btn btn-link mb-3"
              @click="toggleAdvancedSettings"
            >
              {{ t("advancedSettings") }} 
            </ArgonButton> -->

              <!-- <div class="d-flex align-items-center ms-auto">
              <span class="me-2">{{ t("inactive") }}</span> 
              <argon-switch
                class="custom-switch-modal"
                v-model:checked="routineTaskStatus"
                aria-label="Routine Task Status"
                role="switch"
              ></argon-switch>
              <span class="ms-2">{{ t("active") }}</span> 
            </div> -->
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ t("manageRoutineTasks.from") }}:</label>
              <input type="time" v-model="fromDate" class="form-control" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">{{ t("manageRoutineTasks.to") }}:</label>
              <input type="time" v-model="toDate" class="form-control" />
            </div>

            <!-- الإعدادات المتقدمة -->
            <!-- <transition name="fade">
            <div v-if="showAdvancedSettings" class="advanced-settings mx-3">
              <div class="form-group mb-3">
                <label class="form-label">{{ t("from") }}:</label>
                <input
                  type="date"
                  v-model="fromDate"
                  class="form-control"
                />
              </div>
              <div class="form-group mb-3">
                <label class="form-label">{{ t("to") }}:</label>
                <input
                  type="date"
                  v-model="toDate"
                  class="form-control"
                />
              </div>
            </div>
          </transition> -->
          </div>
        </template>

        <template #footer>
          <argon-button variant="secondary" @click="closePopup">
            {{ t("manageRoutineTasks.close") }}
          </argon-button>
          <argon-button variant="success" @click="addRoutineTask" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isLoading ? t("manageRoutineTasks.saving") : t("manageRoutineTasks.create") }}
          </argon-button>
        </template>
      </ArgonModal>
    </transition>
  </div>
</template>

/* src/views/RoutineTask.vue */

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
  /* تحديد الحد الأقصى للارتفاع */
  /* scroll-behavior: smooth;  */
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

/* تحسين تصميم المودال الداخلي */
.routine-task-modal .modal-header,
.routine-task-modal .modal-footer {
  flex-shrink: 0;
  /* منع الانكماش */
}

.routine-task-modal .modal-body {
  flex: 1;
  /* السماح للمحتوى بالتمدد */
}

/* swal */

/* Ensure Swal appears above all other elements */
.swal2-container {
  z-index: 100000 !important;
}

.swal-above-modal {
  z-index: 100001 !important;
}
</style>
