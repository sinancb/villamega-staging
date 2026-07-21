import { supabaseServer } from '@/lib/supabase/server';
import { trDate, REGION_TR } from '@/lib/format';
import { toggleHandled } from './actions';
import Link from 'next/link';

const FILTERS = ['tumu', 'yeni', 'islendi'] as const;

export default async function VillaRequestsPage({
  searchParams
}: { searchParams: { durum?: string } }) {
  const filter = searchParams.durum ?? 'tumu';
  const supabase = supabaseServer();

  let query = supabase
    .from('villa_requests')
    .select('*, categories(category_translations(locale, label))')
    .order('created_at', { ascending: false })
    .limit(100);
  if (filter === 'yeni') query = query.eq('handled', false);
  if (filter === 'islendi') query = query.eq('handled', true);

  const { data: requests, error } = await query;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-pine-900">Villa Talepleri</h1>
      </div>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link key={f} href={f === 'tumu' ? '/admin/villa-talepleri' : `/admin/villa-talepleri?durum=${f}`}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === f ? 'bg-pine-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}>
            {f === 'tumu' ? 'Tümü' : f === 'yeni' ? 'Yeni' : 'İşlendi'}
          </Link>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600">
          Kayıtlar yüklenemedi: {error.message}. Migration 009_villa_finder.sql çalıştırıldı mı?
        </p>
      )}

      {!error && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="th pl-4">Misafir</th>
                <th className="th">Kriterler</th>
                <th className="th">Tarih</th>
                <th className="th">Geldi</th>
                <th className="th pr-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(requests ?? []).map((r: any) => {
                const categoryLabel = r.categories?.category_translations
                  ?.find((t: any) => t.locale === 'tr')?.label;
                const criteria = [
                  r.region ? REGION_TR[r.region] ?? r.region : null,
                  categoryLabel,
                  r.checkin && r.checkout ? `${trDate(r.checkin)} → ${trDate(r.checkout)}` : null,
                  r.guest_count ? `${r.guest_count} misafir` : null
                ].filter(Boolean).join(' · ') || '—';
                return (
                  <tr key={r.id}>
                    <td className="td pl-4">
                      <div className="font-medium text-pine-900">{r.first_name} {r.last_name}</div>
                      <a href={`tel:${r.phone}`} className="text-xs text-aegean-600 hover:underline">{r.phone}</a>
                    </td>
                    <td className="td max-w-xs text-sm text-slate-600">{criteria}</td>
                    <td className="td text-xs text-slate-500">{trDate(r.created_at)}</td>
                    <td className="td">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        r.handled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.handled ? 'İşlendi' : 'Yeni'}
                      </span>
                    </td>
                    <td className="td pr-4">
                      <form action={toggleHandled}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="handled" value={String(!r.handled)} />
                        <button className="text-sm text-aegean-600 hover:underline">
                          {r.handled ? 'Yeni olarak işaretle' : 'İşlendi olarak işaretle'}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {(requests ?? []).length === 0 && (
                <tr><td className="td pl-4 text-slate-500" colSpan={5}>Kayıt yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
