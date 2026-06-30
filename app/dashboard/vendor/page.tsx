import { createClient } from '@/lib/supabase/server';
import { getVendorAnalytics } from '@/lib/api';
import Link from 'next/link';
import { Eye, MousePointer, Star, MessageSquare, Bookmark, Rocket } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function VendorOverview() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch performance data & active promotions
  let activePromotions: { agents: { name: string } | null; end_date: string }[] = [];
  let views = 0;
  let clicks = 0;
  let saves = 0;
  let avgRating = 0;
  let totalReviews = 0;
  const chartData: number[] = Array(30).fill(0);

  if (user) {
    const { data: promos } = await supabase
      .from('promotions')
      .select('*, agents(name)')
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString());
    activePromotions = promos || [];

    // 1. Fetch vendor traffic/saves analytics
    const analytics = await getVendorAnalytics(user.id);
    views = analytics.views || 0;
    clicks = analytics.clicks || 0;
    saves = analytics.saves || 0;

    // 2. Fetch rating and review aggregate details
    const { data: agents } = await supabase
      .from('agents')
      .select('id, rating, reviews_count')
      .eq('user_id', user.id);

    if (agents && agents.length > 0) {
      totalReviews = agents.reduce((acc, a) => acc + (Number(a.reviews_count) || 0), 0);
      const totalRating = agents.reduce((acc, a) => acc + (Number(a.rating) || 0), 0);
      avgRating = Number((totalRating / agents.length).toFixed(1));

      // 3. Map real interaction trend for the last 30 days
      const agentIds = agents.map(a => a.id);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: interactions } = await supabase
        .from('agent_interactions')
        .select('created_at')
        .in('agent_id', agentIds)
        .eq('action_type', 'view')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (interactions) {
        interactions.forEach(item => {
          if (!item.created_at) return;
          const created = new Date(item.created_at);
          const diffTime = Math.abs(new Date().getTime() - created.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const index = 29 - diffDays;
          if (index >= 0 && index < 30) {
            chartData[index]++;
          }
        });
      }
    }
  }

  const kpis = [
    { label: 'Profile Views', value: views.toLocaleString(), trend: '+0.0%', icon: Eye },
    { label: 'Website Clicks', value: clicks.toLocaleString(), trend: '+0.0%', icon: MousePointer },
    { label: 'Avg Rating', value: avgRating.toString(), trend: '0.0%', icon: Star },
    { label: 'Total Reviews', value: totalReviews.toLocaleString(), trend: '+0.0%', icon: MessageSquare },
    { label: 'Saves', value: saves.toLocaleString(), trend: '+0.0%', icon: Bookmark },
  ];

  const maxVal = Math.max(...chartData, 1);
  const chartWidth = 900;
  const chartHeight = 200;
  const points = chartData.map((val, i) => `${(i / (chartData.length - 1)) * chartWidth},${chartHeight - (val / maxVal) * chartHeight}`).join(' ');

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Listing Performance
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
            Monitor your tool&apos;s visibility and engagement across Parlexa.
          </p>
        </div>
        {activePromotions.length > 0 ? (
          <div style={{ 
            background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.3)', 
            padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fb923c', boxShadow: '0 0 8px #fb923c' }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase' }}>Active Boost</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {activePromotions[0].agents?.name} · Ends {activePromotions[0].end_date ? new Date(activePromotions[0].end_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        ) : (
          <Link href="/dashboard/vendor/billing" style={{ 
            padding: '12px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
            color: 'black', fontSize: '14px', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s',
            display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Rocket className="w-4 h-4 text-black" />
            <span>Boost Visibility</span>
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '48px' }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
            borderRadius: '20px', padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ color: kpi.label === 'Avg Rating' ? 'var(--gold)' : 'var(--text-muted)' }}>
                <kpi.icon className={`w-5 h-5 shrink-0 ${kpi.label === 'Avg Rating' ? 'fill-current' : ''}`} />
              </div>
              <span style={{ 
                fontSize: '12px', fontWeight: 600, 
                color: 'var(--text-dim)',
                background: 'transparent',
                padding: '2px 8px', borderRadius: '4px'
              }}>
                {kpi.trend}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div style={{ 
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
        borderRadius: '24px', padding: '32px', marginBottom: '48px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>Daily Profile Views</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: 0 }}>Traffic overview for the last 30 days</p>
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px' }}>
            <button style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-white)', fontSize: '12px', fontWeight: 600 }}>30 Days</button>
            <button style={{ padding: '6px 12px', color: 'var(--text-dim)', background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer' }}>7 Days</button>
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', height: '220px', marginTop: '20px' }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grids */}
            {[0, 0.25, 0.5, 0.75, 1].map(p => (
              <line key={p} x1="0" y1={chartHeight * p} x2={chartWidth} y2={chartHeight * p} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            
            {/* Area under curve */}
            <path 
              d={`M0,${chartHeight} L${points} L${chartWidth},${chartHeight} Z`}
              fill="url(#gradient)"
              opacity="0.2"
            />
            
            {/* The Line */}
            <polyline
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points}
            />
            
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--cyan)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', color: 'var(--text-dim)', fontSize: '11px' }}>
           <span>30 days ago</span>
           <span>Today</span>
        </div>
      </div>
    </section>
  );
}
