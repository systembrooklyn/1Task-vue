<template>
  <div class=" language-dropdown">
    <button
      class="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
      type="button"
      id="languageDropdown"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i class="fas fa-globe mx-2"></i>
      <span>{{ currentLanguage === 'ar' ? 'العربية' : 'English' }}</span>
    </button>

    <!-- Dropdown menu with dynamic alignment -->
    <ul
      class="dropdown-menu"
      :class="dropdownAlignment"
      aria-labelledby="languageDropdown"
    >
      <li>
        <a
          class="dropdown-item d-flex align-items-center"
          href="#"
          @click.prevent="setLanguage('en')"
        >
          <i class="fas fa-check me-2" v-if="currentLanguage === 'en'"></i>
          English
        </a>
      </li>
      <li>
        <a
          class="dropdown-item d-flex align-items-center"
          href="#"
          @click.prevent="setLanguage('ar')"
        >
          <i class="fas fa-check" v-if="currentLanguage === 'ar'" style="margin-left: 7px;"></i>
          العربية
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "LanguageDropdown",
  setup() {
    const store = useStore();

    const currentLanguage = computed(() => store.getters.currentLanguage);

    const setLanguage = (language) => {
      store.dispatch("changeLanguage", language);

      // Update text direction and language
      const isRTL = language === "ar";
      document.documentElement.setAttribute("lang", language);
      document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
      document.querySelector("#app").classList.toggle("rtl", isRTL);
    };

    // Compute dropdown alignment dynamically
    const dropdownAlignment = computed(() =>
      currentLanguage.value === "ar" ? "dropdown-menu-end" : ""
    );

    return {
      currentLanguage,
      setLanguage,
      dropdownAlignment,
    };
  },
};
</script>

