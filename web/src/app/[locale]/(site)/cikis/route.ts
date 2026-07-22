import { supabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { Locale } from '@/lib/i18n';

export async function POST(request: Request, { params }: { params: { locale: Locale } }) {
  const supabase = supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(`/${params.locale}`, request.url), { status: 303 });
}
