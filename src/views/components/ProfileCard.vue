<template>
  <div class="card card-profile">
    <!-- صورة المستخدم -->
    <div class="row justify-content-center mb-3">
      <div class="col-auto my-3">
        <div class="position-relative">
          <a href="javascript:;">
            <img
              src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png"
              class="rounded-circle img-fluid shadow-lg border border-2 border-white"
              style="width: 150px; height: 150px;"
              alt="User Profile"
            />
          </a>
        </div>
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
        {{ user?.profile?.country }}, {{ user?.profile?.city }}, {{ user?.profile?.state }}
      </div>

      <!-- رقم الهاتف -->
      <div v-if="user?.phones?.length > 0" class="mt-3">
          <div v-for="(phone, index) in user?.phones" :key="index">
            <span>+{{ phone.CC }} {{ phone.phone }}</span>
          </div>
      </div>

      <!-- أزرار التواصل (اختياري) -->
      <div v-if="user?.links?.length > 0" class="mt-4 d-flex justify-content-center gap-2">
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

import { computed, defineProps } from 'vue';

const props = defineProps({
  user: {
    type: Object,
      required: true,
    },
});

const user = computed(() => props.user.data);

console.log(user.value);

</script>

<style scoped>
.card-profile {
  border-radius: 16px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
}

.rounded-circle {
  object-fit: cover;
}

.text-sm {
  font-size: 0.875rem;
}

.opacity-8 {
  opacity: 0.8;
}
</style>
