import { supabaseServer } from '@/lib/supabase/server';
import { trDate } from '@/lib/format';
import { resolveConflict } from './actions';
import Link from 'next/link';

export default async function ConflictsPage() {
  const supabase = supabaseServer();
  const { data: conflicts } = await supabase
    .from('conflicts')
    .select(`id, detected_at, resolved_at,
             reservations(id, guest_first_name, guest_last_name, checkin, checkout),
             ical_events(dtstart, dtend, summary, ical_feeds(platform)),
             villas(slug, villa_translations(title, locale))`)
    .is('resolved_at', null)
    .order('detected_at', { ascending: false });

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-pine-900">Takvim çakışmaları</h1>
      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        Dış platformdan gelen bir kayıt, buradaki onaylı bir rezervasyonla aynı tarihlere denk
        geliyor. Hangi kaydın geçerli olduğunu netleştirin: gerekiyorsa dış platformdaki
        rezervasyonu iptal ettirin veya buradaki rezervasyonu güncelleyin, sonra çakışmayı
        çözüldü olarak işaretleyin.
      </p>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="th">Villa</th>
              <th className="th">Onaylı rezervasyon</th>
              <th className="th">Dış kayıt</th>
              <th className="th">Tespit</th>
              <th className="th" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(conflicts ?? []).map((c: any) => {
              const title = c.villas?.villa_translations?.find((t: any) => t.locale === 'tr')?.title
                ?? c.villas?.slug;
              return (
                <tr key={c.id} className="hover:bg-red-50/40">
                  <td className="td font-medium text-pine-900">{title}</td>
                  <td className="td">
                    <Link href={`/admin/talepler/${c.reservations?.id}`} className="text-aegean-600 hover:underline">
                      {c.reservations?.guest_first_name} {c.reservations?.guest_last_name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {trDate(c.reservations?.checkin)} → {trDate(c.reservations?.checkout)}
                    </div>
                  </td>
                  <td className="td">
                    <span className="capitalize">{c.ical_events?.ical_feeds?.platform}</span>
                    <div className="text-xs text-slate-500">
                      {trDate(c.ical_events?.dtstart)} → {trDate(c.ical_events?.dtend)}
                      {c.ical_events?.summary ? ` · ${c.ical_events.summary}` : ''}
                    </div>
                  </td>
                  <td className="td text-xs text-slate-500">
                    {new Date(c.detected_at).toLocaleString('tr-TR')}
                  </td>
                  <td className="td">
                    <form action={resolveConflict}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="btn-ghost text-sm">Çözüldü işaretle</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {(conflicts ?? []).length === 0 && (
              <tr><td className="td py-10 text-center text-slate-500" colSpan={5}>
                Açık çakışma yok. Eşitleme her 30 dakikada bir çalışır.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
