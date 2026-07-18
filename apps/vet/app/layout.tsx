import type { Metadata } from 'next';
import { Nunito_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Calm working type: the brand's body family, with a chart-style mono for
// times, dates, and record ids (the panel's clinical signature).
const body = Nunito_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
});
const mono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'vet.mypet.az — Baytar paneli',
    template: '%s | vet.mypet.az',
  },
  description: 'Baytar həkimləri üçün təyinat və müayinə paneli.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={`${body.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
