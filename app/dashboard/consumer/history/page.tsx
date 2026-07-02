import { createClient } from '@/lib/supabase/server';
import { getAgents, getCompareHistory } from '@/lib/api';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CompareHistoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>Please log in to view your history.</div>;
  }

  const allAgents = await getAgents();
  const history = await getCompareHistory(user.id, supabase);

  return (
    <section>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Compare History</h1>
        <p style={{ color: 'var(--text-muted)' }}>Resume your previous evaluations and tool comparisons.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {history.map(item => (
          <div key={item.id} style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
            borderRadius: '20px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div>
                <div style={{ color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Date</div>
                <div style={{ fontWeight: 600 }}>{new Date(item.date).toLocaleDateString()}</div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Tools Compared</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {item.agents.map(id => {
                    const agent = allAgents.find(a => a.id === id);
                    return (
                      <div key={id} style={{ 
                        borderRadius: '16px', 
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '4px 10px',
                        fontWeight: 500
                      }}>
                        {agent?.logoUrl ? (
                          <img src={agent.logoUrl} alt={agent.name} style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-card)', fontSize: '10px' }}>
                            {agent?.name?.[0] || '?'}
                          </div>
                        )}
                        {agent?.name || 'Unknown Tool'}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'none' /* Tablet+ only */ }} className="desktop-view">
                <div style={{ color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Topic</div>
                <div style={{ fontWeight: 500, color: 'var(--cyan)' }}>{item.type}</div>
              </div>
            </div>

            <Link 
              href={`/compare?ids=${item.agents.join(',')}`}
              className="btn-add-compare"
              style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px', textDecoration: 'none' }}
            >
              Re-open Comparison
            </Link>
          </div>
        ))}

        {history.length === 0 && (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '100px 0' }}>You haven&apos;t run any comparisons yet.</p>
        )}
      </div>
    </section>
  );
}
