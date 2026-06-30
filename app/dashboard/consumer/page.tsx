'use client';
import { useEffect, useState } from 'react';
import { Heart, BarChart3, MessageSquare, GitCompare } from 'lucide-react';
import Link from 'next/link';

interface SavedAgent {
  id: number;
  name: string;
  summary: string;
  rating: number;
  slug: string;
  logo_url: string;
  category: string;
}

interface SavedTool {
  id: string;
  agent_id: number;
  created_at: string;
  agents: SavedAgent;
}

export default function ConsumerDashboard() {
  const [savedTools, setSavedTools] = useState<SavedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedTools();
  }, []);

  const fetchSavedTools = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/saved-tools');
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to view your dashboard.');
          return;
        }
        throw new Error('Failed to fetch');
      }

      const data = await res.json();
      setSavedTools(data.savedTools || []);
      console.log('✅ Loaded saved tools:', data.savedTools?.length);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      console.error('❌ Fetch error:', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (agentId: number) => {
    try {
      const res = await fetch('/api/saved-tools', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });

      if (!res.ok) throw new Error('Failed to remove');

      setSavedTools(prev => prev.filter(t => t.agent_id !== agentId));
      console.log('✅ Removed tool:', agentId);
    } catch (err) {
      console.error('❌ Remove error:', err);
    }
  };

  return (
    <section>
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(6,182,212,0.08) 100%)',
        border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '40px', marginBottom: '48px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Your Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
            Manage your saved tools and discover new solutions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={24} className="text-red-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Saved Tools</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)' }}>{savedTools.length}</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={24} className="text-blue-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Tools Viewed</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)' }}>0</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={24} className="text-purple-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>My Reviews</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)' }}>0</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitCompare size={24} className="text-green-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Comparisons</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)' }}>0</div>
          </div>
        </div>
      </div>

      {/* Saved Tools */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Saved Tools</h3>
        </div>

        {loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px 0' }}>Loading...</p>}

        {error && (
          <div style={{ color: '#f87171', textAlign: 'center', padding: '48px 0', background: 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {!loading && !error && savedTools.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Heart size={48} style={{ color: 'var(--text-dim)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>No tools saved yet</p>
            <Link href="/products">
              <button style={{
                padding: '12px 24px', background: 'var(--cyan)', border: 'none', borderRadius: '12px',
                color: 'black', fontWeight: 700, cursor: 'pointer', fontSize: '14px'
              }}>
                Explore Tools
              </button>
            </Link>
          </div>
        )}

        {!loading && !error && savedTools.length > 0 && (
          <div className="agents-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {savedTools.map(saved => (
              <div
                key={saved.id}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  borderRadius: '20px', padding: '24px', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--cyan)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-secondary)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {saved.agents?.logo_url ? (
                      <img src={saved.agents.logo_url} alt={saved.agents.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '20px', fontWeight: 700 }}>{saved.agents?.name?.[0] || '?'}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{saved.agents?.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{saved.agents?.category}</span>
                  </div>
                  <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '14px' }}>
                    ★ {saved.agents?.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {saved.agents?.summary}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/products/${saved.agents?.slug}`} style={{ flex: 1 }}>
                    <button style={{
                      width: '100%', padding: '10px', background: 'var(--cyan)', border: 'none', borderRadius: '10px',
                      color: 'black', fontWeight: 700, cursor: 'pointer', fontSize: '13px'
                    }}>
                      View Tool
                    </button>
                  </Link>
                  <button
                    onClick={() => handleRemove(saved.agent_id)}
                    style={{
                      padding: '10px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
                      color: '#f87171', fontWeight: 600, cursor: 'pointer', fontSize: '13px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
