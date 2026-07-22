'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Locale, Dict } from '@/lib/i18n';

export function MobileNav({ locale, d }: { locale: Locale; d: Dict }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label={d.nav_menu}
        className="flex h-9 w-9 items-center justify-center text-navy">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-navy/10 bg-white px-4 py-4 shadow-lg">
          <Link href={`/${locale}/villanizi-kiralayin`} onClick={() => setOpen(false)}
            className="block py-2 text-sm font-semibold uppercase tracking-wide text-navy">
            {d.nav_owner}
          </Link>
        </div>
      )}
    </div>
  );
}
