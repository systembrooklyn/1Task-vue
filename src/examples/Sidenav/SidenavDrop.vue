<script setup>
import { ref } from "vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  icon: {
    type: String,
    default: "",
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const showDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 100);
};
</script>

<template>
  <li class="nav-item dropdown">
    <a
      href="#"
      class="nav-link dropdown-toggle d-flex align-items-center"
      role="button"
      @click.prevent="toggleDropdown"
      @blur="closeDropdown"
      :class="[
        showDropdown ? 'show' : '',
        darkMode ? 'text-white' : 'text-dark',
      ]"
    >
      <i :class="[icon, 'text-info text-sm opacity-10 text-center']"></i>
      <span class="nav-link-text ms-1">{{ title }}</span>
    </a>
    <ul
      class="dropdown-menu dropdown-menu-end"
      :class="{ show: showDropdown }"
      style="z-index: 1050; position: absolute; top: 100%; left: 0"
    >
      <li
        v-for="item in items"
        :key="item.to"
        class="dropdown-item"
        :class="item.active ? 'active' : ''"
      >
        <router-link :to="item.to" class="d-flex align-items-center">
          <i :class="[item.icon, 'me-2']"></i>
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </li>
</template>

<style scoped>
.nav-item .dropdown-menu {
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.dropdown-menu .active {
  background-color: #F6F9FC;
  color: #000000;
  font-weight: 500;
  border-radius: 5px;
}

.dropdown-menu .active:hover {
  background-color: #F6F9FC;
}
</style>
