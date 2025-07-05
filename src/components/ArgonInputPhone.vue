// components/ArgonInputPhone.vue
<template>
  <div class="form-group argon-input-phone">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <div 
      class="input-group"
      :class="{
        'is-focused': isFocused,
        'is-invalid': !isValid && localPhoneNumber.length > 0 && touched,
        'is-disabled': disabled
      }"
    >
      <div class="input-group-prepend">
        <select
          :id="id + '-country-select'"
          v-model="selectedIsoCode"
          class="custom-select country-select"
          @change="onCountryChange"
          :disabled="disabled"
          aria-label="Country code"
          @focus="isFocused = true"
          @blur="isFocused = false"
        >
        <option
        v-for="country in countries"
        :key="country.isoCode"
        :selected="selectedIsoCode === country.isoCode" :value="country.isoCode"
        class="country-option"
      >
        <span v-if="showFlags" class="flag-icon" :class="`flag-icon-${country.isoCode.toLowerCase()}`"></span>
        <span class="country-select-name">{{ country.name }}</span>
        <span class="country-select-code">(+{{ country.dialCode }})</span>
      </option>
        </select>
      </div>

      <input
        :id="id"
        type="tel"
        class="form-control phone-input"
        :value="localPhoneNumber"
        @input="onPhoneInput"
        @blur="onInputBlur"
        @focus="isFocused = true"
        ref="phoneInputRef"
        :placeholder="placeholder"
        :disabled="disabled"
        aria-label="Phone number"
      />
    </div>
    <div v-if="!isValid && localPhoneNumber.length > 0 && touched && showValidationMessages" class="invalid-feedback d-block">
      Please enter a valid phone number for the selected country.
    </div>
  </div>
</template>

<script setup>
// ... (your existing script setup - IMPORTANT: add isFocused ref)
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ CC: '', phone: '' }), // CC is dialCode
    required: true
  },
  countries: {
    type: Array,
    required: true, // Expects [{ name: 'Egypt', dialCode: '20', isoCode: 'eg' }, ...]
  },
  id: {
    type: String,
    default: () => `argon-phone-input-${Math.random().toString(36).substr(2, 9)}`
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Phone number'
  },
  defaultCountryIsoCode: { // e.g., 'us', 'eg'
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showFlags: {
    type: Boolean,
    default: true, 
  },
  showValidationMessages: {
    type: Boolean,
    default: true,
  },
  autoFormat: { 
    type: Boolean,
    default: true,
  }
});

const emit = defineEmits(['update:modelValue', 'validity-change']);

const phoneInputRef = ref(null);
const selectedIsoCode = ref('');
const localPhoneNumber = ref(''); 
const isValid = ref(true);
const touched = ref(false);
const isFocused = ref(false); // NEW: For focus styling on the input-group

const asYouTypeFormatter = new AsYouType();

const selectedCountry = computed(() => {
  return props.countries.find(c => c.isoCode.toLowerCase() === selectedIsoCode.value.toLowerCase());
});

function initialize() {
  let initialPhone = ''; // Declared here
  let initialIsoCode = props.defaultCountryIsoCode;

  if (props.modelValue && props.modelValue.phone) {
    initialPhone = props.modelValue.phone;
  }

  if (!initialIsoCode && props.countries.length > 0) {
    initialIsoCode = props.countries[0].isoCode;
  }

  selectedIsoCode.value = initialIsoCode || '';
  asYouTypeFormatter.reset();

  if (selectedCountry.value) {
    localPhoneNumber.value = formatNumberForDisplay(
      initialPhone,
      selectedCountry.value.isoCode.toUpperCase()
    );
  } else {
    localPhoneNumber.value = initialPhone;
  }

  validateAndUpdate(false);
}

function formatNumberForDisplay(number, countryCode) {
  if (!number) return '';
  // Always try to format with AsYouType for initial display consistency if number exists
  // This helps if modelValue.phone is already partially formatted or just digits.
  asYouTypeFormatter.reset();
  let formattedInitial = asYouTypeFormatter.input(`+${selectedCountry.value?.dialCode || ''}${number}`);
  
  // If autoFormat is off, or for a final nice display of national format from raw digits
  if (!props.autoFormat || !formattedInitial) { // Fallback for non-autoFormat or if AsYouType struggles initially
      const phoneNumberInstance = parsePhoneNumberFromString(number, countryCode);
      return phoneNumberInstance ? phoneNumberInstance.formatNational() : number;
  }
  return formattedInitial;
}

onMounted(() => {
  initialize();
});

watch(() => props.modelValue, (newVal, oldVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
    const currentEmittedCC = selectedCountry.value?.dialCode;
    const currentEmittedPhone = (parsePhoneNumberFromString(localPhoneNumber.value, selectedCountry.value?.isoCode.toUpperCase())?.nationalNumber || localPhoneNumber.value.replace(/\D/g, ''));

    if (newVal.CC !== currentEmittedCC || newVal.phone !== currentEmittedPhone) {
        initialize();
    }
  }
}, { deep: true });

