'use client';

import { useHeaderSolid } from '@/components/site/StickyHeaderBar';

// Hidden on first paint over the hero (only the omega mark shows); revealed
// once the sticky bar goes solid (scrolled, or on non-hero pages).
export function HeaderLogoText() {
  const solid = useHeaderSolid();
  return (
    <span
      className={`font-display text-lg font-semibold tracking-[0.14em] text-white transition-all duration-300 md:text-2xl md:tracking-[0.18em] ${
        solid ? 'max-w-xs opacity-100' : 'max-w-0 overflow-hidden opacity-0'
      }`}
    >
      VILLAMEGA
    </span>
  );
}
