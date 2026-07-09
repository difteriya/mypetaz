'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Button } from '@mypet/ui';
import { submitReviewAction } from '@/lib/reviews/actions';
import { StarRating, StarIcon } from '@/components/icons';

export interface ReviewView {
  id: string;
  rating: number;
  content: string | null;
  userName: string | null;
  createdAt: string;
}

const Stars = StarRating;

export function ReviewSection({
  targetType,
  targetId,
  avg,
  count,
  reviews,
  canReview,
  isOwner,
  myRating,
  myContent,
}: {
  targetType: 'LISTING' | 'BUSINESS';
  targetId: string;
  avg: number | null;
  count: number;
  reviews: ReviewView[];
  canReview: boolean;
  isOwner: boolean;
  myRating?: number;
  myContent?: string;
}) {
  const [state, formAction, pending] = useActionState(submitReviewAction, undefined);
  const [rating, setRating] = useState(myRating ?? 0);

  return (
    <section className="rounded-card bg-white p-5">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-brand-700">Rəylər</h2>
        {count > 0 ? (
          <span className="text-sm">
            <Stars value={avg ?? 0} /> {avg?.toFixed(1)} ({count})
          </span>
        ) : (
          <span className="text-sm text-brand-900/50">Hələ rəy yoxdur</span>
        )}
      </div>

      {reviews.length > 0 && (
        <ul className="mt-4 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-cream-100 pb-3 last:border-0 text-sm">
              <div className="flex items-center gap-2">
                <Stars value={r.rating} />
                <span className="font-medium">{r.userName ?? 'İstifadəçi'}</span>
                <span className="text-xs text-brand-900/40">{r.createdAt.slice(0, 10)}</span>
              </div>
              {r.content && <p className="mt-1 text-brand-900/70">{r.content}</p>}
            </li>
          ))}
        </ul>
      )}

      {!canReview ? (
        <p className="mt-4 text-sm text-brand-900/50">
          Rəy yazmaq üçün{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            daxil olun
          </Link>
          .
        </p>
      ) : isOwner ? null : (
        <form action={formAction} className="mt-4 space-y-2 border-t border-cream-200 pt-4">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <input type="hidden" name="rating" value={rating} />
          <p className="text-sm font-medium">Rəy yaz</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} ulduz`}>
                <StarIcon className={`size-7 ${n <= rating ? 'text-amber-400' : 'text-cream-300'}`} />
              </button>
            ))}
          </div>
          <textarea
            name="content"
            rows={3}
            defaultValue={myContent}
            maxLength={1000}
            placeholder="Təcrübənizi paylaşın…"
            className="w-full rounded-lg border border-cream-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
          {state?.ok && <p className="text-sm text-badge-sale">{state.ok}</p>}
          <Button type="submit" disabled={pending || rating === 0}>
            {pending ? 'Göndərilir…' : myRating ? 'Rəyi yenilə' : 'Göndər'}
          </Button>
        </form>
      )}
    </section>
  );
}
