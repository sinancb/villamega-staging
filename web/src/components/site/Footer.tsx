import Link from 'next/link';
import type { Locale, Dict } from '@/lib/i18n';

export function Footer({ locale, d }: { locale: Locale; d: Dict }) {
  return (
    <footer className="mt-20 bg-navy text-white/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-12 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark-white.png" alt="Villamega" className="h-9 w-auto" />
        <div className="font-display text-lg tracking-[0.2em]">VILLAMEGA</div>
        <p className="max-w-md text-sm">{d.footer_tag}</p>
        <div className="mt-4 flex items-center gap-4 text-xs font-semibold uppercase tracking-wide text-white/70">
          <Link className="hover:text-white" href={`/${locale}/sayfa/hakkimizda`}>{d.nav_about}</Link>
          <span className="text-white/30">·</span>
          <Link className="hover:text-white" href={`/${locale}/sayfa/kiralama-sartlari`}>{d.nav_terms}</Link>
        </div>
        <div className="mt-4 h-px w-10 bg-brass/60" />
        <p className="mt-4 text-xs text-white/50">© {new Date().getFullYear()} Villamega · villamega.com</p>
      </div>
    </footer>
  );
}
