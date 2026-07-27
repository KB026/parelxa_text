/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';
import { getAgentBySlug, getReviewStats, getReviews, getUserReview, getSimilarAgents } from '@/lib/api';

import { trackInteraction } from '@/lib/analytics';
import { ReviewSystem } from '@/components/parlexa/reviews/ReviewSystem';
import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/parlexa/details/HeroSection';

import { AboutSection } from '@/components/parlexa/details/AboutSection';

import { CompanySection } from '@/components/parlexa/details/CompanySection';
import { UseCasesSection } from '@/components/parlexa/details/UseCasesSection';
import { StickyLeadBox } from '@/components/parlexa/details/StickyLeadBox';
import { SimilarTools } from '@/components/parlexa/details/SimilarTools';
import { Metadata } from 'next';
import Link from 'next/link';
import { Star, Bookmark, ArrowLeftRight, Share2 } from 'lucide-react';

import { ViewTracker } from '@/components/parlexa/details/ViewTracker';
import { getExternalReviews } from '@/lib/api/externalReviews';
import { ExternalReviews } from '@/components/parlexa/details/ExternalReviews';
import { checkWishlistStatus } from '@/app/actions/wishlist';
import { ScrollReveal } from '@/components/parlexa/ui/ScrollReveal';
import { VisitWebsiteButton } from '@/components/parlexa/details/VisitWebsiteButton';

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
  const { data: { user } } = await supabase.auth.getUser();
  
  const [stats, initialReviews, userReview, similarTools, externalReviews] = await Promise.all([
    getReviewStats(Number(agent.id)),
    getReviews(Number(agent.id), 'helpful', 1, 5),
    user ? getUserReview(Number(agent.id), user.id) : null,
    getSimilarAgents(agent.category, Number(agent.id), 4),
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

  const isVendor = user?.id === agent.userId;
  const isSaved = user ? await checkWishlistStatus(Number(agent.id)) : false;

  const hasVerifiedReviews = Boolean(externalReviews && externalReviews.length > 0);

  return (
    <div className="pb-28 md:pb-12 px-5 md:px-8" style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '100px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <ViewTracker agentId={Number(agent.id)} userId={user?.id} />

      {/* Back Link */}
      <Link href="/products" style={{ 
        marginBottom: '40px', display: 'inline-flex', alignItems: 'center', 
        gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' 
      }}>
        ← Back to Marketplace
      </Link>
      


      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', maxWidth: '1280px', margin: '0 auto' }}>
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="md:col-span-8">
            
            {/* Mobile Order 1: Hero Only */}
            <div className="flex flex-col gap-12 md:mb-12">
              <HeroSection 
                agent={agent} 
                hasVerifiedReviews={hasVerifiedReviews}
              />
              <ScrollReveal>
                <AboutSection 
                  description={agent.description || agent.summary} 
                  integrations={agent.integrationType}
                />
              </ScrollReveal>

              <ScrollReveal>
                <CompanySection 
                  companyName={agent.companyName}
                  foundingYear={agent.foundedYear}
                  city={agent.city}
                  teamSize={agent.teamSize}
                  companyLinkedin={agent.companyLinkedin}
                  companyBlurb={agent.companyBlurb}
                />
              </ScrollReveal>

              <ScrollReveal>
                <AboutSection 
                  features={agent.features} 
                />
              </ScrollReveal>

              <ScrollReveal>
                <UseCasesSection useCases={agent.useCases} />
              </ScrollReveal>

              <ScrollReveal>
                <ReviewSystem 
                  agentId={Number(agent.id)}
                  stats={stats}
                  userReview={userReview}
                  initialReviews={initialReviews}
                  isLoggedIn={!!user}
                  isVendor={isVendor}
                />
              </ScrollReveal>

              <ScrollReveal>
                <ExternalReviews 
                  reviews={externalReviews} 
                  agentName={agent.name} 
                />
              </ScrollReveal>

              <ScrollReveal>
                <SimilarTools tools={similarTools} />
              </ScrollReveal>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Sidebar (Mobile Order 2) */}
          <div className="md:col-span-4 relative">
            <div className="md:sticky md:top-24 h-fit">
              <StickyLeadBox 
                agent={agent}
                initialSaved={isSaved}
                onVisitWebsite={async () => {
                  'use server';
                  const supabase = createClient();
                  const { data: { user: currentUser } } = await supabase.auth.getUser();
                  await trackInteraction(Number(agent.id), 'cta_click', currentUser?.id);
                }} 
              />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div className="flex lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090B] border-t border-white/10 p-4 flex-row items-center justify-between gap-4">
        
        {/* Left Column (Info & Actions) */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          
          {/* Top Row (Secondary Actions & Rating) */}
          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-1 text-white font-bold text-sm">
              <Star size={18} className="text-amber-500 fill-current" />
              <span>{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</span>
            </div>
            
            <button className="hover:text-white transition-colors" title="Save">
              <Bookmark size={18} />
            </button>
            <button className="hover:text-white transition-colors" title="Compare">
              <ArrowLeftRight size={18} />
            </button>
            <button className="hover:text-white transition-colors" title="Share">
              <Share2 size={18} />
            </button>
          </div>
          
          {/* Bottom Row (Pricing) */}
          <div className="text-xs text-gray-500 truncate">
            {agent.pricing}
          </div>
        </div>

        {/* Right Column (Primary CTA) */}
        <VisitWebsiteButton 
          agent={agent}
          className="w-auto px-6 h-11 bg-[#2563eb] text-white font-semibold rounded-lg shrink-0 flex items-center justify-center no-underline hover:bg-[#1d4ed8] transition-colors"
        />
      </div>
    </div>
  );
}
