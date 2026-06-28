/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { AgentCard } from '@/components/parlexa/AgentCard';

export async function AIFinderResults({ query }: { query: string }) {
  if (!query) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
        Type a search query above to find the perfect AI tools for your workflow.
      </div>
    );
  }

  const supabase = createClient();
  
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .eq('approval_status', 'approved')
    .or(`name.ilike.%${query}%,summary.ilike.%${query}%,category.ilike.%${query}%`)
    .order('rating', { ascending: false })
    .limit(20);

  if (error) {
    console.error('AI Finder DB Error:', error);
    return <div style={{ textAlign: 'center', color: '#ef4444' }}>Failed to load results.</div>;
  }

  if (!agents || agents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)', fontSize: '18px' }}>
        No tools found for &apos;{query}&apos;
      </div>
    );
  }

  return (
    <div>
      <p style={{ marginBottom: '24px', color: 'var(--text-dim)' }}>
        Found {agents.length} tools matching &quot;{query}&quot;
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent as any} />
        ))}
      </div>
    </div>
  );
}
