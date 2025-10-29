// src/composables/useResponsive.js
// Composable for responsive breakpoints and screen size detection

import { ref, computed, onMounted, onUnmounted } from "vue";
import { responsiveConfig } from "@/config/responsive.config.js";

export function useResponsive() {
  const windowWidth = ref(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const updateWidth = () => {
    if (typeof window !== "undefined") {
      windowWidth.value = window.innerWidth;
    }
  };

  onMounted(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateWidth);
      updateWidth();
    }
  });

  onUnmounted(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", updateWidth);
    }
  });

  // Breakpoint checks
  const isXs = computed(
    () => windowWidth.value < responsiveConfig.breakpoints.sm
  );
  const isSm = computed(
    () =>
      windowWidth.value >= responsiveConfig.breakpoints.sm &&
      windowWidth.value < responsiveConfig.breakpoints.md
  );
  const isMd = computed(
    () =>
      windowWidth.value >= responsiveConfig.breakpoints.md &&
      windowWidth.value < responsiveConfig.breakpoints.lg
  );
  const isLg = computed(
    () =>
      windowWidth.value >= responsiveConfig.breakpoints.lg &&
      windowWidth.value < responsiveConfig.breakpoints.xl
  );
  const isXl = computed(
    () => windowWidth.value >= responsiveConfig.breakpoints.xl
  );

  // Device type
  const isMobile = computed(
    () => windowWidth.value <= responsiveConfig.mobile.maxWidth
  );
  const isTablet = computed(
    () =>
      windowWidth.value >= responsiveConfig.tablet.minWidth &&
      windowWidth.value <= responsiveConfig.tablet.maxWidth
  );
  const isDesktop = computed(
    () => windowWidth.value >= responsiveConfig.desktop.minWidth
  );

  // Current breakpoint name
  const currentBreakpoint = computed(() => {
    if (isXs.value) return "xs";
    if (isSm.value) return "sm";
    if (isMd.value) return "md";
    if (isLg.value) return "lg";
    return "xl";
  });

  return {
    windowWidth,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
  };
}
