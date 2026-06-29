'use client';
import { useState } from 'react';
import { Agent, ReviewStats } from '@/lib/types';
import { StarRating } from '../reviews/ReviewStats';
import { toggleWishlist } from '@/app/actions/wishlist';

interface StickySidebarProps {
  agent: Agent;
  stats: ReviewStats | null;
  initialSaved?: boolean;
  onVisitWebsite?: () => void;
  onSave?: () => void;
  onShare?: () => void;
}

export function StickySidebar({ agent, stats, initialSaved = false, onVisitWebsite, onSave, onShare }: StickySidebarProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (onSave) return onSave();
    setSaving(true);
    const result = await toggleWishlist(Number(agent.id));
    if (result.error) {
      alert(result.error);
    } else {
      setSaved(result.isSaved || false);
    }
    setSaving(false);
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
            style={{ 
              padding: '16px', fontSize: '16px', width: '100%', borderRadius: '12px',
              background: 'var(--cyan)', border: 'none',
              color: 'black', fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none', boxSizing: 'border-box'
            }}
          >
            Visit Website
          </a>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleSave}
              style={{ 
                flex: 1, padding: '12px', fontSize: '14px', borderRadius: '12px',
                background: saved ? 'var(--cyan)' : 'transparent', border: '1px solid var(--border-subtle)',
                color: saved ? 'black' : 'var(--text-white)', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {saved ? 'Saved' : 'Wishlist'}
            </button>
            <button 
              onClick={handleShare}
              style={{ 
                flex: 1, padding: '12px', fontSize: '14px', borderRadius: '12px',
                background: 'transparent', border: '1px solid var(--border-subtle)',
                color: 'var(--text-white)', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Share
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
