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
    title = `Best ${category} AI Tools & Agents | Compare & Deploy | Parlexa`;
    description = `Analyze top-rated ${category} AI tools and autonomous agents. Compare enterprise features, integration capabilities, pricing, and real reviews on Parlexa.`;
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
    <div className="agents-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 40px 80px' }}>
      <header className="mb-6">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-3">
          {category ? `Best ${category} AI Tools & Agents` : 'Explore Enterprise AI Agents'}
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
