import type { Locale } from '@/lib/i18n';

export type CurrencyCode = 'TRY' | 'EUR';

// ECB daily rate via Frankfurter (no API key needed). Display only — every
// quote/payment in Supabase stays in TL regardless of this rate. Cached 6h;
// falls back to a fixed rate if the API is unreachable so pricing never
// breaks on their outage. Update the fallback occasionally to stay in the
// right ballpark.
const FALLBACK_EUR_TRY_RATE = 40;

export async function getEurRate(): Promise<number> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY', {
      next: { revalidate: 21600 }
    });
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    const rate = data?.rates?.TRY;
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) throw new Error('bad rate');
    return rate;
  } catch {
    return FALLBACK_EUR_TRY_RATE;
  }
}

export function tryToEur(tryAmount: number, eurTryRate: number): number {
  return Math.round(tryAmount / eurTryRate);
}

export function fmtEur(n: number): string {
  return '€' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(n);
}

export function resolveCurrency(cookieValue: string | undefined, locale: Locale): CurrencyCode {
  if (cookieValue === 'TRY' || cookieValue === 'EUR') return cookieValue;
  return locale === 'en' ? 'EUR' : 'TRY';
}
