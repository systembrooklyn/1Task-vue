//ArgonMultipleSelect.vue

<template>
    <div class="form-group">
      <!-- Display selected values -->
      <div v-if="internalModelValue.length" class="selected-options">
        <span v-for="(selected, index) in internalModelValue" :key="selected" class="selected-option">
          {{ internalModelNames[index] ? `${internalModelNames[index]} ` : selected }}
          <button type="button" class="btn-remove" @click="removeOption(selected)">
            ×
          </button>
        </span>
      </div>
  
      <!-- Custom Select Trigger -->
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
          {{ placeholder }}
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
          <div class="options-container py-1">
            <div
              v-for="(option, index) in filteredOptions"
              :key="index"
              class="custom-select-option px-3 py-2"
              role="option"
              :aria-selected="internalModelValue.includes(option.value)"
              @click="handleSelectOption(option)"
              tabindex="0"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, defineProps, defineEmits, computed } from "vue";
  
  const emit = defineEmits(["update:modelValue", "update:modelNames"]);
  
  const props = defineProps({
    size: {
      type: String,
      default: "default",
    },
    success: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      default: "",
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    modelNames: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: "",
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => [],
    },
    searchable: {
      type: Boolean,
      default: false,
    },
    searchPlaceholder: {
      type: String,
      default: "Search...",
    },
  });
  
  // Local variables
  const internalModelValue = ref([...props.modelValue]);
  const internalModelNames = ref([...props.modelNames]);
  
  const isDropdownOpen = ref(false);
  const searchQuery = ref("");
  const dropdownId = ref(`multi-select-dropdown-${Math.random().toString(36).substr(2, 9)}`);
  
  // Watchers for prop changes
  watch(() => props.modelValue, (newVal) => {
    internalModelValue.value = [...newVal];
  });
  
  watch(() => props.modelNames, (newVal) => {
    internalModelNames.value = [...newVal];
  });
  
  const controlClasses = computed(() => [
    props.size ? `form-control-${props.size}` : "",
    { "is-valid": props.success, "is-invalid": props.error },
  ]);
  
  const filteredOptions = computed(() => {
    if (!props.searchable || !searchQuery.value.trim()) {
      return props.options;
    }
    const query = searchQuery.value.toLowerCase();
    return props.options.filter((option) =>
      option.label?.toLowerCase().includes(query)
    );
  });
  
  function toggleDropdown() {
    isDropdownOpen.value = !isDropdownOpen.value;
    if (!isDropdownOpen.value) {
      searchQuery.value = "";
    }
  }
  
  function handleSelectOption(option) {
    const selectedValue = option.value;
    const selectedText = option.label;
  
    if (!internalModelValue.value.includes(selectedValue)) {
      internalModelValue.value.push(selectedValue);
      internalModelNames.value.push(selectedText);
      emit("update:modelValue", internalModelValue.value);
      emit("update:modelNames", internalModelNames.value);
    }
  
    isDropdownOpen.value = false;
  }
  
  function removeOption(optionToRemove) {
    const index = internalModelValue.value.indexOf(optionToRemove);
    if (index !== -1) {
      internalModelValue.value.splice(index, 1);
      internalModelNames.value.splice(index, 1);
      emit("update:modelValue", internalModelValue.value);
      emit("update:modelNames", internalModelNames.value);
    }
  }
  </script>

<style scoped>
.selected-options {
    margin-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.selected-option {
    display: inline-flex;
    align-items: center;
    background-color: #f1f1f1;
    padding: 5px 10px;
    border-radius: 5px;
    position: relative;
}

.btn-remove {
    margin-left: 10px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: red;
}

.btn-remove:hover {
    color: darkred;
}

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

.custom-select-option:hover,
.custom-select-option:focus {
  background-color: #f1f1f1;
  outline: none;
}

.custom-select-dropdown .form-control-sm {
  width: 100%;
  margin: 0;
  border-radius: 4px;
  padding: 6px 8px;
}
</style>
