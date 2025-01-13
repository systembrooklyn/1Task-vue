<template>
    <div class="form-group">
        <!-- عرض القيم المختارة مع أسمائها -->
        <div v-if="internalModelValue.length" class="selected-options">
            <span v-for="(selected, index) in internalModelValue" :key="selected" class="selected-option">
                {{ internalModelNames[index] ? `${internalModelNames[index]} ` : selected }}
                <button type="button" class="btn-remove" @click="removeOption(selected)">
                    ×
                </button>
            </span>
        </div>

        <!-- القائمة المنسدلة -->
        <div :class="hasIcon(icon)">
            <span v-if="iconDir === 'left'" class="input-group-text">
                <i :class="getIcon(icon)"></i>
            </span>
            <select :id="id" class="form-control" :class="getClasses(size, success, error)" :name="name"
                :required="isRequired" @change="handleChange">
                <option value="" selected disabled>{{ placeholder }}</option>
                <option v-for="option in options.filter(option => !internalModelValue.includes(option.value))" :key="option.value" :value="option.value">
                    {{ option.label }}
                </option>
            </select>
            <span v-if="iconDir === 'right'" class="input-group-text">
                <i :class="getIcon(icon)"></i>
            </span>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const emit = defineEmits(["update:modelValue", "update:modelNames"]);

const props = defineProps({
    size: {
        type: String,
        default: "default",
    },
    success: {
        type: Boolean,
        default: false,
    },
    error: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: String,
        default: "",
    },
    iconDir: {
        type: String,
        default: "",
    },
    name: {
        type: String,
        default: "",
    },
    id: {
        type: String,
        default: "",
    },
    modelValue: {
        type: Array,
        default: () => [],
    },
    modelNames: {
        type: Array,
        default: () => [],
    },
    placeholder: {
        type: String,
        default: "",
    },
    isRequired: {
        type: Boolean,
        default: false,
    },
    options: {
        type: Array,
        default: () => [],
    },
});

// إنشاء متغيرات محلية
const internalModelValue = ref([...props.modelValue]);
const internalModelNames = ref([...props.modelNames]);

// مراقبة التغييرات في props وتحديث المتغيرات المحلية
watch(() => props.modelValue, (newVal) => {
    internalModelValue.value = [...newVal];
});

watch(() => props.modelNames, (newVal) => {
    internalModelNames.value = [...newVal];
});

const getClasses = (size, success, error) => {
    let sizeValue, isValidValue;

    sizeValue = size ? `form-control-${size}` : "";

    if (error) {
        isValidValue = "is-invalid";
    } else if (success) {
        isValidValue = "is-valid";
    } else {
        isValidValue = "";
    }

    return `${sizeValue} ${isValidValue}`.trim();
};

const getIcon = (icon) => (icon ? icon : "");
const hasIcon = (icon) => (icon ? "input-group" : "");

// عند اختيار خيار فردي
const handleChange = (event) => {
    const selectedValue = event.target.value;
    const selectedOption = event.target.options[event.target.selectedIndex];
    const selectedText = selectedOption ? selectedOption.text : "";

    console.log("selectedValue:", selectedValue);
    console.log("selectedText:", selectedText);

    // فقط أضف القيمة إذا لم تكن موجودة
    if (!internalModelValue.value.includes(selectedValue)) {
        internalModelValue.value.push(selectedValue);
        internalModelNames.value.push(selectedText);

        emit('update:modelValue', internalModelValue.value); // تحديث modelValue
        emit('update:modelNames', internalModelNames.value); // تحديث modelNames
    }

    // إعادة تعيين القيمة المختارة لمنع التحديد المتعدد
    event.target.value = "";
};

// دالة لحذف القيم المختارة
const removeOption = (optionToRemove) => {
    const index = internalModelValue.value.indexOf(optionToRemove);
    if (index !== -1) {
        internalModelValue.value.splice(index, 1);
        internalModelNames.value.splice(index, 1);

        emit('update:modelValue', internalModelValue.value);
        emit('update:modelNames', internalModelNames.value);
    }
};
</script>

<style scoped>
.selected-options {
    margin-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.selected-option {
    display: inline-flex;
    align-items: center;
    background-color: #f1f1f1;
    padding: 5px 10px;
    border-radius: 5px;
    position: relative;
}

.btn-remove {
    margin-left: 10px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: red;
}

.btn-remove:hover {
    color: darkred;
}
</style>
