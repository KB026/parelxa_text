'use client';
import { Search } from 'lucide-react';

interface SearchBarProps {
  query: string;
  setQuery: (val: string) => void;
  loading: boolean;
}

export function SearchBar({ query, setQuery, loading }: SearchBarProps) {
  return (
    <div className="relative w-full h-14 md:h-16 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl flex items-center px-5 transition-all duration-300 focus-within:border-white/[0.2] focus-within:bg-white/[0.05] focus-within:shadow-[0_0_30px_rgba(255,255,255,0.03)] mb-8 overflow-hidden">
      <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
      <input
        type="text"
        placeholder="Search AI agents..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-base w-full"
      />
      {loading && <span className="absolute right-5 text-xs text-gray-500">...</span>}
    </div>
  );
}
