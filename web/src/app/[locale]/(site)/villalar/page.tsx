export const revalidate = 300;

import { t, REGION_LABEL, type Locale } from '@/lib/i18n';
import { fetchActiveVillas, fetchCategories, coverUrl, todayNightly } from '@/lib/site-queries';
import { VillaCard } from '@/components/site/VillaCard';
import { getEurRate } from '@/lib/currency';
import { getCurrencyFromCookies } from '@/lib/currency-server';
import Link from 'next/link';

export default async function VillasPage({ params, searchParams }: {
  params: { locale: Locale };
  searchParams: { bolge?: string; kisi?: string; tip?: string; giris?: string; cikis?: string };
}) {
  const d = t(params.locale);
  const region = ['fethiye', 'kas', 'kalkan'].includes(searchParams.bolge ?? '')
    ? searchParams.bolge : undefined;
  const minCapacity = Number(searchParams.kisi) || undefined;
  const categorySlug = searchParams.tip || undefined;
  const checkin = searchParams.giris || undefined;
  const checkout = searchParams.cikis || undefined;
  const currency = getCurrencyFromCookies(params.locale);

  const [villas, categories, eurRate] = await Promise.all([
    fetchActiveVillas({ region, categorySlug, minCapacity, checkin, checkout }),
    fetchCategories(params.locale),
    currency === 'EUR' ? getEurRate() : Promise.resolve(1)
  ]);
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  const filterHref = (overrides: { bolge?: string | null; tip?: string | null }) => {
    const qs = new URLSearchParams();
    const nextBolge = overrides.bolge !== undefined ? overrides.bolge : region;
    const nextTip = overrides.tip !== undefined ? overrides.tip : categorySlug;
    if (nextBolge) qs.set('bolge', nextBolge);
    if (nextTip) qs.set('tip', nextTip);
    if (searchParams.kisi) qs.set('kisi', searchParams.kisi);
    if (checkin) qs.set('giris', checkin);
    if (checkout) qs.set('cikis', checkout);
    const s = qs.toString();
    return `/${params.locale}/villalar${s ? `?${s}` : ''}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display mb-8 text-4xl font-semibold text-navy">{d.nav_villas}</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-navy/60">{d.filter_region}:</span>
        <Link href={filterHref({ bolge: null })} className={`rounded-full px-4 py-1.5 text-sm font-medium ${!region ? 'bg-navy text-white' : 'bg-navy-mist text-navy hover:bg-navy/10'}`}>
          {d.filter_all}
        </Link>
        {(['fethiye', 'kas', 'kalkan'] as const).map((r) => (
          <Link key={r} href={filterHref({ bolge: r })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${region === r ? 'bg-navy text-white' : 'bg-navy-mist text-navy hover:bg-navy/10'}`}>
            {REGION_LABEL[params.locale][r]}
          </Link>
        ))}
      </div>

      {(activeCategory || (checkin && checkout)) && (
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">
          {activeCategory && (
            <span className="flex items-center gap-2 rounded-full border border-brass bg-brass-soft/40 px-3 py-1 text-navy">
              {activeCategory.label}
              <Link href={filterHref({ tip: null })} aria-label="Kategoriyi kaldır" className="text-navy/50 hover:text-navy">×</Link>
            </span>
          )}
          {checkin && checkout && (
            <span className="rounded-full border border-navy/15 bg-white px-3 py-1 text-navy/80">
              {checkin} → {checkout}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {villas.map((v: any, i: number) => (
          <VillaCard key={v.id} villa={v} locale={params.locale} d={d}
            photoUrl={coverUrl(v, i)} photoIndex={i} todayPrice={todayNightly(v)}
            currency={currency} eurRate={eurRate} />
        ))}
        {villas.length === 0 && (
          <p className="col-span-3 py-16 text-center text-navy/60">—</p>
        )}
      </div>
    </div>
  );
}
