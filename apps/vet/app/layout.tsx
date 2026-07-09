import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'vet.mypet.az — Baytar platforması',
    template: '%s | vet.mypet.az',
  },
  description: 'Baytar həkimləri üçün görüş və müayinə platforması.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
