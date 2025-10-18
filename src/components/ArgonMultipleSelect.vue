//ArgonMultipleSelect.vue

<template>
  <div class="form-group">
    <!-- Display selected values -->
    <div v-if="internalModelValue.length" class="selected-options">
      <span v-for="(selected, index) in internalModelValue" :key="selected" class="selected-option">
        {{ getDisplayName(selected, index) }}
        <button type="button" class="btn-remove" @click="removeOption(selected)">
          ×
        </button>
      </span>
    </div>

    <!-- Custom Select Trigger -->
    <div class="custom-select-container position-relative">
      <div ref="triggerEl" class="form-control" :class="controlClasses" @click="toggleDropdown" role="combobox"
        aria-haspopup="listbox" :aria-expanded="isDropdownOpen" :aria-controls="dropdownId">
        {{ placeholder }}
      </div>
    </div>
  </div>

  <!-- Dropdown Menu (Teleported to body) -->
  <teleport to="body" v-if="isDropdownOpen">
    <div class="custom-select-dropdown border rounded shadow-sm bg-white" :class="{ 'dropdown-up': shouldOpenUp }"
      :id="dropdownId" :style="teleportStyle" role="listbox">
      <!-- Search Input Inside Dropdown -->
      <div class="px-2 pt-2 pb-1" v-if="searchable">
        <input v-model="searchQuery" type="text" class="form-control form-control-sm" :placeholder="searchPlaceholder"
          @click.stop autofocus />
      </div>

      <!-- Options List -->
      <div class="options-container py-1">
        <div v-for="(option, index) in filteredOptions" :key="index" class="custom-select-option px-3 py-2"
          role="option" :aria-selected="internalModelValue.includes(option.value)" @click="handleSelectOption(option)"
          tabindex="0">
          {{ option.label }}
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed, onMounted, onUnmounted, nextTick } from "vue";

const emit = defineEmits(["update:modelValue", "update:modelNames"]);

// =========== GLOBAL DROPDOWN MANAGEMENT ===========
// Global state to track which dropdown is currently open
if (!window.__argonMultiSelectOpenDropdown) {
  window.__argonMultiSelectOpenDropdown = null;
}

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
const componentId = ref(`argon-multi-select-${Math.random().toString(36).substr(2, 9)}`);
const shouldOpenUp = ref(false);
const triggerEl = ref(null);
const teleportStyle = ref({});

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

// دالة للحصول على الاسم المناسب للعرض
const getDisplayName = (selectedValue, index) => {
  // إذا كان الاسم موجود في modelNames، استخدمه
  if (internalModelNames.value[index]) {
    return internalModelNames.value[index];
  }

  // إذا لم يكن موجود، ابحث عنه في options
  const option = props.options.find(opt =>
    opt.value == selectedValue ||
    opt.value === parseInt(selectedValue) ||
    opt.value === String(selectedValue)
  );

  return option ? option.label : selectedValue;
};

// =========== DROPDOWN MANAGEMENT METHODS ===========
function positionDropdown() {
  if (!triggerEl.value) return;

  const rect = triggerEl.value.getBoundingClientRect();
  const dropdownHeight = 300; // Max height of dropdown

  // ============ NEW Z-INDEX LOGIC ============
  // لو هناك مودال مفتوح سنجعل القائمة تعلوه
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalBaseZ = modalOverlay ? +(getComputedStyle(modalOverlay).zIndex || 1050) : 0;

  // نبحث صعوداً عن أقرب سلف يملك z-index مُعلَن
  let ancestor = triggerEl.value;
  let parentZ = 0;
  while (ancestor && ancestor !== document.body) {
    const z = getComputedStyle(ancestor).zIndex;
    if (z !== 'auto' && +z > 0) {
      parentZ = +z;
      break;
    }
    ancestor = ancestor.parentElement;
  }

  let zIndexValue = 150; // الافتراضى

  if (modalOverlay) {
    // داخل مودال
    zIndexValue = modalBaseZ + 50;
  } else if (parentZ > 0) {
    // داخل Quick-Add أو أى حاوية لها z-index
    zIndexValue = parentZ + 50;
  }
  // ============ END NEW LOGIC ============

  teleportStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    top: shouldOpenUp.value ? `${rect.top - dropdownHeight}px` : `${rect.bottom}px`,
    zIndex: zIndexValue,
  };
}

