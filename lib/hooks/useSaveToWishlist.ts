'use client';
import { useState, useCallback } from 'react';

export function useSaveToWishlist() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (agentId: string | number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/saved-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      const data = await res.json();
      console.log('✅ Save response:', data);
      setSaved(data.saved !== false);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Save error:', msg);
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (agentId: string | number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/saved-tools', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove');
      }

      setSaved(false);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Remove error:', msg);
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async (agentId: string | number) => {
    try {
      const res = await fetch('/api/saved-tools');
      if (!res.ok) return false;

      const data = await res.json();
      const isSaved = (data.savedTools || []).some(
        (t: { agent_id: string | number }) => String(t.agent_id) === String(agentId)
      );
      setSaved(isSaved);
      return isSaved;
    } catch {
      return false;
    }
  }, []);

  return { save, remove, checkStatus, saved, setSaved, loading, error };
}
