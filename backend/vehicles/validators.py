"""Format checks for common civilian plates and bluebook document references.

Plate structure: Nepal Vehicle and Transport Management Rules, Schedule 6.
Bluebook references are document identifiers, not number plates: no invented
national fixed-length rule is imposed. Uploaded documents still need review.
"""
import re
import unicodedata

ZONE_ALIASES = {'मे': 'ME', 'को': 'KO', 'स': 'SA', 'ज': 'JAN', 'बा': 'BA', 'ना': 'NA', 'ग': 'GA', 'लु': 'LU', 'ध': 'DHA', 'रा': 'RA', 'भे': 'BHE', 'क': 'KA', 'से': 'SE', 'म': 'MA'}
SYMBOL_ALIASES = {'प': 'PA', 'च': 'CHA', 'ज': 'JA', 'ख': 'KHA', 'क': 'KA', 'ग': 'GA', 'घ': 'GHA', 'ङ': 'NGA', 'छ': 'CHHA', 'झ': 'JHA', 'य': 'YA', 'ह': 'HA', 'स': 'SA', 'फ': 'PHA', 'ब': 'BA', 'म': 'MA'}
PROVINCE_ALIASES = {'कोशी': 'KOSHI', 'मधेश': 'MADHESH', 'बागमती': 'BAGMATI', 'वागमती': 'BAGMATI', 'गण्डकी': 'GANDAKI', 'गंडकी': 'GANDAKI', 'लुम्बिनी': 'LUMBINI', 'कर्णाली': 'KARNALI', 'सुदूरपश्चिम': 'SUDURPASHCHIM', 'SUDURPASCHIM': 'SUDURPASHCHIM'}
PROVINCES = ['KOSHI', 'MADHESH', 'BAGMATI', 'GANDAKI', 'LUMBINI', 'KARNALI', 'SUDURPASHCHIM']
ZONES = set(ZONE_ALIASES.values()) | {'JAN', 'JA'}
SYMBOLS = set(SYMBOL_ALIASES.values())
LETTERS = r'[A-Z\u0904-\u0939\u093e-\u094c\u094d]+'
TRANSLATION = str.maketrans('०१२३४५६७८९‐‑–—', '0123456789----')


def normalize_text(value):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', value).translate(TRANSLATION).strip().upper())


def normalize_registration_number(value):
    text = normalize_text(value)
    for name, code in PROVINCE_ALIASES.items():
        text = re.sub(r'^' + re.escape(name) + r'(?=[\s-]|$)', code, text)
    text = re.sub(r'^(?:प्रदेश(?:\s*नं\.?)?|PROVINCE|PRADESH)\s*([1-7])(?=[\s-]|$)', lambda m: PROVINCES[int(m[1]) - 1], text)
    separated = re.sub(r'\s+', ' ', text.replace('-', ' ')).strip()
    legacy = re.fullmatch(rf'({LETTERS})\s*([0-9]{{1,3}})\s*({LETTERS})\s*([0-9]{{1,4}})', separated)
    if legacy:
        zone = ZONE_ALIASES.get(legacy[1], legacy[1])
        symbol = SYMBOL_ALIASES.get(legacy[3], legacy[3])
        if zone in ZONES and symbol in SYMBOLS and int(legacy[2]) > 0 and int(legacy[4]) > 0:
            return f"{'JAN' if zone == 'JA' else zone} {int(legacy[2])} {symbol} {int(legacy[4])}"
    provincial = re.fullmatch(rf"({'|'.join(PROVINCES)})\s+([0-9]{{2}})\s+([0-9]{{3}})\s*({LETTERS})\s*([0-9]{{1,4}})", separated)
    if provincial:
        symbol = SYMBOL_ALIASES.get(provincial[4], provincial[4])
        if symbol in SYMBOLS and all(int(provincial[i]) > 0 for i in (2, 3, 5)):
            return f'{provincial[1]} {provincial[2]}-{provincial[3]} {symbol} {int(provincial[5])}'
    embossed = re.fullmatch(rf"({'|'.join(PROVINCES)})\s+([A-Z]{{1,3}})\s+([0-9]{{1,4}})", separated)
    if embossed and int(embossed[3]) > 0:
        return f'{embossed[1]} {embossed[2]} {int(embossed[3])}'
    raise ValueError('Enter a supported Nepal plate format, such as BA 2 PA 1234, BAGMATI 01-001 PA 1234, or BAGMATI AA 1234. Serial must be 1–9999.')


def normalize_bluebook_number(value):
    text = re.sub(r'\s*([-/])\s*', r'\1', normalize_text(value))
    if not text or len(text) > 50 or not re.fullmatch(r'[A-Z0-9\u0904-\u0939\u093e-\u094c\u094d]+(?:[ /-][A-Z0-9\u0904-\u0939\u093e-\u094c\u094d]+)*', text) or not re.search(r'[0-9]', text):
        raise ValueError('Enter the printed bluebook document number, including a digit. Only letters, digits, spaces, hyphens and slashes are allowed (maximum 50 characters).')
    return text
