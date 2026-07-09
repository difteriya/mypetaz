import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mypet/auth', '@mypet/db', '@mypet/ui'],
  images: {
    formats: ['image/webp'],
  },
};

export default nextConfig;
