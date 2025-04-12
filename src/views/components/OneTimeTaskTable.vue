<template>
  <!-- الحاوية الرئيسية للمكوّن -->
  <div class="routine-task-container" :key="componentKey">
    <!-- الشريط الجانبي (الأزرار) -->
    <div class="sidebar">
      <button
        v-for="tab in [
          'Inbox',
          'Own',
          'Archive',
          'Started',
          'Review',
          'Done',
          'Upcoming',
          'Label',
        ]"
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- المحتوى الرئيسي -->
    <div class="main-content">
      <!-- عندما لا توجد مهام مفلترة -->
      <div v-if="filteredTasks.length === 0" class="no-tasks-container">
        <img
          src="https://ik.imagekit.io/ts7pphpbz3/man-despair-data-leak_11197-392.jpg?updatedAt=1742827650800"
          alt="no-tasks"
          class="no-tasks-image"
        />
        <p class="no-tasks-text">
          {{ t("noTasksHere") }}
        </p>
      </div>

      <!-- قائمة المهام -->
      <div v-else>
        <div v-for="task in filteredTasks" :key="task.id" class="task-item">
          <!-- رأس المهمة -->
          <div
            class="task-header"
            :class="[
              { expanded: expandedTaskId === task.id },
              { 'urgent-task': task.priority === 'urgent' },
            ]"
            @click="toggleTaskExpand(task)"
          >
            <!-- أيقونة النجمة -->
            <i
              class="bi"
              :class="
                task.loadingStar
                  ? 'bi-arrow-repeat spinner-icon'
                  : task.is_starred
                    ? 'bi-star-fill star-icon'
                    : 'bi-star star-icon'
              "
              @click.stop="toggleStar(task)"
              title="Star/Unstar"
            ></i>

            <!-- عنوان المهمة + تاريخ -->
            <span class="task-title" :class="{ 'text-white': task.is_urgent }">
              {{ task.title }}
              <small
                class="task-date"
                :class="{ 'text-white': task.is_urgent }"
                >{{ formatDateWithTime(task.start_date) }}</small
              >

              <!-- priority -->
              <span class="task-priority ms-2">
                <i
                  :class="
                    task.priority == 'high'
                      ? 'fa fa-angle-double-up text-danger'
                      : task.priority == 'normal'
                        ? 'fa fa-minus text-secondary'
                        : task.priority == 'low'
                          ? 'fa fa-angle-double-down text-info'
                          : ''
                  "
                ></i>
              </span>

              <!-- status -->
              <span class="task-status ms-2">
                <i
                  :class="{
                    'bi bi-check2-circle text-success': task.status === 'done',
                    'bi bi-alarm text-warning': task.status === 'review',
                    '': !['done', 'review'].includes(task.status),
                  }"
                >
                </i>
              </span>
            </span>

            <!-- زر التعليقات -->
            <div
              @click.stop="openDescriptionModal(task)"
              class="border rounded px-2 position-relative"
              :class="{ loading: taskLoading[task.id] }"
            >
              <template v-if="taskLoading[task.id]">
                <i class="fas fa-spinner fa-spin"></i>
              </template>
              <template v-else>
                <i class="fa fa-comments"></i>
                <span class="ms-1">{{ task.comments_count || 0 }}</span>
                <!-- علامة التعليقات الجديدة -->
                <span
                  v-if="!task.read_comments"
                  class="red-dot position-absolute top-0 start-100 translate-middle"
                ></span>
              </template>
            </div>

            <!-- اسم القسم/المشروع -->
            <span v-if="task.project" class="task-label">
              {{ task.project?.name || t("project") }}
            </span>

            <!-- Switch Status -->
            <div
              v-if="
                !['review', 'done'].includes(task.status) &&
                userData?.user?.id !== task.creator?.id
              "
              class="mb-0"
            >
              <div class="d-flex justify-content-center text-sm" @click.stop>
                <argon-switch
                  :checked="task.status === 'inProgress'"
                  @update:checked="(newVal) => toggleSwitchStatus(task, newVal)"
                ></argon-switch>
              </div>
            </div>

            <!-- زر Review (للمسؤول أو المشرف) -->
            <div
              v-if="
                task.status === 'inProgress' &&
                (userData?.user?.id === task.assigned_user?.id ||
                  userData?.user?.id === task.supervisor?.id)
              "
              class="d-flex gap-1 review-buttons"
              :class="{ loading: taskLoadingAction[task.id] }"
            >
              <template v-if="taskLoadingAction[task.id]">
                <i class="fas fa-spinner fa-spin"></i>
              </template>
              <template v-else>
                <button
                  class="border rounded px-2 py-1 d-flex align-items-center gap-1 text-dark"
                  @click.stop="updateTaskStatus(task, 'review')"
                  data-bs-toggle="tooltip"
                  :title="t('review')"
                >
                  <i class="fa fa-eye"></i>
                </button>
              </template>
            </div>

            <!-- زر Done/Rework (للمنشئ) -->
            <div
              v-if="
                task.status === 'review' &&
                userData?.user?.id === task.creator?.id
              "
              class="d-flex gap-1 review-buttons"
              :class="{ loading: taskLoadingAction[task.id] }"
            >
              <template v-if="taskLoadingAction[task.id]">
                <i class="fas fa-spinner fa-spin"></i>
              </template>
              <template v-else>
                <button
                  class="border rounded px-2 py-1 d-flex align-items-center gap-1 text-dark"
                  @click.stop="updateTaskStatus(task, 'done')"
                  data-bs-toggle="tooltip"
                  :title="t('done')"
                >
                  <i class="fa fa-check"></i>
                </button>
                <button
                  class="border rounded px-2 py-1 d-flex align-items-center gap-1 text-dark"
                  @click.stop="updateTaskStatus(task, 'inProgress')"
                  data-bs-toggle="tooltip"
                  :title="t('rework')"
                >
                  <i class="fa fa-redo"></i>
                </button>
              </template>
            </div>

            <!-- زر توسيع/طي -->
            <i
              :class="
                expandedTaskId === task.id ? 'fa-chevron-up' : 'fa-chevron-down'
              "
              class="fa expand-arrow"
            ></i>

            <!-- زر الحذف -->
            <!-- <i
              class="fa fa-trash delete-icon"
              @click.stop="confirmDelete(task)"
              v-tooltip="t('delete')"
            ></i> -->

            <!-- أيقونة التعديل -->
            <i
              class="fa fa-edit edit-icon ms-1 text-success"
              v-if="isOwner"
              @click.stop="openEditPopup(task)"
              data-bs-toggle="tooltip"
              :title="t('edit')"
            ></i>

            <!-- نقطة حمراء لو عندك إشعار جديد -->
            <!-- <span v-if="task.hasNewUpdate" class="red-dot"></span> -->

            <!-- زر الأرشفة -->
            <i
              class="fa"
              :class="
                task.loadingArchive
                  ? 'fa-spinner spinner-icon'
                  : task.is_archived
                    ? 'fa-undo restore-icon'
                    : 'fa-archive archive-icon'
              "
              @click.stop="archiveTask(task)"
              data-bs-toggle="tooltip"
              :title="task.is_archived ? t('restore') : t('archive')"
            ></i>
          </div>

          <!-- التفاصيل (عند التوسيع) -->
          <transition name="slide-fade">
            <div v-if="expandedTaskId === task.id" class="task-details">
              <!-- ملخص أو وصف المهمة -->
              <p class="task-description">
                {{ task.description || "No description" }}
              </p>

              <!-- تاريخ البداية والنهاية -->
              <small
                v-if="task.start_date || task.deadline"
                class="badge"
                :class="{
                  'badge-danger': isDeadlinePassed(task.deadline),
                  'badge-warning': isDeadlineApproaching(task.deadline),
                  'badge-grey':
                    !isDeadlinePassed(task.deadline) &&
                    !isDeadlineApproaching(task.deadline),
                }"
              >
                {{ t("from") }}: {{ formatDate(task.start_date) }}
                <span v-if="task.deadline"> - {{ t("to") }}: {{ formatDate(task.deadline) }}</span>
              </small>

              <!-- من أنشأ المهمة -->
              <small v-if="task.creator" class="badge badge-grey">
                {{ t("createdBy") }}: {{ task.creator?.name || "Unknown" }}
              </small>

              <!-- المشرف -->
              <small v-if="task.supervisor" class="badge badge-grey">
                {{ t("supervisor") }}: {{ task.supervisor?.name || "Unknown" }}
              </small>

              <!-- إلى من أُسندت المهمة -->
              <small v-if="task.assigned_user" class="badge badge-grey">
                {{ t("assignedTo") }}:
                {{ task.assigned_user?.name || "No one" }}
              </small>
            </div>
          </transition>
        </div>

        <!-- الـPagination -->
        <!-- <nav
          v-if="pagination.total > pagination.per_page"
          aria-label="Page navigation"
          class="pagination-container"
        >
          <ul class="pagination">
            <li
              class="page-item"
              :class="{ disabled: pagination.current_page === 1 }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="changePage(pagination.current_page - 1)"
              >
                <i class="fas fa-angle-left"></i>
              </a>
            </li>

            <li
              v-for="page in lastPage"
              :key="page"
              :class="[
                'page-item',
                { active: pagination.current_page === page },
              ]"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">
                {{ page }}
              </a>
            </li>

            <li
              class="page-item"
              :class="{ disabled: pagination.current_page === lastPage }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="changePage(pagination.current_page + 1)"
              >
                <i class="fas fa-angle-right"></i>
              </a>
            </li>
          </ul>
        </nav> -->
      </div>
    </div>

    <!-- مودال التقرير (Report) -->
    <transition name="fade">
      <div v-if="showEditPopup" class="popup-overlay">
        <ArgonModal
          v-if="showEditPopup"
          :title="selectedTask.task_name"
          @close="closeEditPopup"
          class="routine-task-modal"
        >
          <template #default>
            <div class="mb-3 modal-content-scroll">
              <label class="form-label">{{ t("reportTaskType") }}:</label>
              <argon-select
                required
                v-model="taskStatus"
                :options="reportTypeOptions"
                class="form-control mb-3"
                :placeholder="t('selectReportTaskType')"
              />

              <label class="form-label">{{ t("taskFound") }}</label>
              <argon-select
                v-model="taskFound"
                :options="taskFoundOptions"
                class="form-control mb-3"
                :placeholder="t('selectTaskFound')"
              />

              <label class="form-label">{{ t("comment") }}:</label>
              <quill-editor
                v-model="taskComment"
                :options="editorOptions"
                @update:content="(val) => (taskComment = val)"
                ref="editorRef"
                contentType="html"
                class="mb-3"
              />
            </div>
          </template>

          <template #footer>
            <ArgonButton
              variant="success"
              @click="reportTask"
              :disabled="isLoading"
            >
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ isLoading ? t("saving") : t("report") }}
            </ArgonButton>
            <ArgonButton variant="secondary" @click="closeEditPopup">
              {{ t("close") }}
            </ArgonButton>
          </template>

          <template #title>
            <i class="fas fa-user-edit me-2"></i>
            {{ t("editTask") }}
          </template>
        </ArgonModal>
      </div>
    </transition>

    <!-- مودال التعليقات فقط (بدون تبويبات Info/Log) -->
    <!-- مودال التعليقات بكامل الشاشة مع Scroll -->
    <transition name="fade">
      <div v-if="showDescriptionModal" class="popup-overlay">
        <ArgonModal
          :title="''"
          @close="closeDescriptionModal"
          class="comments-fullscreen-modal"
        >
          <!-- عنوان مخصص نضع فيه اسم المهمة والوصف المختصر مع زر see more/less -->
          <template #title>
            <div>
              <!-- اسم المهمة -->
              <h5 class="mb-1">{{ selectedTaskName }}</h5>

              <!-- الوصف (بخط صغير) + toggle see more/less -->
              <small class="text-muted d-block" style="font-size: 0.85rem">
                <!-- إذا كان الوصف أطول من 100 حرف نعرض جزءًا مع زر المزيد/الأقل -->
                <template
                  v-if="selectedDescription && selectedDescription.length > 100"
                >
                  <span v-if="showFullDescription">
                    {{ selectedDescription }}
                  </span>
                  <span v-else>
                    {{ truncatedDescription }}
                  </span>
                  <button
                    @click="toggleDescription"
                    class="btn btn-link p-0 ms-1"
                    style="font-size: 0.85rem"
                  >
                    {{ showFullDescription ? "See less" : "See more" }}
                  </button>
                </template>

                <!-- إن كان الوصف أقصر من 100 حرف، نعرضه كله -->
                <template v-else>
                  {{ selectedDescription }}
                </template>
              </small>
            </div>
          </template>

          <template #default>
            <!-- نجعل حاوية التعليقات قابلة للتمرير -->
            <div class="comments-scroll-container">
              <!-- الهيكل أثناء التحميل -->
              <transition name="fade" mode="out-in">
                <div v-if="isLoadingComments" class="skeleton-loading">
                  <div v-for="i in 3" :key="i" class="skeleton-comment">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-content">
                      <div class="skeleton-line short"></div>
                      <div class="skeleton-line medium"></div>
                    </div>
                  </div>
                </div>

                <ul v-else class="comment-list">
                  <li
                    v-for="comment in taskComments"
                    :key="comment.id"
                    class="comment-item"
                  >
                    <!-- هيكل الردود أثناء التحميل -->
                    <div v-if="isLoadingReplies" class="skeleton-replies">
                      <div v-for="i in 2" :key="i" class="skeleton-comment">
                        <div class="skeleton-content">
                          <div class="skeleton-line short"></div>
                          <div class="skeleton-line medium"></div>
                        </div>
                      </div>
                    </div>

                    <div class="comment-header">
                      <div class="user-info">
                        <div>
                          <span class="user-name">{{ comment.user.name }}</span>
                          <span class="comment-time">
                            {{ formatDateWithTime(comment.created_at) }}
                          </span>
                        </div>
                      </div>
                      <div class="comment-actions">
                        <button
                          class="btn btn-reply"
                          @click="toggleReply(comment.id)"
                        >
                          {{ t("reply") }}
                        </button>
                      </div>
                    </div>
                    <div
                      class="comment-body"
                      v-html="comment.comment_text"
                    ></div>

                    <small v-if="comment.seen_by?.length">
                      <i class="fa fa-check text-success me-1"></i>
                      <span
                        v-for="(user, index) in comment.seen_by"
                        :key="user.id"
                      >
                        {{ user.name }}
                        <span v-if="index !== comment.seen_by.length - 1"
                          >,
                        </span>
                      </span>
                    </small>

                    <!-- الردود -->
                    <div v-if="comment.replies?.length" class="replies">
  <!-- زر التوسيع/الطي -->
  <button
    @click="toggleReplies(comment.id)"
    class="btn btn-link p-0 mb-2"
    :class="{ 'new-reply': hasUnseenReplies(comment) }"
  >
    {{ showReplies[comment.id] ? "Hide" : "View" }}
    {{ comment.replies.length }} replies
    <!-- علامة جديدة إذا كان هناك ردود غير مقروءة -->
    <span v-if="hasUnseenReplies(comment)" class="new-reply-dot"></span>
  </button>

  <!-- الردود -->
  <transition name="fade">
    <div v-if="showReplies[comment.id]" class="replies-container">
      <div
        v-for="reply in comment.replies"
        :key="reply.id"
        class="reply-item"
        @click="markReplyAsSeen(reply.id)"
      >
        <div class="comment-header">
          <div class="user-info">
            <div>
              <span class="user-name">{{ reply.user?.name }}</span>
              <span class="comment-time">{{ formatDateWithTime(reply.created_at) }}</span>
            </div>
          </div>
        </div>
        <div class="comment-body" v-html="reply.reply_text"></div>

        <!-- علامة جديدة إذا كان الرد غير مقروء -->
        <span
          v-if="!reply.is_seen"
          class="new-reply-dot position-absolute top-0 start-100 translate-middle"
        ></span>
      </div>
    </div>
  </transition>
