// src/views/components/ManageRoutineTaskTable.vue

<template>
  <div class="card-body px-0 pt-0 pb-2" :key="componentKey">
    <div class="table-responsive p-3">
      <table class="table align-items-center table-hover mb-0">
        <thead class="thead-light">
          <tr>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              v-if="permissions['edit-dailytask'] || isOwner">
              {{ t("status") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("taskName") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("department") }}
            </th>
            <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
            <select name="department" id="" class="form-control">
              <option class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" value="all" s>{{ t("department") }}</option>
              <option
                v-for="department in allDepartments"
                :key="department.id"
                :value="department.id"
              >
                {{ department.department_name }}
              </option>
            </select>
            </th> -->
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("taskType") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("from") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("to") }}
            </th>
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
              {{ t("project") }}
            </th>
            <th class="text-secondary opacity-7"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in allroutineTasks" :key="task.id">
            <!-- استخدام routineTasks -->
            <td v-if="permissions['edit-dailytask'] || isOwner">
              <div class="mb-0 py-1">
                <div class="d-flex justify-content-center text-sm">
                  <argon-switch :checked="task.active" @update:checked="() => toggleStatus(task.id)">
                    <!-- {{ task.active ? t("active") : t("inactive") }} -->
                  </argon-switch>
                </div>
              </div>
            </td>

            <td>
              <div class="d-flex px-2 py-1 align-items-center justify-content-center position-relative">
                <div class="d-flex justify-content-center align-items-center task-name text-center w-100 cursor-pointer"
                  @click="openDescriptionModal(task)" title="Open Task Description">
                  <h6 class="mb-0 text-sm hover-effect mx-1" dir="auto">
                    {{ task.task_name }}
                  </h6>
                  <div v-if="loadingTaskId === task.id" class="spinner-border spinner-border-sm text-primary"
                    role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </td>

            <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ task.department?.department_name || "No Department" }}
              </p>
            </td>

            <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ task.task_type || "No Task Type" }}
              </p>
            </td>
            <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ formatTime(task.from) }}
              </p>
            </td>
            <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ formatTime(task.to) }}
              </p>
            </td>
            <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ task.project?.name || "No Project" }}
              </p>
            </td>
            <td class="align-middle">
              <a href="javascript:;" v-show="permissions['edit-dailytask'] || isOwner"
                class="text-secondary font-weight-bold text-xs me-2" @click="openEditModal(task)">
                {{ t("edit") }}
              </a>
              <a href="javascript:;" v-show="permissions['delete-dailytask'] || isOwner"
                class="text-danger font-weight-bold text-xs" @click="confirmDelete(task)">
                {{ t("delete") }}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="d-flex justify-content-center mt-4">
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <!-- زر الانتقال للصفحة السابقة -->
          <li :class="['page-item', { disabled: pagination.current_page === 1 }]">
            <a class="page-link" href="#" @click.prevent="
              $emit('page-changed', pagination.current_page - 1)
              ">
              &laquo;
            </a>
          </li>

          <!-- لو في صفحات قبل الـ startIndex نعرض أول صفحة ... -->
          <li v-if="startIndex > 1" class="page-item" :class="{ active: 1 === pagination.current_page }">
            <a class="page-link" href="#" @click.prevent="$emit('page-changed', 1)">
              1
            </a>
          </li>
          <li v-if="startIndex > 2" class="page-item disabled">
            <span class="page-link">...</span>
          </li>

          <!-- الصفحات الوسيطة اللي هتعرضها -->
          <li v-for="page in pagesToShow" :key="page"
            :class="['page-item', { active: page === pagination.current_page }]">
            <a class="page-link" href="#" @click.prevent="$emit('page-changed', page)">
              {{ page }}
            </a>
          </li>

          <!-- لو في صفحات بعد الـ endIndex نعرض آخر صفحة ... -->
          <li v-if="endIndex < pagination.last_page - 1" class="page-item disabled">
            <span class="page-link">...</span>
          </li>
          <li v-if="endIndex < pagination.last_page" class="page-item" :class="{
            active: pagination.last_page === pagination.current_page,
          }">
            <a class="page-link" href="#" @click.prevent="$emit('page-changed', pagination.last_page)">
              {{ pagination.last_page }}
            </a>
          </li>

          <!-- زر الانتقال للصفحة التالية -->
          <li :class="[
            'page-item',
            { disabled: pagination.current_page === pagination.last_page },
          ]">
            <a class="page-link" href="#" @click.prevent="
              $emit('page-changed', pagination.current_page + 1)
              ">
              &raquo;
            </a>
          </li>
        </ul>
      </nav>
    </div>
    <!-- <div class="d-flex justify-content-center mt-4">
      
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li :class="['page-item', { disabled: !pagination.prev_page_url }]">
            <a
              class="page-link"
              href="#"
              @click.prevent="changePage(pagination.current_page - 1)"
            >
              &laquo;
            </a>
          </li>

          <template v-if="totalPages <= 10">
            <li
              v-for="page in totalPages"
              :key="page"
              :class="[
                'page-item',
                { active: page === pagination.current_page },
              ]"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">
                {{ page }}
              </a>
            </li>
          </template>

