import Link from 'next/link';
import type { Locale, Dict } from '@/lib/i18n';

export function Header({ locale, d, path }: { locale: Locale; d: Dict; path?: string }) {
  const other = locale === 'tr' ? 'en' : 'tr';
  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark-navy.png" alt="" className="h-8 w-auto" />
          <span className="font-display text-xl font-semibold tracking-[0.18em] text-navy">
            VILLAMEGA
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-navy/75 md:flex">
          <Link className="hover:text-navy" href={`/${locale}/villalar`}>{d.nav_villas}</Link>
          <Link className="hover:text-navy" href={`/${locale}/sayfa/hakkimizda`}>{d.nav_about}</Link>
          <Link className="hover:text-navy" href={`/${locale}/sayfa/kiralama-sartlari`}>{d.nav_terms}</Link>
          <Link className="hover:text-navy" href={`/${locale}/villanizi-kiralayin`}>{d.nav_owner}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href={`/${other}`}
            className="rounded-full border border-navy/20 px-3 py-1 text-xs font-semibold text-navy hover:bg-navy hover:text-white">
            {other.toUpperCase()}
          </Link>
          <a href="https://wa.me/905000000000" target="_blank" rel="noreferrer"
            className="rounded-full border border-brass px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-navy transition-colors hover:bg-brass">
            {d.nav_contact}
          </a>
        </div>
      </div>
    </header>
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
