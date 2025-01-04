<script setup>
import { ref, computed, onBeforeMount, onBeforeUnmount, watch } from "vue";
import { useStore } from "vuex";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";
import LanguageSwitcher from "@/views/components/LanguageSwitcher.vue";
import roleTable from "./components/roleTable.vue";
import {
  savePermissionsToLocalStorage,
  extractPermissionsFromAPI,
  loadPermissionsFromLocalStorage,
  hasPermission,
} from "@/utils/permissions.js";

const store = useStore();

const roleName = ref("");
const showAlert = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showSuccess = ref(false);
const showAccordion = ref(false);
const selectedPermissions = ref([]);
const permissionsList = ref([]);
const showError = ref(false);
const rolesList = ref([]);
const componentKey = ref(0);
const userData = computed(() => store.getters.user);
const isOwner = computed(() => store.getters.isOwner);
const isLoadingData = ref(false);

// استدعاء الصلاحيات من localStorage بناءً على المستخدم الحالي
const permissions = ref(
  loadPermissionsFromLocalStorage(userData.value?.id) || {}
);

console.log( permissions.value);

// عند تحميل الصفحة لأول مرة، حفظ الصلاحيات في localStorage
onBeforeMount(() => {
  if (!permissions.value || Object.keys(permissions.value).length === 0) {
    const extractedPermissions = extractPermissionsFromAPI(userData.value?.roles);
    permissions.value = extractedPermissions;
    savePermissionsToLocalStorage(permissions.value, userData.value?.id);
  }
});

// استخدام الصلاحيات للتحكم في ظهور الأزرار
const canAddRole = computed(() => hasPermission(permissions.value, "create-role"));
// const canDeleteRole = computed(() => hasPermission(permissions.value, "delete-role"));
// const canEditRole = computed(() => hasPermission(permissions.value, "edit-role"));


const translations = {
  en: {
    addRole: "Add Role & Permissions",
    role: "Role",
    addPermission: "Add Permissions",
    emailExistsError:
      "This email is already registered. Please use another email.",
    generalError: "An error occurred while submitting. Please try again later.",
    roleRepeated: "Role already exists.",
    permissionAdded: "Permission added successfully.",
    submit: "Submit",
    savePermissions: "Save Permissions",
    roleSaved: "Role and permissions saved successfully!",
    permaissionIsRequired: "Permission is required",
  },
  ar: {
    addRole: "إضافة الأدوار و الأذونات",
    role: "الدور",
    addPermission: "إضافة أذونات",
    emailExistsError:
      "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد آخر.",
    generalError: "حدث خطأ أثناء التسجيل. حاول مرة أخرى لاحقًا.",
    roleRepeated: "الدور موجود بالفعل.",
    permissionAdded: "تمت إضافة الأذونات بنجاح.",
    submit: "إرسال",
    savePermissions: "حفظ الأذونات",
    roleSaved: "تم حفظ الدور والأذونات بنجاح!",
    permaissionIsRequired: "الأذونات مطلوبة",
  },
};

const currentLanguage = computed(() => store.getters.currentLanguage);
const t = (key) => translations[currentLanguage.value][key];

const toggleAccordion = () => {
  showAccordion.value = !showAccordion.value;
};

const fetchPermissions = async () => {
  try {
    const response = await store.dispatch("fetchPermissions");
    if (response.status === 200) {
      permissionsList.value = response.data;
    } else {
      errorMessage.value = t("generalError");
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 3000);
    }
  } catch (error) {
    console.error("Error fetching permissions:", error);
    errorMessage.value = t("generalError");
    showAlert.value = true;
  }
};

const fetchRoles = async () => {
  try {
    const response = await store.dispatch("fetchRoles");
    if (response.status === 200) {
      rolesList.value = response.data;
      console.log("rolesList.value", rolesList.value);
    } else {
      errorMessage.value = t("generalError");
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 3000);
    }
  } catch (error) {
    console.error("Error fetching permissions:", error);
    errorMessage.value = t("generalError");
    showAlert.value = true;
  }
};

