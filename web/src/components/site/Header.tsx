import Link from 'next/link';
import type { Locale, Dict } from '@/lib/i18n';
import type { CurrencyCode } from '@/lib/currency';
import { MobileNav } from '@/components/site/MobileNav';
import { CurrencyDropdown } from '@/components/site/CurrencyDropdown';
import { LanguageDropdown } from '@/components/site/LanguageDropdown';
import { VillaSearchBar } from '@/components/site/VillaSearchBar';
import { StickyHeaderBar } from '@/components/site/StickyHeaderBar';

export function Header({ locale, d, currency, path }: { locale: Locale; d: Dict; currency: CurrencyCode; path?: string }) {
  return (
    <>
      {/* Row 1: utility bar — contact, search, secondary links, currency/language */}
      <div className="hidden bg-navy-deep text-xs text-white/80 md:block">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-2">
          <div className="flex shrink-0 items-center gap-5">
            <a href="tel:+905000000000" className="flex items-center gap-1.5 hover:text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 5c0 8.3 6.7 15 15 15l2-3.5-5-2-1.5 1.7A11.4 11.4 0 0 1 8.8 9.7L10.5 8.2 8.5 3.2 5 5z" /></svg>
              +90 500 000 00 00
            </a>
            <a href="mailto:info@villamega.com" className="flex items-center gap-1.5 hover:text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 6.5 8 6 8-6" /></svg>
              info@villamega.com
            </a>
          </div>

          <VillaSearchBar locale={locale} placeholder={d.search_by_name} className="max-w-xs" />

          <div className="ml-auto flex shrink-0 items-center gap-5">
            <Link className="hover:text-white" href={`/${locale}/villanizi-kiralayin`}>{d.nav_owner}</Link>
            <a className="hover:text-white" href="https://wa.me/905000000000" target="_blank" rel="noreferrer">{d.nav_contact}</a>
            <CurrencyDropdown currency={currency} />
            <LanguageDropdown locale={locale} d={d} />
          </div>
        </div>
      </div>

      {/* Row 2: logo + login, sticky — transparent over hero pages, solid elsewhere/on scroll */}
      <StickyHeaderBar locale={locale}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark-white.png" alt="" className="h-8 w-auto" />
            <span className="font-display text-xl font-semibold tracking-[0.18em] text-white">
              VILLAMEGA
            </span>
          </Link>

          <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70 md:flex">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.5-4 4.5-6 7.5-6s6 2 7.5 6" /></svg>
            {d.login_signup}
          </div>

          <MobileNav locale={locale} d={d} currency={currency} />
        </div>
      </StickyHeaderBar>
    </>
  );
}

export function OmegaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M10 40 v-4 h8 v-4 a12 14 0 1 1 12 0 v4 h8 v4 H26 v-10 a8 10 0 1 0 -4 0 v10 Z"
        fill="currentColor" className="text-navy" />
    </svg>
  );
}
