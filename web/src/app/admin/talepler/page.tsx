import { supabaseServer } from '@/lib/supabase/server';
import { StatusBadge, PaymentBadge } from '@/components/admin/badges';
import { tl, trDate, STATUS_TR } from '@/lib/format';
import Link from 'next/link';

const FILTERS = ['tumu', 'yeni', 'iletisimde', 'onaylandi', 'iptal', 'tamamlandi'] as const;

export default async function ReservationsPage({
  searchParams
}: { searchParams: { durum?: string } }) {
  const filter = searchParams.durum ?? 'tumu';
  const supabase = supabaseServer();

  let query = supabase
    .from('reservations')
    .select('*, villas(slug, villa_translations(title, locale))')
    .order('created_at', { ascending: false })
    .limit(100);
  if (filter !== 'tumu') query = query.eq('status', filter);

  const { data: reservations, error } = await query;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-pine-900">Rezervasyonlar</h1>
      </div>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link key={f} href={f === 'tumu' ? '/admin/talepler' : `/admin/talepler?durum=${f}`}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === f ? 'bg-pine-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}>
            {f === 'tumu' ? 'Tümü' : STATUS_TR[f]}
          </Link>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">Kayıtlar yüklenemedi: {error.message}</p>}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="th">Misafir</th>
              <th className="th">Villa</th>
              <th className="th">Tarihler</th>
              <th className="th">Tutar</th>
              <th className="th">Durum</th>
              <th className="th">Ödeme</th>
              <th className="th">Kaynak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(reservations ?? []).map((r: any) => {
              const title =
                r.villas?.villa_translations?.find((t: any) => t.locale === 'tr')?.title ??
                r.villas?.slug ?? '—';
              return (
                <tr key={r.id} className="hover:bg-aegean-100/40">
                  <td className="td">
                    <Link href={`/admin/talepler/${r.id}`} className="font-medium text-pine-900 hover:underline">
                      {r.guest_first_name} {r.guest_last_name}
                    </Link>
                    <div className="text-xs text-slate-500">{r.guest_phone}</div>
                  </td>
                  <td className="td">{title}</td>
                  <td className="td">
                    {trDate(r.checkin)} → {trDate(r.checkout)}
                    <div className="text-xs text-slate-500">{r.nights} gece</div>
                  </td>
                  <td className="td font-medium">{tl(r.grand_total)}</td>
                  <td className="td"><StatusBadge status={r.status} /></td>
                  <td className="td"><PaymentBadge status={r.payment_status} /></td>
                  <td className="td text-slate-500">{r.source}</td>
                </tr>
              );
            })}
            {(reservations ?? []).length === 0 && !error && (
              <tr><td className="td py-10 text-center text-slate-500" colSpan={7}>
                Bu durumda rezervasyon yok.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