<template v-else>
            <li v-if="pagination.current_page > 5" class="page-item disabled">
              <span class="page-link">...</span>
            </li>

            <li
              v-for="page in Math.min(totalPages)"
              :key="page"
              :class="[
                'page-item',
                {
                  active: page === pagination.current_page,
                  'd-none':
                    page < Math.max(1, pagination.current_page - 4) ||
                    page > Math.min(totalPages, pagination.current_page + 5),
                },
              ]"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">
                {{ page }}
              </a>
            </li>

            <li
              v-if="pagination.current_page < totalPages - 4"
              class="page-item disabled"
            >
              <span class="page-link">...</span>
            </li>
          </template>

<li :class="['page-item', { disabled: !pagination.next_page_url }]">
  <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page + 1)">
    &raquo;
  </a>
</li>
</ul>
</nav>
</div> -->

    <!-- مودال التعديل -->
    <div v-if="showEditPopup" class="popup-overlay">
      <transition name="modal-fade">
        <ArgonModal v-if="showEditPopup" :title="t('editTask')" @close="closeEditPopup" class="routine-task-modal">
          <template #default>
            <div class="mb-3 modal-content-scroll">
              <label class="form-label">{{ t("taskName") }}:</label>
              <input v-model="selectedTask.task_name" class="form-control mb-3" />

              <label class="form-label">{{ t("description") }}:</label>
              <input v-model="selectedTask.description" class="form-control mb-3" />

              <!-- <div v-if="employeeOptions.length > 0" class="mb-3">
                <label class="form-label">{{ t("assignManager") }}:</label>
                <argon-select
                  v-model="selectedTask.assigned_to_id"
                  :options="employeeOptions"
                  :placeholder="t('assignManager')"
                  class="form-control"
                />
              </div> -->

              <label class="form-label">{{ t("taskType") }}:</label>
              <argon-select v-model="selectedTask.task_type" :options="taskTypeOptions" class="form-control mb-3" />

              <div v-show="selectedTask.task_type === 'weekly'" class="form-group mb-3">
                <label class="form-label">{{ t("recurrentDays") }}:</label>
                <div class="d-flex flex-wrap">
                  <div v-for="day in daysOfWeek" :key="day.value" class="form-check me-3">
                    <argon-checkbox :id="'day-' + day.value" :name="'recurrentDays'" :value="day.value"
                      v-model="selectedTask.recurrent_days">
                      {{ day.label }}
                    </argon-checkbox>
                  </div>
                </div>
              </div>

              <div v-show="selectedTask.task_type === 'monthly'" class="form-group mb-3">
                <label class="form-label">{{ t("dayOfMonth") }}:</label>
                <input type="number" v-model="selectedTask.day_of_month" class="form-control"
                  :placeholder="t('enterDayOfMonth')" min="1" max="31" />
              </div>

              <!-- select Department -->
              <!-- في نموذج التعديل -->
              <div class="mb-3">
                <label class="form-label">{{ t("department") }}</label>
                <select v-model="selectedDepartment" class="form-control mb-3">
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>

              <!-- select Project -->
              <div class="mb-3">
                <label class="form-label">{{ t("project") }}:</label>
                <argon-select v-model="projectId" :options="formattedProjects" :placeholder="t('selectProject')"
                  class="form-control" searchable searchPlaceholder="Search projects..." required />
              </div>

              <!-- أولوية (priority) في نصف عرض -->
              <div class=" mb-3">
                <label class="form-label">{{ t("priority") }}:</label>
                <argon-select v-model="selectedTaskPriority" :options="prioritiesOptions"
                  :placeholder="t('selectPriority')" class="form-control" searchable
                  searchPlaceholder="Search priorities..." required />
              </div>

              <label class="form-label">{{ t("to") }}:</label>
              <input v-model="selectedTask.to" type="time" class="form-control mb-3" />

              <label class="form-label">{{ t("startDate") }}:</label>
              <input v-model="selectedTask.start_date" type="date" class="form-control mb-3" />

              <!-- <label class="form-label">{{ t("deadline") }}:</label>
              <input
                v-model="selectedTask.deadline"
                type="date"
                class="form-control mb-3"
              /> -->

              <label style="display: none" class="form-label">{{ t("status") }}:</label>
              <argon-switch style="display: none" v-model:checked="selectedTask.status">
                {{
                  selectedTask.status === "done" ? t("active") : t("inactive")
                }}
              </argon-switch>
            </div>
          </template>

          <template #footer>
            <argon-button variant="secondary" @click="closeEditPopup">
              {{ t("close") }}
            </argon-button>
            <argon-button variant="success" @click="updateTask" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
              {{ isLoading ? t("saving") : t("update") }}
            </argon-button>
          </template>

          <!-- <template #title>
            <i class="fas fa-user-edit me-2"></i>
            {{ t("editTask") }}
          </template> -->
        </ArgonModal>
      </transition>
    </div>

    <!-- مودال الوصف المعدل -->
    <div v-if="showDescriptionModal" class="popup-overlay">
      <ArgonModal :title="selectedTaskName" @close="closeDescriptionModal" class="routine-task-modal">
        <template #default>
          <div class="modal-content-scroll">
            <!-- التبويبات -->
            <ul class="nav nav-tabs custom-tabs" role="tablist">
              <li class="nav-item">
                <argon-button class="nav-link" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">
                  {{ t("info") }}
                </argon-button>
              </li>
              <li class="nav-item">
                <argon-button class="nav-link" :class="{ active: activeTab === 'log' }" @click="activeTab = 'log'">
                  {{ t("log") }}
                </argon-button>
              </li>
            </ul>
            <div class="tab-content">
              <div v-if="activeTab === 'info'">
                <dl class="row">
                  <dt class="col-sm-3">{{ t("taskNumber") }}:</dt>
                  <dd class="col-sm-9">{{ selectedTaskNumber }}</dd>

                  <dt v-show="selectedDescription" class="col-sm-3">
                    {{ t("description") }}:
                  </dt>
                  <dd v-show="selectedDescription" class="col-sm-9">
                    {{ selectedDescription }}
                  </dd>

                  <dt v-if="
                    selectedTaskRecurrentDays &&
                    selectedTaskRecurrentDays.length
                  " class="col-sm-3">
                    {{ t("recurrentDays") }}:
                  </dt>
                  <dd v-if="
                    selectedTaskRecurrentDays &&
                    selectedTaskRecurrentDays.length
                  " class="col-sm-9">
                    {{
                      selectedTaskRecurrentDays
                        .map(
                          (dayValue) =>
                            daysOfWeek.find((day) => day.value === dayValue)
                              ?.label
                        )
                        .filter(Boolean)
                        .join(", ")
                    }}
                  </dd>

                  <dt v-if="selectedTaskDayOfMonth" class="col-sm-3">
                    {{ t("dayOfMonth") }}:
                  </dt>
                  <dd v-if="selectedTaskDayOfMonth" class="col-sm-9">
                    {{ selectedTaskDayOfMonth }}
                  </dd>

                  <dt class="col-sm-3">{{ t("taskCreatedBy") }}:</dt>
                  <dd class="col-sm-9">
                    {{ selectedTaskCreatedBy }}
                  </dd>

                  <dt v-if="selectedTaskCreationDate" class="col-sm-3">
                    {{ t("createdAt") }}:
                  </dt>
                  <dd v-if="selectedTaskCreationDate" class="col-sm-9">
                    {{ formatDate(selectedTaskCreationDate) }}
                  </dd>

                  <dt v-if="selectedTaskStartDate" class="col-sm-3">
                    {{ t("startDate") }}:
                  </dt>
                  <dd v-if="selectedTaskStartDate" class="col-sm-9">
                    {{ formatDate(selectedTaskStartDate) }}
                  </dd>

                  <dt class="col-sm-3">{{ t("department") }}:</dt>
                  <dd class="col-sm-9">
                    {{ selectedTaskDepartment || "N/A" }}
                  </dd>
                </dl>
              </div>
              <div v-if="activeTab === 'log'">
                <div v-if="taskLogs.length > 0">
                  <ul class="log-list">
                    <li v-for="log in taskLogs" :key="log.id" class="log-item">
                      {{ t("onDate") }}
                      <strong>{{ formatDate(log.created_at) }}</strong>,
                      <strong>{{ log.user.name || "N/A" }}</strong>
                      {{ t("changedTheField") }}
                      "<strong>{{ log.field_name }}</strong>"
                      {{ t("from") }}
                      "<strong>{{ log.old_value }}</strong>"
                      {{ t("to") }}
                      "<strong>{{ log.new_value }}</strong>".
                    </li>
                  </ul>
                </div>
                <div v-else>
                  <p>{{ t("noLogsAvailable") }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <argon-button variant="secondary" @click="closeDescriptionModal">
            {{ t("close") }}
          </argon-button>
        </template>
      </ArgonModal>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeMount, watch } from "vue";
