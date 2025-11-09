<!-- src/views/OneTimeTask.vue -->

<script setup>
import {
  ref,
  reactive,
  computed,
  onBeforeMount,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useStore } from "vuex";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonMultipleSelect from "@/components/ArgonMultipleSelect.vue";
import ArgonTagsInput from "@/components/ArgonTagsInput.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonTextarea from "@/components/ArgonTextarea.vue";
import CheckboxMultiSelect from "@/components/CheckboxMultiSelect.vue";

// import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
import OneTimeTaskTable from "@/views/components/OneTimeTaskTable.vue";

const refreshInterval = ref(null); // Will store our setInterval ID

const refreshIntervalId = ref(null); // تغيير اسم المتغير ليكون أوضح

const store = useStore();
const isOwner = computed(() => store.getters.isOwner);

const userData = computed(() => store.getters.user);
console.log("userDataaaaaaaaa:", userData.value);

import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
  // hasPermission,
} from "@/utils/permissions.js";

// const canCreateProject = computed(() =>
//   hasPermission(permissions.value, "create-project")
// );

import Swal from "sweetalert2";

import { isTaskCommentSeen } from "@/utils/commentCache";

const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.id) || {},
);
// Router for query-driven filters
const route = useRoute();
const router = useRouter();

// عند تحميل الصفحة لأول مرة، حفظ الصلاحيات في localStorage
onBeforeMount(async () => {
  if (!permissions.value || Object.keys(permissions.value).length === 0) {
    const extractedPermissions = extractPermissionsFromAPI(
      userData.value?.roles,
    );
    permissions.value = extractedPermissions;
    savePermissionsToLocalStorage(permissions.value, userData.value?.id);
  }
  await store.dispatch("getCompanyUsers");
  await store.dispatch("fetchProjects");
  // if (canCreateProject.value) {
  // }
  // await store.dispatch("fetchDepartments");
  // --- بداية التغييرات ---
  // جلب المهام لأول مرة
  await refreshTasks();

  // بدء التحديث الدوري كل 30 ثانية
  refreshIntervalId.value = setInterval(refreshTasks, 30000); // 30000 مللي ثانية = 30 ثانية
  // --- نهاية التغييرات ---
});

// --- بداية التغييرات ---
// إيقاف التحديث الدوري عند إلغاء تحميل المكون لمنع تسرب الذاكرة
onBeforeUnmount(() => {
  if (refreshIntervalId.value) {
    clearInterval(refreshIntervalId.value);
    refreshIntervalId.value = null; // إعادة تعيين المعرف
    console.log("Interval cleared.");
  }
});
// --- نهاية التغييرات ---

const dataFromApi = computed(() => store.getters.dataFromApi);
console.log("dataFromApi:", dataFromApi.value);
const employeeOptions = ref([]);

watch(
  () => dataFromApi.value,
  () => {
    console.log("dataFromApi changed:", dataFromApi.value);
    if (dataFromApi.value && Array.isArray(dataFromApi.value)) {
      employeeOptions.value = dataFromApi.value.map((employee) => ({
        value: employee.id,
        label:
          `${employee.first_name ?? employee.name ?? ""} ${employee.last_name ?? ""}`.trim(),
        // department: employee.department[0].name,
      }));
      console.log("employeeOptions updated:", employeeOptions.value);
    }
  },
  { immediate: true },
);

const departments = computed(() => store.getters.departments);
console.log("departmentssssssssssssss:", departments.value);

// const formattedDepartments = computed(() => {
//   return departments.value.map((department) => ({
//     value: department.id,
//     label: department.name,
//   }));
// });

const userDepartment = computed(() => {
  const user = userData?.value;
  console.log("user.departments:", user);
  return user?.user?.departments?.map((department) => ({
    value: department?.id,
    label: department?.name,
  }));
});

console.log("userDepartment:", userDepartment.value);

const showAlert = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showSuccess = ref(false);

/* ==== تغييرات هنا: متغيرات الـOneTimeTask ==== */
const oneTimeTaskName = ref("");
const oneTimeTaskDescription = ref("");
const selectedEmployee = ref("");
const selectedAssignee = ref([]);
const selectedSupervisor = ref("");
const selectedConsultant = ref([]);
const selectedInformer = ref([]);

const showPopup = ref(false);
const isMaximized = ref(false);
const isMinimized = ref(false);
const oneTimeTasks = ref([]);
const activeTab = ref("Inbox");
const componentKey = ref(0);
const body = document.getElementsByTagName("body")[0];
const isPageLoading = ref(true);
const isSubmitting = ref(false);

const startDate = ref("");
const endDate = ref("");
const fromDate = ref("");
const toDate = ref("");
const searchQuery = ref("");

const showEditPopup = ref(false);
const editMode = ref(false);
const editedTaskId = ref(null);

// متغيرات لحقول Cc و Bcc
const showCcFields = ref(false);
const showBccFields = ref(false);

// متغيرات للقوائم المنسدلة
const showProjectDropdown = ref(false);
const showPriorityDropdown = ref(false);
const showStartDatePicker = ref(false);
const showEndDatePicker = ref(false);

// متغيرات البحث والفلترة
const projectSearchQuery = ref("");
const prioritySearchQuery = ref("");
const filteredProjects = ref([]);
const filteredPriorities = ref([]);
// Unified query-driven filters
const selectedPriority = ref(""); // existing UI binding
const activeQuery = reactive({
  priority: "",
  status: "",
  due: "", // today | soon | overdue
});
// Prevent query-sync while leaving the page
let isLeavingPage = false;
// deadline dropdown binding needs early declaration to avoid TDZ in hooks below
const selectedDeadLine = ref("");

// متغير للتحكم في عرض أيقونة الحذف
const showClearIcon = ref(null);

const selectedManager = ref("");
// const taskType = ref("");
const dayOfMonth = ref("");
const deptId = ref("");
const projectId = ref("");
// const isUrgent = ref(false);
const priority = ref("");
const prioritiesOptions = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

// تهيئة أولية للبيانات المفلترة
onBeforeMount(() => {
  filteredProjects.value = formattedProjects.value || [];
  filteredPriorities.value = prioritiesOptions;
  console.log("Initial setup - Projects:", filteredProjects.value);
  console.log("Initial setup - Priorities:", filteredPriorities.value);
  // Apply initial priority from query if present
  const pr = route.query.priority;
  if (pr && ["low", "normal", "high", "urgent"].includes(pr)) {
    selectedPriority.value = pr;
  }
  // Load any known filters from query
  Object.keys(activeQuery).forEach((k) => {
    if (route.query[k]) activeQuery[k] = String(route.query[k]);
  });
  // Map due query to dropdown
  const due = route.query.due;
  if (due && ["soon", "overdue", "noDueDate"].includes(due)) {
    selectedDeadLine.value = due === "noDueDate" ? "noDueDate" : due;
  }
  // Focus tab if status passed in query
  if (route.query.status) {
    // Tabs labels are capitalized (Inbox, Own, Archive, Started, Review, Done)
    activeTab.value = String(route.query.status);
  }
});

// Keep route query synced with selectedPriority filter for shareable/refreshable state
watch(selectedPriority, (val) => {
  const nextQuery = { ...route.query };
  if (val) nextQuery.priority = val;
  else delete nextQuery.priority;
  router.replace({ query: nextQuery });
});

// Also keep activeQuery.priority in sync with the UI dropdown (fix reset for 'urgent')
watch(selectedPriority, (val) => {
  activeQuery.priority = val || "";
});

// Keep full activeQuery in sync with route
watch(
  activeQuery,
  () => {
    // if we're navigating away, don't touch the URL to avoid cancelling navigation
    if (isLeavingPage || route.name !== "one time task") return;
    const next = { ...route.query };
    Object.keys(activeQuery).forEach((k) => {
      if (activeQuery[k]) next[k] = activeQuery[k];
      else delete next[k];
    });
    router.replace({ query: next });
  },
  { deep: true },
);

// Keep due query synced with the dropdown selection
watch(selectedDeadLine, (val) => {
  activeQuery.due = val || "";
});
// const taskTypeOptions = [
//   { value: "daily", label: "Daily" },
//   { value: "weekly", label: "Weekly" },
//   { value: "monthly", label: "Monthly" },
//   { value: "last_day_of_month", label: "Last Day of Month" },
// ];

const recurrentDays = ref([]);

// دالة لإضافة أو إزالة اليوم من المصفوفة
// const toggleRecurrentDay = (dayValue, isChecked) => {
//   if (isChecked) {
//     if (!recurrentDays.value.includes(dayValue)) {
//       recurrentDays.value.push(dayValue);
//     }
//   } else {
//     const index = recurrentDays.value.indexOf(dayValue);
//     if (index > -1) {
//       recurrentDays.value.splice(index, 1);
//     }
//   }
// };

watch(
  () => recurrentDays.value,
  (newVal) => {
    console.log("Recurrent Days:", newVal);
  },
);

// إغلاق النافذة المنبثقة
const closePopup = () => {
  showPopup.value = false;
  isMaximized.value = false;
  isMinimized.value = false;
  /* ==== إعادة القيم الفارغة للمتغيرات التي تم تغيير اسمها ==== */
  oneTimeTaskName.value = "";
  oneTimeTaskDescription.value = "";
  selectedEmployee.value = "";
  selectedAssignee.value = [];
  selectedSupervisor.value = "";
  selectedConsultant.value = [];
  selectedInformer.value = [];
  startDate.value = "";
  endDate.value = "";
  fromDate.value = "";
  toDate.value = "";
  selectedManager.value = "";
  // taskType.value = "";
  dayOfMonth.value = "";
  deptId.value = "";
  projectId.value = "";
  priority.value = "";
  // isUrgent.value = false;
  recurrentDays.value = [];

  // إعادة تعيين حقول Cc و Bcc
  showCcFields.value = false;
  showBccFields.value = false;

  // إعادة تعيين الشريط المضغوط
  showCompactPeople.value = false;
  showAssigneeInput.value = false;
  showSupervisorInput.value = false;
  showInformerInput.value = false;
  showConsultantInput.value = false;
};

// دوال تبديل القوائم المنسدلة
const toggleProjectDropdown = () => {
  showProjectDropdown.value = !showProjectDropdown.value;
  // إغلاق القوائم الأخرى
  showPriorityDropdown.value = false;
  showStartDatePicker.value = false;
  showEndDatePicker.value = false;
  // إخفاء حقول الأشخاص
  hideAllInputFields();
  // تعبئة المشاريع المفلترة عند الفتح
  if (showProjectDropdown.value) {
    filteredProjects.value = formattedProjects.value;
    projectSearchQuery.value = "";
    console.log("Projects loaded:", filteredProjects.value);
  }
};

const togglePriorityDropdown = () => {
  showPriorityDropdown.value = !showPriorityDropdown.value;
  // إغلاق القوائم الأخرى
  showProjectDropdown.value = false;
  showStartDatePicker.value = false;
  showEndDatePicker.value = false;
  // إخفاء حقول الأشخاص
  hideAllInputFields();
  // تعبئة الأولويات المفلترة عند الفتح
  if (showPriorityDropdown.value) {
    filteredPriorities.value = prioritiesOptions;
    prioritySearchQuery.value = "";
    console.log("Priorities loaded:", filteredPriorities.value);
  }
};

const toggleStartDatePicker = () => {
  showStartDatePicker.value = !showStartDatePicker.value;
  // إغلاق القوائم الأخرى
  showProjectDropdown.value = false;
  showPriorityDropdown.value = false;
  showEndDatePicker.value = false;
  // إخفاء حقول الأشخاص
  hideAllInputFields();
};

