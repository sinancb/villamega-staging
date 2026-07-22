'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Locale, Dict } from '@/lib/i18n';

export function LanguageDropdown({ locale, d }: { locale: Locale; d: Dict }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-white/80 hover:text-white">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z" /></svg>
        {locale.toUpperCase()}
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-32 overflow-hidden rounded-lg border border-white/10 bg-navy-deep py-1 text-xs shadow-xl">
          <Link href="/tr" onClick={() => setOpen(false)}
            className={`block px-3 py-2 hover:bg-white/10 ${locale === 'tr' ? 'text-brass' : 'text-white/80'}`}>
            {d.lang_tr}
          </Link>
          <Link href="/en" onClick={() => setOpen(false)}
            className={`block px-3 py-2 hover:bg-white/10 ${locale === 'en' ? 'text-brass' : 'text-white/80'}`}>
            {d.lang_en}
          </Link>
        </div>
      )}
    </div>
  );
}
