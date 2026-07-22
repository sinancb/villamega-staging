'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Locale, Dict } from '@/lib/i18n';
import type { CurrencyCode } from '@/lib/currency';
import { CurrencyDropdown } from '@/components/site/CurrencyDropdown';
import { LanguageDropdown } from '@/components/site/LanguageDropdown';
import { VillaSearchBar } from '@/components/site/VillaSearchBar';

export function MobileNav({ locale, d, currency }: { locale: Locale; d: Dict; currency: CurrencyCode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label={d.nav_menu}
        className="flex h-9 w-9 items-center justify-center text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full space-y-4 border-b border-white/10 bg-navy px-4 py-5 text-sm shadow-lg">
          <VillaSearchBar locale={locale} placeholder={d.search_by_name} />

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.5-4 4.5-6 7.5-6s6 2 7.5 6" /></svg>
            {d.login_signup}
          </div>

          <Link href={`/${locale}/villanizi-kiralayin`} onClick={() => setOpen(false)}
            className="block py-1 font-semibold uppercase tracking-wide text-white">
            {d.nav_owner}
          </Link>
          <a href="https://wa.me/905000000000" target="_blank" rel="noreferrer"
            className="block py-1 font-semibold uppercase tracking-wide text-white">
            {d.nav_contact}
          </a>

          <div className="flex items-center gap-6 border-t border-white/10 pt-4">
            <CurrencyDropdown currency={currency} />
            <LanguageDropdown locale={locale} d={d} />
          </div>
        </div>
      )}
    </div>
  );
}
