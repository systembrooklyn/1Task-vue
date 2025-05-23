<template>
  <div class="card card-profile">
    <!-- صورة المستخدم -->
    <div class="row justify-content-center mb-3">
      <div class="col-auto my-3 position-relative d-flex justify-content-center">
        <!-- حاوية الصورة -->
        <div class="position-relative d-inline-block">
          <!-- صورة المستخدم -->
          <img
            :src="user?.profile?.ppUrl || 'default-user-image.jpg'"
            class="rounded-circle img-fluid shadow-lg border border-2 border-white image-profile"
            alt="User Profile"
          />

          <!-- زر الكاميرا (في المنتصف) -->
          <button 
            class="camera-icon d-flex align-items-center justify-content-center position-absolute top-50 start-50 translate-middle"
            @click="$refs.file.click()"
          >
            <i class="fa fa-camera"></i>
          </button>
        </div>
        
        <!-- مدخل الملفات الخفي -->
        <input
          ref="file"
          type="file"
          class="d-none"
          @change="handleFileUpload"
        />
      </div>

    </div>

    <!-- تفاصيل المستخدم -->
    <div class="card-body pt-0 text-center">
      <h5 class="mb-1">{{ user?.name }}</h5>
      <div class="text-sm opacity-8 mb-2">
        {{ user?.profile?.position }}
      </div>
      <div class="text-sm opacity-8 mb-2">
        {{ user?.email }}
      </div>
      <div class="text-sm opacity-8">
        <i class="ni location_pin mr-2"></i>
        {{ user?.profile?.country }}, {{ user?.profile?.city }},
        {{ user?.profile?.state }}
      </div>

      <!-- رقم الهاتف -->
      <div v-if="user?.phones?.length > 0" class="mt-3">
        <div v-for="(phone, index) in user?.phones" :key="index">
          <span>+{{ phone.CC }} {{ phone.phone }}</span>
        </div>
      </div>

      <!-- أزرار التواصل (اختياري) -->
      <div
        v-if="user?.links?.length > 0"
        class="mt-4 d-flex justify-content-center gap-2"
      >
        <a
          v-for="(link, index) in user.links"
          :key="index"
          :href="link.link"
          target="_blank"
          class="btn btn-sm btn-outline-info"
        >
          <i :class="`fab fa-${link.icon}`"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from "vue";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});


const user = computed(() => props.user.data);

const emit = defineEmits(["image-uploaded"]);


// const fileToUpload = ref(null);

// في الدالة handleFileUpload
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  console.log("Selected file:", file);
  if (!file) return;

  // إنشاء FormData وإضافة الملف
  const formData = new FormData();
  formData.append("profileImage", file); // اسم الحقل يجب أن يتطابق مع الـ backend
  console.log("FormData:", formData);

  // إرسال FormData للـ Parent Component
  emit("image-uploaded", formData);
};




</script>

<style scoped>
.card-profile {
  border-radius: 16px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
}

.image-profile {
  width: 150px;
  height: 150px;
  border: 2px solid #fff;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

/* أيقونة الكاميرا */
.camera-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* ظهور الأيقونة عند تعليق الم光 على الصورة */
.image-profile:hover + .camera-icon,
.camera-icon:hover {
  opacity: 1;
}

.camera-icon i {
  color: #333;
  font-size: 16px;
}
</style>