</div>

                    <!-- لودينج عند إرسال الرد -->
                    <div
                      v-if="isSubmittingReplyForComment[comment.id]"
                      class="skeleton-comment"
                    >
                      <div class="skeleton-line short"></div>
                      <div class="skeleton-content">
                        <div class="skeleton-line long"></div>
                      </div>
                    </div>

                    <!-- مربع الرد -->
                    <transition name="fade">
                      <div
                        v-if="activeReplyId === comment.id"
                        class="reply-editor"
                      >
                        <quill-editor
                          v-if="activeReplyId === comment.id"
                          :ref="(el) => setReplyRef(el, comment.id)"
                          v-model:content="replyContent"
                          :options="editorOptions"
                          @update:content="(val) => (replyContent = val)"
                          contentType="html"
                          class="mb-2"
                        />
                        <div class="d-flex gap-2">
                          <ArgonButton
                            @click="submitReply(comment.id)"
                            size="sm"
                          >
                            {{ t("submit") }}
                          </ArgonButton>
                          <ArgonButton
                            variant="outline"
                            @click="cancelReply"
                            size="sm"
                          >
                            {{ t("cancel") }}
                          </ArgonButton>
                        </div>
                      </div>
                    </transition>
                  </li>
                </ul>
              </transition>

              <!-- هيكل التعليق الجديد أثناء الإرسال -->
              <div v-if="isSubmitting" class="skeleton-comment">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line long"></div>
                </div>
              </div>

              <!-- إضافة تعليق جديد -->
              <div class="new-comment">
                <h6 class="mb-2">{{ t("write_comment") }}</h6>
                <quill-editor
                  v-model:content="taskComment"
                  :options="editorOptions"
                  @update:content="(val) => (taskComment = val)"
                  ref="editorRef"
                  contentType="html"
                  class="mb-2"
                />
                <ArgonButton
                  @click="submitComment"
                  :disabled="isSubmitting"
                  class="mt-1"
                >
                  <i class="fas fa-paper-plane me-2"></i>
                  {{ isSubmitting ? t("submitting") : t("submit") }}
                </ArgonButton>
              </div>
            </div>
          </template>

          <template #footer>
            <ArgonButton variant="secondary" @click="closeDescriptionModal">
              {{ t("close") }}
            </ArgonButton>
          </template>
        </ArgonModal>
      </div>
    </transition>
  </div>
