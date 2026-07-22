import { supabaseServer } from '@/lib/supabase/server';
import { categoryIcon } from '@/components/site/categoryIcons';
import { deleteCategory } from './actions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import Link from 'next/link';

export default async function CategoriesPage() {
  const supabase = supabaseServer();
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, slug, icon, sort_order, category_translations(locale, label), villa_categories(villa_id)')
    .order('sort_order', { ascending: true });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-pine-900">Kategoriler</h1>
        <Link href="/admin/kategoriler/yeni" className="btn-primary">Yeni kategori</Link>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          Kayıtlar yüklenemedi: {error.message}. Migration 008_villa_categories.sql çalıştırıldı mı?
        </p>
      )}

      {!error && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">Sıra</th>
                <th className="th">Kategori</th>
                <th className="th">Slug</th>
                <th className="th">Villa Sayısı</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(categories ?? []).map((c: any) => {
                const labelTr = c.category_translations?.find((t: any) => t.locale === 'tr')?.label ?? c.slug;
                const Icon = categoryIcon(c.icon);
                return (
                  <tr key={c.id} className="hover:bg-aegean-100/40">
                    <td className="td text-slate-500">{c.sort_order}</td>
                    <td className="td">
                      <Link href={`/admin/kategoriler/${c.id}`} className="flex items-center gap-3 font-medium text-pine-900 hover:underline">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aegean-100">
                          <Icon className="h-4 w-4 text-pine-900" />
                        </span>
                        {labelTr}
                      </Link>
                    </td>
                    <td className="td text-xs text-slate-500">{c.slug}</td>
                    <td className="td">{c.villa_categories?.length ?? 0}</td>
                    <td className="td">
                      <DeleteButton id={c.id} action={deleteCategory}
                        confirmLabel={`"${labelTr}" kategorisini silmek istediğinize emin misiniz?`} />
                    </td>
                  </tr>
                );
              })}
              {(categories ?? []).length === 0 && (
                <tr><td className="td py-10 text-center text-slate-500" colSpan={5}>
                  Henüz kategori yok. <Link className="text-aegean-600 hover:underline" href="/admin/kategoriler/yeni">İlk kategoriyi ekleyin.</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
