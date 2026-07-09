import type { Metadata } from 'next';
import Link from 'next/link';
import { listPublishedPosts, listBlogCategories } from '@/lib/blog/data';
import { BlogPostCard } from '@/components/blog/post-card';

export const metadata: Metadata = {
  title: 'Bloq',
  description: 'Ev heyvanlarının qulluğu, qidalanması, sağlamlığı və tərbiyəsi haqqında yazılar.',
};

// Content changes on moderation — render fresh (ISR comes in the SEO step §19).
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([listPublishedPosts(), listBlogCategories()]);

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Bloq</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/blog/${c.slug}`}
            className="rounded-full border border-cream-200 bg-white px-3 py-1 text-sm text-brand-700 hover:border-brand-300"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="text-brand-900/50">Hələ yazı yoxdur.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <BlogPostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </main>
  );
}
