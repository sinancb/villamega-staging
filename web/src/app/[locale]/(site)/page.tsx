import Link from 'next/link';
export const revalidate = 300;

import { t, REGION_LABEL, type Locale } from '@/lib/i18n';
import { fetchActiveVillas, coverUrl, todayNightly } from '@/lib/site-queries';
import { VillaCard } from '@/components/site/VillaCard';
import { OmegaMark } from '@/components/site/Header';

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const d = t(params.locale);
  const villas = await fetchActiveVillas();

  return (
    <>
      {/* Hero: navy sea, omega arch as the framing device */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#2E6E8E_0%,#16294D_55%,#0B1526_100%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-20 text-center">
          <span className="mb-4 rounded-full border border-white/25 px-4 py-1 text-xs font-semibold tracking-[0.25em] text-brass-soft">
            {d.hero_eyebrow}
          </span>
          <h1 className="font-display max-w-3xl text-5xl font-bold leading-tight md:text-6xl">
            {d.hero_title}
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/75">{d.hero_sub}</p>
          <Link href={`/${params.locale}/villalar`}
            className="mt-8 rounded-full bg-brass px-8 py-3 text-sm font-bold text-navy transition-transform hover:scale-105">
            {d.hero_cta}
          </Link>
          <OmegaMark className="mt-14 h-16 w-16 text-white/15" />
        </div>
      </section>

      {/* Regions */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display mb-6 text-3xl font-semibold text-navy">{d.regions_title}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(['fethiye', 'kas', 'kalkan'] as const).map((r, i) => (
            <Link key={r} href={`/${params.locale}/villalar?bolge=${r}`}
              className="group relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/placeholders/villa-${i}.svg`} alt={REGION_LABEL[params.locale][r]}
                className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute bottom-4 left-4 font-display text-2xl font-semibold text-white drop-shadow">
                {REGION_LABEL[params.locale][r]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured villas */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-semibold text-navy">{d.featured_title}</h2>
          <Link href={`/${params.locale}/villalar`} className="text-sm font-semibold text-navy/70 hover:text-navy">
            {d.all_villas} →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {villas.slice(0, 3).map((v: any, i: number) => (
            <VillaCard key={v.id} villa={v} locale={params.locale} d={d}
              photoUrl={coverUrl(v, i)} todayPrice={todayNightly(v)} />
          ))}
        </div>
      </section>
    </>
  );
}
