<!-- src/views/RoutineTask.vue -->

<script setup>
import {
  ref,
  computed,
  onBeforeMount,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useStore } from "vuex";
import ArgonModal from "@/components/ArgonModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonMultipleSelect from "@/components/ArgonMultipleSelect.vue";

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
    employeeOptions.value = dataFromApi.value.map((employee) => ({
      value: employee.id,
      label: employee.name,
      // department: employee.department[0].name,
    }));
  }
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

const employeeNames = ref([]);

const showPopup = ref(false);
const oneTimeTasks = ref([]);
const componentKey = ref(0);
const body = document.getElementsByTagName("body")[0];
const isLoading = ref(true);

const startDate = ref("");
const endDate = ref("");
const fromDate = ref("");
const toDate = ref("");
const searchQuery = ref("");

const showEditPopup = ref(false);
const editMode = ref(false);
const editedTaskId = ref(null);

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
  }
);

// إغلاق النافذة المنبثقة
const closePopup = () => {
  showPopup.value = false;
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
    isLoading.value = true;
    // Example of calling your Vuex action:
    const response = await store.dispatch("fetchOneTimeTasks");
    console.log("response:", response);
    if (response.status === 200) {
      oneTimeTasks.value = store.getters.oneTimeTasks;
      oneTimeTasks.value = store.getters.oneTimeTasks.map((task) => ({
        ...task,
        hasNewUpdate: task.comments_count > 0 && !isTaskCommentSeen(task.id),
      }));
      oneTimeTasks.value.sort((taskA, taskB) => {
        // 1) مقارنة is_urgent
        // if (taskA.is_urgent && !taskB.is_urgent) {
        //   return -1; // taskA قبل taskB
        // } else if (!taskA.is_urgent && taskB.is_urgent) {
        //   return 1; // taskB قبل taskA
        // }

        // 2) إذا تشابهت is_urgent في المهمتين، قارن الأولوية (priority)
        // لنعرّف ترتيبًا خاصًا للأولويات:
        const priorityOrder = { urgent: 1, high: 2, normal: 3, low: 4 };
        // في حال لم توجد أولوية، يمكن افتراض أنها normal أو قيمة بعيدة
        const aPriority = priorityOrder[taskA.priority] || 99;
        const bPriority = priorityOrder[taskB.priority] || 99;

        return aPriority - bPriority;
      });
    }

    console.log("oneTimeTasks:", oneTimeTasks.value);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  } finally {
    isLoading.value = false;
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
      oneTimeTasks.value = store.getters.oneTimeTasks.map((task) => ({
        ...task,
        hasNewUpdate: task.comments_count > 0 && !isTaskCommentSeen(task.id),
      }));
      oneTimeTasks.value.sort((taskA, taskB) => {
        // 1) مقارنة is_urgent
        // if (taskA.is_urgent && !taskB.is_urgent) {
        //   return -1; // taskA قبل taskB
        // } else if (!taskA.is_urgent && taskB.is_urgent) {
        //   return 1; // taskB قبل taskA
        // }

        // 2) إذا تشابهت is_urgent في المهمتين، قارن الأولوية (priority)
        // لنعرّف ترتيبًا خاصًا للأولويات:
        const priorityOrder = { urgent: 1, high: 2, normal: 3, low: 4 };
        // في حال لم توجد أولوية، يمكن افتراض أنها normal أو قيمة بعيدة
        const aPriority = priorityOrder[taskA.priority] || 99;
        const bPriority = priorityOrder[taskB.priority] || 99;

        return aPriority - bPriority;
      });
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const currentCompanyId = computed(() => store.getters.companyId);
console.log("currentCompanyId:", currentCompanyId.value);
const projects = computed(() => store.getters.projects);
console.log("projectsssssssssssss:", projects.value);

const currentUserId = computed(() => store.getters.userId);
console.log("currentUserId:", currentUserId.value);

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
  () => {}
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

// متغيرات الفلترة
const selectedTaskType = ref("");
const selectedDepartments = ref([]);
const selectedProjects = ref([]);
const selectedStatus = ref("");
const selectedPriority = ref("");
const selectedDeadLine = ref("");

console.log("userDepartment:", userDepartment.value);

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(
    currentLanguage.value,
    options
  );
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

  if (selectedPriority.value) {
    tasks = tasks.filter((t) => t.priority === selectedPriority.value);
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
      creatorId
    ];

    // التحقق مما إذا كان المُحدد موجودًا في أي من الحقول
    return allUserIds.includes(parseInt(selectedEmployee.value));
  });

  console.log("tasks after filtering by employee:", tasks);
}

  const today = formatDate(new Date());
  console.log(today);

  if (selectedDeadLine.value) {
    tasks = tasks.filter((t) => {
      if (selectedDeadLine.value === "overdue") {
        return formatDate(t.deadline) < today;
      } else if (selectedDeadLine.value === "noDueDate") {
        return !t.deadline;
      }
      return true;
    });
  }

  if (selectedDepartments.value.length > 0) {
    const departmentIds = selectedDepartments.value.map((d) => d.id);
    console.log(departmentIds);
    tasks = tasks.filter(
      (t) =>
        t.department.dept_id && departmentIds.includes(t.department.dept_id)
    );
  }

  // داخل computed property filteredTasks
  if (selectedProjects.value.length > 0) {
    const selectedProjectIds = selectedProjects.value.map(
      (project) => project.id
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
      newLength / pagination.value.per_page
    );

    if (pagination.value.current_page > pagination.value.last_page) {
      pagination.value.current_page = pagination.value.last_page || 1;
    }
  },
  { immediate: true }
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