const toggleEndDatePicker = () => {
  showEndDatePicker.value = !showEndDatePicker.value;
  // إغلاق القوائم الأخرى
  showProjectDropdown.value = false;
  showPriorityDropdown.value = false;
  showStartDatePicker.value = false;
  // إخفاء حقول الأشخاص
  hideAllInputFields();
};

// دوال إغلاق القوائم
const closeProjectDropdown = () => {
  showProjectDropdown.value = false;
};

const closePriorityDropdown = () => {
  showPriorityDropdown.value = false;
};

const closeStartDatePicker = () => {
  showStartDatePicker.value = false;
};

const closeEndDatePicker = () => {
  showEndDatePicker.value = false;
};

// دوال Tooltip
const getProjectTooltip = () => {
  if (projectId.value) {
    const project = formattedProjects.value.find(
      (p) => p.value === projectId.value,
    );
    return project ? `${t("project")}: ${project.label}` : t("project");
  }
  return t("selectProject");
};

const getPriorityTooltip = () => {
  if (priority.value) {
    const priorityOption = prioritiesOptions.find(
      (p) => p.value === priority.value,
    );
    return priorityOption
      ? `${t("priority")}: ${priorityOption.label}`
      : t("priority");
  }
  return t("selectPriority");
};

const getStartDateTooltip = () => {
  if (startDate.value) {
    return `${t("startDate")}: ${startDate.value}`;
  }
  return t("enterStartDate");
};

const getEndDateTooltip = () => {
  if (endDate.value) {
    return `${t("endDate")}: ${endDate.value}`;
  }
  return t("enterEndDate");
};

// دوال البحث والفلترة
const filterProjects = () => {
  if (!projectSearchQuery.value.trim()) {
    filteredProjects.value = formattedProjects.value;
  } else {
    const query = projectSearchQuery.value.toLowerCase();
    filteredProjects.value = formattedProjects.value.filter((project) =>
      project.label.toLowerCase().includes(query),
    );
  }
};

const filterPriorities = () => {
  if (!prioritySearchQuery.value.trim()) {
    filteredPriorities.value = prioritiesOptions;
  } else {
    const query = prioritySearchQuery.value.toLowerCase();
    filteredPriorities.value = prioritiesOptions.filter((priority) =>
      priority.label.toLowerCase().includes(query),
    );
  }
};

// دوال اختيار القيم
const selectProject = (project) => {
  projectId.value = project.value;
  projectSearchQuery.value = "";
  closeProjectDropdown();
};

const selectPriority = (priorityOption) => {
  priority.value = priorityOption.value;
  prioritySearchQuery.value = "";
  closePriorityDropdown();
};

// (moved below after selectedPriority declaration to avoid TDZ)

// دوال حذف القيم
const clearProject = () => {
  projectId.value = "";
  showClearIcon.value = null;
};

const clearPriority = () => {
  priority.value = "";
  showClearIcon.value = null;
};

const clearStartDate = () => {
  startDate.value = "";
  showClearIcon.value = null;
};

const clearEndDate = () => {
  endDate.value = "";
  showClearIcon.value = null;
};

// وظائف إدارة المودال على طريقة Gmail
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
  if (isMinimized.value) {
    isMaximized.value = false;
  }
};

const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value;
  if (isMaximized.value) {
    isMinimized.value = false;
  }
};

// عند تركيب المكوّن
onMounted(() => {
  // استدعِ نفس دالة الـrefreshTasks أو أي دالة XHR ثانية
  refreshInterval.value = setInterval(() => {
    refreshTasks();
  }, 10 * 1000); // 60000 مللي ثانية = 1 دقيقة
});

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

  try {
    isPageLoading.value = true;
    // Example of calling your Vuex action:
    const response = await store.dispatch("fetchOneTimeTasks");
    console.log("response:", response);
    if (response.status === 200) {
      oneTimeTasks.value = store.getters.oneTimeTasks;
      const nowTsInit = Date.now();
      const freshMsInit = 2 * 60 * 1000; // اعتبرها جديدة خلال دقيقتين بعد الإنشاء
      oneTimeTasks.value = store.getters.oneTimeTasks.map((task) => {
        const createdTs = task.created_at
          ? new Date(task.created_at).getTime()
          : 0;
        const isFreshlyCreated = nowTsInit - createdTs <= freshMsInit;
        return {
          ...task,
          hasNewUpdate:
            task.read_comments !== true ||
            isFreshlyCreated ||
            (task.comments_count > 0 && !isTaskCommentSeen(task.id)),
        };
      });
      const nowTsRefresh = Date.now();
      const freshMsRefresh = 2 * 60 * 1000; // اعتبرها جديدة خلال دقيقتين بعد الإنشاء
      oneTimeTasks.value = store.getters.oneTimeTasks.map((task) => {
        const createdTs = task.created_at
          ? new Date(task.created_at).getTime()
          : 0;
        const isFreshlyCreated = nowTsRefresh - createdTs <= freshMsRefresh;
        return {
          ...task,
          hasNewUpdate:
            task.read_comments !== true ||
            isFreshlyCreated ||
            (task.comments_count > 0 && !isTaskCommentSeen(task.id)),
        };
      });

      // استخدام دالة الترتيب الموحدة
      oneTimeTasks.value = sortTasksForTab(
        oneTimeTasks.value,
        activeTab.value,
        currentUserId.value,
      );

      // طباعة التاسكات مرتبة للتحقق من الترتيب
      console.log(
        "التاسكات بعد الترتيب:",
        oneTimeTasks.value.map((task) => ({
          name: task.oneTimeTaskName,
          priority: task.priority,
          hasUpdate: task.hasNewUpdate || task.comments_count > 0,
          commentsCount: task.comments_count,
          lastUpdate: task.updated_at || task.created_at,
        })),
      );
    }

    console.log("oneTimeTasks:", oneTimeTasks.value);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  } finally {
    isPageLoading.value = false;
  }

  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

