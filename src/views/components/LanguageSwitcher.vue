<template>
  <button class="language-toggle-btn" type="button" @click="toggleLanguage"
    :title="currentLanguage === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'">
    <i class="fas fa-globe me-2"></i>
    <span>{{ currentLanguage === 'ar' ? 'English' : 'العربية' }}</span>
  </button>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/i18n";

export default {
  name: "LanguageDropdown",
  setup() {
    const store = useStore();
    const { locale } = useI18n();

    // استخدام i18n locale كأولوية، مع fallback إلى store
    const currentLanguage = computed(() => locale.value || store.getters.currentLanguage);

    const toggleLanguage = () => {
      const newLanguage = currentLanguage.value === 'ar' ? 'en' : 'ar';
      // setLocale يحدث كل شيء (i18n, store, RTL)
      setLocale(newLanguage);
    };

    return {
      currentLanguage,
      toggleLanguage,
    };
  },
};
</script>

<style scoped>
.language-toggle-btn {
  width: auto;
  min-width: 100px;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: inherit;
}

.language-toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.02);
  border-color: rgba(0, 0, 0, 0.2);
}

.language-toggle-btn i {
  font-size: 16px;
  margin-right: 6px;
}

.language-toggle-btn span {
  white-space: nowrap;
}

/* Dark mode support */
.dark-version .language-toggle-btn {
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.dark-version .language-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(144, 177, 64, 1);
}

/* Small screen adjustments */
@media (max-width: 767px) {
  .language-toggle-btn {
    min-width: 80px;
    height: 36px;
    padding: 0 8px;
    font-size: 12px;
  }

  .language-toggle-btn i {
    font-size: 14px;
    margin-right: 4px;
  }
}
</style>
