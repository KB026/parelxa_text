'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Agent, Category, SearchParams } from '@/lib/types';
import { searchAgents } from '@/lib/api';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { SortSelector } from './SortSelector';
import { ActiveFilters } from './ActiveFilters';
import { AgentCard } from '../AgentCard';
import { Loader2, Search } from 'lucide-react';

interface SearchSystemProps {
  initialAgents: Agent[];
  categories: Category[];
  allIndustries: string[];
}

export function SearchSystem({ 
  initialAgents, 
  categories, 
  allIndustries 
}: SearchSystemProps) {
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  
  const isFirstRender = useRef(true);

  // Client-side sort based on URL sort param
  const currentSort = searchParams.get('sort') || 'relevance';
  const displayedAgents = [...agents].sort((a, b) => {
    if (currentSort === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (currentSort === 'newest') {
      const bDate = (b as Agent & { created_at?: string, createdAt?: string }).createdAt || (b as Agent & { created_at?: string, createdAt?: string }).created_at || 0;
      const aDate = (a as Agent & { created_at?: string, createdAt?: string }).createdAt || (a as Agent & { created_at?: string, createdAt?: string }).created_at || 0;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }
    if (currentSort === 'reviews') return (b.reviews_count || 0) - (a.reviews_count || 0);
    return 0; // relevance or default
  });

  const handleSearchChange = (val: string) => {
    setQuery(val);
    const params = new URLSearchParams(window.location.search);
    if (val) params.set('q', val);
    else params.delete('q');
    window.history.replaceState(null, '', `/products?${params.toString()}`);
    window.dispatchEvent(new Event('filters-changed'));
  };

  useEffect(() => {
    let ignore = false;
    let timer: NodeJS.Timeout | undefined;

    const fetchResults = async () => {
      setLoading(true);
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      const cats = params.get('cats') || '';
      const pricing = params.get('pricing');
      const industries = params.get('industries');
      
      // If we have search text or category, use the AI/keyword endpoint
      if (q || cats) {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&categories=${encodeURIComponent(cats)}`);
          const data = await res.json();
          if (!ignore) {
            setAgents(data.agents || []);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        // Fallback to regular searchAgents for complex filters when no text/category search
        const apiParams: SearchParams = {
          q: undefined,
          categories: undefined,
          pricingModels: pricing?.split(',') || undefined,
          industries: industries?.split(',') || undefined,
          minRating: params.get('rating') ? Number(params.get('rating')) : undefined,
          isVerified: params.get('verified') === 'true',
          globalAvailability: params.get('global') === 'true',
          hasFreeTrial: params.get('trial') === 'true',
          sort: 'relevance',
          limit: 20
        };
        const result = await searchAgents(apiParams);
        if (!ignore) {
          setAgents(result.agents);
        }
      }
      if (!ignore) setLoading(false);
    };

    const onFiltersChanged = () => {
      // Sync query state if it was cleared by "Clear all"
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get('q') || '');
      
      clearTimeout(timer);
      timer = setTimeout(() => {
        fetchResults();
      }, 300);
    };

    window.addEventListener('filters-changed', onFiltersChanged);
    window.addEventListener('popstate', onFiltersChanged);

    // Initial fetch if searchParams changed natively (not via our replaceState)
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      // Only fire if we didn't just fire from our own event
      // This is a safety catch for native Next.js navigations
      clearTimeout(timer);
      timer = setTimeout(fetchResults, 300);
    }

    return () => {
      ignore = true;
      clearTimeout(timer);
      window.removeEventListener('filters-changed', onFiltersChanged);
      window.removeEventListener('popstate', onFiltersChanged);
    };
  }, [searchParams]);

  return (
    <div className="search-system">
      <SearchBar query={query} setQuery={handleSearchChange} loading={loading} />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full pb-4 border-b border-white/[0.08] mb-8 gap-4">
        <div className="flex items-baseline gap-4">
          <h2 className="text-xl font-medium text-white">Filters</h2>
          <button 
            onClick={() => {
              window.history.replaceState(null, '', '/products');
              window.dispatchEvent(new Event('filters-changed'));
            }}
            className="text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        </div>
        
        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-sm font-medium text-white">Results</span>
          <SortSelector />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        <FilterPanel categories={categories} industries={allIndustries} />
        
        <div style={{ flexGrow: 1, minWidth: 0 }}>

          <ActiveFilters />

          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
              <div className="spinner" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              </div>
              Updating results...
            </div>
          ) : displayedAgents.length > 0 ? (
            <div className="agents-grid">
              {displayedAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '100px 40px', textAlign: 'center', background: 'var(--bg-card)', 
              borderRadius: '24px', border: '1px solid var(--border-subtle)' 
            }}>
              <Search className="w-16 h-16 text-slate-500 mx-auto mb-5" />
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>No agents found</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                We couldn&apos;t find any tools matching your criteria. Try adjusting your filters or clearing your search.
              </p>
              <button 
                onClick={() => window.location.href = '/products'}
                className="btn-get-started"
                style={{ marginTop: '24px', padding: '12px 24px' }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
