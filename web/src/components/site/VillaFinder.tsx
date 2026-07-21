'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Locale, Dict } from '@/lib/i18n';
import { REGION_LABEL } from '@/lib/i18n';
import { DateRangePicker } from '@/components/site/DateRangePicker';
import type { VillaTypeItem } from '@/components/site/VillaTypes';

export function VillaFinder({ locale, d, categories }: { locale: Locale; d: Dict; categories: VillaTypeItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-3xl border border-brass/30 bg-navy-mist/60 px-8 py-14 text-center">
        <h2 className="font-display text-3xl font-semibold text-navy">{d.finder_title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-navy/70">{d.finder_sub}</p>
        <button type="button" onClick={() => setOpen(true)}
          className="mt-7 rounded-full border border-brass bg-brass px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-navy transition-colors hover:bg-transparent">
          {d.finder_cta}
        </button>
      </div>

      {open && <VillaFinderModal locale={locale} d={d} categories={categories} onClose={() => setOpen(false)} />}
    </section>
  );
}

function VillaFinderModal({ locale, d, categories, onClose }: {
  locale: Locale; d: Dict; categories: VillaTypeItem[]; onClose: () => void;
}) {
  const [region, setRegion] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [checkin, setCheckin] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [form, setForm] = useState({ first: '', last: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(null);
    const supabase = supabaseBrowser();
    const { data, error: rpcError } = await supabase.rpc('create_villa_request', {
      p_region: region || null,
      p_category_id: categoryId || null,
      p_checkin: checkin,
      p_checkout: checkout,
      p_guest_count: guests,
      p_first_name: form.first,
      p_last_name: form.last,
      p_phone: form.phone
    });
    setSubmitting(false);
    if (rpcError || !data?.ok) {
      setError(data?.error === 'invalid_phone' ? d.err_invalid_phone
        : data?.error === 'invalid_name' ? d.err_generic
        : d.err_generic);
      return;
    }
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/70 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-navy">{d.finder_form_title}</h3>
          <button type="button" onClick={onClose} aria-label={d.gallery_close}
            className="flex h-8 w-8 items-center justify-center rounded-full text-navy/50 hover:bg-navy-mist hover:text-navy">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {done ? (
          <div className="py-10 text-center">
            <div className="font-display text-xl font-semibold text-navy">{d.finder_success_title}</div>
            <p className="mt-2 text-sm text-navy/70">{d.finder_success_body}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy/60">{d.search_region}</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-md border border-navy/20 px-3 py-2 text-sm focus:border-navy focus:outline-none">
                  <option value="">{d.search_select}</option>
                  {(['fethiye', 'kas', 'kalkan'] as const).map((r) => (
                    <option key={r} value={r}>{REGION_LABEL[locale][r]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy/60">{d.search_villa_type}</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-md border border-navy/20 px-3 py-2 text-sm focus:border-navy focus:outline-none">
                  <option value="">{d.search_any_type}</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <DateRangePicker locale={locale} checkin={checkin} checkout={checkout}
              onChange={(c1, c2) => { setCheckin(c1); setCheckout(c2); }}
              label={d.search_dates} placeholder={d.search_pick_dates} />

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy/60">{d.search_guest_count}</label>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="−" onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-navy/20 text-navy hover:bg-navy-mist">−</button>
                <span className="text-sm font-semibold text-navy">{guests}</span>
                <button type="button" aria-label="+" onClick={() => setGuests((g) => Math.min(20, g + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-navy/20 text-navy hover:bg-navy-mist">+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-navy/10 pt-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy/60">{d.first_name}</label>
                <input required minLength={2} value={form.first}
                  onChange={(e) => setForm({ ...form, first: e.target.value })}
                  className="w-full rounded-md border border-navy/20 px-3 py-2 text-sm focus:border-navy focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy/60">{d.last_name}</label>
                <input required minLength={2} value={form.last}
                  onChange={(e) => setForm({ ...form, last: e.target.value })}
                  className="w-full rounded-md border border-navy/20 px-3 py-2 text-sm focus:border-navy focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy/60">{d.phone}</label>
              <input required type="tel" placeholder="+90 5xx xxx xx xx" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-md border border-navy/20 px-3 py-2 text-sm focus:border-navy focus:outline-none" />
            </div>

            {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}

            <button disabled={submitting}
              className="w-full rounded-full bg-brass py-3 text-sm font-bold text-navy hover:brightness-105 disabled:opacity-60">
              {submitting ? d.submitting : d.finder_submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
