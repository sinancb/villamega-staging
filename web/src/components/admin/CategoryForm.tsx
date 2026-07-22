'use client';
import { useState, useTransition } from 'react';
import { categoryIcon } from '@/components/site/categoryIcons';

const ICON_OPTIONS: { key: string; label: string }[] = [
  { key: 'family', label: 'Aile' },
  { key: 'paw', label: 'Evcil Hayvan (Pati)' },
  { key: 'bungalow', label: 'Bungalov' },
  { key: 'activity', label: 'Aktivite' },
  { key: 'crown', label: 'Taç (Lüks)' },
  { key: 'heated-pool', label: 'Isıtmalı Havuz' },
  { key: 'tag', label: 'Etiket (Ekonomik)' },
  { key: 'heart', label: 'Kalp (Balayı)' },
  { key: 'duck', label: 'Ördek (Çocuk Havuzu)' },
  { key: 'sea-view', label: 'Deniz Manzarası' },
  { key: 'shield', label: 'Kalkan (Korunaklı)' },
  { key: 'jacuzzi', label: 'Jakuzi' }
];

export type CategoryFormValue = {
  id?: string; slug?: string; icon?: string; sort_order?: number;
  label_tr?: string; label_en?: string;
};

export function CategoryForm({ category, action, submitLabel }: {
  category: CategoryFormValue;
  action: (fd: FormData) => Promise<{ ok: boolean; error?: string } | void>;
  submitLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [icon, setIcon] = useState(category.icon ?? ICON_OPTIONS[0].key);
  const Icon = categoryIcon(icon);

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      const result = await action(fd);
      if (result && !result.ok) setMessage({ ok: false, text: result.error ?? 'Kaydedilemedi.' });
      else if (result) setMessage({ ok: true, text: 'Kaydedildi.' });
    });
  }

  return (
    <form action={handleSubmit} className="card max-w-lg space-y-4 p-5">
      {category.id && <input type="hidden" name="id" value={category.id} />}

      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-mist">
          <Icon className="h-6 w-6 text-navy" />
        </span>
        <div className="flex-1">
          <label className="label" htmlFor="icon">İkon</label>
          <select id="icon" name="icon" value={icon} onChange={(e) => setIcon(e.target.value)} className="input">
            {ICON_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="slug">URL (slug)</label>
        <input id="slug" name="slug" required defaultValue={category.slug ?? ''} className="input" placeholder="luks-villalar" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="label_tr">Etiket (Türkçe)</label>
          <input id="label_tr" name="label_tr" required defaultValue={category.label_tr ?? ''} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="label_en">Etiket (English)</label>
          <input id="label_en" name="label_en" required defaultValue={category.label_en ?? ''} className="input" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="sort_order">Sıra</label>
        <input id="sort_order" name="sort_order" type="number" min={0} defaultValue={category.sort_order ?? 0} className="input w-32" />
      </div>

      {message && (
        <p className={`text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>
      )}
      <button disabled={pending} className="btn-primary">{pending ? 'Kaydediliyor…' : submitLabel}</button>
    </form>
  );
}