</template>

<script setup>
/* نفس السكربت الأصلي تمامًا دون تغيير أسماء الدوال أو المنطق الأساسي */
import { computed, ref, reactive, onBeforeMount, watch, nextTick } from "vue";
import { useStore } from "vuex";
import Swal from "sweetalert2";
// import { Tooltip } from 'bootstrap'
// import * as bootstrap from 'bootstrap' // 👈 لازم تضيف ده

import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";

import { markTaskCommentsAsSeen } from "@/utils/commentCache"; // فوق السكربت

import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
} from "@/utils/permissions.js";

// const vTooltip = {
//   mounted(el, binding) {
//     el._tooltip = new Tooltip(el, {
//       title: binding.value,
//       placement: binding.arg || 'top',
//     });
//   },
//   updated(el, binding) {
//     if (el._tooltip) {
//       el._tooltip.setContent({ '.tooltip-inner': binding.value });
//     }
//   },
//   unmounted(el) {
//     if (el._tooltip) {
//       el._tooltip.dispose();
//       el._tooltip = null;
//     }
//   },
// };

// const directives = { tooltip: vTooltip }
// defineExpose({ directives })

const emit = defineEmits([
  "page-changed",
  "reload-tasks",
  "filtered-count-changed",
  "open-edit-popup",
]);

