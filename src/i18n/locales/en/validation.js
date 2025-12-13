export default {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: 'Minimum length is {min} characters',
  maxLength: 'Maximum length is {max} characters',
  min: 'Minimum value is {min}',
  max: 'Maximum value is {max}',
  numeric: 'Please enter a valid number',
  integer: 'Please enter a valid integer',
  url: 'Please enter a valid URL',
  phone: 'Please enter a valid phone number',
  password: {
    minLength: 'Password must be at least {min} characters',
    mismatch: 'Passwords do not match',
    weak: 'Password is too weak',
    medium: 'Password strength is medium',
    strong: 'Password strength is strong'
  },
  confirmPassword: {
    required: 'Please confirm your password',
    mismatch: 'Passwords do not match'
  },
  date: {
    invalid: 'Please enter a valid date',
    past: 'Date must be in the past',
    future: 'Date must be in the future',
    min: 'Date must be after {date}',
    max: 'Date must be before {date}'
  },
  file: {
    required: 'Please select a file',
    maxSize: 'File size must not exceed {size}',
    invalidType: 'Invalid file type. Allowed types: {types}',
    tooMany: 'Too many files. Maximum: {max}'
  },
  select: {
    required: 'Please select an option'
  },
  checkbox: {
    required: 'This field must be checked'
  },
  custom: {
    unique: 'This value already exists',
    exists: 'This value does not exist',
    pattern: 'Invalid format'
  }
}

