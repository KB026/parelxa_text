'use client';

import Link from 'next/link';
import { Agent } from '@/lib/types';
import { trackClick } from '@/lib/api';
import { useCompare } from '@/context/CompareContext';

export function AgentCard({ agent }: { agent: Agent }) {
  const { selectedIds, toggleCompare } = useCompare();
  const isFeatured = agent.isFeatured;
  const promotionId = agent.promotionId;
  const name = agent?.name || 'Unnamed Agent';
  const category = agent?.category || 'Uncategorized';
  const rating = (agent?.rating != null && !isNaN(Number(agent.rating))) 
    ? Number(agent.rating).toFixed(1) 
    : '0.0';
  const subCategory = agent?.subCategory || '';
  const summary = agent?.summary || 'No description available.';
  const reviews = (agent?.reviews_count ?? agent?.reviews ?? 0).toLocaleString();
  const pricing = agent?.pricing || 'Contact for pricing';
  const isVerified = agent?.isVerified === true;
  const hasIndiaPricing = agent?.pricing?.toLowerCase().includes('inr') || agent?.pricing?.toLowerCase().includes('â‚¹');
  
  const isInCompare = selectedIds.includes(agent?.id);

  const handleVisitSite = async () => {
    if (isFeatured && promotionId) {
      await trackClick(promotionId);
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(agent.id);
  };
  
  return (
    <div 
      className={`agent-card ${isFeatured ? 'featured-card' : ''}`}
      style={{
        position: 'relative',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isFeatured ? 'scale(1.03)' : 'scale(1)',
        zIndex: isFeatured ? 5 : 1
      }}
    >
      {isFeatured && (
        <span style={{ 
          position: 'absolute', top: '-12px', left: '20px', zIndex: 10,
          background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', 
          color: 'white', fontSize: '10px', fontWeight: 900, padding: '5px 12px', borderRadius: '100px',
          boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)', border: '1px solid rgba(255,255,255,0.3)',
          letterSpacing: '0.05em'
        }}>
          âœ¨ FEATURED
        </span>
      )}

      {/* Compare Toggle Button */}
      {/* ... (button logic remains same but I'll ensure it stays consistent) */}
      <button 
        onClick={handleCompareToggle}
        title={isInCompare ? "Remove from Compare" : "Add to Compare"}
        style={{
          position: 'absolute', top: '16px', right: '16px', zIndex: 10,
          width: '32px', height: '32px', borderRadius: '8px',
          background: isInCompare ? 'var(--cyan)' : 'rgba(255,255,255,0.05)',
          border: isInCompare ? 'none' : '1px solid var(--border-subtle)',
          color: isInCompare ? 'black' : 'var(--text-white)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'auto'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isInCompare ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        )}
      </button>
      
      <Link 
        href={`/products/${agent?.slug || agent?.id}`} 
        className="agent-card-inner"
        style={{
          display: 'flex', flexDirection: 'column', gap: '12px', height: '100%',
          background: isFeatured ? 'rgba(25, 30, 45, 0.95)' : 'var(--bg-card)',
          border: isFeatured ? '2px solid rgba(251, 146, 60, 0.5)' : '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textDecoration: 'none', color: 'inherit',
          boxShadow: isFeatured ? '0 10px 40px rgba(251, 146, 60, 0.15)' : 'none'
        }}
        onClick={handleVisitSite}
      >
        <div className="card-top" style={{ paddingRight: '40px' }}>
          <span className="cat-pill" style={{ background: isFeatured ? '#f97316' : '#1d4ed8' }}>{category}</span>
          <div className="rating-badge">â˜… {rating}</div>
        </div>
        <div>
          <div className="card-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {name}
            {isVerified && (
              <span className="badge-tooltip">
                <span className="verified-badge" />
                <span className="tooltip-text">Verified by the Parlexa team</span>
              </span>
            )}
          </div>
          <div className="card-sub">{subCategory}</div>
        </div>
        <div className="card-desc" style={{ flex: 1 }}>{summary}</div>
        
        {hasIndiaPricing && (
          <div style={{ 
            display: 'inline-flex', padding: '4px 8px', background: 'rgba(251, 146, 60, 0.1)', 
            border: '1px solid rgba(251, 146, 60, 0.2)', borderRadius: '6px', 
            fontSize: '11px', fontWeight: 600, color: '#fb923c', marginBottom: '8px', width: 'fit-content'
          }}>
            ðŸ‡®ðŸ‡³ Special India Pricing Available
          </div>
        )}

        <hr className="card-divider" />
        <div className="card-footer">
          <span className="card-reviews">{reviews} reviews</span>
          <span className="card-price" style={{ 
            color: isFeatured ? '#fb923c' : 'var(--cyan)',
            fontWeight: 700,
            fontSize: '13px',
            textAlign: 'right',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '180px'
          }} title={pricing}>
            {pricing.length > 30 ? pricing.substring(0, 30) + '...' : pricing}
          </span>
        </div>
      </Link>
    </div>
  );
}
