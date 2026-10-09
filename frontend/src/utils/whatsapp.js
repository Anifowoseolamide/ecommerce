// Digits in international format for wa.me links, e.g. '0803 123 4567' -> '2348031234567'.
// Mirrors normalize_whatsapp_number in orders/models.py.
export function toWhatsAppDigits(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) {
    // Nigerian local format
    return '234' + digits.slice(1);
  }
  return digits;
}

export function whatsAppLink(number, text = '') {
  const base = `https://wa.me/${toWhatsAppDigits(number)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
