import type { Metadata } from 'next';
import { getBlockValue } from '@/lib/cms/data';

export const metadata: Metadata = { title: 'İstifadə şərtləri' };
export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  const content = await getBlockValue('terms_content', '');
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold text-brand-700">İstifadə şərtləri</h1>
      <div className="whitespace-pre-line leading-relaxed text-brand-900/90">{content}</div>
    </main>
  );
}
