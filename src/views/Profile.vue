// Profile.vue

<script setup>
import {
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  computed,
  watch,
} from "vue";
import { useStore } from "vuex";
import setNavPills from "@/assets/js/nav-pills.js"; // Assuming these are still used
import setTooltip from "@/assets/js/tooltip.js"; // Assuming these are still used
import ProfileCard from "./components/ProfileCard.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonInputPhone from "@/components/ArgonInputPhone.vue"; // Ensure correct path
import countriesList from "@/data/countries.json"; // Your full list of countries
import ArgonIconPicker from "@/components/ArgonIconPicker.vue";
import Swal from "sweetalert2";
// REMOVED: import { parsePhoneNumberFromString } from 'libphonenumber-js'; // This was unused here

const store = useStore();
const body = document.getElementsByTagName("body")[0];

const linkIcons = ref([
  { value: "github", label: "Github", icon: "github" },
  { value: "linkedin", label: "Linkedin", icon: "linkedin" },
  { value: "twitter", label: "Twitter", icon: "twitter" },
  { value: "facebook", label: "Facebook", icon: "facebook" },
  { value: "instagram", label: "Instagram", icon: "instagram" },
  { value: "youtube", label: "YouTube", icon: "youtube" },
  { value: "tiktok", label: "TikTok", icon: "tiktok" },
  { value: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { value: "telegram", label: "Telegram", icon: "telegram" },
  { value: "skype", label: "Skype", icon: "skype" },
  { value: "snapchat", label: "Snapchat", icon: "snapchat" },
]);

// Profile data refs
const userName = ref("");
const userLastName = ref("");
const userEmail = ref("");
const userCity = ref("");
const userCountry = ref(""); // User's country of residence
const userState = ref("");
const userPosition = ref("");
const isSaving = ref(false);

const userPhones = ref([]); // Will hold an array of { CC: string, phone: string }
const userLinks = ref([]);

const profileData = ref({}); // For ProfileCard (user object for the card)

// Error handling with SweetAlert
const showErrorAlert = (error, context = '') => {
  console.error(`Error in ${context}:`, error);

  let message = 'An unexpected error occurred';
  let title = 'Error';

  // Handle 422 validation errors first
  if (error?.response?.status === 422) {
    title = 'Validation Error';

    // Check if there's a main message
    if (error.response.data?.message) {
      message = error.response.data.message;
    }

    // Check for detailed errors
    if (error.response.data?.errors) {
      const errors = error.response.data.errors;
      const errorList = [];

      Object.keys(errors).forEach(field => {
        if (Array.isArray(errors[field])) {
          errors[field].forEach(err => errorList.push(`• ${err}`));
        }
      });

      if (errorList.length > 0) {
        message = errorList.join('<br>');
      }
    }
  }
  // Handle other error types
  else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.response?.data?.error) {
    message = error.response.data.error;
  } else if (error?.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  Swal.fire({
    icon: 'error',
    title: context || title,
    html: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc3545'
  });
};

const showSuccessAlert = (message, title = 'Success') => {
  Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#A5C958'
  });
};

const allCountriesForPhoneInput = ref(countriesList);
const defaultPhoneCountryIso = ref("eg"); // Example default, e.g., Egypt. Update as needed.

const getDefaultCountryForPhone = () => {
  const defaultCountryObj = countriesList.find(
    (c) =>
      c.isoCode.toLowerCase() === defaultPhoneCountryIso.value.toLowerCase()
  );
  if (defaultCountryObj) {
    return defaultCountryObj;
  }
  return countriesList.length > 0
    ? countriesList[0]
    : { dialCode: "", isoCode: "" }; // Fallback
};

