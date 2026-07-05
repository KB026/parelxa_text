'use client';

import { useState, useEffect } from 'react';
import { Agent } from '@/lib/types';
import { useCompare } from '@/context/CompareContext';
import { getAgentsByIds } from '@/lib/api';
import { CompareSearch } from './CompareSearch';
import { saveComparison } from '@/app/actions/compare';
import Image from 'next/image';
import { Search, Link as LinkIcon, Check, Save, Star } from 'lucide-react';

interface ComparePageClientProps {
  initialAgents: Agent[];
}

export function ComparePageClient({ initialAgents }: ComparePageClientProps) {
  const { selectedIds, toggleCompare, setCompare } = useCompare();
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [urlChecked, setUrlChecked] = useState(false);

  // Parse URL on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlIds = params.get('agents') || params.get('ids');
    if (urlIds) {
      const parsedIds = urlIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      if (parsedIds.length > 0) {
        setCompare(parsedIds);
      }
    }
    setUrlChecked(true);
  }, [setCompare]); // Run once on mount

  // Sync agents when selectedIds change (only after URL check is done to avoid double fetching)
  useEffect(() => {
    if (!urlChecked) return;
    
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const data = await getAgentsByIds(selectedIds);
        setAgents(data);
      } catch (err) {
        console.error('Comparison error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if local state doesn't match selectedIds
    const currentIds = agents.map(a => a.id).sort().join(',');
    const syncIds = selectedIds.sort().join(',');
    if (currentIds !== syncIds) {
      fetchLatest();
    }
  }, [selectedIds, agents, urlChecked]);

  // Update URL for sharing
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedIds.length > 0) {
      url.searchParams.set('ids', selectedIds.join(','));
    } else {
      url.searchParams.delete('ids');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedIds]);

  const rows = [
    { label: 'Category', key: 'category' },
    { label: 'Pricing Model', key: 'pricingModel' },
    { label: 'Price Range', key: 'pricing' },
    { label: 'Global Availability', key: 'globalAvailability', type: 'boolean' },
    { label: 'Free Trial', key: 'freeTrial' },
    { label: 'Rating', key: 'rating', type: 'rating' },
    { label: 'Reviews', key: 'reviews_count' },
    { label: 'Verified', key: 'isVerified', type: 'boolean' },
    { label: 'Team Size', key: 'teamSize' },
    { label: 'Founded', key: 'foundedYear' },
    { label: 'Key Features', key: 'features', type: 'list' },
    { label: 'Use Cases', key: 'useCases', type: 'markdown' },
  ];

  const getBadges = (agent: Agent) => {
    const badges = [];
    if (agents.length < 2) return [];
    
    const maxRating = Math.max(...agents.map(a => a.rating));
    if (agent.rating === maxRating && agent.rating > 0) badges.push({ text: 'Top Rated', color: '#fb923c' });
    
    const maxReviews = Math.max(...agents.map(a => a.reviews_count || 0));
    if ((agent.reviews_count || 0) === maxReviews && maxReviews > 0) badges.push({ text: 'Most Popular', color: 'var(--cyan)' });
    
    if (agent.globalAvailability) badges.push({ text: 'Global Ready', color: '#f59e0b' });
    
    return badges;
  };

  const isDifferent = (rowKey: string) => {
    if (agents.length < 2) return false;
    const values = agents.map(a => (a as unknown as Record<string, unknown>)[rowKey]);
    return !values.every(v => JSON.stringify(v) === JSON.stringify(values[0]));
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Comparison link copied to clipboard!');
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    const res = await saveComparison(selectedIds);
    if (res.success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('idle');
      if (res.error === 'You must be logged in to save comparisons') {
        window.dispatchEvent(new CustomEvent('open-auth', { detail: { view: 'signin' } }));
      } else {
        alert(res.error || 'Failed to save');
      }
    }
  };

  if (agents.length === 0 && !loading && urlChecked) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <Search size={48} className="text-slate-400" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Start your comparison</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>Select tools from the marketplace or search for them here.</p>
        <button 
          onClick={() => window.location.href = '/products'}
          className="btn-get-started"
          style={{ padding: '14px 32px' }}
        >
          Browse AI Agents
        </button>
      </div>
    );
  }

  return (
    <div className="compare-content">
      <CompareSearch />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
        <button onClick={handleCopyUrl} style={{ 
          padding: '10px 16px', borderRadius: '10px', background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-subtle)', color: 'var(--text-white)', fontSize: '14px',
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
        }}>
          <span><LinkIcon size={16} /></span> Share Comparison
        </button>
        <button 
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          style={{ 
            padding: '10px 16px', borderRadius: '10px', background: saveStatus === 'success' ? 'var(--green)' : 'var(--bg-secondary)', 
            border: '1px solid var(--border-subtle)', color: saveStatus === 'success' ? 'black' : 'var(--text-white)', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <span>{saveStatus === 'saving' ? '...' : saveStatus === 'success' ? <Check size={16} /> : <Save size={16} />}</span> 
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved' : 'Save to Dashboard'}
        </button>
      </div>

      <div style={{ 
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
        borderRadius: '32px', overflow: 'hidden', position: 'relative' 
      }}>
        {loading && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Updating...</div>}
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ width: '220px', padding: '32px 24px', textAlign: 'left', background: 'rgba(255,255,255,0.02)', position: 'sticky', left: 0, zIndex: 2 }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attribute</div>
                </th>
                {agents.map((agent, i) => (
                    <th key={i} style={{ padding: '32px 24px', textAlign: 'center', width: `${100 / agents.length}%` }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                            {agent.logoUrl ? <Image src={agent.logoUrl} alt={`${agent.name} logo`} fill sizes="80px" style={{ objectFit: 'cover' }} /> : <div style={{ fontSize: '32px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>}
                          </div>
                          <button 
                            onClick={() => toggleCompare(agent.id)}
                            style={{ 
                              position: 'absolute', top: '-8px', right: '-8px', 
                              width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', 
                              color: 'white', border: 'none', cursor: 'pointer' 
                            }}
                          >✕</button>
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-white)', marginBottom: '4px' }}>{agent.name}</div>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {getBadges(agent).map(b => (
                              <span key={b.text} style={{ 
                                fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', 
                                background: `${b.color}22`, color: b.color, border: `1px solid ${b.color}44` 
                              }}>{b.text}</span>
                            ))}
                          </div>
                        </div>
                        <a 
                          href={agent.website ? (agent.website.startsWith('http') ? agent.website : `https://${agent.website}`) : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-get-started"
                          style={{ padding: '8px 20px', fontSize: '13px', display: 'inline-block', textDecoration: 'none' }}
                        >
                          Visit Website
                        </a>
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const diff = isDifferent(row.key);
                return (
                  <tr key={row.key} style={{ 
                    borderBottom: '1px solid var(--border-subtle)',
                    background: diff ? 'rgba(251, 146, 60, 0.03)' : 'transparent'
                  }}>
                    <td style={{ padding: '20px 24px', fontWeight: 600, color: 'var(--text-dim)', fontSize: '14px', background: 'rgba(255,255,255,0.01)', position: 'sticky', left: 0, zIndex: 1 }}>
                      {row.label}
                      {diff && <span style={{ marginLeft: '8px', color: '#fb923c', fontSize: '10px' }}>•</span>}
                    </td>
                    {agents.map((agent, i) => {
                      const val = (agent as unknown as Record<string, unknown>)[row.key];
                      return (
                        <td key={i} style={{ padding: '20px 24px', textAlign: 'center', color: 'var(--text-white)', fontSize: '14px' }}>
                          {row.type === 'boolean' ? (
                            <span style={{ color: val ? '#10b981' : '#ef4444' }}>{val ? '✓ Yes' : '✕ No'}</span>
                          ) : row.type === 'rating' ? (
                            <div style={{ fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Star size={14} fill="currentColor" /> {Number(val || 0).toFixed(1)}</div>
                          ) : row.type === 'list' ? (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                              {((val as string[]) || []).slice(0, 4).map((f: string) => (
                                <span key={f} style={{ fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '6px' }}>{f}</span>
                              ))}
                            </div>
                          ) : (val as string) || 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
