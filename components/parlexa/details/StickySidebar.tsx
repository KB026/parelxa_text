'use client';

import { Agent, ReviewStats } from '@/lib/types';
import { StarRating } from '../reviews/ReviewStats';
import { useState, useEffect, useRef } from 'react';
import { Bookmark, Share2, Check, Star } from 'lucide-react';
import { toggleWishlist } from '@/app/actions/wishlist';
import { SaveFolderToast } from './SaveFolderToast';
import { VisitWebsiteButton } from './VisitWebsiteButton';

interface StickySidebarProps {
  agent: Agent;
  stats: ReviewStats | null;
  onVisitWebsite?: () => void;
  onShare?: () => void;
  initialSaved?: boolean;
}

export function StickySidebar({ agent, stats, onVisitWebsite, onShare, initialSaved = false }: StickySidebarProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const isTrackingLeadRef = useRef(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Background Lead Capture Tracking
    if (!isSaved && !isTrackingLeadRef.current) {
      isTrackingLeadRef.current = true;
      setTimeout(() => { isTrackingLeadRef.current = false; }, 2000);
      
      fetch('/api/agent-interactions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agent.id, action_type: 'lead_capture' })
      }).catch(console.error);
    }
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
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // silently ignore share cancellation
      } else {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
      <div style={{ 
        padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
        borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        {stats && stats.totalReviews > 0 ? (
          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--cyan)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: 'var(--text-white)'
              }}>
                {stats.averageRating.toFixed(1)}
              </div>
              <div>
                <StarRating rating={stats.averageRating} size="sm" />
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Based on {stats.totalReviews} reviews
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.breakdown[star] || 0;
                const percentage = (count / stats.totalReviews) * 100;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', width: '12px' }}>{star}</span>
                    <Star size={10} fill="var(--text-dim)" color="var(--text-dim)" />
                    <div style={{ flex: 1, height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--cyan)', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', width: '24px', textAlign: 'right' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <StarRating rating={0} size="sm" />
              <span style={{ fontWeight: 800, fontSize: '18px' }}>0.0</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Based on 0 reviews
            </div>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '4px' }}>Pricing</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cyan)' }}>{agent.pricing}</div>
          <div style={{ fontSize: '13px', color: 'var(--cyan)', marginTop: '4px' }}>{agent.pricingModel || 'Subscription'}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <VisitWebsiteButton 
            agent={agent}
            onClick={onVisitWebsite}
            className="btn-get-started"
            style={{ 
              padding: '16px', fontSize: '16px', width: '100%', display: 'inline-flex', 
              justifyContent: 'center', alignItems: 'center', textDecoration: 'none', 
              boxSizing: 'border-box' 
            }}
          />
          
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
                background: isCopied ? 'rgba(34, 197, 94, 0.15)' : 'transparent', 
                border: isCopied ? '1px solid #22c55e' : '1px solid var(--border-subtle)',
                color: isCopied ? '#22c55e' : 'var(--text-white)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              title={isCopied ? "Link copied!" : "Share"}
            >
              {isCopied ? <Check size={20} strokeWidth={2} /> : <Share2 size={20} strokeWidth={2} />}
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
      <SaveFolderToast 
        agentId={Number(agent.id)} 
        isOpen={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}
