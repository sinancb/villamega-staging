import { t, type Locale } from '@/lib/i18n';
import { HeroSlider } from '@/components/site/HeroSlider';
import { OwnerLeadForm } from '@/components/site/OwnerLeadForm';

export default function OwnerLeadPage({ params }: { params: { locale: Locale } }) {
  const d = t(params.locale);

  return (
    <>
      <section className="relative isolate flex min-h-[380px] items-center overflow-hidden bg-navy-deep text-white md:min-h-[440px]">
        <HeroSlider slides={d.hero_slides} showCaption={false} />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16">
          <h1 className="font-display max-w-2xl text-4xl font-bold leading-tight [text-shadow:0_2px_18px_rgba(11,21,38,0.45)] md:text-5xl">
            {d.owner_hero_title}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 [text-shadow:0_1px_10px_rgba(11,21,38,0.4)]">
            {d.owner_hero_sub}
          </p>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-10 max-w-lg px-4 pb-16 md:-mt-12">
        <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-2xl">
          <h2 className="font-display text-xl font-semibold text-navy">{d.owner_form_title}</h2>
          <p className="mt-2 text-sm text-navy/60">{d.owner_form_sub}</p>
          <div className="mt-6">
            <OwnerLeadForm d={d} />
          </div>
        </div>
      </div>
    </>
  );
}
