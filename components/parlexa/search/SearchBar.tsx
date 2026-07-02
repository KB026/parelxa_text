'use client';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; category: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.agents || []);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-50">
          {results.map((agent) => (
            <a
              key={agent.id}
              href={`/agent/${agent.id}`}
              className="block px-4 py-2 hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
            >
              <div className="font-semibold text-white">{agent.name}</div>
              <div className="text-xs text-gray-400">{agent.category}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
