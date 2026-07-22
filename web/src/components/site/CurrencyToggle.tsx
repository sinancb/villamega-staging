'use client';

import { useRouter } from 'next/navigation';
import type { CurrencyCode } from '@/lib/currency';

export function CurrencyToggle({ currency }: { currency: CurrencyCode }) {
  const router = useRouter();

  function setCurrency(next: CurrencyCode) {
    if (next === currency) return;
    document.cookie = `currency=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center overflow-hidden rounded-full border border-navy/20 text-xs font-semibold text-navy">
      <button type="button" onClick={() => setCurrency('TRY')}
        className={`px-2.5 py-1 transition-colors ${currency === 'TRY' ? 'bg-navy text-white' : 'hover:bg-navy-mist'}`}>
        ₺ TRY
      </button>
      <button type="button" onClick={() => setCurrency('EUR')}
        className={`px-2.5 py-1 transition-colors ${currency === 'EUR' ? 'bg-navy text-white' : 'hover:bg-navy-mist'}`}>
        € EUR
      </button>
    </div>
  );
}