import { useStore } from "vuex";
import Swal from "sweetalert2";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
  // hasPermission,
} from "@/utils/permissions.js";

const store = useStore();
const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);

const currentUserId = computed(() => store.getters.userId);
console.log("currentUserId:", currentUserId.value);

// const emit = defineEmits(["page-changed"]);

const props = defineProps({
  allroutineTasks: {
    // تغيير اسم الخاصية من tasks إلى routineTasks
    type: Array,
    required: true,
  },
  pagination: {
    type: Object,
    required: true,
  },
});

// const totalPages = computed(() => {
//   // Ensure total pages is calculated correctly
//   return Math.ceil(props.pagination.total / props.pagination.per_page);
// });

console.log("props.allroutineTasks:", props.allroutineTasks);

const userData = computed(() => store.getters.user);
const isOwner = computed(() => store.getters.isOwner);

const taskTypeOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "last_day_of_month", label: "Last Day of Month" },
];

// استدعاء الصلاحيات من localStorage بناءً على المستخدم الحالي
const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.id) || {}
);

console.log(permissions.value);

// عند تحميل الصفحة لأول مرة، حفظ الصلاحيات في localStorage
onBeforeMount(() => {
  if (!permissions.value || Object.keys(permissions.value).length === 0) {
    const extractedPermissions = extractPermissionsFromAPI(
      userData.value?.roles
    );
    permissions.value = extractedPermissions;
    savePermissionsToLocalStorage(permissions.value, userData.value?.id);
  }
  store.dispatch("getCompanyUsers");
  store.dispatch("getDepartments");
  store.dispatch("getProjects");
});

