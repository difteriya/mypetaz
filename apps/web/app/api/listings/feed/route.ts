import { getLatestFeedPage, getFeaturedFeedPage } from '@/lib/listings/data';
import { PAGE_SIZE } from '@/lib/listings/feed-page-size';

/** Infinite-scroll page of the homepage feed. `?featured=1` → featured listings. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const offset = Math.max(0, Number(url.searchParams.get('offset') ?? 0) || 0);
  const featured = url.searchParams.get('featured') === '1';
  const rows = featured
    ? await getFeaturedFeedPage(offset, PAGE_SIZE + 1)
    : await getLatestFeedPage(offset, PAGE_SIZE + 1);
  const hasMore = rows.length > PAGE_SIZE;
  return Response.json({ items: rows.slice(0, PAGE_SIZE), hasMore });
}