const taskLoading = ref({}); // { [taskId]: boolean }
const taskLoadingAction = ref({}); // { [taskId]: boolean }

const isLoadingComments = ref(false);
const isLoadingReplies = ref(false);
const isSubmitting = ref(false);
const isSubmittingReplyForComment = ref({});
const showReplies = reactive({});

const isOwner = computed(() => store.getters.isOwner);



const props = defineProps({
  oneTimeTasks: {
    type: Array,
    required: true,
  },
  pagination: {
    type: Object,
    required: true,
  },
});

const store = useStore();
const userData = computed(() => store.getters.user);
const currentLanguage = computed(() => store.getters.currentLanguage);

const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.id) || {}
);

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

// المتغيرات العامة
const activeTab = ref("Inbox");
const componentKey = ref(0);

const showEditPopup = ref(false);
const showDescriptionModal = ref(false);

const selectedTask = ref(null);
const selectedTaskName = ref("");
const selectedDescription = ref("");
const selectedTaskNumber = ref(null);
const selectedTaskStartDate = ref(null);
const selectedTaskDeadline = ref(null);
const selectedTaskCreationDate = ref(null);
const selectedTaskId = ref(null);
const selectedTaskStatus = ref(null);
const selectedTaskAssignedTo = ref(null);
const selectedTaskRecurrentDays = ref([]);
const selectedTaskDayOfMonth = ref(null);
const selectedTaskDepartment = ref(null);

const loadingTaskId = ref(null);
const taskLogs = ref([]);
const taskComments = ref([]);
const taskComment = ref("");
const replyContent = ref("");

const taskStatus = ref("");
const taskFound = ref(null);
const taskNotes = ref("");
const isLoading = ref(false);

const t = (key) => translations[currentLanguage.value][key];

// خيارات التقرير
const reportTypeOptions = [
  { value: "done", label: "Done" },
  { value: "not_done", label: "Not Done" },
];

// خيارات هل المهمة موجودة
const taskFoundOptions = [
  { value: 1, label: "Yes" },
  { value: 0, label: "No" },
];

const activeReplyId = ref(null);
function toggleReply(commentId) {
  activeReplyId.value = activeReplyId.value === commentId ? null : commentId;
  replyContent.value = "";
}
function cancelReply() {
  activeReplyId.value = null;
  replyContent.value = "";
}

// إعدادات محرر Quill
const editorRef = ref(null);
const replyRefs = ref({});
const setReplyRef = (el, commentId) => {
  if (el) {
    replyRefs.value[commentId] = el;
  }
};

