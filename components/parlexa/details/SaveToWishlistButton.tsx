'use client';
import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useSaveToWishlist } from '@/lib/hooks/useSaveToWishlist';

export function SaveToWishlistButton({ agentId }: { agentId: string }) {
  const { save, remove, checkStatus, saved, loading } = useSaveToWishlist();
  const [checked, setChecked] = useState(false);

  // Check initial saved status on mount
  useEffect(() => {
    if (!checked) {
      checkStatus(agentId).then(() => setChecked(true));
    }
  }, [agentId, checked, checkStatus]);

  const handleToggle = async () => {
    if (saved) {
      await remove(agentId);
    } else {
      await save(agentId);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        flex: 1,
        padding: '12px',
        fontSize: '14px',
        borderRadius: '12px',
        background: saved ? 'var(--cyan)' : 'transparent',
        border: '1px solid var(--border-subtle)',
        color: saved ? 'black' : 'var(--text-white)',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
      }}
      title="Save to Wishlist"
    >
      <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
      {loading ? '...' : saved ? 'Saved' : 'Wishlist'}
    </button>
  );
}
