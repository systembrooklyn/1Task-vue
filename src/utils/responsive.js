// src/utils/responsive.js
// Utility functions for responsive design

import { responsiveConfig } from "@/config/responsive.config.js";

/**
 * Get responsive class based on breakpoint
 * @param {string} baseClass - Base class name
 * @param {string} breakpoint - Breakpoint name (xs, sm, md, lg, xl)
 * @returns {string} Responsive class
 */
export function getResponsiveClass(baseClass, breakpoint = "md") {
  const prefix =
    {
      xs: "col-xs",
      sm: "col-sm",
      md: "col-md",
      lg: "col-lg",
      xl: "col-xl",
    }[breakpoint] || "col-md";

  return `${prefix}-${baseClass}`;
}

/**
 * Check if current width matches breakpoint
 * @param {number} width - Current window width
 * @param {string} breakpoint - Breakpoint name
 * @returns {boolean}
 */
export function matchesBreakpoint(width, breakpoint) {
  const bp = responsiveConfig.breakpoints[breakpoint];
  if (bp === undefined) return false;

  const breakpointKeys = Object.keys(responsiveConfig.breakpoints);
  const currentIndex = breakpointKeys.indexOf(breakpoint);

  if (currentIndex === -1 || currentIndex === breakpointKeys.length - 1) {
    return width >= bp;
  }

  const nextBp = responsiveConfig.breakpoints[breakpointKeys[currentIndex + 1]];

  return width >= bp && width < nextBp;
}
