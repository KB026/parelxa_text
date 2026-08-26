import { getCategories, searchAgents, getUniqueIndustries } from '@/lib/api';
import { SearchSystem } from '@/components/parlexa/search/SearchSystem';
import { SearchParams } from '@/lib/types';
import { Metadata } from 'next';
import { CategoryIntroBlock } from '@/components/seo/CategoryIntroBlock';

export const revalidate = 30;

// Helper to normalize search params
const normalize = (val: string | string[] | undefined) => 
  Array.isArray(val) ? val[0] : val;

export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const category = normalize(searchParams.cats);
  const query = normalize(searchParams.q);
  
  let title = "Explore AI Agents & Enterprise AI Tools | Parlexa Marketplace";
  let description = "Discover, compare, and deploy 200+ verified enterprise AI tools and AI agents worldwide. Search by category, pricing, and capabilities on Parlexa.";

  if (category) {
    const hasAi = /\bAI\b/i.test(category);
    title = hasAi 
      ? `Best ${category} Tools & Agents | Compare & Deploy | Parlexa`
      : `Best ${category} AI Tools & Agents | Compare & Deploy | Parlexa`;
    description = hasAi
      ? `Analyze top-rated ${category} tools and autonomous agents. Compare enterprise features, integration capabilities, pricing, and real reviews on Parlexa.`
      : `Analyze top-rated ${category} AI tools and autonomous agents. Compare enterprise features, integration capabilities, pricing, and real reviews on Parlexa.`;
  } else if (query) {
    title = `Search results for "${query}" | Enterprise AI Tools | Parlexa`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: category ? `/products?cats=${encodeURIComponent(category)}` : '/products',
    }
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = normalize(searchParams.cats);
  const intent = normalize(searchParams.intent);
  const isClaimIntent = intent === 'claim';
  
  const initialParams: SearchParams = {
    q: normalize(searchParams.q),
    categories: category?.split(','),
    pricingModels: normalize(searchParams.pricing)?.split(','),
    industries: normalize(searchParams.industries)?.split(','),
    minRating: searchParams.rating ? Number(normalize(searchParams.rating)) : undefined,
    isVerified: normalize(searchParams.verified) === 'true',
    globalAvailability: normalize(searchParams.global) === 'true',
    hasFreeTrial: normalize(searchParams.trial) === 'true',
    sort: (normalize(searchParams.sort) as SearchParams['sort']) || 'relevance',
    limit: 20
  };

  const [categories, industries, initialResults] = await Promise.all([
    getCategories(),
    getUniqueIndustries(),
    searchAgents(initialParams)
  ]);

  return (
    <div className="agents-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20">
      {isClaimIntent && (
        <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#F59E0B]/15 via-[#8B5CF6]/10 to-transparent border border-[#F59E0B]/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(245,158,11,0.12)] animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center shrink-0 text-[#F59E0B] shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Claim Your AI Tool Listing
                  </h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#F59E0B]/20 text-[#FCD34D] border border-[#F59E0B]/40 rounded-full tracking-wide uppercase">
                    Maker Verification
                  </span>
                </div>
                <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                  Search for your product name below. Click on your tool card to open its detail page, then select <strong className="text-[#FCD34D] font-semibold">&ldquo;Claim This Tool&rdquo;</strong> to verify maker ownership, edit features, and access your live vendor dashboard.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 self-stretch md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              <a
                href="/dashboard/vendor/listings/new"
                className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all text-center"
              >
                Not listed? Submit new &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-3">
          {category 
            ? (/\bAI\b/i.test(category) ? `Best ${category} Tools & Agents` : `Best ${category} AI Tools & Agents`) 
            : 'Explore Enterprise AI Agents'}
        </h1>
        <p className="text-base md:text-lg text-gray-400 max-w-2xl">
          {category 
            ? `Top-rated ${category} solutions specifically curated for global enterprises.` 
            : 'The ultimate directory of AI agents built to scale businesses globally.'}
        </p>
      </header>

      <SearchSystem 
        initialAgents={initialResults.agents}
        categories={categories}
        allIndustries={industries}
      />

      <div className="mt-16 pt-12 border-t border-white/[0.08]">
        <CategoryIntroBlock category={category} />
      </div>
    </div>
  );
}
