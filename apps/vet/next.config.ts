import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mypet/auth', '@mypet/db', '@mypet/ui'],
  images: {
    formats: ['image/webp'],
  },
  // Lint runs via `pnpm lint`, not during the production build (see apps/web).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
