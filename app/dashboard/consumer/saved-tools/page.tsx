/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { SavedToolsClient } from '@/components/parlexa/dashboard/SavedToolsClient';
import { getFolders } from '@/app/actions/wishlist';
import { Agent } from '@/lib/types';

export default function SavedToolsPage() {
  const [tools, setTools] = useState<Agent[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch from GET /api/saved-tools endpoint
        const res = await fetch('/api/saved-tools');
        if (!res.ok) {
          if (res.status === 401) {
            setError('Please log in to view your saved tools.');
            return;
          }
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch saved tools');
        }

        const data = await res.json();
        
        // Map from saved_tools API response format to Agent cards
        const mappedTools = (data.savedTools || []).map((t: any) => {
          const raw = t.agents;
          if (!raw) return null;
          return {
            id: raw.id,
            name: raw.name,
            slug: raw.slug || raw.id,
            logoUrl: raw.logo_url,
            summary: raw.summary,
            rating: raw.rating || 0,
            category: raw.category,
            folder_id: t.folder_id,
          };
        }).filter(Boolean) as Agent[];

        setTools(mappedTools);

        // Fetch folders via actions helper
        const foldersList = await getFolders();
        setFolders(foldersList);
      } catch (err: any) {
        console.error('❌ Dashboard load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', padding: '60px 0', textAlign: 'center' }}>Loading saved tools...</div>;
  }

  if (error) {
    return (
      <div style={{ 
        color: '#f87171', padding: '40px 0', textAlign: 'center',
        background: 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)'
      }}>
        {error}
      </div>
    );
  }

  return (
    <section>
      <SavedToolsClient initialTools={tools} initialFolders={folders} />
    </section>
  );
}
