// src/views/components/RoutineTaskTable.vue

<template>
  <span class="fa fa-bolt text-warning mb-0"></span> : random task
  <div class="card-body px-0 pt-0 pb-2" :key="componentKey">
    <!-- <div class="d-flex justify-content-end mb-3">
      <button
        class="btn btn-sm btn-primary"
        @click="showAllTasks = !showAllTasks"
      >
        {{ showAllTasks ? "Show Today's Tasks" : "Show All Tasks" }}
      </button>
    </div> -->

    <!-- <div class="row mb-4">
      <div
        v-for="(count, department) in taskCountByDepartment"
        :key="department"
        class="col-md-3 mb-3"
      >
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ department }}</h5>
            <p class="card-text">
              <span class="badge bg-primary">{{ count }}</span> tasks
            </p>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Tabs Navigation -->
    <!-- <ul class="nav nav-tabs custom-tabs" role="ttttablist">
      <li class="nav-item">
        <argon-button
          class="nav-link"
          :class="{ active: reportActiveTab === 'reported' }"
          @click="setActiveTab('reported')"
        >
          {{ t("reported") }}
        </argon-button>
      </li>
      <li class="nav-item">
        <argon-button
          class="nav-link"
          :class="{ active: reportActiveTab === 'not_reported' }"
          @click="setActiveTab('not_reported')"
        >
          {{ t("not_reported") }}
        </argon-button>
      </li>
    </ul> -->

    <!-- <div
      v-if="reportActiveTab === 'not_reported'"
      class="d-flex align-items-center mb-3"
    >
      <label class="me-2">{{ t("selectDate") }}:</label>
      <input
        type="date"
        v-model="localSelectedDate"
        class="form-control"
        @change="applyFilter"
      />
    </div> -->

    <!-- Tabs Content -->
    <div class="mt-3">
      <div v-if="props.reportActiveTab === 'reported'">
        <!-- لودر يظهر فقط أثناء تحميل بيانات Not Reported Tasks -->
        <div v-if="props.isNotReportedLoading" class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else class="table-responsive p-3">
          <table class="table align-items-center table-hover mb-0">
            <thead class="thead-light">
              <tr>
                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("status") }}
            </th> -->
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("taskName") }}
                </th>

                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("department") }}
                </th>
                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("taskType") }}
            </th> -->
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("from") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("to") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("priority") }}
                </th>
                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("taskCreatedBy") }}
            </th> -->
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("lateTime") }}
                </th>

                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("notes") }}
            </th> -->

                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("employeeName") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("report") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                  v-if="isOwner || permissions['create-dailytaskevaluation']">
                  {{ t("evaluate") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in props.routineTasksReport" :key="task.id">
                <!-- استخدام routineTasks -->
                <!-- <td>
              <div class="mb-0 py-1">
                <div class="d-flex justify-content-center text-sm">
                  <argon-switch
                    v-if="isOwner || permissions['edit-dailytask']"
                    :checked="task.active"
                    @update:checked="() => toggleStatus(task.id)"
                  >
                  </argon-switch>
                </div>
              </div>
            </td> -->

                <td>
                  <div class="d-flex px-2 py-1 align-items-center justify-content-center position-relative">
                    <div
                      class="d-flex justify-content-center align-items-center task-name text-center w-100 cursor-pointer"
                      @click="openDescriptionModal(task)" title="Open Task Description">
                      <h6 dir="auto" class="mb-0 text-sm hover-effect mx-1">
                        {{ task.daily_task.task_name }}
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
                    {{ task.daily_task.department?.name || "No Department" }}
                  </p>
                </td>

                <!-- <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ task.task_type || "No Task Type" }}
              </p>
            </td> -->
                <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ formatTime(task.daily_task.from) }}
                  </p>
                </td>
                <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ formatTime(task.daily_task.to) }}
                  </p>
                </td>
                <td>
                  <p class="text-xs font-weight-bold mb-0" :class="task.daily_task.priority === 'critical'
                      ? 'text-danger'
                      : ''
                    ">
                    <!-- {{ formatReportDate(task.created_at) }} -->
                    {{ task.daily_task.priority || "No Priority" }}
                  </p>
                </td>

                <td>
                  <p class="text-xs font-weight-bold mb-0" :class="{
                    'text-success': calculateTaskStatus(
                      task.daily_task.from,
                      task.daily_task.to,
                      task.created_at
                    ).includes('early'),
                    'text-danger': calculateTaskStatus(
                      task.daily_task.from,
                      task.daily_task.to,
                      task.created_at
                    ).includes('late'),
                  }">
                    {{
                      calculateTaskStatus(
                        task.daily_task.from,
                        task.daily_task.to,
                        task.created_at
                      )
                    }}
                  </p>
                </td>
                <!-- <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ task.created_by?.name || "N/A" }}
              </p>
            </td> -->

                <!-- <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ task?.notes || "No Notes" }}
              </p>
            </td> -->

                <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ task?.submitted_by?.name || "No one submitted" }}
                  </p>
                </td>
                <td class="align-middle">
                  <a href="javascript:;" class="font-weight-bold text-lg me-2" :class="{
                    'text-success': task.status === 'done',
                    'text-danger': task.status === 'not_done',
                    'text-secondary': !['done', 'not_done'].includes(
                      task.status
                    ),
                  }" :aria-disabled="['done', 'not_done'].includes(task.status)" :style="{
                      pointerEvents: ['done', 'not_done'].includes(task.status)
                        ? 'none'
                        : 'auto',
                      opacity: ['done', 'not_done'].includes(task.status)
                        ? 0.6
                        : 1,
                    }" @click="
                      !['done', 'not_done'].includes(task.status) &&
                      openEvaluationModal(task.id)
                      ">
                    <i :class="{
                      'fa fa-check-circle': task.status === 'done',
                      'fa fa-times-circle': task.status === 'not_done',
                      'fa fa-circle': !['done', 'not_done'].includes(
                        task.status
                      ),
                    }"></i>
                  </a>

                  <!-- <a
                href="javascript:;"
                class="text-danger font-weight-bold text-xs"
                @click="confirmDelete(task)"
              >
                {{ t("delete") }}
              </a> -->
                </td>

                <td class="align-middle" v-if="isOwner || permissions['create-dailytaskevaluation']">
                  <a href="javascript:;" class="font-weight-bold text-lg me-2" :class="{
                    'text-success': task.today_report_status === 'done',
                    'text-danger': task.today_report_status === 'not_done',
                    'text-secondary': !['done', 'not_done'].includes(
                      task.today_report_status
                    ),
                  }" :aria-disabled="['done', 'not_done'].includes(task.today_report_status)
                      " :style="{
                      pointerEvents: ['done', 'not_done'].includes(
                        task.today_report_status
                      )
                        ? 'none'
                        : 'auto',
                      opacity: ['done', 'not_done'].includes(
                        task.today_report_status
                      )
                        ? 0.6
                        : 1,
                    }" @click="
                      !['done', 'not_done'].includes(
                        task.today_report_status
                      ) && openEvaluationModal(task.daily_task_id)
                      ">
                    <i :class="{
                      'fa fa-check-circle':
                        task.today_report_status === 'done',
                      'fa fa-times-circle':
                        task.today_report_status === 'not_done',
                      'fa fa-star ': !['done', 'not_done'].includes(
                        task.today_report_status
                      ),
                    }"></i>
                  </a>
                  <!-- ✅ الأيقونة الجديدة -->
                  <i class="fa fa-bolt text-warning" v-if="
                    props.rundomTask?.data?.dailytask_ids?.includes(
                      task.daily_task_id
                    ) && props.rundomTask?.data?.date == formatDateWithoutTime(task?.created_at)
                  " :title="t('randomTask')"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="props.reportActiveTab === 'not_reported'">
        <!-- Spinner أثناء التحميل -->
        <div v-if="props.isNotReportedLoading" class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else class="table-responsive p-3">
          <table class="table align-items-center table-hover mb-0">
            <thead class="thead-light">
              <tr>
                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("status") }}
            </th> -->
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("taskName") }}
                </th>

                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("department") }}
                </th>
                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("taskType") }}
            </th> -->
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("from") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("to") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("priority") }}
                </th>
                <!-- <th
                  class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                >
                  {{ t("reporttime") }}
                </th> -->
                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("taskCreatedBy") }}
            </th> -->
                <!-- <th
                  class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                >
                  {{ t("lateTime") }}
                </th> -->

                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("notes") }}
            </th> -->

                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("employeeName") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("report") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                  v-if="isOwner || permissions['create-dailytaskevaluation']">
                  {{ t("evaluate") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in props.notReportedTasks" :key="task.id">
                <!-- استخدام routineTasks -->
                <!-- <td>
              <div class="mb-0 py-1">
                <div class="d-flex justify-content-center text-sm">
                  <argon-switch
                    v-if="isOwner || permissions['edit-dailytask']"
                    :checked="task.active"
                    @update:checked="() => toggleStatus(task.id)"
                  >
                  </argon-switch>
                </div>
              </div>
            </td> -->

                <td>
                  <div class="d-flex px-2 py-1 align-items-center justify-content-center position-relative">
                    <div
                      class="d-flex justify-content-center align-items-center task-name text-center w-100 cursor-pointer"
                      @click="openDescriptionModal(task)" title="Open Task Description">
                      <h6 class="mb-0 text-sm hover-effect mx-1" style="direction: rtl">
                        {{ task.daily_task.task_name }}
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
                    {{ task.department?.name || "No Department" }}
                  </p>
                </td>

                <!-- <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ task.task_type || "No Task Type" }}
              </p>
            </td> -->
                <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ formatTime(task.daily_task.from) }}
                  </p>
                </td>
                <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ formatTime(task.daily_task.to) }}
                  </p>
                </td>
                <td>
                  <p class="text-xs font-weight-bold mb-0" :class="task.daily_task.priority === 'critical'
                      ? 'text-danger'
                      : ''
                    ">
                    <!-- {{ formatReportDate(task.created_at) }} -->
                    {{ task.daily_task.priority || "No Priority" }}
                  </p>
                </td>
                <!-- <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ formatReportDate(task.created_at) }}
                  </p>
                </td> -->

                <!-- <td>
                  <p
                    class="text-xs font-weight-bold mb-0"
                    :class="{
                      'text-success': calculateTaskStatus(
                        task.daily_task.from,
                        task.daily_task.to,
                        task.created_at
                      ).includes('early'),
                      'text-danger': calculateTaskStatus(
                        task.daily_task.from,
                        task.daily_task.to,
                        task.created_at
                      ).includes('late'),
                    }"
                  >
                    {{
                      calculateTaskStatus(
                        task.daily_task.from,
                        task.daily_task.to,
                        task.created_at
                      )
                    }}
                  </p>
                </td> -->
                <!-- <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ task.created_by?.name || "N/A" }}
              </p>
            </td> -->

                <!-- <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ task?.notes || "No Notes" }}
              </p>
            </td> -->

                <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ task?.submitted_by?.name || "No one submitted" }}
                  </p>
                </td>
                <td class="align-middle">
                  <a href="javascript:;" class="font-weight-bold text-lg me-2" :class="{
                    'text-success': task.status === 'done',
                    'text-danger': task.status === 'not_done',
                    'text-secondary': !['done', 'not_done'].includes(
                      task.status
                    ),
                  }" :aria-disabled="!['done', 'not_done'].includes(task.status)" :style="{
                      pointerEvents: !['done', 'not_done'].includes(task.status)
                        ? 'none'
                        : 'auto',
                      opacity: !['done', 'not_done'].includes(task.status)
                        ? 0.6
                        : 1,
                    }" @click="
                      !['done', 'not_done'].includes(task.status) &&
                      openEvaluationModal(task.id)
                      ">
                    <i :class="{
                      'fa fa-check-circle': task.status === 'done',
                      'fa fa-times-circle': task.status === 'not_done',
                      'fa fa-circle': !['done', 'not_done'].includes(
                        task.status
                      ),
                    }"></i>
                  </a>

                  <!-- <a
                href="javascript:;"
                class="text-danger font-weight-bold text-xs"
                @click="confirmDelete(task)"
              >
                {{ t("delete") }}
              </a> -->
                </td>

                <td v-if="isOwner || permissions['create-dailytaskevaluation']" class="align-middle">
                  <a href="javascript:;" class="font-weight-bold text-lg me-2" :class="{
                    'text-success': task.today_report_status === 'done',
                    'text-danger': task.today_report_status === 'not_done',
                    'text-secondary': !['done', 'not_done'].includes(
                      task.today_report_status
                    ),
                  }" :aria-disabled="['done', 'not_done'].includes(task.today_report_status)
                      " :style="{
                      pointerEvents: ['done', 'not_done'].includes(
                        task.today_report_status
                      )
                        ? 'none'
                        : 'auto',
                      opacity: ['done', 'not_done'].includes(
                        task.today_report_status
                      )
                        ? 0.6
                        : 1,
                    }" @click="
                      !['done', 'not_done'].includes(
                        task.today_report_status
                      ) && openEvaluationModal(task.daily_task_id)
                      ">
                    <i :class="{
                      'fa fa-check-circle':
                        task.today_report_status === 'done',
                      'fa fa-times-circle':
                        task.today_report_status === 'not_done',
                      'fa fa-star ': !['done', 'not_done'].includes(
                        task.today_report_status
                      ),
                    }"></i>
                  </a>

                  <!-- <a
                href="javascript:;"
                class="text-danger font-weight-bold text-xs"
                @click="confirmDelete(task)"
              >
                {{ t("delete") }}
              </a> -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="
        props.reportActiveTab === 'evaluated_Task' &&
        (isOwner || permissions['view-alldailytaskevaluation'])
      ">
        <!-- Spinner أثناء التحميل -->
        <div v-if="props.isNotReportedLoading" class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else class="table-responsive p-3">
          <table class="table align-items-center table-hover mb-0">
            <thead class="thead-light">
              <tr>
                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("status") }}
            </th> -->
                <!-- <th
                  class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                >
                  {{ t("taskNumber") }}
                </th> -->
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("taskName") }}
                </th>

                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("department") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("priority") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("reportedBy") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("evaluatedAt") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("evaluatedBy") }}
                </th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("comment") }}
                </th>
                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("taskCreatedBy") }}
            </th> -->
                <!-- <th
                  class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                >
                  {{ t("lateTime") }}
                </th> -->

                <!-- <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              {{ t("notes") }}
            </th> -->

                <!-- <th
                  class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                >
                  {{ t("employeeName") }}
                </th> -->
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                  {{ t("rating") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in props.evaluatedTasks" :key="task.id">
                <!-- استخدام routineTasks -->
                <!-- <td>
              <div class="mb-0 py-1">
                <div class="d-flex justify-content-center text-sm">
                  <argon-switch
                    v-if="isOwner || permissions['edit-dailytask']"
                    :checked="task.active"
                    @update:checked="() => toggleStatus(task.id)"
                  >
                  </argon-switch>
                </div>
              </div>
            </td> -->

                <!-- <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ task.daily_task?.task_no || "No Department" }}
                  </p>
                </td> -->

                <!-- <td>
                  <div
                    class="d-flex px-2 py-1 align-items-center justify-content-center position-relative"
                  >
                    <div
                      class="d-flex justify-content-center align-items-center task-name text-center w-100 cursor-pointer"
                      @click="openDescriptionModal(task)"
                      title="Open Task Description"
                    >
                      <h6 
                        class="mb-0 text-sm mx-1"
                        style="direction: rtl"
                      >
                        {{ task.daily_task.task_name }}
                      </h6>
                      
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                </td> -->

                <td>
                  <div class="d-flex px-2 py-1 align-items-center justify-content-center position-relative">
                    <div
                      class="d-flex justify-content-center align-items-center task-name text-center w-100 cursor-pointer"
                      @click="openDescriptionModal(task)" title="Open Task Description">
                      <h6 class="mb-0 text-sm hover-effect mx-1" dir="auto">
                        {{ task.daily_task.task_name }}
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
                    {{ task.department?.name || "No Department" }}
                  </p>
                </td>

                <td>
                  <p class="text-xs font-weight-bold mb-0" :class="task.daily_task.priority === 'critical'
                      ? 'text-danger'
                      : ''
                    ">
                    <!-- {{ formatReportDate(task.created_at) }} -->
                    {{ task.daily_task.priority || "No Priority" }}
                  </p>
                </td>

                <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ task.report?.user?.name || "No Employee" }}
                  </p>
                </td>

                <!-- <td>
              <p class="text-xs font-weight-bold mb-0">
                {{ task.task_type || "No Task Type" }}
              </p>
            </td> -->
                <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ formatDate(task.evaluation.created_at) }}
                  </p>
                </td>
                <!-- <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ formatTime(task.daily_task.to) }}
                  </p>
                </td> -->
                <!-- <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ formatReportDate(task.created_at) }}
                  </p>
                </td> -->

                <!-- <td>
                  <p
                    class="text-xs font-weight-bold mb-0"
                    :class="{
                      'text-success': calculateTaskStatus(
                        task.daily_task.from,
                        task.daily_task.to,
                        task.created_at
                      ).includes('early'),
                      'text-danger': calculateTaskStatus(
                        task.daily_task.from,
                        task.daily_task.to,
                        task.created_at
                      ).includes('late'),
                    }"
                  >
                    {{
                      calculateTaskStatus(
                        task.daily_task.from,
                        task.daily_task.to,
                        task.created_at
                      )
                    }}
                  </p>
                </td> -->

                <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ task?.evaluation.evaluator?.name }}
                  </p>
                </td>

                <td>
                  <p class="text-xs font-weight-bold mb-0" dir="rtl">
                    {{ task?.evaluation?.comment }}
                  </p>
                </td>

                <td>
                  <p class="text-xs font-weight-bold mb-0">
                    {{ task?.evaluation?.rating }}/10
                  </p>
                </td>

                <!-- <td class="align-middle">
                  <a
                    href="javascript:;"
                    class="font-weight-bold text-lg me-2"
                    :class="{
                      'text-success': task.status === 'done',
                      'text-danger': task.status === 'not_done',
                      'text-secondary': !['done', 'not_done'].includes(
                        task.status
                      ),
                    }"
                    :aria-disabled="!['done', 'not_done'].includes(task.status)"
                    :style="{
                      pointerEvents: !['done', 'not_done'].includes(task.status)
                        ? 'none'
                        : 'auto',
                      opacity: !['done', 'not_done'].includes(task.status)
                        ? 0.6
                        : 1,
                    }"
                    @click="
                      !['done', 'not_done'].includes(task.status) &&
                      openEvaluationModal(task.id)
                    "
                  >
                    <i
                      :class="{
                        'fa fa-check-circle': task.status === 'done',
                        'fa fa-times-circle': task.status === 'not_done',
                        'fa fa-circle': !['done', 'not_done'].includes(
                          task.status
                        ),
                      }"
                    ></i>
                  </a>

                </td> -->
                <!-- <a
              href="javascript:;"
              class="text-danger font-weight-bold text-xs"
              @click="confirmDelete(task)"
            >
              {{ t("delete") }}
            </a> -->
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
        <ArgonModal v-if="showEditPopup" :title="selectedTask.daily_task.task_name" @close="closeEditPopup"
          class="routine-task-modal">
          <template #default>
            <div class="mb-3 modal-content-scroll">
              <!-- <label class="form-label">{{ t("taskName") }}:</label>
              <input
                v-model="selectedTask.task_name"
                class="form-control mb-3"
              /> -->

              <!-- <label class="form-label">{{ t("description") }}:</label>
              <input
                v-model="selectedTask.description"
                class="form-control mb-3"
              /> -->

              <!-- <div v-if="employeeOptions.length > 0" class="mb-3">
                <label class="form-label">{{ t("assignManager") }}:</label>
                <argon-select
                  v-model="selectedTask.assigned_to_id"
                  :options="employeeOptions"
                  :placeholder="t('assignManager')"
                  class="form-control"
                />
              </div> -->

              <!-- <label class="form-label">{{ t("reportTaskType") }}:</label>
              <argon-select
                v-model="taskStatus"
                :options="reportTypeOptions"
                class="form-control mb-3"
                :placeholder="t('selectReportTaskType')"
              /> -->

              <label class="form-label">{{ t("rating") }}:</label>
              <ArgonInput v-model="taskRate" type="number" min="0" max="10" class="form-control mb-3"
                :placeholder="t('rating')"></ArgonInput>

              <label class="form-label">{{ t("comment") }}:</label>
              <textarea v-model="taskComment" class="form-control mb-3" :placeholder="t('comment')"></textarea>

              <!-- <div
              v-show="selectedTask.task_type === 'weekly'"
              class="form-group mb-3"
              >
              <label class="form-label">{{ t("recurrentDays") }}:</label>
              <div class="d-flex flex-wrap">
                <div
                  v-for="day in daysOfWeek"
                  :key="day.value"
                  class="form-check me-3"
                >
                  <argon-checkbox
                    :id="'day-' + day.value"
                    :name="'recurrentDays'"
                    :value="day.value"
                    v-model="selectedTask.recurrent_days"
                  >
                    {{ day.label }}
                  </argon-checkbox>
                </div>
              </div>
            </div> -->

              <!-- <div
                v-show="selectedTask.task_type === 'monthly'"
                class="form-group mb-3"
              >
                <label class="form-label">{{ t("dayOfMonth") }}:</label>
                <input
                  type="number"
                  v-model="selectedTask.day_of_month"
                  class="form-control"
                  :placeholder="t('enterDayOfMonth')"
                  min="1"
                  max="31"
                />
              </div> -->

              <!-- <label class="form-label">{{ t("from") }}:</label>
              <input
                v-model="selectedTask.from"
                type="time"
                class="form-control mb-3"
              /> -->

              <!-- <label class="form-label">{{ t("to") }}:</label>
              <input
                v-model="selectedTask.to"
                type="time"
                class="form-control mb-3"
              /> -->

              <!-- <label class="form-label">{{ t("startDate") }}:</label>
              <input
                v-model="selectedTask.start_date"
                type="date"
                class="form-control mb-3"
              /> -->

              <!-- <label class="form-label">{{ t("deadline") }}:</label>
              <input
                v-model="selectedTask.deadline"
                type="date"
                class="form-control mb-3"
              /> -->

              <!-- <label style="display: none" class="form-label"
                >{{ t("status") }}:</label
              >
              <argon-switch
                style="display: none"
                v-model:checked="selectedTask.status"
              >
                {{
                  selectedTask.status === "done" ? t("active") : t("inactive")
                }}
              </argon-switch> -->
            </div>
          </template>

          <template #footer>
            <argon-button variant="secondary" @click="closeEditPopup">
              {{ t("close") }}
            </argon-button>

            <argon-button variant="success" @click="evaluateTask" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
              {{ isLoading ? t("saving") : t("evaluate") }}
            </argon-button>
          </template>

          <template #title>
            <i class="fas fa-user-edit me-2"></i>
            {{ t("editTask") }}
          </template>
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
                <argon-button class="nav-link" :class="{ active: activeTab === 'evaluation' }"
                  @click="activeTab = 'evaluation'">
                  {{ t("evaluation") }}
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

                  <dt v-if="props.reportActiveTab === 'evaluated_Task'" class="col-sm-3">
                    {{ t("taskStatus") }}:
                  </dt>
                  <dd v-if="selectedTaskStatus" class="col-sm-9">
                    {{ selectedTaskStatus }}
                  </dd>
                  <dd v-else-if="props.reportActiveTab === 'evaluated_Task'" class="col-sm-9">
                    {{ t("notReported") }}
                  </dd>

                  <dt class="col-sm-3">{{ t("notes") }}:</dt>
                  <dd class="col-sm-9">
                    {{ selectedTaskNotes || "No Notes" }}
                  </dd>

                  <dt v-if="
                    selectedTaskFound !== null &&
                    reportActiveTab === 'reported'
                  " class="col-sm-3">
                    {{ t("found") }}:
                  </dt>
                  <dd v-if="
                    selectedTaskFound !== null &&
                    reportActiveTab === 'reported'
                  " class="col-sm-9">
                    {{ selectedTaskFound === 1 ? "yes" : "no" }}
                  </dd>
                  <!-- task_found -->
                  <!-- <dt class="col-sm-3">{{ t("department") }}:</dt>
                  <dd class="col-sm-9">
                    {{ selectedTaskDepartment }}
                  </dd> -->

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
                  <dt v-if="selectedTaskReportedTime" class="col-sm-3">
                    {{ t("reporttime") }}:
                  </dt>
                  <dd v-if="selectedTaskReportedTime" class="col-sm-9">
                    {{ formatDate(selectedTaskReportedTime) }}
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
                </dl>
              </div>
              <div v-if="activeTab === 'evaluation'">
                <div v-if="taskEvaluations.length > 0">
                  <ul class="log-list">
                    <li v-for="evaluation in taskEvaluations" :key="evaluation.id" class="mb-3"
                      style="list-style-type: none">
                      <!-- A small card for each evaluation -->
                      <div class="card">
                        <div class="card-body p-2">
                          <table class="table table-sm mb-0">
                            <tbody>
                              <tr>
                                <th class="text-nowrap" style="width: 35%">
                                  Rating
                                </th>
                                <td>{{ evaluation.rating }}/10</td>
                              </tr>
                              <tr>
                                <th>Comment</th>
                                <td>{{ evaluation.comment }}</td>
                              </tr>
                              <tr>
                                <th>Evaluator</th>
                                <td>
                                  {{ evaluation.evaluator?.name || "N/A" }}
                                </td>
                              </tr>
                              <tr>
                                <th>Created</th>
                                <!-- Use your existing date formatter method here -->
                                <td>{{ formatDate(evaluation.created_at) }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
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
import {
  computed,
  ref,
  onBeforeMount,
  watch,
  // defineEmits,
  defineProps,
} from "vue";
import { useStore } from "vuex";
import Swal from "sweetalert2";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
// import ArgonSwitch from "@/components/ArgonSwitch.vue";
// import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonInput from "@/components/ArgonInput.vue";
// import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
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
// const emit = defineEmits(["apply-date-filter"]); // Define the event

const props = defineProps({
  routineTasksReport: {
    // تغيير اسم الخاصية من tasks إلى routineTasks
    type: Array,
    required: true,
  },
  notReportedTasks: {
    // تغيير اسم الخاصية من tasks إلى routineTasks
    type: Array,
    required: true,
  },
  isNotReportedLoading: {
    type: Boolean,
    required: true,
  },

  evaluatedTasks: {
    type: Array,
    required: true,
  },
  // ,
  // selectedDateForNotReported: {
  //   type: String,
  // }
  reportActiveTab: {
    type: String,
    required: true,
  },

  selectedDateForNotReported: {
    type: String,
    required: true,
  },
  selectedDate: {
    type: String,
    required: true,
  },
  rundomTask: {
    type: Object,
    required: true,
  },

  // ,
  // showAllTasks: {
  //   type: Boolean,
  //   required: true,
  // },
  // pagination: {
  //   // تغيير اسم الخاصية من tasks إلى routineTasks
  //   type: Object,
  //   required: true,
  // },
});

// const rundomTask = ref([]);

console.log("props.rundomTask:", { ...props.rundomTask });

console.log("props.selectedDate:", typeof (props.selectedDate));

// onMounted( async() => {
//     await getRundomTask();
// });

// const showAllTasks = ref(false);

// const filteredTasks = computed(() => {
//   if (props.showAllTasks) {
//     return props.routineTasksReport; // Show all tasks
//   } else {
//     const today = new Date().toISOString().split("T")[0]; // Get today's date
//     return props.routineTasksReport.filter((task) => {
//       const taskDate = new Date(task.created_at).toISOString().split("T")[0]; // Get task date
//       return taskDate === today; // Filter tasks reported today
//     });
//   }
// });

// const taskCountByDepartment = computed(() => {
//   const counts = {};

//   // Iterate through the tasks and count by department
//   props.routineTasksReport.forEach((task) => {
//     const departmentName = task.daily_task.department?.name || "No Department";
//     counts[departmentName] = (counts[departmentName] || 0) + 1;
//   });

//   return counts;
// });

// const totalPages = computed(() => {
//   // Ensure total pages is calculated correctly
//   return Math.ceil(props.pagination.total / props.pagination.per_page);
// });

// console.log("props.routineTasks:", props.routineTasksReport);
// console.log("props.notReportedTasks:", props.notReportedTasks);
console.log("propssssssssss.evaluatedTasks:", props.evaluatedTasks);

const userData = computed(() => store.getters.user);
const isOwner = computed(() => store.getters.isOwner);

// const reportTypeOptions = [
//   { value: "done", label: "Done" },
//   { value: "not_done", label: "Not Done" },
// ];

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
});

