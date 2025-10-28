<template>
  <!-- الحاوية الرئيسية للمكوّن -->
  <div class="routine-task-container" :key="componentKey">
    <!-- الشريط الجانبي (الأزرار) -->
    <div class="sidebar">
      <button v-for="tab in [
        'Inbox',
        'Own',
        'Archive',
        'Started',
        'Review',
        'Done',
      ]" :key="tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">
        <span class="tab-name">{{ tab }}</span>
        <span class="tab-count">{{ getTabCount(tab) }}</span>
      </button>
    </div>

    <!-- المحتوى الرئيسي -->
    <div class="main-content">
      <!-- عندما لا توجد مهام مفلترة -->
      <div v-if="filteredTasks.length === 0" class="no-tasks-container">
        <img src="https://ik.imagekit.io/ts7pphpbz3/man-despair-data-leak_11197-392.jpg?updatedAt=1742827650800"
          alt="no-tasks" class="no-tasks-image" />
        <p class="no-tasks-text">
          {{ t("noTasksHere") }}
        </p>
      </div>

      <!-- قائمة المهام -->
      <div v-else>
        <div v-for="task in filteredTasks" :key="task.id" class="task-item">
          <!-- رأس المهمة -->
          <div class="task-header" :class="[
            { expanded: expandedTaskId === task.id },
            { 'urgent-task': task.priority === 'urgent' },
          ]" @click="toggleTaskExpand(task)">
            <!-- أيقونة النجمة -->
            <i class="bi" :class="task.loadingStar
              ? 'bi-arrow-repeat spinner-icon'
              : task.is_starred
                ? 'bi-star-fill star-icon'
                : 'bi-star star-icon'
              " @click.stop="toggleStar(task)" title="Star/Unstar"></i>

            <!-- اسم المنشئ (Gmail Style) -->
            <span v-if="(activeTab === 'Done' || activeTab === 'Review') && task.creator?.id === userData?.user?.id"
              class="creator-name-simple"> {{ t('to') }}: {{ getDisplayName(task) }}</span>
            <span v-else-if="(activeTab === 'Done' || activeTab === 'Review')" class="creator-name-simple"> {{ t('from')
            }}: {{ getDisplayName(task) }}</span>
            <span v-else class="creator-name-simple"> {{ getDisplayName(task) }}</span>

            <!-- عنوان المهمة + تاريخ -->
            <span class="task-title" :class="{ 'text-white': task.is_urgent }">
              <span dir="rtl">{{ task.title }}</span>
              <small class="task-date" :class="{ 'text-white': task.is_urgent }">{{ formatDateWithTime(task.created_at)
              }}</small>

              <!-- deadline -->
              <small v-if="
                task.status === 'inProgress' &&
                userData?.user?.id === task.creator?.id
              " class="badge badge-success">{{ task.status }}</small>

              <!-- priority -->
              <span class="task-priority ms-2">
                <i :class="task.priority == 'high'
                  ? 'fa fa-angle-double-up text-danger'
                  : task.priority == 'normal'
                    ? 'fa fa-minus text-secondary'
                    : task.priority == 'low'
                      ? 'fa fa-angle-double-down text-info'
                      : ''
                  "></i>
              </span>

              <!-- status -->
              <span class="task-status ms-2">
                <i :class="{
                  'bi bi-check2-circle text-success': task.status === 'done',
                  'bi bi-alarm text-warning': task.status === 'review',
                  '': !['done', 'review'].includes(task.status),
                }">
                </i>
              </span>
            </span>

            <!-- زر التعليقات -->
            <div @click.stop="openDescriptionModal(task)" class="border rounded px-2 position-relative"
              :class="{ loading: taskLoading[task.id] }">
              <template v-if="taskLoading[task.id]">
                <i class="fas fa-spinner fa-spin"></i>
              </template>
              <template v-else>
                <i class="fa fa-comments"></i>
                <span class="ms-1">{{ task.comments_count || 0 }}</span>
                <!-- علامة التعليقات الجديدة -->
                <span v-if="!task.read_comments"
                  class="red-dot position-absolute top-0 start-100 translate-middle"></span>
              </template>
            </div>

            <!-- اسم القسم/المشروع -->
            <span v-if="task.project" class="task-label">
              {{ task.project?.name || t("project") }}
            </span>

            <!-- Switch Status -->
            <div v-if="
              !['review', 'done'].includes(task.status) &&
              userData?.user?.id !== task.creator?.id &&
              !task.informer
                ?.map((user) => user.id)
                .includes(userData?.user?.id) &&
              !task.consult
                ?.map((user) => user.id)
                .includes(userData?.user?.id)
            " class="mb-0">
              <div class="d-flex justify-content-center text-sm" @click.stop>
                <argon-switch :checked="task.status === 'inProgress'"
                  @update:checked="(newVal) => toggleSwitchStatus(task, newVal)"></argon-switch>
              </div>
            </div>

            <!-- زر Review (للمسؤول أو المشرف) -->
            <div v-if="
              task.status === 'inProgress' &&
              (task.assignedUser
                ?.map((user) => user.id)
                .includes(userData?.user?.id) ||
                userData?.user?.id === task.supervisor?.id)
            " class="d-flex gap-1 review-buttons" :class="{ loading: taskLoadingAction[task.id] }">
              <template v-if="taskLoadingAction[task.id]">
                <i class="fas fa-spinner fa-spin"></i>
              </template>
              <template v-else>
                <button class="border rounded px-2 py-1 d-flex align-items-center gap-1 text-dark"
                  @click.stop="updateTaskStatus(task, 'review')" data-bs-toggle="tooltip" :title="t('review')">
                  <i class="fa fa-eye"></i>
                </button>
              </template>
            </div>

            <!-- زر Done مباشر (للمنشئ إذا لم يكن هناك موظف معين أو مراجعة) -->
            <div v-if="
              userData?.user?.id === task.creator?.id && task.status !== 'review' && task.status !== 'done'
            " class="d-flex gap-1 review-buttons" :class="{ loading: taskLoadingAction[task.id] }">
              <template v-if="taskLoadingAction[task.id]">
                <i class="fas fa-spinner fa-spin"></i>
              </template>
              <template v-else>
                <button class="border rounded px-2 py-1 d-flex align-items-center gap-1 text-dark"
                  @click.stop="updateTaskStatus(task, 'done')" data-bs-toggle="tooltip" :title="t('done')">
                  <i class="fa fa-check"></i>
                </button>
              </template>
            </div>

            <!-- زر Done/Rework (للمنشئ) -->
            <div v-if="
              task.status === 'review' &&
              userData?.user?.id === task.creator?.id
            " class="d-flex gap-1 review-buttons" :class="{ loading: taskLoadingAction[task.id] }">
              <template v-if="taskLoadingAction[task.id]">
                <i class="fas fa-spinner fa-spin"></i>
              </template>
              <template v-else>
                <button class="border rounded px-2 py-1 d-flex align-items-center gap-1 text-dark"
                  @click.stop="updateTaskStatus(task, 'done')" data-bs-toggle="tooltip" :title="t('done')">
                  <i class="fa fa-check"></i>
                </button>
                <button class="border rounded px-2 py-1 d-flex align-items-center gap-1 text-dark"
                  @click.stop="updateTaskStatus(task, 'inProgress')" data-bs-toggle="tooltip" :title="t('rework')">
                  <i class="fa fa-redo"></i>
                </button>
              </template>
            </div>

            <!-- زر توسيع/طي -->
            <i :class="expandedTaskId === task.id ? 'fa-chevron-up' : 'fa-chevron-down'
              " class="fa expand-arrow"></i>

            <!-- أيقونة التعديل -->
            <i v-if="task.creator.id === userData?.user?.id" class="fa fa-edit edit-icon ms-1 text-success"
              @click.stop="openEditPopup(task)" data-bs-toggle="tooltip" :title="t('edit')"></i>

            <!-- زر الأرشفة -->
            <i class="fa" :class="task.loadingArchive
              ? 'fa-spinner spinner-icon'
              : task.is_archived
                ? 'fa-undo restore-icon'
                : 'fa-archive archive-icon'
              " @click.stop="archiveTask(task)" data-bs-toggle="tooltip"
              :title="task.is_archived ? t('restore') : t('archive')"></i>
          </div>

          <!-- التفاصيل (عند التوسيع) -->
          <transition name="slide-fade">
            <div v-if="expandedTaskId === task.id" class="task-details">
              <p dir="auto" class="task-description">
                {{ task.description || "No description" }}
              </p>

              <div class="badge-container">
                <small v-if="task.start_date || task.deadline" class="badge" :class="{
                  'badge-danger': isDeadlinePassed(task.deadline),
                  'badge-warning': isDeadlineApproaching(task.deadline),
                  'badge-grey':
                    (!isDeadlinePassed(task.deadline) &&
                      !isDeadlineApproaching(task.deadline)) ||
                    !task.deadline,
                }">
                  {{ t("from") }}: {{ formatDate(task.start_date) }}
                  <span v-if="task.deadline">
                    - {{ t("to") }}: {{ formatDate(task.deadline) }}</span>
                </small>

                <small v-if="task.creator" class="badge badge-grey">
                  {{ t("createdBy") }}: {{ userDisplayName(task.creator) }}
                </small>

                <small v-if="task.supervisor" class="badge badge-grey">
                  {{ t("supervisor") }}:
                  {{ userDisplayName(task.supervisor) }}
                </small>

                <small v-if="task.assignedUser.length > 0" class="badge badge-grey">
                  {{ t("assignedTo") }}:
                  {{
                    task.assignedUser.map((user) => userDisplayName(user)).join(", ") ||
                    "Unknown"
                  }}
                </small>

                <small v-if="task.consult.length > 0" class="badge badge-grey">
                  {{ t("consult") }}:
                  {{
                    task.consult.map((user) => userDisplayName(user)).join(", ") ||
                    "Unknown"
                  }}
                </small>

                <small v-if="task.informer.length > 0" class="badge badge-grey">
                  {{ t("informer") }}:
                  {{
                    task.informer.map((user) => userDisplayName(user)).join(", ") ||
                    "Unknown"
                  }}
                </small>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- مودال التعليقات -->
    <transition name="fade">
      <div v-if="showDescriptionModal" class="popup-overlay">
        <ArgonModal :title="''" @close="closeDescriptionModal" class="comments-fullscreen-modal">
          <template #title>
            <div>
              <h5 class="mb-1" dir="auto">{{ selectedTaskName }}</h5>
              <small class="text-muted d-block modal-title-description" style="font-size: 0.85rem">
                <template v-if="selectedDescription && selectedDescription.length > 100">
                  <div>
                    <p dir="auto" v-if="showFullDescription">
                      {{ selectedDescription }}
                    </p>
                    <p dir="auto" v-else>
                      {{ truncatedDescription }}
                      <button @click="toggleDescription" class="btn btn-link p-0 ms-1" style="font-size: 0.85rem">
                        {{ showFullDescription ? "see less" : "see more" }}
                      </button>
                    </p>
                    <button v-if="showFullDescription" @click="toggleDescription" class="btn btn-link p-0 mt-1"
                      style="font-size: 0.85rem">
                      {{ showFullDescription ? "see less" : "see more" }}
                    </button>
                  </div>
                </template>
                <template v-else>
                  <p class="task-description" dir="auto">
                    {{ selectedDescription }}
                  </p>
                </template>
              </small>
            </div>
          </template>

          <template #default>
            <div class="comments-scroll-container">
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
                  <li v-for="comment in taskComments" :key="comment.id" class="comment-item">
                    <div v-if="comment.comment_text" class="comment-header">
                      <div class="user-info">
                        <div>
                          <span class="user-name">{{ comment.user.name }}</span>
                          <span class="comment-time">{{ formatDateWithTime(comment.created_at) }}</span>
                        </div>
                      </div>
                      <div class="comment-actions">
                        <button class="btn btn-reply" @click="toggleReply(comment.id)">
                          {{ t("reply") }}
                        </button>
                      </div>
                    </div>
                    <div dir="auto" class="comment-body" v-html="comment.comment_text"></div>

                    <small v-if="comment.seen_by?.length" class="seen-by">
                      <i class="fa fa-check text-success me-1"></i>
                      <span v-for="(user, index) in comment.seen_by" :key="user.id">
                        {{ user.name }}<span v-if="index !== comment.seen_by.length - 1">, </span>
                      </span>
                    </small>

                    <div v-if="comment.replies?.length" class="replies">
                      <button @click="toggleReplies(comment.id)" class="btn btn-link p-0 mb-2"
                        :class="{ 'new-reply': hasUnseenReplies(comment) }">
                        {{ showReplies[comment.id] ? "Hide" : "View" }}
                        {{ comment.replies.length }} replies
                        <span v-if="hasUnseenReplies(comment)" class="new-reply-dot"></span>
                      </button>

                      <transition name="fade">
                        <div v-if="showReplies[comment.id]" class="replies-container">
                          <div v-for="reply in comment.replies" :key="reply.id" class="reply-item"
                            @click="markReplyAsSeen(reply.id)">
                            <div class="comment-header">
                              <div class="user-info">
                                <div>
                                  <span class="user-name">{{ reply.user?.name }}</span>
                                  <span class="comment-time">{{ formatDateWithTime(reply.created_at) }}</span>
                                </div>
                              </div>
                            </div>
                            <div dir="auto" class="comment-body" v-html="reply.reply_text"></div>
                            <small v-if="reply.seen_by?.length" class="seen-by">
                              <i class="fa fa-check text-success me-1"></i>
                              <span v-for="(user, index) in reply.seen_by" :key="user.id">
                                {{ user.name }}<span v-if="index !== reply.seen_by.length - 1">, </span>
                              </span>
                            </small>

                            <span v-if="!reply.is_seen"
                              class="new-reply-dot position-absolute top-0 start-100 translate-middle"></span>
                          </div>
                        </div>
                      </transition>
                    </div>

                    <div v-if="isSubmittingReplyForComment[comment.id]" class="skeleton-comment">
                      <div class="skeleton-line short"></div>
                      <div class="skeleton-content">
                        <div class="skeleton-line long"></div>
                      </div>
                    </div>

                    <transition name="fade">
                      <div v-if="activeReplyId === comment.id" class="reply-editor">
                        <quill-editor v-if="activeReplyId === comment.id" :ref="(el) => setReplyRef(el, comment.id)"
                          v-model:content="replyContent" :options="editorOptions"
                          @update:content="(val) => (replyContent = val)" contentType="html" class="mb-2" dir="auto" />
                        <div class="d-flex gap-2">
                          <ArgonButton @click="submitReply(comment.id)" size="sm">
                            {{ t("submit") }}
                          </ArgonButton>
                          <ArgonButton variant="outline" @click="cancelReply" size="sm">
                            {{ t("cancel") }}
                          </ArgonButton>
                        </div>
                      </div>
                    </transition>
                  </li>
                </ul>
              </transition>

              <div v-if="isSubmitting" class="skeleton-comment">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line long"></div>
                </div>
              </div>

              <div class="new-comment-compact">
                <div class="editor-wrapper">
                  <quill-editor v-model:content="taskComment" :options="compactEditorOptions"
                    @update:content="(val) => (taskComment = val)" ref="editorRef" contentType="html" dir="auto" />
                </div>

                <div class="comment-controls">
                  <div class="file-upload-compact">
                    <ArgonInput type="file" @change="handleFileUpload" accept="image/*, .pdf, .docx, .xlsx"
                      :key="fileInputKey" size="sm" />
                    <button v-if="fileToUpload" @click="removeFile" class="btn btn-sm btn-outline-danger"
                      title="Remove file">
                      ×
                    </button>
                  </div>

                  <ArgonButton v-if="fileToUpload" @click="submitFile" :disabled="isUploading" size="sm">
                    <i class="fas fa-paper-plane"></i>
                    {{ isUploading ? t("submitting") : t("submit") }}
                  </ArgonButton>

                  <ArgonButton v-else @click="submitComment" :disabled="isCommentEmpty || isSubmitting" size="sm">
                    <i class="fas fa-paper-plane"></i>
                    {{ isSubmitting ? t("submitting") : t("submit") }}
                  </ArgonButton>
                </div>

                <small v-if="fileToUpload" class="file-info">
                  {{ t("maxFileSize", { size: "1.99MB" }) }}
                </small>
              </div>
            </div>
          </template>



          <template #footer>
            <div class="modal-footer-compact">
              <ArgonButton variant="secondary" @click="closeDescriptionModal" size="sm">
                {{ t("close") }}
              </ArgonButton>
            </div>
          </template>

        </ArgonModal>
      </div>
    </transition>
  </div>
