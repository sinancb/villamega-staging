import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { t, type Locale } from '@/lib/i18n';
import { getCurrencyFromCookies } from '@/lib/currency-server';
import { supabaseServer } from '@/lib/supabase/server';

export default async function SiteLayout({ children, params }: {
  children: React.ReactNode; params: { locale: Locale };
}) {
  const d = t(params.locale);
  const currency = getCurrencyFromCookies(params.locale);
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="font-sans">
      <Header locale={params.locale} d={d} currency={currency} isLoggedIn={!!user} />
      <main>{children}</main>
      <Footer locale={params.locale} d={d} />
    </div>
  );
}