const editorOptions = ref({
  modules: {
    toolbar: [
      ["bold", "italic", "underline"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
    ],
  },
  theme: "snow",
});

const expandedTaskId = ref(null);
async function toggleTaskExpand(task) {
  if (expandedTaskId.value === task.id) {
    expandedTaskId.value = null;
    return;
  }
  expandedTaskId.value = task.id;
  await getOneTimeTaskLogs(task.id);
}

async function toggleStar(task) {
  if (task.loadingStar) return;
  const oldValue = task.is_starred;
  task.loadingStar = true;
  try {
    await store.dispatch("starOneTimeTask", task);
    task.is_starred = !oldValue;
    await store.dispatch("fetchOneTimeTasks");
  } catch (error) {
    console.error("Error toggling star:", error);
  } finally {
    task.loadingStar = false;
  }
}

async function archiveTask(task) {
  if (task.loadingArchive) return;
  const oldValue = task.is_archived;
  task.loadingArchive = true;
  try {
    await store.dispatch("archiveOneTimeTask", task);
    task.is_archived = !oldValue;
    await store.dispatch("fetchOneTimeTasks");
  } catch (error) {
    console.error("Error toggling star:", error);
  } finally {
    task.loadingArchive = false;
  }
}

// إغلاق popup
function closeEditPopup() {
  showEditPopup.value = false;
  selectedTask.value = null;
}

// تقرير
async function reportTask() {
  isLoading.value = true;
  const taskData = {
    id: selectedTask.value.id,
    notes: taskNotes.value,
    status: taskStatus.value,
    task_found: taskFound.value,
  };
  try {
    const result = await store.dispatch("reportRoutineTasks", taskData);
    if (result.status === 201) {
      Swal.fire({
        icon: "success",
        title: t("taskReportedSuccessfully"),
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      closeEditPopup();
      emit("reload-tasks");
      taskStatus.value = "";
      taskFound.value = null;
      taskNotes.value = "";
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: t("errorUpdatingTask"),
      text: error.message,
    });
  } finally {
    isLoading.value = false;
  }
}

// فتح مودال التعليقات
async function openDescriptionModal(task) {
  isLoadingComments.value = true;
  try {
    selectedTask.value = { ...task };
    selectedTaskName.value = task.title;
    selectedDescription.value = task.description;
    selectedTaskNumber.value = task.task_no;
    selectedTaskStartDate.value = task.start_date;
    selectedTaskDeadline.value = task.deadline;
    selectedTaskCreationDate.value = task.created_at;
    selectedTaskId.value = task.id;
    selectedTaskStatus.value = task.status;
    selectedTaskAssignedTo.value = task.assigned_to;
    selectedTaskRecurrentDays.value = task.recurrent_days;
    selectedTaskDayOfMonth.value = task.day_of_month;
    selectedTaskDepartment.value = task.department;

    // ❶ حدد هذا التاسك كـ تمّت رؤية تعليقاته
    markTaskCommentsAsSeen(task.id);
    // ❷ أطفئ النقطة الحمراء مباشرة
    task.hasNewUpdate = false;

    await getOneTimeTaskComments(task.id);
    task.read_comments = true; // تحديث الحالة إلى مقروء

    showDescriptionModal.value = true;

    // التمرير التلقائي إلى التعليق الذي يحتوي على رد جديد
    await nextTick(); // انتظر حتى يتم تحميل التعليقات
    scrollToFirstUnseenReply();
  } catch (error) {
    console.error("Error fetching comments:", error);
  } finally {
    isLoadingComments.value = false;
  }
}

function closeDescriptionModal() {
  showDescriptionModal.value = false;
  selectedTaskName.value = "";
  selectedDescription.value = "";
  selectedTaskNumber.value = null;
  selectedTaskStartDate.value = null;
  selectedTaskDeadline.value = null;
  selectedTaskCreationDate.value = null;
  selectedTaskId.value = null;
  selectedTaskStatus.value = null;
  selectedTaskAssignedTo.value = null;
  selectedTaskRecurrentDays.value = [];
  selectedTaskDayOfMonth.value = null;
  selectedTaskDepartment.value = null;
}

async function getOneTimeTaskLogs(taskId) {
  try {
    loadingTaskId.value = taskId;
    const response = await store.dispatch("getOneTimeTaskLogs", taskId);
    console.log("response logsssssssssss" + response);
    if (response.status === 200) {
      taskLogs.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching task logs:", error);
  } finally {
    loadingTaskId.value = null;
  }
}

async function getOneTimeTaskComments(taskId) {
  try {
    taskLoading.value[taskId] = true;
    const response = await store.dispatch("getOneTimeTaskComments", taskId);
    console.log("response commentsssssssssss", response);
    if (response.status === 200) {
      taskComments.value = response.data.comments;
    }
  } catch (error) {
    console.error("Error fetching task comments:", error);
  } finally {
    taskLoading.value[taskId] = false;
  }
}

// function confirmDelete(task) {
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
// }
// async function deleteTask(taskId) {
//   try {
//     await store.dispatch("deleteRoutineTask", taskId);
//     emit("reload-tasks");
//     Swal.fire({
//       icon: "success",
//       title: t("deleteConfirmationSuccess"),
//       showConfirmButton: false,
//       timer: 1500,
//       timerProgressBar: true,
//     });
//   } catch (error) {
//     Swal.fire({
//       icon: "error",
//       title: t("errorDeletingTask"),
//       text: error.message,
//     });
//   }
// }

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(
    currentLanguage.value,
    options
  );
}
function formatDateWithTime(dateString) {
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
}

async function submitComment() {
  isSubmitting.value = true;
  const htmlContent = editorRef.value.getHTML();
  const taskCommentData = {
    comment_text: htmlContent,
    id: selectedTaskId.value,
  };
  try {
    if (!htmlContent.trim()) {
      console.log("المحتوى فارغ!");
      return;
    }
    await store.dispatch("AddCommentOneTimeTask", taskCommentData);
    emit("reload-tasks");
    await getOneTimeTaskComments(selectedTaskId.value);
    taskStatus.value = "";
    taskFound.value = null;
    taskNotes.value = "";
    taskComment.value = "";
    editorRef.value.setHTML("");
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: t("errorUpdatingTask"),
      text: error.message,
    });
  } finally {
    isSubmitting.value = false;
  }
}

async function submitReply(commentId) {
  console.log(commentId);
  isSubmittingReplyForComment.value[commentId] = true;
  const editorInstance = replyRefs.value[commentId];

  if (!editorInstance) {
    console.error("Editor instance not found");
    return;
  }
  const htmlContent = editorInstance.getHTML();
  const replyData = {
    id: commentId,
    reply_text: htmlContent,
  };
  try {
    if (!htmlContent.trim()) {
      console.log("المحتوى فارغ!");
      return;
    }
    await store.dispatch("AddReplyCommentOneTimeTask", replyData);
    activeReplyId.value = null;
    replyContent.value = "";
    emit("reload-tasks");
    await getOneTimeTaskComments(selectedTaskId.value);
  } catch (error) {
    console.error("Error submitting reply:", error);
    Swal.fire({
      icon: "error",
      title: t("errorUpdatingTask"),
      text: error.message,
    });
  } finally {
    isSubmittingReplyForComment.value[commentId] = false;
  }
}

// function changePage(page) {
//   if (page < 1 || page > lastPage.value) return;
//   emit("page-changed", page);
// }
// const lastPage = computed(() =>
//   Math.ceil(props.pagination.total / props.pagination.per_page)
// );

function openEditPopup(task) {
  emit("open-edit-popup", task);
}

