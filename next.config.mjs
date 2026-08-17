import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      // 2a. Singular product to plural products
      {
        source: '/product/:slug',
        destination: '/products/:slug',
        permanent: true,
      },
      {
        source: '/product',
        destination: '/products',
        permanent: true,
      },
      // 2c fallback. Saved tools dashboard redirect
      {
        source: '/dashboard/consumer/saved',
        destination: '/dashboard/consumer/saved-tools',
        permanent: true,
      },
      // 2d. Submission and claim listing redirects
      {
        source: '/submit',
        destination: '/dashboard/vendor/listings/new',
        permanent: true,
      },
      {
        source: '/claim-listing',
        destination: '/products?intent=claim',
        permanent: true,
      },
      // 2e. Terms, pricing, and FAQ redirects
      {
        source: '/terms-of-service',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/pricing',
        destination: '/#pricing',
        permanent: false,
      },
      {
        source: '/faq',
        destination: '/#faq',
        permanent: false,
      },
    ];
  },
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    };
    return config;
  },
};

// Validate critical env vars at build time
if (process.env.NODE_ENV === 'production' || process.env.CI) {
  const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const missing = requiredEnv.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Production build warning: Missing required environment variables: ${missing.join(', ')}`);
    if (process.env.CI) {
      throw new Error(`❌ CI build failed: Missing environment variables: ${missing.join(', ')}`);
    }
  }
}

export default withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "parlexa",
    project: "parlexa",
  },
  {
    widenClientBounds: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
);