const fetchProfileData = async () => {
  try {
    const response = await store.dispatch("fetchProfileData");
    console.log("API Response:", response.data.data);

    const data = response.data;

    profileData.value = data;
    userName.value = data.data?.name || "";
    userLastName.value = data.data?.last_name || "";
    userEmail.value = data.data?.email || "";
    userCity.value = data.data?.profile?.city || "";
    userCountry.value = data.data?.profile?.country || "";
    userState.value = data.data?.profile?.state || "";
    userPosition.value = data.data?.profile?.position || "";

    if (data.data.phones && Array.isArray(data.data.phones)) {
      userPhones.value = data.data.phones.map((p) => ({
        CC: String(p.CC || getDefaultCountryForPhone().dialCode),
        phone: String(p.phone || ""),
      }));
      if (userPhones.value.length === 0) {
        const defaultCountry = getDefaultCountryForPhone();
        userPhones.value = [{ CC: defaultCountry.dialCode, phone: "" }];
      }
    } else {
      const defaultCountry = getDefaultCountryForPhone();
      userPhones.value = [{ CC: defaultCountry.dialCode, phone: "" }];
      console.warn(
        "No 'phones' array in API response, initializing with a default phone input."
      );
    }

    if (data.data.links && Array.isArray(data.data.links)) {
      userLinks.value = data.data.links.map((link) => ({
        icon: link.icon,
        link: link.link,
      }));
    } else {
      userLinks.value = [];
      console.warn(
        "No 'links' array in API response, initializing with an empty array."
      );
    }
  } catch (error) {
    showErrorAlert(error, 'Failed to load profile data');
    const defaultCountry = getDefaultCountryForPhone();
    userPhones.value = [{ CC: defaultCountry.dialCode, phone: "" }];
  }
};

let tempIdCounter = 0; // Add this outside functions, in the setup scope

const addPhoneNumber = () => {
  const defaultCountry = getDefaultCountryForPhone();
  userPhones.value.push({
    CC: defaultCountry.dialCode,
    phone: "",
    tempId: `new_${tempIdCounter++}`, // Assign a temporary unique ID
  });
};

const addLink = () => {
  userLinks.value.push({
    icon: "",
    link: "",
    tempId: `new_${tempIdCounter++}`, // Assign a temporary unique ID
  });
};

const removePhoneNumber = (index) => {
  if (userPhones.value.length > 1) {
    userPhones.value.splice(index, 1);
  } else {
    const defaultCountry = getDefaultCountryForPhone();
    userPhones.value[index] = { CC: defaultCountry.dialCode, phone: "" };
  }
};

const removeLink = (index) => {
  if (userLinks.value.length > 1) {
    userLinks.value.splice(index, 1);
  } else {
    userLinks.value[index] = { icon: "", link: "" };
  }
};

const phoneValidities = ref([]);
watch(
  userPhones,
  (newPhones) => {
    phoneValidities.value = newPhones.map(() => true);
  },
  { deep: true, immediate: true }
);

const handlePhoneValidity = (index, isValid) => {
  if (phoneValidities.value[index] !== undefined) {
    phoneValidities.value[index] = isValid;
  }
  console.log(`Phone at index ${index} validity:`, isValid);
};

const allPhonesValid = computed(() => {
  return phoneValidities.value.every((isValid) => isValid);
});

const saveChanges = async () => {
  isSaving.value = true;
  if (!allPhonesValid.value) {
    showErrorAlert("Please correct the invalid phone numbers before saving.", "Validation Error");
    isSaving.value = false; // Stop saving
    return;
  }

  const profileUpdateData = {
    name: userName.value,
    last_name: userLastName.value,
    email: userEmail.value,
    profile: {
      city: userCity.value,
      country: userCountry.value,
      state: userState.value,
      position: userPosition.value,
    },
    // FIX: Filter out phones where the number is empty
    phones: userPhones.value
      .filter((p) => p.phone && p.phone.trim() !== "")
      .map((p) => ({
        CC: p.CC,
        phone: p.phone,
      })),

    // BEST PRACTICE: Also filter out links that are incomplete
    links: userLinks.value
      .filter((l) => l.icon && l.link && l.link.trim() !== "")
      .map((l) => ({
        icon: l.icon,
        link: l.link,
      })),
  };

  console.log("Saving filtered data:", profileUpdateData); // New log to verify

  try {
    await store.dispatch("updateProfileData", profileUpdateData);
    isSaving.value = false;
    await fetchProfileData();
    // Show success message
    showSuccessAlert("Profile updated successfully!");
  } catch (error) {
    showErrorAlert(error, 'Failed to save profile data');
    isSaving.value = false;
  }
};


const uploadProfileImage = async (formData) => {
  try {
    await store.dispatch("uploadProfileImage", formData);
    await fetchProfileData();
    showSuccessAlert("Profile image updated successfully!");
  } catch (error) {
    showErrorAlert(error, 'Failed to upload profile image');
  }
};

// Lifecycle hooks
onMounted(() => {
  store.state.isAbsolute = true;
  setNavPills();
  setTooltip();
  fetchProfileData();
});

