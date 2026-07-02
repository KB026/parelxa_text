'use client';

import { Agent, ReviewStats } from '@/lib/types';
import { StarRating } from '../reviews/ReviewStats';
import { useState, useEffect } from 'react';
import { Bookmark, Share2, GitCompare } from 'lucide-react';
import { toggleWishlist } from '@/app/actions/wishlist';
import { SaveFolderToast } from './SaveFolderToast';

interface HeroSectionProps {
  agent: Agent;
  stats: ReviewStats | null;
  onVisitWebsite?: () => void;
  onCompare?: () => void;
  onShare?: () => void;
  initialSaved?: boolean;
}

export function HeroSection({ 
  agent, 
  stats, 
  onVisitWebsite, 
  onCompare, 
  onShare,
  initialSaved = false
}: HeroSectionProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await toggleWishlist(Number(agent.id));
      if (result.error) {
        if (result.error === 'You must be logged in to save tools.') {
          window.dispatchEvent(new CustomEvent('open-auth', { detail: { view: 'signin' } }));
        } else {
          console.error(result.error);
        }
      } else {
        const nextSaved = result.isSaved || false;
        setIsSaved(nextSaved);
        if (nextSaved) {
          setShowToast(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVisitWebsite = () => {
    onVisitWebsite?.();
  };

  return (
    <section style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Tool Logo */}
        <div style={{ 
          width: '120px', height: '120px', borderRadius: '24px', 
          background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px',
          flexShrink: 0, overflow: 'hidden'
        }}>
          {agent.logoUrl ? (
            <img src={agent.logoUrl} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            agent.name[0]
          )}
        </div>

        {/* Content */}
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '40px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{agent.name}</h1>
            {agent.isVerified && (
              <span className="badge-tooltip">
                <span className="verified-badge" />
                <span className="tooltip-text">Verified by Parlexa</span>
              </span>
            )}
          </div>
          
          <p style={{ fontSize: '20px', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.4 }}>
            {agent.oneLiner || agent.summary.split('.')[0] + '.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StarRating rating={stats?.averageRating || 0} size="sm" />
              <span style={{ fontWeight: 700, fontSize: '16px' }}>{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</span>
            </div>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
              {(stats?.totalReviews || 0).toLocaleString()} Reviews
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            <span className="cat-pill">{agent.category}</span>
            {agent.tags?.map(tag => (
              <span key={tag} style={{ 
                padding: '4px 12px', background: 'rgba(255,255,255,0.05)', 
                borderRadius: '100px', fontSize: '13px', color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)'
              }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <a 
              href={agent.website ? (agent.website.startsWith('http') ? agent.website : `https://${agent.website}`) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleVisitWebsite}
              className="btn-get-started"
              style={{ 
                padding: '14px 32px', fontSize: '16px', display: 'inline-flex', 
                alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                flex: 1,
                maxWidth: '500px'
              }}
            >
              Visit Website
            </a>
            
            {/* Icon Buttons Group */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Bookmark Button */}
              <button 
                onClick={handleSave}
                disabled={isSaving}
                style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: isSaved ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-secondary)',
                  border: isSaved ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer',
                  color: isSaved ? '#3b82f6' : 'var(--text-white)',
                  opacity: isSaving ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
                title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
              >
                <Bookmark 
                  size={20} 
                  fill={isSaved ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                />
              </button>

              {/* Compare Button */}
              <button 
                onClick={() => onCompare?.()}
                style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer',
                  color: 'var(--text-white)',
                  transition: 'all 0.3s ease'
                }}
                title="Add to Compare"
              >
                <GitCompare size={20} strokeWidth={2} />
              </button>

              {/* Share Button */}
              <button 
                onClick={() => onShare?.()}
                style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer',
                  color: 'var(--text-white)',
                  transition: 'all 0.3s ease'
                }}
                title="Share"
              >
                <Share2 size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <SaveFolderToast 
        agentId={Number(agent.id)} 
        isOpen={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </section>
  );
}
