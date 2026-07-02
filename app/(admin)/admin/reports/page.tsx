/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminReports() {
  const supabase = createClient();

  // 1. Revenue Metrics
 const { data: transactionsData } = await supabase
  .from('transactions')
  .select('amount, created_at')
  .eq('status', 'completed');

const transactions = Array.isArray(transactionsData)
  ? transactionsData
  : [];

const totalRevenue = transactions.reduce(
  (sum, t) => sum + Number((t as { amount?: string | number }).amount || 0),
  0
);
  
  // 2. Category Distribution
  const { data: agentsData } = await supabase
  .from('agents')
  .select('category');

const agents = Array.isArray(agentsData)
  ? agentsData
  : [];
  
  const categoryMap: Record<string, number> = {};
 agents.forEach((a) => {
    const cat = a.category || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 3. Growth Metrics (Weekly trailing 4 weeks)
  const getWeeklyStats = async (table: string) => {
    const weeks = [0, 1, 2, 3].map(w => {
      const start = new Date();
      start.setDate(start.getDate() - (w + 1) * 7);
      const end = new Date();
      end.setDate(end.getDate() - w * 7);
      return { start, end };
    });

    return await Promise.all(weeks.map(async ({ start, end }) => {
      const { count } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString());
      return count || 0;
    }));
  };

  const weeklyListings = await getWeeklyStats('agents');
  const weeklyUsers = await getWeeklyStats('profiles');

  return (
    <section>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Platform Reports</h1>
        <p style={{ color: 'var(--text-muted)' }}>Business intelligence and growth analytics for Parlexa.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
        {/* Revenue Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Total Platform Revenue</div>
          <div style={{ fontSize: '48px', fontWeight: 800, color: '#fb923c' }}>${(totalRevenue * 0.012).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style={{ marginTop: '24px', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', background: '#fb923c' }}></div>
          </div>
          <p style={{ marginTop: '16px', color: 'var(--text-dim)', fontSize: '14px' }}>Global revenue generated from featured listing upgrades and promotions (est. USD).</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px', display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Weekly Growth Trends</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>New Listings per Week</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px' }}>
                {weeklyListings.reverse().map((val, i) => (
                  <div key={i} style={{ flex: 1, background: 'var(--cyan)', height: `${Math.max(val * 4, 4)}px`, borderRadius: '2px' }} title={`${val} listings`} />
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>New Users per Week</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px' }}>
                {weeklyUsers.reverse().map((val, i) => (
                  <div key={i} style={{ flex: 1, background: '#818cf8', height: `${Math.max(val * 4, 4)}px`, borderRadius: '2px' }} title={`${val} users`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Top Performing Categories</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {topCategories.map(([name, count]) => (
            <div key={name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ fontWeight: 600, color: 'white' }}>{name}</span>
                <span style={{ color: 'var(--text-dim)' }}>{count} items</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min((count / (agents?.length || 1)) * 100, 100)}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--cyan), var(--blue-primary))'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