onBeforeMount(() => {
  store.state.imageLayout = "profile-overview";
  store.state.showNavbar = true;
  store.state.showFooter = true;
  store.state.hideConfigButton = true;
  body.classList.add("profile-overview");
});

onBeforeUnmount(() => {
  store.state.isAbsolute = false;
  store.state.imageLayout = "default";
  store.state.showNavbar = true;
  store.state.showFooter = true;
  store.state.hideConfigButton = false;
  body.classList.remove("profile-overview");
});
</script>

<template>
  <main class="profile-page">
    <div class="container-fluid py-4">
      <div class="row profile-overview">
        <div class="col-lg-8 col-md-7">
          <div class="card mb-4">
            <div class="card-header pb-0">
              <div class="d-flex align-items-center">
                <h5 class="mb-0">Edit Profile</h5>
                <argon-button color="success" size="sm" class="ms-auto d-flex align-items-center" @click="saveChanges"
                  :disabled="!allPhonesValid || isSaving">
                  Save Changes

                  <span v-if="isSaving" class="spinner-border spinner-border-sm ms-2"></span>
                </argon-button>
              </div>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <label for="username" class="form-label">First Name</label>
                  <argon-input id="username" type="text" v-model="userName" />
                </div>
                <div class="col-md-6">
                  <label for="username" class="form-label">Last Name</label>
                  <argon-input id="username" type="text" v-model="userLastName" />
                </div>
                <div class="col-md-6">
                  <label for="email" class="form-label">Email address</label>
                  <argon-input id="email" type="email" v-model="userEmail" />
                </div>
                <div class="col-md-6">
                  <label for="position" class="form-label">Position</label>
                  <argon-input id="position" type="text" v-model="userPosition" />
                </div>
              </div>

              <hr />
              <h6 class="text-uppercase text-sm">Contact Information</h6>
              <div class="row">
                <div class="col-md-4">
                  <label for="city" class="form-label">City</label>
                  <argon-input id="city" type="text" v-model="userCity" />
                </div>
                <div class="col-md-4">
                  <label for="country" class="form-label">Country</label>
                  <argon-input id="country" type="text" v-model="userCountry" />
                </div>
                <div class="col-md-4">
                  <label for="state" class="form-label">State</label>
                  <argon-input id="state" type="text" v-model="userState" />
                </div>
              </div>

              <hr />
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="text-uppercase text-sm">Phone Numbers</h6>
                <argon-button color="primary" size="sm" @click="addPhoneNumber" title="Add another phone number">
                  <i class="fas fa-plus me-1"></i> Add Phone
                </argon-button>
              </div>

              <div v-if="userPhones.length === 0" class="text-muted my-3 ps-1">
                No phone numbers added. Click 'Add Phone' to add one.
              </div>

              <div v-for="(phoneEntry, index) in userPhones" :key="phoneEntry.tempId || index"
                class="phone-entry-row align-items-start border-bottommb-3">
                <div class="flex-grow-1">
                  <argon-input-phone :id="'profile-phone-' + index" :label="userPhones.length > 1 ? 'Phone ' + (index + 1) : 'Phone'
                    " v-model="userPhones[index]" :countries="allCountriesForPhoneInput" :default-country-iso-code="phoneEntry.CC
                      ? countriesList.find(
                        (c) => c.dialCode === phoneEntry.CC
                      )?.isoCode || defaultPhoneCountryIso
                      : defaultPhoneCountryIso
                      " placeholder="Enter phone number" @validity-change="
                        (isValid) => handlePhoneValidity(index, isValid)
                      " />
                </div>
                <div class="ms-2 pt-4">
                  <argon-button v-if="userPhones.length > 0" color="danger" size="sm" class="btn-icon-only"
                    title="Remove this phone number" @click="removePhoneNumber(index)" aria-label="Remove phone number">
                    <i class="fas fa-trash"></i>
                  </argon-button>
                </div>
              </div>
              <hr />
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="text-uppercase text-sm">Links</h6>
                <argon-button color="primary" size="sm" @click="addLink" title="Add another link">
                  <i class="fas fa-plus me-1"></i> Add Link
                </argon-button>
              </div>
              <div v-for="(linkEntry, index) in userLinks" :key="linkEntry.tempId || index"
                class="link-entry-row align-items-start border-bottom mb-3">
                <div class="icon-entry">
                  <argon-icon-picker :id="'profile-link-type-' + index" v-model="userLinks[index].icon"
                    :options="linkIcons" placeholder="Select social platform" />
                </div>
                <div class="url-input">
                  <argon-input :id="'profile-link-' + index" v-model="userLinks[index].link"
                    :placeholder="'Enter your profile URL'" />
                </div>
                <argon-button v-if="userLinks.length > 0" color="danger" size="sm" class="btn-icon-only"
                  title="Remove this link" @click="removeLink(index)" aria-label="Remove link">
                  <i class="fas fa-trash"></i>
                </argon-button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4 col-md-5">
          <profile-card :user="profileData?.data" @image-uploaded="uploadProfileImage" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.profile-overview {
  background-color: #f5f5f5;
  padding-top: 7%;
}