const translations = {
  en: {
    tasksTable: "Tasks Table",
    noTasksHere: "No tasks found here.",
    from: "from",
    to: "to",
    comment: "comment",
    reply: "Reply",
    cancel: "Cancel",
    submit: "Submit",
    log: "Log",
    info: "Info",
    project: "Project",
    assignedTo: "Assigned To",
    createdBy: "Created By",
    supervisor: "Supervisor",
    noLogsAvailable: "No logs available",
    deleteConfirmationTitle: "Delete Task",
    deleteConfirmationText: "Are you sure you want to delete this task?",
    deleteConfirmationSuccess: "Task deleted successfully.",
    close: "Close",
    saving: "Saving...",
    reportTaskType: "Report Task Type",
    selectReportTaskType: "Select Report Task Type",
    taskFound: "There is task?",
    selectTaskFound: "Select Task Found",
    errorUpdatingTask: "Error updating task",
    taskReportedSuccessfully: "Task reported successfully",
    editTask: "Edit Task",
    comment_text: "Comment",
    write_comment: "Write a comment",
    submitting: "Submitting...",
    taskNumber: "Task Code",
    description: "Description",
    changedTheField: "changed the field",
    onDate: "On",
    noTasks: "No tasks found",
    createdAt: "Created At",
    assignedUser: "Assigned User",
    taskName: "Task Name",
    fromTime: "From Time",
    dayOfMonth: "Day of Month",
    dayOfWeek: "Day of Week",
    tasks: "Tasks",
    taskReportedSuccessfullyMessage: "Task reported successfully",
    isUrgent: "Is Urgent",
    yes: "Yes",
    no: "No",
    priority: "Priority",
    startDate: "Start Date",
    deadline: "Deadline",
    department: "Department",
    done: "Done",
    rework: "Rework",
    review: "Review",
    taskStatusUpdated: "Task status updated",
    success: "Success",
    archive: "Archive",
    restore: "Restore",
    taskArchivedSuccessfully: "Task archived successfully",
    taskRestoredSuccessfully: "Task restored successfully",
    delete: "Delete",
    edit: "Edit",
  },
  ar: {
    tasksTable: "عدد المهام",
    noTasksHere: "لا توجد مهام هنا.",
    from: "من",
    to: "إلى",
    comment: "تعليق",
    reply: "رد",
    cancel: "إلغاء",
    submit: "إرسال",
    log: "السجلات",
    info: "معلومات",
    project: "المشروع",
    assignedTo: "إلى",
    createdBy: "أنشئت بواسطة",
    supervisor: "المشرف",
    noLogsAvailable: "لا توجد سجلات",
    deleteConfirmationTitle: "حذف المهمة",
    deleteConfirmationText: "هل تريد حذف هذه المهمة؟",
    deleteConfirmationSuccess: "تم حذف المهمة بنجاح",
    close: "إغلاق",
    saving: "جاري الحفظ...",
    reportTaskType: "تقرير نوع المهمة",
    selectReportTaskType: "اختر نوع التقرير",
    taskFound: "هل المهمة موجودة؟",
    selectTaskFound: "اختر المهمة موجودة",
    errorUpdatingTask: "خطأ في تحديث المهمة",
    taskReportedSuccessfully: "تمت العملية بنجاح",
    editTask: "تعديل مهمة",
    comment_text: "التعليق",
    write_comment: "اكتب تعليقًا",
    submitting: "جاري الإرسال...",
    taskNumber: "رقم المهمة",
    description: "وصف المهمة",
    changedTheField: "غير الحقل",
    onDate: "في تاريخ",
    noTasks: "لا توجد مهام",
    createdAt: "تاريخ الإنشاء",
    assignedUser: "المسؤول",
    taskName: "اسم المهمة",
    fromTime: "من الوقت",
    dayOfMonth: "يوم الشهر",
    dayOfWeek: "يوم الأسبوع",
    tasks: "مهام",
    taskReportedSuccessfullyMessage: "تم الإبلاغ عن المهمة بنجاح",
    isUrgent: "طوارئ",
    yes: "نعم",
    no: "لا",
    priority: "الأولوية",
    startDate: "تاريخ البدء",
    deadline: "الموعد النهائي",
    department: "القسم",
    review: "مراجعة",
    done: "تم",
    rework: "إعادة العمل",
    success: "نجاح",
    taskStatusUpdated: "تم تحديث حالة المهمة",
    archive: "أرشيف",
    restore: "استرجاع",
    delete: "حذف",
    taskArchivedSuccessfully: "تم أرشفة المهمة بنجاح",
    taskRestoredSuccessfully: "تم استرجاع المهمة بنجاح",
    edit: "تعديل",
  },
};

// فلترة المهام حسب التاب
const filteredTasks = computed(() => {
  if (!props.oneTimeTasks) return [];
  switch (activeTab.value) {
    case "Inbox":
      return props.oneTimeTasks.filter((task) => {
        return (
          task.assigned_user?.id === userData.value?.user?.id ||
          task.supervisor?.id === userData.value?.user?.id
        );
      });
    case "Own":
      return props.oneTimeTasks.filter((task) => {
        return task.creator?.id === userData.value.user?.id;
      });
    case "Archive":
      return props.oneTimeTasks.filter((task) => task.is_archived == true);
    case "Started":
      return props.oneTimeTasks.filter((task) => task.is_starred == true);
    case "Review":
      return props.oneTimeTasks.filter((task) => task.status === "review");
    case "Done":
      return props.oneTimeTasks.filter((task) => task.status === "done");
    case "Label":
      return props.oneTimeTasks.filter(() => {
        // منطق خاص بالـLabel لو أردت
      });
    default:
      return props.oneTimeTasks.filter((task) => {
        return (
          task.assigned_user?.id === userData.value?.user?.id ||
          task.supervisor?.id === userData.value?.user?.id
        );
      });
  }
});

watch(filteredTasks, (newVal) => {
  emit("filtered-count-changed", newVal.length);
});

// watch(filteredTasks, async () => {
//   await nextTick();
//   const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
//   tooltips.forEach((el) => {
//     const instance = bootstrap.Tooltip.getInstance(el);
//     if (instance) {
//       instance.dispose();
//     }
//     new bootstrap.Tooltip(el);
//   });
// });

