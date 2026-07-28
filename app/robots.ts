import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/dashboard/',
          '/login',
          '/auth',
          '/auth/',
          '/api',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://parlexa.in/sitemap.xml',
  };
}
