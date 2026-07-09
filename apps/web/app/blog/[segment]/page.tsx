import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getBlogCategoryBySlug,
  getPostBySlug,
  listPublishedPosts,
} from '@/lib/blog/data';
import { imageVariant } from '@/lib/images';
import { BlogPostCard } from '@/components/blog/post-card';

// A single [segment] resolves to a category landing OR a post detail — avoids
// the /blog/[category] vs /blog/[slug] route collision (PLAN.md §8.1/§8.7).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment } = await params;
  const category = await getBlogCategoryBySlug(segment);
  if (category) return { title: `${category.name} — Bloq` };
  const post = await getPostBySlug(segment);
  if (post) {
    return {
      title: post.metaTitle ?? post.title,
      description: (post.metaDescription ?? post.excerpt ?? post.title).slice(0, 160),
      openGraph: {
        title: post.title,
        images: post.coverImage ? [{ url: imageVariant(post.coverImage, 'detail') }] : undefined,
      },
    };
  }
  return { title: 'Tapılmadı' };
}

export default async function BlogSegmentPage({ params }: { params: Promise<{ segment: string }> }) {
  const { segment } = await params;

  // 1) category landing
  const category = await getBlogCategoryBySlug(segment);
  if (category) {
    const posts = await listPublishedPosts(category.id);
    return (
      <main className="mx-auto max-w-[1280px] px-4 py-8">
        <nav className="mb-3 text-sm text-brand-900/50">
          <Link href="/blog" className="hover:underline">
            Bloq
          </Link>{' '}
          › <span>{category.name}</span>
        </nav>
        <h1 className="mb-6 text-2xl font-bold text-brand-700">{category.name}</h1>
        {posts.length === 0 ? (
          <p className="text-brand-900/50">Bu kateqoriyada hələ yazı yoxdur.</p>
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

  // 2) post detail
  const post = await getPostBySlug(segment);
  if (!post) notFound();

  const author = post.user.businessProfile;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-3 text-sm text-brand-900/50">
        <Link href="/blog" className="hover:underline">
          Bloq
        </Link>{' '}
        ›{' '}
        <Link href={`/blog/${post.category.slug}`} className="hover:underline">
          {post.category.name}
        </Link>
      </nav>

      <h1 className="text-3xl font-bold text-brand-700">{post.title}</h1>
      <p className="mt-2 text-sm text-brand-900/50">
        {author ? (
          <Link href={`/business/${author.slug}`} className="hover:underline">
            {author.name}
          </Link>
        ) : (
          (post.user.name ?? 'mypet.az')
        )}
        {post.publishedAt && ` · ${post.publishedAt.toISOString().slice(0, 10)}`}
      </p>

      {post.coverImage && (
        <img
          src={imageVariant(post.coverImage, 'detail')}
          alt={post.coverAlt ?? post.title}
          className="mt-4 aspect-[16/9] w-full rounded-card object-cover"
        />
      )}

      <article className="mt-6 whitespace-pre-line leading-relaxed text-brand-900/90">
        {post.content}
      </article>
    </main>
  );
}
