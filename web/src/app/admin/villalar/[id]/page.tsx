import { supabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updateVilla } from '../actions';
import { VillaCoreForm } from '@/components/admin/VillaCoreForm';
import { TranslationForm } from '@/components/admin/TranslationForm';
import { SeasonEditor } from '@/components/admin/SeasonEditor';
import { PhotoManager } from '@/components/admin/PhotoManager';
import { FeedManager } from '@/components/admin/FeedManager';
import { CategoryPicker } from '@/components/admin/CategoryPicker';
import { Tabs } from '@/components/admin/Tabs';

export default async function VillaEditPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: villa } = await supabase
    .from('villas')
    .select('*, villa_translations(*), villa_photos(*), price_seasons(*), ical_feeds(*)')
    .eq('id', params.id)
    .single();

  if (!villa) notFound();

  // Categories land with migration 008 — until it's applied these queries
  // fail gracefully and the section below just shows no options.
  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, sort_order, category_translations(locale, label)')
    .order('sort_order', { ascending: true });
  const { data: villaCategories } = await supabase
    .from('villa_categories')
    .select('category_id')
    .eq('villa_id', params.id);
  const categoryOptions = (allCategories ?? []).map((c: any) => ({
    id: c.id as string,
    label: c.category_translations?.find((t: any) => t.locale === 'tr')?.label ?? c.id
  }));
  const selectedCategoryIds = (villaCategories ?? []).map((vc: any) => vc.category_id as string);

  const tr = villa.villa_translations?.find((t: any) => t.locale === 'tr');
  const en = villa.villa_translations?.find((t: any) => t.locale === 'en');
  const photos = [...(villa.villa_photos ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
  const seasons = [...(villa.price_seasons ?? [])].sort((a: any, b: any) =>
    a.start_date.localeCompare(b.start_date));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://siteniz.com';

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link href="/admin/villalar" className="text-sm text-aegean-600 hover:underline">← Villalar</Link>
        <h1 className="mt-2 text-2xl font-semibold text-pine-900">{tr?.title ?? villa.slug}</h1>
      </div>

      <Tabs tabs={[
        {
          key: 'tanim',
          label: 'Tanım',
          content: (
            <div className="space-y-8">
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

              {categoryOptions.length > 0 && (
                <section className="card p-5">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Villa Tipleri</h2>
                  <CategoryPicker villaId={villa.id} allCategories={categoryOptions} selectedIds={selectedCategoryIds} />
                </section>
              )}
            </div>
          )
        },
        {
          key: 'resimler',
          label: 'Resimler',
          badge: photos.length,
          content: (
            <section className="card p-5">
              <PhotoManager villaId={villa.id} slug={villa.slug} photos={photos} />
            </section>
          )
        },
        {
          key: 'fiyatlandirma',
          label: 'Fiyatlandırma',
          content: (
            <section className="card p-5">
              <SeasonEditor villaId={villa.id} seasons={seasons} />
            </section>
          )
        },
        {
          key: 'ical',
          label: 'iCal',
          content: (
            <section className="card p-5">
              <FeedManager villaId={villa.id} feeds={villa.ical_feeds ?? []}
                exportUrl={`${siteUrl}/api/ical/${villa.slug}.ics`} />
            </section>
          )
        }
      ]} />
    </div>
  );
}
