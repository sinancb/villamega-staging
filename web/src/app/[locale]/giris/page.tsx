import { redirect } from 'next/navigation';
import { t, type Locale } from '@/lib/i18n';
import { supabaseServer } from '@/lib/supabase/server';
import { CustomerAuthPanel } from '@/components/site/CustomerAuthPanel';

// Reads the auth cookie per-request — must never be statically cached,
// or every visitor would see whichever logged-in/out state the build ran with.
export const dynamic = 'force-dynamic';

export default async function GirisPage({ params }: { params: { locale: Locale } }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(`/${params.locale}/hesabim`);

  const d = t(params.locale);
  return <CustomerAuthPanel locale={params.locale} d={d} />;
}
