/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';
import { getAgentBySlug, getReviewStats, getReviews, getUserReview, getSimilarAgents } from '@/lib/api';

import { trackInteraction } from '@/lib/analytics';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/parlexa/details/HeroSection';
import { AboutSection } from '@/components/parlexa/details/AboutSection';
import { CompanySection } from '@/components/parlexa/details/CompanySection';
import { UseCasesSection } from '@/components/parlexa/details/UseCasesSection';
import { StickyLeadBox } from '@/components/parlexa/details/StickyLeadBox';
import { getBundleForAgent } from '@/lib/bundles-service';
import { Metadata } from 'next';
import Link from 'next/link';
import { Star, Bookmark, ArrowLeftRight, Share2 } from 'lucide-react';
import { getExternalReviews } from '@/lib/api/externalReviews';
import { checkWishlistStatus } from '@/app/actions/wishlist';
import { ScrollReveal } from '@/components/parlexa/ui/ScrollReveal';
import { VisitWebsiteButton } from '@/components/parlexa/details/VisitWebsiteButton';
import { ProductSchema } from '@/components/seo/ProductSchema';
import { MobileStickyBar } from '@/components/parlexa/details/MobileStickyBar';

const ReviewSystem = dynamic(() => import('@/components/parlexa/reviews/ReviewSystem').then(mod => mod.ReviewSystem));
const SimilarTools = dynamic(() => import('@/components/parlexa/details/SimilarTools').then(mod => mod.SimilarTools));
const BundleCrossSell = dynamic(() => import('@/components/parlexa/details/BundleCrossSell').then(mod => mod.BundleCrossSell));
const ExternalReviews = dynamic(() => import('@/components/parlexa/details/ExternalReviews').then(mod => mod.ExternalReviews));
const ViewTracker = dynamic(() => import('@/components/parlexa/details/ViewTracker').then(mod => mod.ViewTracker), { ssr: false });

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
  
  const [stats, initialReviews, userReview, similarTools, externalReviews, bundleCrossSell] = await Promise.all([
    getReviewStats(Number(agent.id)),
    getReviews(Number(agent.id), 'helpful', 1, 5),
    user ? getUserReview(Number(agent.id), user.id) : null,
    getSimilarAgents(agent.category, Number(agent.id), 4),
    getExternalReviews(Number(agent.id), agent.name),
    getBundleForAgent(Number(agent.id))
  ]);

  const isVendor = user?.id === agent.userId;
  const isSaved = user ? await checkWishlistStatus(Number(agent.id)) : false;

  const hasVerifiedReviews = Boolean(externalReviews && externalReviews.length > 0);

  return (
    <div className="pb-28 md:pb-12 px-5 md:px-8" style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '100px' }}>
      <ProductSchema agent={agent} stats={stats} />
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

              {/* BUNDLE CROSS-SELL SECTION */}
              {bundleCrossSell && (
                <ScrollReveal>
                  <BundleCrossSell crossSell={bundleCrossSell} />
                </ScrollReveal>
              )}

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
              />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <MobileStickyBar 
        agent={agent}
        stats={stats}
        initialSaved={isSaved}
      />
    </div>
  );
}
