'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Agent, Category } from '@/lib/types';

interface SearchBarProps {
  agents: Agent[];
  categories: Category[];
  totalCount: number;
}

export function SearchBar({ agents, categories, totalCount }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<(string | { type: 'agent'|'category', label: string })[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('parlexa_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Sync state with URL when filters are cleared or changed externally
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const filteredAgents = agents
      .filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(a => ({ type: 'agent', label: a.name } as const));

    const filteredCats = categories
      .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(c => ({ type: 'category', label: c.name } as const));

    setSuggestions([...filteredCats, ...filteredAgents]);
  }, [query, agents, categories]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const updatedRecent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('parlexa_recent_searches', JSON.stringify(updatedRecent));

    const params = new URLSearchParams(searchParams.toString());
    params.set('q', searchTerm);
    router.push(`/products?${params.toString()}`);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', marginBottom: '40px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder="Search by name, description, or tags..."
          style={{ 
            width: '100%', padding: '20px 24px', paddingLeft: '60px', borderRadius: '20px', 
            background: 'var(--bg-card)', border: '2px solid var(--border-subtle)',
            fontSize: '18px', color: 'var(--text-white)', outline: 'none',
            transition: 'border-color 0.2s'
          }}
        />
        <span style={{ position: 'absolute', left: '24px', fontSize: '24px', opacity: 0.5 }}>🔍</span>
      </div>

      <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-dim)' }}>
        Found <strong>{totalCount}</strong> AI agents matching your criteria
      </div>

      {showSuggestions && (query.length >= 2 || recentSearches.length > 0) && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, 
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
          borderRadius: '16px', marginTop: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          {query.length < 2 && recentSearches.length > 0 && (
            <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.03)' }}>
              RECENT SEARCHES
            </div>
          )}
          {query.length < 2 && recentSearches.map((s, i) => (
            <div 
              key={i} 
              onClick={() => { setQuery(s); handleSearch(s); }}
              style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
              className="suggestion-item"
            >
              <span style={{ opacity: 0.3 }}>🕒</span> {s}
            </div>
          ))}

          {suggestions.map((s, i) => (
            <div 
              key={i} 
              onClick={() => {
                const label = typeof s === 'string' ? s : s.label;
                setQuery(label);
                handleSearch(label);
              }}
              style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: i === suggestions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
              className="suggestion-item"
            >
              {typeof s !== 'string' && (
                <span style={{ 
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px', 
                  background: s.type === 'category' ? 'var(--cyan)' : 'var(--bg-secondary)',
                  color: s.type === 'category' ? 'black' : 'var(--text-muted)'
                }}>
                  {s.type.toUpperCase()}
                </span>
              )}
              {typeof s === 'string' ? s : s.label}
            </div>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .suggestion-item:hover { background: rgba(255,255,255,0.05); }
      `}} />
    </div>
  );
}
