import { supabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updateVilla } from '../actions';
import { VillaCoreForm } from '@/components/admin/VillaCoreForm';
import { TranslationForm } from '@/components/admin/TranslationForm';
import { SeasonEditor } from '@/components/admin/SeasonEditor';
import { PhotoManager } from '@/components/admin/PhotoManager';
import { FeedManager } from '@/components/admin/FeedManager';

export default async function VillaEditPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: villa } = await supabase
    .from('villas')
    .select('*, villa_translations(*), villa_photos(*), price_seasons(*), ical_feeds(*)')
    .eq('id', params.id)
    .single();

  if (!villa) notFound();

  const tr = villa.villa_translations?.find((t: any) => t.locale === 'tr');
  const en = villa.villa_translations?.find((t: any) => t.locale === 'en');
  const photos = [...(villa.villa_photos ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
  const seasons = [...(villa.price_seasons ?? [])].sort((a: any, b: any) =>
    a.start_date.localeCompare(b.start_date));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://siteniz.com';

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link href="/admin/villalar" className="text-sm text-aegean-600 hover:underline">← Villalar</Link>
        <h1 className="mt-2 text-2xl font-semibold text-pine-900">{tr?.title ?? villa.slug}</h1>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Temel bilgiler</h2>
        <VillaCoreForm villa={villa} action={updateVilla} submitLabel="Kaydet" />
      </section>

      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">İçerik</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-pine-900">Türkçe</h3>
            <TranslationForm villaId={villa.id} locale="tr" translation={tr} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-pine-900">English</h3>
            <TranslationForm villaId={villa.id} locale="en" translation={en} />
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Fotoğraflar</h2>
        <PhotoManager villaId={villa.id} slug={villa.slug} photos={photos} />
      </section>

      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Sezon fiyatları</h2>
        <SeasonEditor villaId={villa.id} seasons={seasons} />
      </section>

      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Takvim eşitleme (iCal)</h2>
        <FeedManager villaId={villa.id} feeds={villa.ical_feeds ?? []}
          exportUrl={`${siteUrl}/api/ical/${villa.slug}.ics`} />
      </section>
    </div>
  );
}
