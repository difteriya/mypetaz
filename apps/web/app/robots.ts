import type { MetadataRoute } from 'next';
import { APP_URL } from '@/components/json-ld';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/messages/', '/admin/', '/api/', '/p/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
