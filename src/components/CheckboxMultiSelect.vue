<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  items: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "",
  },
  countLabel: {
    type: String,
    default: "selected",
  },
  selectAllLabel: {
    type: String,
    default: "Select All",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showSelectAll: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "toggle-all"]);

const uniqueId = `cms-${Math.random().toString(36).slice(2, 10)}`;
const isOpen = ref(false);
const selectedItems = ref([...props.modelValue]);
const root = ref(null);

const selectedIds = computed(() => {
  return new Set(
    selectedItems.value.map((item) =>
      item && typeof item === "object" ? item.id ?? item.value : item,
    ),
  );
});

const buttonLabel = computed(() => {
  if (selectedItems.value.length === 0) {
    return props.placeholder || props.label || "—";
  }

  if (selectedItems.value.length === 1) {
    const single = selectedItems.value[0];
    return (
      (single && single.name) || (single && single.label) || String(single)
    );
  }

  return `${selectedItems.value.length} ${props.countLabel}`;
});

const isAllSelected = computed(() => {
  if (!props.items.length) return false;
  return props.items.every((item) => selectedIds.value.has(item.value));
});

const syncFromModel = () => {
  selectedItems.value = props.modelValue.map((item) => {
    if (item && typeof item === "object") {
      return {
        id: item.id ?? item.value,
        name: item.name ?? item.label ?? item.toString(),
      };
    }
    return {
      id: item,
      name: String(item),
    };
  });
};

watch(
  () => props.modelValue,
  () => {
    syncFromModel();
  },
  { deep: true },
);

const closeOnOutsideClick = (event) => {
  if (!root.value) return;
  if (!root.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeOnOutsideClick);
  syncFromModel();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeOnOutsideClick);
});

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const updateModel = (next) => {
  selectedItems.value = next;
  emit("update:modelValue", next);
};

const toggleItem = (item) => {
  const exists = selectedIds.value.has(item.value);
  if (exists) {
    const next = selectedItems.value.filter(
      (selected) => (selected.id ?? selected.value) !== item.value,
    );
    updateModel(next);
  } else {
    const next = [...selectedItems.value, { id: item.value, name: item.label }];
    updateModel(next);
  }
};

const toggleAll = () => {
  emit("toggle-all");
  if (isAllSelected.value) {
    updateModel([]);
  } else {
    const next = props.items.map((item) => ({
      id: item.value,
      name: item.label,
    }));
    updateModel(next);
  }
};
</script>

<template>
  <div class="checkbox-multi-select" ref="root">
    <label v-if="label" class="form-label">{{ label }}</label>
    <div class="dropdown">
      <button
        class="btn btn-outline-secondary dropdown-toggle w-100 text-start"
        type="button"
        :class="{ show: isOpen }"
        :disabled="disabled"
        @click.stop="toggleDropdown"
      >
        {{ buttonLabel }}
      </button>
      <ul class="dropdown-menu w-100" :class="{ show: isOpen }">
        <li v-if="showSelectAll" class="px-2">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              :id="`${uniqueId}-all`"
              :checked="isAllSelected"
              @change.prevent="toggleAll"
            />
            <label class="form-check-label" :for="`${uniqueId}-all`">
              {{ selectAllLabel }}
            </label>
          </div>
        </li>
        <li v-if="showSelectAll">
          <hr class="dropdown-divider" />
        </li>
        <li
          v-for="item in items"
          :key="item.value"
          class="px-2 checkbox-multi-select-item"
        >
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              :id="`${uniqueId}-${item.value}`"
              :checked="selectedIds.has(item.value)"
              @change.prevent="toggleItem(item)"
            />
            <label class="form-check-label" :for="`${uniqueId}-${item.value}`">
              {{ item.label }}
            </label>
          </div>
        </li>
        <li v-if="!items.length" class="px-3 py-2 text-muted small">
          {{ $attrs.emptyLabel ?? "No options available" }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.checkbox-multi-select {
  position: relative;
}

.dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
}

.checkbox-multi-select-item + .checkbox-multi-select-item {
  margin-top: 4px;
}

@media (max-width: 768px) {
  .dropdown-menu {
    max-height: 200px;
  }
}
</style>
