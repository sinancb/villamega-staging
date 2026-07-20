'use server';
import { supabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function villaFields(formData: FormData) {
  return {
    slug: String(formData.get('slug')).trim().toLowerCase(),
    region: String(formData.get('region')),
    capacity: Number(formData.get('capacity')),
    bedrooms: Number(formData.get('bedrooms')),
    bathrooms: Number(formData.get('bathrooms')),
    default_min_stay: Number(formData.get('default_min_stay')),
    cleaning_fee: Number(formData.get('cleaning_fee')),
    deposit_amount: Number(formData.get('deposit_amount')),
    prepayment_pct: Number(formData.get('prepayment_pct')),
    status: String(formData.get('status'))
  };
}

export async function createVilla(formData: FormData) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('villas').insert(villaFields(formData)).select('id').single();
  if (error) return { ok: false as const, error: error.message };
  redirect(`/admin/villalar/${data.id}`);
}

export async function updateVilla(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = supabaseServer();
  const { error } = await supabase.from('villas').update(villaFields(formData)).eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/villalar/${id}`);
  revalidatePath('/admin/villalar');
  return { ok: true as const };
}

export async function upsertTranslation(formData: FormData) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('villa_translations').upsert({
    villa_id: String(formData.get('villa_id')),
    locale: String(formData.get('locale')),
    title: String(formData.get('title')),
    description: String(formData.get('description') ?? ''),
    seo_title: String(formData.get('seo_title') ?? '') || null,
    seo_desc: String(formData.get('seo_desc') ?? '') || null
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/villalar/${formData.get('villa_id')}`);
  return { ok: true as const };
}

export async function saveSeason(formData: FormData) {
  const supabase = supabaseServer();
  const id = String(formData.get('id') ?? '');
  const row = {
    villa_id: String(formData.get('villa_id')),
    label: String(formData.get('label') ?? '') || null,
    start_date: String(formData.get('start_date')),
    end_date: String(formData.get('end_date')),
    nightly_price: Number(formData.get('nightly_price')),
    min_stay: formData.get('min_stay') ? Number(formData.get('min_stay')) : null
  };
  const { error } = id
    ? await supabase.from('price_seasons').update(row).eq('id', id)
    : await supabase.from('price_seasons').insert(row);
  if (error) {
    if (error.message.includes('price_seasons_villa_id_daterange_excl')) {
      return { ok: false as const, error: 'Bu tarih aralığı mevcut bir sezonla çakışıyor.' };
    }
    return { ok: false as const, error: error.message };
  }
  revalidatePath(`/admin/villalar/${row.villa_id}`);
  return { ok: true as const };
}

export async function deleteSeason(formData: FormData) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('price_seasons')
    .delete().eq('id', String(formData.get('id')));
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/villalar/${formData.get('villa_id')}`);
  return { ok: true as const };
}

export async function savePhotoOrder(villaId: string, orderedIds: string[]) {
  const supabase = supabaseServer();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from('villa_photos')
      .update({ sort_order: i }).eq('id', orderedIds[i]);
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath(`/admin/villalar/${villaId}`);
  return { ok: true as const };
}

export async function registerPhoto(villaId: string, storagePath: string, sortOrder: number) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('villa_photos')
    .insert({ villa_id: villaId, storage_path: storagePath, sort_order: sortOrder });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/villalar/${villaId}`);
  return { ok: true as const };
}

export async function deletePhoto(formData: FormData) {
  const supabase = supabaseServer();
  const id = String(formData.get('id'));
  const path = String(formData.get('storage_path'));
  await supabase.storage.from('villas').remove([path]);
  const { error } = await supabase.from('villa_photos').delete().eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/villalar/${formData.get('villa_id')}`);
  return { ok: true as const };
}

export async function saveFeed(formData: FormData) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('ical_feeds').insert({
    villa_id: String(formData.get('villa_id')),
    platform: String(formData.get('platform')),
    url: String(formData.get('url')).trim()
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/villalar/${formData.get('villa_id')}`);
  return { ok: true as const };
}

export async function deleteFeed(formData: FormData) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('ical_feeds')
    .delete().eq('id', String(formData.get('id')));
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/villalar/${formData.get('villa_id')}`);
  return { ok: true as const };
}
