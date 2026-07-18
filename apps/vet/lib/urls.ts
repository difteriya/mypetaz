// Main consumer site — where pet profiles, login and vet application live.
export const WEB_APP_URL =
  process.env.NEXT_PUBLIC_WEB_APP_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://mypet.az');

/** A pet's public profile on mypet.az (read-only for treating vets). */
export const petProfileUrl = (petId: string) => `${WEB_APP_URL}/pet/${petId}`;
