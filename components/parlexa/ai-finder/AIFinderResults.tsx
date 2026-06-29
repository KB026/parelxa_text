'use client';
import Link from 'next/link';
import { Star, RotateCcw, GitCompare } from 'lucide-react';

interface ResultAgent {
  id: number;
  name: string;
  summary: string;
  category: string;
  rating: number;
  slug: string;
  match_score?: number;
  match_reason?: string;
}

export function AIFinderResults({
  results,
  onReset,
}: {
  results: ResultAgent[];
  onReset: () => void;
}) {
  const compareUrl = `/compare?agents=${results.map(r => r.id).join(',')}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Your Best Matches</h2>
          <p className="text-gray-400">
            {results.length} tools matched to your business needs
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm border border-gray-700 rounded-lg px-3 py-2 hover:border-gray-500 transition"
        >
          <RotateCcw className="w-4 h-4" /> Start Over
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((agent, idx) => (
          <div
            key={agent.id}
            className="relative p-6 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-blue-500 transition-all"
          >
            {idx === 0 && (
              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Best Match
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-lg text-white">{agent.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{agent.category}</div>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded-lg text-sm font-bold text-blue-400">
                {agent.match_score}%
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{agent.summary}</p>

            {agent.match_reason && (
              <p className="text-xs text-blue-400/80 italic mb-4 border-l-2 border-blue-500/30 pl-2">
                {agent.match_reason}
              </p>
            )}

            <div className="flex items-center gap-1 mb-4">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-white">
                {agent.rating?.toFixed(1) || 'N/A'}
              </span>
            </div>

            <div className="space-y-2">
              <Link href={`/products/${agent.slug}`}>
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-sm transition">
                  View Tool
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {results.length > 1 && (
        <div className="border border-gray-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-white">Need a side-by-side comparison?</div>
            <div className="text-sm text-gray-400">
              Compare all {results.length} matched tools in detail
            </div>
          </div>
          <Link href={compareUrl}>
            <button className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-400 hover:bg-blue-500/10 rounded-lg font-semibold text-sm transition">
              <GitCompare className="w-4 h-4" /> Compare All
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
