import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Villamega | Fethiye, Kaş ve Kalkan Kiralık Villa', template: '%s | Villamega' },
  description: 'Fethiye, Kaş ve Kalkan\'da özel havuzlu, korunaklı kiralık lüks villalar.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
