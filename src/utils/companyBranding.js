// src/utils/companyBranding.js
// Utility functions for company branding

/**
 * Get company logo with fallback
 * @param {string|null} logo - Logo URL
 * @param {string|null} fallback - Fallback logo URL
 * @returns {string|null}
 */
export function getCompanyLogo(logo, fallback = null) {
  if (logo) return logo;

  // يمكن إضافة default logo path
  return fallback || null;
}

/**
 * Get company logo styles based on settings and device type
 * @param {Object} settings - Logo settings object
 * @param {boolean} isMobile - Whether current device is mobile
 * @returns {Object} Style object for logo
 */
export function getLogoStyles(settings, isMobile = false) {
  const maxHeight = isMobile
    ? settings.mobileMaxHeight || settings.maxHeight || "32px"
    : settings.maxHeight || "40px";

  const maxWidth = isMobile
    ? settings.mobileMaxWidth || settings.maxWidth || "100px"
    : settings.maxWidth || "120px";

  return {
    maxHeight,
    maxWidth,
    objectFit: "contain",
    height: "auto",
    width: "auto",
  };
}

/**
 * Format company name for display (truncate if too long)
 * @param {string} name - Company name
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string}
 */
export function formatCompanyName(name, maxLength = 20) {
  if (!name) return "";

  if (name.length <= maxLength) return name;

  return name.substring(0, maxLength - 3) + "...";
}
