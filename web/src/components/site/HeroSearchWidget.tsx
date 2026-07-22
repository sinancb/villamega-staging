'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale, Dict } from '@/lib/i18n';
import { REGION_LABEL } from '@/lib/i18n';
import { DateRangePicker } from '@/components/site/DateRangePicker';
import type { VillaTypeItem } from '@/components/site/VillaTypes';

export function HeroSearchWidget({ locale, d, categories }: { locale: Locale; d: Dict; categories: VillaTypeItem[] }) {
  const router = useRouter();

  const [region, setRegion] = useState('');
  const [type, setType] = useState('');
  const [checkin, setCheckin] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, [mobileOpen]);

  function submit() {
    setMobileOpen(false);
    const qs = new URLSearchParams();
    if (region) qs.set('bolge', region);
    if (type) qs.set('tip', type);
    if (checkin) qs.set('giris', checkin);
    if (checkout) qs.set('cikis', checkout);
    if (guests) qs.set('kisi', String(guests));
    const s = qs.toString();
    router.push(`/${locale}/villalar${s ? `?${s}` : ''}`);
  }

  const regionSelect = (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-navy/50">{d.search_region}</label>
      <select value={region} onChange={(e) => setRegion(e.target.value)}
        className="mt-1 w-full bg-transparent text-sm font-semibold text-navy focus:outline-none">
        <option value="">{d.search_select}</option>
        {(['fethiye', 'kas', 'kalkan'] as const).map((r) => (
          <option key={r} value={r}>{REGION_LABEL[locale][r]}</option>
        ))}
      </select>
    </div>
  );

  const typeSelect = (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-navy/50">{d.search_villa_type}</label>
      <select value={type} onChange={(e) => setType(e.target.value)}
        className="mt-1 w-full bg-transparent text-sm font-semibold text-navy focus:outline-none">
        <option value="">{d.search_any_type}</option>
        {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
      </select>
    </div>
  );

  const dateField = (
    <DateRangePicker locale={locale} checkin={checkin} checkout={checkout}
      onChange={(c1, c2) => { setCheckin(c1); setCheckout(c2); }}
      label={d.search_dates} placeholder={d.search_pick_dates} />
  );

  const guestField = (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-navy/50">{d.search_guests}</label>
      <div className="mt-1 flex items-center gap-3">
        <button type="button" aria-label="−" onClick={() => setGuests((g) => Math.max(1, g - 1))}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-navy/20 text-navy hover:bg-navy-mist">−</button>
        <span className="text-sm font-semibold text-navy">{guests}</span>
        <button type="button" aria-label="+" onClick={() => setGuests((g) => Math.min(20, g + 1))}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-navy/20 text-navy hover:bg-navy-mist">+</button>
      </div>
    </div>
  );

  const searchIcon = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  );

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl">
      {/* Desktop: full horizontal bar */}
      <div className="hidden md:grid md:grid-cols-[1fr_1fr_1.3fr_1fr_auto] md:divide-x md:divide-y-0 divide-navy/10 rounded-2xl border border-navy/10 bg-white shadow-xl">
        <div className="px-5 py-4">{regionSelect}</div>
        <div className="px-5 py-4">{typeSelect}</div>
        <div className="px-5 py-4">{dateField}</div>
        <div className="px-5 py-4">{guestField}</div>
        <button type="button" onClick={submit}
          className="flex items-center justify-center gap-2 rounded-r-2xl bg-brass px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-navy transition-colors hover:brightness-105">
          {searchIcon}
          {d.search_button}
        </button>
      </div>

      {/* Mobile: slim trigger bar, opens a full popup */}
      <button type="button" onClick={() => setMobileOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-full border border-navy/5 bg-white px-4 py-3.5 text-left shadow-[0_18px_36px_-12px_rgba(11,21,38,0.35)] md:hidden">
        <span className="text-navy/50">{searchIcon}</span>
        <span className="text-sm text-navy/60">{d.search_pick_dates}</span>
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-navy-deep/60 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-navy">{d.search_button}</h3>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label={d.gallery_close}
                className="flex h-8 w-8 items-center justify-center rounded-full text-navy/50 hover:bg-navy-mist hover:text-navy">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-navy/10 px-4 py-3">{regionSelect}</div>
              <div className="rounded-xl border border-navy/10 px-4 py-3">{typeSelect}</div>
              <div className="rounded-xl border border-navy/10 px-4 py-3">{dateField}</div>
              <div className="rounded-xl border border-navy/10 px-4 py-3">{guestField}</div>
            </div>

            <button type="button" onClick={submit}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brass py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-navy transition-colors hover:brightness-105">
              {searchIcon}
              {d.search_button}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