</template>


<script setup>
/* eslint-disable no-unused-vars */
import { computed, ref, reactive, onBeforeMount, watch, nextTick } from "vue";
import { useStore } from "vuex";
import Swal from "sweetalert2";

import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import ArgonInput from "@/components/ArgonInput.vue";

import { markTaskCommentsAsSeen } from "@/utils/commentCache";

import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
} from "@/utils/permissions.js";

const emit = defineEmits([
  "page-changed",
  "reload-tasks",
  "filtered-count-changed",
  "open-edit-popup",
  "update:activeTab",
]);

const taskLoading = ref({});
const taskLoadingAction = ref({});

const isLoadingComments = ref(false);
const isLoadingReplies = ref(false);
const isSubmitting = ref(false);
const isUploading = ref(false);
const isSubmittingReplyForComment = ref({});
const showReplies = reactive({});

const props = defineProps({
  oneTimeTasks: {
    type: Array,
    required: true,
    default: () => [],
  },
  pagination: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  activeTab: {
    type: String,
    required: true,
  },
  // from parent, to reflect dashboard-driven filters (priority/due)
  activeQuery: {
    type: Object,
    required: false,
    default: () => ({})
  }
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

const activeTab = computed({
  get: () => props.activeTab,
  set: (value) => emit("update:activeTab", value),
});
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

const t = (key, params = {}) => {
  const lang = store.getters.currentLanguage;
  let translation = translations[lang][key] || key;

  Object.entries(params).forEach(([placeholder, value]) => {
    translation = translation.replace(`{${placeholder}}`, value);
  });

  return translation;
};

function userDisplayName(u) {
  if (!u) return 'Unknown';
  const full = `${u.first_name ?? u.name ?? ''} ${u.last_name ?? ''}`.trim();
  return full || (u.name ?? 'Unknown');
}

// هيلبر لاستخراج الأسماء الأولى لعدد محدود
const firstNames = (users, limit = 2) => {
  if (!users || users.length === 0) return null;
  const names = users
    .slice(0, limit)
    .map((u) => (u?.name || '').split(' ')[0])
    .filter(Boolean);
  let out = names.join(', ');
  if (users.length > limit) out += '...';
  return out || null;
};

// دالة لحساب الاسم المطلوب بناءً على التبويب النشط
const getDisplayName = (task) => {
  const currentId = userData.value?.user?.id;

  switch (activeTab.value) {
    case 'Own': {
      return firstNames(task.assignedUser) || 'Unknown';
    }
    case 'Review': {
      // إذا أنا الـ creator → أعرض لمن (المكلفين)
      if (currentId === task.creator?.id) {
        return firstNames(task.assignedUser) || (task.creator?.name?.split(' ')[0] ?? 'Unknown');
      }
      // في باقي الحالات (سواء supervisor/assigned/consult/informer/أي مستخدم آخر) → أعرض من (المنشئ)
      return task.creator?.name ? task.creator.name.split(' ')[0] : 'Unknown';
    }
    case 'Done': {
      // إذا أنا الـ creator → أعرض لمن (المكلفين)
      if (currentId === task.creator?.id) {
        return firstNames(task.assignedUser) || (task.creator?.name?.split(' ')[0] ?? 'Unknown');
      }
      // في باقي الحالات (سواء supervisor/assigned/consult/informer/أي مستخدم آخر) → أعرض من (المنشئ)
      return task.creator?.name ? task.creator.name.split(' ')[0] : 'Unknown';
    }
    default: {
      return task.creator?.name || 'Unknown';
    }
  }
};
const isCommentEmpty = computed(() => {
  const plainText = taskComment.value.replace(/<[^>]+>/g, "").trim();
  return plainText === "";
});

const reportTypeOptions = [
  { value: "done", label: "Done" },
  { value: "not_done", label: "Not Done" },
];

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

// إعدادات المحرر المضغوطة
const compactEditorOptions = computed(() => ({
  modules: {
    toolbar: [
      ["bold", "italic"],
      [{ list: "bullet" }],
      ["link"],
    ],
  },
  theme: "snow",
  placeholder: translations[currentLanguage.value]?.writeComment || "Write your comment here...",
}));

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

function closeEditPopup() {
  showEditPopup.value = false;
  selectedTask.value = null;
}

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

    markTaskCommentsAsSeen(task.id);
    task.hasNewUpdate = false;

    await getOneTimeTaskComments(task.id);
    task.read_comments = true;

    showDescriptionModal.value = true;

    await nextTick();
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
    if (response.status === 200) {
      taskComments.value = response.data.comments;
    }
  } catch (error) {
    console.error("Error fetching task comments:", error);
  } finally {
    taskLoading.value[taskId] = false;
  }
}

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
    supervisor: "ِAccountable",
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
    writeComment: "Write your comment here...",
    upload: "Upload",
    submitting: "Submitting...",
    uploading: "Uploading...",
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
    uploadError: "Upload Error",
    fileSizeExceedsLimit: "The file size exceeds the allowed limit of {size}.",
    maxFileSize: "Max file size: {size}",
    informer: "Informer",
    consult: "Consult",
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
    supervisor: "المسؤول",
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
    writeComment: "اكتب تعليقك هنا...",
    submitting: "جاري الإرسال...",
    upload: "رفع الملف",
    uploading: "جاري رفع الملف...",
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
    uploadError: "خطأ في الرفع",
    fileSizeExceedsLimit: "حجم الملف يتجاوز الحد المسموح به وهو {size}.",
    maxFileSize: "الحجم الأقصى للملف: {size}",
    informer: "تم إخبار",
    consult: "مُستشار",
  },
};

