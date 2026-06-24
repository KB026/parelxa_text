/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Review, Agent } from '@/lib/types';
import { StarRating } from '@/components/parlexa/reviews/ReviewStats';

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<(Review & { agent?: Agent })[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const supabase = createClient() as any;

  useEffect(() => {
    async function loadVendorReviews() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get vendor's agent IDs
      const { data: agents } = await supabase
        .from('agents')
        .select('id, name')
        .eq('user_id', user.id);

      if (!agents || agents.length === 0) {
        setLoading(false);
        return;
      }

      const agentIds = agents.map((a: any) => a.id);

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          agent:agents(id, name),
          response:review_responses(content, created_at)
        `)
        .in('agent_id', agentIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading vendor reviews:', error);
      } else if (data) {
        setReviews(data.map((r: any) => ({
          id: r.id,
          agentId: r.agent_id,
          userId: r.user_id,
          ratingOverall: Number(r.rating_overall),
          ratingEaseUse: Number(r.rating_ease_use),
          ratingValue: Number(r.rating_value),
          ratingSupport: Number(r.rating_support),
          ratingRelevance: Number(r.rating_relevance),
          content: r.content || '',
          recommend: !!r.recommend,
          helpfulVotes: Number(r.helpful_count) || 0,
          unhelpfulVotes: Number(r.unhelpful_count) || 0,
          approvalStatus: r.approval_status || 'approved',
          isReported: !!r.is_reported,
          createdAt: r.created_at || '',
          agent: r.agent,
          response: Array.isArray(r.response) ? r.response[0] : r.response
        } as unknown as (Review & { agent?: Agent }))));
      }
      setLoading(false);
    }
    loadVendorReviews();
  }, [supabase]);

  const handleReply = async (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;

    setSubmitting({ ...submitting, [reviewId]: true });
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('review_responses')
      .upsert({
        review_id: reviewId,
        vendor_id: user?.id,
        content: text,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      // Update local state
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, response: { content: text, createdAt: new Date().toISOString() } } : r));
      setReplyText({ ...replyText, [reviewId]: '' });
    }
    setSubmitting({ ...submitting, [reviewId]: false });
  };

  return (
    <section>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Customer Reviews</h1>
        <p style={{ color: 'var(--text-muted)' }}>Respond to feedback and manage your tool&apos;s reputation.</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-dim)' }}>Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {reviews.map(review => (
            <div key={review.id} style={{ 
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
              borderRadius: '24px', padding: '32px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Review for <strong>{review.agent?.name}</strong>
                  </div>
                  <StarRating rating={review.ratingOverall} size="sm" />
                </div>
                <button style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                  ðŸš© Flag Review
                </button>
              </div>

              <p style={{ color: 'var(--text-white)', lineHeight: 1.6, fontSize: '15px', marginBottom: '24px' }}>
                &quot;{review.content}&quot;
              </p>

              {/* Vendor Response */}
              {review.response ? (
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', borderLeft: '4px solid var(--cyan)', 
                  padding: '20px', borderRadius: '0 12px 12px 0' 
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cyan)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Your Response
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>{review.response.content}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea 
                    placeholder="Write a professional response..."
                    value={replyText[review.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                    style={{ 
                      width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)', color: 'white', outline: 'none',
                      minHeight: '100px', fontSize: '14px'
                    }}
                  />
                  <button 
                    onClick={() => handleReply(review.id)}
                    disabled={submitting[review.id]}
                    className="btn-get-started"
                    style={{ width: 'fit-content', padding: '10px 24px', fontSize: '13px' }}
                  >
                    {submitting[review.id] ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '80px 40px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
          <p style={{ color: 'var(--text-dim)' }}>No reviews yet for your listings.</p>
        </div>
      )}
    </section>
  );
}
