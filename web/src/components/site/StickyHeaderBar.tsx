'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Transparent over the hero image at the top of hero pages; solid navy
// everywhere else, and solid again once scrolled past the hero so the
// sticky bar stays legible over ordinary page content.
export function StickyHeaderBar({ locale, children }: { locale: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isHeroPage = pathname === `/${locale}` || pathname === `/${locale}/villanizi-kiralayin`;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = !isHeroPage || scrolled;

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${solid ? 'bg-navy shadow-sm' : 'bg-transparent'}`}>
      {children}
    </header>
  );
}
