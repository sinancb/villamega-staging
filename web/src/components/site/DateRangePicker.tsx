'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { iso, MONTH_TR, MONTH_EN, MONTH_SHORT_TR, MONTH_SHORT_EN, DOW_TR, DOW_EN, monthGridDays } from '@/lib/calendar';

export function DateRangePicker({ locale, checkin, checkout, onChange, label, placeholder }: {
  locale: Locale;
  checkin: string | null;
  checkout: string | null;
  onChange: (checkin: string | null, checkout: string | null) => void;
  label: string;
  placeholder: string;
}) {
  const today = useMemo(() => { const n = new Date(); n.setHours(0, 0, 0, 0); return n; }, []);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (fieldRef.current && !fieldRef.current.contains(e.target as Node)) setOpen(false);
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
      onChange(dateIso, null);
      return;
    }
    if (dateIso <= checkin) { onChange(dateIso, null); return; }
    onChange(checkin, dateIso);
    setOpen(false);
  }

  const days = monthGridDays(month);
  const monthLabel = (locale === 'tr' ? MONTH_TR : MONTH_EN)[month.getMonth()] + ' ' + month.getFullYear();
  const inRange = (dateIso: string) => checkin && checkout && dateIso >= checkin && dateIso < checkout;

  return (
    <div className="relative" ref={fieldRef}>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-navy/50">{label}</label>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="mt-1 block w-full text-left text-sm font-semibold text-navy">
        {checkin ? `${fmt(checkin)}${checkout ? ` → ${fmt(checkout)}` : ''}` : placeholder}
      </button>

      {open && (
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
  );
}
