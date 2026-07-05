'use client';
import { Search } from 'lucide-react';

interface SearchBarProps {
  query: string;
  setQuery: (val: string) => void;
  loading: boolean;
}

export function SearchBar({ query, setQuery, loading }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search AI agents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 ml-2 bg-transparent outline-none text-white placeholder-gray-500"
        />
        {loading && <span className="absolute right-3 text-xs text-gray-500">...</span>}
      </div>
    </div>
  );
}
