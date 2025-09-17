// components/ArgonInputPhone.vue
<template>
  <div class="form-group argon-input-phone">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <vue-tel-input :id="id" v-model="localValue" :disabled="disabled" :placeholder="placeholder" :mode="'international'"
      :defaultCountry="resolvedDefaultCountry" :autoDefaultCountry="false" :onlyCountries="onlyCountries"
      :inputOptions="{ showDialCode: true, maxlength: 20 }" @validate="handleValidate"
      @country-changed="handleCountryChanged" @input="handleInput" />
    <div v-if="showValidationMessages && touched && !isValid && (localValue?.length || 0) > 0"
      class="invalid-feedback d-block">
      Please enter a valid phone number for the selected country.
    </div>
  </div>
  <!-- NOTE: Styles below lightly adapt vue-tel-input to Argon look -->
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ CC: '', phone: '' }),
    required: true
  },
  countries: {
    type: Array,
    required: true
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
  defaultCountryIsoCode: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showValidationMessages: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'validity-change']);

// Internal state for vue-tel-input (expects a string like +20123456789)
const localValue = ref('');
const isValid = ref(true);
const touched = ref(false);
const currentCC = ref('');

const onlyCountries = computed(() => {
  // Map provided countries to iso2 list for vue-tel-input restriction
  return Array.isArray(props.countries)
    ? props.countries.map(c => (c.isoCode || '').toLowerCase()).filter(Boolean)
    : undefined;
});

const resolvedDefaultCountry = computed(() => {
  if (props.modelValue?.CC) {
    // Find iso by CC if provided
    const match = props.countries.find(c => String(c.dialCode) === String(props.modelValue.CC));
    if (match?.isoCode) return match.isoCode.toLowerCase();
  }
  return (props.defaultCountryIsoCode || '').toLowerCase() || undefined;
});

function syncFromModel() {
  const cc = props.modelValue?.CC ? String(props.modelValue.CC) : '';
  const phone = props.modelValue?.phone ? String(props.modelValue.phone) : '';
  currentCC.value = cc;
  localValue.value = cc || phone ? `+${cc}${phone}` : '';
}

// Initialize from parent model
syncFromModel();

watch(() => props.modelValue, syncFromModel, { deep: true });

function updateParent(cc, nationalNumber) {
  emit('update:modelValue', { CC: cc || '', phone: nationalNumber || '' });
}

function handleValidate(payload) {
  const valid = !!(payload && (payload.valid ?? payload.isValid));
  isValid.value = valid;
  // Try to derive country calling code and national number from payload
  const cc = String(
    (payload && (payload.countryCallingCode || payload.country?.dialCode || payload.country?.countryCallingCode)) ||
    currentCC.value || ''
  );
  const national = String(
    (payload && (payload.nationalNumber || payload.number?.nationalNumber)) ||
    (localValue.value || '').replace(/\D/g, '').replace(new RegExp(`^${cc}`), '') ||
    ''
  );
  currentCC.value = cc;
  updateParent(cc, national);
  emit('validity-change', valid);
}

function handleCountryChanged(country) {
  // country may have { dialCode, iso2 }
  const cc = String(country?.dialCode || country?.countryCallingCode || currentCC.value || '');
  currentCC.value = cc;
  // Re-emit model to keep CC in sync when user switches country with empty phone
  const digits = (localValue.value || '').replace(/\D/g, '');
  const national = digits.replace(new RegExp(`^${cc}`), '');
  updateParent(cc, national);
}

function handleInput() {
  if (!touched.value) touched.value = true;
  // When typing, rely on latest known CC and split digits
  const digits = (localValue.value || '').replace(/\D/g, '');
  const cc = currentCC.value || (digits.startsWith('0') ? '' : digits.match(/^\d{1,3}/)?.[0] || '');
  const national = cc ? digits.replace(new RegExp(`^${cc}`), '') : digits;
  updateParent(cc, national);
}
</script>

<style scoped>
.argon-input-phone :deep(.vue-tel-input) {
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  padding: 0;
  min-height: calc(1.5em + 1rem + 2px);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.argon-input-phone :deep(.vue-tel-input:focus-within) {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.argon-input-phone :deep(.vue-tel-input:hover) {
  border-color: #adb5bd;
}

.argon-input-phone :deep(.vti__input) {
  height: calc(1.5em + 1rem + 2px);
  padding: 0.5rem 0.75rem;
  border: none;
  font-size: 1rem;
  color: #525f7f;
}

.argon-input-phone :deep(.vti__dropdown) {
  border: none;
  padding: 0.5rem 0.75rem;
  background: white;
}

.argon-input-phone :deep(.vti__dropdown:focus) {
  outline: none;
}

.argon-input-phone .form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #525f7f;
  font-size: 0.875rem;
}

.argon-input-phone .invalid-feedback {
  color: #dc3545;
  font-size: 0.875em;
  margin-top: 0.25rem;
}
</style>