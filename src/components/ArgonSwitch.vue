<script setup>
import { ref, watch } from "vue";

// تعريف الخصائص (props)
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  labelClass: {
    type: String,
    default: "",
  },
  inputClass: {
    type: String,
    default: "",
  },
});

// تعريف قيمة محلية لحالة الـ switch
const isChecked = ref(props.checked);
console.log(isChecked.value);

// tooltip ديناميكي
const tooltipText = ref(isChecked.value ? "Active" : "Inactive");

// مراقبة التغييرات في الحالة المحلية وتحديث النص
watch(isChecked, (newVal) => {
  tooltipText.value = newVal ? "Active" : "Inactive";
});

// إعادة التفاعل مع التغييرات القادمة من props
watch(
  () => props.checked,
  (newVal) => {
    console.log("newVal:", newVal);
    isChecked.value = newVal;
  }
);
</script>

<template>
  <div class="form-check form-switch custom-switch ps-0">
    <input
      :id="id"
      class=" ms-0 custom-switch-input"
      type="checkbox"
      :name="name"
      v-model="isChecked"
      :title="tooltipText"
      @change="$emit('update:checked', isChecked)"
    />
    <label class="form-check-label custom-switch-label" :class="labelClass" :for="id">
      <slot />
    </label>
  </div>
</template>

<style scoped>
/* تحسين شكل السويتش */
.custom-switch {
  display: flex;
  align-items: center;
  /* gap: 8px; */
}

/* تنسيق السويتش */
.custom-switch-input {
  width: 40px;
  height: 20px;
  appearance: none;
  background-color: #c6c3c3;
  border-radius: 20px;
  position: relative;
  outline: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.custom-switch-input:checked {
  background-color: #A9CA5C;
}

.custom-switch-input::before {
  content: "";
  width: 16px;
  height: 16px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
}

.custom-switch-input:checked::before {
  transform: translateX(20px);
}

/* تنسيق النص */
.custom-switch-label {
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: color 0.3s ease;
}

.custom-switch-label:hover {
  color: #555;
}
</style>
