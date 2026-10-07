/**
 * Nepali Input Formatters and Sanitizers for Traffic Management System.
 */

// Phone number: Default +977 prefix, digits only, max 10 local digits
export const formatNepaliPhone = (input) => {
  if (!input) return '+977 ';
  // Extract all numeric digits
  let digits = input.replace(/\D/g, '');

  // Strip international code 977 if user types/pastes it
  if (digits.startsWith('977')) {
    digits = digits.slice(3);
  }

  // Cap local phone number at 10 digits (e.g., 98XXXXXXXX / 97XXXXXXXX)
  digits = digits.slice(0, 10);
  return `+977 ${digits}`;
};

// Citizenship Number: XX-XX-XX-XXXXX (e.g., 27-01-75-01234)
export const formatCitizenshipNumber = (input) => {
  if (!input) return '';
  const digits = input.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';

  let formatted = digits.slice(0, 2);
  if (digits.length > 2) formatted += '-' + digits.slice(2, 4);
  if (digits.length > 4) formatted += '-' + digits.slice(4, 6);
  if (digits.length > 6) formatted += '-' + digits.slice(6, 11);
  return formatted;
};

// National ID (NID) Number: XXX-XXX-XXXX (10 digits)
export const formatNIDNumber = (input) => {
  if (!input) return '';
  const digits = input.replace(/\D/g, '').slice(0, 10);
  if (!digits) return '';

  let formatted = digits.slice(0, 3);
  if (digits.length > 3) formatted += '-' + digits.slice(3, 6);
  if (digits.length > 6) formatted += '-' + digits.slice(6, 10);
  return formatted;
};

// Driver License Number: XX-XX-XXXXXXXX (12 digits)
export const formatDriverLicense = (input) => {
  if (!input) return '';
  const digits = input.replace(/\D/g, '').slice(0, 12);
  if (!digits) return '';

  let formatted = digits.slice(0, 2);
  if (digits.length > 2) formatted += '-' + digits.slice(2, 4);
  if (digits.length > 4) formatted += '-' + digits.slice(4, 12);
  return formatted;
};
