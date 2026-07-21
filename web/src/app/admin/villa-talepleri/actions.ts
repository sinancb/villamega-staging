'use server';
import { supabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleHandled(formData: FormData) {
  const id = String(formData.get('id'));
  const handled = formData.get('handled') === 'true';
  const supabase = supabaseServer();
  await supabase.from('villa_requests').update({ handled }).eq('id', id);
  revalidatePath('/admin/villa-talepleri');
}
