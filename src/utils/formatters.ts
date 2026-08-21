import { CurrencyCode, CURRENCIES } from '../types/finance';

/**
 * Formats a monetary value safely with exact decimal handling.
 */
export function formatMoney(amount: number, currency: CurrencyCode = 'NPR'): string {
  const config = CURRENCIES[currency] || CURRENCIES.NPR;
  const safeAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
  
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  return `${config.symbol}${formattedNumber}`;
}

/**
 * Formats ISO date string (YYYY-MM-DD) into readable formats.
 */
export function formatDate(dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return dateString;

  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Computes human readable relative day status for bills.
 */
export function getRelativeDayString(dueDateStr: string): { label: string; daysDiff: number; isOverdue: boolean; isDueSoon: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDateStr + 'T00:00:00');
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let label = '';
  const isOverdue = daysDiff < 0;
  const isDueSoon = daysDiff >= 0 && daysDiff <= 3;

  if (daysDiff === 0) {
    label = 'Due Today';
  } else if (daysDiff === 1) {
    label = 'Due Tomorrow';
  } else if (daysDiff > 1) {
    label = `Due in ${daysDiff} days`;
  } else if (daysDiff === -1) {
    label = 'Overdue by 1 day';
  } else {
    label = `Overdue by ${Math.abs(daysDiff)} days`;
  }

  return { label, daysDiff, isOverdue, isDueSoon };
}
