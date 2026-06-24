'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Review, Agent } from '@/lib/types';
import { StarRating } from '@/components/parlexa/reviews/ReviewStats';
import Link from 'next/link';

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<(Review & { agent?: Agent })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadReviews() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          agent:agents(id, name, logo_url),
          helpful_count:review_votes(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reviews:', error);
      } else if (data) {
        setReviews(data.map(r => ({
          ...r,
          ratingOverall: Number(r.rating_overall),
          helpfulVotes: r.helpful_count?.[0]?.count || 0,
          agent: r.agent
        })));
      }
      setLoading(false);
    }
    loadReviews();
  }, [supabase]);

  const mostHelpful = [...reviews].sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0))[0];

  return (
    <section>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>My Reviews</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your feedback and see how the community reacts.</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-dim)' }}>Loading your reviews...</p>
      ) : reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Highlight Most Helpful */}
          {mostHelpful && mostHelpful.helpfulVotes > 0 && (
            <div style={{ 
              padding: '24px', background: 'rgba(6,182,212,0.1)', border: '1px solid var(--cyan)', 
              borderRadius: '20px', marginBottom: '16px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>🏆</span>
                <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>Most Helpful Review</span>
              </div>
              <p style={{ margin: 0, fontSize: '15px' }}>
                Your review for <strong>{mostHelpful.agent?.name}</strong> has helped <strong>{mostHelpful.helpfulVotes}</strong> people make a decision.
              </p>
            </div>
          )}

          {reviews.map(review => (
            <div key={review.id} style={{ 
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
              borderRadius: '20px', padding: '24px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {review.agent?.name[0]}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>{review.agent?.name}</h4>
                    <StarRating rating={review.ratingOverall} size="sm" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}>Edit</button>
                  <button style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '13px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>

              <p style={{ color: 'var(--text-white)', lineHeight: 1.6, marginBottom: '16px', fontSize: '15px' }}>
                {review.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Submitted on {new Date(review.createdAt || '').toLocaleDateString()}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cyan)' }}>
                  👍 {review.helpfulVotes} helpful votes
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '80px 40px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px' }}>
          <p style={{ color: 'var(--text-muted)' }}>You haven&apos;t written any reviews yet. Share your experience with AI tools!</p>
          <Link href="/products" className="btn-get-started" style={{ marginTop: '20px', display: 'inline-block' }}>Explore Tools</Link>
        </div>
      )}
    </section>
  );
}
