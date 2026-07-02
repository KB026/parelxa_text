/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Agent } from '@/lib/types';

import { Sparkles, Search, Bot, ArrowRight, Wand2 } from 'lucide-react';

interface AISearchResult {
  explanation: string;
  exactMatchFound?: boolean;
  recommendations: Agent[];
  suggestedCategories: string[];
  isAIPowered?: boolean;
}

export function UniversalAISearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<AISearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAISearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setShowResults(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      console.error('AI Search failed:', err);
      setResult({
        explanation: 'I apologize, but I encountered a technical issue while processing your request. Please try a more specific query or explore our featured categories below.',
        recommendations: [],
        suggestedCategories: ['AI & LLMs', 'Customer Experience', 'Marketing & Sales']
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', maxWidth: '800px', margin: '0 auto 40px', zIndex: 100 }}>
      <form onSubmit={handleAISearch} style={{ position: 'relative' }}>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything... (e.g. 'can I automate my customer service?')"
          style={{ 
            width: '100%', padding: '24px 32px', paddingLeft: '70px', paddingRight: '160px',
            background: 'rgba(255, 255, 255, 0.03)', border: '2px solid rgba(14, 165, 233, 0.2)',
            borderRadius: '24px', color: 'white', fontSize: '18px', outline: 'none',
            backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            transition: 'all 0.3s'
          }}
          className="ai-search-input"
        />
        <span style={{ position: 'absolute', left: '28px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
          <Wand2 className="w-7 h-7 text-sky-400" />
        </span>
        <button 
          type="submit"
          disabled={isSearching}
          style={{ 
            position: 'absolute', right: '12px', top: '12px', bottom: '12px',
            background: 'var(--cyan)', color: 'black', border: 'none', 
            borderRadius: '16px', padding: '0 24px', fontWeight: 800, fontSize: '14px',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          {isSearching ? 'Thinking...' : 'AI Search'}
        </button>
      </form>

      {showResults && (isSearching || result) && (
        <div style={{ 
          marginTop: '24px',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: '24px', padding: '32px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          textAlign: 'left',
          width: '100%',
          animation: 'fadeIn 0.4s ease-out'
        }}>
          {isSearching ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <div className="ai-loader" style={{ marginBottom: '16px' }}>
                <Sparkles className="w-10 h-10 text-sky-400 mx-auto" />
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>Analyzing the best AI tools for your specific needs...</p>
            </div>
          ) : result && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: result.isAIPowered ? 'var(--cyan)' : 'var(--text-dim)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {result.isAIPowered ? <Sparkles className="w-4 h-4 text-sky-400" /> : <Search className="w-4 h-4 text-slate-400" />}
                  <span>{result.isAIPowered ? 'Parlexa AI Insight' : 'Directory Search Results'}</span>
                </div>
                <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'white', margin: 0 }}>{result.explanation}</p>
              </div>

              {result.exactMatchFound === false && result.recommendations.length > 0 && (
                <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-dim)', fontWeight: 600 }}>
                  No exact match found — here are similar tools that might help:
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.recommendations.map((agent, index) => {
                    const isExactMatch = result.exactMatchFound && (agent as any).matchType === 'exact';
                    const showRelatedHeader = result.exactMatchFound && index === 1;

                    return (
                      <div key={agent.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {showRelatedHeader && (
                          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Related Tools
                          </div>
                        )}
                        <div 
                          onClick={() => router.push(`/products/${agent.slug}`)}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                            background: isExactMatch ? 'rgba(14, 165, 233, 0.08)' : 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            border: `1px solid ${isExactMatch ? 'rgba(14, 165, 233, 0.4)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          className="ai-recommendation-item"
                        >
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isExactMatch ? 'rgba(14, 165, 233, 0.2)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot className={`w-5 h-5 ${isExactMatch ? 'text-sky-300' : 'text-sky-400'}`} />
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                              <div style={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>{agent.name}</div>
                              {isExactMatch && (
                                <span style={{ 
                                  fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', 
                                  background: 'rgba(14, 165, 233, 0.15)', color: 'var(--cyan)', border: '1px solid rgba(14, 165, 233, 0.3)' 
                                }}>
                                  Best Match
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{(agent as any).aiDescription || agent.oneLiner || agent.category}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cyan)', fontSize: '13px', fontWeight: 700 }}>
                            <span>Open Listing</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {result.recommendations.length > 1 && (
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <a href={`/compare?agents=${result.recommendations.map(a => a.id).join(',')}`}>
                    <button style={{ 
                      background: 'var(--cyan)', color: 'black', padding: '12px 32px', 
                      borderRadius: '16px', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer',
                      transition: 'all 0.2s', boxShadow: '0 8px 16px rgba(14, 165, 233, 0.2)'
                    }}>
                      Compare These Tools
                    </button>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .ai-search-input:focus { border-color: var(--cyan); box-shadow: 0 20px 60px rgba(14, 165, 233, 0.15); }
        .ai-recommendation-item:hover { border-color: var(--cyan); background: rgba(255,255,255,0.06); transform: translateX(5px); }
        .ai-loader { animation: spin 2s linear infinite; font-size: 32px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
