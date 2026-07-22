'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { t, type Locale } from '@/lib/i18n';
import { tl } from '@/lib/format';
import { iso, MONTH_TR, MONTH_EN, DOW_TR, DOW_EN, monthGridDays } from '@/lib/calendar';
import { tryToEur, fmtEur, type CurrencyCode } from '@/lib/currency';

type Range = { start_date: string; end_date: string };
type Quote = {
  ok: boolean; error?: string; min_stay?: number; nights?: number;
  accommodation_total?: number; cleaning_fee?: number; grand_total?: number;
  prepayment?: number; due_at_checkin?: number; damage_deposit?: number;
};

export function BookingWidget({ villaId, locale, depositAmount, currency = 'TRY', eurRate = 1 }: {
  villaId: string; locale: Locale; depositAmount: number; currency?: CurrencyCode; eurRate?: number;
}) {
  const eur = (n: number) => currency === 'EUR' && (
    <span className="ml-1 font-normal text-navy/40">· ≈ {fmtEur(tryToEur(n, eurRate))}</span>
  );
  const d = t(locale);
  const supabase = useMemo(() => supabaseBrowser(), []);
  const today = useMemo(() => { const n = new Date(); n.setHours(0,0,0,0); return n; }, []);

  const [blocked, setBlocked] = useState<Range[]>([]);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [checkin, setCheckin] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [form, setForm] = useState({ first: '', last: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc('get_unavailable_ranges', { p_villa_id: villaId })
      .then(({ data }) => setBlocked((data as Range[]) ?? []));
  }, [supabase, villaId]);

  const isBlocked = (dateIso: string) =>
    blocked.some((r) => dateIso >= r.start_date && dateIso < r.end_date);

  function localizeError(q: Quote): string {
    switch (q.error) {
      case 'min_stay': return d.err_min_stay.replace('{n}', String(q.min_stay));
      case 'dates_unavailable': return d.err_unavailable;
      case 'unpriced_dates': return d.err_unpriced;
      case 'invalid_phone': return d.err_invalid_phone;
      default: return d.err_generic;
    }
  }

  async function pick(dateIso: string) {
    setError(null); setDone(false);
    if (!checkin || (checkin && checkout)) {
      setCheckin(dateIso); setCheckout(null); setQuote(null);
      return;
    }
    if (dateIso <= checkin) { setCheckin(dateIso); return; }
    setCheckout(dateIso);
    setQuoting(true);
    const { data } = await supabase.rpc('quote_stay', {
      p_villa_id: villaId, p_checkin: checkin, p_checkout: dateIso
    });
    const q = data as Quote;
    setQuote(q);
    if (q && !q.ok) setError(localizeError(q));
    setQuoting(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkin || !checkout) return;
    setSubmitting(true); setError(null);
    const { data, error: rpcError } = await supabase.rpc('create_reservation_request', {
      p_villa_id: villaId, p_checkin: checkin, p_checkout: checkout,
      p_first_name: form.first, p_last_name: form.last, p_phone: form.phone
    });
    setSubmitting(false);
    const result = data as Quote;
    if (rpcError || !result?.ok) {
      setError(result ? localizeError(result) : d.err_generic);
      return;
    }
    setDone(true);
  }

  // Calendar grid for current month
  const monthLabel = (locale === 'tr' ? MONTH_TR : MONTH_EN)[month.getMonth()] + ' ' + month.getFullYear();
  const days = useMemo(() => monthGridDays(month), [month]);

  const inRange = (dateIso: string) =>
    checkin && checkout && dateIso >= checkin && dateIso < checkout;

  if (done) {
    return (
      <div className="rounded-2xl border border-navy/10 bg-white p-6 text-center shadow-sm">
        <div className="font-display text-2xl font-semibold text-navy">{d.success_title}</div>
        <p className="mt-2 text-sm text-navy/70">{d.success_body}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-navy">{d.booking_title}</h2>

      {/* Calendar */}
      <div className="mt-4">
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
            const full = isBlocked(dIso);
            const disabled = past || full;
            const selected = dIso === checkin || dIso === checkout;
            const between = inRange(dIso);
            return (
              <button key={i} type="button" disabled={disabled} onClick={() => pick(dIso)}
                className={[
                  'aspect-square rounded-md text-xs',
                  disabled ? 'text-navy/25 line-through' : 'text-navy hover:bg-navy-mist',
                  full && !past ? 'bg-red-50' : '',
                  between ? 'bg-brass-soft' : '',
                  selected ? 'bg-navy font-bold text-white hover:bg-navy' : ''
                ].join(' ')}>
                {date.getDate()}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-4 text-[11px] text-navy/50">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-white ring-1 ring-navy/20" />{d.legend_available}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-100" />{d.legend_blocked}</span>
        </div>
      </div>

      {/* Selected dates */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-navy-mist p-3 text-sm">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-navy/50">{d.checkin}</div>
          <div className="font-semibold text-navy">{checkin ?? '—'}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-navy/50">{d.checkout}</div>
          <div className="font-semibold text-navy">{checkout ?? '—'}</div>
        </div>
      </div>
      {!checkin && <p className="mt-2 text-xs text-navy/50">{d.select_dates}</p>}

      {/* Quote breakdown — mirrors the market widget structure */}
      {quoting && <p className="mt-3 text-sm text-navy/60">…</p>}
      {quote?.ok && (
        <dl className="mt-4 space-y-2 border-t border-navy/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy/70">{d.accommodation} ({quote.nights} {d.nights_suffix.toLowerCase()})</dt>
            <dd className="font-semibold text-navy">{tl(quote.accommodation_total!)}{eur(quote.accommodation_total!)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/70">{d.cleaning}</dt>
            <dd className="font-semibold text-navy">{tl(quote.cleaning_fee!)}{eur(quote.cleaning_fee!)}</dd>
          </div>
          <div className="pt-1 text-[11px] font-bold uppercase tracking-wide text-navy/50">{d.summary}</div>
          <div className="flex justify-between">
            <dt className="text-navy/70">{d.prepayment}</dt>
            <dd className="text-navy">{tl(quote.prepayment!)}{eur(quote.prepayment!)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/70">{d.due_checkin}</dt>
            <dd className="text-navy">{tl(quote.due_at_checkin!)}{eur(quote.due_at_checkin!)}</dd>
          </div>
          <div className="flex justify-between border-t border-navy/10 pt-2 text-base">
            <dt className="font-bold text-navy">{d.total}</dt>
            <dd className="font-bold text-navy">{tl(quote.grand_total!)}{eur(quote.grand_total!)}</dd>
          </div>
          <div className="flex justify-between pt-2">
            <dt className="text-navy/60">{d.damage_deposit}</dt>
            <dd className="text-navy/80">{tl(quote.damage_deposit ?? depositAmount)}{eur(quote.damage_deposit ?? depositAmount)}</dd>
          </div>
          <p className="text-xs leading-relaxed text-navy/50">{d.deposit_note}</p>
          {currency === 'EUR' && <p className="text-xs leading-relaxed text-navy/50">{d.eur_note}</p>}
        </dl>
      )}

      {error && <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      {/* Guest details */}
      {quote?.ok && (
        <form onSubmit={submit} className="mt-4 space-y-3 border-t border-navy/10 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy/60" htmlFor="bw-first">{d.first_name}</label>
              <input id="bw-first" required minLength={2} value={form.first}
                onChange={(e) => setForm({ ...form, first: e.target.value })}
                className="w-full rounded-md border border-navy/20 px-3 py-2 text-sm focus:border-navy focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy/60" htmlFor="bw-last">{d.last_name}</label>
              <input id="bw-last" required minLength={2} value={form.last}
                onChange={(e) => setForm({ ...form, last: e.target.value })}
                className="w-full rounded-md border border-navy/20 px-3 py-2 text-sm focus:border-navy focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-navy/60" htmlFor="bw-phone">{d.phone}</label>
            <input id="bw-phone" required type="tel" placeholder="+90 5xx xxx xx xx" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-md border border-navy/20 px-3 py-2 text-sm focus:border-navy focus:outline-none" />
          </div>
          <button disabled={submitting}
            className="w-full rounded-full bg-brass py-3 text-sm font-bold text-navy hover:brightness-105 disabled:opacity-60">
            {submitting ? d.submitting : d.submit_request}
          </button>
        </form>
      )}
    </div>
  );
}