// جلب وتجديد المهام
const refreshTasks = async () => {
  // --- بداية التغييرات ---
  // إضافة console.log لتتبع استدعاء الدالة
  console.log("Refreshing tasks...", new Date().toLocaleTimeString());
  // --- نهاية التغييرات ---
  try {
    const response = await store.dispatch("fetchOneTimeTasks");
    if (response.status === 200) {
      oneTimeTasks.value = store.getters.oneTimeTasks;
      const nowTsRefresh = Date.now();
      const freshMsRefresh = 2 * 60 * 1000; // اعتبرها جديدة خلال دقيقتين بعد الإنشاء
      oneTimeTasks.value = store.getters.oneTimeTasks.map((task) => {
        const createdTs = task.created_at
          ? new Date(task.created_at).getTime()
          : 0;
        const isFreshlyCreated = nowTsRefresh - createdTs <= freshMsRefresh;
        return {
          ...task,
          hasNewUpdate:
            task.read_comments !== true ||
            isFreshlyCreated ||
            (task.comments_count > 0 && !isTaskCommentSeen(task.id)),
        };
      });

      // استخدام دالة الترتيب الموحدة
      oneTimeTasks.value = sortTasksForTab(
        oneTimeTasks.value,
        activeTab.value,
        currentUserId.value,
      );
      // Apply client-side priority filter if active
      if (selectedPriority.value) {
        oneTimeTasks.value = oneTimeTasks.value.filter(
          (t) => t.priority === selectedPriority.value,
        );
      }
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

// Helper to clear priority filter programmatically if needed
// removed unused helper (can be re-added when used in template)

// Clear query and filters when leaving this page
onBeforeRouteLeave(() => {
  // just clear local state; allow navigation to proceed
  isLeavingPage = true;
  selectedPriority.value = "";
  selectedDeadLine.value = "";
  Object.keys(activeQuery).forEach((k) => (activeQuery[k] = ""));
});

const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);
const projects = computed(() => store.getters.projects);
console.log("projectsssssssssssss:", projects.value);

const currentUserId = computed(() => store.getters.userId);
console.log("currentUserId:", currentUserId.value);

// ==================== دوال مساعدة للترتيب ====================
// helper: آخر نشاط (تحديث/إنشاء)
const activityTs = (t) => new Date(t.updated_at || t.created_at || 0).getTime();

// helper: هل فيه تحديث يخص المستخدم الحالي؟
const hasUpdateForUser = (t, userId) => {
  const involved =
    t.assignedUser?.some((u) => u.id === userId) ||
    t.informer?.some((u) => u.id === userId) ||
    t.consult?.some((u) => u.id === userId) ||
    t.supervisor?.id === userId;
  const updated =
    t.hasNewUpdate || (t.comments_count > 0 && t.read_comments !== true);
  return involved && updated;
};

// sorter حسب التبويب
const sortTasksForTab = (tasks, tab, userId) => {
  return [...tasks].sort((a, b) => {
    // 1) العاجل أولاً (إلا في Done)
    if (tab !== "Done") {
      const aUrg = a.priority === "urgent" ? 1 : 0;
      const bUrg = b.priority === "urgent" ? 1 : 0;
      if (aUrg !== bUrg) return bUrg - aUrg;
    }

    // 2) في غير Own: اللي عليه تحديث يخص المستخدم يطلع فوق
    if (tab !== "Own") {
      const aUpd = hasUpdateForUser(a, userId) ? 1 : 0;
      const bUpd = hasUpdateForUser(b, userId) ? 1 : 0;
      if (aUpd !== bUpd) return bUpd - aUpd;
    }

    // 3) الأحدث زمنيًا
    return activityTs(b) - activityTs(a);
  });
};
// ==================== نهاية دوال مساعدة للترتيب ====================

// تحكم في الصفحات
const pagination = ref({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
});

const currentLanguage = computed(() => store.getters.currentLanguage);

watch(
  () => store.getters.currentLanguage,
  () => {},
);

const t = (key) => {
  return translations[currentLanguage.value][key];
};

// في المكان الذي تُحدد فيه الخيارات (مثل projects أو departments)
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

// تهيئة البيانات المفلترة
watch(
  () => formattedProjects.value,
  (newProjects) => {
    console.log("formattedProjects changed:", newProjects);
    filteredProjects.value = newProjects;
  },
  { immediate: true },
);

watch(
  () => prioritiesOptions,
  (newPriorities) => {
    console.log("prioritiesOptions changed:", newPriorities);
    filteredPriorities.value = newPriorities;
  },
  { immediate: true },
);

// متغيرات الفلترة
const selectedTaskType = ref("");
const selectedDepartments = ref([]);
const selectedProjects = ref([]);
const selectedStatus = ref("");

console.log("userDepartment:", userDepartment.value);

// Removed old string-based date formatting from filter logic to avoid misclassification

// Helper: difference in whole days between deadline and today (deadline - today)
// Positive values mean deadline in the future, 0 means today, negative means overdue
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

// const nowTime = ref(new Date());

// فلترة البيانات (أماميًا)
const filteredTasks = computed(() => {
  let tasks = [...oneTimeTasks.value];
  console.log("tasksssss:", tasks);

  if (selectedStatus.value) {
    if (selectedStatus.value === "inProgress") {
      tasks = tasks.filter((t) => t.status === "inProgress");
    } else if (selectedStatus.value === "pending") {
      tasks = tasks.filter((t) => t.status === "pending");
    } else if (selectedStatus.value === "review") {
      tasks = tasks.filter((t) => t.status === "review");
    } else if (selectedStatus.value === "hasNewUpdate") {
      tasks = tasks.filter((t) => t.read_comments === false);
    }
    // else if (selectedStatus.value === "lated") {
    //   tasks = tasks.filter((t) => {
    //     if (!t.to) return false;
    //     const [taskHours, taskMinutes] = t.to.split(":").map(Number);
    //     const taskTime = new Date();
    //     taskTime.setHours(taskHours, taskMinutes, 0, 0);

    //     const isNotDoneOrReported =
    //       t.status !== "done" &&
    //       t.status !== "not_done";

    //     return taskTime < nowTime.value && isNotDoneOrReported;
    //   });
    // }
  }

  // priority filter (from dropdown or query)
  const effPriority = selectedPriority.value || activeQuery.priority;
  if (effPriority) {
    tasks = tasks.filter((t) => t.priority === effPriority);
  }

  // status filter via query (e.g., review)
  if (activeQuery.status) {
    if (activeQuery.status === "inProgress")
      tasks = tasks.filter((t) => t.status === "inProgress");
    else if (activeQuery.status === "pending")
      tasks = tasks.filter((t) => t.status === "pending");
    else if (activeQuery.status === "review")
      tasks = tasks.filter((t) => t.status === "review");
  }

  if (selectedEmployee.value) {
    tasks = tasks.filter((t) => {
      // استخراج أرقام تعريف الموظفين من جميع الحقول
      const assignedIds = t.assignedUser?.map((user) => user.id) ?? [];
      const informerIds = t.informer?.map((user) => user.id) ?? [];
      const consultIds = t.consult?.map((user) => user.id) ?? [];
      const supervisorId = t.supervisor?.id ?? null;
      const creatorId = t.creator?.id ?? null;

      // تجميع كل الأرقام التعريفية في مصفوفة واحدة
      const allUserIds = [
        ...assignedIds,
        ...informerIds,
        ...consultIds,
        supervisorId,
        creatorId,
      ];

      // التحقق مما إذا كان المُحدد موجودًا في أي من الحقول
      return allUserIds.includes(parseInt(selectedEmployee.value));
    });

    console.log("tasks after filtering by employee:", tasks);
  }

  const stripDate = (d) => {
    const x = new Date(d);
    return new Date(x.getFullYear(), x.getMonth(), x.getDate());
  };
  const todayDateOnly = stripDate(new Date());
  console.log(todayDateOnly);

  // deadline dropdown filter (existing)
  if (selectedDeadLine.value) {
    tasks = tasks.filter((t) => {
      // no due date option
      if (selectedDeadLine.value === "noDueDate") return !t.deadline;

      // when we need a date but it's missing → exclude
      if (!t.deadline) return false;

      if (selectedDeadLine.value === "overdue") {
        const deadline = stripDate(t.deadline);
        return deadline < todayDateOnly;
      }
      if (selectedDeadLine.value === "soon") {
        // soon within 2 days: 0, 1, or 2 days remaining
        const diff = daysDiffFromToday(t.deadline);
        return diff >= 0 && diff <= 2;
      }
      return true;
    });
  }

  // due filter via query (today | soon | overdue)
  if (activeQuery.due) {
    tasks = tasks.filter((t) => {
      if (!t.deadline) return false;
      const deadline = stripDate(t.deadline);
      if (activeQuery.due === "overdue") return deadline < todayDateOnly;
      if (activeQuery.due === "today")
        return deadline.getTime() === todayDateOnly.getTime();
      if (activeQuery.due === "soon") {
        const diff = daysDiffFromToday(t.deadline);
        return diff >= 0 && diff <= 2;
      }
      return true;
    });
  }

  if (selectedDepartments.value.length > 0) {
    const departmentIds = selectedDepartments.value.map((d) => d.id);
    console.log(departmentIds);
    tasks = tasks.filter(
      (t) =>
        t.department.dept_id && departmentIds.includes(t.department.dept_id),
    );
  }

  // داخل computed property filteredTasks
  if (selectedProjects.value.length > 0) {
    const selectedProjectIds = selectedProjects.value.map(
      (project) => project.id,
    );
    tasks = tasks.filter((task) => {
      // إذا كان المشروع غير موجود (null)، تحقق من وجود null في selectedProjectIds
      if (!task.project) {
        return selectedProjectIds.includes(null);
      }
      // وإلا تحقق من مطابقة project.id
      return selectedProjectIds.includes(task.project.id);
    });
  }

  tasks = tasks.filter((task) => searchMatch(task));
  return tasks;
});

console.log("filteredTasks:", filteredTasks.value);

watch(
  () => filteredTasks.value.length,
  (newLength) => {
    pagination.value.total = newLength;
    pagination.value.last_page = Math.ceil(
      newLength / pagination.value.per_page,
    );

    if (pagination.value.current_page > pagination.value.last_page) {
      pagination.value.current_page = pagination.value.last_page || 1;
    }
  },
  { immediate: true },
);

// watch(
//   () => store.getters.oneTimeTasks,
//   (newTasks) => {
//     oneTimeTasks.value = newTasks.map(task => ({
//       ...task,
//       hasNewUpdate: task.comments_count > 0 && !isTaskCommentSeen(task.id),
//     }));
//   },
//   { immediate: true }
// );

// تقطيع المهام حسب الصفحة
// const paginatedTasks = computed(() => {
//   const startIndex =
//     (pagination.value.current_page - 1) * pagination.value.per_page;
//   const endIndex = startIndex + pagination.value.per_page;
//   return filteredTasks.value.slice(startIndex, endIndex);
// });

// console.log("filteredTasks.value =", filteredTasks.value);
// console.log("paginatedTasks.value =", paginatedTasks.value);

const resetFilters = () => {
  selectedTaskType.value = "";
  selectedStatus.value = "";
  selectedDeadLine.value = "";
  selectedPriority.value = "";
  selectedEmployee.value = "";
  selectedAssignee.value = [];
  selectedDepartments.value = [];
  selectedProjects.value = [];
  pagination.value.current_page = 1;
  // Clear global query-driven filters explicitly
  Object.keys(activeQuery).forEach((k) => (activeQuery[k] = ""));
  const cleared = { ...route.query };
  delete cleared.priority;
  delete cleared.due;
  delete cleared.status;
  router.replace({ query: cleared });
};

// const toggleAllDepartments = () => {
//   if (selectedDepartments.value.length === userDepartment.value.length) {
//     selectedDepartments.value = [];
//   } else {
//     selectedDepartments.value = userDepartment.value.map((dept) => ({
//       id: dept.value,
//       name: dept.label,
//     }));
//   }
// };

const handlePageChange = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page;
  }
};

function searchMatch(task) {
  const query = searchQuery.value.toLowerCase();
  const taskName = (task.title || "").toLowerCase();

  // معالجة جميع الحقول ذات المصفوفات أو الأشياء الفردية
  const assignedNames = (
    task.assignedUser?.map((user) => user.name) ?? []
  ).join(" ");
  const informerNames = (task.informer?.map((user) => user.name) ?? []).join(
    " ",
  );
  const consultNames = (task.consult?.map((user) => user.name) ?? []).join(" ");
  const supervisorName = task.supervisor?.name ?? "";
  const creatorName = task.creator?.name ?? "";

  // الجمع بين جميع الأسماء في سلسلة واحدة
  const employee =
    `${assignedNames} ${informerNames} ${consultNames} ${supervisorName} ${creatorName}`.toLowerCase();

  return taskName.includes(query) || employee.includes(query);
}

// عداد يأتي من الابن
const oneTimeTasksCount = ref(0);
function handleFilteredCount(newCount) {
  oneTimeTasksCount.value = newCount;
}

// فتح النافذة المنبثقة
function openPopup() {
  showPopup.value = true;
}

/* ==== تغيير اسم الدالة من addRoutineTask إلى createOneTimeTask ==== */
async function createOneTimeTask() {
  // نفس المنطق السابق لتجميع البيانات
  if (oneTimeTaskName.value) {
    isSubmitting.value = true;
    const oneTimeTask = {
      title: oneTimeTaskName.value,
      description: oneTimeTaskDescription.value,
      // start_date: startDate.value,
      // deadline: endDate.value,
      department_id: deptId.value || null,
      project_id: projectId.value,
      // is_urgent: isUrgent.value,
      priority: priority.value,
      assigned_user_id: selectedAssignee.value || null,
      supervisor_user_id: selectedSupervisor.value || null,
      inform_user_id: selectedInformer.value || null,
      consult_user_id: selectedConsultant.value || null,
    };

    // أضف start_date فقط إذا كانت القيمة موجودة
    if (startDate.value) {
      oneTimeTask.start_date = startDate.value;
    }

    // نفس الأمر مع deadline إذا كان اختياريًا
    if (endDate.value) {
      oneTimeTask.deadline = endDate.value;
    }

    console.log("oneTimeTask:", oneTimeTask);
    try {
      // تنادي أكشن بـStore لو أردت (كما كان يفعل addRoutineTask)
      const response = await store.dispatch("createOneTimeTask", oneTimeTask);
      if (response.status === 201) {
        // تنبيه نجاح (إن كنت تستخدم Swal أو غيره)
        // console.log("OneTimeTask created successfully!");
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "OneTimeTask created successfully!",
        });
      }
      closePopup();
      await refreshTasks();
      componentKey.value += 1;

      // إعادة تعيين الشريط المضغوط
      showCompactPeople.value = false;
      showAssigneeInput.value = false;
      showSupervisorInput.value = false;
      showInformerInput.value = false;
      showConsultantInput.value = false;
      // إعادة تعيين حقول Cc و Bcc
      showCcFields.value = false;
      showBccFields.value = false;
    } catch (error) {
      // تنبيه خطأ
      console.error("Error creating oneTimeTask:", error);
      Swal.fire({
        icon: "error",
        title: t("errorOccurred"),
        html: error,
        showConfirmButton: true,
        backdrop: "rgba(0,0,0,0.5)",
        heightAuto: false,
        customClass: {
          popup: "swal-above-modal",
        },
      });
    } finally {
      isSubmitting.value = false;
    }
  } else {
    // إن لم يُدخل الاسم
    // console.log("Please enter the name.");
  }
}

const selectedAssigneeNames = ref([]);
const selectedInformerNames = ref([]);
const selectedConsultantNames = ref([]);

// متغيرات للتحكم في عرض حقول الأشخاص
const showAssigneeInput = ref(true);
const showSupervisorInput = ref(true);
const showInformerInput = ref(true);
const showConsultantInput = ref(true);
const showCompactPeople = ref(false); // false = شريط مضغوط ظاهر, true = gmail-people-section ظاهر

// دالة للحصول على اسم الموظف
const getEmployeeName = (id) => {
  console.log("getEmployeeName called with ID:", id, typeof id);
  console.log("employeeOptions:", employeeOptions.value);

  // البحث بتحويل كلا النوعين لنفس النوع
  const employee = employeeOptions.value.find(
    (e) => e.value == id || e.value === parseInt(id) || e.value === String(id),
  );

  console.log("Found employee:", employee);
  return employee ? employee.label : String(id ?? "");
};

// دوال إزالة الأشخاص
const removeAssignee = (id) => {
  selectedAssignee.value = selectedAssignee.value.filter((e) => e !== id);
  showAssigneeInput.value = false;
};

const removeSupervisor = () => {
  selectedSupervisor.value = null;
  showSupervisorInput.value = false;
};

const removeInformer = (id) => {
  selectedInformer.value = selectedInformer.value.filter((e) => e !== id);
  showInformerInput.value = false;
};

const removeConsultant = (id) => {
  selectedConsultant.value = selectedConsultant.value.filter((e) => e !== id);
  showConsultantInput.value = false;
};

