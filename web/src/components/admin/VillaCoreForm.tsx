'use client';
import { useState, useTransition } from 'react';
import type { Villa } from '@/lib/types';

export function VillaCoreForm({ villa, action, submitLabel }: {
  villa: Partial<Villa>;
  action: (fd: FormData) => Promise<{ ok: boolean; error?: string } | void>;
  submitLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      const result = await action(fd);
      if (result && !result.ok) setMessage({ ok: false, text: result.error ?? 'Kaydedilemedi.' });
      else setMessage({ ok: true, text: 'Kaydedildi.' });
    });
  }

  return (
    <form action={handleSubmit} className="card p-5">
      {villa.id && <input type="hidden" name="id" value={villa.id} />}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <label className="label" htmlFor="slug">URL (slug)</label>
          <input id="slug" name="slug" required defaultValue={villa.slug ?? ''} className="input" placeholder="villa-defne" />
        </div>
        <div>
          <label className="label" htmlFor="region">Bölge</label>
          <select id="region" name="region" defaultValue={villa.region ?? 'fethiye'} className="input">
            <option value="fethiye">Fethiye</option>
            <option value="kas">Kaş</option>
            <option value="kalkan">Kalkan</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status">Yayın durumu</label>
          <select id="status" name="status" defaultValue={villa.status ?? 'draft'} className="input">
            <option value="draft">Taslak</option>
            <option value="active">Yayında</option>
            <option value="hidden">Gizli</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="capacity">Kişi</label>
          <input id="capacity" name="capacity" type="number" min={1} required defaultValue={villa.capacity ?? 6} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="bedrooms">Yatak odası</label>
          <input id="bedrooms" name="bedrooms" type="number" min={1} required defaultValue={villa.bedrooms ?? 3} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="bathrooms">Banyo</label>
          <input id="bathrooms" name="bathrooms" type="number" min={1} required defaultValue={villa.bathrooms ?? 3} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="default_min_stay">Min. konaklama (gece)</label>
          <input id="default_min_stay" name="default_min_stay" type="number" min={1} required defaultValue={villa.default_min_stay ?? 3} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="cleaning_fee">Temizlik ücreti (₺)</label>
          <input id="cleaning_fee" name="cleaning_fee" type="number" min={0} required defaultValue={villa.cleaning_fee ?? 0} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="deposit_amount">Hasar depozitosu (₺)</label>
          <input id="deposit_amount" name="deposit_amount" type="number" min={0} required defaultValue={villa.deposit_amount ?? 0} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="prepayment_pct">Ön ödeme (%)</label>
          <input id="prepayment_pct" name="prepayment_pct" type="number" min={0} max={100} required defaultValue={villa.prepayment_pct ?? 20} className="input" />
        </div>
      </div>
      {message && (
        <p className={`mt-4 text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>
      )}
      <div className="mt-4">
        <button disabled={pending} className="btn-primary">{pending ? 'Kaydediliyor…' : submitLabel}</button>
      </div>
    </form>
  );
}
