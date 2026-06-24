'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function SortSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'relevance';

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Sort by:</span>
      <select 
        value={currentSort}
        onChange={(e) => handleSort(e.target.value)}
        style={{ 
          background: 'transparent', border: '1px solid var(--border-subtle)', 
          borderRadius: '8px', padding: '8px 12px', color: 'var(--text-white)',
          outline: 'none', cursor: 'pointer', fontSize: '14px'
        }}
      >
        <option value="relevance">Most Relevant</option>
        <option value="rating">Top Rated</option>
        <option value="newest">Newest Listings</option>
        <option value="reviews">Most Reviewed</option>
      </select>
    </div>
  );
}
