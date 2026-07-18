'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ListingCard } from './listing-card';
import type { ListingCard as ListingCardData } from '@/lib/listings/data';

const gridClass = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4';

/**
 * "Bütün elanlar" feed — listings that load as the user scrolls
 * (tap.az / turbo.az style infinite scroll).
 */
export function ListingFeed({
  initialItems,
  initialHasMore,
  featured = false,
}: {
  initialItems: ListingCardData[];
  initialHasMore: boolean;
  featured?: boolean;
}) {
  const [latest, setLatest] = useState<ListingCardData[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const r = await fetch(`/api/listings/feed?offset=${latest.length}${featured ? '&featured=1' : ''}`);
      if (r.ok) {
        const d: { items: ListingCardData[]; hasMore: boolean } = await r.json();
        setLatest((prev) => [...prev, ...d.items]);
        setHasMore(d.hasMore);
      }
    } catch {
      /* ignore; observer will retry on next intersection */
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [latest.length, hasMore, featured]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '700px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <div className={gridClass}>
        {latest.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="pt-4">
          {loading && (
            <div className={gridClass}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-card bg-cream-100" />
              ))}
            </div>
          )}
          {/* Auto-loads on scroll (IntersectionObserver); button is the fallback */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="rounded-full border border-cream-200 bg-white px-6 py-2.5 text-sm font-semibold text-brand-700 hover:border-brand-300 disabled:opacity-50"
            >
              {loading ? 'Yüklənir…' : 'Daha çox elan'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
