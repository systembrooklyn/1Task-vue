// src/composables/useCompanyConfig.js
// Composable for accessing company configuration throughout the app

import { computed } from "vue";
import { useStore } from "vuex";

export function useCompanyConfig() {
  const store = useStore();

  // Getters
  const companyLogo = computed(() => store.getters["company/companyLogo"]);
  const companyName = computed(() => store.getters["company/companyName"]);
  const companyId = computed(() => store.getters["company/companyId"]);
  const companyEmail = computed(() => store.getters["company/companyEmail"]);
  const hasLogo = computed(() => store.getters["company/hasLogo"]);
  const logoUrl = computed(() => store.getters["company/logoUrl"]);
  const navbarSettings = computed(
    () => store.getters["company/navbarSettings"]
  );
  const sidebarSettings = computed(
    () => store.getters["company/sidebarSettings"]
  );
  const companyColors = computed(() => store.getters["company/companyColors"]);
  const logoSettings = computed(() => store.getters["company/logoSettings"]);
  const hasCompanyData = computed(
    () => store.getters["company/hasCompanyData"]
  );

  // Actions
  const fetchCompanyData = () => store.dispatch("company/fetchCompanyData");
  const updateNavbarSettings = (settings) =>
    store.dispatch("company/updateNavbarSettings", settings);
  const updateSidebarSettings = (settings) =>
    store.dispatch("company/updateSidebarSettings", settings);

  return {
    // State
    companyLogo,
    companyName,
    companyId,
    companyEmail,
    hasLogo,
    logoUrl,
    navbarSettings,
    sidebarSettings,
    companyColors,
    logoSettings,
    hasCompanyData,

    // Actions
    fetchCompanyData,
    updateNavbarSettings,
    updateSidebarSettings,
  };
}
