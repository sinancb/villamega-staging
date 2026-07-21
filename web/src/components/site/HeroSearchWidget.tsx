'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale, Dict } from '@/lib/i18n';
import { REGION_LABEL } from '@/lib/i18n';
import { iso, MONTH_TR, MONTH_EN, MONTH_SHORT_TR, MONTH_SHORT_EN, DOW_TR, DOW_EN, monthGridDays } from '@/lib/calendar';
import type { VillaTypeItem } from '@/components/site/VillaTypes';

export function HeroSearchWidget({ locale, d, categories }: { locale: Locale; d: Dict; categories: VillaTypeItem[] }) {
  const router = useRouter();
  const today = useMemo(() => { const n = new Date(); n.setHours(0, 0, 0, 0); return n; }, []);

  const [region, setRegion] = useState('');
  const [type, setType] = useState('');
  const [checkin, setCheckin] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);

  const [datesOpen, setDatesOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const dateFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dateFieldRef.current && !dateFieldRef.current.contains(e.target as Node)) setDatesOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const monthShort = locale === 'tr' ? MONTH_SHORT_TR : MONTH_SHORT_EN;
  const fmt = (dateIso: string) => {
    const [, m, dd] = dateIso.split('-');
    return `${Number(dd)} ${monthShort[Number(m) - 1]}`;
  };

  function pickDate(dateIso: string) {
    if (!checkin || (checkin && checkout)) {
      setCheckin(dateIso); setCheckout(null);
      return;
    }
    if (dateIso <= checkin) { setCheckin(dateIso); return; }
    setCheckout(dateIso);
    setDatesOpen(false);
  }

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

  const days = monthGridDays(month);
  const monthLabel = (locale === 'tr' ? MONTH_TR : MONTH_EN)[month.getMonth()] + ' ' + month.getFullYear();
  const inRange = (dateIso: string) => checkin && checkout && dateIso >= checkin && dateIso < checkout;

  return (
    <div className="relative z-20 mx-auto -mt-14 max-w-5xl px-4 md:-mt-16">
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

        <div className="relative px-5 py-4" ref={dateFieldRef}>
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-navy/50">{d.search_dates}</label>
          <button type="button" onClick={() => setDatesOpen((v) => !v)}
            className="mt-1 block w-full text-left text-sm font-semibold text-navy">
            {checkin ? `${fmt(checkin)}${checkout ? ` → ${fmt(checkout)}` : ''}` : d.search_pick_dates}
          </button>

          {datesOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-navy/10 bg-white p-4 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  className="rounded px-2 py-1 text-navy/60 hover:bg-navy-mist" aria-label="←">←</button>
                <span className="text-sm font-semibold text-navy">{monthLabel}</span>
                <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  className="rounded px-2 py-1 text-navy/60 hover:bg-navy-mist" aria-label="→">→</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-navy/50">
                {(locale === 'tr' ? DOW_TR : DOW_EN).map((x) => <div key={x} className="py-1">{x}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, i) => {
                  if (!date) return <div key={i} />;
                  const dIso = iso(date);
                  const past = date < today;
                  const selected = dIso === checkin || dIso === checkout;
                  const between = inRange(dIso);
                  return (
                    <button key={i} type="button" disabled={past} onClick={() => pickDate(dIso)}
                      className={[
                        'aspect-square rounded-md text-xs',
                        past ? 'text-navy/25 line-through' : 'text-navy hover:bg-navy-mist',
                        between ? 'bg-brass-soft' : '',
                        selected ? 'bg-navy font-bold text-white hover:bg-navy' : ''
                      ].join(' ')}>
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
