'use client';

import { useSearchParams } from 'next/navigation';

export function SortSelector() {
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'relevance';

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    window.history.replaceState(null, '', `/products?${params.toString()}`);
    window.dispatchEvent(new Event('filters-changed'));
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 hidden sm:block">Sort by:</span>
      <select 
        value={currentSort}
        onChange={(e) => handleSort(e.target.value)}
        className="bg-white/[0.05] border border-white/[0.1] text-gray-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-white/[0.2] cursor-pointer hover:bg-white/[0.08] transition-colors outline-none"
      >
        <option value="relevance" className="bg-[#0A0A0C]">Most Relevant</option>
        <option value="rating" className="bg-[#0A0A0C]">Highest Rated</option>
        <option value="newest" className="bg-[#0A0A0C]">Newest</option>
        <option value="reviews" className="bg-[#0A0A0C]">Most Reviewed</option>
      </select>
    </div>
  );
}
