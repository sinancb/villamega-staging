'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Dict } from '@/lib/i18n';

export function OwnerLeadForm({ d }: { d: Dict }) {
  const [form, setForm] = useState({ first: '', last: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(null);
    const supabase = supabaseBrowser();
    const { data, error: rpcError } = await supabase.rpc('create_owner_lead', {
      p_first_name: form.first,
      p_last_name: form.last,
      p_email: form.email,
      p_phone: `+90${form.phone.replace(/\D/g, '')}`
    });
    setSubmitting(false);
    if (rpcError || !data?.ok) {
      setError(data?.error === 'invalid_phone' ? d.err_invalid_phone
        : data?.error === 'invalid_email' ? d.err_invalid_email
        : d.err_generic);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="py-8 text-center">
        <div className="font-display text-xl font-semibold text-navy">{d.owner_success_title}</div>
        <p className="mt-2 text-sm text-navy/70">{d.owner_success_body}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="grid grid-cols-2 gap-4">
        <input required minLength={2} placeholder={d.first_name} value={form.first}
          onChange={(e) => setForm({ ...form, first: e.target.value })}
          className="w-full rounded-md border border-navy/20 px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none" />
        <input required minLength={2} placeholder={d.last_name} value={form.last}
          onChange={(e) => setForm({ ...form, last: e.target.value })}
          className="w-full rounded-md border border-navy/20 px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <input required type="email" placeholder={d.email} value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-md border border-navy/20 px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none" />
        <div className="flex overflow-hidden rounded-md border border-navy/20 focus-within:border-navy">
          <span className="flex items-center border-r border-navy/20 bg-navy-mist px-3 text-sm text-navy/60">+90</span>
          <input required type="tel" placeholder="5xx xxx xx xx" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2.5 text-sm text-navy focus:outline-none" />
        </div>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 p-2.5 text-sm text-red-700">{error}</p>}

      <div className="mt-6 flex items-center justify-between border-t border-navy/10 pt-5">
        <span className="text-sm text-navy/50">{d.owner_step}</span>
        <button disabled={submitting}
          className="rounded-full bg-brass px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy transition-colors hover:brightness-105 disabled:opacity-60">
          {submitting ? d.submitting : d.owner_next}
        </button>
      </div>
    </form>
  );
}