const departments = computed(() => store.state.departments); // افترض أن الأقسام مخزنة في Vuex
const projects = computed(() => store.state.projects); // افترض أن المشاريع مخزنة في Vuex

// const formattedDepartments = computed(() => {
//   return departments.value.map((department) => ({
//     value: department.id,
//     label: department.name,
//   }));
// });

const formattedProjects = computed(() => {
  return [
    ...projects.value
      .filter((project) => project.status == true)
      .map((project) => ({
        value: project.id,
        label: project.name,
      })),
  ];
});

// const toggleAllProjects = () => {
//   // استبعاد الخيار "No Project" (value: null)
//   // const actualProjects = formattedProjects.value.filter(p => p.value !== null);

//   if (selectedProjects.value.length === formattedProjects.value.length) {
//     selectedProjects.value = [];
//   } else {
//     selectedProjects.value = formattedProjects.value.map((project) => ({
//       id: project.value,
//       name: project.label,
//     }));
//   }
// };

// تعريف المتغيرات الجديدة لتخزين بيانات المهمة
const selectedTaskName = ref("");
const selectedDescription = ref(""); // لتخزين وصف المهمة
const selectedTaskNumber = ref(null);
const selectedTaskStartDate = ref(null);
const selectedTaskDepartment = ref(null);
const selectedTaskDeadline = ref(null);
const selectedTaskCreationDate = ref(null);
const selectedTaskId = ref(null);
const showDescriptionModal = ref(false);
const taskLogs = ref([]); // لتخزين سجلات المهمة
const selectedTaskRecurrentDays = ref([]);
const selectedTaskStatus = ref(null);
const selectedTaskAssignedTo = ref(null);
const selectedTaskDayOfMonth = ref(null);
const selectedTaskCreatedBy = ref(null);
const loadingTaskId = ref(null);
const selectedTaskProject = ref(null);

const activeTab = ref("info"); // علامة تبويب البداية
const projectId = ref("");