const filteredTasks = computed(() => {
  if (!props.oneTimeTasks) return [];
  const q = props.activeQuery || {};
  // When global priority/due filter is active (and no explicit status), zero certain tabs
  if (!q.status && (q.priority || q.due) && ["Review", "Done", "Started"].includes(activeTab.value)) {
    return [];
  }
  switch (activeTab.value) {
    case "Inbox":
      return props.oneTimeTasks.filter((task) => {
        return (
          (task.assignedUser
            ?.map((user) => user.id)
            .includes(userData?.value?.user?.id) ||
            task.supervisor?.id === userData?.value?.user?.id ||
            task.consult
              ?.map((user) => user.id)
              .includes(userData?.value?.user?.id) ||
            task.informer
              ?.map((user) => user.id)
              .includes(userData?.value?.user?.id)) &&
          task.is_archived == false &&
          task.status !== "done"
        );
      }).filter(matchesGlobalFilters);
    case "Own":
      return props.oneTimeTasks.filter((task) => {
        return (
          task.creator?.id === userData?.value?.user?.id &&
          task.is_archived == false &&
          task.status !== "done"
        );
      }).filter(matchesGlobalFilters);
    case "Archive":
      return props.oneTimeTasks.filter((task) => task.is_archived == true).filter(matchesGlobalFilters);
    case "Started":
      return props.oneTimeTasks.filter((task) => task.is_starred == true).filter(matchesGlobalFilters);
    case "Review":
      return props.oneTimeTasks.filter((task) => task.status === "review").filter(matchesGlobalFilters);
    case "Done":
      return props.oneTimeTasks.filter((task) => task.status === "done").filter(matchesGlobalFilters);
    case "Label":
      return props.oneTimeTasks.filter(() => {
        // Label-specific logic if needed
      });
    default:
      return props.oneTimeTasks.filter((task) => {
        return (
          task.assignedUser
            ?.map((user) => user.id)
            .includes(userData.value?.user?.id) ||
          task.supervisor?.id === userData.value?.user?.id
        );
      }).filter(matchesGlobalFilters);
  }
});

