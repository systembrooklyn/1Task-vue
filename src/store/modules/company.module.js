// src/store/modules/company.module.js
// Company Store Module - Handles all company-related data

import { companyConfig } from "@/config/company.config.js";
import { encryptData, decryptData } from "../index.js";

export default {
  namespaced: true,

  state: {
    // Company basic info
    id: null,
    name: "",
    email: "",
    logo: null,
    slogan: null,
    website: null,

    // Logo settings
    logoSettings: { ...companyConfig.defaults.logoSettings },

    // Company colors
    colors: { ...companyConfig.defaults.colors },

    // Component-specific settings
    navbarSettings: { ...companyConfig.navbar },
    sidebarSettings: { ...companyConfig.sidebar },

    // Loading state
    isLoading: false,

    // Cache timestamp
    lastUpdated: null,
  },

  mutations: {
    SET_COMPANY_ID(state, id) {
      state.id = id;
      if (id) {
        localStorage.setItem("companyId", encryptData(id));
      }
    },

    SET_COMPANY_NAME(state, name) {
      state.name = name;
      if (name) {
        localStorage.setItem("companyName", encryptData(name));
      }
    },

    SET_COMPANY_EMAIL(state, email) {
      state.email = email;
    },

    SET_COMPANY_LOGO(state, logo) {
      state.logo = logo;
      if (logo) {
        localStorage.setItem("companyLogo", encryptData(logo));
      }
    },

    SET_COMPANY_DATA(state, data) {
      // Update all company data at once
      if (data.id !== undefined) state.id = data.id;
      if (data.name !== undefined) state.name = data.name;
      if (data.email !== undefined) state.email = data.email;
      if (data.logo !== undefined) state.logo = data.logo;
      if (data.slogan !== undefined) state.slogan = data.slogan;
      if (data.website !== undefined) state.website = data.website;
      if (data.colors) {
        state.colors = { ...state.colors, ...data.colors };
      }

      state.lastUpdated = new Date().toISOString();

      // Save to localStorage
      const companyData = {
        id: state.id,
        name: state.name,
        logo: state.logo,
        slogan: state.slogan,
        website: state.website,
        colors: state.colors,
      };
      localStorage.setItem("companyData", encryptData(companyData));
    },

    SET_NAVBAR_SETTINGS(state, settings) {
      state.navbarSettings = { ...state.navbarSettings, ...settings };
    },

    SET_SIDEBAR_SETTINGS(state, settings) {
      state.sidebarSettings = { ...state.sidebarSettings, ...settings };
    },

    SET_LOADING(state, loading) {
      state.isLoading = loading;
    },

    // Load from localStorage
    LOAD_FROM_STORAGE(state) {
      const stored = localStorage.getItem("companyData");
      if (stored) {
        try {
          const data = decryptData(stored);
          if (data) {
            state.id = data.id || state.id;
            state.name = data.name || state.name;
            state.logo = data.logo || state.logo;
            state.slogan = data.slogan || state.slogan;
            state.website = data.website || state.website;
            if (data.colors) {
              state.colors = { ...state.colors, ...data.colors };
            }
          }
        } catch (e) {
          console.warn("Failed to load company data from storage:", e);
        }
      }

      // Load logo separately if exists
      const storedLogo = localStorage.getItem("companyLogo");
      if (storedLogo) {
        try {
          state.logo = decryptData(storedLogo);
        } catch (e) {
          console.warn("Failed to load company logo:", e);
        }
      }
    },

    CLEAR_COMPANY_DATA(state) {
      state.id = null;
      state.name = "";
      state.email = "";
      state.logo = null;
      state.slogan = null;
      state.website = null;
      state.colors = { ...companyConfig.defaults.colors };
      state.lastUpdated = null;

      localStorage.removeItem("companyData");
      localStorage.removeItem("companyLogo");
    },
  },

  actions: {
    async fetchCompanyData({ commit, state }) {
      // Check if we need to fetch (avoid unnecessary calls)
      const now = new Date().getTime();
      const lastUpdate = state.lastUpdated
        ? new Date(state.lastUpdated).getTime()
        : 0;
      const cacheTime = 5 * 60 * 1000; // 5 minutes cache

      if (lastUpdate && now - lastUpdate < cacheTime) {
        return; // Use cached data
      }

      commit("SET_LOADING", true);

      try {
        // TODO: استبدل هذا بـ API call الفعلي عندما يكون الـ endpoint جاهز
        // const response = await apiClient.getCompanyData()
        // const data = response.data.data

        // For now, we'll use existing company data from store
        const existingCompanyId =
          state.id || localStorage.getItem("companyId1");
        const existingCompanyName =
          state.name || localStorage.getItem("companyName");

        if (existingCompanyName) {
          const data = {
            id: existingCompanyId,
            name: existingCompanyName,
            logo: state.logo, // Keep existing logo if exists
          };

          commit("SET_COMPANY_DATA", data);
          commit("SET_LOADING", false);

          return { data };
        }

        commit("SET_LOADING", false);
        return null;
      } catch (error) {
        console.error("Error fetching company data:", error);
        commit("SET_LOADING", false);
        throw error;
      }
    },

    updateNavbarSettings({ commit }, settings) {
      commit("SET_NAVBAR_SETTINGS", settings);
    },

    updateSidebarSettings({ commit }, settings) {
      commit("SET_SIDEBAR_SETTINGS", settings);
    },
  },

  getters: {
    companyLogo: (state) => state.logo,
    companyName: (state) => state.name,
    companyId: (state) => state.id,
    companyEmail: (state) => state.email,

    navbarSettings: (state) => state.navbarSettings,
    sidebarSettings: (state) => state.sidebarSettings,
    logoSettings: (state) => state.logoSettings,
    companyColors: (state) => state.colors,

    hasLogo: (state) => !!state.logo,
    hasCompanyData: (state) => !!state.name,

    // Computed logo URL with fallback
    logoUrl: (state) => {
      if (state.logo) return state.logo;
      // يمكن إضافة default logo path
      return null;
    },
  },
};
