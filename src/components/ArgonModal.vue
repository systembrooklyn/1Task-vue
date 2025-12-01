<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="handleBackdrop">
      <div class="modal-content" :class="maxWidthClass" :style="{ maxHeight: computedMaxHeight }">
        <div class="modal-header">
          <div class="header-content-wrapper">
            <h5 v-if="title" class="modal-title">{{ title }}</h5>
            <slot name="title"></slot>
          </div>
          <button v-if="showCloseBtn" type="button" class="btn-close" @click="emitClose" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, onUnmounted, computed, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: "md", // sm | md | lg | xl | full
    validator: (v) => ["sm", "md", "lg", "xl", "full"].includes(v),
  },
  maxHeight: {
    type: [String, Number],
    default: "90vh", // e.g. '600px' or '80vh'
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  showCloseBtn: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "open", "close"]);

// Computed classes / styles
const maxWidthClass = computed(() => ({
  "modal-sm": props.maxWidth === "sm",
  "modal-md": props.maxWidth === "md",
  "modal-lg": props.maxWidth === "lg",
  "modal-xl": props.maxWidth === "xl",
  "modal-full": props.maxWidth === "full",
}));

const computedMaxHeight = computed(() =>
  typeof props.maxHeight === "number" ? `${props.maxHeight}px` : props.maxHeight
);

// Methods
function emitClose() {
  emit("update:modelValue", false);
  emit("close");
}

function handleBackdrop() {
  if (props.closeOnBackdrop) emitClose();
}

function handleEsc(e) {
  if (e.key === "Escape" && props.closeOnEsc && props.modelValue) emitClose();
}

// Watch modelValue to add/remove modal-open class on body
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    document.body.classList.add('modal-open');
    emit("open");
  } else {
    document.body.classList.remove('modal-open');
  }
});

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    document.body.classList.add('modal-open');
    emit("open");
  }
  window.addEventListener("keydown", handleEsc);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEsc);
  // Clean up modal-open class when component unmounts
  document.body.classList.remove('modal-open');
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  /* z-index يأتي من z-layers.css */
}

/* 1. الحاوية الرئيسية للنافذة */
.modal-content {
  background: white;
  border-radius: 8px;
  width: 95%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* z-index و position يأتي من z-layers.css */
}

/* تحكّم في العرض عبر كلاسات */
.modal-sm {
  max-width: 420px;
}

.modal-md {
  max-width: 600px;
}

.modal-lg {
  max-width: 800px;
}

.modal-xl {
  max-width: 1000px;
}

.modal-full {
  max-width: 96vw;
}

/* 2. رأس النافذة */
.modal-header {
  flex-shrink: 0;
  /* منعه من الانكماش أو التمدد */
  border-bottom: 1px solid #dee2e6;
  /* خط فاصل أنيق */
  position: relative;
  z-index: 1;
  /* طبقة منخفضة للسماح للـ dropdowns بالظهور فوقه */
}

/* 3. جسم النافذة (الجزء الأهم والقابل للتمرير) */
.modal-body {
  flex-grow: 1;
  /* يجعله يملأ "باقي" المساحة المتاحة بين الرأس والتذييل */
  overflow-y: auto;
  /* الأهم: نضيف له شريط تمرير خاص به إذا زاد المحتوى */
  padding: 1rem;
}

/* 4. تذييل النافذة */
.modal-footer {
  flex-shrink: 0;
  /* منعه من الانكماش أو التمدد */
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0.75rem 1rem;
  border-top: 1px solid #dee2e6;
  /* خط فاصل أنيق */
}

/* لا داعي لوضع padding على modal-content نفسه، بل على الأجزاء الداخلية */
/* .modal-header,
.modal-body,
.modal-footer {
  padding: 1rem;
} */

.modal-body {
  padding-top: 10px;
  padding-bottom: 10px;
}

/* كلاس جديد للتحكم في محتوى الهيدر */
.header-content-wrapper {
  flex-grow: 1;
  /* يجعله يأخذ كل المساحة المتاحة في المنتصف */
  text-align: center;
  /* يقوم بتوسيط كل ما بداخله (مثل عنوان المهمة الرئيسي) */
  /* نضع هامشًا بسيطًا لتجنب الالتصاق بزر الإغلاق */
  margin-right: 1rem;
}

/* تأكد أن الـ dropdowns داخل الـ modal body تظهر فوق الـ header */
.modal-body {
  position: relative;
  z-index: 2;
  /* طبقة أعلى من الـ header */
}
</style>
