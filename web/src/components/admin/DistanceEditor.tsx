'use client';
import { useState, useTransition } from 'react';
import { saveDistances } from '@/app/admin/villalar/actions';

type DistanceTypeOption = { id: string; label: string };
type ExistingValue = { distance_type_id: string; km: number; note: string | null };

export function DistanceEditor({ villaId, allTypes, existing }: {
  villaId: string;
  allTypes: DistanceTypeOption[];
  existing: ExistingValue[];
}) {
  const [values, setValues] = useState(() => {
    const map = new Map(existing.map((e) => [e.distance_type_id, e]));
    return new Map(allTypes.map((t) => [
      t.id,
      { km: map.get(t.id)?.km?.toString() ?? '', note: map.get(t.id)?.note ?? '' }
    ]));
  });
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function update(id: string, field: 'km' | 'note', value: string) {
    setValues((prev) => {
      const next = new Map(prev);
      next.set(id, { ...next.get(id)!, [field]: value });
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      const entries = allTypes.map((t) => ({
        distance_type_id: t.id,
        km: values.get(t.id)?.km ?? '',
        note: values.get(t.id)?.note ?? ''
      }));
      const result = await saveDistances(villaId, entries);
      setMessage(result.ok ? { ok: true, text: 'Kaydedildi.' } : { ok: false, text: result.error ?? 'Kaydedilemedi.' });
    });
  }

  return (
    <div>
      <div className="space-y-2">
        {allTypes.map((t) => (
          <div key={t.id} className="grid grid-cols-[1fr_120px_1fr] items-center gap-3 rounded-md border border-slate-200 px-3 py-2">
            <span className="text-sm font-medium text-pine-900">{t.label}</span>
            <input type="number" min={0} step="0.1" placeholder="km"
              value={values.get(t.id)?.km ?? ''}
              onChange={(e) => update(t.id, 'km', e.target.value)}
              className="input" />
            <input type="text" placeholder="Not (opsiyonel, örn. Dalaman)"
              value={values.get(t.id)?.note ?? ''}
              onChange={(e) => update(t.id, 'note', e.target.value)}
              className="input" />
          </div>
        ))}
      </div>
      {message && (
        <p className={`mt-3 text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>
      )}
      <div className="mt-4">
        <button type="button" disabled={pending} onClick={save} className="btn-primary">
          {pending ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}