// تعريف المتغيرات الجديدة لتخزين بيانات المهمة
const selectedTaskName = ref("");
const selectedDescription = ref(""); // لتخزين وصف المهمة
const selectedTaskNumber = ref(null);
const selectedTaskStartDate = ref(null);
const selectedTaskDeadline = ref(null);
const selectedTaskCreationDate = ref(null);
const selectedTaskReportedTime = ref(null);
const selectedTaskId = ref(null);
const showDescriptionModal = ref(false);
// const taskLogs = ref([]); // لتخزين سجلات المهمة
const taskEvaluations = ref([]); // لتخزين سجلات التقييمات
const selectedTaskRecurrentDays = ref([]);
const selectedTaskStatus = ref(null);
const selectedTaskAssignedTo = ref(null);
const selectedTaskDayOfMonth = ref(null);
// const taskNotes = ref("");
const taskRate = ref("");
// const taskStatus = ref("");
const taskComment = ref("");
// const selectedTaskDepartment = ref(null);
const loadingTaskId = ref(null);
const selectedTaskNotes = ref(null);
const selectedTaskFound = ref(null);
// const isNotReportedLoading = ref(false);

// const reportActiveTab = ref(sessionStorage.getItem("reportActiveTab") || "reported");

// const setActiveTab = (tab) => {
//     reportActiveTab.value = tab;
//     sessionStorage.setItem("reportActiveTab", tab); // حفظ التبويب الحالي
// };