// دالة إخفاء جميع حقول الإدخال عند التفاعل مع عناصر أخرى
const hideAllInputFields = () => {
  console.log("hideAllInputFields called"); // للتأكد من استدعاء الدالة
  showAssigneeInput.value = false;
  showSupervisorInput.value = false;
  showInformerInput.value = false;
  showConsultantInput.value = false;
  showCompactPeople.value = false; // لإخفاء gmail-people-section وإظهار الشريط المضغوط
  // إخفاء حقول Cc و Bcc وإعادة تعيينها للحالة الافتراضية
  showCcFields.value = false;
  showBccFields.value = false;
};

// إضافة watchers للمتغيرات لإخفاء الحقول عند التغيير
watch(selectedAssignee, (newVal) => {
  if (newVal && newVal.length > 0) {
    showAssigneeInput.value = false;
    // تحديث أسماء الموظفين
    selectedAssigneeNames.value = newVal.map((id) => getEmployeeName(id));
  } else {
    selectedAssigneeNames.value = [];
  }
});

watch(selectedSupervisor, (newVal) => {
  if (newVal) {
    showSupervisorInput.value = false;
  }
});

watch(selectedInformer, (newVal) => {
  if (newVal && newVal.length > 0) {
    showInformerInput.value = false;
    // تحديث أسماء المخطرين
    selectedInformerNames.value = newVal.map((id) => getEmployeeName(id));
  } else {
    selectedInformerNames.value = [];
  }
});

watch(selectedConsultant, (newVal) => {
  if (newVal && newVal.length > 0) {
    showConsultantInput.value = false;
    // تحديث أسماء المستشارين
    selectedConsultantNames.value = newVal.map((id) => getEmployeeName(id));
  } else {
    selectedConsultantNames.value = [];
  }
});

// إضافة دالة للتعامل مع النقر على حقول أخرى
const onFieldFocus = () => {
  hideAllInputFields();
};

// دالة للتعامل مع النقر على المحتوى
// computed property للتحقق من وجود أشخاص مختارين
const hasSelectedPeople = computed(() => {
  return (
    selectedAssignee.value.length > 0 ||
    selectedSupervisor.value ||
    selectedInformer.value.length > 0 ||
    selectedConsultant.value.length > 0
  );
});

// دالة لتوسيع قسم الأشخاص
const expandPeopleSection = () => {
  console.log("expandPeopleSection called"); // للتأكد من استدعاء الدالة
  showCompactPeople.value = true; // لإظهار gmail-people-section
  showAssigneeInput.value = true;
  showSupervisorInput.value = true;
  showInformerInput.value = true;
  showConsultantInput.value = true;
  // إظهار حقول Cc و Bcc
  showCcFields.value = false;
  showBccFields.value = false;
};

const onContentClick = (event) => {
  // التحقق من أن النقر ليس على حقول الأشخاص أو الشريط المضغوط أو الـ dropdowns
  if (
    !event.target.closest(".gmail-people-section") &&
    !event.target.closest(".gmail-people-field") &&
    !event.target.closest(".gmail-people-input-container") &&
    !event.target.closest(".gmail-compact-people-bar") &&
    !event.target.closest(".toolbar-dropdown") &&
    !event.target.closest(".gmail-toolbar-icon-group")
  ) {
    console.log("onContentClick - hiding fields"); // للتأكد
    hideAllInputFields();
    // إغلاق الـ dropdowns أيضاً
    closeProjectDropdown();
    closePriorityDropdown();
    closeStartDatePicker();
    closeEndDatePicker();
  }
};

function openEditPopupInParent(task) {
  // نُجهّز الحقول بقيم task
  editMode.value = true;
  showEditPopup.value = true;
  editedTaskId.value = task.id;

  console.log("task:", task.is_urgent);

  oneTimeTaskName.value = task.title || "";
  oneTimeTaskDescription.value = task.description || "";
  selectedAssignee.value = task.assignedUser?.map((user) => user.id) || null;
  selectedAssigneeNames.value =
    task.assignedUser?.map((user) => user.name) || null;
  selectedSupervisor.value = task.supervisor?.id || null;
  selectedInformer.value = task.informer?.map((user) => user.id) || null;
  selectedInformerNames.value = task.informer?.map((user) => user.name) || null;
  selectedConsultant.value = task.consult?.map((user) => user.id) || null;
  selectedConsultantNames.value =
    task.consult?.map((user) => user.name) || null;
  deptId.value = task.department?.id || "";
  projectId.value = task.project?.id;
  console.log(task.project?.id);
  // isUrgent.value = task.is_urgent || false;
  priority.value = task.priority || "";
  startDate.value = task.start_date || "";
  endDate.value = task.deadline || "";

  // إعادة تعيين الشريط المضغوط
  showCompactPeople.value = false;
  showAssigneeInput.value = false;
  showSupervisorInput.value = false;
  showInformerInput.value = false;
  showConsultantInput.value = false;
  // ... إلخ
}

const closeEditPopup = () => {
  showEditPopup.value = false;
  editMode.value = false;
  editedTaskId.value = null;
  // تنظيف الحقول
  oneTimeTaskName.value = "";
  oneTimeTaskDescription.value = "";
  selectedAssignee.value = "";
  selectedAssigneeNames.value = "";
  selectedSupervisor.value = "";
  selectedInformer.value = "";
  selectedInformerNames.value = "";
  selectedConsultant.value = "";
  selectedConsultantNames.value = "";
  deptId.value = "";
  projectId.value = "";
  // isUrgent.value = false;
  priority.value = "";
  startDate.value = "";
  endDate.value = "";

  // إعادة تعيين الشريط المضغوط
  showCompactPeople.value = false;
  showAssigneeInput.value = false;
  showSupervisorInput.value = false;
  showInformerInput.value = false;
  showConsultantInput.value = false;
  // ... إلخ
};

const updateOneTimeTask = async () => {
  if (!oneTimeTaskName.value) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Please enter the task name.",
    });
    return;
  }

  try {
    isSubmitting.value = true;

    const updatedTask = {
      id: editedTaskId.value,
      title: oneTimeTaskName.value,
      description: oneTimeTaskDescription.value,
      assigned_user_id: selectedAssignee.value,
      supervisor_user_id: selectedSupervisor.value || null,
      inform_user_id: selectedInformer.value || null,
      consult_user_id: selectedConsultant.value || null,
      department_id: deptId.value,
      project_id: projectId.value === "No Project" ? null : projectId.value,
      // is_urgent: isUrgent.value,
      priority: priority.value,
      // start_date: startDate.value,
      // deadline: endDate.value,
    };

    console.log("updatedTask" + updatedTask);

    // أضف start_date فقط إذا كانت القيمة موجودة
    if (startDate.value) {
      updatedTask.start_date = startDate.value;
    }

    // نفس الأمر مع deadline إذا كان اختياريًا
    if (endDate.value) {
      updatedTask.deadline = endDate.value;
    }

    const response = await store.dispatch("updateOneTimeTask", updatedTask);

    if (response.status === 200) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "One Time Task updated successfully!",
      });
      closeEditPopup();
      await refreshTasks();
      componentKey.value += 1;

      // إعادة تعيين الشريط المضغوط
      showCompactPeople.value = false;
      showAssigneeInput.value = false;
      showSupervisorInput.value = false;
      showInformerInput.value = false;
      showConsultantInput.value = false;
    }
  } catch (error) {
    // تنبيه خطأ
    console.error("Error creating oneTimeTask:", error);
    Swal.fire({
      icon: "error",
      title: t("errorOccurred"),
      html: error,
      showConfirmButton: true,
      backdrop: "rgba(0,0,0,0.5)",
      heightAuto: false,
      customClass: {
        popup: "swal-above-modal",
      },
    });
  } finally {
    isSubmitting.value = false;
  }
};