function calculateDropdownDirection() {
  if (!triggerEl.value) return;

  const triggerRect = triggerEl.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const dropdownHeight = 300; // Estimated dropdown height

  // Calculate space below and above
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;

  // Open upward if there's insufficient space below (more aggressive)
  shouldOpenUp.value = spaceBelow < dropdownHeight || (spaceAbove > spaceBelow && spaceBelow < 250);
}

function closeDropdown() {
  isDropdownOpen.value = false;
  searchQuery.value = "";
  window.removeEventListener('resize', positionDropdown);
  window.removeEventListener('scroll', positionDropdown, true);
  if (window.__argonMultiSelectOpenDropdown === componentId.value) {
    window.__argonMultiSelectOpenDropdown = null;
  }
}

function openDropdown() {
  // Close any other open dropdown first (including ArgonSelect dropdowns)
  if (window.__argonMultiSelectOpenDropdown && window.__argonMultiSelectOpenDropdown !== componentId.value) {
    // Trigger close event for other multi-select dropdowns
    window.dispatchEvent(new CustomEvent('argon-multi-select-close-others', {
      detail: { excludeId: componentId.value }
    }));
  }

  // Also close any open ArgonSelect dropdowns
  if (window.__argonSelectOpenDropdown) {
    window.dispatchEvent(new CustomEvent('argon-select-close-others', {
      detail: { excludeId: componentId.value }
    }));
  }

  // Calculate dropdown direction
  calculateDropdownDirection();

  // Position dropdown and add listeners
  nextTick(() => {
    positionDropdown();
    window.addEventListener('resize', positionDropdown);
    window.addEventListener('scroll', positionDropdown, true);
  });

  isDropdownOpen.value = true;
  window.__argonMultiSelectOpenDropdown = componentId.value;
}

function toggleDropdown() {
  if (isDropdownOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
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

  closeDropdown();
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

// =========== EVENT HANDLERS ===========
// Handle click outside to close dropdown
function handleClickOutside(event) {
  const dropdown = document.getElementById(dropdownId.value);
  const trigger = triggerEl.value;

  // Close if click is outside both dropdown and trigger
  if (
    isDropdownOpen.value &&
    dropdown &&
    !dropdown.contains(event.target) &&
    trigger &&
    !trigger.contains(event.target)
  ) {
    closeDropdown();
  }
}

// Handle global close events from other dropdowns
function handleGlobalClose(event) {
  if (event.detail?.excludeId !== componentId.value && isDropdownOpen.value) {
    closeDropdown();
  }
}

// Handle close events from ArgonSelect dropdowns
function handleArgonSelectClose() {
  if (isDropdownOpen.value) {
    closeDropdown();
  }
}

// Handle escape key to close dropdown
function handleEscapeKey(event) {
  if (event.key === 'Escape' && isDropdownOpen.value) {
    closeDropdown();
  }
}

// =========== LIFECYCLE ===========
onMounted(() => {
  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
  // Add global close listener for multi-select
  window.addEventListener('argon-multi-select-close-others', handleGlobalClose);
  // Add close listener for ArgonSelect dropdowns
  window.addEventListener('argon-select-close-others', handleArgonSelectClose);
  // Add escape key listener
  document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('argon-multi-select-close-others', handleGlobalClose);
  window.removeEventListener('argon-select-close-others', handleArgonSelectClose);
  document.removeEventListener('keydown', handleEscapeKey);
  window.removeEventListener('resize', positionDropdown);
  window.removeEventListener('scroll', positionDropdown, true);

  // Clean up global state if this was the open dropdown
  if (window.__argonMultiSelectOpenDropdown === componentId.value) {
    window.__argonMultiSelectOpenDropdown = null;
  }
});
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
</style>

<style>
/* Styles for teleported dropdown (not scoped) */
.custom-select-dropdown {
  /* position, top, left, width, zIndex managed by teleportStyle (JS) */
  max-height: 300px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  background: white;
}

.custom-select-dropdown.dropdown-up {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
}

.custom-select-dropdown .options-container {
  max-height: calc(300px - 50px);
  overflow-y: auto;
}

.custom-select-dropdown .custom-select-option {
  cursor: pointer;
}

.custom-select-dropdown .custom-select-option:hover,
.custom-select-dropdown .custom-select-option:focus {
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