.profile-page {
  background-color: #f8f9fa;
}

.card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.form-label {
  font-weight: 500;
  color: #6e707c;
}

.argon-button {
  border-radius: 12px;
  padding: 8px 24px;
  /* Default padding, adjust as needed for icon buttons */
}

.argon-button.btn-sm i {
  /* Style for icons in small buttons */
  font-size: 0.875rem;
  /* Adjust icon size if needed */
}

/* Ensure ArgonButton with only icon can be sized appropriately */
.col-md-1 .argon-button {
  padding: 0.5rem 0.75rem;
  /* Adjust for smaller button with just icon */
}

@media (max-width: 768px) {
  .profile-overview {
    flex-direction: column-reverse;
  }

  .col-md-1 .argon-button {
    /* Stack remove button nicely on mobile */
    margin-top: 0.5rem;
  }
}

/* Profile.vue styles */
.phone-entry-row {
  display: flex;
  /* align-items-start; -- Aligns based on the top of the ArgonInputPhone component (including its label) */
  /* align-items: center; -- Might be better if ArgonInputPhone's internal label vertical align is tricky */
}

/* If ArgonInputPhone's label is consistently above the input part: */
.phone-entry-row .pt-4 {
  /* Heuristic for remove button alignment */
  padding-top: 2.1rem !important;
  /* Adjust this value to visually align button with input field */
  /* This depends on the height of ArgonInputPhone's label + its margin */
}

.btn-icon-only {
  width: 2.375rem;
  /* Approx 38px, common for icon buttons */
  height: 2.375rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  /* Ensures icon is centered if text-based */
}

.btn-icon-only i.fas {
  /* If you use Font Awesome */
  margin-right: 0 !important;
  /* Override Bootstrap's .me-1 if present on icon */
  font-size: 0.9rem;
  /* Adjust icon size within button */
}

/* Optional: Add a light border to visually separate entries if many */
.phone-entry-row.border-bottom {
  border-bottom: 1px solid #e9ecef;
  /* Light border */
}

.phone-entry-row:last-child.border-bottom {
  border-bottom: none;
  /* No border for the last item */
}

/* Styling for the main "Phone Numbers" heading and "Add Phone" button */
.d-flex.justify-content-between.align-items-center.mb-3 h6 {
  color: #8898aa;
  /* Argon subtle text color for headings */
  font-weight: 600;
}

/* Social Link Entry Styling */
.link-entry-row {
  display: flex;
  align-items: center;
  /* Center align all elements vertically */
  gap: 0.75rem;
  /* Space between icon selector and input */
  padding: 0.5rem 0;
  /* Add some vertical padding */
}

.argon-select {
  flex-shrink: 0;
  /* Prevent resizing */
  min-width: 120px;
  /* Ensure enough width for icons */
}

.argon-input {
  flex-grow: 1;
  /* Take remaining space */
}

/* Optional: Fine-tune icon selector height */
.argon-select .form-control {
  padding-top: 0.6rem !important;
  /* Match input field height */
  padding-bottom: 0.6rem !important;
}

/* Remove button styling */
.btn-icon-only {
  flex-shrink: 0;
  /* Don't shrink */
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: all 0.15s ease-in-out;
}

.btn-icon-only:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.25rem 0.5rem rgba(220, 53, 69, 0.3);
}

.btn-icon-only i {
  font-size: 0.875rem;
}

.url-input {
  flex-grow: 1;
  /* Take remaining space */
}

.icon-entry {
  flex-shrink: 0;
  /* Prevent resizing */
  min-width: 180px;
  /* Ensure enough width for icons and labels */
}

/* .remove-button {
  margin-top: auto; 
  width: 2rem;
  height: 2rem;
} */

/* SweetAlert is used for error handling */
</style>