const activeTab = ref("info"); // علامة تبويب البداية

// const toggleStatus = async (taskId) => {
//   console.log("taskId:", taskId);
//   try {
//     // تنفيذ تحديث الحالة هنا (إرسال الطلب إلى الـ API أو تحديث Vuex)
//     const task = {
//       id: taskId,
//       company_id: currentCompanyId.value,
//     };

//     const updatedStatus = await store.dispatch("updateTaskStatus", task);
//     if (updatedStatus) {
//       Swal.fire({
//         icon: "success",
//         title: t("statusUpdatedSuccessfully"),
//         showConfirmButton: false,
//         timer: 1500,
//         timerProgressBar: true,
//       });
//       await store.dispatch("fetchRoutineTasks"); // تأكد من وجود action fetchTasks في Vuex
//     }
//   } catch (error) {
//     console.error("Error updating status:", error);
//     Swal.fire({
//       icon: "error",
//       title: t("errorUpdatingStatus"),
//       text: error.message,
//     });
//   }
// };

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
// const selectedManager = ref(null);

const selectedTask = ref(null); // لتخزين المهمة المحددة للتعديل

const currentLanguage = computed(() => store.getters.currentLanguage);
const t = (key) => translations[currentLanguage.value][key];

// const dataFromApi = computed(() => store.getters.dataFromApi);

