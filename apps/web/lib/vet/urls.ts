// Vet panel URL — localhost port in dev, subdomain in prod (PLAN.md §7.4).
export const VET_APP_URL =
  process.env.NEXT_PUBLIC_VET_APP_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://vet.mypet.az');