const translations = {
  en: {
    addMember: "Add Member",
    email: "Email",
    emailExistsError:
      "This email is already registered. Please use another email.",
    generalError: "An error occurred while submitting. Please try again later.",
    invalidCompanyIdOrUserId: "Invalid Company ID or User ID.",
    /* ==== تغيرت routineTask... إلى oneTimeTask... ==== */
    oneTimeTaskDeleted: "One Time Task deleted successfully.",
    oneTimeTaskAdded: "One Time Task added successfully.",
    deleteConfirmationTitle: "Delete One Time Task",
    deleteConfirmationText:
      "Are you sure you want to delete this One Time Task?",
    delete: "Delete",
    addRoutineTask: "Add One Time Task",
    taskName: "Task Name*",
    description: "Description",
    assignTo: "Assign To*",
    supervisor: "Supervisor",
    informer: "Informer",
    consultant: "Consultant",
    editOneTimeTask: "Edit One Time Task",
    update: "Update",
    close: "Close",
    create: "Create",
    oneTimeTasks: "One Time Tasks",
    TaskNameRequired: "Please enter the task name.",
    TaskAddedError:
      "An error occurred while adding the task. Please try again later.",
    from: "From",
    to: "To",
    TaskManager: "Task Manager",
    assignManager: "Assign Manager",
    enterDescription: "Enter Description",
    selectProject: "Select Project",
    selectDepartment: "Select Department",
    enterTaskName: "Enter Task Name",
    createOneTimeTask: "Create One Time Task",
    saving: "Saving...",
    noRoutineTasks: "No one-time tasks found.",
    createee: "Create your one-time tasks",
    inactive: "Inactive",
    active: "Active",
    advancedSettings: "Advanced Settings",
    taskNumber: "Task Number",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    enterStartDate: "Enter start date",
    startDate: "Start Date*",
    endDate: "End Date",
    taskType: "Task Type",
    status: "Status",
    department: "Department",
    allTypes: "All Types",
    allStatuses: "All Status",
    allDepartments: "All Departments",
    weekly: "Weekly",
    monthly: "Monthly",
    daily: "Daily",
    applyFilters: "Apply Filters",
    resetFilters: "Reset Filters",
    selectAll: "Select All",
    departmentsSelected: "Departments Selected",
    done: "Done",
    not_done: "Not Done",
    inProgress: "In Progress",
    pending: "Pending",
    review: "Review",
    allPriorities: "All Priorities",
    allEmployees: "All Employees",
    allDeadLines: "All DeadLines",
    high: "High",
    normal: "Normal",
    low: "Low",
    urgent: "Urgent",
    overDue: "Overdue",
    soon: "Soon within 2 days",
    noDueDate: "No Due Date",
    hasNewUpdate: "Has New Update",
    not_reported: "Not Reported",
    LatedTasks: "Lated Tasks",
    allProjects: "All Projects",
    project: "Project",
    isUrgent: "Is Urgent",
    priority: "Priority",
    employee: "Employee",
    searchPlaceholder: "Search tasks by Task Name, Employee ...",
    selectEmployee: "Select Employee",
    selectSupervisor: "Select Supervisor",
    selectAssignee: "Select Assignee",
    selectConsultant: "Select Consultant",
    selectInformer: "Select Informer",
    searchEmployees: "Search Employees",
    searchInformers: "Search Informers",
    searchConsultants: "Search Consultants",
    searchProjects: "Search Projects",
    searchPriorities: "Search Priorities",
    selectStartDate: "Select Start Date",
    selectEndDate: "Select End Date",
    selectPriority: "Select Priority",
    noResultsFound: "No results found",
    clickToAddPeople: "Click to add Employees",
    undo: "Undo",
    redo: "Redo",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    alignLeft: "Align Left",
    alignCenter: "Align Center",
    alignRight: "Align Right",
    bulletList: "Bullet List",
    numberedList: "Numbered List",
    link: "Insert Link",
    image: "Insert Image",
    moreOptions: "More Options",
  },
  ar: {
    addMember: "اضافة عضو",
    email: "البريد الالكتروني",
    emailExistsError:
      "هذا البريد الالكتروني مسجل بالفعل. يرجى استخدام بريد الكتروني اخر.",
    generalError: "حدث خطأ في التقديم. يرجى المحاولة مرة اخرى في وقت لاحق.",
    invalidCompanyIdOrUserId: "معرف الشركة أو معرف المستخدم غير صحيح.",
    oneTimeTaskDeleted: "تم حذف المهمة الواحدة بنجاح.",
    oneTimeTaskAdded: "تم إضافة المهمة الواحدة بنجاح.",
    deleteConfirmationTitle: "حذف المهمة الواحدة",
    deleteConfirmationText: "هل تريد حذف هذه المهمة الواحدة؟",
    delete: "حذف",
    addRoutineTask: "إضافة مهمة واحدة",
    taskName: "*اسم المهمة",
    description: "وصف المهمة",
    assignTo: "*تعيين",
    selectSupervisor: "اختر المشرف",
    supervisor: "المشرف",
    informer: "المعلوم",
    consultant: "الاستشارات",
    close: "اغلاق",
    create: "اضافة",
    editOneTimeTask: "تعديل المهمة الواحدة",
    update: "تحديث",
    oneTimeTasks: "المهام الواحدة",
    TaskNameRequired: "يرجى ادخال اسم المهمة.",
    TaskAddedError: "حدث خطأ في إضافة المهمة. يرجى المحاولة لاحقاً.",
    from: "من",
    to: "إلى",
    TaskManager: "مدير المهمة",
    assignManager: "تعيين المدير",
    enterDescription: "ادخال الوصف",

    enterTaskName: "ادخل اسم المهمة",
    createOneTimeTask: "إنشاء مهمة واحدة",
    saving: "يتم الحفظ...",
    noRoutineTasks: "لا توجد مهام واحدة.",
    createee: "أنشئ مهامك الواحدة",
    inactive: "غير نشط",
    active: "نشط",
    advancedSettings: "الإعدادات المتقدمة",
    taskNumber: "رقم المهمة",
    taskType: "نوع المهمة",
    selectTaskType: "اختر نوع المهمة",
    recurrentDays: "أيام التكرار",
    enterRecurrentDays: "ادخل عدد أيام التكرار",
    dayOfMonth: "يوم الشهر",
    enterDayOfMonth: "ادخل يوم الشهر مثل 1, 2,... 31",
    department: "القسم",
    selectDepartment: "اختر القسم",
    sunday: "الاحد",
    monday: "الاثنين",
    tuesday: "الثلاثاء",
    wednesday: "الاربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
    enterStartDate: "ادخل تاريخ البدء",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    allProjects: "جميع المشاريع",
    weekly: "اسبوعي",
    monthly: "شهري",
    daily: "يومي",
    applyFilters: "تطبيق التصفيات",
    resetFilters: "اعادة تعيين التصفيات",
    selectAll: "اختر الكل",
    departmentsSelected: "اقسام محددة",
    done: "تم",
    not_done: "لم يتم",
    inProgress: "قيد التنفيذ",
    pending: "قيد الانتظار",
    review: "قيد المراجعة",
    allPriorities: "جميع الأولويات",
    allEmployees: "جميع الموظفين",
    allDeadLines: "جميع المواعيد",
    high: "عالية",
    normal: "عادية",
    low: "منخفضة",
    urgent: "عاجلة",
    overDue: "متأخر",
    soon: "قريب خلال 2 يوم",
    noDueDate: "غير محدد",
    hasNewUpdate: "يوجد تحديث جديد",
    not_reported: "لم يتم التقرير",
    LatedTasks: "مهام متاخرة",
    project: "المشروع",
    isUrgent: "هامة جدا",
    priority: "الاولوية",
    employee: "الموظف",
    selectProject: "اختر المشروع",
    searchPlaceholder: "ابحث عن طريق اسم المهمة, الموظف ...",
    selectEmployee: "اختر الموظفين",
    selectConsultant: "اختر الاسشاري",
    selectInformer: "اختر المعلوم",
    selectDeadline: "اختر الموعد",
    selectTask: "اختر المهمة",
    selectPriority: "اختر الأولوية",
    undo: "تراجع",
    redo: "إعادة",
    bold: "عريض",
    italic: "مائل",
    underline: "تسطير",
    alignLeft: "محاذاة لليسار",
    alignCenter: "محاذاة للمنتصف",
    alignRight: "محاذاة لليمين",
    bulletList: "قائمة نقطية",
    numberedList: "قائمة مرقمة",
    link: "إدراج رابط",
    image: "إدراج صورة",
    moreOptions: "خيارات إضافية",
    selectStartDate: "اختر تاريخ البدء",
    selectEndDate: "اختر تاريخ الانتهاء",
    noResultsFound: "لا توجد نتائج",
    clickToAddPeople: "انقر لإضافة أشخاص",
  },
};

// const employees = computed(() => store.getters.dataFromApi);
// console.log(employees.value);

// // computed properties
// const formattEmployees = computed(() => {
//   return employees.value.map((employee) => ({
//     value: employee.id,
//     label: employee.name,
//   }));
// });
</script>

