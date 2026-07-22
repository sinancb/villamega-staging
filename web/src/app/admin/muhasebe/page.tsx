import { supabaseServer } from '@/lib/supabase/server';
import { tl } from '@/lib/format';

export default async function AccountingPage() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('reservations')
    .select('id, villa_id, checkin, grand_total, payment_status, villas(slug, villa_translations(title, locale))')
    .eq('status', 'onaylandi')
    .order('checkin', { ascending: false });

  const rows = data ?? [];
  const totalRevenue = rows.reduce((sum, r: any) => sum + Number(r.grand_total), 0);
  const paidCount = rows.filter((r: any) => r.payment_status === 'tamamlandi').length;

  const byMonth = new Map<string, number>();
  for (const r of rows as any[]) {
    const key = r.checkin.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(r.grand_total));
  }
  const monthEntries = [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  const byVilla = new Map<string, { title: string; total: number; count: number }>();
  for (const r of rows as any[]) {
    const title = r.villas?.villa_translations?.find((t: any) => t.locale === 'tr')?.title ?? r.villas?.slug ?? '—';
    const cur = byVilla.get(r.villa_id) ?? { title, total: 0, count: 0 };
    cur.total += Number(r.grand_total);
    cur.count += 1;
    byVilla.set(r.villa_id, cur);
  }
  const villaEntries = [...byVilla.values()].sort((a, b) => b.total - a.total);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-pine-900">Muhasebe</h1>

      {error && (
        <p className="text-sm text-red-600">Kayıtlar yüklenemedi: {error.message}</p>
      )}

      {!error && (
        <>
          <p className="mb-6 text-sm text-slate-500">
            Yalnızca <strong>onaylanmış</strong> rezervasyonların toplamlarını gösterir. Fatura/gider takibi kapsam dışında.
          </p>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Toplam Gelir (Onaylı)</div>
              <div className="mt-1 text-2xl font-bold text-pine-900">{tl(totalRevenue)}</div>
            </div>
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Onaylı Rezervasyon</div>
              <div className="mt-1 text-2xl font-bold text-pine-900">{rows.length}</div>
            </div>
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ödemesi Tamamlanan</div>
              <div className="mt-1 text-2xl font-bold text-pine-900">{paidCount}</div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Aylık Gelir</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {monthEntries.map(([month, total]) => (
                    <tr key={month}>
                      <td className="py-2 text-slate-700">{month}</td>
                      <td className="py-2 text-right font-semibold text-pine-900">{tl(total)}</td>
                    </tr>
                  ))}
                  {monthEntries.length === 0 && (
                    <tr><td className="py-4 text-slate-500" colSpan={2}>Henüz veri yok.</td></tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Villa Bazında Gelir</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {villaEntries.map((v) => (
                    <tr key={v.title}>
                      <td className="py-2 text-slate-700">{v.title} <span className="text-xs text-slate-400">({v.count})</span></td>
                      <td className="py-2 text-right font-semibold text-pine-900">{tl(v.total)}</td>
                    </tr>
                  ))}
                  {villaEntries.length === 0 && (
                    <tr><td className="py-4 text-slate-500" colSpan={2}>Henüz veri yok.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
