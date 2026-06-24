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

interface SearchSystemProps {
  initialAgents: Agent[];
  initialCount: number;
  categories: Category[];
  allIndustries: string[];
}

export function SearchSystem({ 
  initialAgents, 
  initialCount, 
  categories, 
  allIndustries 
}: SearchSystemProps) {
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [totalCount, setTotalCount] = useState<number>(initialCount);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let ignore = false;

    const fetchResults = async () => {
      setLoading(true);
      const params: SearchParams = {
        q: searchParams.get('q') || undefined,
        categories: searchParams.get('cats')?.split(',') || undefined,
        pricingModels: searchParams.get('pricing')?.split(',') || undefined,
        industries: searchParams.get('industries')?.split(',') || undefined,
        minRating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
        isVerified: searchParams.get('verified') === 'true',
        globalAvailability: searchParams.get('global') === 'true',
        hasFreeTrial: searchParams.get('trial') === 'true',
        sort: (searchParams.get('sort') as SearchParams['sort']) || 'relevance',
        limit: 20
      };

      const result = await searchAgents(params);
      
      if (!ignore) {
        setAgents(result.agents);
        setTotalCount(result.count);
        setLoading(false);
      }
    };

    fetchResults();

    return () => {
      ignore = true;
    };
  }, [searchParams]);

  return (
    <div className="search-system">
      <SearchBar agents={agents} categories={categories} totalCount={totalCount} />
      
      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        <FilterPanel categories={categories} industries={allIndustries} />
        
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Results</h2>
            <SortSelector />
          </div>

          <ActiveFilters />

          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
              <div className="spinner" style={{ marginBottom: '16px' }}>⌛</div>
              Updating results...
            </div>
          ) : agents.length > 0 ? (
            <div className="agents-grid">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '100px 40px', textAlign: 'center', background: 'var(--bg-card)', 
              borderRadius: '24px', border: '1px solid var(--border-subtle)' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
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
