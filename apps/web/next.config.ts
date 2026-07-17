import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Consume workspace packages as TS source (see PLAN.md §3 monorepo).
  transpilePackages: ['@mypet/auth', '@mypet/db', '@mypet/ui'],
  // sharp is a native module — keep it external to the server bundle (§3.1).
  serverExternalPackages: ['sharp'],
  // Image uploads (pet/blog/business/CMS) go through Server Actions, whose body
  // defaults to 1 MB. Raise it above the pipeline's 10 MB cap (§3.1) + multipart
  // overhead so real photos don't fail with "Body exceeded 1 MB limit".
  experimental: {
    serverActions: { bodySizeLimit: '12mb' },
  },
  images: {
    // Uploads are served from the VPS /uploads path (see PLAN.md §3.1).
    formats: ['image/webp'],
  },
};

export default nextConfig;
