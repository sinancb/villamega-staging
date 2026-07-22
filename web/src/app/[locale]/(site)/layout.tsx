import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { t, type Locale } from '@/lib/i18n';

export default function SiteLayout({ children, params }: {
  children: React.ReactNode; params: { locale: Locale };
}) {
  const d = t(params.locale);
  return (
    <div className="font-sans">
      <Header locale={params.locale} d={d} />
      <main>{children}</main>
      <Footer locale={params.locale} d={d} />
    </div>
  );
}
