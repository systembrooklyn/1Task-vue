<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();
const isRTL = computed(() => store.state.isRTL);
const sidebarMinimize = () => store.commit("sidebarMinimize");

const minimizeSidebar = () => {
  if (window.innerWidth < 1200) {
    sidebarMinimize();
  }
};

defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
  navText: {
    type: String,
    required: true,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <router-link :to="to" class="nav-link d-flex align-items-center" :class="{ active: active }" @click="minimizeSidebar"
    :title="collapsed ? navText : ''">
    <div class="icon icon-shape icon-sm text-center d-flex align-items-center justify-content-center sidebar-icon">
      <slot name="icon"></slot>
    </div>
    <span v-if="!collapsed" class="nav-link-text" :class="isRTL ? ' me-1' : 'ms-1'">
      {{ navText }}
    </span>
  </router-link>
</template>

<style scoped>
.sidebar-icon {
  min-width: 24px;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-link {
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  border-radius: 0.375rem;
  margin: 0.125rem 0.5rem;
}

.nav-link:hover {
  background-color: rgba(144, 177, 64, 0.15);
  color: #1a1a1a;
}

.nav-link.router-link-active,
.nav-link.router-link-exact-active,
.nav-link.active {
  background-color: rgba(144, 177, 64, 0.15) !important;
  color: #1a1a1a !important;
  font-weight: 500;
}

.nav-link.router-link-active .sidebar-icon i,
.nav-link.router-link-active .sidebar-icon span,
.nav-link.router-link-active .material-symbols-rounded,
.nav-link.router-link-exact-active .sidebar-icon i,
.nav-link.router-link-exact-active .sidebar-icon span,
.nav-link.router-link-exact-active .material-symbols-rounded,
.nav-link.active .sidebar-icon i,
.nav-link.active .sidebar-icon span,
.nav-link.active .material-symbols-rounded {
  color: inherit !important;
}
</style>
