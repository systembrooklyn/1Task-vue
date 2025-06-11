<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-content-wrapper">
          <h5 v-if="title" class="modal-title">{{ title }}</h5>
          <slot name="title"></slot>
        </div>
        <button type="button" class="btn-close" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <slot></slot>
        <!-- هنا يتم تخصيص محتوى الـ modal -->
      </div>
      <div class="modal-footer">
        <!-- <button type="button" class="btn btn-secondary" @click="closeModal">Close</button> -->
        <slot name="footer"></slot>
        <!-- تخصيص محتوى الفوتر -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Modal Title",
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});

// const emit = defineEmits(['close', 'update:modelValue']);

const isOpen = ref(!props.modelValue);
console.log(isOpen.value);

// const closeModal = () => {
//   isOpen.value = false;
//   emit('update:modelValue', false); // لإغلاق الـ modal
//   emit('close'); // إطلاق الحدث 'close'
// };
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
  z-index: 1050; /* رقم مناسب لضمان ظهوره فوق العناصر الأخرى */
}

/* 1. الحاوية الرئيسية للنافذة */
.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 700px;
  width: 95%; /* لترك هوامش على الشاشات الصغيرة جداً */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);

  /* -- التعديلات الأساسية هنا -- */
  display: flex; /* الخطوة 2: تحويلها لـ flex container */
  flex-direction: column; /* الخطوة 3: لترتيب العناصر (header, body, footer) بشكل عمودي */
  overflow: hidden; /* لإخفاء أي محتوى قد يخرج من الحواف المدورة */
}

/* 2. رأس النافذة */
.modal-header {
  flex-shrink: 0; /* منعه من الانكماش أو التمدد */
  border-bottom: 1px solid #dee2e6; /* خط فاصل أنيق */
}

/* 3. جسم النافذة (الجزء الأهم والقابل للتمرير) */
.modal-body {
  flex-grow: 1; /* يجعله يملأ "باقي" المساحة المتاحة بين الرأس والتذييل */
  overflow-y: auto; /* الأهم: نضيف له شريط تمرير خاص به إذا زاد المحتوى */
  padding: 1rem;
}

/* 4. تذييل النافذة */
.modal-footer {
  flex-shrink: 0; /* منعه من الانكماش أو التمدد */
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0.75rem 1rem;
  border-top: 1px solid #dee2e6; /* خط فاصل أنيق */
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
  flex-grow: 1; /* يجعله يأخذ كل المساحة المتاحة في المنتصف */
  text-align: center; /* يقوم بتوسيط كل ما بداخله (مثل عنوان المهمة الرئيسي) */
  /* نضع هامشًا بسيطًا لتجنب الالتصاق بزر الإغلاق */
  margin-right: 1rem;
}
</style>
