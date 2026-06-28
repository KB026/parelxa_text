'use client';
import { useState } from 'react';

export default function AIFinderPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; summary: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const res = await fetch(`/api/ai-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setResults(data.agents || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-6">AI Finder</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Describe what you need..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded font-semibold text-white"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {results.map((agent) => (
          <div key={agent.id} className="bg-gray-800 p-4 rounded border border-gray-700">
            <h3 className="font-bold text-white">{agent.name}</h3>
            <p className="text-sm text-gray-400">{agent.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