const toggleAllProjects = () => {
  // استبعاد الخيار "No Project" (value: null)
  // const actualProjects = formattedProjects.value.filter(p => p.value !== null);

  if (selectedProjects.value.length === formattedProjects.value.length) {
    selectedProjects.value = [];
  } else {
    selectedProjects.value = formattedProjects.value.map((project) => ({
      id: project.value,
      name: project.label,
    }));
  }
};

const handlePageChange = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page;
  }
};

function searchMatch(task) {
  const query = searchQuery.value.toLowerCase();
  const taskName = (task.title || "").toLowerCase();

  // معالجة جميع الحقول ذات المصفوفات أو الأشياء الفردية
  const assignedNames = (task.assignedUser?.map(user => user.name) ?? []).join(' ');
  const informerNames = (task.informer?.map(user => user.name) ?? []).join(' ');
  const consultNames = (task.consult?.map(user => user.name) ?? []).join(' ');
  const supervisorName = task.supervisor?.name ?? '';
  const creatorName = task.creator?.name ?? '';

  // الجمع بين جميع الأسماء في سلسلة واحدة
  const employee = `${assignedNames} ${informerNames} ${consultNames} ${supervisorName} ${creatorName}`.toLowerCase();

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
    isLoading.value = true;
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
      isLoading.value = false;
    }
  } else {
    // إن لم يُدخل الاسم
    // console.log("Please enter the name.");
    isLoading.value = false;
  }
}

const selectedAssigneeNames = ref([]);
const selectedInformerNames = ref([]);
const selectedConsultantNames = ref([]);

