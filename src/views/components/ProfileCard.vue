<template>
  <!-- Page Context (Default) -->
  <div v-if="context === 'page'" class="card card-profile">
    <!-- Profile Image Section -->
    <div class="row justify-content-center">
      <div class="card-header-image">
        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          class="d-none"
          accept="image/*"
          @change="handleFileUpload"
        />

        <!-- Profile Image Container -->
        <a href="#" @click.prevent="triggerFileInput" class="position-relative">
          <!-- Loading Spinner -->
          <div v-if="isLoading" class="simple-spinner">
            <div class="spinner-circle"></div>
          </div>

          <!-- Profile Image -->
          <img
            :src="user?.profile?.ppUrl || defaultImg"
            class="card-profile-image"
            :class="{ 'loading-opacity': isLoading }"
          />
          <span v-if="!isLoading" class="edit-icon">
            <i class="fas fa-pencil-alt"></i>
          </span>
        </a>
      </div>
    </div>

    <!-- User Details -->
    <div class="card-body pt-0">
      <div class="text-center mt-4">
        <h5>{{ user?.name }} {{ user?.last_name }}</h5>
        <div v-if="user?.profile?.position" class="h6 font-weight-300">
          <i class="ni business_briefcase-24 mr-2"></i>{{ user.profile.position }}
        </div>
        <div v-if="user?.profile?.country" class="h6 mt-2 font-weight-300">
          <i class="ni location_pin mr-2"></i>{{ user.profile.country }}
        </div>
      </div>

      <!-- Phones Section -->
      <div v-if="user?.phones?.length > 0" class="mt-4 pt-4 border-top text-center">
        <div v-for="phone in user.phones" :key="phone.phone" class="d-flex justify-content-center align-items-center mb-2">
          <i class="fas fa-phone-alt text-muted mr-2"></i>
          <span>+{{ phone.CC }} {{ phone.phone }}</span>
        </div>
      </div>

      <!-- Links Section -->
      <div v-if="user?.links?.length > 0" class="mt-3 pt-3 border-top text-center">
        <div class="d-flex justify-content-center gap-3">
          <a
            v-for="link in user.links"
            :key="link.link"
            :href="link.link"
            target="_blank"
            class="text-dark"
            :title="link.icon"
          >
            <i :class="`fab fa-${link.icon} fs-4`"></i>
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Navbar Context -->
  <div v-else-if="context === 'navbar'" class="navbar-profile-item">
    <img :src="user?.profile?.ppUrl || defaultImg" class="navbar-profile-image" alt="Profile" />
    <div class="navbar-profile-details">
      <h6 class="mb-0 font-weight-bold">{{ user?.name }}</h6>
      <p v-if="user?.profile?.position" class="mb-0 text-sm text-muted">{{ user.profile.position }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits, ref } from "vue";
import Swal from "sweetalert2";
import defaultImg from "@/assets/img/userProfile.png";

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  context: {
    type: String,
    default: 'page', // Can be 'page' or 'navbar'
  },
});

const emit = defineEmits(["image-uploaded"]);

const fileInput = ref(null);
const isLoading = ref(false);

const user = computed(() => props.user);

const triggerFileInput = () => {
  if (!isLoading.value && fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const maxSizeInBytes = 1.99 * 1024 * 1024; // 1.99 MB
  if (file.size > maxSizeInBytes) {
    Swal.fire({
      icon: "error",
      title: "Upload Error",
      text: `File size exceeds limit of 1.99MB`,
    });
    return;
  }

  const formData = new FormData();
  formData.append("profile_picture", file);

  isLoading.value = true;
  try {
    emit("image-uploaded", formData);
    // Simulating upload time, parent will eventually control this state.
    setTimeout(() => {
      isLoading.value = false;
    }, 2000);
  } catch (error) {
    console.error("Error uploading image:", error);
    Swal.fire("Error", "Failed to upload image", "error");
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* --- Navbar Context Styles --- */
.navbar-profile-item {
  display: flex;
  align-items: center;
  padding: 10px 16px; /* Padding similar to dropdown items */
  cursor: pointer;
  background-color: transparent;
  transition: background-color 0.2s ease-in-out;
}

.navbar-profile-item:hover {
  background-color: #f6f9fc; /* A light hover color from Argon theme */
}

.navbar-profile-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.navbar-profile-details {
  line-height: 1.3;
}

.navbar-profile-details h6 {
  color: #344767;
  font-size: 0.9rem;
}

.navbar-profile-details p {
  color: #6c757d;
}

/* --- Page Context Styles (existing styles) --- */
/* Card adjustments */
.card-profile {
  text-align: center;
}

/* Image positioning container */
.card-header-image {
  margin-top: -4rem; /* Pull image up */
  margin-bottom: 1rem;
  position: relative;
  /* z-index: 5; */
}

/* The profile image */
.card-profile-image {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: filter 0.3s ease-in-out;
  
}

/* Adjust card body to not overlap */
.card-body {
  padding-top: 1rem !important;
}

.card-body .text-center {
  margin-top: 0 !important;
}

/* --- Hover and loading effects --- */
.loading-opacity {
  opacity: 0.6;
}

a.position-relative {
  display: inline-block;
  position: relative;
  cursor: pointer;
}

a:hover .card-profile-image {
  filter: brightness(0.8);
}

.edit-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

a:hover .edit-icon {
  opacity: 1;
}

/* --- Spinner --- */
.simple-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.spinner-circle {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>