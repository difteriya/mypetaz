import type { Metadata } from 'next';
import { getBlockValue } from '@/lib/cms/data';

export const metadata: Metadata = { title: 'Haqqımızda' };
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const content = await getBlockValue('about_content', 'mypet.az');
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Haqqımızda</h1>
      <div className="whitespace-pre-line leading-relaxed text-brand-900/90">{content}</div>
    </main>
  );
}
