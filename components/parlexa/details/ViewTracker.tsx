'use client';

import { useEffect } from 'react';
import { trackInteraction } from '@/lib/analytics';

interface ViewTrackerProps {
  agentId: number;
  userId?: string;
}

export function ViewTracker({ agentId, userId }: ViewTrackerProps) {
  useEffect(() => {
    // Fire and forget view tracking on mount
    const track = async () => {
      try {
        await trackInteraction(agentId, 'view', userId);
      } catch (err) {
        console.error('Failed to track view:', err);
      }
    };
    track();
  }, [agentId, userId]);

  return null;
}
