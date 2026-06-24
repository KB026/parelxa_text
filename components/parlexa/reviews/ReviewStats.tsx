'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  label?: string;
}

export function StarRating({ 
  rating, 
  max = 5, 
  size = 'md', 
  interactive = false, 
  onChange,
  label 
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const getStarSize = () => {
    switch (size) {
      case 'sm': return '14px';
      case 'lg': return '24px';
      default: return '18px';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 500 }}>{label}</span>}
      <div style={{ display: 'flex', gap: '2px' }}>
        {[...Array(max)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = hovered !== null ? starValue <= hovered : starValue <= Math.round(rating);

          return (
            <span
              key={i}
              onMouseEnter={() => interactive && setHovered(starValue)}
              onMouseLeave={() => interactive && setHovered(null)}
              onClick={() => interactive && onChange?.(starValue)}
              style={{
                fontSize: getStarSize(),
                color: isFilled ? '#fbbf24' : 'var(--bg-card)',
                textShadow: !isFilled ? '0 0 1px var(--text-dim)' : 'none',
                cursor: interactive ? 'pointer' : 'default',
                transition: 'transform 0.1s ease',
                transform: interactive && hovered === starValue ? 'scale(1.2)' : 'scale(1)',
                userSelect: 'none'
              }}
            >
              ★
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Stats Component
interface ReviewStatsProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    recommendationRate: number;
    breakdown: { [key: number]: number };
    dimensions: {
      easeOfUse: number;
      valueForMoney: number;
      supportQuality: number;
      globalRelevance: number;
    };
  };
}

export function ReviewStatsComponent({ stats }: ReviewStatsProps) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '40px',
      padding: '32px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '24px',
      marginBottom: '40px'
    }}>
      {/* Overall Score */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '56px', fontWeight: 800, color: 'var(--text-white)' }}>
          {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
        </div>
        <StarRating rating={stats.averageRating} size="lg" />
        <div style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Based on {stats.totalReviews} reviews
        </div>
        <div style={{ marginTop: '16px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
          {Math.round(stats.recommendationRate)}% recommend this tool
        </div>
      </div>

      {/* Breakdown Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[5, 4, 3, 2, 1].map(star => {
          const count = stats.breakdown[star] || 0;
          const percentage = (count / stats.totalReviews) * 100;
          return (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)', width: '40px' }}>{star} Stars</span>
              <div style={{ flex: 1, height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, height: '100%', background: '#fbbf24', borderRadius: '4px' }} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)', width: '30px' }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Dimensions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Ease of Use</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ height: '4px', flex: 1, background: 'var(--bg-secondary)', borderRadius: '2px' }}>
              <div style={{ width: `${(stats.dimensions.easeOfUse / 5) * 100}%`, height: '100%', background: 'var(--cyan)', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{stats?.dimensions?.easeOfUse ? stats.dimensions.easeOfUse.toFixed(1) : '0.0'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Value for Money</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ height: '4px', flex: 1, background: 'var(--bg-secondary)', borderRadius: '2px' }}>
              <div style={{ width: `${(stats.dimensions.valueForMoney / 5) * 100}%`, height: '100%', background: 'var(--cyan)', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{stats?.dimensions?.valueForMoney ? stats.dimensions.valueForMoney.toFixed(1) : '0.0'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Support Quality</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ height: '4px', flex: 1, background: 'var(--bg-secondary)', borderRadius: '2px' }}>
              <div style={{ width: `${(stats.dimensions.supportQuality / 5) * 100}%`, height: '100%', background: 'var(--cyan)', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{stats?.dimensions?.supportQuality ? stats.dimensions.supportQuality.toFixed(1) : '0.0'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>India Relevance</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ height: '4px', flex: 1, background: 'var(--bg-secondary)', borderRadius: '2px' }}>
              <div style={{ width: `${(stats.dimensions.globalRelevance / 5) * 100}%`, height: '100%', background: 'var(--cyan)', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{stats?.dimensions?.globalRelevance ? stats.dimensions.globalRelevance.toFixed(1) : '0.0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
