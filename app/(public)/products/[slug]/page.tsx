import { notFound } from 'next/navigation';
import { getAgentBySlug, getReviewStats, getReviews, getUserReview, getSimilarAgents } from '@/lib/api';
import { trackInteraction } from '@/lib/analytics';
import { ReviewSystem } from '@/components/parlexa/reviews/ReviewSystem';
import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/parlexa/details/HeroSection';
import { MediaSection } from '@/components/parlexa/details/MediaSection';
import { AboutSection } from '@/components/parlexa/details/AboutSection';
import { PricingSection } from '@/components/parlexa/details/PricingSection';
import { CompanySection } from '@/components/parlexa/details/CompanySection';
import { StickySidebar } from '@/components/parlexa/details/StickySidebar';
import { SimilarTools } from '@/components/parlexa/details/SimilarTools';
import { Metadata } from 'next';
import Link from 'next/link';
import { Star } from 'lucide-react';

import { ViewTracker } from '@/components/parlexa/details/ViewTracker';
import { getExternalReviews } from '@/lib/api/externalReviews';
import { ExternalReviews } from '@/components/parlexa/details/ExternalReviews';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const agent = await getAgentBySlug(params.slug);
  if (!agent) return { title: 'Not Found' };

  return {
    title: `${agent.name} — ${agent.oneLiner || agent.category} | Reviews & Pricing | Parlexa`,
    description: `Read reviews, compare pricing, and explore key features of ${agent.name}. A top-rated ${agent.category} AI solution built to scale enterprises worldwide.`,
    openGraph: {
      images: agent.logoUrl ? [agent.logoUrl] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary',
      images: agent.logoUrl ? [agent.logoUrl] : [],
    },
    alternates: {
      canonical: `/products/${params.slug}`,
    }
  };
}

export default async function ProductDetailsPage({ params }: { params: { slug: string } }) {
  const agent = await getAgentBySlug(params.slug);
  
  if (!agent) {
    notFound();
  }

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const [stats, initialReviews, userReview, similarTools, externalReviews] = await Promise.all([
    getReviewStats(Number(agent.id)),
    getReviews(Number(agent.id), 'helpful', 1, 5),
    session ? getUserReview(Number(agent.id), session.user.id) : null,
    getSimilarAgents(agent.category, Number(agent.id), 6),
    getExternalReviews(Number(agent.id), agent.name)
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": agent.name,
    "description": agent.description || agent.summary,
    "applicationCategory": agent.category,
    "operatingSystem": "Web, Cloud",
    "offers": {
      "@type": "Offer",
      "price": agent.pricing.toLowerCase().includes('free') ? "0" : "1",
      "priceCurrency": "USD",
    },
    "aggregateRating": stats && stats.totalReviews > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": stats.averageRating,
      "reviewCount": stats.totalReviews
    } : undefined
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Marketplace", "item": "https://parlexa.in/products" },
      { "@type": "ListItem", "position": 2, "name": agent.category, "item": `https://parlexa.in/products?cats=${encodeURIComponent(agent.category)}` },
      { "@type": "ListItem", "position": 3, "name": agent.name, "item": `https://parlexa.in/products/${params.slug}` }
    ]
  };

  const isVendor = session?.user.id === agent.userId;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 40px 80px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <ViewTracker agentId={Number(agent.id)} userId={session?.user?.id} />

      {/* Back Link */}
      <Link href="/products" style={{ 
        marginBottom: '40px', display: 'inline-flex', alignItems: 'center', 
        gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' 
      }}>
        ← Back to Marketplace
      </Link>
      


      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '80px' }} className="details-layout-grid">
        {/* Main Content Column */}
        <div style={{ minWidth: 0 }}>
          <HeroSection 
            agent={agent} 
            stats={stats} 
            onVisitWebsite={async () => {
              'use server';
              await trackInteraction(Number(agent.id), 'cta_click', session?.user?.id);
            }} 
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
            <MediaSection 
              screenshots={agent.screenshots} 
              videoUrl={agent.videoUrl} 
            />

            <AboutSection 
              description={agent.description || agent.summary} 
              features={agent.features} 
              useCases={agent.useCases} 
            />

            <PricingSection 
              pricing={agent.pricing}
              pricingModel={agent.pricingModel}
              priceRange={agent.priceRange}
              freeTrial={agent.freeTrial}
              globalAvailability={agent.globalAvailability}
              usdPrice={agent.usdPrice}
            />

            <CompanySection 
              companyName={agent.companyName}
              foundingYear={agent.foundedYear}
              city={agent.city}
              teamSize={agent.teamSize}
              companyLinkedin={agent.companyLinkedin}
              companyBlurb={agent.companyBlurb}
            />

            <ReviewSystem 
              agentId={Number(agent.id)}
              stats={stats}
              userReview={userReview}
              initialReviews={initialReviews}
              isLoggedIn={!!session}
              isVendor={isVendor}
            />

            <ExternalReviews 
              reviews={externalReviews} 
              agentName={agent.name} 
            />
          </div>
        </div>

        {/* Sidebar Column (Desktop Only) */}
        <aside className="details-sidebar">
          <StickySidebar 
            agent={agent} 
            stats={stats} 
            onVisitWebsite={async () => {
              'use server';
              await trackInteraction(Number(agent.id), 'cta_click', session?.user?.id);
            }} 
          />
        </aside>
      </div>

      <SimilarTools tools={similarTools} />

      {/* Mobile Sticky CTA Bar */}
      <div className="mobile-cta-bar" style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-card)', 
        borderTop: '1px solid var(--border-subtle)', padding: '16px 24px', 
        display: 'none', zIndex: 100, gap: '12px'
      }}>
        <div style={{ flexGrow: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star className="w-5 h-5 text-amber-500 fill-current" />
            <span>{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{agent.pricing}</div>
        </div>
        <a href={agent.website ? (agent.website.startsWith('http') ? agent.website : `https://${agent.website}`) : '#'} target="_blank" rel="noopener noreferrer" className="btn-get-started" style={{ padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>Visit Website</a>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          .details-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .details-sidebar {
            display: none !important;
          }
          .mobile-cta-bar {
            display: flex !important;
          }
        }
      `}} />
    </div>
  );
}
