'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export function AIFinder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    // Only debounce if query is long enough, or empty (clearing)
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }
      
      // We push only if it changed to avoid unnecessary history entries
      const newQueryString = params.toString();
      const currentQueryString = searchParams.toString();
      if (newQueryString !== currentQueryString) {
        router.push(`/ai-finder?${newQueryString}`);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams]);

  return (
    <div style={{ position: 'relative', marginBottom: '60px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for AI tools (e.g. video editor, writing, marketing)..."
        style={{
          width: '100%',
          padding: '24px 32px',
          paddingLeft: '64px',
          background: 'var(--bg-card)',
          border: '2px solid var(--border-subtle)',
          borderRadius: '24px',
          fontSize: '18px',
          color: 'var(--text-white)',
          outline: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          transition: 'all 0.3s'
        }}
        className="ai-finder-input"
      />
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 opacity-50" />
      <style dangerouslySetInnerHTML={{ __html: `
        .ai-finder-input:focus { border-color: var(--cyan); box-shadow: 0 10px 40px rgba(14, 165, 233, 0.15); }
      `}} />
    </div>
  );
}
