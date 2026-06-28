'use client';

import { useState, useEffect, useRef } from 'react';
import { searchAgents } from '@/lib/api';
import Image from 'next/image';
import { Agent } from '@/lib/types';
import { useCompare } from '@/context/CompareContext';

export function CompareSearch() {
  const { selectedIds, toggleCompare } = useCompare();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Agent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { agents } = await searchAgents({ q: query, limit: 5 });
        setResults(agents);
        setIsOpen(true);
      } catch (err) {
        console.error('Compare search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (agent: Agent) => {
    if (selectedIds.length < 3) {
      toggleCompare(agent.id);
      setQuery('');
      setIsOpen(false);
    } else {
      alert('You can only compare up to 3 tools.');
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto 48px' }}>
      <div style={{ position: 'relative' }}>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools to add..."
          style={{ 
            width: '100%', padding: '14px 20px 14px 48px', borderRadius: '14px', 
            background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
            color: 'var(--text-white)', fontSize: '14px', outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={() => query.length >=2 && setIsOpen(true)}
        />
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>ðŸ”</span>
        {loading && <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--cyan)' }}>...</span>}
      </div>

      {isOpen && results.length > 0 && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 100,
          overflow: 'hidden'
        }}>
          {results.map(agent => (
            <button 
              key={agent.id}
              onClick={() => handleSelect(agent)}
              disabled={selectedIds.includes(agent.id)}
              style={{ 
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                background: 'none', border: 'none', borderBottom: '1px solid var(--border-subtle)',
                textAlign: 'left', cursor: selectedIds.includes(agent.id) ? 'default' : 'pointer',
                opacity: selectedIds.includes(agent.id) ? 0.5 : 1
              }}
              onMouseEnter={(e) => !selectedIds.includes(agent.id) && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                {agent.logoUrl ? <Image src={agent.logoUrl} alt={`${agent.name} logo`} fill sizes="32px" style={{ objectFit: 'cover' }} /> : <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>🤖</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-white)' }}>{agent.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{agent.category}</div>
              </div>
              {selectedIds.includes(agent.id) ? (
                <span style={{ fontSize: '10px', color: 'var(--green)', fontWeight: 700 }}>ADDED</span>
              ) : (
                <span style={{ fontSize: '18px', color: 'var(--cyan)' }}>+</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
