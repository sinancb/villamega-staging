import { supabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { t, REGION_LABEL, type Locale } from '@/lib/i18n';
import { tl, trDate } from '@/lib/format';
import { coverUrl } from '@/lib/site-queries';
import { BookingWidget } from '@/components/site/BookingWidget';
import { PhotoGallery } from '@/components/site/PhotoGallery';
import type { Metadata } from 'next';

async function getVilla(slug: string) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('villas')
    .select(`*, villa_translations(*), villa_photos(*), price_seasons(*),
             villa_amenities(amenities(icon, amenity_translations(locale, label)))`)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  return data;
}

export async function generateMetadata({ params }: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const villa = await getVilla(params.slug);
  const tr = villa?.villa_translations?.find((x: any) => x.locale === params.locale)
    ?? villa?.villa_translations?.find((x: any) => x.locale === 'tr');
  return {
    title: tr?.seo_title ?? tr?.title ?? 'Villamega',
    description: tr?.seo_desc ?? undefined
  };
}

export default async function VillaDetailPage({ params }: {
  params: { locale: Locale; slug: string };
}) {
  const villa = await getVilla(params.slug);
  if (!villa) notFound();
  const d = t(params.locale);

  const trn = villa.villa_translations?.find((x: any) => x.locale === params.locale)
    ?? villa.villa_translations?.find((x: any) => x.locale === 'tr');
  const photos = [...(villa.villa_photos ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
  const seasons = [...(villa.price_seasons ?? [])]
    .sort((a: any, b: any) => a.start_date.localeCompare(b.start_date));
  const amenities = (villa.villa_amenities ?? [])
    .map((va: any) => va.amenities)
    .filter(Boolean)
    .map((a: any) => ({
      icon: a.icon,
      label: a.amenity_translations?.find((x: any) => x.locale === params.locale)?.label
        ?? a.amenity_translations?.find((x: any) => x.locale === 'tr')?.label ?? ''
    }));

  const galleryUrls = photos.length
    ? photos.map((p: any) =>
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/villas/${p.storage_path}`)
    : [coverUrl(villa, 0), '/placeholders/villa-1.svg', '/placeholders/villa-2.svg'];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Gallery: arch-framed cover + strip */}
      <PhotoGallery photos={galleryUrls} alt={trn?.title ?? villa.slug}
        morePhotosLabel={d.gallery_more_photos} closeLabel={d.gallery_close} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <span className="rounded-full bg-navy-mist px-3 py-1 text-xs font-semibold text-navy">
            {REGION_LABEL[params.locale][villa.region]}
          </span>
          <h1 className="font-display mt-3 text-4xl font-semibold text-navy">{trn?.title}</h1>

          <div className="mt-5 flex flex-wrap gap-6 border-y border-navy/10 py-4 text-sm text-navy/70">
            <span><strong className="text-navy">{villa.capacity}</strong> {d.guests}</span>
            <span><strong className="text-navy">{villa.bedrooms}</strong> {d.bedrooms}</span>
            <span><strong className="text-navy">{villa.bathrooms}</strong> {d.bathrooms}</span>
            <span><strong className="text-navy">{villa.default_min_stay}</strong> {d.nights_suffix} {d.min_stay.toLowerCase()}</span>
          </div>

          <p className="mt-6 whitespace-pre-wrap leading-relaxed text-navy/80">{trn?.description}</p>

          {amenities.length > 0 && (
            <>
              <h2 className="font-display mt-10 text-2xl font-semibold text-navy">{d.amenities_title}</h2>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-navy/80 md:grid-cols-3">
                {amenities.map((a: any) => (
                  <li key={a.label} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brass" />{a.label}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="font-display mt-10 text-2xl font-semibold text-navy">{d.price_table}</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-left text-xs uppercase tracking-wide text-navy/50">
                <th className="py-2">{d.season}</th>
                <th className="py-2">{d.date_range}</th>
                <th className="py-2">{d.nightly}</th>
                <th className="py-2">{d.min_stay}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {seasons.map((s: any) => (
                <tr key={s.id}>
                  <td className="py-2.5 font-medium text-navy">{s.label ?? '—'}</td>
                  <td className="py-2.5 text-navy/70">{trDate(s.start_date)} – {trDate(s.end_date)}</td>
                  <td className="py-2.5 font-semibold text-navy">{tl(s.nightly_price)}</td>
                  <td className="py-2.5 text-navy/70">{s.min_stay ?? villa.default_min_stay} {d.nights_suffix.toLowerCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget villaId={villa.id} locale={params.locale} depositAmount={villa.deposit_amount} />
        </aside>
      </div>
    </div>
  );
}
