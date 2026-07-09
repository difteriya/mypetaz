import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'mypet.az — Azərbaycanda heyvanlar üçün portal',
    template: '%s | mypet.az',
  },
  description:
    'Ev heyvanları üçün elanlar, sahiblənmə, biznes hesabları və bloq — Azərbaycanda.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
