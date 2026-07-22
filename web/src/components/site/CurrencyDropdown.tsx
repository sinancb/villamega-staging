'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CurrencyCode } from '@/lib/currency';

export function CurrencyDropdown({ currency }: { currency: CurrencyCode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function select(next: CurrencyCode) {
    setOpen(false);
    if (next === currency) return;
    document.cookie = `currency=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-white/80 hover:text-white">
        {currency === 'TRY' ? '₺ TRY' : '€ EUR'}
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-24 overflow-hidden rounded-lg border border-white/10 bg-navy-deep py-1 text-xs shadow-xl">
          <button type="button" onClick={() => select('TRY')}
            className={`block w-full px-3 py-2 text-left hover:bg-white/10 ${currency === 'TRY' ? 'text-brass' : 'text-white/80'}`}>
            ₺ TRY
          </button>
          <button type="button" onClick={() => select('EUR')}
            className={`block w-full px-3 py-2 text-left hover:bg-white/10 ${currency === 'EUR' ? 'text-brass' : 'text-white/80'}`}>
            € EUR
          </button>
        </div>
      )}
    </div>
  );
}
