'use server';
import { supabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function resolveConflict(formData: FormData) {
  const supabase = supabaseServer();
  await supabase
    .from('conflicts')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', String(formData.get('id')));
  revalidatePath('/admin/cakismalar');
}
