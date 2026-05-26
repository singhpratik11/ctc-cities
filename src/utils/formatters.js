const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function fmtINR(n) {
  return INR.format(Math.round(n));
}

export function fmtL(n) {
  const lakhs = n / 100000;
  if (Math.abs(n) >= 10000000) {
    return `₹${(n / 10000000).toFixed(2)}Cr`;
  }
  if (Math.abs(lakhs) >= 1) {
    return `₹${lakhs.toFixed(2)}L`;
  }
  return fmtINR(n);
}

export function fmtPaise(fraction) {
  return `${Math.round(fraction * 100)}p`;
}

export function fmtComma(n) {
  if (!n && n !== 0) return '';
  return new Intl.NumberFormat('en-IN').format(Math.round(n));
}

export function parseComma(str) {
  return Number(String(str).replace(/,/g, '')) || 0;
}
