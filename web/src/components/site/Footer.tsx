import type { Dict } from '@/lib/i18n';
import { OmegaMark } from './Header';

export function Footer({ d }: { d: Dict }) {
  return (
    <footer className="mt-20 bg-navy text-white/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-12 text-center">
        <OmegaMark className="h-8 w-8 text-white" />
        <div className="font-display text-lg tracking-[0.2em]">VILLAMEGA</div>
        <p className="max-w-md text-sm">{d.footer_tag}</p>
        <p className="mt-4 text-xs text-white/50">© {new Date().getFullYear()} Villamega · villamega.com</p>
      </div>
    </footer>
  );
}
