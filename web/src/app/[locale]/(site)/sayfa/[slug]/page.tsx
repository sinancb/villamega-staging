import { supabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Locale } from '@/lib/i18n';

export default async function StaticPage({ params }: {
  params: { locale: Locale; slug: string };
}) {
  const supabase = supabaseServer();
  const { data: page } = await supabase
    .from('pages')
    .select('slug, page_translations(*)')
    .eq('slug', params.slug)
    .single();
  if (!page) notFound();

  const tr = page.page_translations?.find((t: any) => t.locale === params.locale)
    ?? page.page_translations?.find((t: any) => t.locale === 'tr');
  if (!tr) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display mb-6 text-4xl font-semibold text-navy">{tr.title}</h1>
      <div className="whitespace-pre-wrap leading-relaxed text-navy/80">{tr.body}</div>
    </article>
  );
}