const submitRoleAndPermissions = async () => {
  isLoadingData.value = true;
  try {
    const roleData = {
      name: roleName.value,
    };

    const response = await store.dispatch("addRole", roleData);
    if (response.status === 201) {
      const selectedPermissionIds = [];
      permissionsList.value.forEach((permission) => {
        if (selectedPermissions.value.includes(permission)) {
          console.log("permission", permission);
          selectedPermissionIds.push(permission.id);
        }
      });

      // if (selectedPermissions.value = []) {
      // errorMessage.value = t("permaissionIsRequired");
      // showError.value = true;
      // setTimeout(() => {
      //   showError.value = false;
      // }, 3000);
      // return;
      // }

      const permissionsAndRoleData = {
        role_id: response.data.role.id,
        permissions: selectedPermissionIds,
      };

      console.log("permissionsData", permissionsAndRoleData);

      const savedPermissionsResponse = await store.dispatch(
        "addRoleWithPermissions",
        permissionsAndRoleData
      );

      if (savedPermissionsResponse.status === 200) {
        showSuccess.value = true;
        successMessage.value = t("roleSaved");
        setTimeout(() => {
          showSuccess.value = false;
        }, 3000);
        roleName.value = "";
        

        // بعد الإضافة الناجحة، قم بجلب الأدوار مرة أخرى لتحديث الجدول
        await fetchRoles();
        componentKey.value += 1;
      } else {
        errorMessage.value = t("generalError");
        showError.value = true;
        setTimeout(() => {
          showError.value = false;
        }, 3000);
      }

      isLoadingData.value = false;
    
    } else {
      errorMessage.value = t("roleRepeated");
      showError.value = true;
      setTimeout(() => {
        showError.value = false;
      }, 3000);
      isLoadingData.value = false;

      return;
    }
  } catch (error) {
    console.error("Error submitting role and permissions:", error);
    errorMessage.value = t("generalError");
    showAlert.value = true;
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
    isLoadingData.value = false;
  }
};

onBeforeMount(async () => {
  const body = document.getElementsByTagName("body")[0];
  body.classList.remove("bg-gray-100");

  const isRTL = store.getters.currentLanguage === "ar";
  document.querySelector("html").setAttribute("lang", store.getters.currentLanguage);
  document.querySelector("html").setAttribute("dir", isRTL ? "rtl" : "ltr");
  document.querySelector("#app").classList.toggle("rtl", isRTL);

  await fetchPermissions();
  await fetchRoles();
});

watch(
  () => store.getters.roles,
  (newData) => {
    rolesList.value = newData;
    componentKey.value += 1; // إعادة تحميل المكون عند حدوث أي تحديث في البيانات
  }
);

onBeforeUnmount(() => {
  const body = document.getElementsByTagName("body")[0];
  body.classList.add("bg-gray-100");
});
</script>

<template>
  <LanguageSwitcher />
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header pb-0">
            <h5 class="mb-0 text-primary">{{ t("addRole") }} </h5>
          </div>
          <div v-show="canAddRole || isOwner" class="card-body">
            <form @submit.prevent class="mt-2">
              <div class="mb-3">
                <label for="role-input" class="form-label">{{ t("role") }}</label>
                <argon-input
                  id="role-input"
                  v-model="roleName"
                  :placeholder="t('role')"
                  class="form-control"
                  required
                />
              </div>

              <argon-button
                class="mt-3"
                variant="gradient"
                color="info"
                size="sm"
                @click="toggleAccordion"
              >
                {{ t("addPermission") }}
              </argon-button>

              <div v-if="showAccordion" class="mt-3 card card-body border shadow-sm">
                <h6 class="text-secondary">{{ t("addPermission") }}</h6>
                <hr />
                <div class="d-flex flex-wrap">
                  <div
                    v-for="permission in permissionsList"
                    :key="permission"
                    class="form-check me-4 mb-2"
                    style="min-width: 150px;"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="permission"
                      :value="permission"
                      v-model="selectedPermissions"
                      required
                    />
                    <label class="form-check-label ms-1" :for="permission">
                      {{ permission.name }}
                    </label>
                  </div>
                </div>
              </div>

              <div class="mt-4 d-flex align-items-center">
                <argon-button
                  variant="gradient"
                  color="success"
                  size="sm"
                  type="submit"
                  @click="submitRoleAndPermissions"
                >
                  {{ t("savePermissions") }}
                </argon-button>
              </div>

              <div class="mt-3">
                <argon-alert
                  v-if="showAlert"
                  color="danger"
                  dismissible
                  class="my-2"
                >
                  {{ errorMessage }}
                </argon-alert>

                <argon-alert
                  v-if="showSuccess"
                  color="success"
                  dismissible
                  class="my-2"
                >
                  {{ successMessage }}
                </argon-alert>
              </div>
            </form>
          </div>
          <div v-if="isLoadingData" class="d-flex justify-content-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            </div>
          <!-- عند تحديث rolesList سيعاد تحميل الجدول -->
          <div  v-else class="col-md-6 col-sm-12 col-lg-12">
            <roleTable :rolesList="rolesList" :permissionsList="permissionsList" :key="componentKey" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 10px;
}
.form-check-input {
  cursor: pointer;
}
.form-check-label {
  cursor: pointer;
}
</style>
