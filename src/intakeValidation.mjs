export const phoneRequired = preference => ['Phone call', 'Text first'].includes(preference);

export function validateContact({ address, fullName, email, phone, preferredContact }) {
  const missing = [];
  if (!String(address || '').trim()) missing.push('property address');
  if (!String(fullName || '').trim()) missing.push('full name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())) missing.push('valid email');
  if (!['Email first', 'Phone call', 'Text first', 'No preference'].includes(preferredContact)) missing.push('contact preference');
  if (phoneRequired(preferredContact) && !String(phone || '').trim()) missing.push('phone number');
  return missing;
}
