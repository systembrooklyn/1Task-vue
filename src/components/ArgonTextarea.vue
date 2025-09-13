<script setup>
defineProps({
  id: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: "",
  },
  rows: {
    type: Number,
    default: 5,
  },
  modelValue: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(['update:modelValue']);
</script>
<template>
  <div class="form-group">
    <label :for="id">
      <slot />
    </label>
    <textarea
      :id="id"
      class="form-control"
      :rows="rows"
      :placeholder="placeholder"
      :value="modelValue"
      :name="name"
      @input="emit('update:modelValue', $event.target.value)"
    ></textarea>
  </div>
</template>
