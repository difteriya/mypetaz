// Business hours helpers (PLAN.md §2.7 — open/closed live status). Client-safe.

export const DAYS = [
  { key: 'mon', label: 'Bazar ertəsi' },
  { key: 'tue', label: 'Çərşənbə axşamı' },
  { key: 'wed', label: 'Çərşənbə' },
  { key: 'thu', label: 'Cümə axşamı' },
  { key: 'fri', label: 'Cümə' },
  { key: 'sat', label: 'Şənbə' },
  { key: 'sun', label: 'Bazar' },
] as const;

export type DayKey = (typeof DAYS)[number]['key'];
export type DayHours = { open: string; close: string };
export type BusinessHours = Partial<Record<DayKey, DayHours | null>>;

// JS getDay(): 0=Sun..6=Sat
const DAY_INDEX: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function parseBusinessHours(value: unknown): BusinessHours {
  if (value && typeof value === 'object') return value as BusinessHours;
  return {};
}

/** Is the business open right now? Returns today's hours too. */
export function isOpenNow(hours: BusinessHours, now: Date = new Date()): {
  open: boolean;
  today: DayHours | null;
} {
  const key = DAY_INDEX[now.getDay()]!;
  const today = hours[key] ?? null;
  if (!today?.open || !today?.close) return { open: false, today: null };
  const cur = now.getHours() * 60 + now.getMinutes();
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  return { open: cur >= toMin(today.open) && cur < toMin(today.close), today };
}
