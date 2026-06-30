'use client';

import { Agent, ReviewStats } from '@/lib/types';
import { StarRating } from '../reviews/ReviewStats';
import { useState } from 'react';
import { Bookmark, Share2 } from 'lucide-react';

interface StickySidebarProps {
  agent: Agent;
  stats: ReviewStats | null;
  onVisitWebsite?: () => void;
  onSave?: (agentId: string | number) => Promise<boolean>;
  onShare?: () => void;
}

export function StickySidebar({ agent, stats, onVisitWebsite, onSave, onShare }: StickySidebarProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    const success = await onSave(agent.id);
    if (success) {
      setIsSaved(true);
    }
    setIsSaving(false);
  };

  const handleShare = async () => {
    if (onShare) return onShare();
    try {
      if (navigator.share) {
        await navigator.share({
          title: agent.name,
          text: `Check out ${agent.name} on Parlexa!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  return (
    <div style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
      <div style={{ 
        padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
        borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <StarRating rating={stats?.averageRating || 0} size="sm" />
            <span style={{ fontWeight: 800, fontSize: '18px' }}>{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</span>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Based on {stats?.totalReviews || 0} reviews
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '4px' }}>Pricing</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cyan)' }}>{agent.pricing}</div>
          <div style={{ fontSize: '13px', color: 'var(--cyan)', marginTop: '4px' }}>{agent.pricingModel || 'Subscription'}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <a 
            href={agent.website ? (agent.website.startsWith('http') ? agent.website : `https://${agent.website}`) : '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onVisitWebsite?.()}
            className="btn-get-started"
            style={{ 
              padding: '16px', fontSize: '16px', width: '100%', display: 'inline-flex', 
              justifyContent: 'center', alignItems: 'center', textDecoration: 'none', 
              boxSizing: 'border-box' 
            }}
          >
            Visit Website
          </a>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Bookmark Button */}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              style={{ 
                flex: 1, padding: '12px', borderRadius: '12px',
                background: isSaved ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: isSaved ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
                color: isSaved ? '#3b82f6' : 'var(--text-white)',
                cursor: 'pointer',
                opacity: isSaving ? 0.5 : 1,
                transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Save to Wishlist"
            >
              <Bookmark 
                size={20} 
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
              />
            </button>

            {/* Share Button */}
            <button 
              onClick={handleShare}
              style={{ 
                flex: 1, padding: '12px', borderRadius: '12px',
                background: 'transparent', border: '1px solid var(--border-subtle)',
                color: 'var(--text-white)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              title="Share"
            >
              <Share2 size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Categories</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '12px' }}>{agent.category}</span>
              {agent.subCategory && <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '12px' }}>{agent.subCategory}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
