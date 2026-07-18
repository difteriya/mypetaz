// Client-safe: category chip for a notification. Prefer the stored `source`
// (who sent it); fall back to a coarse category derived from the type.
export function notificationCategory(type: string): { label: string; tone: 'vet' | 'message' | 'admin' | 'system' } {
  if (type.startsWith('APPOINTMENT')) return { label: 'Vet', tone: 'vet' };
  if (type === 'NEW_MESSAGE') return { label: 'Mesaj', tone: 'message' };
  if (type === 'OWNERSHIP_TRANSFER') return { label: 'Sistem', tone: 'system' };
  if (type.startsWith('VET_')) return { label: 'Admin', tone: 'admin' };
  return { label: 'Admin', tone: 'admin' };
}

export const CATEGORY_TONE: Record<string, string> = {
  vet: 'bg-teal-50 text-teal-700',
  message: 'bg-brand-50 text-brand-700',
  admin: 'bg-cream-200 text-ink/60',
  system: 'bg-cream-200 text-ink/60',
};
