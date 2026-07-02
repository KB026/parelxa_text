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
