// src/components

<script setup>
import { computed } from 'vue';

const emit = defineEmits(["update:modelValue"]);

const inputGroupClasses = computed(() => ({
  'input-group': props.icon || props.modelValue, // Add modelValue condition
  'input-group-merge': props.icon,
  [`input-group-${props.iconDir}`]: props.iconDir,
  'has-clear-btn': !!props.modelValue // Add class when clear button is visible
}));

const props = defineProps({
  size: {
    type: String,
    default: null,
    validator: (value) => ['sm', 'lg', null].includes(value)
  },
  success: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ""
  },
  iconDir: {
    type: String,
    default: "left",
    validator: (value) => ['left', 'right', ''].includes(value)
  },
  name: {
    type: String,
    default: ""
  },
  id: {
    type: String,
    default: ""
  },
  modelValue: {
    type: [String, Number],
    default: ""
  },
  placeholder: {
    type: String,
    default: "Select an option"
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array,
    default: () => []
  },
  errorMessage: {
    type: String,
    default: ""
  }
});

const controlClasses = computed(() => {
  return [
    props.size ? `form-control-${props.size}` : '',
    {
      'is-valid': props.success,
      'is-invalid': props.error
    }
  ];
});

// const inputGroupClasses = computed(() => ({
//   'input-group': props.icon,
//   'input-group-merge': props.icon, // For better icon integration
//   [`input-group-${props.iconDir}`]: props.iconDir
// }));
</script>

<template>
    <label v-if="$slots.label" class="form-label">
      <slot name="label" />
      <span v-if="isRequired" class="text-danger">*</span>
    </label>

    <div :class="inputGroupClasses">
      <span 
        v-if="props.icon && props.iconDir === 'left'" 
        class="input-group-text"
        :class="{ 'pe-0': props.iconDir === 'left' }"
      >
        <i :class="props.icon" class="fas" aria-hidden="true"></i>
      </span>

      <select
        :id="props.id"
        class="form-control"
        :class="controlClasses"
        :name="props.name"
        :value="props.modelValue"
        :required="props.isRequired"
        :aria-invalid="error"
        :aria-describedby="error ? `${props.id}-feedback` : null"
        @change="emit('update:modelValue', $event.target.value)"
      >
        <option disabled value="">{{ props.placeholder }}</option>
        <option
          v-for="(option, index) in props.options"
          :key="index"
          :value="option.value"
          :selected="option.value === props.modelValue"
        >
          {{ option.label }}
        </option>
      </select>

  <!-- Clear button -->
  <span 
    v-if="props.modelValue" 
    class="input-group-text clear-btn"
    @click="emit('update:modelValue', '')"
  >
    <i class="fas fa-times"></i>
  </span>

      <span 
        v-if="props.icon && props.iconDir === 'right'" 
        class="input-group-text"
        :class="{ 'ps-0': props.iconDir === 'right' }"
      >
        <i :class="props.icon" class="fas" aria-hidden="true"></i>
      </span>

      <div 
        v-if="props.error && props.errorMessage" 
        :id="`${props.id}-feedback`" 
        class="invalid-feedback"
      >
        {{ props.errorMessage }}
      </div>
    </div>
</template>

<style scoped>
.input-group-merge .input-group-text {
  z-index: 5; /* Ensure icons stay above form control */
}
.form-control:focus {
  box-shadow: none; /* Use Bootstrap's focus state instead */
}
/* Add padding to the select input when the clear button is present */
.input-group.has-clear-btn .form-control {
  padding-right: 2.5rem;
}

/* Position the clear button absolutely within the input group */
.clear-btn {
  position: absolute;
  right: 0.8rem; /* Adjust as needed */
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
  z-index: 10; 
}

/* Adjust position if there's a right icon */
.input-group.input-group-right.has-clear-btn .clear-btn {
  right: 2.5rem; 
}
</style>