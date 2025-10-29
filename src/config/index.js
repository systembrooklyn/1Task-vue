// src/config/index.js
// Main Configuration File - Aggregates all configs

import { companyConfig } from "./company.config.js";
import { responsiveConfig } from "./responsive.config.js";

export const appConfig = {
  company: companyConfig,
  responsive: responsiveConfig,

  // App-wide settings
  app: {
    name: "1Task",
    version: "1.0.0",
    defaultLanguage: "en",
    supportedLanguages: ["en", "ar"],
  },
};

export default appConfig;
