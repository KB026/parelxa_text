'use client';

import { useState } from 'react';
import { submitReview } from '@/app/actions/reviews';
import { Review } from '@/lib/types';
import { StarRating } from './ReviewStats';
import { CheckCircle2 } from 'lucide-react';

interface ReviewFormProps {
  agentId: number;
  existingReview?: Review;
  onSuccess?: () => void;
}

export function ReviewForm({ agentId, existingReview, onSuccess }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [ease, setEase] = useState(existingReview?.ratingEaseUse || 5);
  const [value, setValue] = useState(existingReview?.ratingValue || 5);
  const [support, setSupport] = useState(existingReview?.ratingSupport || 5);
  const [relevance, setRelevance] = useState(existingReview?.ratingRelevance || 5);
  const [recommend, setRecommend] = useState(existingReview?.recommend ?? true);
  const [content, setContent] = useState(existingReview?.content || '');
  const [useCase, setUseCase] = useState(existingReview?.useCase || '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('agentId', agentId.toString());
    formData.append('ease_of_use', ease.toString());
    formData.append('value_for_money', value.toString());
    formData.append('support_quality', support.toString());
    formData.append('india_relevance', relevance.toString());
    formData.append('content', content);
    formData.append('recommend', recommend.toString());
    formData.append('use_case', useCase);

    const result = await submitReview(formData);
    
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setIsSubmitting(false);
      onSuccess?.();
    }
  }

  if (success) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-5" />
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-white)' }}>Review Submitted!</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Thank you for sharing your feedback with the Parlexa community.</p>
        <button 
          onClick={() => setSuccess(false)}
          style={{ marginTop: '24px', padding: '12px 24px', background: 'var(--cyan)', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ 
      background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', gap: '24px'
    }}>
      <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{existingReview ? 'Edit your review' : 'Write a review'}</h3>
      
      {/* Dimension Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <StarRating label="Ease of Use" rating={ease} interactive onChange={setEase} />
        <StarRating label="Value for Money" rating={value} interactive onChange={setValue} />
        <StarRating label="Support Quality" rating={support} interactive onChange={setSupport} />
        <StarRating label="India relevance" rating={relevance} interactive onChange={setRelevance} />
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid var(--border-subtle)', margin: '8px 0' }} />

      {/* Use Case */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dim)' }}>What did you use this tool for?</label>
        <input 
          type="text"
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          placeholder="e.g. Automating customer support, marketing copy generation"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-white)', fontSize: '14px' }}
        />
      </div>

      {/* Recommended Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dim)' }}>Would you recommend this tool?</label>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px' }}>
          <button 
            type="button"
            onClick={() => setRecommend(true)}
            style={{ 
              padding: '6px 16px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              background: recommend ? 'var(--cyan)' : 'transparent', color: recommend ? 'black' : 'var(--text-muted)'
            }}
          >
            Yes
          </button>
          <button 
            type="button"
            onClick={() => setRecommend(false)}
            style={{ 
              padding: '6px 16px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              background: !recommend ? '#ef4444' : 'transparent', color: !recommend ? 'white' : 'var(--text-muted)'
            }}
          >
            No
          </button>
        </div>
      </div>

      {/* Review Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dim)' }}>Detailed Review</label>
          <span style={{ fontSize: '12px', color: content.length < 50 ? '#ef4444' : 'var(--text-muted)' }}>
            {content.length}/800 (min 50)
          </span>
        </div>
        <textarea 
          required
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 800))}
          placeholder="What do you like? What could be better? Share your experience with Indian implementation details..."
          rows={5}
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', color: 'var(--text-white)', fontSize: '14px', resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>{error}</div>}

      <button 
        type="submit"
        disabled={isSubmitting || content.length < 50}
        style={{ 
          background: content.length < 50 ? 'var(--border)' : 'var(--cyan)', 
          color: 'black', border: 'none', borderRadius: '12px', 
          padding: '16px', fontWeight: 700, fontSize: '16px', 
          cursor: (isSubmitting || content.length < 50) ? 'not-allowed' : 'pointer',
          marginTop: '8px', opacity: isSubmitting ? 0.7 : 1
        }}
      >
        {isSubmitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
      </button>
    </form>
  );
}
