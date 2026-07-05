'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReviewStatsComponent } from './ReviewStats';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { Review, ReviewStats } from '@/lib/types';
import { getReviews } from '@/lib/api';

interface ReviewSystemProps {
  agentId: number;
  stats: ReviewStats | null;
  userReview: Review | null;
  initialReviews: Review[];
  isLoggedIn: boolean;
  isVendor?: boolean;
}

export function ReviewSystem({ 
  agentId, 
  stats, 
  userReview, 
  initialReviews, 
  isLoggedIn,
  isVendor = false 
}: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sort, setSort] = useState<'recent' | 'helpful' | 'high' | 'low'>('helpful');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialReviews.length === 5);
  const [showForm, setShowForm] = useState(false);

  const loadReviews = useCallback(async (newSort?: 'recent' | 'helpful' | 'high' | 'low', newPage?: number) => {
    setIsLoading(true);
    const s = newSort || sort;
    const p = newPage || page;
    const results = await getReviews(agentId, s, p);
    
    if (results) {
      if (p === 1) setReviews(results);
      else setReviews(prev => [...prev, ...results]);
      setHasMore(results.length === 5);
    }
    setIsLoading(false);
  }, [agentId, sort, page]);

  useEffect(() => {
    if (sort !== 'helpful') {
      loadReviews(sort, 1);
      setPage(1);
    }
  }, [sort, loadReviews]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(sort, nextPage);
  }

  return (
    <div className="border-t border-white/5 pt-12">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>User Reviews</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Validated feedback from Indian businesses</p>
        </div>
        {!userReview && isLoggedIn && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            style={{ padding: '12px 24px', background: 'var(--cyan)', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Write a Review
          </button>
        )}
      </div>

      {stats ? (
        <ReviewStatsComponent stats={stats} />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-subtle)', marginBottom: '40px' }}>
          <p style={{ color: 'var(--text-dim)', margin: 0 }}>No reviews yet. Be the first to share your experience!</p>
        </div>
      )}

      {showForm && (
        <div style={{ marginBottom: '40px' }}>
          <ReviewForm agentId={agentId} onSuccess={() => { setShowForm(false); window.location.reload(); }} />
          <button 
            onClick={() => setShowForm(false)} 
            style={{ marginTop: '12px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Cancel
          </button>
        </div>
      )}

      {userReview && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cyan)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Review</div>
          <ReviewCard review={userReview} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700 }}>{stats?.totalReviews || 0} Total Reviews</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Sort by:</span>
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value as 'recent' | 'helpful' | 'high' | 'low')}
            style={{ 
              background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', 
              borderRadius: '8px', padding: '6px 12px', color: 'var(--text-white)', fontSize: '14px'
            }}
          >
            <option value="helpful">Most Helpful</option>
            <option value="recent">Most Recent</option>
            <option value="high">Highest Rated</option>
            <option value="low">Lowest Rated</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {reviews.filter(r => r.id !== userReview?.id).map(review => (
          <ReviewCard key={review.id} review={review} isVendor={isVendor} />
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleLoadMore}
            disabled={isLoading}
            style={{ 
              padding: '12px 32px', background: 'transparent', border: '1px solid var(--border-subtle)', 
              borderRadius: '12px', color: 'var(--text-white)', fontWeight: 600, cursor: 'pointer' 
            }}
          >
            {isLoading ? 'Loading...' : 'Show More Reviews'}
          </button>
        </div>
      )}
    </div>
  );
}
