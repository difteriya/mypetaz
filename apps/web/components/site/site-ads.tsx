import { imageVariant } from '@/lib/images';

// CMS image values are either an uploaded stem (/uploads/…) or an external URL.
function adSrc(value: string): string {
  return value.startsWith('/uploads/') ? imageVariant(value, 'full') : value;
}

function Wrap({ href, children }: { href: string; children: React.ReactNode; }) {
  return href ? (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ) : (
    <>{children}</>
  );
}

/** Full-width leaderboard above the header (PLAN.md §5.1). */
export function AdHeader({ global }: { global: Record<string, string> }) {
  const img = global.ad_header;
  if (!img) return null;
  return (
    <div className="w-full bg-cream-200">
      <div className="mx-auto max-w-[1280px]">
        <Wrap href={global.ad_header_link ?? ''}>
          <img src={adSrc(img)} alt="Reklam" className="mx-auto max-h-[120px] w-auto" />
        </Wrap>
      </div>
    </div>
  );
}

/**
 * Single background ad pinned behind the boxed content; only the left/right
 * strips outside the 1280px column are visible. Auto-hides below xl where
 * there's no room (PLAN.md §5.1).
 */
export function AdBackground({ global }: { global: Record<string, string> }) {
  const img = global.ad_background;
  if (!img) return null;
  return (
    <div className="fixed inset-0 -z-10 hidden xl:block" aria-hidden>
      <Wrap href={global.ad_background_link ?? ''}>
        <img src={adSrc(img)} alt="" className="size-full object-cover" />
      </Wrap>
    </div>
  );
}