// const employeeOptions = computed(() => {
//   return store.getters.dataFromApi.map((employee) => ({
//     value: employee.id,
//     label: employee.name,
//   }));
// });

const openEvaluationModal = (taskId) => {
  console.log("Opening Evaluation Modal for Task ID:", taskId);

  // Determine which task list to search
  const taskList =
    props.reportActiveTab === "reported"
      ? props.routineTasksReport
      : props.notReportedTasks;

  // Find the task in the relevant list
  const task = taskList.find((t) => t.daily_task_id === taskId);

  if (!task) {
    console.error("Task not found");
    Swal.fire({
      title: "Error",
      text: t("elvatedAllready"),
      icon: "error",
      className: "custom-swal fw-bold text-center",
    });
    return;
  }

  // Set selected task
  selectedTask.value = { ...task };
  console.log("Selected Task:", selectedTask.value);

  // Show modal
  showEditPopup.value = true;
};

const closeEditPopup = () => {
  showEditPopup.value = false;
  selectedTask.value = null;
  currentEditingTaskId.value = null;
  taskRate.value = "";
  taskComment.value = "";
};

const isLoading = ref(false);

const evaluateTask = async () => {
  isLoading.value = true;

  // تجهيز البيانات التي سيتم إرسالها
  const taskData = {
    id: selectedTask.value.daily_task_id,
    rating: taskRate.value,
    comment: taskComment.value,
    task_for:
      props.reportActiveTab === "not_reported" ||
        props.reportActiveTab === "reported"
        ? props.selectedDateForNotReported
        : props.selectedDate,
    // ...selectedTask.value,
  };

  try {
    console.log("TaskData:", taskData);

    const result = await store.dispatch("evaluateTask", taskData);
    console.log("result:", result);

    if (result.status === 201) {
      // تحديث بيانات الموظفين
      Swal.fire({
        icon: "success",
        title: t("taskReportedSuccessfully"),
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      closeEditPopup();
      await store.dispatch("fetchEvaluatedTasks");

      // await store.dispatch("fetchTasks"); // تأكد من وجود action fetchTasks في Vuex
    } else {
      Swal.fire({
        icon: "error",
        title: result.response.data.message,
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

// const confirmDelete = (task) => {
//   Swal.fire({
//     title: t("deleteConfirmationTitle"),
//     text: t("deleteConfirmationText"),
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonText: t("delete"),
//     cancelButtonText: t("close"),
//   }).then(async (result) => {
//     if (result.isConfirmed) {
//       await deleteTask(task.id);
//     }
//   });
// };

// const deleteTask = async (taskId) => {
//   console.log(taskId);
//   try {
//     await store.dispatch("deleteRoutineTask", taskId);
//     await store.dispatch("fetchRoutineTasks", props.pagination.current_page); // جلب البيانات مع الصفحة الحالية

//     componentKey.value += 1;
//     Swal.fire({
//       icon: "success",
//       title: t("taskDeletedSuccessfully"),
//       showConfirmButton: false,
//       timer: 1500,
//       timerProgressBar: true,
//     });
//   } catch (error) {
//     console.error("Error deleting task:", error);
//     Swal.fire({
//       icon: "error",
//       title: t("errorDeletingTask"),
//       text: error.message,
//     });
//   }
// };

// const getTaskLogs = async (taskId) => {
//   try {
//     loadingTaskId.value = taskId; // تحديد الرقم المعرف للمهمة المحددة

//     const response = await store.dispatch("fetchTaskLogs", taskId);
//     if (response.status === 200) {
//       console.log("Task logs fetched successfully:", response.data);
//       taskLogs.value = response.data.revisions;
//     } else {
//       console.error("Failed to fetch logs, status:", response.status);
//     }
//   } catch (error) {
//     console.error("Error fetching task logs:", error);
//   } finally {
//     loadingTaskId.value = null; // تحديد الرقم المعرف للمهمة المحددة
//   }
// };

const openDescriptionModal = async (task) => {
  selectedTaskName.value = task.daily_task.task_name; // تعيين اسم المهمة
  selectedDescription.value = task.daily_task.description; // تعيين وصف المهمة
  selectedTaskNumber.value = task.daily_task.task_no;
  selectedTaskStartDate.value = task.daily_task.start_date; // تعيين تاريخ بدء المهمة
  selectedTaskDeadline.value = task.daily_task.deadline; // تعيين تاريخ انتهاء المهمة
  selectedTaskCreationDate.value = task.daily_task.created_at; // تعيين تاريخ إنشاء المهمة
  selectedTaskReportedTime.value = task?.created_at;
  selectedTaskId.value = task.daily_task.id;
  selectedTaskStatus.value = task.report?.status;
  selectedTaskAssignedTo.value = task.daily_task.assigned_to;
  selectedTaskRecurrentDays.value = task.daily_task.recurrent_days;
  selectedTaskDayOfMonth.value = task.daily_task.day_of_month;
  // selectedTaskDepartment.value = task.daily_task.department.department_name;
  selectedTaskNotes.value = task.notes;
  selectedTaskFound.value = task.task_found;

  // await getTaskLogs(task.id);
  await getTaskEvaluation(task.daily_task_id);
  showDescriptionModal.value = true; // إظهار المودال
};

watch(
  () => taskEvaluations.value,
  (newLogs) => {
    console.log("Updated logs:", newLogs);
  }
);

const getTaskEvaluation = async (taskId) => {
  try {
    loadingTaskId.value = taskId; // تحديد الرقم المعرف للمهمة المحددة
    const response = await store.dispatch("fetchEvaluation", taskId);
    if (response.status === 200) {
      console.log("Task evaluation fetched successfully:", response.data);
      taskEvaluations.value = response.data.evaluations;
    } else {
      console.error("Failed to fetch logs, status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching task logs:", error);
  } finally {
    loadingTaskId.value = null; // تحديد الرقم المعرف للمهمة المحددة
  }
};

const closeDescriptionModal = () => {
  showDescriptionModal.value = false; // إغلاق المودال
  selectedTaskName.value = "";
  selectedDescription.value = "";
  selectedTaskNumber.value = null;
  selectedTaskStartDate.value = null;
  selectedTaskDeadline.value = null;
  selectedTaskCreationDate.value = null;
  selectedTaskReportedTime.value = null;
  selectedTaskId.value = null;
  selectedTaskStatus.value = null;
  selectedTaskAssignedTo.value = null;
  selectedTaskRecurrentDays.value = [];
  selectedTaskDayOfMonth.value = null;
  // selectedTaskDepartment.value = null;
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



// In your script
function formatReportDate(dateTimeString) {
  const date = new Date(dateTimeString);

  // Extract the date part (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  // Format the time part (h:mm AM/PM)
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format

  // Combine the date and time parts
  return `${year}-${month}-${day} at ${hours}:${minutes} ${ampm}`;
}

// Example usage:
const createdAt = "2025-01-19T18:00:00Z"; // Example input
console.log(formatReportDate(createdAt)); // Output: "2025-01-19 at 6:00 PM"

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

const formatDateWithoutTime = (dateString) => {
  if (!dateString) return null;

  // تحويل النص إلى كائن تاريخ
  const date = new Date(dateString);

  // التأكد من أن التاريخ صالح
  if (isNaN(date.getTime())) return null;

  // تنسيق التاريخ إلى "YYYY-MM-DD"
  return date.toISOString().split("T")[0]; // مثل: "2025-05-13"
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
    taskReportedSuccessfully: "Task reported successfully",
    status: "Status",
    taskCreatedBy: "Created By",
    description: "Description",
    taskDetails: "Task Details",
    createdAt: "Task Created At",
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
    taskNumber: "Task Number",
    taskStartDate: "Task Start Date",
    taskDeadline: "Task Deadline",
    reportTaskType: "Report Task Type",
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
    report: "Report",
    reportTask: "Report Task",
    selectReportTaskType: "Select Report Task Type",
    notes: "Notes",
    taskStatus: "Task Status",

    notReported: "Not Reported",
    enterNotes: "Enter notes",
    employeeName: "Employee Name",
    department: "Department",
    at: "at",
    reporttime: "Report Time",
    lateTime: "Late Time",
    fromDate: "From Date",
    toDate: "To Date",
    applyFilter: "Apply Filter",
    found: "Task Found",
    reported: "Reported",
    not_reported: "Not Reported",
    evaluation: "Evaluation",
    evaluate: "Evaluate",
    evaluatedAt: "Evaluated At",
    evaluatedBy: "Evaluated By",
    reportedBy: "Reported By",
    evaluated: "Evaluated",
    taskFound: "There is task ?",
    selectTaskFound: "Select Task Found",
    project: "Project",
    projectNotFound: "No project found",
    rating: "Rating",
    comment: "Comment",
    elvatedAllready: "this task is evaluated already",
    priority: "Priority",
    randomTask: "random task to evaluate",
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
    taskReportedSuccessfully: "تم تقرير المهمة بنجاح",
    status: "حالة المهمة",
    taskCreatedBy: "تم الإنشاء بواسطة",
    description: "وصف المهمة",
    taskDetails: "تفاصيل المهمة",
    createdAt: "تاريخ إنشاء المهمة",
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
    taskNumber: "رقم المهمة",
    taskStartDate: "تاريخ بدء المهمة",
    taskDeadline: "تاريخ انتهاء المهمة",
    reportTaskType: "تقرير المهمة",
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
    report: "تقرير",
    reportTask: "تقرير المهمة",
    selectReportTaskType: "حدد نوع المهمة",
    notes: "ملاحظات",
    taskStatus: "حالة المهمة",
    notReported: "لم يتم التقرير عن المهمة",
    enterNotes: "ادخل ملاحظات",
    employeeName: "اسم الموظف",
    department: "القسم",
    at: "في",
    reporttime: "وقت التقرير",
    lateTime: "التأخير",
    fromDate: "من تاريخ",
    toDate: "إلى تاريخ",
    applyFilter: "تطبيق الفلتر",
    found: "تم العثور على المهمة",
    reported: "تم التقرير عن المهمة",
    not_reported: "لم يتم التقرير عن المهمة",
    evaluation: "تقييم",
    evaluate: "تقييم",
    evaluatedAt: "تم التقييم في",
    evaluatedBy: "تم التقييم بواسطة",
    reportedBy: "تم التقرير بواسطة",
    evaluated: "تم التقييم",
    taskFound: "هناك مهمة؟",
    selectTaskFound: "حدد المهمة الموجودة",
    project: "المشروع",
    projectNotFound: "لا يوجد مشروع",
    rating: "التقييم",
    comment: "التعليق",
    elvatedAllready: "هذه المهمة تم التقييم عنها بالفعل",
    priority: "الاولوية",
    randomTask: "موجود في المهام العشوائية",
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

const calculateTaskStatus = (fromTime, toTime, createdAt) => {
  if (!fromTime || !toTime || !createdAt) return "N/A";

  // Extract the time part from the `created_at` timestamp
  const createdTime = new Date(createdAt).toTimeString().split(" ")[0]; // Extracts "HH:MM:SS"

  // Parse the times into Date objects
  const fromDate = new Date(`1970-01-01T${fromTime}`);
  const toDate = new Date(`1970-01-01T${toTime}`);
  const reportDate = new Date(`1970-01-01T${createdTime}`);

  // Calculate the difference in milliseconds
  const earlyDifference = fromDate - reportDate; // Positive if early
  const lateDifference = reportDate - toDate; // Positive if late

  // Check if the task is early
  if (earlyDifference > 0) {
    const earlyMinutes = Math.floor(earlyDifference / (1000 * 60));
    if (earlyMinutes < 60) {
      return `${earlyMinutes} mins early`;
    } else {
      const earlyHours = Math.floor(earlyMinutes / 60);
      const remainingMinutes = earlyMinutes % 60;
      return `${earlyHours}h ${remainingMinutes}m early`;
    }
  }
  // Check if the task is late
  else if (lateDifference > 0) {
    const lateMinutes = Math.floor(lateDifference / (1000 * 60));
    if (lateMinutes < 60) {
      return `${lateMinutes} mins late`;
    } else {
      const lateHours = Math.floor(lateMinutes / 60);
      const remainingMinutes = lateMinutes % 60;
      return `${lateHours}h ${remainingMinutes}m late`;
    }
  }
  // Otherwise, the task is on time
  else {
    return "On Time";
  }
};

// const isTaskLate = (toTime, createdAt) => {
//   if (!toTime || !createdAt) return false;

//   // Extract the time part from the `created_at` timestamp
//   const createdTime = new Date(createdAt).toTimeString().split(" ")[0]; // Extracts "HH:MM:SS"

//   // Parse the "to" time and the extracted time from `created_at` into Date objects
//   const toDate = new Date(`1970-01-01T${toTime}`);
//   const reportDate = new Date(`1970-01-01T${createdTime}`);

//   // Check if the report time is later than the "to" time
//   return reportDate > toDate;
// };

// const fromDate = ref("");
// const toDate = ref("");

// const filteredTasks = computed(() => {
//   if (!fromDate.value || !toDate.value) {
//     return props.routineTasksReport; // Return all tasks if no date range is selected
//   }

//   const from = new Date(fromDate.value);
//   const to = new Date(toDate.value);

//   return props.routineTasksReport.filter((task) => {
//     const taskDate = new Date(task.report_date);
//     return taskDate >= from && taskDate <= to;
//   });
// });

// const startDate = ref("");
// const endDate = ref("");

// const applyDateFilter = async () => {
//   console.log("Apply Date Filter");
//   console.log("Start Date:", startDate.value);
//   console.log("End Date:", endDate.value);
//   const filterData = {
//     start_date: startDate.value,
//     end_date: endDate.value,
//   };

//   await store.dispatch("fetchTaskReports", filterData);
// };

// const applyDateFilter = () => {
//   // This method is optional and can be used to trigger filtering manually
//   // If you want to filter automatically, you can remove this method
//   // and rely on the computed property `filteredTasks`.
// };

// حساب عدد الصفحات
// const totalPages = computed(() => {
//   return props.pagination.last_page;
// });

// const localSelectedDate = ref(
//   props.selectedDateForNotReported || new Date().toISOString().split("T")[0]
// );

// watch(
//   () => props.selectedDateForNotReported,
//   (newVal) => {
//     localSelectedDate.value = newVal;
//   }
// );

// const applyFilter = () => {
//     console.log("Applying filter for date:", localSelectedDate.value);
//     isNotReportedLoading.value = true; // تشغيل اللودر

//     emit("apply-date-filter", localSelectedDate.value);

//     // اجعل التبويب يبقى على not_reported بعد الفلترة
//     if (sessionStorage.getItem("reportActiveTab") === "not_reported") {
//         reportActiveTab.value = "not_reported";
//     }

// };
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

/* .log-item {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #333;
} */

.log-item {
  transition: all 0.3s ease;
}

.log-item:hover {
  transform: translateY(-2px);
}

blockquote {
  border-left: 3px solid #1976d2;
  padding-left: 1rem;
  margin-left: 0.5rem;
}

.v-card {
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
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

td {
  word-wrap: break-word;
  /* السماح للنص بالانكسار */
  white-space: pre-wrap;
  /* المحافظة على التنسيق والانكسار */
  max-width: 200px;
  /* يمكنك تخصيص العرض المناسب للعمود */
  overflow-wrap: break-word;
  /* السماح بانكسار النص */
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

.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-text {
  font-size: 0.9rem;
  color: #666;
}

.badge {
  font-size: 0.9rem;
  padding: 0.5em 0.75em;
}
</style>
