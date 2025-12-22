<script setup>
defineProps({
  color: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "md",
  },
  variant: {
    type: String,
    default: "fill",
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
});
const getClasses = (variant, color, size, fullWidth, active) => {
  let colorValue, sizeValue, fullWidthValue, activeValue;

  // Setting the button variant and color
  if (variant === "gradient") {
    colorValue = `bg-gradient-${color}`;
  } else if (variant === "outline") {
    colorValue = `btn-outline-${color}`;
  } else {
    colorValue = `btn-${color}`;
  }

  sizeValue = size ? `btn-${size}` : null;

  fullWidthValue = fullWidth ? `w-100` : null;

  activeValue = active ? `active` : null;

  return `${colorValue} ${sizeValue} ${fullWidthValue} ${activeValue}`;
};
</script>
<template>
  <button
    class="btn mb-0"
    :class="getClasses(variant, color, size, fullWidth, active)"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  background-color: #fff;
  color: #A8CB59;
  outline: 1px solid #A8CB59;
}

.btn:active {
  background-color: #a9ca5c;
  color: #fff;
}

.btn:focus {
  background-color: #a9ca5c;
  color: #fff;
}

.btn:hover {
  background-color: #a9ca5c;
  color: #fff;
}
</style>

<style>
/* Dark mode support for ArgonButton */
.dark-version button.btn.mb-0.btn-secondary,
.dark-version button.btn.mb-0 {
  background-color: rgba(144, 177, 64, 0.15) !important;
  /* color: rgba(144, 177, 64, 1) !important; */
  outline-color: rgba(144, 177, 64, 0.5) !important;
  border-color: rgba(144, 177, 64, 0.5) !important;
}

.dark-version button.btn.mb-0.btn-secondary:hover,
.dark-version button.btn.mb-0.btn-secondary:focus,
.dark-version button.btn.mb-0.btn-secondary:active,
.dark-version button.btn.mb-0:hover,
.dark-version button.btn.mb-0:focus,
.dark-version button.btn.mb-0:active {
  background-color: rgba(144, 177, 64, 0.9) !important;
  color: rgba(255, 255, 255, 1) !important;
  outline-color: rgba(144, 177, 64, 1) !important;
  border-color: rgba(144, 177, 64, 1) !important;
}

.dark-version button.btn.mb-0.btn-secondary .material-symbols-rounded,
.dark-version button.btn.mb-0.btn-secondary span {
  color: inherit !important;
}
</style>
