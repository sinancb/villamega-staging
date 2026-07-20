'use client';
import { useState, useTransition } from 'react';
import { saveSeason, deleteSeason } from '@/app/admin/villalar/actions';
import { tl } from '@/lib/format';
import type { PriceSeason } from '@/lib/types';

export function SeasonEditor({ villaId, seasons }: { villaId: string; seasons: PriceSeason[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function submit(fd: FormData, isDelete = false) {
    startTransition(async () => {
      const result = isDelete ? await deleteSeason(fd) : await saveSeason(fd);
      setMessage(result.ok
        ? { ok: true, text: isDelete ? 'Sezon silindi.' : 'Sezon kaydedildi.' }
        : { ok: false, text: result.error ?? 'İşlem başarısız.' });
    });
  }

  return (
    <div>
      <table className="mb-4 w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="th pl-0">Sezon</th>
            <th className="th">Tarih aralığı</th>
            <th className="th">Gecelik</th>
            <th className="th">Min. gece</th>
            <th className="th" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {seasons.map((s) => (
            <tr key={s.id}>
              <td className="td pl-0">{s.label ?? '—'}</td>
              <td className="td">{s.start_date} → {s.end_date}</td>
              <td className="td font-medium">{tl(s.nightly_price)}</td>
              <td className="td">{s.min_stay ?? 'varsayılan'}</td>
              <td className="td">
                <form action={(fd) => submit(fd, true)}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="villa_id" value={villaId} />
                  <button className="text-sm text-red-600 hover:underline">Sil</button>
                </form>
              </td>
            </tr>
          ))}
          {seasons.length === 0 && (
            <tr><td className="td pl-0 text-slate-500" colSpan={5}>
              Sezon tanımlanmadı. Fiyatı olmayan tarihler sitede rezervasyona kapalıdır.
            </td></tr>
          )}
        </tbody>
      </table>

      <form action={(fd) => submit(fd)} className="grid grid-cols-2 items-end gap-3 md:grid-cols-5">
        <input type="hidden" name="villa_id" value={villaId} />
        <div>
          <label className="label" htmlFor="s-label">Sezon adı</label>
          <input id="s-label" name="label" className="input" placeholder="Pik Yaz 2026" />
        </div>
        <div>
          <label className="label" htmlFor="s-start">Başlangıç</label>
          <input id="s-start" name="start_date" type="date" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="s-end">Bitiş (dahil)</label>
          <input id="s-end" name="end_date" type="date" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="s-price">Gecelik (₺)</label>
          <input id="s-price" name="nightly_price" type="number" min={1} required className="input" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label" htmlFor="s-min">Min. gece</label>
            <input id="s-min" name="min_stay" type="number" min={1} className="input" placeholder="boş = varsayılan" />
          </div>
          <button disabled={pending} className="btn-primary self-end">Ekle</button>
        </div>
      </form>
      {message && (
        <p className={`mt-3 text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>
      )}
    </div>
  );
}
