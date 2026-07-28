import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

import { CompareProvider } from "@/context/CompareContext";
import dynamic from "next/dynamic";
const CompareBar = dynamic(() => import("@/components/parlexa/CompareBar").then(mod => mod.CompareBar), { ssr: false });

export const metadata: Metadata = {
  metadataBase: new URL('https://parlexa.in'),
  title: {
    default: "Parlexa — The Global AI Agent Marketplace",
    template: "%s | Parlexa — The Global AI Agent Marketplace"
  },
  description: "The premier B2B marketplace for AI agents and tools. Discover, compare, and scale powerful AI solutions built for enterprise workflows.",
  keywords: ["AI Agents", "B2B AI Tools", "SaaS Marketplace", "AI Automation", "Parlexa", "India AI Marketplace"],
  authors: [{ name: "Parlexa Team", url: "https://parlexa.in" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://parlexa.in",
    siteName: "Parlexa",
    title: "Parlexa — The Global AI Agent Marketplace",
    description: "The premier B2B marketplace for AI agents and tools. Discover, compare, and scale powerful AI solutions built for enterprise workflows.",
    images: [{
      url: "https://parlexa.in/og-image.png",
      width: 1200,
      height: 630,
      alt: "Parlexa — The Global AI Agent Marketplace"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Parlexa — The Global AI Agent Marketplace",
    description: "The premier B2B marketplace for AI agents and tools. Discover, compare, and scale powerful AI solutions built for enterprise workflows.",
    images: ["https://parlexa.in/og-image.png"],
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <CompareProvider>
          {children}
          <CompareBar />
        </CompareProvider>

        {/* PostHog Tracking snippet */}
        <Script id="posthog-analytics" strategy="afterInteractive">
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_m2KTV4kXqRCRttgmigJExrBv9AW3cATdJb8qJqAmPCef', {api_host: 'https://us.i.posthog.com', person_profiles: 'identified_only'});
          `}
        </Script>

        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="microsoft-clarity" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
            `
          }} />
        )}
      </body>
    </html>
  );
}