watch(filteredTasks, (newVal) => {
  emit("filtered-count-changed", newVal.length);
});

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

const updateTaskStatus = async (task, status) => {
  taskLoadingAction.value[task.id] = true;
  const taskData = { id: task.id, status };

  try {
    const response = await store.dispatch("updateoneTimeTaskStatus", taskData);

    if (response.status === 200) {
      await Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("taskStatusUpdated"),
        timer: 1500,
        showConfirmButton: false,
      });
      emit("reload-tasks");
    } else {
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
    taskLoadingAction.value[task.id] = false;
  }
};

function hasUnseenReplies(comment) {
  return comment.replies.find((r) => !r.is_seen);
}

function scrollToFirstUnseenReply() {
  const firstUnseenComment = taskComments.value.find((comment) =>
    comment.replies.some((reply) => !reply.is_seen)
  );

  if (firstUnseenComment) {
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
    const replyToUpdate = taskComments.value
      .flatMap((comment) => comment.replies)
      .find((reply) => reply.id === replyId);

    const replyIds = {
      reply_id: replyId,
    };

    if (replyToUpdate) {
      replyToUpdate.is_seen = true;
      await store.dispatch("markReplyAsSeen", replyIds);
    }
  } catch (error) {
    console.error("Error marking reply as seen:", error);
  }
}

