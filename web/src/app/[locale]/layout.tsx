import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/karla/400.css';
import '@fontsource/karla/600.css';
import '@fontsource/karla/700.css';
import { LOCALES, type Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params }: {
  children: React.ReactNode; params: { locale: string };
}) {
  if (!LOCALES.includes(params.locale as Locale)) notFound();
  return <>{children}</>;
}