<template>
  <div class="py-1 container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header pb-0">
            <div class="container">
              <div class="row align-items-center">
                <!-- القسم الأيسر: العنوان والعدد -->
                <div class="col-12 col-md-4 d-flex align-items-center">
                  <p class="mb-0 font-weight-bold me-2">
                    {{ t("oneTimeTasks") }}
                  </p>
                  <small class="mb-0 font-weight-bold me-2">
                    ({{ oneTimeTasksCount }})
                  </small>

                  <!-- إذا لديك صلاحية لإنشاء المهمة -->
                  <argon-button
                    v-if="isOwner || permissions['create-task']"
                    @click="openPopup"
                  >
                    <i class="fas fa-plus"></i>
                  </argon-button>
                </div>

                <!-- شريط البحث -->
                <div class="col-12 col-md-4 my-2 my-md-0">
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      :placeholder="t('searchPlaceholder')"
                      v-model="searchQuery"
                    />
                  </div>
                </div>

                <!-- زر الفلتر -->
                <div
                  class="col-12 col-md-4"
                  :class="
                    currentLanguage === 'ar' ? 'text-md-start' : 'text-md-end'
                  "
                >
                  <button
                    class="btn btn-link"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#filterCollapse"
                    aria-expanded="false"
                    aria-controls="filterCollapse"
                  >
                    <i class="fas fa-filter"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- لوحة الفلترة -->
            <div class="collapse" id="filterCollapse">
              <div class="card card-body">
                <div class="row">
                  <!-- مثلاً فلتر الأقسام -->
                  <!-- <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("department") }}</label>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        id="departmentDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {{
                          selectedDepartments.length === 0
                            ? t("allDepartments")
                            : selectedDepartments.length === 1
                              ? selectedDepartments[0].name
                              : `${selectedDepartments.length} ${t("departmentsSelected")}`
                        }}
                      </button>
                      <ul
                        class="dropdown-menu w-100"
                        aria-labelledby="departmentDropdown"
                      >
                        <li class="px-2">
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              id="selectAllDepartments"
                              :checked="
                                selectedDepartments.length ===
                                userDepartment.length
                              "
                              @change="toggleAllDepartments"
                            />
                            <label
                              class="form-check-label"
                              for="selectAllDepartments"
                            >
                              {{ t("selectAll") }}
                            </label>
                          </div>
                        </li>
                        <li><hr class="dropdown-divider" /></li>
                        <li
                          v-for="dept in userDepartment"
                          :key="dept.value"
                          class="px-2"
                        >
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              :id="'department-' + dept.value"
                              :value="{ id: dept.value, name: dept.label }"
                              v-model="selectedDepartments"
                            />
                            <label
                              class="form-check-label"
                              :for="'department-' + dept.value"
                            >
                              {{ dept.label }}
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div> -->

                  <!-- فلتر المشروع -->
                  <div
                    v-if="formattedProjects.length !== 0"
                    class="col-md-4 mb-3"
                  >
                    <CheckboxMultiSelect
                      :label="t('project')"
                      :items="formattedProjects"
                      v-model="selectedProjects"
                      :placeholder="t('allProjects')"
                      :count-label="t('projectsSelected')"
                      :select-all-label="t('selectAll')"
                    />
                  </div>

                  <!-- فلتر الحالة -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("status") }}</label>
                    <select class="form-select" v-model="selectedStatus">
                      <option value="">{{ t("allStatuses") }}</option>
                      <option value="inProgress">{{ t("inProgress") }}</option>
                      <option value="review">{{ t("review") }}</option>
                      <option value="pending">{{ t("pending") }}</option>
                      <option value="hasNewUpdate">
                        {{ t("hasNewUpdate") }}
                      </option>
                      <!-- <option value="lated">{{ t("LatedTasks") }}</option> -->
                    </select>
                  </div>

                  <!-- فلتر الأولوية -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("priority") }}</label>
                    <select class="form-select" v-model="selectedPriority">
                      <option value="">{{ t("allPriorities") }}</option>
                      <option value="high">{{ t("high") }}</option>
                      <option value="normal">{{ t("normal") }}</option>
                      <option value="low">{{ t("low") }}</option>
                      <option value="urgent">{{ t("urgent") }}</option>
                    </select>
                  </div>

                  <!-- فلترة الموظف -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("employee") }}</label>
                    <argon-select
                      class="form-select"
                      v-model="selectedEmployee"
                      :options="employeeOptions"
                      :placeholder="t('selectEmployee')"
                      :searchable="true"
                      :searchPlaceholder="t('searchEmployee')"
                    />
                  </div>

                  <!-- فلترة الموعد النهائي -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("deadLine") }}</label>
                    <select class="form-select" v-model="selectedDeadLine">
                      <option value="">{{ t("allDeadLines") }}</option>
                      <option value="soon">{{ t("soon") }}</option>
                      <option value="overdue">{{ t("overDue") }}</option>
                      <option value="noDueDate">{{ t("noDueDate") }}</option>
                    </select>
                  </div>
                </div>

                <div class="d-flex justify-content-end">
                  <button class="btn btn-secondary" @click="resetFilters">
                    {{ t("resetFilters") }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card-body">
            <form @submit.prevent>
              <argon-alert
                v-if="showAlert"
                color="danger"
                dismissible
                class="mt-3"
              >
                {{ errorMessage }}
              </argon-alert>
              <argon-alert
                v-if="showSuccess"
                color="success"
                dismissible
                class="mt-3"
              >
                {{ successMessage }}
              </argon-alert>
            </form>

            <div
              v-if="isPageLoading"
              class="d-flex justify-content-center py-5"
            >
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div
              v-else-if="oneTimeTasks.length === 0"
              class="d-flex justify-content-center py-5 flex-column align-items-center"
            >
              <h5>{{ t("noRoutineTasks") }}</h5>
              <p>{{ t("createee") }}</p>
            </div>

            <one-time-task-table
              v-if="!isPageLoading"
              :oneTimeTasks="filteredTasks"
              :key="componentKey"
              :active-tab="activeTab"
              :active-query="activeQuery"
              @update:active-tab="activeTab = $event"
              @page-changed="handlePageChange"
              :pagination="pagination"
              @reload-tasks="refreshTasks"
              @filtered-count-changed="handleFilteredCount"
              @open-edit-popup="openEditPopupInParent"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- المودال لإنشاء مهمة واحدة -->
  <transition name="gmail-compose" appear>
    <div v-if="showPopup" class="gmail-compose-overlay">
      <div
        class="gmail-compose-container"
        :class="{ maximized: isMaximized, minimized: isMinimized }"
      >
        <div class="gmail-header">
          <div class="gmail-header-left">
            <span class="gmail-title">{{ t("createOneTimeTask") }}</span>
          </div>
          <div class="gmail-header-right">
            <button
              @click="toggleMinimize"
              class="gmail-btn gmail-minimize"
              :title="isMinimized ? 'Restore' : 'Minimize'"
            >
              <i
                :class="
                  isMinimized
                    ? 'fas fa-window-restore'
                    : 'fas fa-window-minimize'
                "
              ></i>
            </button>
            <button
              @click="toggleMaximize"
              class="gmail-btn gmail-maximize"
              :title="isMaximized ? 'Restore' : 'Maximize'"
            >
              <i :class="isMaximized ? 'fas fa-compress' : 'fas fa-expand'"></i>
            </button>
            <button
              @click="closePopup"
              class="gmail-btn gmail-close"
              title="Close"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div
          class="gmail-content"
          v-show="!isMinimized"
          @click="onContentClick"
        >
          <div class="modal-content-scroll">
            <!-- شريط الأشخاص المضغوط (مثل Gmail) -->
            <div class="gmail-compact-people-bar mb-2">
              <div class="gmail-compact-content" @click="expandPeopleSection">
                <!-- <span class="gmail-compact-label">{{ t('people') }}</span> -->
                <div class="gmail-compact-tags">
                  <!-- إذا كان هناك أشخاص مختارين، اعرضهم -->
                  <template v-if="hasSelectedPeople">
                    <!-- Assign To -->
                    <span
                      v-if="selectedAssignee.length > 0"
                      class="gmail-compact-tag assignee"
                    >
                      <i class="fas fa-user"></i>
                      :
                    </span>
                    <span
                      v-for="assigneeId in selectedAssignee"
                      :key="assigneeId"
                      class="gmail-compact-person-name"
                    >
                      {{ getEmployeeName(assigneeId)
                      }}<i
                        class="fas fa-times mx-1"
                        @click.stop="removeAssignee(assigneeId)"
                      ></i>
                    </span>
                    <!-- Supervisor -->
                    <span
                      v-if="selectedSupervisor"
                      class="gmail-compact-tag supervisor"
                    >
                      <i class="fas fa-user-tie"></i>
                      :
                    </span>
                    <span
                      v-if="selectedSupervisor"
                      class="gmail-compact-person-name"
                    >
                      {{ getEmployeeName(selectedSupervisor)
                      }}<i
                        class="fas fa-times mx-1"
                        @click.stop="removeSupervisor()"
                      ></i>
                    </span>

                    <!-- Informer -->
                    <span
                      v-if="selectedInformer.length > 0"
                      class="gmail-compact-tag informer"
                    >
                      <i class="fas fa-bell"></i>
                      :
                    </span>
                    <span
                      v-for="informerId in selectedInformer"
                      :key="informerId"
                      class="gmail-compact-person-name"
                    >
                      {{ getEmployeeName(informerId)
                      }}<i
                        class="fas fa-times mx-1"
                        @click.stop="removeInformer(informerId)"
                      ></i>
                    </span>

                    <!-- Consultant -->
                    <span
                      v-if="selectedConsultant.length > 0"
                      class="gmail-compact-tag consultant"
                    >
                      <i class="fas fa-user-graduate"></i>
                      :
                    </span>
                    <span
                      v-for="consultantId in selectedConsultant"
                      :key="consultantId"
                      class="gmail-compact-person-name"
                    >
                      {{ getEmployeeName(consultantId)
                      }}<i
                        class="fas fa-times mx-1"
                        @click.stop="removeConsultant(consultantId)"
                      ></i>
                    </span>
                  </template>

                  <!-- إذا لم يكن هناك أشخاص مختارين، اعرض رسالة -->
                  <template v-else>
                    <span class="gmail-compact-placeholder">
                      <i class="fas fa-users"></i>
                      {{ t("clickToAddPeople") }}
                    </span>
                  </template>
                </div>
                <span class="gmail-compact-hint">{{ t("clickToEdit") }}</span>
              </div>
            </div>

            <!-- حقول إضافة الأشخاص (Gmail Style) -->
            <div
              v-show="showCompactPeople"
              class="gmail-people-section mb-2"
              @click.stop
            >
              <!-- Assignee -->
              <div class="gmail-people-row">
                <div class="gmail-row-content w-100">
                  <div class="w-100">
                    <ArgonTagsInput
                      v-model="selectedAssignee"
                      :options="employeeOptions"
                      :placeholder="t('selectAssignee')"
                      class="gmail-people-input"
                    />
                  </div>
                  <div class="gmail-shortcuts">
                    <a
                      href="#"
                      @click.prevent="showCcFields = !showCcFields"
                      class="gmail-shortcut-link"
                    >
                      {{ showCcFields ? "-" : "" }}SV
                    </a>
                    <a
                      href="#"
                      @click.prevent="showBccFields = !showBccFields"
                      class="gmail-shortcut-link"
                    >
                      {{ showBccFields ? "-" : "" }}IN/CN
                    </a>
                  </div>
                </div>
              </div>

              <!-- Supervisor -->
              <div v-show="showCcFields" class="gmail-people-row">
                <div class="gmail-row-content w-100">
                  <ArgonSelect
                    v-model="selectedSupervisor"
                    :options="employeeOptions"
                    :placeholder="t('selectSupervisor')"
                    class="gmail-people-input w-100"
                    :searchable="true"
                    :search-placeholder="t('searchEmployees')"
                  />
                </div>
              </div>

              <!-- Informer -->
              <div v-show="showBccFields" class="gmail-people-row">
                <div class="gmail-row-content w-100">
                  <ArgonTagsInput
                    v-model="selectedInformer"
                    :options="employeeOptions"
                    :placeholder="t('selectInformer')"
                    class="gmail-people-input w-100"
                  />
                </div>
              </div>

              <!-- Consultant -->
              <div v-show="showBccFields" class="gmail-people-row">
                <div class="gmail-row-content w-100">
                  <ArgonTagsInput
                    v-model="selectedConsultant"
                    :options="employeeOptions"
                    :placeholder="t('selectConsultant')"
                    class="gmail-people-input w-100"
                  />
                </div>
              </div>
            </div>

            <!-- حقل اسم المهمة -->
            <div class="gmail-field mb-3">
              <ArgonInput
                v-model="oneTimeTaskName"
                class="gmail-input gmail-title-input"
                :placeholder="t('enterTaskName')"
                dir="auto"
                required
                @focus="onFieldFocus"
              />
            </div>

            <!-- حقل الوصف -->
            <div class="gmail-field mb-3">
              <ArgonTextarea
                v-model="oneTimeTaskDescription"
                class=""
                :placeholder="t('enterDescription')"
                dir="auto"
                required
                @focus="onFieldFocus"
              />
            </div>

            <!-- شريط الأدوات مع الأيقونات -->
            <div class="gmail-toolbar mb-3">
              <!-- Project Icon -->
              <div class="gmail-toolbar-icon-group">
                <div
                  class="gmail-toolbar-icon"
                  :class="{ 'has-value': projectId }"
                  :title="getProjectTooltip()"
                  @click="toggleProjectDropdown"
                >
                  <i class="fas fa-project-diagram"></i>
                  <span
                    v-if="projectId"
                    class="gmail-icon-indicator"
                    @click.stop="clearProject"
                    @mouseenter="showClearIcon = 'project'"
                    @mouseleave="showClearIcon = null"
                  >
                    <span v-if="showClearIcon === 'project'" class="clear-icon"
                      >✕</span
                    >
                    <span v-else>✓</span>
                  </span>
                </div>
                <span class="gmail-icon-label">{{ t("project") }}</span>

                <!-- Project Dropdown -->
                <div
                  v-show="showProjectDropdown"
                  class="toolbar-dropdown"
                  @click.stop
                >
                  <!-- <div class="toolbar-dropdown-header">
                    <span class="toolbar-dropdown-title">{{ t("selectProject") }}</span>
                    <button @click="closeProjectDropdown" class="toolbar-dropdown-close">
                      <i class="fas fa-times"></i>
                    </button>
                  </div> -->
                  <div class="toolbar-dropdown-content">
                    <div class="toolbar-search-container mb-3">
                      <input
                        v-model="projectSearchQuery"
                        type="text"
                        class="toolbar-search-input"
                        :placeholder="t('searchProjects')"
                        @input="filterProjects"
                      />
                    </div>
                    <div class="toolbar-options-container">
                      <div
                        v-for="project in filteredProjects"
                        :key="project.value"
                        class="toolbar-option-item"
                        :class="{ selected: projectId === project.value }"
                        @click="selectProject(project)"
                      >
                        <span class="toolbar-option-text">{{
                          project.label
                        }}</span>
                        <i
                          v-if="projectId === project.value"
                          class="fas fa-check toolbar-option-check"
                        ></i>
                      </div>
                      <div
                        v-if="filteredProjects.length === 0"
                        class="toolbar-no-results"
                      >
                        {{ t("noResultsFound") }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Priority Icon -->
              <div class="gmail-toolbar-icon-group">
                <div
                  class="gmail-toolbar-icon"
                  :class="{ 'has-value': priority }"
                  :title="getPriorityTooltip()"
                  @click="togglePriorityDropdown"
                >
                  <i class="fas fa-flag"></i>
                  <span
                    v-if="priority"
                    class="gmail-icon-indicator"
                    @click.stop="clearPriority"
                    @mouseenter="showClearIcon = 'priority'"
                    @mouseleave="showClearIcon = null"
                  >
                    <span v-if="showClearIcon === 'priority'" class="clear-icon"
                      >✕</span
                    >
                    <span v-else>✓</span>
                  </span>
                </div>
                <span class="gmail-icon-label">{{ t("priority") }}</span>

                <!-- Priority Dropdown -->
                <div
                  v-show="showPriorityDropdown"
                  class="toolbar-dropdown"
                  @click.stop
                >
                  <!-- <div class="toolbar-dropdown-header">
                    <span class="toolbar-dropdown-title">{{ t("selectPriority") }}</span>
                    <button @click="closePriorityDropdown" class="toolbar-dropdown-close">
                      <i class="fas fa-times"></i>
                    </button>
                  </div> -->
                  <div class="toolbar-dropdown-content">
                    <div class="toolbar-search-container mb-3">
                      <input
                        v-model="prioritySearchQuery"
                        type="text"
                        class="toolbar-search-input"
                        :placeholder="t('searchPriorities')"
                        @input="filterPriorities"
                      />
                    </div>
                    <div class="toolbar-options-container">
                      <div
                        v-for="priorityOption in filteredPriorities"
                        :key="priorityOption.value"
                        class="toolbar-option-item"
                        :class="{ selected: priority === priorityOption.value }"
                        @click="selectPriority(priorityOption)"
                      >
                        <span class="toolbar-option-text">{{
                          priorityOption.label
                        }}</span>
                        <i
                          v-if="priority === priorityOption.value"
                          class="fas fa-check toolbar-option-check"
                        ></i>
                      </div>
                      <div
                        v-if="filteredPriorities.length === 0"
                        class="toolbar-no-results"
                      >
                        {{ t("noResultsFound") }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Start Date Icon -->
              <div class="gmail-toolbar-icon-group">
                <div
                  class="gmail-toolbar-icon"
                  :class="{ 'has-value': startDate }"
                  :title="getStartDateTooltip()"
                  @click="toggleStartDatePicker"
                >
                  <i class="fas fa-calendar-plus"></i>
                  <span
                    v-if="startDate"
                    class="gmail-icon-indicator"
                    @click.stop="clearStartDate"
                    @mouseenter="showClearIcon = 'startDate'"
                    @mouseleave="showClearIcon = null"
                  >
                    <span
                      v-if="showClearIcon === 'startDate'"
                      class="clear-icon"
                      >✕</span
                    >
                    <span v-else>✓</span>
                  </span>
                </div>
                <span class="gmail-icon-label">{{ t("startDate") }}*</span>

                <!-- Start Date Picker -->
                <div
                  v-show="showStartDatePicker"
                  class="toolbar-dropdown"
                  @click.stop
                >
                  <!-- <div class="toolbar-dropdown-header">
                    <span class="toolbar-dropdown-title">{{ t("selectStartDate") }}</span>
                    <button @click="closeStartDatePicker" class="toolbar-dropdown-close">
                      <i class="fas fa-times"></i>
                    </button>
                  </div> -->
                  <div class="toolbar-dropdown-content">
                    <ArgonInput
                      type="date"
                      v-model="startDate"
                      :placeholder="t('enterStartDate')"
                      required
                    />
                  </div>
                </div>
              </div>

              <!-- End Date Icon -->
              <div class="gmail-toolbar-icon-group">
                <div
                  class="gmail-toolbar-icon"
                  :class="{ 'has-value': endDate }"
                  :title="getEndDateTooltip()"
                  @click="toggleEndDatePicker"
                >
                  <i class="fas fa-calendar-check"></i>
                  <span
                    v-if="endDate"
                    class="gmail-icon-indicator"
                    @click.stop="clearEndDate"
                    @mouseenter="showClearIcon = 'endDate'"
                    @mouseleave="showClearIcon = null"
                  >
                    <span v-if="showClearIcon === 'endDate'" class="clear-icon"
                      >✕</span
                    >
                    <span v-else>✓</span>
                  </span>
                </div>
                <span class="gmail-icon-label">{{ t("endDate") }}</span>

                <!-- End Date Picker -->
                <div
                  v-show="showEndDatePicker"
                  class="toolbar-dropdown"
                  @click.stop
                >
                  <!-- <div class="toolbar-dropdown-header">
                    <span class="toolbar-dropdown-title">{{ t("selectEndDate") }}</span>
                    <button @click="closeEndDatePicker" class="toolbar-dropdown-close">
                      <i class="fas fa-times"></i>
                    </button>
                  </div> -->
                  <div class="toolbar-dropdown-content">
                    <ArgonInput
                      type="date"
                      v-model="endDate"
                      :placeholder="t('enterEndDate')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="gmail-footer" v-show="!isMinimized">
          <!-- زر الإغلاق -->
          <argon-button variant="secondary" @click="closePopup" class="me-2">
            {{ t("close") }}
          </argon-button>
          <!-- زر الحفظ -->
          <argon-button
            variant="success"
            @click="createOneTimeTask"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isSubmitting ? t("saving") : t("create") }}
          </argon-button>
        </div>
      </div>
    </div>
  </transition>

  <!-- مودال تعديل OneTimeTask -->
  <!-- داخل مكوّن RoutineTask.vue (المكوّن الأب) -->
  <!-- مودال تعديل OneTimeTask -->
  <transition name="modal-fade">
    <div v-if="showEditPopup" class="popup-overlay">
      <ArgonModal
        v-if="showEditPopup"
        :title="t('editOneTimeTask')"
        @close="closeEditPopup"
        class="one-time-task-modal"
      >
        <template #default>
          <div class="modal-content-scroll">
            <!-- نستخدم row + col لتوزيع الحقول -->
            <div class="row">
              <!-- اسم المهمة بعرض كامل -->
              <div class="col-12 mb-3">
                <label class="form-label">{{ t("taskName") }}:</label>
                <input
                  v-model="oneTimeTaskName"
                  class="form-control"
                  :placeholder="t('enterTaskName')"
                  required
                  @focus="onFieldFocus"
                />
              </div>

              <!-- الوصف بعرض كامل -->
              <div class="col-12 mb-3">
                <label class="form-label">{{ t("description") }}:</label>
                <textarea
                  v-model="oneTimeTaskDescription"
                  class="form-control"
                  :placeholder="t('enterDescription')"
                  required
                  @focus="onFieldFocus"
                ></textarea>
              </div>

              <!-- assignTo في نصف عرض -->
              <!-- <div class="col-md-6 mb-3">
                <label class="form-label">{{ t("assignTo") }}:</label>
                <argon-select
                  v-model="selectedEmployee"
                  :options="employeeOptions"
                  :placeholder="t('selectEmployee')"
                  class="form-control"
                  searchable
                  searchPlaceholder="Search employees..."
                  required
                />
              </div> -->

              <label class="form-label">{{ t("assignTo") }}:</label>
              <argon-multiple-select
                v-model="selectedAssignee"
                :model-names="selectedAssigneeNames"
                :options="employeeOptions"
                :placeholder="t('selectEmployee')"
                :searchable="true"
                :searchPlaceholder="t('searchEmployees')"
                class="form-control mb-3"
              />

              <!-- supervisor في نصف عرض -->
              <div class="mb-3">
                <label class="form-label">{{ t("supervisor") }}:</label>
                <argon-select
                  v-model="selectedSupervisor"
                  :options="employeeOptions"
                  :placeholder="t('selectSupervisor')"
                  class="form-control"
                  searchable
                  searchPlaceholder="Search supervisors..."
                  required
                />
              </div>

              <!-- informer في نصف عرض -->
              <!-- <div class="col-md-6 mb-3">
                <label class="form-label">{{ t("informer") }}:</label>
                <argon-select
                  v-model="selectedInformer"
                  :options="employeeOptions"
                  :placeholder="t('selectInformer')"
                  class="form-control"
                  searchable
                  searchPlaceholder="Search informers..."
                  required
                />
              </div> -->

              <label class="form-label">{{ t("informer") }}:</label>
              <argon-multiple-select
                v-model="selectedInformer"
                :model-names="selectedInformerNames"
                :options="employeeOptions"
                :placeholder="t('selectEmployee')"
                :searchable="true"
                :searchPlaceholder="t('searchInformers')"
                class="form-control mb-3"
              />

              <!-- consultant في نصف عرض -->
              <!-- <div class="col-md-6 mb-3">
                <label class="form-label">{{ t("consultant") }}:</label>
                <argon-select
                  v-model="selectedConsultant"
                  :options="employeeOptions"
                  :placeholder="t('selectConsultant')"
                  class="form-control"
                  searchable
                  searchPlaceholder="Search consultants..."
                  required
                />
              </div> -->

              <label class="form-label">{{ t("consultant") }}:</label>
              <argon-multiple-select
                v-model="selectedConsultant"
                :model-names="selectedConsultantNames"
                :options="employeeOptions"
                :placeholder="t('selectEmployee')"
                :searchable="true"
                :searchPlaceholder="t('searchConsultants')"
                class="form-control mb-3"
              />

              <!-- المشروع (project_id) في نصف عرض -->
              <!-- في القالب -->
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t("project") }}:</label>
                <argon-select
                  v-model="projectId"
                  :options="formattedProjects"
                  :placeholder="t('selectProject')"
                  class="form-control"
                  searchable
                  searchPlaceholder="Search projects..."
                  required
                />
              </div>

              <!-- الأولوية (priority) في نصف عرض -->
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t("priority") }}:</label>
                <argon-select
                  v-model="priority"
                  :options="prioritiesOptions"
                  :placeholder="t('selectPriority')"
                  class="form-control"
                  searchable
                  searchPlaceholder="Search priorities..."
                  required
                />
              </div>

              <!-- تاريخ البداية في نصف عرض -->
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t("startDate") }}:</label>
                <input
                  type="date"
                  v-model="startDate"
                  class="form-control"
                  :placeholder="t('enterStartDate')"
                  required
                />
              </div>

              <!-- تاريخ النهاية في نصف عرض -->
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t("endDate") }}:</label>
                <input
                  type="date"
                  v-model="endDate"
                  class="form-control"
                  :placeholder="t('enterEndDate')"
                  required
                />
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <ArgonButton variant="secondary" @click="closeEditPopup">
            {{ t("close") }}
          </ArgonButton>
          <ArgonButton
            variant="success"
            @click="updateOneTimeTask"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isSubmitting ? t("saving") : t("update") }}
          </ArgonButton>
        </template>
      </ArgonModal>
    </div>
  </transition>
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

