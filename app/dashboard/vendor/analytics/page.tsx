/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function VendorAnalyticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in.</div>;
  }

  // Get vendor's agents
  const { data: agents } = await supabase.from('agents').select('id, name').eq('user_id', user.id);
  const agentIds = agents?.map(a => a.id) || [];

  let interactions: any[] = [];
  if (agentIds.length > 0) {
    const { data } = await supabase
      .from('agent_interactions')
      .select('traffic_source, visitor_location, search_keyword')
      .in('agent_id', agentIds);
    interactions = data || [];
  }

  // Calculate Traffic Sources
  let platformBrowse = 0;
  let directReferral = 0;
  
  // Calculate Geography
  const geoMap: Record<string, number> = {};
  
  // Calculate Keywords
  const keywordMap: Record<string, number> = {};

  interactions.forEach(interaction => {
    // Traffic
    if (interaction.traffic_source === 'Platform Browse') platformBrowse++;
    else if (interaction.traffic_source === 'Direct Referral') directReferral++;

    // Geography
    if (interaction.visitor_location) {
      geoMap[interaction.visitor_location] = (geoMap[interaction.visitor_location] || 0) + 1;
    }

    // Keywords
    if (interaction.search_keyword) {
      keywordMap[interaction.search_keyword] = (keywordMap[interaction.search_keyword] || 0) + 1;
    }
  });

  const totalTraffic = platformBrowse + directReferral;
  const sources = [
    { label: 'Platform Browse', value: totalTraffic > 0 ? Math.round((platformBrowse / totalTraffic) * 100) : 0, color: 'var(--cyan)' },
    { label: 'Direct Referrals', value: totalTraffic > 0 ? Math.round((directReferral / totalTraffic) * 100) : 0, color: '#3b82f6' },
  ];

  const totalGeo = Object.values(geoMap).reduce((a, b) => a + b, 0);
  const states = Object.entries(geoMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      percentage: totalGeo > 0 ? Math.round((count / totalGeo) * 100) : 0
    }))
    .slice(0, 5); // top 5
  if (states.length === 0) states.push({ name: 'Global / Unknown', percentage: 100 });

  const keywords = Object.entries(keywordMap)
    .sort((a, b) => b[1] - a[1])
    .map(([word, views]) => ({
      word,
      views,
      growth: '-'
    }))
    .slice(0, 10);

  return (
    <section>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Deep Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Understand where your visitors are coming from and what they are looking for.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        {/* Traffic Sources */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Traffic Sources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sources.map(source => (
              <div key={source.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-white)' }}>{source.label}</span>
                  <span style={{ fontWeight: 700 }}>{source.value}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${source.value}%`, height: '100%', background: source.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Breakdown */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Visitor Geography</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {states.map(state => (
              <div key={state.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>{state.name}</div>
                  <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px' }}>
                    <div style={{ width: `${state.percentage}%`, height: '100%', background: 'var(--cyan)' }} />
                  </div>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-dim)', minWidth: '32px' }}>{state.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Top Search Keywords</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ paddingBottom: '16px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Keyword</th>
              <th style={{ paddingBottom: '16px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Total Views</th>
              <th style={{ paddingBottom: '16px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((kw: any) => (
              <tr key={kw.word} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px 0', fontSize: '15px' }}>{kw.word}</td>
                <td style={{ padding: '16px 0', fontSize: '15px', fontWeight: 700 }}>{kw.views}</td>
                <td style={{ padding: '16px 0', color: 'var(--text-dim)', fontSize: '14px', fontWeight: 600 }}>{kw.growth}</td>
              </tr>
            ))}
            {keywords.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '16px 0', fontSize: '14px', color: 'var(--text-dim)' }}>No keyword data available yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
