import { getCategories, searchAgents, getUniqueIndustries } from '@/lib/api';
import { SearchSystem } from '@/components/parlexa/search/SearchSystem';
import { SearchParams } from '@/lib/types';
import { Metadata } from 'next';

export const revalidate = 30;

// Helper to normalize search params
const normalize = (val: string | string[] | undefined) => 
  Array.isArray(val) ? val[0] : val;

export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const category = normalize(searchParams.category);
  const query = normalize(searchParams.q);
  
  let title = "Explore AI Agents | Parlexa — The Global AI Agent Marketplace";
  let description = "The global premier marketplace for AI agents and tools. Discover, compare, and integrate powerful AI solutions built to scale enterprises worldwide.";

  if (category) {
    title = `${category} AI Tools for Enterprises Worldwide | Parlexa`;
    description = `Analyze top-rated ${category} AI agents. Compare features, pricing, and global solutions for your business.`;
  } else if (query) {
    title = `Search results for "${query}" | AI Agents | Parlexa`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: category ? `/directory?category=${encodeURIComponent(category)}` : '/directory',
    }
  };
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = normalize(searchParams.category);
  
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
    limit: 24
  };

  const [categories, industries, initialResults] = await Promise.all([
    getCategories(),
    getUniqueIndustries(),
    searchAgents(initialParams)
  ]);

  return (
    <div className="agents-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 40px 80px' }}>
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
          {category ? `${category} AI Tools Worldwide` : 'Explore AI Agents'}
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mb-10">
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
    </div>
  );
}
