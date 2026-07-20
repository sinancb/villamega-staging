export const revalidate = 300;

import { t, REGION_LABEL, type Locale } from '@/lib/i18n';
import { fetchActiveVillas, coverUrl, todayNightly } from '@/lib/site-queries';
import { VillaCard } from '@/components/site/VillaCard';
import Link from 'next/link';

export default async function VillasPage({ params, searchParams }: {
  params: { locale: Locale };
  searchParams: { bolge?: string; kisi?: string };
}) {
  const d = t(params.locale);
  const region = ['fethiye', 'kas', 'kalkan'].includes(searchParams.bolge ?? '')
    ? searchParams.bolge : undefined;
  const minCapacity = Number(searchParams.kisi) || undefined;
  const villas = await fetchActiveVillas(region, minCapacity);

  const filterHref = (b?: string) => {
    const qs = new URLSearchParams();
    if (b) qs.set('bolge', b);
    if (searchParams.kisi) qs.set('kisi', searchParams.kisi);
    const s = qs.toString();
    return `/${params.locale}/villalar${s ? `?${s}` : ''}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display mb-8 text-4xl font-semibold text-navy">{d.nav_villas}</h1>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-navy/60">{d.filter_region}:</span>
        <Link href={filterHref()} className={`rounded-full px-4 py-1.5 text-sm font-medium ${!region ? 'bg-navy text-white' : 'bg-navy-mist text-navy hover:bg-navy/10'}`}>
          {d.filter_all}
        </Link>
        {(['fethiye', 'kas', 'kalkan'] as const).map((r) => (
          <Link key={r} href={filterHref(r)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${region === r ? 'bg-navy text-white' : 'bg-navy-mist text-navy hover:bg-navy/10'}`}>
            {REGION_LABEL[params.locale][r]}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {villas.map((v: any, i: number) => (
          <VillaCard key={v.id} villa={v} locale={params.locale} d={d}
            photoUrl={coverUrl(v, i)} todayPrice={todayNightly(v)} />
        ))}
        {villas.length === 0 && (
          <p className="col-span-3 py-16 text-center text-navy/60">—</p>
        )}
      </div>
    </div>
  );
}
