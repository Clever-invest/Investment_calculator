/**
 * Утилиты форматирования
 */

const fixMinusZero = (n: number): number => (Object.is(n, -0) ? 0 : n);

export const formatCurrency = (value: number): string => {
  const v = Math.abs(value) < 0.5 ? 0 : value;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(fixMinusZero(v));
};

export const sqftToSqm = (sqft: number): number => sqft * 0.092903;

export const formatArea = (sqft: number): string => {
  if (!sqft || sqft === 0) return '—';
  return `${sqft.toLocaleString()} sqft (${sqftToSqm(sqft).toFixed(1)} м²)`;
};
