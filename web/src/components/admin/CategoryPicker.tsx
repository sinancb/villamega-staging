'use client';
import { useState, useTransition } from 'react';
import { saveCategories } from '@/app/admin/villalar/actions';

export function CategoryPicker({ villaId, allCategories, selectedIds }: {
  villaId: string;
  allCategories: { id: string; label: string }[];
  selectedIds: string[];
}) {
  const [selected, setSelected] = useState(new Set(selectedIds));
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      const result = await saveCategories(villaId, [...selected]);
      setMessage(result.ok ? { ok: true, text: 'Kaydedildi.' } : { ok: false, text: result.error ?? 'Kaydedilemedi.' });
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {allCategories.map((c) => (
          <label key={c.id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
            <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
            {c.label}
          </label>
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
