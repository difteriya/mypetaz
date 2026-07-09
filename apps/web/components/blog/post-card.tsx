import Link from 'next/link';
import { imageVariant } from '@/lib/images';
import type { BlogListItem } from '@/lib/blog/data';
import { PawIcon } from '@/components/icons';

export function BlogPostCard({ post }: { post: BlogListItem }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="overflow-hidden rounded-card border border-cream-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/9] bg-cream-100">
        {post.coverImage ? (
          <img
            src={imageVariant(post.coverImage, 'card')}
            alt={post.coverAlt ?? post.title}
            width={400}
            height={225}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center"><PawIcon className="size-10 text-brand-200" /></div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <span className="text-xs font-medium text-brand-500">{post.category.name}</span>
        <p className="font-semibold leading-snug">{post.title}</p>
        {post.excerpt && <p className="line-clamp-2 text-sm text-brand-900/60">{post.excerpt}</p>}
        <p className="pt-1 text-xs text-brand-900/40">
          {post.user.businessProfile?.name ?? post.user.name ?? 'mypet.az'}
        </p>
      </div>
    </Link>
  );
}
