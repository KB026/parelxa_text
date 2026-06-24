import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const supabase = createClient();
  
  try {
    // 1. Check if Supabase variables are even set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      throw new Error('CONFIG_MISSING');
    }

    // 2. Fetch real-time KPIs with individual error handling
    const [
      , // totalAgentsRes (unused)
      pendingAgentsRes,
      activeAgentsRes,
      rejectedAgentsRes,
      totalProfilesRes,
      vendorProfilesRes,
      pendingVerifRes,
      totalReviewsRes,
      pendingReportsRes
    ] = await Promise.all([
      supabase.from('agents').select('*', { count: 'exact', head: true }),
      supabase.from('agents').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
      supabase.from('agents').select('*', { count: 'exact', head: true }).eq('approval_status', 'approved'),
      supabase.from('agents').select('*', { count: 'exact', head: true }).eq('approval_status', 'rejected'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'vendor'),
      supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('moderation_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    // 3. Fetch Recent Activity (Safely)
    const [recentAgents, recentReviews, recentVerifs, recentReports] = await Promise.all([
      supabase.from('agents').select('name, created_at, approval_status').order('created_at', { ascending: false }).limit(4),
      supabase.from('reviews').select('content, created_at, agents(name)').order('created_at', { ascending: false }).limit(4),
      supabase.from('verification_requests').select('company_name, created_at').order('created_at', { ascending: false }).limit(4),
      supabase.from('moderation_reports').select('target_type, reason, created_at').order('created_at', { ascending: false }).limit(4)
    ]);

    const kpis = [
      { label: 'Live Tools', value: activeAgentsRes?.count || 0, color: '#34d399', link: '/admin/listings?status=approved' },
      { label: 'Pending Tools', value: pendingAgentsRes?.count || 0, color: '#fbbf24', link: '/admin/listings?status=pending' },
      { label: 'Rejected Tools', value: rejectedAgentsRes?.count || 0, color: '#f87171', link: '/admin/listings?status=rejected' },
      { label: 'Total Consumers', value: (totalProfilesRes?.count || 0) - (vendorProfilesRes?.count || 0), color: 'var(--cyan)', link: '/admin/users' },
      { label: 'Total Listers', value: vendorProfilesRes?.count || 0, color: '#60a5fa', link: '/admin/users' },
      { label: 'Pending Verif.', value: pendingVerifRes?.count || 0, color: '#818cf8', link: '/admin/verifications' },
      { label: 'New Reports', value: pendingReportsRes?.count || 0, color: '#ef4444', link: '/admin/moderation/reviews?status=reported' },
      { label: 'Total Reviews', value: totalReviewsRes?.count || 0, color: '#a78bfa' }
    ];

    const activities = [
      ...(recentAgents.data || []).map(a => ({
        time: a.created_at,
        action: `New ${a.approval_status} listing: ${a.name}`,
        type: 'listing',
        status: a.approval_status
      })),
      ...(recentReviews.data || []).map(r => ({
        time: r.created_at,
        action: `New feedback on ${(r.agents as unknown as { name: string })?.name || 'a tool'}`,
        type: 'review'
      })),
      ...(recentVerifs.data || []).map(v => ({
        time: v.created_at,
        action: `Verif. requested by ${v.company_name}`,
        type: 'verification'
      })),
      ...(recentReports.data || []).map(rep => ({
        time: rep.created_at,
        action: `Report filed: ${rep.reason} (${rep.target_type})`,
        type: 'report'
      }))
    ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()).slice(0, 10);

    return (
      <section>
        <div style={{ marginBottom: '40px' }}>
          <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Platform Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time marketplace health and operational metrics.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          {kpis.map((kpi, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px', position: 'relative' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px' }}>{kpi.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
              {kpi.link && (
                <Link href={kpi.link} style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '12px', color: 'var(--text-dim)', textDecoration: 'none' }}>View →</Link>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⚡</span> Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activities.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>No recent activity found.</p>
              ) : activities.map((activity, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-secondary)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' 
                  }}>
                    {activity.type === 'listing' ? '📦' : activity.type === 'review' ? '💬' : '✓'}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-white)' }}>{activity.action}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{new Date(activity.time || '').toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(56,189,248,0.05) 100%)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Link href="/admin/settings" style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '13px', textAlign: 'center', textDecoration: 'none', color: 'var(--text-white)', border: '1px solid var(--border-subtle)' }}>Settings</Link>
                <Link href="/admin/reports" style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '13px', textAlign: 'center', textDecoration: 'none', color: 'var(--text-white)', border: '1px solid var(--border-subtle)' }}>Reports</Link>
                <Link href="/admin/users" style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '13px', textAlign: 'center', textDecoration: 'none', color: 'var(--text-white)', border: '1px solid var(--border-subtle)' }}>Users</Link>
                <Link href="/admin/moderation/reviews" style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '13px', textAlign: 'center', textDecoration: 'none', color: 'var(--text-white)', border: '1px solid var(--border-subtle)' }}>Moderation</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Admin Dashboard Crash caught:', error.message);
    
    return (
      <div style={{ 
        background: 'var(--bg-card)', border: '1px solid #f87171', borderRadius: '24px', padding: '60px', 
        textAlign: 'center', marginTop: '40px' 
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚠️</div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Platform Connectivity Issue</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 32px' }}>
          {error.message === 'CONFIG_MISSING' 
            ? 'The application environment variables (Supabase URL/Key) are missing or misconfigured in this environment.' 
            : 'We were unable to connect to the platform database. Please ensure your Supabase instance is active and accessible.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/admin" style={{ padding: '12px 24px', background: 'var(--bg-secondary)', borderRadius: '12px', textDecoration: 'none', color: 'white', fontWeight: 600 }}>Try Again</Link>
          <Link href="/" style={{ padding: '12px 24px', background: 'transparent', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-dim)', border: '1px solid var(--border-subtle)' }}>Back to Site</Link>
        </div>
        <details style={{ marginTop: '40px', textAlign: 'left', opacity: 0.5 }}>
          <summary style={{ fontSize: '12px', color: 'var(--text-dim)', cursor: 'pointer' }}>Technical details</summary>
          <pre style={{ fontSize: '10px', color: '#f87171', marginTop: '12px', whiteSpace: 'pre-wrap' }}>{error.message}\n{error.stack}</pre>
        </details>
      </div>
    );
  }
}