// toggleSwitchStatus
async function toggleSwitchStatus(task, isChecked) {
  const newStatus = isChecked ? "inProgress" : "pending";
  const taskData = { id: task.id, status: newStatus };
  try {
    await store.dispatch("updateoneTimeTaskStatus", taskData);
    task.status = newStatus;
    await store.dispatch("fetchOneTimeTasks");
  } catch (error) {
    console.error("Error updating task status:", error);
    Swal.fire({
      icon: "error",
      title: t("errorUpdatingStatus"),
      text: error.message,
    });
  }
}

function isDeadlinePassed(deadline) {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  return deadlineDate < today;
}
function isDeadlineApproaching(deadline) {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate - today;
  const daysDiff = timeDiff / (1000 * 3600 * 24);
  return daysDiff <= 2 && daysDiff >= 0;
}

// لإظهار/إخفاء الوصف الطويل
const showFullDescription = ref(false);
const truncatedDescription = computed(() => {
  if (!selectedDescription.value) return "";
  const maxLength = 50;
  if (selectedDescription.value.length <= maxLength) {
    return selectedDescription.value;
  }
  return selectedDescription.value.slice(0, maxLength) + "...";
});
function toggleDescription() {
  showFullDescription.value = !showFullDescription.value;
}

// زر المراجعة
const updateTaskStatus = async (task, status) => {
  taskLoadingAction.value[task.id] = true; // تفعيل الـ loading
  const taskData = { id: task.id, status };

  try {
    const response = await store.dispatch("updateoneTimeTaskStatus", taskData);

    if (response.status === 200) {
      // عرض رسالة نجاح مع الانتظار حتى انتهاء الـswal
      await Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("taskStatusUpdated"),
        timer: 1500,
        showConfirmButton: false,
      });

      // الآن بعد انتهاء الرسالة، نعمل reload
      // await store.dispatch("fetchOneTimeTasks");
      emit("reload-tasks");
      // componentKey.value += 1;
    } else {
      // إذا كانت هناك مشكلة في الاستجابة (ليست 200)
      throw new Error(`Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating task status:", error);

    await Swal.fire({
      icon: "error",
      title: t("error"),
      text: t("taskUpdateFailed"),
    });
  } finally {
    taskLoadingAction.value[task.id] = false; // إيقاف الـ loading
  }
};

// دالة للتحقق من وجود ردود غير مقروءة
function hasUnseenReplies(comment) {
  return comment.replies.find(r => !r.is_seen);
}

// دالة للتمرير التلقائي إلى التعليق الذي يحتوي على رد جديد
function scrollToFirstUnseenReply() {
  const firstUnseenComment = taskComments.value.find((comment) =>
    comment.replies.some((reply) => !reply.is_seen)
  );

  if (firstUnseenComment) {
    // ابحث عن العنصر باستخدام ID أو فئة معينة
    const commentElement = document.querySelector(
      `#comment-${firstUnseenComment.id}`
    );
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

async function markReplyAsSeen(replyId) {
  try {
    // البحث عن الرد المحدد في قائمة الردود
    const replyToUpdate = taskComments.value
      .flatMap(comment => comment.replies) // جلب جميع الردود من جميع التعليقات
      .find(reply => reply.id === replyId);

      const replyIds = {
      reply_id : replyId
      }

     if (replyToUpdate) {
      // تحديث الحالة محليًا
       replyToUpdate.is_seen = true;

      // تحديث الحالة عبر API
      await store.dispatch("markReplyAsSeen", replyIds);
    }
  } catch (error) {
    console.error("Error marking reply as seen:", error);
  }
}

function toggleReplies(commentId) {
  const id = String(commentId);
  showReplies[id] = !showReplies[id];

  // إذا تم فتح الردود، نقوم بتحديث حالة الردود إلى مقروءة
  if (showReplies[id]) {
    const comment = taskComments.value.find(c => c.id === commentId);
    if (comment) {
      comment.replies.forEach(reply => {
        if (!reply.is_seen) {
          markReplyAsSeen(reply.id); // تحديث كل رد غير مقروء
        }
      });
    }
  }
}
</script>

<style scoped>
/* نفس التنسيقات مع تعديل أزرار review/done/rework لتصبح بحجم وأسلوب زرّ التعليقات */

.routine-task-container {
  display: flex;
  gap: 1rem;
  min-height: 80vh;
}

/* الشريط الجانبي */
.sidebar {
  width: 125px;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sidebar button {
  background: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  text-align: left;
  cursor: pointer;
  color: #333;
  font-weight: 500;
}
.sidebar button.active {
  background-color: #a6c956;
  color: #fff;
}

.main-content {
  flex: 1;
}
.task-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 0.2rem;
  overflow: hidden;
}
.task-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #f5f8ff;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease;
}
.task-header:hover {
  background-color: #eef5ff;
}
.task-header.expanded {
  background-color: #dae9ff;
}

/* أيقونة النجمة */
.star-icon {
  color: #ffbd44;
  cursor: pointer;
  font-size: 1.1rem;
}
.task-title {
  flex: 1;
  font-weight: 500;
  font-size: 1rem;
  color: #2d3436;
}
.task-date {
  color: #666;
  margin-left: 0.5rem;
  font-size: 0.85rem;
}
.task-label {
  background-color: #f1f3f4;
  padding: 2px 8px;
  border-radius: 4px;
  color: #5f6368;
  font-size: 0.8rem;
  margin-right: auto;
}

/* سهم التوسيع */
.expand-arrow {
  margin-left: auto;
  color: #999;
  font-size: 0.9rem;
}

/* زر الحذف */
.delete-icon {
  color: #e74c3c;
  margin-left: 1rem;
  cursor: pointer;
}

/* النقطة الحمراء الجديدة */
.red-dot {
  width: 8px;
  height: 8px;
  background-color: #ff4444;
  border-radius: 50%;
  display: inline-block;
}

.task-details {
  max-width: 100%;
  overflow: hidden;
  padding: 1rem;
  background-color: #fff;
  transition: background-color 0.2s ease;
  transition:
    max-height 0.5s ease-in-out,
    opacity 0.5s ease-in-out;
}
.task-details p {
  margin-bottom: 0.5rem;
  line-height: 1.4;
  white-space: pre-wrap; /* عرض الأسطر كما هي */
  word-wrap: break-word; /* لتفكيك الكلمات الطويلة */
  overflow-wrap: break-word; /* المتصفحات الحديثة */
}