function openEditPopupInParent(task) {
  // نُجهّز الحقول بقيم task
  editMode.value = true;
  showEditPopup.value = true;
  editedTaskId.value = task.id;

  console.log("task:", task.is_urgent);

  oneTimeTaskName.value = task.title || "";
  oneTimeTaskDescription.value = task.description || "";
  selectedAssignee.value = task.assignedUser?.map((user) => user.id) || null;
  selectedAssigneeNames.value = task.assignedUser?.map((user) => user.name) || null;
  selectedSupervisor.value = task.supervisor?.id || null;
  selectedInformer.value = task.informer?.map((user) => user.id) || null;
  selectedInformerNames.value = task.informer?.map((user) => user.name) || null;
  selectedConsultant.value = task.consult?.map((user) => user.id) || null;
  selectedConsultantNames.value = task.consult?.map((user) => user.name) || null;
  deptId.value = task.department?.id || "";
  projectId.value = task.project?.id;
  console.log(task.project?.id);
  // isUrgent.value = task.is_urgent || false;
  priority.value = task.priority || "";
  startDate.value = task.start_date || "";
  endDate.value = task.deadline || "";
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
    isLoading.value = true;

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
    isLoading.value = false;
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
    selectConsultant: "Select Consultant",
    selectInformer: "Select Informer",
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
                    <label class="form-label">{{ t("project") }}</label>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                        type="button"
                        id="projectDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {{
                          selectedProjects.length === 0
                            ? t("allProjects")
                            : selectedProjects.length === 1
                              ? selectedProjects[0].name
                              : `${selectedProjects.length} ${t("projectsSelected")}`
                        }}
                      </button>
                      <ul
                        class="dropdown-menu w-100"
                        aria-labelledby="projectDropdown"
                      >
                        <li class="px-2">
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              id="selectAllProjects"
                              :checked="
                                selectedProjects.length ===
                                formattedProjects.length
                              "
                              @change="toggleAllProjects"
                            />
                            <label
                              class="form-check-label"
                              for="selectAllProjects"
                            >
                              {{ t("selectAll") }}
                            </label>
                          </div>
                        </li>
                        <li><hr class="dropdown-divider" /></li>
                        <li
                          v-for="project in formattedProjects"
                          :key="project.value"
                          class="px-2"
                        >
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              :id="'project-' + project.value"
                              :value="{
                                id: project.value,
                                name: project.label,
                              }"
                              v-model="selectedProjects"
                            />
                            <label
                              class="form-check-label"
                              :for="'project-' + project.value"
                            >
                              {{ project.label }}
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
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
                    <select class="form-select" v-model="selectedEmployee">
                      <option value="">{{ t("allEmployees") }}</option>
                      <option
                        v-for="employeeOption in employeeOptions"
                        :key="employeeOption.value"
                        :value="employeeOption.value"
                      >
                        {{ employeeOption.label }}
                      </option>
                    </select>
                  </div>

                  <!-- فلترة الموعد النهائي -->
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ t("deadLine") }}</label>
                    <select class="form-select" v-model="selectedDeadLine">
                      <option value="">{{ t("allDeadLines") }}</option>
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

            <div v-if="isLoading" class="d-flex justify-content-center py-5">
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
            v-if="!isLoading"
            :oneTimeTasks="filteredTasks"
              :key="componentKey"
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
  <transition name="modal-fade">
    <div v-if="showPopup" class="popup-overlay">
      <ArgonModal
        v-if="showPopup"
        :title="t('createOneTimeTask')"
        @close="closePopup"
        class="one-time-task-modal"
      >
        <template #default>
          <div class="modal-content-scroll">
            <!-- بداية الـrow الشامل -->
            <div class="row">
              <!-- اسم المهمة (سطر كامل) -->
              <div class="col-12 mb-3">
                <label class="form-label">{{ t("taskName") }}:</label>
                <input
                  v-model="oneTimeTaskName"
                  class="form-control"
                  :placeholder="t('enterTaskName')"
                  dir="auto"
                  required
                />
              </div>

              <!-- الوصف (سطر كامل) -->
              <div class="col-12 mb-3">
                <label class="form-label">{{ t("description") }}:</label>
                <textarea
                  v-model="oneTimeTaskDescription"
                  class="form-control"
                  :placeholder="t('enterDescription')"
                  dir="auto"
                  required
                ></textarea>
              </div>

              <!-- حقل assignTo (نصف العرض) -->
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

              <div class="mb-3">
          <label class="form-label">{{ t("assignTo") }}:</label>
            <argon-multiple-select
              v-model="selectedAssignee"
              :model-names="employeeNames"
              :options="employeeOptions"
              :placeholder="t('selectEmployee')"
              class="form-control mb-3"
            />
          </div>

              <!-- حقل supervisor (نصف العرض) -->
              <div class="col-md-12 mb-3">
                <label class="form-label">{{ t("supervisor") }}:</label>
                <argon-select
                  v-model="selectedSupervisor"
                  :options="employeeOptions"
                  :placeholder="t('selectSupervisor')"
                  class="form-control"
                  searchable
                  searchPlaceholder="Search employees..."
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
                  searchPlaceholder="Search employees..."
                  required
                />
              </div> -->

              <div class="mb-3">
          <label class="form-label">{{ t("informer") }}:</label>
            <argon-multiple-select
              v-model="selectedInformer"
              :model-names="employeeNames"
              :options="employeeOptions"
              :placeholder="t('selectInformer')"
              class="form-control mb-3"
            />
          </div>

              <!-- consultant في نصف عرض -->
              <!-- <div class="col-md-6 mb-3">
                <label class="form-label">{{ t("consultant") }}:</label>
                <argon-select
                  v-model="selectedConsultant"
                  :options="employeeOptions"
                  :placeholder="t('selectConsultant')"
                  class="form-control"
                  searchable
                  searchPlaceholder="Search employees..."
                  required
                />
              </div> -->

              <div class="mb-3">
          <label class="form-label">{{ t("consultant") }}:</label>
            <argon-multiple-select
              v-model="selectedConsultant"
              :model-names="employeeNames"
              :options="employeeOptions"
              :placeholder="t('selectConsultant')"
              class="form-control mb-3"
            />
          </div>

              <!-- مشروع (نصف العرض) -->
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

              <!-- أولوية (نصف العرض) -->
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

              <!-- تاريخ البداية (نصف العرض) -->
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

              <!-- تاريخ النهاية (نصف العرض) -->
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ t("endDate") }}:</label>
                <input
                  type="date"
                  v-model="endDate"
                  class="form-control"
                  :placeholder="t('enterEndDate')"
                />
              </div>
            </div>
            <!-- نهاية الـrow -->

            <!-- أي حقول إضافية أو أقسام أخرى تضعها هنا -->
          </div>
        </template>

        <template #footer>
          <!-- زر الإغلاق -->
          <argon-button variant="secondary" @click="closePopup">
            {{ t("close") }}
          </argon-button>
          <!-- زر الحفظ -->
          <argon-button
            variant="success"
            @click="createOneTimeTask"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isLoading ? t("saving") : t("create") }}
          </argon-button>
        </template>
      </ArgonModal>
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
              class="form-control mb-3"
            />

              <!-- supervisor في نصف عرض -->
              <div class=" mb-3">
                <label class="form-label">{{ t("supervisor") }}:</label>
                <argon-select
                  v-model="selectedSupervisor"
                  :options="employeeOptions"
                  :placeholder="t('selectSupervisor')"
                  class="form-control"
                  searchable
                  searchPlaceholder="Search employees..."
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
                  searchPlaceholder="Search employees..."
                  required
                />
              </div> -->

              <label class="form-label">{{ t("informer") }}:</label>
            <argon-multiple-select
              v-model="selectedInformer"
              :model-names="selectedInformerNames"
              :options="employeeOptions"
              :placeholder="t('selectEmployee')"
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
                  searchPlaceholder="Search employees..."
                  required
                />
              </div> -->

              <label class="form-label">{{ t("consultant") }}:</label>
            <argon-multiple-select
              v-model="selectedConsultant"
              :model-names="selectedConsultantNames"
              :options="employeeOptions"
              :placeholder="t('selectEmployee')"
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
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isLoading ? t("saving") : t("update") }}
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
  overflow-y: auto; /* تفعيل التمرير الرأسي */
  overflow-x: hidden; /* إخفاء التمرير الأفقي */
  max-height: 65vh; /* الحد الأقصى لارتفاع المحتوى */
  scrollbar-width: thin; /* لـ Firefox */
  scrollbar-color: #888 #f1f1f1; /* لـ Firefox */
}

/* إصلاح عرض المودال لتجنب التمرير الأفقي\ */

/* إخفاء التمرير الأفقي في المحتوى الداخلي */
.modal-content-scroll::-webkit-scrollbar {
  width: 8px; /* عرض شريط التمرير الرأسي */
  height: 0px; /* تعطيل شريط التمرير الأفقي */
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
</style>
