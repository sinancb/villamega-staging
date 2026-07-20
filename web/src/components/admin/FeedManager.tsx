'use client';
import { useState, useTransition } from 'react';
import { saveFeed, deleteFeed } from '@/app/admin/villalar/actions';
import type { IcalFeed } from '@/lib/types';

const PLATFORMS = ['airbnb', 'booking', 'villavillam', 'villasepeti', 'hepsivilla', 'diger'];

export function FeedManager({ villaId, feeds, exportUrl }: {
  villaId: string; feeds: IcalFeed[]; exportUrl: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function submit(fd: FormData, isDelete = false) {
    startTransition(async () => {
      const result = isDelete ? await deleteFeed(fd) : await saveFeed(fd);
      setMessage(result.ok
        ? { ok: true, text: isDelete ? 'Takvim bağlantısı kaldırıldı.' : 'Takvim bağlantısı eklendi.' }
        : { ok: false, text: result.error ?? 'İşlem başarısız.' });
    });
  }

  return (
    <div>
      <div className="mb-4 rounded-md bg-aegean-100 p-3 text-sm">
        <span className="font-medium">Dışa aktarım adresi</span> — Airbnb, Booking ve diğer
        platformlara bu adresi tanıtın; onaylı rezervasyonlarınız oradaki takvimleri kapatır:
        <code className="mt-1 block select-all break-all rounded bg-white px-2 py-1 text-xs">{exportUrl}</code>
      </div>

      <table className="mb-4 w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="th pl-0">Platform</th>
            <th className="th">Adres</th>
            <th className="th">Son eşitleme</th>
            <th className="th" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {feeds.map((f) => (
            <tr key={f.id}>
              <td className="td pl-0 capitalize">{f.platform}</td>
              <td className="td max-w-xs truncate text-xs text-slate-500">{f.url}</td>
              <td className="td text-xs">
                {f.last_synced_at ? new Date(f.last_synced_at).toLocaleString('tr-TR') : 'Henüz eşitlenmedi'}
                {f.last_status && f.last_status !== 'ok' && (
                  <span className="ml-2 text-red-600">{f.last_status}</span>
                )}
              </td>
              <td className="td">
                <form action={(fd) => submit(fd, true)}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="villa_id" value={villaId} />
                  <button className="text-sm text-red-600 hover:underline">Kaldır</button>
                </form>
              </td>
            </tr>
          ))}
          {feeds.length === 0 && (
            <tr><td className="td pl-0 text-slate-500" colSpan={4}>
              Takvim bağlantısı yok. Diğer platformlardaki rezervasyonların buradaki takvimi
              kapatması için iCal adreslerini ekleyin.
            </td></tr>
          )}
        </tbody>
      </table>

      <form action={(fd) => submit(fd)} className="flex items-end gap-3">
        <input type="hidden" name="villa_id" value={villaId} />
        <div>
          <label className="label" htmlFor="f-platform">Platform</label>
          <select id="f-platform" name="platform" className="input">
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="label" htmlFor="f-url">iCal adresi</label>
          <input id="f-url" name="url" type="url" required className="input"
            placeholder="https://www.airbnb.com/calendar/ical/…" />
        </div>
        <button disabled={pending} className="btn-primary">Ekle</button>
      </form>
      {message && (
        <p className={`mt-3 text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>
      )}
    </div>
  );
}
