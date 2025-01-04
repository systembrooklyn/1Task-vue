<!-- src/components/ArgonCheckbox.vue -->
<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  value: {
    type: [String, Number],
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const onChange = (event) => {
  const checked = event.target.checked;
  const newValue = [...props.modelValue];
  const valueIndex = newValue.indexOf(props.value);

  if (checked && valueIndex === -1) {
    newValue.push(props.value);
  } else if (!checked && valueIndex !== -1) {
    newValue.splice(valueIndex, 1);
  }

  emit('update:modelValue', newValue);
};
</script>

<template>
  <div class="form-check">
    <input
      :id="id"
      class="form-check-input"
      type="checkbox"
      :name="name"
      :value="value"
      :checked="modelValue.includes(value)"
      @change="onChange"
    />
    <label :for="id" class="custom-control-label" :class="$attrs.class">
      <slot />
    </label>
  </div>
</template>

<style scoped>
/* يمكنك إضافة تنسيقات إضافية هنا إذا لزم الأمر */
</style>