/* الأوسمة (badge) */
.badge-danger {
  background-color: #ff4444;
  color: #fff;
  border-radius: 4px;
  padding: 8px;
  margin-right: 0.5rem;
}
.badge-warning {
  background-color: #ffc107;
  color: #fff;
  border-radius: 4px;
  padding: 8px;
  margin-right: 0.5rem;
}
.badge-grey {
  background-color: #676767;
  color: #fff;
  border-radius: 4px;
  padding: 8px;
  margin-right: 0.5rem;
}

/* الصفحة */
.pagination-container {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}
.pagination {
  list-style: none;
  display: flex;
  gap: 0.25rem;
  padding-left: 0;
}
.page-item {
  margin: 0;
}
.page-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f3f4;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
}
.page-item.active .page-link {
  background: #3498db;
  color: #fff;
}
.page-item.disabled .page-link {
  pointer-events: none;
  opacity: 0.6;
}

/* Spinner */
.spinner-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* لا توجد مهام */
.no-tasks-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  text-align: center;
}
.no-tasks-image {
  max-width: 300px;
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
}
.no-tasks-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  margin: 0 1rem;
  line-height: 1.4;
}

/* المودال */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: block;
}
.popup-fullscreen {
  justify-content: flex-start !important;
  align-items: flex-start !important;
}
.routine-task-modal {
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
}
.modal-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}
.comments-fullscreen-modal {
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  scrollbar-width: none;
  scrollbar-color: transparent transparent;
}
.comments-scroll-container {
  max-height: 60vh; /* تقليل الارتفاع الكلي */
  overflow-y: auto;
  padding: 1rem;
}

/* تعليقات */
.comment-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.comment-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* تأثير عند المرور على التعليق */
.comment-item:hover {
  transform: translateX(5px);
  transition: transform 0.2s ease;
}

/* تأثير عند فتح مربع الرد */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.user-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}
.comment-time {
  color: #6c757d;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}
.comment-body {
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}
.comment-actions {
  display: flex;
  gap: 0.5rem;
}
/* زر الرد */
.btn-reply {
  color: #a6c956;
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  transition: color 0.2s;
  border: 1px solid #a6c956;
}
.btn-reply:hover {
  color: #fff;
  background-color: #a6c956;
  /* border-radius: 4px; */
  /* text-decoration: underline; */
}
.replies {
  margin-top: 1rem;
  border-left: 3px solid #ddd;
  padding-left: 1rem;
}
.reply-item {
  background: #ffffff;
  border-left: 2px solid #e9ecef;
  margin-left: 1.5rem;
  padding-left: 0.75rem;
  margin-top: 0.5rem;
}
.reply-editor {
  background: #ffffff;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.ql-editor {
  min-height: 80px !important;
  font-size: 0.9rem;
}

/* .argon-button {
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
} */

/* مربع إضافة التعليق */
.new-comment {
  padding: 1rem;
  /* background: #f8f9fa; */
  border-top: 1px solid #e9ecef;
}

.skeleton-comment {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  background: #e9ecef;
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.skeleton-line {
  height: 0.8rem;
  background: #e9ecef;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.medium {
  width: 80%;
}

.skeleton-line.long {
  width: 100%;
}

/* مهمة عاجلة */
.urgent-task {
  position: relative;
  /* border: 2px solid #ff4444 !important; */
  background: #fff5f5 !important;
}
.urgent-task::before {
  content: "⚠️";
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}
.urgent-task .task-title {
  color: #ff4444 !important;
}

/* أزرار التحميل */
.loading {
  opacity: 0.7;
  pointer-events: none;
}
.fa-spinner {
  color: #3498db;
  font-size: 0.9rem;
  animation: spin 1s linear infinite;
}

/* أزرار المراجعة في المنتصف */
.review-buttons {
  margin: 0 auto;
  justify-content: center;
}
.review-buttons .btn {
  margin: 0 auto;
  /* نفس تنسيق زر التعليقات مثلاً */
  border: 1px solid #ccc;
  font-size: 0.85rem;
  padding: 0.3rem 0.5rem;
}
.review-buttons .btn-outline-success:hover {
  background-color: #28a745;
  color: #fff;
}
.review-buttons .btn-outline-danger:hover {
  background-color: #dc3545;
  color: #fff;
}
.review-buttons .btn-outline-warning:hover {
  background-color: #ffc107;
  color: #fff;
}

.task-description {
  max-height: 150px; /* تحديد أقصى ارتفاع */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5; /* عدد الأسعار الظاهرة قبل الاختصار */
  -webkit-box-orient: vertical;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  word-break: break-word; /* تجنب امتداد النص خارج الحاوية */
}

/* في قسم <style scoped> */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* إضافة تأثير Hover للزر */
.review-buttons button {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.review-buttons button:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-header {
  transition:
    background-color 0.2s,
    transform 0.2s;
}
/* .task-header:hover {
  transform: translateX(5px);
} */

.argon-switch {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.argon-switch:hover {
  transform: scale(1.1);
}

/* تأثير الانتقال */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* تنسيق الزر */
.btn-view-replies {
  font-size: 0.85rem;
  color: #6c757d;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.btn-view-replies:hover {
  background: #f8f9fa;
}

/* حاوية الردود */
.replies-container {
  margin-top: 0.5rem;
  /* padding-left: 1.5rem; */
  /* border-left: 2px solid #e9ecef; */
}

.btn-link {
  color: #a6c956;
  text-decoration: none;
  cursor: pointer;
}

.new-reply {
  position: relative;
}

.new-reply-dot {
  width: 8px;
  height: 8px;
  background-color: #ff4444;
  border-radius: 50%;
  display: inline-block;
  margin-left: 5px;
}

.new-reply {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.top-0 {
  top: 0;
}

.start-100 {
  left: 100%;
}

.translate-middle {
  transform: translate(-50%, -50%);
}
</style>
