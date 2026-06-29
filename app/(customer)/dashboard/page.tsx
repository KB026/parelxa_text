import { getUserStats, getRecentlyViewed } from '@/lib/api';
import { AgentCard } from '@/components/parlexa/AgentCard';
import { createClient } from '@/lib/supabase/server';
import { Bookmark, Star, ArrowRightLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  const userStats = await getUserStats(user.id);
  const recentAgents = await getRecentlyViewed(user.id);
  
  const stats = [
    { label: 'Tools Saved', value: userStats.saved.toString(), icon: <Bookmark size={24} className="text-cyan-400" /> },
    { label: 'Reviews Written', value: userStats.reviews.toString(), icon: <Star size={24} className="text-orange-400" /> },
    { label: 'Comparisons Done', value: userStats.compares.toString(), icon: <ArrowRightLeft size={24} className="text-emerald-400" /> },
  ];

  return (
    <section>
      <div style={{ 
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(6,182,212,0.08) 100%)', 
        border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '40px', marginBottom: '48px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Explorer'}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
            Track your AI evaluations and manage your shortlisted tools in one place.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '56px' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
            borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Recently Viewed Tools</h3>
          <button style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Clear History</button>
        </div>
        <div className="agents-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {recentAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </section>
  );
}
