'use client';

import { useRef } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { categoryIcon } from '@/components/site/categoryIcons';

export type VillaTypeItem = { id: string; slug: string; icon: string; label: string };

export function VillaTypes({ locale, title, categories }: { locale: Locale; title: string; categories: VillaTypeItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="font-display text-3xl font-semibold text-navy">{title}</h2>
      <div className="mb-6 mt-3 h-px w-14 bg-brass" />

      {/* Mobile: story-style single row of circular icons */}
      <div className="-mx-4 flex snap-x gap-5 overflow-x-auto pl-8 pr-4 pb-1 md:hidden">
        {categories.map((cat) => {
          const Icon = categoryIcon(cat.icon);
          return (
            <Link key={cat.slug} href={`/${locale}/villalar?tip=${cat.slug}`}
              className="flex w-16 shrink-0 snap-start flex-col items-center gap-2 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brass bg-white p-3">
                <Icon className="h-full w-full text-navy" />
              </span>
              <span className="text-[11px] leading-tight text-navy/80">{cat.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop/tablet: 3x2 grid, horizontally paged */}
      <div className="relative hidden md:block">
        <div
          ref={scrollerRef}
          className="grid auto-cols-[calc((100%-2rem)/3)] grid-flow-col grid-rows-2 gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((cat) => {
            const Icon = categoryIcon(cat.icon);
            return (
              <Link key={cat.slug} href={`/${locale}/villalar?tip=${cat.slug}`}
                className="group flex snap-start items-center gap-4 rounded-2xl border border-navy/10 bg-white px-5 py-4 transition-colors hover:border-brass/60">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-mist">
                  <Icon className="h-6 w-6 text-navy" />
                </span>
                <span className="font-display text-base font-semibold leading-snug text-navy">{cat.label}</span>
              </Link>
            );
          })}
        </div>

        <button type="button" aria-label="Previous" onClick={() => scrollByPage(-1)}
          className="absolute -left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-brass bg-white p-2 shadow-sm hover:bg-brass lg:flex">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-navy" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" aria-label="Next" onClick={() => scrollByPage(1)}
          className="absolute -right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-brass bg-white p-2 shadow-sm hover:bg-brass lg:flex">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-navy" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
}
