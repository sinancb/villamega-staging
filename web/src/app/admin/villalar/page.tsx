import { supabaseServer } from '@/lib/supabase/server';
import { REGION_TR, tl } from '@/lib/format';
import Link from 'next/link';

const STATUS_TR: Record<string, string> = { draft: 'Taslak', active: 'Yayında', hidden: 'Gizli' };
const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800', active: 'bg-emerald-100 text-emerald-800',
  hidden: 'bg-slate-200 text-slate-600'
};

export default async function VillasPage() {
  const supabase = supabaseServer();
  const { data: villas } = await supabase
    .from('villas')
    .select('*, villa_translations(title, locale), villa_photos(id)')
    .order('created_at', { ascending: true });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-pine-900">Villalar</h1>
        <Link href="/admin/villalar/yeni" className="btn-primary">Yeni villa</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="th">Villa</th>
              <th className="th">Bölge</th>
              <th className="th">Kapasite</th>
              <th className="th">Temizlik</th>
              <th className="th">Depozito</th>
              <th className="th">Fotoğraf</th>
              <th className="th">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(villas ?? []).map((v: any) => {
              const title = v.villa_translations?.find((t: any) => t.locale === 'tr')?.title ?? v.slug;
              return (
                <tr key={v.id} className="hover:bg-aegean-100/40">
                  <td className="td">
                    <Link href={`/admin/villalar/${v.id}`} className="font-medium text-pine-900 hover:underline">
                      {title}
                    </Link>
                    <div className="text-xs text-slate-500">/{v.slug}</div>
                  </td>
                  <td className="td">{REGION_TR[v.region]}</td>
                  <td className="td">{v.capacity} kişi · {v.bedrooms} yatak odası</td>
                  <td className="td">{tl(v.cleaning_fee)}</td>
                  <td className="td">{tl(v.deposit_amount)}</td>
                  <td className="td">{v.villa_photos?.length ?? 0}</td>
                  <td className="td">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[v.status]}`}>
                      {STATUS_TR[v.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
            {(villas ?? []).length === 0 && (
              <tr><td className="td py-10 text-center text-slate-500" colSpan={7}>
                Henüz villa eklenmedi. <Link className="text-aegean-600 hover:underline" href="/admin/villalar/yeni">İlk villayı ekleyin.</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
