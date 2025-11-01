// Form validation utilities for booking form

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PatientInfo {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  medicalHistory: string;
  currentMedications: string;
}

// Phone number validation
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
    return { isValid: false, errors };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check length
  if (digitsOnly.length < 7) {
    errors.push('Phone number must be at least 7 digits');
  } else if (digitsOnly.length > 15) {
    errors.push('Phone number cannot exceed 15 digits');
  }

  // Check for valid patterns
  const validPatterns = [
    /^\+?[1-9]\d{6,14}$/, // International format
    /^[6-9]\d{9}$/, // Indian mobile (10 digits starting with 6-9)
    /^\+91[6-9]\d{9}$/, // Indian mobile with country code
    /^\d{7,12}$/, // General landline/mobile
  ];

  const isValidFormat = validPatterns.some(pattern => pattern.test(phone.replace(/[\s\-\(\)]/g, '')));
  
  if (!isValidFormat && digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    // If length is ok but format is questionable, just warn but allow
    console.warn('Phone number format may be unusual but is within acceptable range');
  }

  return { isValid: errors.length === 0, errors };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  if (email.length > 100) {
    errors.push('Email address is too long (max 100 characters)');
  }

  return { isValid: errors.length === 0, errors };
};

// Age validation
export const validateAge = (age: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!age) {
    errors.push('Age is required');
    return { isValid: false, errors };
  }

  const ageNum = parseInt(age);
  if (isNaN(ageNum)) {
    errors.push('Age must be a valid number');
  } else if (ageNum < 1) {
    errors.push('Age must be at least 1');
  } else if (ageNum > 150) {
    errors.push('Age cannot exceed 150');
  }

  return { isValid: errors.length === 0, errors };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
    return { isValid: false, errors };
  }

  if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (name.length > 100) {
    errors.push('Name is too long (max 100 characters)');
  }

  // Check for valid characters (letters, spaces, common punctuation)
  const nameRegex = /^[a-zA-Z0-9\s\.\-']+$/;
  if (!nameRegex.test(name)) {
    errors.push('Name contains invalid characters');
  }

  return { isValid: errors.length === 0, errors };
};

// Medical history validation
export const validateMedicalHistory = (history: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!history || history.trim().length === 0) {
    return { isValid: true, errors };
  }

  if (history.length > 2000) {
    errors.push('Medical history is too long (max 2000 characters)');
  }

  return { isValid: errors.length === 0, errors };
};

// Comprehensive patient info validation
export const validatePatientInfo = (patientInfo: PatientInfo): ValidationResult => {
  const allErrors: string[] = [];

  // Validate each field
  const nameValidation = validateName(patientInfo.name);
  const emailValidation = validateEmail(patientInfo.email);
  const phoneValidation = validatePhoneNumber(patientInfo.phone);
  const ageValidation = validateAge(patientInfo.age);
  const medicalHistoryValidation = validateMedicalHistory(patientInfo.medicalHistory);

  // Collect all errors
  allErrors.push(...nameValidation.errors);
  allErrors.push(...emailValidation.errors);
  allErrors.push(...phoneValidation.errors);
  allErrors.push(...ageValidation.errors);
  allErrors.push(...medicalHistoryValidation.errors);

  // Gender validation
  if (!patientInfo.gender) {
    allErrors.push('Gender is required');
  }

  return { isValid: allErrors.length === 0, errors: allErrors };
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digitsOnly.length === 10) {
    // Format as (XXX) XXX-XXXX
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    // US format with country code
    return digitsOnly.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    // Indian format with country code
    return digitsOnly.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2-$3');
  }
  
  // Return original if no specific format matches
  return phone;
};

// Real-time validation for inputs
export const getFieldValidationClass = (value: string, validator: (val: string) => ValidationResult): string => {
  if (!value) return ''; // No styling for empty fields initially
  
  const result = validator(value);
  return result.isValid ? 'border-green-300 focus:border-green-500' : 'border-red-300 focus:border-red-500';
};

// Get validation message for display
export const getValidationMessage = (value: string, validator: (val: string) => ValidationResult): string => {
  if (!value) return '';
  
  const result = validator(value);
  return result.errors[0] || '';
};
