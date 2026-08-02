/**
 * Homepage feed page size — shared by the API route and the server component
 * that renders the first page. It lives here, not in the route file: Next's
 * production build only allows known route exports (GET/POST/revalidate/…),
 * so exporting a constant from route.ts fails `next build`.
 */
export const PAGE_SIZE = 12;
