// src/config/responsive.config.js
// Responsive Breakpoints Configuration

export const responsiveConfig = {
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
  },

  // Mobile-first settings
  mobile: {
    maxWidth: 767,
    navbar: {
      layout: "compact",
      showLogo: true,
      showUserInfo: true,
    },
  },

  // Tablet settings
  tablet: {
    minWidth: 768,
    maxWidth: 991,
    navbar: {
      layout: "standard",
      showLogo: true,
    },
  },

  // Desktop settings
  desktop: {
    minWidth: 992,
    navbar: {
      layout: "full",
      showLogo: true,
    },
  },
};
