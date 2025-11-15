// src/store/index.js
import { createStore } from "vuex";
import apiClient from "@/services/apiService"; // الاستيراد الصحيح
// import apiClient2 from "@/services/apiService"; // الاستيراد الصحيح
import {
  extractPermissionsFromAPI,
  savePermissionsToLocalStorage,
} from "@/utils/permissions.js";
import companyModule from "./modules/company.module.js";

// دوال التشفير وفك التشفير
export const encryptData = (data) => {
  return btoa(encodeURIComponent(JSON.stringify(data)));
};

export const decryptData = (encryptedData) => {
  if (!encryptedData) return null; // حماية إضافية
  try {
    return JSON.parse(decodeURIComponent(atob(encryptedData)));
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
};

export default createStore({
  state: {
    hideConfigButton: false,
    isPinned: false,
    showConfig: false,
    sidebarType: "bg-white",
    isRTL: localStorage.getItem("language") === "ar",
    mcolor: "",
    darkMode: false,
    isNavFixed: false,
    isAbsolute: false,
    showNavs: true,
    showSidenav: true,
    showNavbar: true,
    showFooter: true,
    showMain: true,
    layout: "default",
    language: localStorage.getItem("language") || "en",
    email: "",
    companyEmail: "",
    invitedEmail: "",
    companyId: null,
    companyName: "",
    tempEmail: null,
    user: null,
    permId: null,
    userId: null, // هنا سيتم حفظ الـ id
    dataFromApi: [],
    roles: [],
    updateRole: [],
    nameOfRoles: [],
    permissions: [],
    departments: [], // لتخزين الأقسام في الـ state
    token: null, // إضافة الـ token هنا
    positions: [],
    roleWithPermission: [],
    selectedRole: null,
    projects: [],
    projectLogs: [],
    oneTimeTaskLogs: [],
    oneTimeTaskComments: [],
    oneTimeTaskAttachments: [],
    routineTasks: [],
    allRoutineTasks: [],
    routineTasksReports: [],
    dashboardData: null,
    evaluation: [],
    evaluatedTasks: [],
    oneTimeTasks: [],
    rundomTask: [],
    profileData: null, // To store detailed user profile data
    uploadProfileImage: "",
    chartDeptPerformance: null,
    planInfo: null,
    planExpired: false,
    pagination: {
      total: 0,
      current_page: 1,
      per_page: 10,
      last_page: 1,
      next_page_url: null,
      prev_page_url: null,
    },
    plans: [], // إضافة state للخطط
  },
  mutations: {
    //بناءا على api laravel

    SET_TEMP_EMAIL(state, email) {
      state.tempEmail = email;
    },

    SET_EMAIL_EXISTS(state, email) {
      state.email = email;
    },

    SET_TOKEN(state, token) {
      state.token = token; // لتحديث الـ token
      localStorage.setItem("token", token); // تخزين الـ token في localStorage
    },

    SET_USER(state, user) {
      console.log("user", user);
      state.user = user;
      localStorage.setItem("user", encryptData(user));
      // localStorage.setItem("userName", encryptData(user.user.name));
      // localStorage.setItem("name1", user.user.name);
      // sessionStorage.setItem("role", user.user.role.name);
    },

    SET_INVITATION_EMAIL(state, email) {
      state.invitedEmail = email;
    },

    setDepartments(state, departments) {
      console.log("departments", departments);
      state.departments = departments;
    },

    ADD_DEPARTMENT(state, department) {
      console.log("department", department);
      state.department = department;
    },

    Set_Role_With_Permissions(state, roles) {
      state.roleWithPermission = roles;
    },

    REMOVE_USER(state, userId) {
      console.log("userId", userId);
      console.log("state", state);

      // state.dataFromApi = state.dataFromApi.filter(employee => employee.id !== userId);
      // يمكنك أيضًا تحديث `state.user` إذا كان ذلك مطلوبًا
    },

    SET_SELECTED_ROLE(state, role) {
      state.selectedRole = role;
    },

    REMOVE_ROLE(state, roleId) {
      state.dataFromApi = state.dataFromApi.filter(
        (role) => role.id !== roleId
      );
      // يمكنك أيضًا تحديث `state.user` إذا كان ذلك مطلوبًا
    },

    UPDATE_DEPARTMENT(state, department) {
      const index = state.departments.findIndex((d) => d.id === department.id);
      if (index !== -1) {
        state.departments[index] = department;
      }
    },

    assignManager(state, manager) {
      const departmentIndex = state.departments.findIndex(
        (d) => d.id === manager.department_id
      );
      if (departmentIndex !== -1) {
        state.departments[departmentIndex].manager = manager;
      }
      console.log("manager", manager);
    },

    SET_UPDATE_PROJECT_STATUS(state, project) {
      const index = state.projects.findIndex((p) => p.id === project.id);
      if (index !== -1) {
        state.projects = project;
      }
    },
    SET_PROJECT_LOGS(state, logs) {
      state.projectLogs = logs;
    },
    SET_ALL_ROUTINE_TASKS(state, tasks) {
      state.allRoutineTasks = tasks;
    },

    SET_ROUTINE_TASKS(state, tasks) {
      state.routineTasks = tasks;
    },

    SET_ONE_TIME_TASKS(state, tasks) {
      state.oneTimeTasks = tasks;
    },

    SET_PAGINATION(state, pagination) {
      state.pagination = pagination;
    },

    UPDATE_ROUTINE_TASK(state, updatedTask) {
      const index = state.routineTasks.findIndex(
        (task) => task.id === updatedTask.id
      );
      if (index !== -1) {
        state.routineTasks.tasks.splice(index, 1, updatedTask);
      }
    },
    DELETE_ROUTINE_TASK(state, taskId) {
      state.routineTasks = state.routineTasks.filter(
        (task) => task.id !== taskId
      );
    },

    updateTaskStatus(state, updatedTask) {
      console.log("updatedTask", updatedTask);
      console.log("state.routineTasks", state.routineTasks);
    },

    updateRoutineTask(state, updatedTask) {
      console.log("updatedTask", updatedTask);
      console.log("state.routineTasks", state.routineTasks);
    },

    addRoutineTask(state, newTask) {
      console.log("newTask", newTask);
      console.log("state.routineTasks", state.routineTasks);
    },

    SET_TASK_LOGS(state, logs) {
      state.taskLogs = logs;
    },

    SET_ONE_TIME_TASK_LOGS(state, logs) {
      state.oneTimeTaskLogs = logs;
    },

    SET_ONE_TIME_TASK_COMMENTS(state, comments) {
      state.oneTimeTaskComments = comments;
    },

    ADD_ONE_TIME_TASK_COMMENTS(state, comment) {
      state.oneTimeTaskComments.push(comment);
    },

    ADD_ONE_TIME_TASK_ATTACHMENTS(state, attachment) {
      state.oneTimeTaskAttachments.push(attachment);
    },

    createOneTimeTask(state, task) {
      console.log("task", task);
      console.log("state.oneTimeTasks", state.oneTimeTasks);
    },

    updateOneTimeTask(state, task) {
      console.log("task", task);
      console.log("state.oneTimeTasks", state.oneTimeTasks);
    },

    AddReplyCommentOneTimeTask(state, comment) {
      console.log("comment", comment);
      state.oneTimeTaskComments.push(comment);
    },
    starOneTimeTask(state, task) {
      console.log("task", task);
      console.log("state.oneTimeTasks", state.oneTimeTasks);
    },

    archiveOneTimeTask(state, task) {
      console.log("task", task);
      console.log("state.oneTimeTasks", state.oneTimeTasks);
    },

    updateoneTimeTaskStatus(state, task) {
      console.log("task", task);
      console.log("state.oneTimeTasks", state.oneTimeTasks);
    },

    reportRoutineTasks(state, taskData) {
      console.log("taskData", taskData);
      console.log("state.routineTasks", state.routineTasks);
    },

    ADD_ROUTINE_TASK(state, task) {
      console.log("task", task);
      console.log("state.routineTasks", state.routineTasks);
    },

    removeRoutineTask(state, taskId) {
      console.log("taskId", taskId);
      console.log("state.routineTasks", state.routineTasks);
    },

    SET_TASK_REPORTS(state, reports) {
      state.routineTasksReports = reports;
    },

    SET_DASHBOARD_DATA(state, data) {
      state.dashboardData = data;
    },

    SET_NOT_REPORTED_TASKS(state, tasks) {
      state.notReportedTasks = tasks;
    },

    SET_EVALUATION(state, evaluation) {
      state.evaluation = evaluation;
    },

    SET_EVALUATED_TASKS(state, tasks) {
      state.evaluatedTasks = tasks;
    },

    evaluateTask(state, taskData) {
      console.log("taskData", taskData);
      console.log("state.routineTasks", state.evaluatedTasks);
    },

    markRepliesAsSeen(state, replyId) {
      console.log("taskData", replyId);
      console.log("state.routineTasks", state.replyId);
    },

    getChartDeptPerformance(state, data) {
      state.chartDeptPerformance = data;
    },

    getRundomTask(state, data) {
      state.rundomTask = data;
    },

    uploadProfileImage(state, data) {
      state.uploadProfileImage = data;
    },

    SET_PLANS(state, plans) {
      state.plans = plans;
    },
    SET_PLAN_INFO(state, planInfo) {
      state.planInfo = planInfo;
    },
    SET_PLAN_EXPIRED(state, expired) {
      state.planExpired = !!expired;
      localStorage.setItem("planExpired", String(!!expired));
    },
    getPlans(state, plans) {
      state.plans = plans;
    },

    // end----------------------------------------------------
    // تحميل بيانات المستخدم من `localStorage` عند بدء التشغيل
    LOAD_USER_FROM_STORAGE(state) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        state.user = decryptData(storedUser);
      }
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        state.userId = decryptData(storedUserId);
      }
      const storedCompanyId = localStorage.getItem("companyId");
      console.log("storedCompanyId", storedCompanyId);
      if (storedCompanyId) {
        state.companyId = decryptData(storedCompanyId);
      }
      const storedEmail = localStorage.getItem("email");
      if (storedEmail) {
        state.email = decryptData(storedEmail);
      }
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        state.name = decryptData(storedName);
      }
      const storedLastName = localStorage.getItem("lastName");
      if (storedLastName) {
        state.lastName = decryptData(storedLastName);
      }
      const storedisOwner = localStorage.getItem("isOwner");
      if (storedisOwner) {
        state.isOwner = decryptData(storedisOwner);
        console.log("state.isOwner", state.isOwner);
      }
      const storedCompanyName = localStorage.getItem("companyName");
      if (storedCompanyName) {
        state.companyName = decryptData(storedCompanyName);
      }
      const storedProfileData = localStorage.getItem("profileData");
      if (storedProfileData) {
        state.profileData = decryptData(storedProfileData);
      }
      const storedPlanExpired = localStorage.getItem("planExpired");
      if (storedPlanExpired) {
        state.planExpired = storedPlanExpired === "true";
      }
    },

    // حفظ بيانات المستخدم الجديدة مع تصفير البيانات القديمة

    SET_USER_ID(state, id) {
      state.userId = id;
      localStorage.setItem("userId1", id);
      localStorage.setItem("userId", encryptData(id));
    },
    SET_COMPANY_ID(state, id) {
      console.log("companyId", id);
      state.companyId = id;
      localStorage.setItem("companyId1", id);
      localStorage.setItem("companyId", encryptData(id));
    },
    SET_COMPANY_NAME(state, name) {
      state.companyName = name;
      localStorage.setItem("companyName", encryptData(name));
    },
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions;
      localStorage.setItem("permissions", encryptData(permissions));
    },
    SET_USER_Name(state, name) {
      state.name = name;
      localStorage.setItem("userName", encryptData(name));
    },
    SET_USER_LastName(state, lastName) {
      state.lastName = lastName;
      localStorage.setItem("lastName", encryptData(lastName));
    },

    SET_IS_OWNER(state, isOwner) {
      console.log("isOwner", isOwner);
      state.isOwner = isOwner;
      localStorage.setItem("isOwner", encryptData(isOwner));
    },
    // إزالة بيانات المستخدم من Vuex و LocalStorage عند تسجيل خروج أو تسجيل مستخدم جديد
    CLEAR_USER_DATA(state) {
      state.user = null;
      state.userId = null;
      state.companyId = null;
      state.permissions = [];
      state.profileData = null;
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("companyId");
      localStorage.removeItem("permissions");
      localStorage.removeItem("profileData");
    },
    toggleConfigurator(state) {
      state.showConfig = !state.showConfig;
    },
    sidebarMinimize(state) {
      let sidenav_show = document.querySelector("#app");
      if (state.isPinned) {
        sidenav_show.classList.add("g-sidenav-hidden");
        sidenav_show.classList.remove("g-sidenav-pinned");
        state.isPinned = false;
      } else {
        sidenav_show.classList.add("g-sidenav-pinned");
        sidenav_show.classList.remove("g-sidenav-hidden");
        state.isPinned = true;
      }
    },
    // SET_USER_ID(state, id) {
    //   console.log("id", id);
    //   state.userId = id; // تخزين الـ id
    //   localStorage.setItem("userId", id);
    // },
    sidebarType(state, payload) {
      state.sidebarType = payload;
    },
    navbarFixed(state) {
      state.isNavFixed = !state.isNavFixed;
    },
    SET_LANGUAGE(state, payload) {
      state.language = payload;
      state.isRTL = payload === "ar";
      localStorage.setItem("language", payload);
    },
    SET_EMAIL(state, email) {
      state.email = email;
      localStorage.setItem("email", encryptData(email));
    },

    SET_Company_Email(state, email) {
      console.log("companyEmail :", email);
      state.companyEmail = email;
    },
    // REMOVE_USER(state) {
    //   state.user = null;
    // },
    // SET_COMPANY_ID(state, id) {
    //   state.companyId = id;
    //   localStorage.setItem("companyId", id);
    // },
    LOAD_COMPANY_ID(state) {
      const storedCompanyId = localStorage.getItem("companyId");
      if (storedCompanyId) {
        state.companyId = storedCompanyId; // استرجاع الـ companyId من localStorage عند تحميل التطبيق
      }
    },
    // SET_USER(state, user) {
    //   sessionStorage.clear();
    //   console.log("user" + user.user);
    //   state.user = user;
    //   sessionStorage.setItem("role", user.user.role.name);
    //   // sessionStorage.setItem("companyId", user.user.companyId);
    // },
    SET_USER_ROLES(state, roles) {
      state.updateRole = roles;
    },

    SET_DATA_FROM_API(state, data) {
      console.log("Setting dataFromApi:", data);
      state.dataFromApi = data;
    },
    SET_ROLES(state, roles) {
      // console.log("roles", roles);
      state.roles = roles;
    },
    unassignRole(state, roleId) {
      state.roles = state.roles.filter((role) => role.id !== roleId);
    },
    uanassignDepartment(state, departmentId) {
      state.departments = state.departments.filter(
        (department) => department.id !== departmentId
      );
    },
    SET_PERMISSIONS_ID(state, permId) {
      state.permId = permId;
    },
    SET_NAME_OF_ROLES(state, nameOfRoles) {
      console.log("nameOfRoles", nameOfRoles);
      state.nameOfRoles = nameOfRoles;
    },
    // SET_PERMISSIONS(state, permissions) {
    //   state.permissions = permissions;
    // },

    removeDepartment(state, departmentId) {
      state.departments = state.departments.filter(
        (dept) => dept.id !== departmentId
      );
    },
    updateDepartment(state, updatedDepartment) {
      const index = state.departments.findIndex(
        (dept) => dept.id === updatedDepartment.id
      );
      if (index !== -1) {
        state.departments.splice(index, 1, updatedDepartment);
      }
    },
    SET_POSITIONS(state, positions) {
      console.log("positions", positions);
      state.positions = positions;
    },
    SET_PROJECT(state, project) {
      state.projects = project; // إضافة المشروع الجديد إلى قائمة المشاريع
    },
    SET_ADD_PROJECT(state, project) {
      state.projects.push(project);
    },
    updateProject(state, updatedProject) {
      const index = state.projects.findIndex(
        (project) => project.id === updatedProject.id
      );
      if (index !== -1) {
        state.projects.splice(index, 1, updatedProject);
      }
    },
    removeProject(state, projectId) {
      state.projects = state.projects.filter(
        (project) => project.id !== projectId
      );
    },

    //fetch profile data
    fetchProfileData(state, profileData) {
      state.profileData = profileData;
      localStorage.setItem("profileData", encryptData(profileData));
    },
    SET_PROFILE_DATA(state, profileData) {
      state.profileData = profileData;
      localStorage.setItem("profileData", encryptData(profileData));
    },
    UPDATE_PROFILE_PICTURE(state, ppUrl) {
      if (state.profileData) {
        state.profileData.ppUrl = ppUrl;
        localStorage.setItem("profileData", encryptData(state.profileData));
      }
    },
  },
  actions: {
    toggleSidebarColor({ commit }, payload) {
      commit("sidebarType", payload);
    },
    changeLanguage({ commit }, language) {
      commit("SET_LANGUAGE", language);
    },

    async checkEmailExists({ commit }, email) {
      console.log("Checking if email exists:", email);
      try {
        const response = await apiClient.checkEmail(email); // استدعاء الـ API للتحقق من البريد
        commit("SET_EMAIL_EXISTS", email);
        console.log("response.data.exists:", response); // تأكد من أن الرد يحتوي على exists
        return response.data.exists; // إرجاع القيمة
      } catch (error) {
        console.error("Error checking email:", error);
        throw error;
      }
    },

    async checkIdExists({ commit }, id) {
      try {
        // إرسال البريد الإلكتروني للتحقق مما إذا كان موجودًا
        const response = await apiClient.checkId(id);
        commit("SET_USER_ID", id);
        console.log("response.data.exists:", response.data);
        return response.data.exists; // تأكيد إذا كان البريد الإلكتروني مسجلًا
      } catch (error) {
        console.error("Error checking email:", error);
        throw error;
      }
    },

    async submitEmail({ commit }, formData) {
      console.log(" formData : ", formData);
      try {
        // إرسال البريد الإلكتروني إلى الخادم
        const response = await apiClient.addEmail(formData);
        console.log("response.data:", response.data);
        console.log("response.data.data:", response.data.data);
        console.log("response.data.data.id:", response.data.data.id);

        commit("SET_EMAIL", response.data.data.email);
        commit("SET_USER_ID", response.data.data.id); // تخزين الـ id من الاستجابة
      } catch (error) {
        console.error(
          "Error submitting email:",
          error.response ? error.response.data : error.message
        );
      }
    },

    async addUserInfo({ commit }, formData) {
      try {
        console.log("Data received in Vuex Action:", formData);

        // إرسال البيانات إلى API
        const response = await apiClient.addNewUser(formData);
        console.log("response.data:", response.data);

        // تخزين البيانات في الـ state
        commit("SET_USER", response.data);
        console.log("User data:", response.data);

        return response;
        // يمكنك إضافة أي عمليات تخزين في الـ state إذا لزم الأمر
      } catch (error) {
        console.error(
          "Error submitting user info:",
          error.response ? error.response.data : error.message
        );
        throw error; // يمكنك إعادة رمي الخطأ ليتم التقاطه في المكون
      }
    },

    async updateUserData({ commit }, { userId, formData }) {
      try {
        const userData = { data: { ...formData } };
        const response = await apiClient.updateUser(userId, userData);
        commit("SET_USER", response.data);
        console.log("User data updated:", response.data);
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    },

    async updateUserName({ commit }, data) {
      try {
        const response = await apiClient.updateUserName(data);
        commit("SET_USER", response.data);
        console.log("UserName updated:", response.data);
        return response;
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    },

    async updateRole({ commit }, data) {
      try {
        const response = await apiClient.updateRolesWithPermissions(data);
        if (response.status === 200) {
          commit("SET_USER", response.data);
          console.log("User data updated:", response);
          return response;
        }
      } catch (error) {
        // استخراج الأخطاء من الرد
        const errorDetails = error.response?.data?.errors;

        let errorMessage = "Error adding routine task";

        if (errorDetails) {
          // تحويل الأخطاء إلى قائمة نصوص
          errorMessage = Object.entries(errorDetails)
            .map(
              ([field, messages]) =>
                `<strong>${field}</strong>: ${messages.join(", ")}`
            )
            .join("<br>");
          console.log("errorMessage", errorMessage);
        }

        console.error("Error adding routine task:::", errorMessage);
        throw new Error(
          errorMessage || error.message || "Unknown error occurred"
        );
      }
    },

    async deleteRole({ commit }, roleId) {
      try {
        const response = await apiClient.deleteRole(roleId);
        console.log("Role deleted:", response.data);
        commit("REMOVE_ROLE", roleId); // تأكد من أن Mutation `REMOVE_ROLE` موجودة
        return response;
      } catch (error) {
        console.error("Error deleting role:", error);
        throw error;
      }
    },

    async deleteEmployee({ commit }, data) {
      try {
        console.log("response", data);
        const response = await apiClient.deleteUser(data);
        if (response.status === 200) {
          console.log("User deleted:", response.data);
          commit("REMOVE_USER", data); // تأكد من أن Mutation `REMOVE_USER` موجودة
          return response;
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    },

    // في Vuex
    async updatePassword({ commit }, resetPassData) {
      try {
        const response = await apiClient.updatePassword(resetPassData);

        if (response.status === 200) {
          console.log("Password updated:", response);
          commit("SET_USER", response.data); // تحديث بيانات المستخدم في الستور
          return response.data.message; // إرجاع الرسالة من الـ API
        } else {
          console.error("Error updating password:", response);
          return response.data.message; // إرجاع رسالة الخطأ إذا كانت الاستجابة غير ناجحة
        }
      } catch (error) {
        console.error("Error updating password:", error);
        throw error; // إلقاء الخطأ إذا فشل الـ API
      }
    },
    async updateRoles({ commit }, data) {
      try {
        const response = await apiClient.updateRoles(data);
        if (response.status === 200) {
          commit("SET_USER", response.data);
          console.log("User data updated:", response);
          return response.data;
        } else {
          console.error("Error updating user data:", response);
          return response;
        }
      } catch (error) {
        console.error("Error updating user data:", error);
        throw error;
      }
    },

    async unassignRole({ commit }, data) {
      try {
        // استدعاء API لإزالة الدور
        const response = await apiClient.unassignRole(data);

        if (response.status === 200) {
          console.log("Role unassigned successfully:", response.data);
          // تحديث الأدوار في الـ state إذا لزم الأمر
          commit("unassignRole", response.data);
          // console.log(`Role ${roleId} unassigned from employee ${employeeId} successfully.`);
          // يمكنك إضافة Mutation إذا كنت تريد تحديث الحالة بشكل مباشر هنا
          return response.data;
        } else {
          console.error("Error unassigning role:", response);
          throw new Error("Error unassigning role");
        }
      } catch (error) {
        console.error("Error in unassignRole action:", error);
        throw error;
      }
    },

    async getCompanyUsers({ commit }) {
      console.log("getCompanyUsers called");
      try {
        const response = await apiClient.getCompanyUsers();
        // console.log("API Response:", response);
        if (response.status === 200) {
          // console.log("Data fetched from API:", response.data);
          commit("SET_DATA_FROM_API", response.data.users);
          return response;
        } else {
          // console.error("Error fetching data:", response);
          return response;
        }
      } catch (error) {
        console.error(
          "Error fetching projects:",
          error.response?.data?.message || error.message
        );
        // throw error.response?.data || error; // إعادة الخطأ
      }
    },

    async submitCompanyData({ commit }, companyData) {
      try {
        // إرسال بيانات الشركة إلى الخادم
        const response = await apiClient.addCompanyData(companyData);
        commit("SET_USER", response.data);
        console.log("Company data submitted successfully:", response.data);
      } catch (error) {
        console.error(
          "Error submitting company data:",
          error.response ? error.response.data : error.message
        );
      }
    },
    async signIn({ commit }, formData) {
      try {
        const response = await apiClient.checkCredentials(formData);

        // if (response.data.success) {
        // مسح البيانات السابقة قبل تع��ين الجديدة
        // commit("CLEAR_USER_DATA");

        console.log("response", response);
        if (response.status === 200) {
          commit("SET_TOKEN", response.data.token);
          const user = response.data.user;

          //check is Owner or User
          const isOwner = await apiClient.isOwner(formData);
          console.log("isOwner", isOwner);
          if (isOwner.data.isOwner) {
            commit("SET_IS_OWNER", isOwner.data.isOwner);
          } else {
            commit("SET_IS_OWNER", isOwner.data.isOwner);

            // استخراج الصلاحيات من الأدوار
            const permissions = extractPermissionsFromAPI(user.roles);

            console.log("Extracted permissions:", permissions);

            // حفظ الصلاحيات في localStorage
            savePermissionsToLocalStorage(permissions, user.id);
            commit("SET_PERMISSIONS", permissions);
          }

          commit("SET_USER", response.data);
          console.log("response.data.token", response.data.token);
          console.log("responseeeeeee.data", response.data);

          // commit("SET_USER_ID", response.data.user.id);
          commit("SET_COMPANY_ID", response.data.user.company.id);
          commit("SET_COMPANY_NAME", response.data.user.company.name);
          // commit("SET_EMAIL", response.data.user.email);
          commit("SET_USER_Name", response.data.user.name);
          commit("SET_USER_LastName", response.data.user.last_name);

          // Sync company data to company module
          commit("company/SET_COMPANY_ID", response.data.user.company.id);
          commit("company/SET_COMPANY_NAME", response.data.user.company.name);

          // بعد تسجيل الدخول بنجاح، جلب بيانات الباقة والملف الشخصي
          try {
            await this.dispatch("fetchPlanInfo");
            await this.dispatch("fetchProfileData");
            // Optionally fetch company data if logo is available in API
            // await this.dispatch("company/fetchCompanyData");
          } catch (e) {
            // تجاهل الخطأ هنا، سيتم إظهاره في الواجهة إذا لزم
          }

          return response;
        } else {
          return response;
        }

        // }
      } catch (error) {
        console.error("Error logging in:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى لاحقًا.",
        };
      }
    },

    async sendResetPassword({ commit }, email) {
      console.log(email);
      try {
        // إرسال البريد الإلكتروني إلى الخادم
        const response = await apiClient.sendResetPassword(email);

        console.log("response.data:", response.data);

        commit("SET_EMAIL", response.data.email);

        return response; // يمكنك إضافة المزيد من العمليات حسب الحاجة، مثل تحديث userId
      } catch (error) {
        console.error(
          "Error submitting email:",
          error.response ? error.response.data : error.message
        );
      }
    },

    async sendInvitation({ commit }, userData) {
      console.log(userData);
      try {
        // إرسل البريد الإلكتروني إلى الخادم
        const response = await apiClient.sendInvitation(userData);

        if (response.status === 201) {
          console.log("response.data:", response.data);

          commit("SET_INVITATION_EMAIL", response.data);
          return response;
        } else {
          return response;
        }
        // يمكنك إضافة المزيد من العمليات حسب الحاجة، مثل تحديث userId
      } catch (error) {
        console.error(
          "Error submitting email:",
          error.response ? error.response.data : error.message
        );
      }
    },

    async fetchPermissions({ commit }) {
      try {
        const response = await apiClient.getPermissions();
        console.log("Fetched permissions:", response.data);
        commit("SET_PERMISSIONS", response.data); // حفظ الأذونات في الـ state
        return response; // إعادة البيانات لاستخدامها في المكونات
      } catch (error) {
        console.error("Error fetching permissions:", error);
        throw error;
      }
    },

    async fetchRoles({ commit }) {
      try {
        const response = await apiClient.getRoles(); // جلب الأدوار من الـ API
        if (response.status === 200) {
          console.log("Fetched roles:", response.data); // طباعة البيانات للتحقق
          commit("SET_ROLES", response.data); // تخزين الأدوار في state
          // commit(
          //   "SET_NAME_OF_ROLES",
          //   response.data.map((item) => item.name)
          // ); // تخزين الأدوار في state
          return response;
        } else {
          console.error("Error fetching roles:", response);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    },

    async fetchselectedRole({ commit }, roleId) {
      try {
        const response = await apiClient.getselectedRole(roleId);
        console.log("Fetched selected role:", response.data);
        commit("SET_SELECTED_ROLE", response.data); // حفظ الأذونات في الـ state
        return response; // إعادة البيانات لاستخدامها في المكونات
      } catch (error) {
        console.error("Error fetching permissions:", error);
        throw error;
      }
    },
    async fetchPositions({ commit }) {
      try {
        const response = await apiClient.getPositions();
        console.log("Fetched positions:", response.data.data);
        commit("SET_POSITIONS", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("Error fetching positions:", error);
        throw error;
      }
    },

    async addRoleWithPermissions({ commit }, permissionsAndRoleData) {
      try {
        const response = await apiClient.addRoleWithPermissions(
          permissionsAndRoleData
        );
        console.log("Role and permissions added:", response.data);

        commit("Set_Role_With_Permissions", response.data); // تحديث الأدوار في الـ state إذا لزم الأمر

        return response;
      } catch (error) {
        console.error("Error adding role and permissions:", error);
        throw error;
      }
    },
    async addPermissions({ commit }, permissionsData) {
      console.log("permissionsData", permissionsData);
      try {
        ``;
        // استدعاء API لإضافة الصلاحيات
        const response = await apiClient.addPermassion(permissionsData);
        console.log("Permissions added:", response.data);
        console.log("id Permissions added:", response.data.id);

        // تحديث الأدوار في الـ state إذا لزم الأمر
        commit("SET_PERMISSIONS_ID", response.data.id);

        // إرجاع معرفات الصلاحيات المحفوظة
        return response.data.id;
      } catch (error) {
        console.error("Error adding permissions:", error);
        throw error;
      }
    },

    async addRole({ commit }, roleData) {
      try {
        // استدعاء API لإضافة الدور
        const response = await apiClient.addRole(roleData);
        console.log("Role added:", response.data);
        // تحديث الأدوار في الـ state إذا لزم الأمر
        commit("SET_ROLES", response.data);

        // إرجاع معرفات الدور المحفوظ
        return response;
      } catch (error) {
        // استخراج الأخطاء من الرد
        const errorDetails = error.response?.data?.message;
        console.log("errorDetails", errorDetails);

        // let errorMessage = "Error adding role";
        // if (errorDetails) {
        //   // تحويل الأخطاء إلى قائمة نصوص
        //   errorMessage = Object.entries(errorDetails)
        //     .map(([field, messages]) => `<strong>${field}</strong>: ${messages.join(", ")}`)
        //     .join("<br>");
        //     console.log("errorMessage", errorMessage);
        // }

        // console.error("Error adding role:::", errorMessage);
        throw new Error(
          errorDetails || error.message || "Unknown error occurred"
        );
      }
    },

    async fetchPermissionsByRole({ commit }, role) {
      try {
        // استخدام API لجلب الصلاحيات بناءً على الدور الحالي
        const response = await apiClient.getPermissionsByRole(role);
        commit("SET_PERMISSIONS", response.data);
        console.log("Permissions fetched successfully:", response.data);
      } catch (error) {
        console.error("Error fetching permissions by role:", error);
      }
    },

    async signOut({ commit }) {
      // Clear company data before clearing all
      commit("company/CLEAR_COMPANY_DATA");
      localStorage.clear();
      sessionStorage.clear();
    },

    setEmail({ commit }, email) {
      commit("SET_EMAIL", email);
    },
    setToken({ commit }, token) {
      // لتعيين الـ token (يمكن استخدامه عند تسجيل الدخول)
      commit("SET_TOKEN", token);
    },
    setUser({ commit }, user) {
      commit("SET_USER", user);
    },
    setDataFromApi({ commit }, data) {
      commit("SET_DATA_FROM_API", data);
    },
    setUserId({ commit }, userId) {
      // لتعيين الـ id (يمكن استخدامه عند تسجيل الدخول)
      commit("SET_USER_ID", userId);
    },
    loadCompanyId({ commit }) {
      commit("LOAD_COMPANY_ID");
    },
    async addDepartment({ commit }, department) {
      console.log("department", department);
      try {
        const response = await apiClient.addDepartment(department);
        if (response.status === 201) {
          console.log("Department added:", response.data);
          commit("ADD_DEPARTMENT", response);
          return response;
        } else {
          return response;
        }
      } catch (error) {
        console.error("Error adding department:", error);
      }
    },
    async fetchDepartments({ commit }) {
      console.log("starttttttt fetchDepartments");
      try {
        const response = await apiClient.getDepartments();
        if (response.status === 200) {
          commit("setDepartments", response.data.Departments);
          console.log("response", response);
          console.log("response.datafetchDepartments", response.data);
          return response;
        } else {
          return response;
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    },
    async deleteDepartment({ commit }, departmentId) {
      console.log("departmentId", departmentId);
      try {
        await apiClient.deleteDepartment(departmentId);
        commit("removeDepartment", departmentId);
        return { success: true, message: "Department deleted successfully" };
      } catch (error) {
        console.error("Error deleting department:", error);
        return { success: false, message: "Error deleting department" };
      }
    },

    async assignManager({ commit }, department) {
      console.log("department", department);
      try {
        const response = await apiClient.assignManager(department);
        if (response.status === 200) {
          commit("assignManager", response.data);
          return response;
        } else {
          return response;
        }
      } catch (error) {
        console.error("Error assigning manager:", error);
      }
    },

    async updateDepartment({ commit }, department) {
      console.log("department", department);
      try {
        const response = await apiClient.updateDepartment(department);
        if (response.status === 200) {
          commit("UPDATE_DEPARTMENT", response);
          return response;
        } else {
          return response;
        }
      } catch (error) {
        // استخراج الأخطاء من الرد
        const errorDetails = error.response?.data?.errors;

        let errorMessage = "Error adding routine task";

        if (errorDetails) {
          // تحويل الأخطاء إلى قائمة نصوص
          errorMessage = Object.entries(errorDetails)
            .map(
              ([field, messages]) =>
                `<strong>${field}</strong>: ${messages.join(", ")}`
            )
            .join("<br>");
          console.log("errorMessage", errorMessage);
        }

        console.error("Error adding routine task:::", errorMessage);
        throw new Error(
          errorMessage || error.message || "Unknown error occurred"
        );
      }
    },

    // Vuex action - تحديث القسم مع تحديث المدير ونائب المدير
    async updateDepartments({ commit }, data) {
      try {
        const response = await apiClient.updateDepartments(data);
        if (response.status === 200) {
          commit("SET_USER", response.data);
          console.log("User data updated:", response);
          return response.data;
        } else {
          console.error("Error updating user data:", response);
          return response;
        }
      } catch (error) {
        console.error("Error updating user data:", error);
        throw error;
      }
    },

    async unassignDepartment({ commit }, data) {
      console.log("data", data);
      try {
        const response = await apiClient.unassignDepartment(data);
        if (response.status === 200) {
          commit("uanassignDepartment", response.data);
          console.log("User data updated:", response);
          return response.data;
        } else {
          console.error("Error updating user data:", response);
          return response;
        }
      } catch (error) {
        console.error("Error updating user data:", error);
        throw error;
      }
    },

    // projects

    async fetchProjects({ commit }) {
      try {
        const response = await apiClient.getProjects();
        if (response.status === 200) {
          commit("SET_PROJECT", response.data);
          console.log("response", response);
          console.log("response.data", response.data);
          return response;
        } else {
          return response;
        }
      } catch (error) {
        console.error(
          "Error fetching projects:",
          error.response?.data?.message || error.message
        );
        throw error.response?.data || error; // إعادة الخطأ
      }
    },

    async addProject({ commit }, project) {
      console.log("project", project);
      try {
        const response = await apiClient.addProject(project);
        commit("SET_ADD_PROJECT", response.data);
        return response;
      } catch (error) {
        // استخراج الأخطاء من الرد
        const errorDetails = error.response?.data?.errors;

        let errorMessage = "Error adding routine task";

        if (errorDetails) {
          // تحويل الأخطاء إلى قائمة نصوص
          errorMessage = Object.entries(errorDetails)
            .map(
              ([field, messages]) =>
                `<strong>${field}</strong>: ${messages.join(", ")}`
            )
            .join("<br>");
          console.log("errorMessage", errorMessage);
        }

        console.error("Error adding routine task:::", errorMessage);
        throw new Error(
          errorMessage || error.message || "Unknown error occurred"
        );
      }
    },

    async updateProjectStatus({ commit }, project) {
      console.log("project", project);
      try {
        const response = await apiClient.updateProjectStatus(project);
        console.log("response", response);
        commit("SET_UPDATE_PROJECT_STATUS", response.data);
        return response;
      } catch (error) {
        console.error("Error updating project status:", error);
        return error;
      }
    },
    async fetchProjectLogs({ commit }, projectId) {
      console.log("projectId", projectId);
      try {
        const response = await apiClient.getProjectLogs(projectId);
        console.log("response", response);
        commit("SET_PROJECT_LOGS", response.data);
        return response;
      } catch (error) {
        console.error("Error fetching project logs:", error);
        return error;
      }
    },
    async updateProject({ commit }, project) {
      console.log("project", project);
      try {
        const response = await apiClient.updateProject(project);
        console.log("response", response);
        commit("updateProject", response.data);
        return response;
      } catch (error) {
        console.error("Error updating Project:", error);
        return error;
      }
    },
    async deleteProject({ commit }, projectId) {
      console.log("projectId", projectId);
      try {
        const response = await apiClient.deleteProject(projectId);
        commit("removeProject", projectId);
        return response;
      } catch (error) {
        console.error("Error deleting project:", error);
        return error;
      }
    },

    // routine tasks
    async fetchAllRoutineTasks({ commit }, page = 1) {
      try {
        const response = await apiClient.getAllRoutineTasks(page);
        if (response.status === 200) {
          commit("SET_ALL_ROUTINE_TASKS", response.data);
          console.log("response", response);
          console.log("response.data", response.data);
          return response;
        } else {
          console.log("response", response);
          return response;
        }
      } catch (error) {
        // عرض الخطأ بشكل واضح في وحدة التحكم وتوفيره لـ Swal
        const errorMessage =
          error.response?.data?.message || "Error fetching routine tasks";

        console.error("Error fetching routine tasks:", errorMessage);

        throw new Error(errorMessage); // رفع الخطأ ليتم التعامل معه في المستوى الأعلى
      }
    },

    async updateTaskStatus({ commit }, payload) {
      try {
        const response = await apiClient.updateTaskStatus(payload);
        commit("updateTaskStatus", response.data);
        return response;
      } catch (error) {
        console.error("Error updating task status:", error);
        return error;
      }
    },
    async addRoutineTask({ commit }, routineTask) {
      try {
        const response = await apiClient.addRoutineTask(routineTask);
        if (response.status === 201) {
          console.log("Routine task added:", response.data);
          commit("ADD_ROUTINE_TASK", response.data);
          return response;
        } else {
          return response;
        }
      } catch (error) {
        // استخراج الأخطاء من الرد
        const errorDetails = error.response?.data?.errors;

        let errorMessage = "Error adding routine task";

        if (errorDetails) {
          // تحويل الأخطاء إلى قائمة نصوص
          errorMessage = Object.entries(errorDetails)
            .map(
              ([field, messages]) =>
                `<strong>${field}</strong>: ${messages.join(", ")}`
            )
            .join("<br>");
          console.log("errorMessage", errorMessage);
        }

        console.error("Error adding routine task:::", errorMessage);
        throw new Error(
          errorMessage || error.message || "Unknown error occurred"
        );
      }
    },
    async updateRoutineTask({ commit }, routineTask) {
      try {
        const response = await apiClient.updateRoutineTask(routineTask);
        commit("updateRoutineTask", response.data);
        return response;
      } catch (error) {
        console.error("Error updating routine task:", error);
        return error;
      }
    },

    async deleteRoutineTask({ commit }, taskId) {
      try {
        const response = await apiClient.deleteRoutineTask(taskId);
        commit("removeRoutineTask", taskId);
        return response;
      } catch (error) {
        console.error("Error deleting routine task:", error);
        return error;
      }
    },

    async fetchTaskLogs({ commit }, taskId) {
      try {
        const response = await apiClient.getTaskLogs(taskId);
        commit("SET_TASK_LOGS", response.data);
        return response;
      } catch (error) {
        console.error("Error fetching task logs:", error);
        return error;
      }
    },

    async fetchRoutineTasks({ commit }, page = 1, filters = {}) {
      console.log("filters", filters);
      try {
        const response = await apiClient.getRoutineTasks(page, filters);

        if (response.status === 200) {
          commit("SET_ROUTINE_TASKS", response.data);
          return response;
        } else {
          console.error("Error fetching tasks:", response);
          return response;
        }
      } catch (error) {
        console.error("Error fetching routine tasks:", error);
        throw error;
      }
    },

    async reportRoutineTasks({ commit }, payload) {
      console.log("payload", payload);
      try {
        const response = await apiClient.reportRoutineTasks(payload);
        console.log("reportRoutineTasks-response", response.data);
        commit("reportRoutineTasks", response.data);
        return response;
      } catch (error) {
        console.error("Error reporting routine tasks:", error);
        return error;
      }
    },

    // task reports
    // async fetchTaskReports({ commit }, page = 1 , filterData ) {
    //   try {
    //     // const filterData = {
    //     //   start_date: start_date,
    //     //   end_date: end_date
    //     // }
    //     if (filterData) {
    //       console.log("with filter");
    //       const response = await apiClient.getTaskReports(page , filterData);
    //       console.log("response", response.data);
    //     commit("SET_TASK_REPORTS", response.data);
    //     return response;
    //     } else{
    //       console.log("without filter");
    //       const response = await apiClient.getTaskReports(page);
    //       console.log("response", response.data);
    //     commit("SET_TASK_REPORTS", response.data);
    //     return response;
    //     }

    //   } catch (error) {
    //     console.error("Error fetching task reports:", error);
    //     return error;
    //   }
    // },

    async fetchTaskReports({ commit }, date) {
      console.log("dateeeeeeeeeeeeeeeee", date);
      try {
        const response = await apiClient.getTaskReports(date); // Pass date to API
        console.log("responseeeeeeeeee", response.data);
        commit("SET_TASK_REPORTS", response.data);
        return response;
      } catch (error) {
        console.error("Error fetching not reported tasks:", error);
        return error;
      }
    },

    async fetchNotReportedTasks({ commit }, date) {
      console.log("dateeeeeeeeeeeeeeeee", date);
      try {
        const response = await apiClient.getNotReportedTasks(date); // Pass date to API
        commit("SET_NOT_REPORTED_TASKS", response.data);
        return response;
      } catch (error) {
        console.error("Error fetching not reported tasks:", error);
        return error;
      }
    },

    // dashboard
    async fetchDashboardData({ commit }) {
      try {
        const response = await apiClient.getDashboardData();
        commit("SET_DASHBOARD_DATA", response.data);
        return response.data; // Return the data payload to the component
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error; // Re-throw the error so the component can catch it
      }
    },

    //evaluation
    async fetchEvaluation({ commit }, taskId) {
      console.log("dateeeeeeeeeeeeeeeee", taskId);
      try {
        const response = await apiClient.getEvaluation(taskId); // Pass date to API
        commit("SET_EVALUATION", response.data);
        return response;
      } catch (error) {
        console.error("Error fetching not reported tasks:", error);
        return error;
      }
    },

    async fetchEvaluatedTasks({ commit }, date) {
      console.log("dateeeeeeeeeeeeeeeee", date);
      try {
        const response = await apiClient.getEvaluatedTasks(date); // Pass date to API
        commit("SET_EVALUATED_TASKS", response.data);
        return response;
      } catch (error) {
        console.error("Error fetching not reported tasks:", error);
        return error;
      }
    },

    async evaluateTask({ commit }, payload) {
      console.log("payload", payload);
      try {
        const response = await apiClient.evaluateTask(payload);
        console.log("evaluateTask-response", response.data);
        commit("evaluateTask", response.data);
        return response;
      } catch (error) {
        console.error("Error reporting routine tasks:", error);
        return error;
      }
    },

    //one time task
    async fetchOneTimeTasks({ commit }, page = 1, filters = {}) {
      console.log("filters", filters);
      try {
        const response = await apiClient.getOneTimeTasks(page, filters);
        console.log("responseoneTimeTasks", response.data);
        if (response.status === 200) {
          commit("SET_ONE_TIME_TASKS", response.data);
          return response;
        } else {
          console.error("Error fetching tasks:", response);
          return response;
        }
      } catch (error) {
        console.error("Error fetching routine tasks:", error);
        throw error;
      }
    },

    async getOneTimeTaskLogs({ commit }, taskId) {
      try {
        const response = await apiClient.getOneTimeTaskLogs(taskId);
        console.log("response logsssssssssss" + response);
        commit("SET_ONE_TIME_TASK_LOGS", response.data);
        return response;
      } catch (error) {
        console.error("Error fetching task logs:", error);
        return error;
      }
    },

    async getOneTimeTaskComments({ commit }, taskId) {
      try {
        const response = await apiClient.getOneTimeTaskComments(taskId);
        commit("SET_ONE_TIME_TASK_COMMENTS", response.data);
        return response;
      } catch (error) {
        console.error("Error fetching task comments:", error);
        return error;
      }
    },

    async starOneTimeTask({ commit }, task) {
      console.log("task", task);
      try {
        const response = await apiClient.starOneTimeTask(task);
        console.log("starOneTimeTask-response", response.data);
        commit("starOneTimeTask", response.data);
        return response;
      } catch (error) {
        console.error("Error starring one time task:", error);
        return error;
      }
    },

    async archiveOneTimeTask({ commit }, task) {
      console.log("task", task);
      try {
        const response = await apiClient.archiveOneTimeTask(task);
        console.log("archiveOneTimeTask-response", response.data);
        commit("archiveOneTimeTask", response.data);
        return response;
      } catch (error) {
        console.error("Error archiving one time task:", error);
        return error;
      }
    },

    // في الـstore (actions.js أو ما يناسب)
    async updateoneTimeTaskStatus({ commit }, payload) {
      // payload هنا شكلها: { id: <رقم المهمة>, status: "inProgress" أو "panding" }
      console.log("payload", payload);

      try {
        const response = await apiClient.updateoneTimeTaskStatus(payload);
        console.log("updateoneTimeTaskStatus-response", response.data);

        // (اختياري) لو عندك ميوتation لتحديث الـStore
        commit("updateoneTimeTaskStatus", response.data);

        return response;
      } catch (error) {
        console.error("Error updating one time task status:", error);
        throw error; // أو return error
      }
    },

    async AddCommentOneTimeTask({ commit }, comment) {
      console.log("comment", comment);
      try {
        const response = await apiClient.AddCommentOneTimeTask(comment);
        console.log("commentOneTimeTask-response", response.data);
        commit("ADD_ONE_TIME_TASK_COMMENTS", response.data);
        return response;
      } catch (error) {
        console.error("Error commenting one time task:", error);
        return error;
      }
    },

    async AddAttachmentOneTimeTask({ commit }, { data, taskId }) {
      try {
        const response = await apiClient.AddAttachmentOneTimeTask(data, taskId);
        commit("ADD_ONE_TIME_TASK_ATTACHMENTS", response.data);
        return response;
      } catch (error) {
        console.error("Error adding attachment:", error);
        throw error;
      }
    },

    async createOneTimeTask({ commit }, task) {
      console.log("task", task);
      try {
        const response = await apiClient.createOneTimeTask(task);
        console.log("createOneTimeTask-response", response.data);
        commit("createOneTimeTask", response.data);
        return response;
      } catch (error) {
        console.error("Error creating one time task:", error);
        const errorDetails = error.response?.data?.errors;

        let errorMessage = "Error adding routine task";

        if (errorDetails) {
          // تحويل الأخطاء إلى قائمة نصوص
          errorMessage = Object.entries(errorDetails)
            .map(
              ([field, messages]) =>
                `<strong>${field}</strong>: ${messages.join(", ")}`
            )
            .join("<br>");
          console.log("errorMessage", errorMessage);
        }

        console.error("Error adding routine task:::", errorMessage);
        throw new Error(
          errorMessage || error.message || "Unknown error occurred"
        );
      }
    },

    async createTicket(context, ticketData) {
      try {
        const response = await apiClient.createTicket(ticketData);
        return response;
      } catch (error) {
        console.error("Error creating ticket:", error);
        throw error;
      }
    },

    async updateOneTimeTask({ commit }, task) {
      console.log("task", task);
      try {
        const response = await apiClient.updateOneTimeTask(task);
        console.log("updateOneTimeTask-response", response.data);
        commit("updateOneTimeTask", response.data);
        return response;
      } catch (error) {
        console.error("Error updating one time task:", error);
        // استخراج الأخطاء من الرد
        const errorDetails = error.response?.data?.errors;

        let errorMessage = "Error updating one time task";

        if (errorDetails) {
          // تحويل الأخطاء إلى قائمة نصوص
          errorMessage = Object.entries(errorDetails)
            .map(
              ([field, messages]) =>
                `<strong>${field}</strong>: ${messages.join(", ")}`
            )
            .join("<br>");
          console.log("errorMessage", errorMessage);
        }

        console.error("Error adding routine task:::", errorMessage);
        throw new Error(
          errorMessage || error.message || "Unknown error occurred"
        );
      }
    },

    async AddReplyCommentOneTimeTask({ commit }, reply) {
      console.log("reply", reply);
      try {
        const response = await apiClient.AddReplyCommentOneTimeTask(reply);
        console.log("AddReplyCommentOneTimeTask-response", response.data);
        commit("AddReplyCommentOneTimeTask", response.data);
        return response;
      } catch (error) {
        console.error("Error adding reply comment:", error);
        return error;
      }
    },

    async markReplyAsSeen({ commit }, replyId) {
      try {
        const response = await apiClient.markReplyAsSeen(replyId);
        console.log("markRepliesAsSeen-response", response.data);
        commit("markRepliesAsSeen", { replyId });
        return response;
      } catch (error) {
        console.error("Error marking replies as seen:", error);
        return error;
      }
    },

    // ChartDeptPerformance vuex
    // In your Vuex module
    async getChartDeptPerformance({ commit }, range) {
      try {
        const response = await apiClient.getChartDeptPerformance(range);
        console.log("getChartDeptPerformance-responseeeeeeeeee", response.data);
        commit("getChartDeptPerformance", response.data);
        return response;
      } catch (error) {
        console.error("Error:", error);
        return error;
      }
    },

    async getRundomTask({ commit }) {
      try {
        const response = await apiClient.getRundomTask();
        console.log("getRundomTask-responseeeeeeeeee", response.data);
        commit("getRundomTask", response.data);
        return response;
      } catch (error) {
        console.error("Error:", error);
        return error;
      }
    },

    // fetch profile data
    async fetchProfileData({ commit }) {
      try {
        const response = await apiClient.getProfileData();
        // console.log("fetchProfileData-responseeeeeeeeee", response.data);
        commit("SET_PROFILE_DATA", response.data);
        return response;
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    },

    async updateProfileData({ commit }, updatedData) {
      try {
        const response = await apiClient.updateProfileData(updatedData);
        console.log("updateProfileData-response", response.data);
        commit("SET_PROFILE_DATA", response.data);
        return response;
      } catch (error) {
        console.error("Error updating profile data:", error);
        throw error; // Throw the error instead of returning it
      }
    },

    async uploadProfileImage({ commit }, formData) {
      try {
        const response = await apiClient.uploadProfileImage(formData);
        console.log("uploadProfileImage-response", response.data);
        commit("UPDATE_PROFILE_PICTURE", response.data.ppUrl);
        return response;
      } catch (error) {
        console.error("Error uploading profile image:", error);
        throw error;
      }
    },

    async getPlans({ commit }) {
      try {
        const response = await apiClient.getPlans();
        console.log("getPlans-responseeeeeeeeee", response.data);
        commit("getPlans", response.data);
        return response;
      } catch (error) {
        console.error("Error:", error);
        return error;
      }
    },

    async fetchPlans({ commit }) {
      try {
        const response = await apiClient.fetchPlans();
        if (response.data && response.data.data) {
          commit("SET_PLANS", response.data.data);
          return response.data.data;
        }
        return [];
      } catch (error) {
        console.error("Error fetching plans in store:", error);
        throw error;
      }
    },

    async subscribeToPlan({ dispatch }, payload) {
      console.log("payload", payload);
      try {
        const response = await apiClient.subscribeToPlan(payload);
        await dispatch("fetchProfileData"); // Refresh user data to get new plan status
        return response.data;
      } catch (error) {
        console.error("Error subscribing to plan in store:", error);
        throw error;
      }
    },
    async fetchPlanInfo({ commit }) {
      // Action لجلب بيانات الباقة من الـ API
      try {
        const response = await apiClient.fetchPlanInfo();
        const payload = response?.data?.data;
        console.log("fetchPlanInfoooooo payload", payload);

        // دعم أكثر من شكل محتمل للبيانات القادمة من السيرفر
        const candidate =
          payload?.data ?? // { data: {...} }
          payload?.plan ?? // { plan: {...} }
          payload?.planInfo ?? // { planInfo: {...} }
          (typeof payload === "object" ? payload : null); // {...}

        if (candidate) {
          commit("SET_PLAN_INFO", candidate);

          // احسب انتهاء الخطة من التاريخ
          const serverExpired = candidate?.expired;
          let finalExpired = false;

          if (candidate?.expire_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const expDate = new Date(candidate.expire_date);
            expDate.setHours(23, 59, 59, 999);

            const isExpiredByDate = today > expDate;

            if (serverExpired !== undefined && serverExpired !== null) {
              // احترم قيمة السيرفر إن وجدت، لكن لو التاريخ منتهي خلّيها منتهية
              finalExpired = Boolean(Number(serverExpired)) || isExpiredByDate;
            } else {
              finalExpired = isExpiredByDate;
            }
          } else if (serverExpired !== undefined && serverExpired !== null) {
            finalExpired = Boolean(Number(serverExpired));
          }

          commit("SET_PLAN_EXPIRED", finalExpired);
          console.log("fetchPlanInfoooooo candidate", candidate);
          console.log("Plan expired status:", finalExpired);
          return candidate;
        }

        return null;
      } catch (error) {
        console.error("Error fetching plan info:", error);
        // لا نرمي الخطأ لأن الـ interceptor قد يكون قد تعامل مع انتهاء الخطة بالفعل
        return null;
      }
    },
  },

  modules: {
    company: companyModule,
  },

  getters: {
    isSidebarFixed: (state) => state.navbarFixed,
    plans: (state) => state.plans,
    currentLanguage: (state) => state.language,
    isRTL: (state) => state.isRTL,
    email: (state) => state.email,
    user: (state) => state.user,
    token: (state) => state.token,
    dataFromApi: (state) => state.dataFromApi,
    userId: (state) => state.userId,
    companyEmail: (state) => state.companyEmail,
    companyId: (state) => state.companyId,
    roles: (state) => state.roles,
    permissions: (state) => state.permissions,
    nameOfRoles: (state) => state.nameOfRoles,
    updateRole: (state) => state.updateRole,
    permId: (state) => state.permId,
    userName: (state) => state.name,
    department: (state) => state.department,
    departments: (state) => state.departments,
    positions: (state) => state.positions,
    projects: (state) => state.projects,
    tempEmail: (state) => state.tempEmail,
    invitedEmail: (state) => state.invitedEmail,
    isOwner: (state) => state.isOwner,
    selectedRole: (state) => state.selectedRole,
    selectedPermissions: (state) => state.selectedPermissions,
    roleWithPermissions: (state) => state.roleWithPermissions,
    updateDepartment: (state) => state.updateDepartment,
    projectLogs: (state) => state.projectLogs,
    routineTasks: (state) => state.routineTasks,
    allRoutineTasks: (state) => state.allRoutineTasks,
    routineTasksReports: (state) => state.routineTasksReports,
    dashboardData: (state) => state.dashboardData,
    companyName: (state) => state.companyName,
    notReportedTasks: (state) => state.notReportedTasks,
    evaluation: (state) => state.evaluation,
    evaluatedTasks: (state) => state.evaluatedTasks,
    oneTimeTasks: (state) => state.oneTimeTasks,
    oneTimeTaskLogs: (state) => state.oneTimeTaskLogs,
    oneTimeTaskComments: (state) => state.oneTimeTaskComments,
    oneTimeTaskAttachments: (state) => state.oneTimeTaskAttachments,
    chartDeptPerformance: (state) => state.chartDeptPerformance,
    profileData: (state) => state.profileData,
    planInfo: (state) => state.planInfo,
    lastName: (state) => state.lastName,
  },
});
