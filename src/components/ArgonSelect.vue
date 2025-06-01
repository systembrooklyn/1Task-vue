//ArgonSelect.vue

<template>
  <label v-if="$slots.label" class="form-label">
    <slot name="label" />
    <span v-if="isRequired" class="text-danger">*</span>
  </label>

  <div :class="inputGroupClasses">
    <!-- Custom Dropdown Trigger -->
    <div class="custom-select-container position-relative">
      <div
        class="form-control"
        :class="controlClasses"
        @click="toggleDropdown"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="isDropdownOpen"
        :aria-controls="dropdownId"
      >
        {{ selectedLabel || placeholder }}
      </div>

      <!-- Dropdown Menu -->
      <div
        v-if="isDropdownOpen"
        class="custom-select-dropdown border rounded shadow-sm bg-white"
        :id="dropdownId"
        role="listbox"
      >
        <!-- Search Input Inside Dropdown -->
        <div class="px-2 pt-2 pb-1" v-if="searchable">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control form-control-sm"
            :placeholder="searchPlaceholder"
            @click.stop
            autofocus
          />
        </div>

        <!-- Options List -->
        <div class="options-container py-1" :class="{ 'pt-0': !searchable }">
          <div
            v-for="(option, index) in filteredOptions"
            :key="index"
            class="custom-select-option px-3 py-2"
            role="option"
            :aria-selected="option.value === modelValue"
            @click="selectOption(option)"
            @keydown.enter="selectOption(option)"
            tabindex="0"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Button -->
    <span
      v-if="modelValue"
      class="input-group-text clear-btn"
      @click="emit('update:modelValue', '')"
    >
      <i class="fas fa-times"></i>
    </span>

    <!-- Icon -->
    <span
      v-if="icon && iconDir === 'right'"
      class="input-group-text"
      :class="{ 'ps-0': iconDir === 'right' }"
    >
      <i :class="icon" class="fas" aria-hidden="true"></i>
    </span>

    <!-- Error Message -->
    <div
      v-if="error && errorMessage"
      :id="`${id}-feedback`"
      class="invalid-feedback"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// =========== PROPS ===========
const props = defineProps({
  size: { type: String, default: null, validator: (v) => ['sm', 'lg', null].includes(v) },
  success: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  icon: { type: String, default: "" },
  iconDir: { type: String, default: "left", validator: (v) => ['left', 'right', ''].includes(v) },
  name: { type: String, default: "" },
  id: { type: String, default: "" },
  modelValue: { type: [String, Number], default: "" },
  placeholder: { type: String, default: "Select an option" },
  isRequired: { type: Boolean, default: false },
  options: { type: Array, default: () => [] },
  errorMessage: { type: String, default: "" },
  searchable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: "Search..." }
});
// =========== END PROPS ===========

const emit = defineEmits(["update:modelValue"]);

// =========== INTERNAL STATE ===========
const isDropdownOpen = ref(false);
const searchQuery = ref('');
const selectedLabel = ref('');
const dropdownId = ref(`select-dropdown-${Math.random().toString(36).substr(2, 9)}`);
// =========== END INTERNAL STATE ===========

// =========== FILTERED OPTIONS ===========
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return props.options;
  }

  const query = searchQuery.value.toLowerCase();
  return props.options.filter(option => option.label?.toLowerCase().includes(query));
});
// =========== END FILTERED OPTIONS ===========

// =========== CLASSES ===========
const controlClasses = computed(() => [
  props.size ? `form-control-${props.size}` : '',
  { 'is-valid': props.success, 'is-invalid': props.error }
]);

const inputGroupClasses = computed(() => ({
  'input-group': props.icon || props.modelValue,
  'input-group-merge': props.icon,
  [`input-group-${props.iconDir}`]: props.iconDir,
  'has-clear-btn': !!props.modelValue
}));
// =========== END CLASSES ===========

// =========== WATCHERS ===========
watch(
  () => props.modelValue,
  (newVal) => {
    const selected = props.options.find(opt => opt.value === newVal);
    selectedLabel.value = selected?.label || '';
    searchQuery.value = '';
  },
  { immediate: true }
);
// =========== END WATCHERS ===========

// =========== METHODS ===========
function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (!isDropdownOpen.value) {
    searchQuery.value = '';
  }
}

function selectOption(option) {
  emit('update:modelValue', option.value);
  isDropdownOpen.value = false;
}
// =========== END METHODS ===========
</script>

<style scoped>
.custom-select-container {
  flex-grow: 1;
}

.custom-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  /* max-height: 200px; */
  overflow-y: auto;
}

.options-container {
  max-height: calc(200px - 38px);
  overflow-y: auto;
}

.options-container.pt-0 {
  /* max-height: calc(200px - 38px); */
  overflow-y: auto;
}

.custom-select-option:hover,
.custom-select-option:focus {
  background-color: #f1f1f1;
  outline: none;
}

.clear-btn {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
  z-index: 10;
}

.input-group.input-group-right.has-clear-btn .clear-btn {
  right: 2.5rem;
}
</style>