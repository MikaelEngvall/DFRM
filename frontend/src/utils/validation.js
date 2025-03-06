// E-postvalidering
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'E-post är obligatoriskt';
  if (!emailRegex.test(email)) return 'Ogiltig e-postadress';
  return null;
};

// Lösenordsvalidering
export const validatePassword = (password) => {
  if (!password) return 'Lösenord är obligatoriskt';
  if (password.length < 8) return 'Lösenordet måste vara minst 8 tecken';
  if (!/[A-Z]/.test(password)) return 'Lösenordet måste innehålla minst en versal';
  if (!/[a-z]/.test(password)) return 'Lösenordet måste innehålla minst en gemen';
  if (!/[0-9]/.test(password)) return 'Lösenordet måste innehålla minst en siffra';
  return null;
};

// Personnummervalidering
export const validatePersonnummer = (personnummer) => {
  const personnummerRegex = /^(19|20)\d{6}[-]\d{4}$/;
  if (!personnummer) return 'Personnummer är obligatoriskt';
  if (!personnummerRegex.test(personnummer)) return 'Ogiltigt personnummer (format: YYYYMMDD-XXXX)';
  return null;
};

// Telefonnummervalidering
export const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^([+]46|0)\s?(7[0236])\s?(\d{4})\s?(\d{3})$/;
  if (!phoneNumber) return 'Telefonnummer är obligatoriskt';
  if (!phoneRegex.test(phoneNumber)) return 'Ogiltigt telefonnummer';
  return null;
};

// Postnummervalidering
export const validatePostalCode = (postalCode) => {
  const postalCodeRegex = /^\d{3}\s?\d{2}$/;
  if (!postalCode) return 'Postnummer är obligatoriskt';
  if (!postalCodeRegex.test(postalCode)) return 'Ogiltigt postnummer';
  return null;
};

// Datumvalidering
export const validateDate = (date) => {
  if (!date) return 'Datum är obligatoriskt';
  const selectedDate = new Date(date);
  if (isNaN(selectedDate.getTime())) return 'Ogiltigt datum';
  return null;
};

// Textfältsvalidering
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') return `${fieldName} är obligatoriskt`;
  return null;
};

// Nummervalidering
export const validateNumber = (value, fieldName, { min, max } = {}) => {
  if (!value) return `${fieldName} är obligatoriskt`;
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} måste vara ett nummer`;
  if (min !== undefined && num < min) return `${fieldName} måste vara minst ${min}`;
  if (max !== undefined && num > max) return `${fieldName} måste vara högst ${max}`;
  return null;
}; 