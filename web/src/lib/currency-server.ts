import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n';
import { resolveCurrency, type CurrencyCode } from '@/lib/currency';

export function getCurrencyFromCookies(locale: Locale): CurrencyCode {
  const cookieValue = cookies().get('currency')?.value;
  return resolveCurrency(cookieValue, locale);
}