const toggleStatus = async (taskId) => {
  console.log("taskId:", taskId);
  try {
    // تنفيذ تحديث الحالة هنا (إرسال الطلب إلى الـ API أو تحديث Vuex)
    const task = {
      id: taskId,
      company_id: currentCompanyId.value,
    };

    const updatedStatus = await store.dispatch("updateTaskStatus", task);
    if (updatedStatus) {
      Swal.fire({
        icon: "success",
        title: t("statusUpdatedSuccessfully"),
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      await store.dispatch("fetchRoutineTasks"); // تأكد من وجود action fetchTasks في Vuex
    }
  } catch (error) {
    console.error("Error updating status:", error);
    Swal.fire({
      icon: "error",
      title: t("errorUpdatingStatus"),
      text: error.message,
    });
  }
};


// const priority = ref("");
const prioritiesOptions = [
  { value: "normal", label: "Normal" },
  { value: "critical", label: "Critical" },
];


// دالة مساعدة لتبديل حالة المهمة
// const toggleTaskStatus = async (taskId) => {
//   console.log("taskId:", taskId);
//   try {
//     const task = props.routineTasks.find(t => t.id === taskId); // استخدام routineTasks
//     if (!task) throw new Error("Task not found");

//     const newStatus = task.active ? 'not_done' : 'done';

//     const response = await store.dispatch("updateTaskStatus", {
//       id: taskId,
//       status: newStatus,
//     });

//     return response.status === 200;
//   } catch (error) {
//     throw error;
//   }
// };

const componentKey = ref(0);

const showEditPopup = ref(false);
const currentEditingTaskId = ref(null);
const selectedManager = ref(null);
// في قسم التعريفات
const selectedDepartment = ref(null); // لتخزين department_id
const selectedProject = ref(null); // لتخزين project_id

const selectedTask = ref(null); // لتخزين المهمة المحددة للتعديل
const selectedTaskPriority = ref(null); // لتخزين priority

const currentLanguage = computed(() => store.getters.currentLanguage);
const t = (key) => translations[currentLanguage.value][key];

// const dataFromApi = computed(() => store.getters.dataFromApi);

// const employeeOptions = computed(() => {
//   return store.getters.dataFromApi.map((employee) => ({
//     value: employee.id,
//     label: employee.name,
//   }));
// });

const openEditModal = (task) => {
  selectedTask.value = {
    ...task,
    recurrent_days: Array.isArray(task.recurrent_days)
      ? [...task.recurrent_days]
      : [],
  };
  selectedManager.value = task.assigned_to?.id || null; // تأكد من أن الخاصية صحيحة
  console.log("selectedManager.value:", selectedManager.value);
  console.log("selectedTask.value:", selectedTask.value);
  selectedDepartment.value = task.department?.dept_id; // تأكد من أن الخاصية صحيحة
  selectedProject.value = task.project?.id; // تأكد من أن الخاصية صحيحة
  projectId.value = task.project?.id;
  selectedTaskPriority.value = task.priority;
  showEditPopup.value = true;
};

const closeEditPopup = () => {
  showEditPopup.value = false;
  selectedTask.value = null;
  currentEditingTaskId.value = null;
  selectedManager.value = null;
  selectedDepartment.value = null; // تأكد من تهيئة قيمة
  projectId.value = "";
  selectedTaskPriority.value = null;

};

const isLoading = ref(false);

const updateTask = async () => {
  isLoading.value = true;

  // تجهيز البيانات التي سيتم إرسالها
  const taskData = {
    id: selectedTask.value.id,
    task_name: selectedTask.value.task_name,
    description: selectedTask.value.description,
    start_date: selectedTask.value.start_date,
    task_type: selectedTask.value.task_type,
    recurrent_days: selectedTask.value.recurrent_days,
    day_of_month: selectedTask.value.day_of_month,
    from: selectedTask.value.from.slice(0, 5),
    to: selectedTask.value.to.slice(0, 5),
    dept_id: selectedDepartment.value,
    project_id: projectId.value,
    priority: selectedTaskPriority.value,
    // ...selectedTask.value,
  };

  try {
    console.log("TaskData:", taskData);

    const result = await store.dispatch("updateRoutineTask", taskData);
    console.log("result:", result);

    if (result.status === 200) {
      // تحديث بيانات الموظفين
      Swal.fire({
        icon: "success",
        title: t("taskUpdatedSuccessfully"),
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      closeEditPopup();
      await store.dispatch(
        "fetchAllRoutineTasks",
        props.pagination.current_page
      ); // جلب البيانات مع الصفحة الحالية

      // await store.dispatch("fetchTasks"); // تأكد من وجود action fetchTasks في Vuex
    } else {
      Swal.fire({
        icon: "error",
        title: result.message,
        showConfirmButton: true,
      });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    Swal.fire({
      icon: "error",
      title: t("errorUpdatingTask"),
      text: error.message,
    });
  } finally {
    isLoading.value = false;
  }
};

const confirmDelete = (task) => {
  Swal.fire({
    title: t("deleteConfirmationTitle"),
    text: t("deleteConfirmationText"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("delete"),
    cancelButtonText: t("close"),
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteTask(task.id);
    }
  });
};

const deleteTask = async (taskId) => {
  console.log(taskId);
  try {
    await store.dispatch("deleteRoutineTask", taskId);
    // await store.dispatch("fetchRoutineTasks", props.pagination.current_page); // جلب البيانات مع الصفحة الحالية

    componentKey.value += 1;
    Swal.fire({
      icon: "success",
      title: t("taskDeletedSuccessfully"),
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
    await store.dispatch("fetchAllRoutineTasks", props.pagination.current_page);
  } catch (error) {
    console.error("Error deleting task:", error);
    Swal.fire({
      icon: "error",
      title: t("errorDeletingTask"),
      text: error.message,
    });
  }
};

const getTaskLogs = async (taskId) => {
  try {
    loadingTaskId.value = taskId; // تحديد الرقم المعرف للمهمة المحددة
    const response = await store.dispatch("fetchTaskLogs", taskId);
    if (response.status === 200) {
      console.log("Task logs fetched successfully:", response.data);
      taskLogs.value = response.data.revisions;
    } else {
      console.error("Failed to fetch logs, status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching task logs:", error);
  } finally {
    loadingTaskId.value = null; // تحديد الرقم المعرف للمهمة المحددة
  }
};

const openDescriptionModal = async (task) => {
  selectedTaskName.value = task.task_name; // تعيين اسم المهمة
  selectedDescription.value = task.description; // تعيين وصف المهمة
  selectedTaskNumber.value = task.task_no;
  selectedTaskStartDate.value = task.start_date; // تعيين تاريخ بدء المهمة
  selectedTaskDeadline.value = task.deadline; // تعيين تاريخ انتهاء المهمة
  selectedTaskCreationDate.value = task.created_at; // تعيين تاريخ إنشاء المهمة
  selectedTaskId.value = task.id;
  selectedTaskStatus.value = task.status;
  selectedTaskAssignedTo.value = task.assigned_to;
  selectedTaskRecurrentDays.value = task.recurrent_days;
  selectedTaskDayOfMonth.value = task.day_of_month;
  selectedTaskCreatedBy.value = task.created_by.name;
  selectedTaskDepartment.value = task.department?.department_name;
  selectedTaskProject.value = task.project?.name;
  await getTaskLogs(task.id);
  showDescriptionModal.value = true; // إظهار المودال
};

watch(
  () => taskLogs.value,
  (newLogs) => {
    console.log("Updated logs:", newLogs);
  }
);

const closeDescriptionModal = () => {
  showDescriptionModal.value = false; // إغلاق المودال
  selectedTaskName.value = "";
  selectedDescription.value = "";
  selectedTaskNumber.value = null;
  selectedTaskStartDate.value = null;
  selectedTaskDepartment.value = null;
  selectedTaskDeadline.value = null;
  selectedTaskCreationDate.value = null;
  selectedTaskId.value = null;
  selectedTaskStatus.value = null;
  selectedTaskAssignedTo.value = null;
  selectedTaskRecurrentDays.value = [];
  selectedTaskDayOfMonth.value = null;
  selectedTaskCreatedBy.value = null;
  selectedTaskProject.value = null;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(
    currentLanguage.value,
    options
  );
};

// الترجمات المحدثة
const translations = {
  en: {
    tasksTable: "Tasks Table",
    taskName: "Task Name",
    edit: "Edit",
    delete: "Delete",
    deleteConfirmationTitle: "Delete Task",
    deleteConfirmationText: "Are you sure you want to delete this task?",
    deleteConfirmationSuccess: "Task deleted successfully.",
    close: "Close",
    saving: "Saving...",
    update: "Update",
    assignManager: "Assigned Manager",
    taskUpdatedSuccessfully: "Task updated successfully",
    taskDeletedSuccessfully: "Task deleted successfully",
    status: "Status",
    taskCreatedBy: "Created By",
    description: "Description",
    taskDetails: "Task Details",
    createdAt: "Created At",
    deadline: "Deadline",
    startDate: "Start Date",
    active: "Active",
    inactive: "Inactive",
    log: "Log",
    info: "Info",
    statusUpdatedSuccessfully: "Status updated successfully",
    errorUpdatingStatus: "Error updating status",
    errorUpdatingTask: "Error updating task",
    errorDeletingTask: "Error deleting task",
    noLogsAvailable: "No logs available",
    changedTheField: "changed the field",
    from: "from",
    to: "to",
    onDate: "On",
    editTask: "Edit Task",
    noTasks: "No tasks found.", // إضافة ترجمة جديدة
    createee: "Create your task using the button above", // تعديل الترجمة
    taskNumber: "Task code",
    taskStartDate: "Task Start Date",
    taskDeadline: "Task Deadline",
    taskType: "Task Type",
    dayOfWeek: "Day of Week",
    dayOfMonth: "Day of Month",
    fromTime: "From Time",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    taskCreatedSuccessfully: "Task created successfully",
    taskCreatedSuccessfullyMessage: "Task created successfully",
    taskCreationError: "Error creating task",
    recurrentDays: "Recurrent Days",
    enterDayOfMonth: "Enter day of the month ex: 1, 2,....31",
    department: "Department",
    project: "Project",
    noProject: "No Project",
    priority: "Priority",
    selectPriority: "Select Priority",
  },
  ar: {
    tasksTable: "جدول المهام",
    taskName: "اسم المهمة",
    edit: "تعديل",
    delete: "حذف",
    deleteConfirmationTitle: "حذف المهمة",
    deleteConfirmationText: "هل تريد حذف هذه المهمة؟",
    deleteConfirmationSuccess: "تم حذف المهمة بنجاح.",
    close: "إغلاق",
    saving: "يتم الحفظ...",
    update: "تحديث",
    assignManager: "المدير المعين",
    taskUpdatedSuccessfully: "تم تحديث المهمة بنجاح",
    taskDeletedSuccessfully: "تم حذف المهمة بنجاح",
    status: "حالة المهمة",
    taskCreatedBy: "تم الإنشاء بواسطة",
    description: "وصف المهمة",
    taskDetails: "تفاصيل المهمة",
    createdAt: "تاريخ الإنشاء",
    deadline: "المهلة النهائية",
    startDate: "تاريخ البدء",
    active: "نشط",
    inactive: "غير نشط",
    log: "سجل",
    info: "معلومات",
    statusUpdatedSuccessfully: "تم تحديث الحالة بنجاح",
    errorUpdatingStatus: "حدث خطأ في تحديث الحالة",
    errorUpdatingTask: "حدث خطأ في تحديث المهمة",
    errorDeletingTask: "حدث خطأ في حذف المهمة",
    noLogsAvailable: "لا يوجد سجلات متاحة",
    changedTheField: "قام بتغيير الحقل",
    from: "من",
    to: "إلى",
    onDate: "في تاريخ",
    editTask: "تعديل المهمة",
    noTasks: "لا يوجد مهام.", // إضافة ترجمة جديدة
    createee: "انشئ مهمتك من الزر المتواجد بالاعلي", // تعديل الترجمة
    taskNumber: "كود المهمة",
    taskStartDate: "تاريخ بدء المهمة",
    taskDeadline: "تاريخ انتهاء المهمة",
    taskType: "نوع المهمة",
    dayOfWeek: "يوم الاسبوع",
    dayOfMonth: "يوم الشهر",
    fromTime: "من الوقت",
    sunday: "الاحد",
    monday: "الاثنين",
    tuesday: "الثلاثاء",
    wednesday: "الاربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
    taskCreatedSuccessfully: "تم انشاء المهمة بنجاح",
    taskCreatedSuccessfullyMessage: "تم انشاء المهمة بنجاح",
    taskCreationError: "حدث خطاء في انشاء المهمة",
    recurrentDays: "ايام التكرار",
    enterDayOfMonth: "ادخل يوم الشهر مثل 1, 2,....31",
    department: "القسم",
    project: "المشروع",
    noProject: "بدون مشروع",
    priority: "الأولوية",
    selectPriority: "اختر الأولوية",
  },
};

const daysOfWeek = [
  { label: t("sunday"), value: 0 },
  { label: t("monday"), value: 1 },
  { label: t("tuesday"), value: 2 },
  { label: t("wednesday"), value: 3 },
  { label: t("thursday"), value: 4 },
  { label: t("friday"), value: 5 },
  { label: t("saturday"), value: 6 },
];

// التعامل مع تغيير الصفحة
// const changePage = (page) => {
//   if (page >= 1 && page <= props.pagination.last_page) {
//     emit("page-changed", page);
//   }
// };

const formatTime = (time) => {
  // تأكد من أن الوقت موجود وصحيح
  if (!time) return "N/A";

  // تقسيم الوقت إلى ساعات ودقائق
  const [hours, minutes] = time.split(":").map(Number);

  // تحديد AM أو PM
  const period = hours >= 12 ? "PM" : "AM";

  // تحويل الساعات إلى نظام 12 ساعة
  const formattedHours = hours % 12 || 12; // إذا كانت الساعة 0 تصبح 12

  // إرجاع الوقت بالتنسيق الجديد
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// حساب عدد الصفحات
// const totalPages = computed(() => {
//   return props.pagination.last_page;
// });

const MAX_VISIBLE_PAGES = 6;

const startIndex = computed(() => {
  // لو الصفحة الحالية في النص، نفترض -2 +2
  // بس نحد أقصى 6 صفحات، هنعمل منطق صغير يظبط الموضوع
  let half = Math.floor(MAX_VISIBLE_PAGES / 2);

  // بداية النطاق
  let start = props.pagination.current_page - half;

  // ما ينفعش نبدأ من أقل من 1
  return start < 1 ? 1 : start;
});

const endIndex = computed(() => {
  let start = startIndex.value;
  let end = start + MAX_VISIBLE_PAGES - 1;
  // برضه ما ينفعش يتعدى عدد الصفحات
  if (end > props.pagination.last_page) {
    end = props.pagination.last_page;
  }
  return end;
});

const pagesToShow = computed(() => {
  let pages = [];
  for (let i = startIndex.value; i <= endIndex.value; i++) {
    pages.push(i);
  }
  return pages;
});
</script>

<style scoped>
.table-responsive {
  background-color: #fff;
  border-radius: 10px;
}

/* تنسيق رأس الجدول */
.table thead th {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  text-align: center;
  /* جعل النصوص في رأس الجدول في المنتصف */
}

/* تأثير hover على الصفوف */
.table tbody tr:hover {
  background: #f1f1f1;
}

.table td,
.table th {
  vertical-align: middle;
  text-align: center;
  /* جعل جميع النصوص في الأعمدة في المنتصف */
}

/* تنسيق الـ Modal */

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

/* .modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
} */

/* .modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
} */
.routine-task-modal .modal-header,
.routine-task-modal .modal-footer {
  flex-shrink: 0;
  /* منع الانكماش */
}

.routine-task-modal .modal-body {
  flex: 1;
  /* السماح للمحتوى بالتمدد */
}

/* تحسين تنسيق النصوص */
.form-label {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 5px;
}

/* إضافة موضع للأيقونة */
.hover-icon {
  right: 10px;
  /* اجعل الأيقونة في أقصى اليمين */
  top: 50%;
  /* محاذاة رأسية */
  transform: translateY(-50%) scale(0.8);
  /* تصحيح المحاذاة العمودية وتقليل الحجم */
  position: absolute;
  /* تثبيت الأيقونة بالنسبة للحاوية */
  cursor: pointer;
  color: #4caf50;
  /* لون الموقع الأساسي */
  opacity: 0;
  /* الإخفاء الافتراضي */
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  /* تأثير عند التبديل */
}

.hover-icon:hover {
  color: #4caf50;
  /* لون الموقع عند التمرير */
}

td:hover .hover-icon {
  opacity: 1;
  /* إظهار الأيقونة عند التمرير */
  transform: translateY(-50%) scale(1);
  /* إرجاع الحجم الطبيعي */
}

/* تحسين الحاوية */
.d-flex.position-relative {
  position: relative;
  /* تهيئة الحاوية للأيقونة */
  padding-right: 30px;
  /* إضافة مساحة للأيقونة */
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
  /* نص أبيض عند التمرير */
  background-color: #a9ca5c;
  /* خلفية أخضر فاتح عند التمرير */
}

.tab-content {
  padding: 1rem;
  background-color: #ffffff;
  /* اللون الأبيض */
  border-radius: 0.5rem;
  /* حواف ناعمة */
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(70vh - 200px);
  /* لضمان ظهور المحتويات بشكل جيد */
}

.modal-body {
  padding: 0.2rem;
  background-color: #ffffff;
  /* اللون الأبيض */
  border-radius: 0.5rem;
  /* حواف ناعمة */
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 200px);
  /* لضمان ظهور المحتويات بشكل جيد */
  max-width: calc(100vw - 2rem);
}

/* تنسيق قائمة التعريفية داخل التبويب Info */
.modal-body dl.row {
  margin-bottom: 0;
}

.modal-body dt {
  font-weight: 600;
  text-align: right;
  padding-right: 1rem;
}

.modal-body dd {
  margin-left: 0;
  text-align: left;
  /* محاذاة النصوص إلى اليسار لتحسين القراءة */
}

.log-list {
  padding: 0;
  margin: 0;
  list-style-type: disc;
  /* أو circle، أو square، إلخ */
  padding-left: 1rem;
  /* لتظهر النقط يسارًا */
}

.log-item {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #333;
}

.log-item strong {
  color: #4caf50;
  /* لون النص البارز */
}

/* تنسيق الترقيم */
.pagination {
  display: flex;
  list-style: none;
  padding-left: 0;
}

.pagination .page-item {
  margin: 0 5px;
}

.pagination .page-link {
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
  color: #a9ca5c;
  cursor: pointer;
  border-radius: 0.25rem;
  text-decoration: none;
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
  cursor: not-allowed;
}

.pagination .page-item.active .page-link {
  background-color: #a9ca5c;
  color: white;
  border-color: #a9ca5c;
  font-weight: 600;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);  */


}

.pagination .page-item.active .page-link:hover:not(.disabled) {
  background-color: #a9ca5c;
  color: white;
  border-color: #a9ca5c;
  font-weight: 600;
}

.pagination .page-link:hover:not(.disabled):not(.active) {
  background-color: #e9ecef;
  color: #a9ca5c;
}

/* تنسيق للنصوص الاختيارية */

.cursor-pointer {
  cursor: pointer;
}

.hover-effect {
  transition: color 0.3s ease;
}

.hover-effect:hover {
  color: #a7c858;
  text-decoration: underline;
}
</style>
