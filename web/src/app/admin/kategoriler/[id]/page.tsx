import { supabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { updateCategory } from '../actions';
import { CategoryForm } from '@/components/admin/CategoryForm';
import Link from 'next/link';

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: category } = await supabase
    .from('categories')
    .select('id, slug, icon, sort_order, category_translations(locale, label)')
    .eq('id', params.id)
    .single();

  if (!category) notFound();

  const labelTr = category.category_translations?.find((t: any) => t.locale === 'tr')?.label;
  const labelEn = category.category_translations?.find((t: any) => t.locale === 'en')?.label;

  return (
    <div>
      <Link href="/admin/kategoriler" className="text-sm text-aegean-600 hover:underline">← Kategoriler</Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold text-pine-900">{labelTr}</h1>
      <CategoryForm
        category={{ id: category.id, slug: category.slug, icon: category.icon, sort_order: category.sort_order, label_tr: labelTr, label_en: labelEn }}
        action={updateCategory}
        submitLabel="Kaydet"
      />
    </div>
  );
}
