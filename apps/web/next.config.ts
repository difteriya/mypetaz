import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Consume workspace packages as TS source (see PLAN.md §3 monorepo).
  transpilePackages: ['@mypet/auth', '@mypet/db', '@mypet/ui'],
  // sharp is a native module — keep it external to the server bundle (§3.1).
  serverExternalPackages: ['sharp'],
  images: {
    // Uploads are served from the VPS /uploads path (see PLAN.md §3.1).
    formats: ['image/webp'],
  },
};

export default nextConfig;
