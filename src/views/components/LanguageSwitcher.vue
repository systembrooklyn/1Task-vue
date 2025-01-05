<template>
  <div class="dropdown language-dropdown">
    <button
  class="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
  type="button"
  id="languageDropdown"
  data-bs-toggle="dropdown"
  aria-expanded="false"
>
  <i class="fas fa-globe me-2"></i>
  <span>{{ currentLanguage === 'ar' ? 'العربية' : 'English' }}</span>
  <!-- <i class="ms-2 fas fa-chevron-down"></i> -->
</button>

<ul class="dropdown-menu" aria-labelledby="languageDropdown">
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
      <i class="fas fa-check " v-if="currentLanguage === 'ar'" style="margin-left: 7px;"></i>
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

      // تحديث اتجاه النص واللغة
      const isRTL = language === "ar";
      document.querySelector("html").setAttribute("lang", language);
      document.querySelector("html").setAttribute("dir", isRTL ? "rtl" : "ltr");
      document.querySelector("#app").classList.toggle("rtl", isRTL);
    };

    return {
      currentLanguage,
      setLanguage,
    };
  },
};
</script>

<style scoped>
.language-dropdown {
  display: inline-block;
  position: relative;
}

.language-dropdown .dropdown-toggle {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.language-dropdown .dropdown-toggle:hover {
  background-color: #fff;
  border-color: #A8CB59;
  color: #A8CB59;
}

.language-dropdown .dropdown-menu {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 0.9rem;
  animation: fadeIn 0.3s ease-in-out;
}

.language-dropdown .dropdown-item {
  padding: 0.5rem 1.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.language-dropdown .dropdown-item:hover {
  background-color: #A8CB59;
  color: white;
}

.language-dropdown .dropdown-item i {
  color: #A8CB59;
}

.language-dropdown .dropdown-item:hover i {
  color: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
