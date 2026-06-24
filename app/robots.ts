import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/login',
          '/auth/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://parlexa.in/sitemap.xml',
  };
}
