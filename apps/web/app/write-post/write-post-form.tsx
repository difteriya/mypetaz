'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { createBlogPostAction, updateBlogPostAction } from '@/lib/blog/actions';
import { ImageDropZone } from '@/components/uploads/image-drop-zone';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';
const labelClass = 'text-sm font-medium';

interface PostDefaults {
  postId: string;
  categoryId: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
}

export function WritePostForm({
  categories,
  post,
}: {
  categories: { id: string; name: string }[];
  post?: PostDefaults;
}) {
  const editing = Boolean(post);
  const [state, formAction, pending] = useActionState(
    editing ? updateBlogPostAction : createBlogPostAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      {post && <input type="hidden" name="postId" value={post.postId} />}

      <div className="space-y-1">
        <label htmlFor="categoryId" className={labelClass}>
          Kateqoriya <span className="text-badge-lostfound">*</span>
        </label>
        <select id="categoryId" name="categoryId" required defaultValue={post?.categoryId ?? ''} className={inputClass}>
          <option value="" disabled>
            Seçin…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="title" className={labelClass}>
          Başlıq <span className="text-badge-lostfound">*</span>
        </label>
        <input id="title" name="title" required minLength={3} maxLength={140} defaultValue={post?.title} className={inputClass} />
      </div>

      <div className="space-y-1">
        <label htmlFor="excerpt" className={labelClass}>
          Qısa təsvir
        </label>
        <input id="excerpt" name="excerpt" maxLength={300} defaultValue={post?.excerpt} className={inputClass} />
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className={labelClass}>
          Məzmun <span className="text-badge-lostfound">*</span>
        </label>
        <textarea id="content" name="content" required rows={12} defaultValue={post?.content} className={inputClass} />
      </div>

      <div className="space-y-1">
        <label htmlFor="coverImage" className={labelClass}>
          Örtük şəkli
        </label>
        <ImageDropZone name="coverImage" currentUrl={post?.coverImage ?? null} currentAlt="Örtük şəkli" />
      </div>

      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}

      <p className="rounded-lg bg-cream-100 p-3 text-xs text-brand-900/60">
        Yazı admin təsdiqindən sonra dərc olunur. Təsdiqlənmiş yazını redaktə etsəniz, yenidən
        təsdiqə göndərilir.
      </p>

      <Button type="submit" disabled={pending}>
        {pending ? 'Göndərilir…' : editing ? 'Yenilə' : 'Yazını göndər'}
      </Button>
    </form>
  );
}
