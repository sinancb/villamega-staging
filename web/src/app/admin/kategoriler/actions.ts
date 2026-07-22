'use server';
import { supabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function fields(formData: FormData) {
  return {
    slug: String(formData.get('slug')).trim().toLowerCase(),
    icon: String(formData.get('icon')),
    sort_order: Number(formData.get('sort_order')) || 0
  };
}

async function saveTranslations(supabase: ReturnType<typeof supabaseServer>, categoryId: string, formData: FormData) {
  await supabase.from('category_translations').upsert([
    { category_id: categoryId, locale: 'tr', label: String(formData.get('label_tr')).trim() },
    { category_id: categoryId, locale: 'en', label: String(formData.get('label_en')).trim() }
  ]);
}

export async function createCategory(formData: FormData) {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('categories').insert(fields(formData)).select('id').single();
  if (error) return { ok: false as const, error: error.message };
  await saveTranslations(supabase, data.id, formData);
  revalidatePath('/admin/kategoriler');
  redirect('/admin/kategoriler');
}

export async function updateCategory(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = supabaseServer();
  const { error } = await supabase.from('categories').update(fields(formData)).eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  await saveTranslations(supabase, id, formData);
  revalidatePath('/admin/kategoriler');
  revalidatePath(`/admin/kategoriler/${id}`);
  return { ok: true as const };
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = supabaseServer();
  await supabase.from('categories').delete().eq('id', id);
  revalidatePath('/admin/kategoriler');
}
