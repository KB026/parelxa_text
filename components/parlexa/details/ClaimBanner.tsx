'use client';

import { useState } from 'react';
import { Agent } from '@/lib/types';
import { ClaimModal } from './ClaimModal';

interface ClaimBannerProps {
  agent: Agent;
  userId?: string;
  submitClaim: (email: string, role: string, note: string) => Promise<{ success: boolean; error?: string }>;
}

export function ClaimBanner({ agent, userId, submitClaim }: ClaimBannerProps) {
  const [showModal, setShowModal] = useState(false);

  if (agent.userId) return null;

  return (
    <>
      <div style={{ 
        background: 'rgba(251,146,60,0.03)', 
        border: '1px solid rgba(251,146,60,0.15)', 
        borderRadius: '12px', 
        padding: '12px 20px', 
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'var(--text-white)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '20px', filter: 'grayscale(1) brightness(1.5)' }}>ðŸ›¡ï¸</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Are you the maker of {agent.name}?</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Claim this listing to manage details, respond to reviews, and access insights.</div>
          </div>
        </div>
        <button 
          onClick={() => {
            if (!userId) {
              window.location.href = `/login?message=Please log in to claim this listing&returnTo=${window.location.pathname}`;
              return;
            }
            setShowModal(true);
          }}
          style={{ 
            padding: '8px 16px', fontSize: '13px', background: 'transparent', color: '#fb923c', 
            border: '1px solid rgba(251,146,60,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
          }}
          className="btn-claim-subtle"
        >
          Claim This Tool
        </button>
      </div>

      {showModal && (
        <ClaimModal 
          agent={agent} 
          onClose={() => setShowModal(false)} 
          onSubmit={submitClaim} 
        />
      )}
    </>
  );
}
