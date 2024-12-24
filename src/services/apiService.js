// src/services/apiService.js
import axios from "axios";
// import store from "@/store"; // استيراد Vuex store للوصول إلى الـ token

// const apiClient2 = axios.create({
//   secondaryBaseURL: "https://starfish-app-gv3mu.ondigitalocean.app/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// إنشاء apiClient باستخدام axios
const apiClient = axios.create({
  baseURL: "https://starfish-app-gv3mu.ondigitalocean.app/api", // قاعدة الـ URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor لإضافة الـ token لكل طلب
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = store.getters.token; // جلب الـ token من Vuex
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`; // إضافة الـ token إلى الـ headers
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// تصدير الدوال المختلفة للتعامل مع API
export default {
  // GET: جلب البيانات
  getCompanyUsers() {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.get("/company-users", config);
  },

  // POST: إضافة بيانات جديدة
  addEmail(userData) {
    console.log(userData);
    // const payload = {
    //   data: {
    //     email: userData.email,
    //     role: userData.roleId,
    //   },
    // }
    return apiClient.post("/register", userData);
  },
  checkEmail(email) {
    console.log(email);
    return apiClient.post(`/check-email?email=${email}`);
  },
  checkId(id) {
    console.log(id);
    return apiClient.get(`/starts/check-id?id=${id}`);
  },
  checkCredentials(loginData) {
    // console.log(userData);
    return apiClient.post("/login", loginData);
  },

  deleteUser(data) {
    const token = localStorage.getItem("token");
    console.log(token , data);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    // console.log(apiClient.delete(`/delete-user`,data, config));
    return apiClient.delete(`/delete-user/${data.user_id}`, config);
  },

  isOwner() {
    // console.log(userData);
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.get("/isOwner", config);
  },

  //update user password
  updatePassword(resetPassData) {
    return apiClient.post(`reset-password`, resetPassData);
  },

  sendInvitation(userData) {
    console.log("Email to invite:", userData);
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.post("/invite", userData, config);
  },
  addNewUser(userData) {
    return apiClient.post("/registerViaInvitation", userData);
  },

  //start department---------------------------------------------------

  getDepartments() {
    const token = localStorage.getItem("token");
    console.log("token:", token);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.get("/departments", config);
  },

  addDepartment(departmentData) {
    const token = localStorage.getItem("token");
    console.log("departmentData", departmentData);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.post("/departments", departmentData, config);
  },

 

  deleteDepartment(departmentId) {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.delete(`/departments/${departmentId}`, config);
  },
  // to update name and manager
  updateDepartment(departmentData) {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.put(`/departments/${departmentData.id}`, departmentData, config);
  },
  

  updateDepartments(departmentData) {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.post(`users/${departmentData.user_id}/assign-departments`, departmentData, config);
  },

  unassignDepartment(departmentData) {
    console.log("departmentData", departmentData);
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.post(`/unassign-department/${departmentData.user_id}`, departmentData, config);
  },  

  assignManager(managerData) {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.put(`department/assign-manager`, managerData, config);
  },
  // end department---------------------------------------------------

  // start permations--------------------
  getPermissions() {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.get("/permissions", config);
  },

  // end permations----------------

  // start roles----------------------------------------------------------------------

  getRoles() {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.get("/roles", config);
  },
  addRole(roleData) {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.post("/roles", roleData, config);
  },

  addRoleWithPermissions(roleData) {
    console.log("roleDataapi", roleData);
const token = localStorage.getItem("token");
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};


    // إرسال البيانات إلى API
    return apiClient.post("/roles/assign-permissions", roleData, config);
  },

  updateRolesWithPermissions(roleData) {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.put(`/roles/${roleData.id}`, roleData, config);
  },


  updateRoles(roleData) {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.post(`users/assign-role`, roleData, config);
  },

  deleteRole(roleId) {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.delete(`/roles/${roleId}`, config);
  },

  unassignRole(roleData) {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.post(`/unassign-role`, roleData, config);
  },

  getselectedRole(roleId) {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.get(`/roles/${roleId}`, config);
  },

  // end roles----------------

  // srart projects--------------------------------------------------------------------
  getProjects() {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return apiClient.get("/projects", config);
  },

  //end projects

  //end

  // PUT: تحديث بيانات موجودة
  updateUser(userId, updatedData) {
    return apiClient.put(`/starts/${userId}`, updatedData);
  },

  updateRole(userId, updatedData) {
    return apiClient.put(`/starts/${userId}`, updatedData);
  },

  // DELETE: حذف مستخدم


  sendResetPassword(email) {
    console.log("Email to reset password:", email);
    return apiClient.post(`/forgot-password?email=${email}`);
  },

  getRols() {
    return apiClient.get("/rols").then((response) => {
      console.log("Roles from API:", response.data); // تحقق من البيانات
      return response;
    });
  },

  getPermissionsByRole(role) {
    return apiClient.get(`/perms?role=${role}`);
  },
  addPermassion(permissionsData) {
    console.log("permissionsData", permissionsData);

    // إرسال البيانات إلى مسار الـ API الخاص بالصلاحيات في Strapi
    return apiClient.post("/perms", {
      data: {
        ...permissionsData, // الصلاحيات بوصفها Boolean مع companyId
      },
    });
  },

  getPositions() {
    return apiClient.get("/positions").then((response) => {
      console.log("Positions from API:", response.data); // Verify the data
      return response;
    });
  },
  addProject(projectData) {
    console.log("Adding project:", projectData);
    return apiClient.post("/projects", {
      data: {
        neme: projectData.neme,
        companyID: projectData.companyId,
        createdOwner: projectData.createdOwner,
      },
    }); // تأكد من أن الـ API يتوقع البيانات بهذا الشكل
  },

  updateProject(project) {
    return apiClient.put(`/projects/${project.id}`, {
      data: { neme: project.neme },
    });
  },
  deleteProject(projectId) {
    return apiClient.delete(`/projects/${projectId}`);
  },
};
