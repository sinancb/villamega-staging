import Link from 'next/link';
import { tl } from '@/lib/format';
import type { Dict, Locale } from '@/lib/i18n';
import { REGION_LABEL } from '@/lib/i18n';

export function VillaCard({ villa, locale, d, photoUrl, todayPrice }: {
  villa: any; locale: Locale; d: Dict; photoUrl: string; todayPrice: number | null;
}) {
  const title = villa.villa_translations?.find((t: any) => t.locale === locale)?.title
    ?? villa.villa_translations?.find((t: any) => t.locale === 'tr')?.title
    ?? villa.slug;
  return (
    <Link href={`/${locale}/villalar/${villa.slug}`}
      className="group block overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative overflow-hidden rounded-t-arch">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={title}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy">
          {REGION_LABEL[locale][villa.region]}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-semibold text-navy">{title}</h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/60">
          <span>{villa.capacity} {d.guests}</span>
          <span>{villa.bedrooms} {d.bedrooms}</span>
          <span>{villa.bathrooms} {d.bathrooms}</span>
          <span>{villa.default_min_stay} {d.nights_suffix} {d.min_stay.toLowerCase()}</span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            {todayPrice !== null && (
              <>
                <div className="text-[11px] uppercase tracking-wide text-navy/50">{d.from_price}</div>
                <div className="text-lg font-bold text-navy">{tl(todayPrice)}</div>
              </>
            )}
          </div>
          <span className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white group-hover:bg-brass group-hover:text-navy">
            {d.view_details}
          </span>
        </div>
      </div>
    </Link>
  );
}
