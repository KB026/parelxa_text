'use client';

import { useState } from 'react';
import { StarRating } from './ReviewStats';
import { voteReview, reportReview, respondToReview } from '@/app/actions/reviews';
import { Review } from '@/lib/types';
import { ThumbsUp, ThumbsDown, Check, X } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  isVendor?: boolean;
}

export function ReviewCard({ review, isVendor = false }: ReviewCardProps) {
  const [votes, setVotes] = useState(review.helpfulVotes);
  const [hasVoted, setHasVoted] = useState(!!review.userVote);
  const [isReported, setIsReported] = useState(review.isReported);
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  async function handleVote(type: 'helpful' | 'unhelpful') {
    if (hasVoted) return;
    const result = await voteReview(review.id, type);
    if (!result.error) {
      setVotes(prev => type === 'helpful' ? prev + 1 : prev);
      setHasVoted(true);
    }
  }

  async function handleReport() {
    if (isReported) return;
    const result = await reportReview(review.id);
    if (!result.error) setIsReported(true);
  }

  async function handleReply() {
    setIsSubmittingReply(true);
    const result = await respondToReview(review.id, replyContent);
    if (!result.error) {
      window.location.reload(); // Quick refresh to show response
    }
    setIsSubmittingReply(false);
  }

  const dateStr = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div style={{ 
      padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
      borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--cyan)' }}>
            {review.userId[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>Anonymous User</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dateStr}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: review.recommend ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
          {review.recommend ? (
            <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
          )}
          <span style={{ fontSize: '12px', color: review.recommend ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {review.recommend ? 'Recommended' : 'Not Recommended'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <StarRating rating={review.ratingOverall} size="sm" />
        {review.useCase && (
          <div style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            UseCase: {review.useCase}
          </div>
        )}
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {review.content}
        </p>
      </div>

      {/* Helpful Votes Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Was this review helpful?</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => handleVote('helpful')}
              disabled={hasVoted}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', cursor: hasVoted ? 'default' : 'pointer', fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{votes > 0 ? votes : 'Helpful'}</span>
            </button>
            <button 
              onClick={() => handleVote('unhelpful')}
              disabled={hasVoted}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', cursor: hasVoted ? 'default' : 'pointer', fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleReport}
            disabled={isReported}
            style={{ background: 'transparent', border: 'none', color: isReported ? '#ef4444' : 'var(--text-muted)', fontSize: '12px', cursor: isReported ? 'default' : 'pointer', textDecoration: 'underline' }}
          >
            {isReported ? 'Reported' : 'Report'}
          </button>
          {isVendor && !review.response && (
            <button 
              onClick={() => setShowReply(!showReply)}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-white)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
            >
              Respond
            </button>
          )}
        </div>
      </div>

      {/* Official Response */}
      {review.response && (
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderLeft: '3px solid var(--cyan)', padding: '16px', borderRadius: '0 12px 12px 0', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--cyan)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Response from Tool Owner</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{new Date(review.response.createdAt).toLocaleDateString()}</span>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            {review.response.content}
          </p>
        </div>
      )}

      {/* Reply Form */}
      {showReply && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <textarea 
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your response as the tool owner..."
            rows={3}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '12px', color: 'var(--text-white)', fontSize: '14px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleReply}
              disabled={isSubmittingReply || !replyContent}
              style={{ background: 'var(--cyan)', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            >
              {isSubmittingReply ? 'Sending...' : 'Post Response'}
            </button>
            <button onClick={() => setShowReply(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
