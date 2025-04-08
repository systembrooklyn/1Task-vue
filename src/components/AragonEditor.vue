<template>
  <div class="form-group">
    <label :for="id">
      <slot />
    </label>
    <Editor
      :id="id"
      :init="editorConfig"
      v-model="content"
    ></Editor>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import Editor from '@tinymce/tinymce-vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  editorOptions: {
    type: Object,
    default: () => ({}),
  },
});

// Merge editor options with placeholder and defaults
const editorConfig = computed(() => ({
  height: 180,
  menubar: false,
  plugins: 'link lists',
  toolbar: 'bold italic strikethrough | link | bullist numlist',
  readonly: false,
  ...props.editorOptions,
  placeholder: props.placeholder,
}));

// Handle v-model update
const content = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>