/* إصلاح مشكلة ارتفاع collapse الزائد */
#filterCollapse {
  transition: height 0.35s ease !important;
}

#filterCollapse .card-body {
  overflow: visible;
  position: relative;
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
.one-time-task-modal {
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  scrollbar-width: none;
  scrollbar-color: transparent transparent;
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

/* إصلاح عرض المودال لتجنب التمرير الأفقي\ */

/* إخفاء التمرير الأفقي في المحتوى الداخلي */
.modal-content-scroll::-webkit-scrollbar {
  width: 8px;
  /* عرض شريط التمرير الرأسي */
  height: 0px;
  /* تعطيل شريط التمرير الأفقي */
}

/* حل مشكلة العرض الزائد */
.modal-content-scroll > .row {
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

.one-time-task-modal .modal-content-scroll {
  overflow-y: auto;
  flex: 1;
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

.one-time-task-modal .modal-header,
.one-time-task-modal .modal-footer {
  flex-shrink: 0;
}

.one-time-task-modal .modal-body {
  flex: 1;
}

.swal2-container {
  z-index: 100000 !important;
}

.swal-above-modal {
  z-index: 100001 !important;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.btn-link {
  transition: transform 0.2s;
}

.btn-link:hover {
  transform: rotate(90deg);
}

/* ====== Gmail Compose Style ====== */
.gmail-compose-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
}

.gmail-compose-container {
  position: fixed;
  bottom: 0;
  right: 20px;
  width: 500px;
  background: white;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  pointer-events: all;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid #dadce0;
  overflow: hidden;
}

.gmail-compose-container.maximized {
  left: 20px;
  right: 20px;
  bottom: 20px;
  width: auto;
  border-radius: 8px;
}

.gmail-compose-container.minimized {
  height: 40px;
  width: 300px;
}

.gmail-header {
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  user-select: none;
}

.gmail-header-left {
  flex: 1;
}

.gmail-title {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}

.gmail-header-right {
  display: flex;
  gap: 4px;
}

.gmail-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;
  font-size: 12px;
  transition: background-color 0.2s;
}

.gmail-btn:hover {
  background-color: #f1f3f4;
}

.gmail-btn.gmail-close:hover {
  background-color: #ea4335;
  color: white;
}

.gmail-content {
  /* max-height: 500px; */
  overflow-y: auto;
  padding: 16px;
}

.gmail-compose-container.maximized .gmail-content {
  max-height: calc(100vh - 140px);
}

.gmail-footer {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ====== Gmail Compose Animations ====== */
.gmail-compose-enter-active,
.gmail-compose-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.gmail-compose-enter-from {
  opacity: 0;
  transform: translateY(100%) scale(0.8);
}

.gmail-compose-leave-to {
  opacity: 0;
  transform: translateY(100%) scale(0.8);
}

/* ====== Gmail Toolbar Styles ====== */
.gmail-toolbar {
  /* background: #f8f9fa; */
  /* border: 1px solid #e9ecef; */
  border-radius: 6px;
  /* padding: 12px 16px; */
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.gmail-toolbar-icon-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
}

.gmail-toolbar-icon-group:hover {
  transform: translateY(-2px);
}

.gmail-toolbar-icon {
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid #ced4da;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
}

.gmail-toolbar-icon:hover {
  border-color: #a6c956;
  box-shadow: 0 4px 12px rgba(166, 201, 86, 0.3);
}

.gmail-toolbar-icon.has-value {
  border-color: #a6c956;
  background: #f0f8e8;
}

.gmail-toolbar-icon i {
  font-size: 16px;
  color: #495057;
}

.gmail-toolbar-icon.has-value i {
  color: #a6c956;
}

.gmail-icon-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #a6c956;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gmail-icon-indicator:hover {
  background: #dc3545;
  transform: scale(1.1);
}

.clear-icon {
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.gmail-icon-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

/* Modal Dropdown Styles */
.modal-dropdown {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  margin-top: 12px;
  overflow: hidden;
  animation: modalDropdownSlideIn 0.2s ease;
  position: relative;
  z-index: 1;
}

@keyframes modalDropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }

  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 400px;
  }
}