function toggleReplies(commentId) {
  const id = String(commentId);
  showReplies[id] = !showReplies[id];

  if (showReplies[id]) {
    const comment = taskComments.value.find((c) => c.id === commentId);
    if (comment) {
      comment.replies.forEach((reply) => {
        if (!reply.is_seen) {
          markReplyAsSeen(reply.id);
        }
      });
    }
  }
}

const fileToUpload = ref(null);
const fileInputKey = ref(0);

fileToUpload.value = null;
fileInputKey.value++;

function handleFileUpload(event) {
  const file = event.target.files[0];
  const maxSizeInBytes = 1.99 * 1024 * 1024;

  if (!file) return;

  if (file.size > maxSizeInBytes) {
    Swal.fire({
      icon: "error",
      title: t("uploadError"),
      text: t("fileSizeExceedsLimit", { size: "1.99MB" }),
    });

    fileToUpload.value = null;
    fileInputKey.value++;
    return;
  }

  fileToUpload.value = file;
}

const submitFile = async () => {
  if (!fileToUpload.value) return;

  const htmlContent = editorRef.value.getHTML();
  const formData = new FormData();
  formData.append("file", fileToUpload.value);
  formData.append("comment_text", htmlContent);
  isUploading.value = true;

  try {
    await store.dispatch("AddAttachmentOneTimeTask", {
      data: formData,
      taskId: selectedTaskId.value,
    });
    fileToUpload.value = null;

    await getOneTimeTaskComments(selectedTaskId.value);

    taskComment.value = "";
    editorRef.value.setHTML("");
  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    isUploading.value = false;
    fileToUpload.value = null;
    fileInputKey.value++;
  }
};

