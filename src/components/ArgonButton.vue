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
