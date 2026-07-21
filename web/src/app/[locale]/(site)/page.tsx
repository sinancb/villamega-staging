import Link from 'next/link';
export const revalidate = 300;

import { t, REGION_LABEL, type Locale } from '@/lib/i18n';
import { fetchActiveVillas, fetchCategories, coverUrl, todayNightly } from '@/lib/site-queries';
import { VillaCard } from '@/components/site/VillaCard';
import { HeroSlider } from '@/components/site/HeroSlider';
import { HeroSearchWidget } from '@/components/site/HeroSearchWidget';
import { VillaTypes } from '@/components/site/VillaTypes';

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const d = t(params.locale);
  const [villas, categories] = await Promise.all([
    fetchActiveVillas(),
    fetchCategories(params.locale)
  ]);

  return (
    <>
      {/* Hero: panoramic Ölüdeniz slider, omega arch woven through as a watermark */}
      <section className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-navy-deep text-white md:min-h-[760px]">
        <HeroSlider slides={d.hero_slides} />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-20 text-center">
          <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-brass-soft">
            <span className="h-px w-8 bg-brass-soft/60" />
            {d.hero_eyebrow}
            <span className="h-px w-8 bg-brass-soft/60" />
          </div>
          <h1 className="font-display max-w-3xl text-5xl font-bold leading-tight [text-shadow:0_2px_18px_rgba(11,21,38,0.45)] md:text-6xl">
            {d.hero_title}
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/85 [text-shadow:0_1px_10px_rgba(11,21,38,0.4)]">{d.hero_sub}</p>
          <Link href={`/${params.locale}/villalar`}
            className="mt-8 rounded-full border border-brass bg-brass px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-navy transition-colors hover:bg-transparent hover:text-white">
            {d.hero_cta}
          </Link>
        </div>
      </section>

      <HeroSearchWidget locale={params.locale} d={d} categories={categories} />

      <VillaTypes locale={params.locale} title={d.villa_types_title} categories={categories} />

      {/* Regions */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display text-3xl font-semibold text-navy">{d.regions_title}</h2>
        <div className="mb-6 mt-3 h-px w-14 bg-brass" />
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
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-semibold text-navy">{d.featured_title}</h2>
          <Link href={`/${params.locale}/villalar`} className="text-sm font-semibold text-navy/70 hover:text-navy">
            {d.all_villas} →
          </Link>
        </div>
        <div className="mb-6 h-px w-14 bg-brass" />
        <div className="grid gap-6 md:grid-cols-3">
          {villas.slice(0, 3).map((v: any, i: number) => (
            <VillaCard key={v.id} villa={v} locale={params.locale} d={d}
              photoUrl={coverUrl(v, i)} photoIndex={i} todayPrice={todayNightly(v)} />
          ))}
        </div>
      </section>
    </>
  );
}