watch(() => props.countries, () => {
  initialize();
}, { deep: true });

watch(selectedIsoCode, (newIsoCode, oldIsoCode) => {
  if (newIsoCode !== oldIsoCode) {
    asYouTypeFormatter.reset(); 
    // When country changes, it's good to clear the phone number or re-validate.
    // For now, let's re-validate. If the number was for the old country, it'll likely become invalid.
    // User might expect number to clear:
    // localPhoneNumber.value = ''; 
    validateAndUpdate();
    nextTick(() => {
      phoneInputRef.value?.focus();
    });
  }
});

function onCountryChange() {
  touched.value = true;
  
  // أضف رمز البلد مع علامة "+" إلى القيمة
  localPhoneNumber.value = `+${selectedCountry.value.dialCode}`;
  
  nextTick(() => {
    if (phoneInputRef.value) {
      // ضع المؤشر في نهاية رمز البلد
      const cursorPosition = `+${selectedCountry.value.dialCode}`.length;
      phoneInputRef.value.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
}

function onInputBlur() {
    isFocused.value = false;
    formatOnBlur(); // Existing blur formatting logic
}

function onPhoneInput(event) {
  if (!touched.value) touched.value = true;
  
  const inputValue = event.target.value;
  const selectionStart = event.target.selectionStart;
  
  localPhoneNumber.value = inputValue;

  if (props.autoFormat && selectedCountry.value) {
    // Use selectionStart here
    nextTick(() => {
      if (phoneInputRef.value && selectionStart !== null) {
        phoneInputRef.value.setSelectionRange(selectionStart, selectionStart);
      }
    });
  } else {
    // احتفظ برقم الهاتف مع رمز البلد
    validateAndUpdate();
  }
}

function formatOnBlur() {
  isFocused.value = false;
  if (selectedCountry.value && localPhoneNumber.value) {
    let fullNumberToParse = localPhoneNumber.value;
    
    // إذا لم يكن الرقم يبدأ برمز البلد، أضفه
    if (!fullNumberToParse.startsWith(`+${selectedCountry.value.dialCode}`)) {
      fullNumberToParse = `+${selectedCountry.value.dialCode}${fullNumberToParse.replace(/\D/g, '')}`;
    }
    
    const phoneNumberInstance = parsePhoneNumberFromString(fullNumberToParse);
    if (phoneNumberInstance?.isValid()) {
      localPhoneNumber.value = phoneNumberInstance.formatNational();
    }
  }
  validateAndUpdate(false);
}


function validateAndUpdate(setTouched = true) {
  if (setTouched && !touched.value) touched.value = true;
  
  if (!selectedCountry.value) {
    isValid.value = false;
    emitUpdateParent('', localPhoneNumber.value.replace(/\D/g, ''));
    return;
  }

  let nationalPart = localPhoneNumber.value.replace(/\D/g, '');
  
  // إذا كان الرقم يحتوي على رمز البلد بالفعل، استخراج الأرقام فقط
  if (localPhoneNumber.value.startsWith(`+${selectedCountry.value.dialCode}`)) {
    nationalPart = localPhoneNumber.value.slice(selectedCountry.value.dialCode.length + 1);
  }

  const fullNumberToParse = `+${selectedCountry.value.dialCode}${nationalPart}`;
  const phoneNumberInstance = parsePhoneNumberFromString(fullNumberToParse);

  if (phoneNumberInstance && phoneNumberInstance.isValid()) {
    isValid.value = true;
    emitUpdateParent(
      selectedCountry.value.dialCode,
      phoneNumberInstance.nationalNumber
    );
  } else {
    isValid.value = false;
    emitUpdateParent(
      selectedCountry.value.dialCode,
      nationalPart
    );
  }
}

function emitUpdateParent(dialCode, nationalNum) {
  const newModelValue = {
    CC: dialCode || '',
    phone: nationalNum || ''
  };
  emit('update:modelValue', newModelValue);
}
// ... (rest of your script setup)
</script>

<style scoped>
/* Basic variables (consider moving to a global scope or props if more complex theming is needed) */
:root {
  --argon-input-border-color: #dee2e6; /* Standard Bootstrap border */
  --argon-input-focus-border-color: #80bdff; /* Bootstrap default focus */
  --argon-input-focus-box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); /* Bootstrap default focus */
  --argon-danger-border-color: #dc3545; /* Bootstrap danger */
  --argon-danger-focus-box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  --argon-input-bg: #fff;
  --argon-input-disabled-bg: #e9ecef;
  --argon-input-placeholder-color: #6c757d;
  --argon-text-muted: #6c757d;
  --argon-font-size-base: 1rem; /* Adjust if your theme uses a different base */
  --argon-input-padding-y: 0.5rem; /* Argon specific padding */
  --argon-input-padding-x: 0.75rem; /* Argon specific padding */
  --argon-input-height: calc(1.5em + 1rem + 2px); /* Matches bs input-height */
}

.argon-input-phone .form-label {
  font-weight: 600; /* Slightly bolder labels */
  margin-bottom: 0.5rem;
  color: #525f7f; /* Argon text color */
  font-size: 0.875rem;
}

.argon-input-phone .input-group {
  border-radius: 0.375rem; /* Bootstrap default border-radius */
  border: 1px solid var(--argon-input-border-color);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  display: flex; /* Ensure children are flex items */
}

.argon-input-phone .input-group:hover {
  border-color: #adb5bd; /* Slightly darker on hover */
}

.argon-input-phone .input-group.is-focused {
  border-color: var(--argon-input-focus-border-color);
  box-shadow: var(--argon-input-focus-box-shadow);
}

.argon-input-phone .input-group.is-invalid {
  border-color: var(--argon-danger-border-color);
}
.argon-input-phone .input-group.is-invalid.is-focused {
  box-shadow: var(--argon-danger-focus-box-shadow);
}


/* --- NEW / ENHANCED STYLES START HERE --- */

/* Styling for the select (country picker) */
.argon-input-phone .country-select {
  /* Overriding Bootstrap's custom-select defaults for a more integrated look */
  background-color: var(--argon-input-bg);
  border: none; /* Border is handled by input-group */
  /* color: #495057; Bootstrap default */
  color: #525f7f; /* Argon text color */
  font-size: var(--argon-font-size-base);
  padding: var(--argon-input-padding-y) var(--argon-input-padding-x);
  padding-right: 2.25rem; /* Space for dropdown arrow */
  height: var(--argon-input-height);
  line-height: 1.5; /* Bootstrap default */
  flex-grow: 0; /* Don't grow */
  flex-shrink: 0; /* Don't shrink initially */
  min-width: 80px; /* Minimum width for flags + short codes */
  max-width: 200px; /* Allow it to be a bit wider for longer country names */
  appearance: none; /* Remove default system appearance */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e"); /* Bootstrap 5 arrow */
  background-repeat: no-repeat;
  background-position: right var(--argon-input-padding-x) center;
  background-size: 16px 12px; /* Bootstrap 5 arrow size */
  border-top-left-radius: 0.375rem; /* Match group */
  border-bottom-left-radius: 0.375rem; /* Match group */
  border-top-right-radius: 0; /* Flat edge with input */
  border-bottom-right-radius: 0; /* Flat edge with input */
  transition: none; /* Remove individual transition, group handles it */
  box-shadow: none; /* Remove individual shadow */
}

.argon-input-phone .country-select:focus {
  outline: none; /* Focus is handled by input-group */
  box-shadow: none;
}

/* Options within the select */
.argon-input-phone .country-option {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem; /* Adjust padding within option */
}

.argon-input-phone .flag-icon {
  width: 1.75em; /* Slightly larger flags for clarity */
  height: 1.25em; /* Maintain aspect ratio */
  margin-right: 0.65em;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  display: inline-block;
  vertical-align: middle; /* Align better with text */
  flex-shrink: 0;
}
.argon-input-phone .country-select-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 0.3em;
}
.argon-input-phone .country-select-code {
 color: var(--argon-text-muted);
 font-size: 0.9em;
}


/* Styling for the phone number input field */
.argon-input-phone .phone-input {
  background-color: var(--argon-input-bg);
  border: none; /* Border is handled by input-group */
  color: #525f7f; /* Argon text color */
  font-size: var(--argon-font-size-base);
  padding: var(--argon-input-padding-y) var(--argon-input-padding-x);
  height: var(--argon-input-height);
  line-height: 1.5; /* Bootstrap default */
  flex-grow: 1; /* Allow phone input to take remaining space */
  min-width: 120px; /* Prevent it from becoming too small */
  border-top-left-radius: 0; /* Flat edge with select */
  border-bottom-left-radius: 0; /* Flat edge with select */
  border-top-right-radius: 0.375rem; /* Match group */
  border-bottom-right-radius: 0.375rem; /* Match group */
  transition: none; /* Remove individual transition, group handles it */
  box-shadow: none; /* Remove individual shadow */
}

.argon-input-phone .phone-input::placeholder {
  color: var(--argon-input-placeholder-color);
  opacity: 1; /* Firefox fix */
}

.argon-input-phone .phone-input:focus {
  outline: none; /* Focus is handled by input-group */
  box-shadow: none;
}

/* Disabled state styling for the whole group */
.argon-input-phone .input-group.is-disabled {
    background-color: var(--argon-input-disabled-bg);
    opacity: 0.65;
    border-color: var(--argon-input-border-color); /* Keep border for consistency */
}
.argon-input-phone .input-group.is-disabled .country-select,
.argon-input-phone .input-group.is-disabled .phone-input {
  background-color: var(--argon-input-disabled-bg); /* Ensure children also get disabled bg */
  pointer-events: none; /* Prevent interaction */
}


/* Validation feedback styling */
.argon-input-phone .invalid-feedback {
  color: var(--argon-danger-border-color);
  font-size: 0.875em; /* Bootstrap default */
  margin-top: 0.25rem; /* Space above feedback message */
  display: block; /* Already set in template, but good to ensure */
}

/* --- END OF NEW / ENHANCED STYLES --- */
</style>