// Common civilian Nepal registration formats. Format checks do not prove ownership.
const zoneAliases = { 'मे': 'ME', 'को': 'KO', 'स': 'SA', 'ज': 'JAN', 'बा': 'BA', 'ना': 'NA', 'ग': 'GA', 'लु': 'LU', 'ध': 'DHA', 'रा': 'RA', 'भे': 'BHE', 'क': 'KA', 'से': 'SE', 'म': 'MA' };
const symbolAliases = { 'प': 'PA', 'च': 'CHA', 'ज': 'JA', 'ख': 'KHA', 'क': 'KA', 'ग': 'GA', 'घ': 'GHA', 'ङ': 'NGA', 'छ': 'CHHA', 'झ': 'JHA', 'य': 'YA', 'ह': 'HA', 'स': 'SA', 'फ': 'PHA', 'ब': 'BA', 'म': 'MA' };
const provinceAliases = { 'कोशी': 'KOSHI', 'मधेश': 'MADHESH', 'बागमती': 'BAGMATI', 'वागमती': 'BAGMATI', 'गण्डकी': 'GANDAKI', 'गंडकी': 'GANDAKI', 'लुम्बिनी': 'LUMBINI', 'कर्णाली': 'KARNALI', 'सुदूरपश्चिम': 'SUDURPASHCHIM', 'SUDURPASCHIM': 'SUDURPASHCHIM' };
const provinces = ['KOSHI', 'MADHESH', 'BAGMATI', 'GANDAKI', 'LUMBINI', 'KARNALI', 'SUDURPASHCHIM'];
const zones = new Set([...Object.values(zoneAliases), 'JAN', 'JA']);
const symbols = new Set(Object.values(symbolAliases));
const letters = '[A-Z\\u0904-\\u0939\\u093e-\\u094c\\u094d]+';
const digits = value => value.replace(/[०-९]/g, digit => String('०१२३४५६७८९'.indexOf(digit)));
const positive = value => Number(value) > 0;
const serial = value => String(Number(value));

export const REGISTRATION_HELP = 'Use the number printed in your bluebook: BA 2 PA 1234 / बा २ प १२३४, BAGMATI 01-001 PA 1234, or BAGMATI AA 1234. Serial: 1–9999.';
export const BLUEBOOK_HELP = 'Copy the document number exactly. English/Nepali letters and digits are accepted, with spaces, hyphens or slashes. Include at least one digit; maximum 50 characters.';

export function normalizeRegistrationNumber(input) {
  let text = digits(String(input || '').normalize('NFC')).trim().toUpperCase().replace(/[‐‑–—]/g, '-').replace(/\s+/g, ' ');
  for (const [name, code] of Object.entries(provinceAliases)) text = text.replace(new RegExp(`^${name}(?=[\\s-]|$)`), code);
  text = text.replace(/^(?:प्रदेश(?:\s*नं\.?)?|PROVINCE|PRADESH)\s*([1-7])(?=[\s-]|$)/, (_, number) => provinces[Number(number) - 1]);
  const separated = text.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  const legacy = separated.match(new RegExp(`^(${letters})\\s*([0-9]{1,3})\\s*(${letters})\\s*([0-9]{1,4})$`));
  if (legacy) {
    const zone = zoneAliases[legacy[1]] || legacy[1];
    const symbol = symbolAliases[legacy[3]] || legacy[3];
    if (zones.has(zone) && symbols.has(symbol) && positive(legacy[2]) && positive(legacy[4])) return `${zone === 'JA' ? 'JAN' : zone} ${serial(legacy[2])} ${symbol} ${serial(legacy[4])}`;
  }
  const provincial = separated.match(new RegExp(`^(${provinces.join('|')})\\s+([0-9]{2})\\s+([0-9]{3})\\s*(${letters})\\s*([0-9]{1,4})$`));
  if (provincial) {
    const symbol = symbolAliases[provincial[4]] || provincial[4];
    if (symbols.has(symbol) && positive(provincial[2]) && positive(provincial[3]) && positive(provincial[5])) return `${provincial[1]} ${provincial[2]}-${provincial[3]} ${symbol} ${serial(provincial[5])}`;
  }
  const embossed = separated.match(new RegExp(`^(${provinces.join('|')})\\s+([A-Z]{1,3})\\s+([0-9]{1,4})$`));
  if (embossed && positive(embossed[3])) return `${embossed[1]} ${embossed[2]} ${serial(embossed[3])}`;
  return null;
}

export function normalizeBluebookNumber(input) {
  return digits(String(input || '').normalize('NFC')).trim().toUpperCase().replace(/[‐‑–—]/g, '-').replace(/\s+/g, ' ').replace(/\s*([-\/])\s*/g, '$1');
}

export function vehicleIdentifierErrors(values, original = {}) {
  const errors = {};
  if (values.registration_number !== original.registration_number && (!normalizeRegistrationNumber(values.registration_number) || normalizeRegistrationNumber(values.registration_number).length > 30)) errors.registration_number = 'Enter a supported Nepal plate format using the area, series, vehicle symbol and serial shown in your bluebook.';
  const bluebook = normalizeBluebookNumber(values.bluebook_number);
  if (values.bluebook_number !== original.bluebook_number && (!bluebook || bluebook.length > 50 || !/^[A-Z0-9\u0904-\u0939\u093e-\u094c\u094d]+(?:[ \/-][A-Z0-9\u0904-\u0939\u093e-\u094c\u094d]+)*$/.test(bluebook) || !/[0-9]/.test(bluebook))) errors.bluebook_number = 'Enter the printed bluebook document number, including a digit. Only letters, digits, spaces, hyphens and slashes are allowed (maximum 50 characters).';
  return errors;
}

export function normalizedVehicleIdentifiers(values, original = {}) {
  return {
    registration_number: values.registration_number === original.registration_number ? values.registration_number : normalizeRegistrationNumber(values.registration_number),
    bluebook_number: values.bluebook_number === original.bluebook_number ? values.bluebook_number : normalizeBluebookNumber(values.bluebook_number),
  };
}