.modal-dropdown-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-dropdown-title {
  color: #495057;
  font-weight: 600;
  font-size: 0.9rem;
}

.modal-dropdown-close {
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dropdown-close:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-dropdown-content {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.modal-search-container {
  position: relative;
}

.modal-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.modal-search-input:focus {
  outline: none;
  border-color: #a6c956;
  box-shadow: 0 0 0 0.2rem rgba(166, 201, 86, 0.25);
}

.modal-options-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
}

.modal-option-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.modal-option-item:last-child {
  border-bottom: none;
}

.modal-option-item:hover {
  background-color: #f8f9fa;
}

.modal-option-item.selected {
  background-color: #e8f5e8;
  border-left: 3px solid #a6c956;
}

.modal-option-text {
  color: #495057;
  font-size: 0.9rem;
}

.modal-option-check {
  color: #a6c956;
  font-size: 0.8rem;
}

.modal-no-results {
  padding: 20px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

/* Toolbar Dropdown Styles */
.toolbar-dropdown {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  width: 250px;
  max-height: 300px;
  overflow: hidden;
  animation: toolbarDropdownSlideUp 0.2s ease;
  z-index: 99999;
  margin-bottom: 8px;
}

/* للأيقونات في النهاية - يفتح من اليمين */
.gmail-toolbar-icon-group:nth-last-child(-n + 2) .toolbar-dropdown {
  left: auto;
  right: auto;
  transform: none;
}

/* للأيقونات في البداية - يفتح من اليسار */
.gmail-toolbar-icon-group:nth-child(-n + 2) .toolbar-dropdown {
  left: 0;
  right: auto;
  transform: none;
}

@keyframes toolbarDropdownSlideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation للأيقونات المتوسطة */
.gmail-toolbar-icon-group:nth-child(n + 3):nth-last-child(n + 3)
  .toolbar-dropdown {
  animation: toolbarDropdownSlideUpCenter 0.2s ease;
}

@keyframes toolbarDropdownSlideUpCenter {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toolbar-dropdown-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-dropdown-title {
  color: #495057;
  font-weight: 600;
  font-size: 0.9rem;
}

.toolbar-dropdown-close {
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-dropdown-close:hover {
  background: #e9ecef;
  color: #495057;
}

.toolbar-dropdown-content {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.toolbar-search-container {
  position: relative;
}

.toolbar-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.toolbar-search-input:focus {
  outline: none;
  border-color: #a6c956;
  box-shadow: 0 0 0 0.2rem rgba(166, 201, 86, 0.25);
}

.toolbar-options-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
}

.toolbar-option-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.toolbar-option-item:last-child {
  border-bottom: none;
}

.toolbar-option-item:hover {
  background-color: #f8f9fa;
}

.toolbar-option-item.selected {
  background-color: #e8f5e8;
  border-left: 3px solid #a6c956;
}

.toolbar-option-text {
  color: #495057;
  font-size: 0.9rem;
}

.toolbar-option-check {
  color: #a6c956;
  font-size: 0.8rem;
}

.toolbar-no-results {
  padding: 20px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

.gmail-inline-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gmail-inline-title {
  color: #495057;
  font-weight: 600;
  font-size: 0.9rem;
}

.gmail-inline-close {
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gmail-inline-close:hover {
  background: #e9ecef;
  color: #495057;
}

.gmail-inline-content {
  padding: 16px;
}

/* Search and Options Styles */
.gmail-search-container {
  position: relative;
}

.gmail-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.gmail-search-input:focus {
  outline: none;
  border-color: #a6c956;
  box-shadow: 0 0 0 0.2rem rgba(166, 201, 86, 0.25);
}

.gmail-options-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
}

.gmail-option-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.gmail-option-item:last-child {
  border-bottom: none;
}

.gmail-option-item:hover {
  background-color: #f8f9fa;
}

.gmail-option-item.selected {
  background-color: #e8f5e8;
  border-left: 3px solid #a6c956;
}

.gmail-option-text {
  color: #495057;
  font-size: 0.9rem;
}

.gmail-option-check {
  color: #a6c956;
  font-size: 0.8rem;
}

.gmail-no-results {
  padding: 20px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

/* Custom Scrollbar */
.gmail-options-container::-webkit-scrollbar {
  width: 6px;
}

.gmail-options-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.gmail-options-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.gmail-options-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.gmail-toolbar-label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  display: block;
  white-space: nowrap;
}

.gmail-toolbar-select,
.gmail-toolbar-input {
  min-width: 140px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.2s ease;
  font-size: 0.9rem;
}

.gmail-toolbar-select:focus,
.gmail-toolbar-input:focus {
  border-color: #a6c956;
  box-shadow: 0 0 0 0.2rem rgba(166, 201, 86, 0.25);
}

.gmail-field-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
  display: block;
}

.gmail-input,
.gmail-textarea,
.gmail-select {
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.2s ease;
}

.gmail-input:focus,
.gmail-textarea:focus,
.gmail-select:focus {
  border-color: #a6c956;
  box-shadow: 0 0 0 0.2rem rgba(166, 201, 86, 0.25);
}

.gmail-title-input {
  font-size: 1.1rem;
  font-weight: 500;
}

.gmail-textarea {
  min-height: 100px;
  resize: vertical;
}

/* .gmail-people-section {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0;
  background: white;
}*/

.gmail-people-row {
  display: flex;
  align-items: flex-start;
  padding: 6px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.gmail-people-row:last-child {
  border-bottom: none;
}

.gmail-row-content {
  flex: 1;
  /* display: flex; */
  align-items: center;
}

.gmail-row-content > .w-100 {
  flex: 1;
  min-width: 0;
}

.gmail-shortcuts {
  display: flex;
  gap: 8px;
  margin-left: 8px;
  padding-top: 8px;
  flex-shrink: 0;
}

.gmail-shortcut-link {
  color: #1a73e8;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  transition: color 0.2s;
  white-space: nowrap;
}

.gmail-shortcut-link:hover {
  color: #174ea6;
  text-decoration: underline;
}

.gmail-people-field {
  /* display: flex; */
  align-items: center;
  margin-bottom: 8px;
}

.gmail-people-field:last-child {
  margin-bottom: 0;
}

.gmail-people-field .gmail-field-label {
  min-width: 60px;
  margin-bottom: 0;
  margin-right: 8px;
  font-size: 0.9rem;
  color: #6c757d;
}

.gmail-people-input-container {
  flex: 1;
}

.gmail-people-input {
  width: 100%;
}

.gmail-people-side-options {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.gmail-cc-toggle,
.gmail-bcc-toggle {
  background: transparent;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 0.85rem;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.gmail-cc-toggle:hover,
.gmail-bcc-toggle:hover {
  background: #f8f9fa;
  border-color: #a6c956;
  color: #495057;
}

.gmail-cc-toggle.active,
.gmail-bcc-toggle.active {
  background: #a6c956;
  border-color: #a6c956;
  color: white;
}

.gmail-cc-field,
.gmail-bcc-field {
  margin-top: 8px;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  border-left: 3px solid #a6c956;
}

.gmail-people-field {
  position: relative;
}

.gmail-toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.gmail-toolbar-divider {
  width: 1px;
  height: 20px;
  background: #dee2e6;
  margin: 0 4px;
}

.gmail-toolbar-btn {
  min-width: 32px;
  height: 32px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.gmail-toolbar-btn:hover {
  background-color: #e9ecef !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gmail-toolbar-btn i {
  font-size: 14px;
  color: #495057;
}

.gmail-toolbar-btn:hover i {
  color: #212529;
}

/* ====== Responsive Gmail Modal ====== */
@media (max-width: 768px) {
  .gmail-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .gmail-toolbar-group {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .gmail-toolbar-divider {
    display: none;
  }

  .gmail-toolbar-select,
  .gmail-toolbar-input {
    min-width: 100%;
  }

  .gmail-people-side-options {
    margin-left: 0;
    margin-top: 8px;
    justify-content: flex-start;
  }

  .gmail-people-field {
    flex-direction: column;
    align-items: stretch;
  }

  .gmail-toolbar {
    gap: 16px;
    justify-content: center;
  }

  .gmail-toolbar-icon-group {
    min-width: 60px;
  }

  .gmail-dropdown {
    min-width: 280px;
    margin: 20px;
  }

  .gmail-inline-dropdown {
    margin: 8px 0;
  }

  .gmail-inline-header {
    padding: 10px 12px;
  }

  .gmail-inline-content {
    padding: 12px;
  }

  .gmail-compose-container {
    right: 10px;
    left: 10px;
    width: auto;
    bottom: 0;
  }

  .gmail-compose-container.maximized {
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
  }

  .gmail-compose-container.minimized {
    width: calc(100vw - 20px);
    right: 10px;
  }

  .gmail-content {
    padding: 12px;
    max-height: 400px;
  }
}

@media (max-width: 480px) {
  .gmail-compose-container {
    right: 5px;
    left: 5px;
  }

  .gmail-compose-container.maximized {
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
  }

  .gmail-content {
    padding: 8px;
    max-height: 350px;
  }

  .gmail-header {
    padding: 6px 12px;
  }

  .gmail-footer {
    padding: 8px 12px;
  }
}

/* ====== Gmail Compact People Bar ====== */
.gmail-compact-people-bar {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;
}

.gmail-compact-people-bar:hover {
  background: #e9ecef;
  border-color: #a6c956;
}

.gmail-compact-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gmail-compact-label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
  white-space: nowrap;
}

.gmail-compact-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.gmail-compact-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #a6c956;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.gmail-compact-tag.assignee {
  background: #007bff;
}

.gmail-compact-tag.supervisor {
  background: #28a745;
}

.gmail-compact-tag.informer {
  background: #ffc107;
  color: #212529;
}

.gmail-compact-tag.consultant {
  background: #6f42c1;
}

.gmail-compact-hint {
  color: #6c757d;
  font-size: 0.8rem;
  font-style: italic;
  margin-left: auto;
}

.gmail-compact-person-name {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #dee2e6;
}

.gmail-compact-placeholder {
  color: #6c757d;
  font-size: 0.9rem;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ====== Gmail People Selection Styles ====== */
.gmail-selected-people {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
}

.gmail-selected-people:hover {
  background: #e9ecef;
  border-color: #a6c956;
}

.gmail-field-label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
  white-space: nowrap;
  margin-top: 2px;
}

.gmail-people-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.gmail-person-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #a6c956;
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.gmail-person-tag:hover {
  background: #8fb94a;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gmail-person-tag i {
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.gmail-person-tag i:hover {
  opacity: 1;
  transform: scale(1.1);
}

.gmail-empty-field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
}

.gmail-empty-field:hover {
  border-color: #a6c956;
  background: #f8f9fa;
}

.gmail-placeholder {
  color: #6c757d;
  font-size: 0.9rem;
  font-style: italic;
}

.gmail-input-field {
  width: 100%;
}

.gmail-input-field .gmail-people-input {
  width: 100%;
}
</style>
