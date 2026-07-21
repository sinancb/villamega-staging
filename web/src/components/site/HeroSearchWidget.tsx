'use client';

import { useState } from 'react';
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

  function submit() {
    const qs = new URLSearchParams();
    if (region) qs.set('bolge', region);
    if (type) qs.set('tip', type);
    if (checkin) qs.set('giris', checkin);
    if (checkout) qs.set('cikis', checkout);
    if (guests) qs.set('kisi', String(guests));
    const s = qs.toString();
    router.push(`/${locale}/villalar${s ? `?${s}` : ''}`);
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white shadow-xl md:grid-cols-[1fr_1fr_1.3fr_1fr_auto] md:divide-x md:divide-y-0">
        <div className="px-5 py-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-navy/50">{d.search_region}</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-semibold text-navy focus:outline-none">
            <option value="">{d.search_select}</option>
            {(['fethiye', 'kas', 'kalkan'] as const).map((r) => (
              <option key={r} value={r}>{REGION_LABEL[locale][r]}</option>
            ))}
          </select>
        </div>

        <div className="px-5 py-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-navy/50">{d.search_villa_type}</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-semibold text-navy focus:outline-none">
            <option value="">{d.search_any_type}</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </div>

        <div className="px-5 py-4">
          <DateRangePicker locale={locale} checkin={checkin} checkout={checkout}
            onChange={(c1, c2) => { setCheckin(c1); setCheckout(c2); }}
            label={d.search_dates} placeholder={d.search_pick_dates} />
        </div>

        <div className="px-5 py-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-navy/50">{d.search_guests}</label>
          <div className="mt-1 flex items-center gap-3">
            <button type="button" aria-label="−" onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-navy/20 text-navy hover:bg-navy-mist">−</button>
            <span className="text-sm font-semibold text-navy">{guests}</span>
            <button type="button" aria-label="+" onClick={() => setGuests((g) => Math.min(20, g + 1))}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-navy/20 text-navy hover:bg-navy-mist">+</button>
          </div>
        </div>

        <button type="button" onClick={submit}
          className="flex items-center justify-center gap-2 rounded-b-2xl bg-brass px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-navy transition-colors hover:brightness-105 md:rounded-b-none md:rounded-r-2xl">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          {d.search_button}
        </button>
      </div>
    </div>
  );
}
