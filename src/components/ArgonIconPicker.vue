<!-- ArgonIconPicker.vue -->
<template>
    <div class="form-group argon-icon-picker">
        <label v-if="label" :for="id" class="form-label">{{ label }}</label>
        <div class="icon-picker-dropdown" :class="{ 'is-open': isOpen }">
            <button type="button" :id="id" class="icon-picker-trigger" @click="toggleDropdown" :disabled="disabled"
                aria-haspopup="listbox" :aria-expanded="isOpen">
                <div class="selected-icon">
                    <i v-if="selectedOption?.icon" :class="getIconClass(selectedOption.icon)" class="me-2"></i>
                    <span>{{ selectedOption?.label || placeholder }}</span>
                </div>
                <i class="fas fa-chevron-down dropdown-arrow" :class="{ 'rotated': isOpen }"></i>
            </button>

            <div v-if="isOpen" class="icon-picker-dropdown-menu" :class="{ 'dropdown-up': shouldOpenUp }"
                ref="dropdownMenu">
                <div class="search-container">
                    <input type="text" v-model="searchQuery" placeholder="Search icons..." class="search-input"
                        @keydown.esc="closeDropdown" />
                </div>
                <div class="icon-options-container">
                    <button v-for="option in filteredOptions" :key="option.value" type="button" class="icon-option"
                        :class="{ 'selected': modelValue === option.value }" @click="selectOption(option)">
                        <i :class="getIconClass(option.icon)" class="option-icon"></i>
                        <span class="option-label">{{ option.label }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    options: {
        type: Array,
        required: true,
        // Expected format: [{ value: "github", label: "Github", icon: "fab fa-github" }, ...]
    },
    id: {
        type: String,
        default: () => `argon-icon-picker-${Math.random().toString(36).substr(2, 9)}`
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: 'Select an icon'
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const dropdownMenu = ref(null);
const shouldOpenUp = ref(false);

const selectedOption = computed(() => {
    return props.options.find(option => option.value === props.modelValue);
});

const filteredOptions = computed(() => {
    if (!searchQuery.value) return props.options;
    return props.options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

function getIconClass(iconValue) {
    // Map icon values to FontAwesome classes
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
    return iconMap[iconValue] || 'fas fa-link';
}

function toggleDropdown() {
    if (props.disabled) return;
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        searchQuery.value = '';
        calculateDropdownDirection();
    }
}

function calculateDropdownDirection() {
    // Wait for next tick to ensure DOM is updated
    setTimeout(() => {
        const trigger = document.getElementById(props.id);
        if (!trigger) return;

        const triggerRect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 300; // Max height of dropdown

        // Calculate space below and above
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        // Open upward if there's more space above or not enough space below
        shouldOpenUp.value = spaceAbove > spaceBelow && spaceBelow < dropdownHeight;
    }, 10);
}

function closeDropdown() {
    isOpen.value = false;
    searchQuery.value = '';
}

function selectOption(option) {
    emit('update:modelValue', option.value);
    closeDropdown();
}

function handleClickOutside(event) {
    if (dropdownMenu.value && !dropdownMenu.value.contains(event.target) &&
        !event.target.closest('.icon-picker-trigger')) {
        closeDropdown();
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

watch(isOpen, (newVal) => {
    if (newVal) {
        // Focus search input when dropdown opens
        setTimeout(() => {
            const searchInput = dropdownMenu.value?.querySelector('.search-input');
            searchInput?.focus();
        }, 100);
    }
});
</script>

<style scoped>
.argon-icon-picker {
    position: relative;
}

.form-label {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #525f7f;
    font-size: 0.875rem;
}

.icon-picker-dropdown {
    position: relative;
}

.icon-picker-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    font-size: 1rem;
    color: #525f7f;
    cursor: pointer;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    min-height: calc(1.5em + 1rem + 2px);
}

.icon-picker-trigger:hover:not(:disabled) {
    border-color: #adb5bd;
}

.icon-picker-trigger:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.icon-picker-trigger:disabled {
    background-color: #e9ecef;
    opacity: 0.65;
    cursor: not-allowed;
}

.selected-icon {
    display: flex;
    align-items: center;
    flex: 1;
    text-align: left;
}

.dropdown-arrow {
    transition: transform 0.2s ease;
    font-size: 0.75rem;
    color: #6c757d;
}

.dropdown-arrow.rotated {
    transform: rotate(180deg);
}

.icon-picker-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    margin-top: 0.125rem;
    max-height: 300px;
    overflow: hidden;
}

.icon-picker-dropdown-menu.dropdown-up {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: 0.125rem;
}

.search-container {
    padding: 0.5rem;
    border-bottom: 1px solid #dee2e6;
}

.search-input {
    width: 100%;
    padding: 0.375rem 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    outline: none;
}

.search-input:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.icon-options-container {
    max-height: 240px;
    overflow-y: auto;
}

.icon-option {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease;
}

.icon-option:hover {
    background-color: #f8f9fa;
}

.icon-option.selected {
    background-color: #e7f3ff;
    color: #0056b3;
}

.option-icon {
    margin-right: 0.75rem;
    font-size: 1.1rem;
    width: 1.2rem;
    text-align: center;
}

.option-label {
    font-size: 0.875rem;
}

/* Scrollbar styling */
.icon-options-container::-webkit-scrollbar {
    width: 6px;
}

.icon-options-container::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.icon-options-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.icon-options-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
