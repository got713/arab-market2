import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { PurchaseOptions, SellingUnit } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
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

const DEFAULT_SINGLE_UNIT_LABELS: Record<SellingUnit, { en: string; ar: string }> = {
  piece: { en: 'Piece', ar: 'حبة' },
  carton: { en: 'Carton', ar: 'كرتونة' },
};

const DEFAULT_TIER_LABELS: Record<'pack' | 'case', { en: string; ar: string }> = {
  pack: { en: 'Pack', ar: 'ربطة' },
  case: { en: 'Case', ar: 'كرتون' },
};

/**
 * Single source of truth for how a purchase-option tier label is displayed
 * to customers. Prefers the admin's per-product custom label; falls back to
 * a sensible default — for the "single" tier, the default depends on the
 * product's selling unit (Piece vs Carton) rather than a fixed "Single"/"Each".
 */
export function getPurchaseOptionLabel(
  purchaseOptions: PurchaseOptions,
  option: 'single' | 'pack' | 'case',
  locale: 'en' | 'ar',
  sellingUnit: SellingUnit = 'piece'
): string {
  const opt = purchaseOptions?.[option];
  const custom = locale === 'ar' ? opt?.labelAr : opt?.label;
  if (custom) return custom;

  if (option === 'single') {
    const fallback = DEFAULT_SINGLE_UNIT_LABELS[sellingUnit] ?? DEFAULT_SINGLE_UNIT_LABELS.piece;
    return locale === 'ar' ? fallback.ar : fallback.en;
  }

  const fallback = DEFAULT_TIER_LABELS[option];
  return locale === 'ar' ? fallback.ar : fallback.en;
}

export function translateCountry(country: string, locale: 'en' | 'ar') {
  if (locale === 'en') return country;
  const countryMap: Record<string, string> = {
    'Egypt': 'مصر',
    'Lebanon': 'لبنان',
    'Palestine': 'فلسطين',
    'Jordan': 'الأردن',
    'Saudi Arabia': 'السعودية',
    'Syria': 'سوريا',
    'UAE': 'الإمارات',
    'Yemen': 'اليمن',
    'Turkey': 'تركيا',
    'Morocco': 'المغرب',
    'Tunisia': 'تونس',
    'Algeria': 'الجزائر',
    'USA': 'أمريكا',
    'United States': 'الولايات المتحدة'
  };
  return countryMap[country] || country;
}
