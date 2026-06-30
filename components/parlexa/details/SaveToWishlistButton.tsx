'use client';
import { useState } from 'react';
import { Heart } from 'lucide-react';

export function SaveToWishlistButton({ agentId }: { agentId: string }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/saved-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, folder_name: 'All Tools' }),
      });

      if (res.ok) {
        setSaved(true);
        console.log('✅ Saved to wishlist');
      }
    } catch (err) {
      console.error('❌ Save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
        saved
          ? 'bg-red-500/10 border-red-500 text-red-400'
          : 'border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400'
      }`}
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
      {saved ? 'Saved' : 'Save to Wishlist'}
    </button>
  );
}
