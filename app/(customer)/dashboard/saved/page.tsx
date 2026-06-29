import { getSavedToolsList } from '@/lib/api';
import { AgentCard } from '@/components/parlexa/AgentCard';
import { createClient } from '@/lib/supabase/server';
import { Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SavedToolsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your saved tools.</div>;
  }

  const savedAgents = await getSavedToolsList(user.id);

  const folders = [
    { name: 'Shortlisted for Q3', count: 0 },
    { name: 'HR Tools', count: 0 },
    { name: 'Social Media', count: 0 },
  ];

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Saved Tools</h1>
          <p style={{ color: 'var(--text-muted)' }}>Organize and manage your integration shortlist.</p>
        </div>
        <button className="btn-get-started" style={{ padding: '12px 20px', fontSize: '14px' }}>
          + New Folder
        </button>
      </div>

      {/* Folder Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '8px' }}>
        <button style={{ 
          padding: '10px 20px', borderRadius: '12px', background: 'var(--cyan)', color: 'black', 
          fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' 
        }}>
          All Tools ({savedAgents.length})
        </button>
        {folders.map(folder => (
          <button key={folder.name} style={{ 
            padding: '10px 20px', borderRadius: '12px', background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-subtle)', color: 'var(--text-white)', 
            fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>
            {folder.name} ({folder.count})
          </button>
        ))}
      </div>

      <div className="agents-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {savedAgents.map(agent => (
          <div key={agent.id} style={{ position: 'relative' }}>
            <AgentCard agent={agent} />
            <div style={{ 
              position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', 
              backdropFilter: 'blur(8px)', borderRadius: '8px', padding: '6px', cursor: 'pointer' 
            }} title="Remove from wishlist">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <button style={{ 
              width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px',
              background: 'transparent', border: '1px solid var(--border-subtle)',
              color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}>
              + Add to Compare
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
