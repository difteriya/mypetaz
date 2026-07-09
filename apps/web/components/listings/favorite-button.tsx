'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleFavoriteAction } from '@/lib/favorites/actions';

export function FavoriteButton({
  listingId,
  initialFavorited,
}: {
  listingId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const res = await toggleFavoriteAction(listingId);
      if (res.needsLogin) {
        router.push('/login');
        return;
      }
      setFavorited(res.favorited);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorited}
      className="inline-flex items-center gap-1 rounded-full border border-cream-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-brand-300 disabled:opacity-50"
    >
      <span className={favorited ? 'text-badge-adoption' : 'text-brand-900/40'}>
        {favorited ? '♥' : '♡'}
      </span>
      {favorited ? 'Seçilmişlərdə' : 'Seçilmişlərə əlavə et'}
    </button>
  );
}
