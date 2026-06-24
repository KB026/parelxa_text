'use client';

import { useState } from 'react';
import { Agent } from '@/lib/types';

interface ClaimModalProps {
  agent: Agent;
  onClose: () => void;
  onSubmit: (email: string, role: string, note: string) => Promise<{ success: boolean; error?: string }>;
}

export function ClaimModal({ agent, onClose, onSubmit }: ClaimModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await onSubmit(email, role, note);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to submit claim request');
    }
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '480px', textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📩</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Check your inbox!</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
            We&apos;ve sent a verification email to <strong>{email}</strong>. Please click the link in the email to confirm your identity and proceed with the claim.
          </p>
          <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '32px' }}>
          <header style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Claim {agent.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Verify ownership to manage reviews, update tool details, and access analytics.
            </p>
          </header>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                Work Email (at {agent.website.replace('https://', '').replace('www.', '').split('/')[0]})
              </label>
              <input 
                type="email" 
                required 
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ 
                  width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-subtle)', color: 'white', outline: 'none' 
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>Your Role</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Founder, Marketing Manager"
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{ 
                  width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-subtle)', color: 'white', outline: 'none' 
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>Note to Admin (Optional)</label>
              <textarea 
                placeholder="Mention links to LinkedIn or proof of ownership..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                style={{ 
                  width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-subtle)', color: 'white', outline: 'none', resize: 'none' 
                }}
              />
            </div>

            {error && (
              <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ flex: 2, padding: '14px' }}>
                {isSubmitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-content {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
