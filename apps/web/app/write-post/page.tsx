import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { listBlogCategories, getMyPost } from '@/lib/blog/data';
import { WritePostForm } from './write-post-form';

export const metadata: Metadata = { title: 'Yazı yaz' };

type SearchParams = Promise<{ id?: string }>;

export default async function WritePostPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await searchParams;
  const categories = await listBlogCategories();
  const existing = id ? await getMyPost(id, session.user.id) : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">
        {existing ? 'Yazını redaktə et' : 'Yeni bloq yazısı'}
      </h1>
      <WritePostForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        post={
          existing
            ? {
                postId: existing.id,
                categoryId: existing.categoryId,
                title: existing.title,
                excerpt: existing.excerpt ?? '',
                content: existing.content,
                coverImage: existing.coverImage,
              }
            : undefined
        }
      />
    </main>
  );
}
