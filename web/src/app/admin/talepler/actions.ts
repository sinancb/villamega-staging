'use server';
import { supabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateReservation(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = supabaseServer();

  const { error } = await supabase
    .from('reservations')
    .update({
      status: String(formData.get('status')),
      payment_status: String(formData.get('payment_status')),
      notes: String(formData.get('notes') ?? '') || null
    })
    .eq('id', id);

  if (error) {
    // Exclusion constraint: confirming dates that now collide with another confirmed booking
    if (error.message.includes('reservations_villa_id_daterange_excl')) {
      return { ok: false, error: 'Bu tarihler başka bir onaylı rezervasyonla çakışıyor. Önce diğer kaydı kontrol edin.' };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath('/admin/talepler');
  revalidatePath(`/admin/talepler/${id}`);
  return { ok: true };
}
