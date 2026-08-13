import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, locale: 'en' | 'ar' = 'en') {
  const formatted = price.toFixed(2);
  return locale === 'ar' ? `${formatted} $` : `$${formatted}`;
}

export function formatDate(dateString: string, locale: 'en' | 'ar' = 'en') {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