const removeFile = () => {
  fileToUpload.value = null;
  fileInputKey.value++;
};

// دالة لحساب عدد المهام في كل filter
function daysDiffFromToday(dateString) {
  if (!dateString) return Number.POSITIVE_INFINITY;
  const deadlineDate = new Date(dateString);
  const today = new Date();
  const strip = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const d0 = strip(deadlineDate);
  const t0 = strip(today);
  const diffMs = d0.getTime() - t0.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

function matchesGlobalFilters(task) {
  const q = props.activeQuery || {};
  // If global filter (priority/due) is active and no explicit status is selected,
  // exclude tasks in review/done from ALL tabs and counters
  if (!q.status && (q.priority || q.due)) {
    if (['review', 'done'].includes(task.status)) return false;
  }
  if (q.priority && task.priority !== q.priority) return false;
  if (q.due) {
    if (!task.deadline) return false;
    const strip = (d) => { const x = new Date(d); return new Date(x.getFullYear(), x.getMonth(), x.getDate()); };
    const today = strip(new Date());
    const deadline = strip(task.deadline);
    if (q.due === 'overdue' && !(deadline < today)) return false;
    if (q.due === 'today' && !(deadline.getTime() === today.getTime())) return false;
    if (q.due === 'soon') {
      const k = daysDiffFromToday(task.deadline);
      if (!(k >= 0 && k <= 2)) return false;
    }
  }
  return true;
}

function getTabCount(tabName) {
  if (!props.oneTimeTasks) return 0;
  const q = props.activeQuery || {};
  if (!q.status && (q.priority || q.due) && ["Review", "Done", "Started"].includes(tabName)) {
    return 0;
  }

  switch (tabName) {
    case "Inbox":
      return props.oneTimeTasks.filter((task) => {
        return (
          (task.assignedUser
            ?.map((user) => user.id)
            .includes(userData?.value?.user?.id) ||
            task.supervisor?.id === userData?.value?.user?.id ||
            task.consult
              ?.map((user) => user.id)
              .includes(userData?.value?.user?.id) ||
            task.informer
              ?.map((user) => user.id)
              .includes(userData?.value?.user?.id)) &&
          task.is_archived == false &&
          task.status !== "done" &&
          matchesGlobalFilters(task)
        );
      }).length;

    case "Own":
      return props.oneTimeTasks.filter((task) => {
        return (
          task.creator?.id === userData?.value?.user?.id &&
          task.is_archived == false &&
          task.status !== "done" &&
          matchesGlobalFilters(task)
        );
      }).length;

    case "Archive":
      return props.oneTimeTasks.filter((task) => task.is_archived == true && matchesGlobalFilters(task)).length;

    case "Started":
      return props.oneTimeTasks.filter((task) => task.is_starred == true && matchesGlobalFilters(task)).length;

    case "Review":
      return props.oneTimeTasks.filter((task) => task.status === "review" && matchesGlobalFilters(task)).length;

    case "Done":
      return props.oneTimeTasks.filter((task) => task.status === "done" && matchesGlobalFilters(task)).length;

    default:
      return 0;
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
  /* padding: 1rem; */
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* اسم المنشئ البسيط (Gmail Style) */
.creator-name-simple {
  font-weight: 500;
  font-size: 0.9rem;
  color: #6c757d;
  margin-right: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  cursor: default;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.tab-name {
  flex: 1;
  text-align: left;
}

.tab-count {
  background: #e9ecef;
  color: #6c757d;
  border-radius: 12px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
  line-height: 1;
}

.sidebar button.active .tab-count {
  background: rgba(255, 255, 255, 0.3);
  color: white;
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
  white-space: pre-wrap;
  /* عرض الأسطر كما هي */
  word-wrap: break-word;
  /* لتفكيك الكلمات الطويلة */
  overflow-wrap: break-word;
  /* المتصفحات الحديثة */
}

/* الأوسمة (badge) */
.badge-danger {
  background-color: #ff4444;
  color: #fff;
  border-radius: 4px;
  /* padding: 8px; */
  margin-right: 0.5rem;
}

.badge-warning {
  background-color: #ffc107;
  color: #fff;
  border-radius: 4px;
  /* padding: 8px; */
  margin-right: 0.5rem;
}

.badge-grey {
  background-color: #676767;
  color: #fff;
  border-radius: 4px;
  /* padding: 8px; */
  margin-right: 0.5rem;
}

.badge-success {
  border-radius: 15px;
  /* padding: 8px; */
  margin-left: 0.5rem;
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

.all-modal-scroll {
  flex: 3;
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
  overflow-y: auto;
}

.comments-scroll-container {
  max-height: 70vh;
  /* زيادة المساحة المخصصة للكومنتات */
  overflow-y: auto;
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  padding: 0 0.75rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 3px solid #a6c956;
}

/* تحسينات للشاشات الصغيرة */
@media (max-width: 768px) {
  .comments-scroll-container {
    max-height: 60vh;
    padding: 0.25rem 0.5rem;
  }

  .comment-item {
    padding: 0 0.5rem;
    margin-bottom: 0.4rem;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .comment-actions {
    align-self: flex-end;
    margin-top: 0.25rem;
  }

  .new-comment-compact {
    padding: 0.5rem;
  }

  .comment-controls {
    flex-direction: column;
    gap: 0.4rem;
  }

  .file-upload-compact {
    min-width: 100%;
  }
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
  padding: 0rem 0.5rem;
  transition: color 0.2s;
  border: 1px solid #a6c956;
  margin-bottom: 0;
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

  /* -- الإضافة الجديدة لحل المشكلة -- */
  display: flex;
  flex-direction: column;
  /* لترتيب العناصر فوق بعضها: المحرر أولاً ثم الأزرار */
  gap: 0.75rem;
  /* لإضافة مسافة رأسية بين المحرر ومجموعة الأزرار */
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
/* منطقة كتابة التعليق المضغوطة */
.new-comment-compact {
  flex-shrink: 0;
  padding: 0 0.75rem;
  /* background: #f8f9fa; */
  /* border-top: 1px solid #e9ecef; */
  border-radius: 0 0 8px 8px;
}

.editor-wrapper {
  margin-bottom: 0.5rem;
}

.editor-wrapper .ql-editor {
  min-height: 60px !important;
  padding: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.comment-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.file-upload-compact {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 200px;
}

.file-upload-compact input[type="file"] {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
}

.file-info {
  display: block;
  color: #6c757d;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  text-align: center;
}

/* الستايل القديم للنسخ الاحتياطية */
.new-comment {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  max-height: 100%;
  /* overflow: hidden; */
  text-overflow: ellipsis;
  /* display: -webkit-box; */
  /* -webkit-line-clamp: 5; */
  /* -webkit-box-orient: vertical; */
  line-height: 1.5;
  margin-bottom: 0.5rem;
  word-break: break-word;
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

/* إضافة هذه الأنماط لشريط التمرير */
.modal-content-scroll {
  overflow-y: auto;
  /* تفعيل التمرير الرأسي */
  overflow-x: hidden;
  /* إخفاء التمرير الأفقي */
  max-height: 65vh;
  /* الحد الأقصى لارتفاع المحتوى */
  scrollbar-width: thin;
  /* لـ Firefox */
  scrollbar-color: #888 #f1f1f1;
  /* لـ Firefox */
}

/* إخفاء التمرير الأفقي في المحتوى الداخلي */
.modal-content-scroll::-webkit-scrollbar {
  width: 8px;
  /* عرض شريط التمرير الرأسي */
  height: 0px;
  /* تعطيل شريط التمرير الأفقي */
}

/* حل مشكلة العرض الزائد */
.modal-content-scroll>.row {
  max-width: 100%;
  margin: 0 auto;
}

/* إصلاح حجم الحقول */
.modal-content-scroll input,
.modal-content-scroll select,
.modal-content-scroll textarea {
  max-width: 100%;
  box-sizing: border-box;
}

/* تعديلات على الزر والملف */
.upload-btn {
  /* توحيد الارتفاع مع حقل الملف */
  height: calc(1.5em + 0.75rem + 2px);
  /* نفس ارتفاع .form-control من Bootstrap */
  padding: 0.375rem 0.75rem;
  /* تنسيق التباعد الداخلي */
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
}

/* إصلاح التحديد في حقل الملف */
.form-control[type="file"] {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.new-comment .btn-danger {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  line-height: 1;
  margin-left: -2.5rem;
  /* Adjust based on your layout */
}

.text-muted {
  color: #666 !important;
  /* Darker gray */
  font-size: 0.85rem;
}

.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  /* Vertical and horizontal spacing */
}

/* Reduce badge padding for smaller size */
.badge-danger,
.badge-grey {
  padding: 0.3rem 0.8rem !important;
  /* Adjust as needed */
}

.badge-container>* {
  margin-bottom: 0.5rem;
  /* Bottom margin for wrapped badges */
}

.comments-fullscreen-modal .modal-content {
  /* نجعلها تأخذ ارتفاع الشاشة بالكامل تقريبًا */
  height: 90vh;
  max-height: 90vh;
  /* نغير طريقة العرض لنفرض بنية جديدة */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* الخطوة 2: جعل رأس النافذة (العنوان والوصف) يأخذ مساحته الطبيعية دون تمدد لا نهائي */
.comments-fullscreen-modal .modal-header {
  /* هذه الخاصية تمنع هذا الجزء من التمدد وتجعله يأخذ مساحة على قدر محتواه فقط */
  flex-shrink: 0;
}

/* نستهدف حاوية الوصف داخل الرأس ونجعلها هي التي يتم تمريرها */
.modal-title-description {
  display: block;
  max-height: 25vh;
  overflow-y: auto;
  white-space: pre-line;
  padding-right: 10px;
  margin-top: 10px;
  text-align: start;
  /* <--- هذا هو السطر الجديد والمهم */
}

.modal-title-description p {
  white-space: pre-wrap;
  /* يسمح للنص بالالتفاف مع الحفاظ على الأسطر الجديدة */
  overflow-wrap: break-word;
  /* يكسر الكلمات الطويلة جدًا ويُنزلها للسطر التالي */
  word-wrap: break-word;
  /* نفس الخاصية اللي فوق لدعم المتصفحات القديمة */
  word-break: break-word;
  /* إجراء إضافي لضمان كسر الكلمة عند الحاجة */
}

/* الخطوة 3: جعل محتوى النافذة (التعليقات) يأخذ "باقي" المساحة المتاحة ويكون قابلاً للتمرير */
/* تعديل الخطوة 3 من الحل السابق */
.comments-fullscreen-modal .modal-body {
  flex-grow: 1;
  /* نزيل التمرير من هنا لنعطيه للأبناء */
  overflow: hidden;
  /* نمنع أي تمرير غير مرغوب فيه من هذا العنصر */
  padding: 0;
  /* نزيل الحشو لنتحكم به داخليًا */
  display: flex;
  /* نجعل هذا العنصر flex container هو الآخر */
  flex-direction: column;
}

/* نجعل الحاوية الداخلية مرنة لتفصل بين قائمة التعليقات ومربع الإدخال */
.comments-scroll-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* مهم لمنع التمرير المزدوج */
}

/* نعطي قائمة التعليقات القدرة على التمدد وأخذ المساحة المتاحة */
.comment-list {
  flex-grow: 1;
  /* الأهم: اجعل هذا الجزء يملأ المساحة المتاحة */
  overflow-y: auto;
  /* اجعل هذا الجزء فقط هو الذي يتم تمريره */
  padding: 0 1rem;
  /* نضيف له حشو داخلي لراحة العين */
  margin: 0;
}

/* نمنع مربع التعليق الجديد من التمدد أو الانكماش */
.new-comment {
  flex-shrink: 0;
  /* يمنعه من الانكماش إذا أصبحت الشاشة أصغر */
}

.cst-cmnt {
  direction: auto;
}



.seen-by {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.replies-container {
  margin-top: 0.75rem;
  padding-left: 1rem;
  border-left: 2px solid #e9ecef;
}

.new-reply-dot {
  width: 8px;
  height: 8px;
  background: #dc3545;
  border-radius: 50%;
  display: inline-block;
  margin-left: 0.5rem;
}

.btn-link {
  color: #a9ca5c;
  text-decoration: none;
  font-size: 0.85rem;
}

.btn-link:hover {
  color: #8fb94a;
  text-decoration: underline;
}

.new-reply {
  color: #dc3545 !important;
  font-weight: 600;
}

.skeleton-content {
  flex: 1;
}

/* Improve file upload section spacing */
.d-flex.flex-column {
  gap: 0.5rem;
}

/* Better button spacing */
.d-flex.gap-2 {
  margin-top: 0.75rem;
}

/* Improve modal footer */
.modal-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* Better comment spacing */
.comment-item:last-child {
  margin-bottom: 0;
}

/* Improve reply editor spacing */
.reply-editor .d-flex.gap-2 {
  margin-top: 0.5rem;
}

/* Better file input spacing */
.d-flex.align-items-center {
  gap: 0.5rem;
}

/* Improve text muted spacing */
.text-muted.mt-0.pt-0 {
  margin-top: 0.25rem !important;
  padding-top: 0 !important;
}
</style>