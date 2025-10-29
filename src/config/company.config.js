// src/config/company.config.js
// Company Branding Configuration

export const companyConfig = {
  // Default values
  defaults: {
    logo: null, // سيتم جلبها من API
    name: "",
    slogan: "",
    website: "",

    // Logo settings
    logoSettings: {
      show: true,
      position: "left", // 'left' | 'center' | 'right'
      maxHeight: "40px",
      maxWidth: "120px",
      mobileMaxHeight: "32px",
      mobileMaxWidth: "100px",
    },

    // Company colors (يمكن استخدامها مستقبلاً)
    colors: {
      primary: "#A5C958",
      secondary: "#8fb647",
      accent: null,
    },
  },

  // Navbar specific settings
  navbar: {
    showLogo: true,
    showCompanyName: false,
    logoPosition: "left",
    mobileLayout: "compact", // 'compact' | 'expanded'
    showUserInfo: true,
  },

  // Sidebar specific settings
  sidebar: {
    showLogo: true,
    logoPosition: "top",
  },
};
