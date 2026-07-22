import Link from 'next/link';
import type { Locale, Dict } from '@/lib/i18n';
import type { CurrencyCode } from '@/lib/currency';
import { CurrencyDropdown } from '@/components/site/CurrencyDropdown';
import { LanguageDropdown } from '@/components/site/LanguageDropdown';
import { VillaSearchBar } from '@/components/site/VillaSearchBar';
import { StickyHeaderBar } from '@/components/site/StickyHeaderBar';

export function Header({ locale, d, currency, path }: { locale: Locale; d: Dict; currency: CurrencyCode; path?: string }) {
  return (
    <>
      {/* Row 1: utility bar — full on desktop; condensed to just links + dropdowns on mobile */}
      <div className="bg-navy-deep text-xs text-white/80">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5 md:gap-6 md:py-3.5">
          <div className="hidden shrink-0 items-center gap-5 md:flex">
            <a href="tel:+905000000000" className="flex items-center gap-1.5 hover:text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 5c0 8.3 6.7 15 15 15l2-3.5-5-2-1.5 1.7A11.4 11.4 0 0 1 8.8 9.7L10.5 8.2 8.5 3.2 5 5z" /></svg>
              +90 500 000 00 00
            </a>
            <a href="mailto:info@villamega.com" className="flex items-center gap-1.5 hover:text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 6.5 8 6 8-6" /></svg>
              info@villamega.com
            </a>
          </div>

          <div className="hidden md:block md:max-w-xs md:flex-1">
            <VillaSearchBar locale={locale} placeholder={d.search_by_name} />
          </div>

          <div className="flex flex-1 items-center gap-4 overflow-x-auto md:ml-auto md:flex-none md:gap-5">
            <Link className="shrink-0 hover:text-white" href={`/${locale}/villanizi-kiralayin`}>{d.nav_owner}</Link>
            <a className="shrink-0 hover:text-white" href="https://wa.me/905000000000" target="_blank" rel="noreferrer">{d.nav_contact}</a>
            <CurrencyDropdown currency={currency} />
            <LanguageDropdown locale={locale} d={d} />
          </div>
        </div>
      </div>

      {/* Row 2: logo + login, sticky — transparent over hero pages, solid elsewhere/on scroll */}
      <StickyHeaderBar locale={locale}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 md:py-3">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark-white.png" alt="" className="h-6 w-auto md:h-8" />
            <span className="font-display text-base font-semibold tracking-[0.14em] text-white md:text-xl md:tracking-[0.18em]">
              VILLAMEGA
            </span>
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/70 md:gap-2 md:text-xs">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.5-4 4.5-6 7.5-6s6 2 7.5 6" /></svg>
            <span className="whitespace-nowrap">{d.login_signup}</span>
          </div>
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
