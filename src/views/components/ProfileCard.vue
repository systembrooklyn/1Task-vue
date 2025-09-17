<template>
  <!-- Page Context (Default) -->
  <div v-if="context === 'page'" class="profile-card-modern">
    <!-- Profile Image Section -->
    <div class="profile-image-section">
      <!-- Hidden file input -->
      <input ref="fileInput" type="file" class="d-none" accept="image/*" @change="handleFileUpload" />

      <!-- Profile Image Container -->
      <div class="profile-image-container" @click="triggerFileInput">
        <!-- Loading Spinner -->
        <div v-if="isLoading" class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>

        <!-- Profile Image -->
        <div class="profile-image-wrapper">
          <img :src="user?.profile?.ppUrl || defaultImg" class="profile-image" :class="{ 'loading-opacity': isLoading }"
            alt="Profile" />
          <div v-if="!isLoading" class="edit-overlay">
            <i class="fas fa-camera"></i>
            <span>Change Photo</span>
          </div>
        </div>
      </div>
    </div>

    <!-- User Details -->
    <div class="profile-content">
      <!-- Main Info -->
      <div class="profile-main-info">
        <h3 class="profile-name">{{ user?.name }} {{ user?.last_name }}</h3>
        <div v-if="user?.profile?.position" class="profile-position">
          <i class="fas fa-briefcase"></i>
          <span>{{ user.profile.position }}</span>
        </div>
        <div v-if="user?.profile?.country" class="profile-location">
          <i class="fas fa-map-marker-alt"></i>
          <span>{{ user.profile.country }}</span>
        </div>
      </div>

      <!-- Contact Info -->
      <div v-if="user?.phones?.length > 0 || user?.links?.length > 0" class="profile-contact-section">
        <!-- Phones -->
        <div v-if="user?.phones?.length > 0" class="contact-group">
          <h6 class="contact-title">
            <i class="fas fa-phone"></i>
            Phone Numbers
          </h6>
          <div class="contact-items">
            <div v-for="phone in user.phones" :key="phone.phone" class="contact-item">
              <div class="contact-icon">
                <i class="fas fa-phone-alt"></i>
              </div>
              <span class="contact-text">+{{ phone.CC }} {{ phone.phone }}</span>
              <a :href="`tel:+${phone.CC}${phone.phone}`" class="contact-action">
                <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Social Links -->
        <div v-if="user?.links?.length > 0" class="contact-group">
          <h6 class="contact-title">
            <i class="fas fa-share-alt"></i>
            Social Links
          </h6>
          <div class="social-links">
            <a v-for="link in user.links" :key="link.link" :href="link.link" target="_blank" class="social-link"
              :title="link.icon" :class="`social-${link.icon}`">
              <i :class="getSocialIcon(link.icon)"></i>
            </a>
          </div>
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

const getSocialIcon = (platform) => {
  const iconMap = {
    'github': 'fab fa-github',
    'linkedin': 'fab fa-linkedin',
    'twitter': 'fab fa-twitter',
    'facebook': 'fab fa-facebook',
    'instagram': 'fab fa-instagram',
    'youtube': 'fab fa-youtube',
    'tiktok': 'fab fa-tiktok',
    'whatsapp': 'fab fa-whatsapp',
    'telegram': 'fab fa-telegram',
    'skype': 'fab fa-skype',
    'snapchat': 'fab fa-snapchat'
  };
  return iconMap[platform] || 'fas fa-link';
};

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
/* Modern Profile Card */
.profile-card-modern {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card-modern:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

/* Header background removed */

/* Profile Image Section */
.profile-image-section {
  display: flex;
  justify-content: center;
  padding-top: 2rem;
  position: relative;
  z-index: 10;
}

.profile-image-container {
  cursor: pointer;
  position: relative;
}

.profile-image-wrapper {
  position: relative;
  display: inline-block;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  object-fit: cover;
  transition: all 0.3s ease;
}

.profile-image-container:hover .profile-image {
  transform: scale(1.05);
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 0.75rem;
  text-align: center;
}

.profile-image-container:hover .edit-overlay {
  opacity: 1;
}

.edit-overlay i {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.loading-opacity {
  opacity: 0.6;
}

/* Loading Spinner */
.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(165, 201, 88, 0.3);
  border-top: 3px solid #A5C958;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Profile Content */
.profile-content {
  padding: 1.5rem 2rem 2rem;
}

.profile-main-info {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #A5C958 0%, #8fb647 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-position,
.profile-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.profile-position i,
.profile-location i {
  color: #A5C958;
  width: 16px;
}

/* Contact Section */
.profile-contact-section {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.contact-group {
  margin-bottom: 1.5rem;
}

.contact-group:last-child {
  margin-bottom: 0;
}

.contact-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.contact-title i {
  color: #A5C958;
}

/* Contact Items */
.contact-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contact-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #A5C958 0%, #8fb647 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.contact-text {
  flex-grow: 1;
  color: #4a5568;
  font-weight: 500;
}

.contact-action {
  color: #cbd5e0;
  transition: color 0.2s ease;
  padding: 0.25rem;
}

.contact-action:hover {
  color: #A5C958;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.social-link {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-link:hover {
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Social Platform Colors */
.social-github {
  background: linear-gradient(135deg, #333 0%, #24292e 100%);
}

.social-linkedin {
  background: linear-gradient(135deg, #0077b5 0%, #005885 100%);
}

.social-twitter {
  background: linear-gradient(135deg, #1da1f2 0%, #0d8bd9 100%);
}

.social-facebook {
  background: linear-gradient(135deg, #1877f2 0%, #166fe5 100%);
}

.social-instagram {
  background: linear-gradient(135deg, #e4405f 0%, #c13584 50%, #833ab4 100%);
}

.social-youtube {
  background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
}

.social-tiktok {
  background: linear-gradient(135deg, #000 0%, #333 100%);
}

.social-whatsapp {
  background: linear-gradient(135deg, #A5C958 0%, #8fb647 100%);
}

.social-telegram {
  background: linear-gradient(135deg, #0088cc 0%, #006699 100%);
}

.social-skype {
  background: linear-gradient(135deg, #00aff0 0%, #0078d4 100%);
}

.social-snapchat {
  background: linear-gradient(135deg, #fffc00 0%, #ffeb3b 100%);
  color: #333;
}

/* --- Navbar Context Styles --- */
.navbar-profile-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  background-color: transparent;
  transition: all 0.2s ease-in-out;
  border-radius: 8px;
}

.navbar-profile-item:hover {
  background-color: #f6f9fc;
  transform: translateX(4px);
}

.navbar-profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.navbar-profile-details {
  line-height: 1.3;
}

.navbar-profile-details h6 {
  color: #344767;
  font-size: 0.9rem;
  font-weight: 600;
}

.navbar-profile-details p {
  color: #6c757d;
  font-size: 0.8rem;
}
</style>