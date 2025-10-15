<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Array, default: () => [] },   // [id, id, ...]
    options: { type: Array, default: () => [] },      // [{ value, label }]
    placeholder: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

// Search query for filtering
const searchQuery = ref('')
const containerRef = ref(null)
const selectedIndex = ref(0)

// Convert IDs to display tags
const tags = computed(() => {
    return props.modelValue.map(id => {
        const opt = props.options.find(o => o.value === id)
        return opt ? { id: opt.value, label: opt.label } : null
    }).filter(Boolean)
})

// Filtered options based on search
const filteredOptions = computed(() => {
    if (!searchQuery.value) return []
    const query = searchQuery.value.toLowerCase()
    return props.options.filter(opt =>
        opt.label.toLowerCase().includes(query) &&
        !props.modelValue.includes(opt.value)
    )
})

// Reset selected index when search query changes
watch(searchQuery, () => {
    selectedIndex.value = 0
})

// Add tag
const addTag = (option) => {
    if (!props.modelValue.includes(option.value)) {
        emit('update:modelValue', [...props.modelValue, option.value])
    }
    searchQuery.value = ''
    selectedIndex.value = 0
}

// Handle keyboard navigation
const handleKeyDown = (event) => {
    if (!searchQuery.value || filteredOptions.value.length === 0) return

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault()
            selectedIndex.value = Math.min(selectedIndex.value + 1, filteredOptions.value.length - 1)
            scrollToSelected()
            break
        case 'ArrowUp':
            event.preventDefault()
            selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
            scrollToSelected()
            break
        case 'Enter':
            event.preventDefault()
            if (filteredOptions.value[selectedIndex.value]) {
                addTag(filteredOptions.value[selectedIndex.value])
            }
            break
        case 'Escape':
            searchQuery.value = ''
            break
    }
}

// Scroll to selected item
const scrollToSelected = () => {
    const dropdown = document.querySelector('.options-dropdown')
    const selectedItem = dropdown?.querySelector(`.option-item:nth-child(${selectedIndex.value + 1})`)
    if (selectedItem && dropdown) {
        const itemTop = selectedItem.offsetTop
        const itemBottom = itemTop + selectedItem.offsetHeight
        const dropdownTop = dropdown.scrollTop
        const dropdownBottom = dropdownTop + dropdown.clientHeight

        if (itemTop < dropdownTop) {
            dropdown.scrollTop = itemTop
        } else if (itemBottom > dropdownBottom) {
            dropdown.scrollTop = itemBottom - dropdown.clientHeight
        }
    }
}

// Remove tag
const removeTag = (tagId) => {
    emit('update:modelValue', props.modelValue.filter(id => id !== tagId))
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
    if (containerRef.value && !containerRef.value.contains(event.target)) {
        searchQuery.value = ''
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="argon-tags-input" ref="containerRef">
        <div class="tags-container">
            <!-- Display selected tags -->
            <span v-for="tag in tags" :key="tag.id" class="tag-pill">
                {{ tag.label }}
                <button type="button" @click="removeTag(tag.id)" class="remove-btn">×</button>
            </span>

            <!-- Input field -->
            <input v-model="searchQuery" type="text" :placeholder="tags.length === 0 ? placeholder : ''"
                class="tag-input" @keydown="handleKeyDown" />
        </div>

        <!-- Dropdown with filtered options -->
        <div v-if="searchQuery && filteredOptions.length > 0" class="options-dropdown">
            <div v-for="(option, index) in filteredOptions" :key="option.value" class="option-item"
                :class="{ 'selected': index === selectedIndex }" @click="addTag(option)"
                @mouseenter="selectedIndex = index">
                {{ option.label }}
            </div>
        </div>
        <div v-else-if="searchQuery && filteredOptions.length === 0" class="options-dropdown">
            <div class="no-results">No results found</div>
        </div>
    </div>
</template>

<style scoped>
.argon-tags-input {
    position: relative;
    width: 100%;
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: white;
    min-height: 38px;
    align-items: center;
    transition: all 0.2s ease;
}

.tags-container:focus-within {
    border-color: #5e72e4;
    box-shadow: 0 1px 3px rgba(94, 114, 228, 0.2);
}

.tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #e8eaf6;
    color: #3949ab;
    padding: 3px 8px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid #c5cae9;
    transition: all 0.2s ease;
}

.tag-pill:hover {
    background: #c5cae9;
}

.remove-btn {
    background: transparent;
    border: none;
    color: #3949ab;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 0;
    margin: 0;
    margin-left: 2px;
    font-weight: bold;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.remove-btn:hover {
    opacity: 1;
    color: #1a237e;
}

.tag-input {
    flex: 1;
    min-width: 120px;
    border: none;
    outline: none;
    padding: 4px;
    font-size: 14px;
    background: transparent;
}

.tag-input::placeholder {
    color: #8898aa;
}

.options-dropdown {
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #dadce0;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08);
    max-height: 240px;
    overflow-y: auto;
    /* z-index managed by z-index-variables.css */
    animation: dropdownFadeIn 0.15s ease-out;
}

@keyframes dropdownFadeIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.option-item {
    padding: 10px 14px;
    cursor: pointer;
    font-size: 14px;
    color: #202124;
    transition: background-color 0.1s ease;
    border-bottom: 1px solid #f1f3f4;
}

.option-item:last-child {
    border-bottom: none;
}

.option-item:hover {
    background-color: #f1f3f4;
}

.option-item.selected {
    background-color: #e8eaf6;
    color: #3949ab;
    font-weight: 500;
}

.no-results {
    padding: 10px 12px;
    font-size: 14px;
    color: #8898aa;
    text-align: center;
    font-style: italic;
}

/* RTL Support */
.rtl .tags-container {
    direction: rtl;
}

.rtl .tag-pill {
    flex-direction: row-reverse;
}
</style>
