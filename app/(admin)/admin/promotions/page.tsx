export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";
import { Handshake } from 'lucide-react';
import { authorizeManualPromotion } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";
import { Rocket } from 'lucide-react';

export default async function AdminPromotions() {
  const supabase = createClient();
  
  // 1. Fetch Stats
const { data: transactionsData } = await supabase
  .from('transactions')
  .select('*')
  .eq('status', 'completed');

const transactions = Array.isArray(transactionsData) ? transactionsData : [];

const totalRevenue = transactions.reduce(
  (sum, t) => sum + Number((t as { amount?: number | string }).amount || 0),
  0
);
  
  // 2. Fetch Active Promotions
  const { data: promotionsData } = await supabase
  .from('promotions')
  .select('*, agents(name, id)')
  .order('created_at', { ascending: false });

const promotions = Array.isArray(promotionsData) ? promotionsData : [];

  // 3. Fetch Agents for Manual Boost selection
const { data: allAgentsData } = await supabase
  .from('agents')
  .select('id, name')
  .eq('approval_status', 'approved')
  .order('name', { ascending: true });

const allAgents = Array.isArray(allAgentsData) ? allAgentsData : [];

  const activeCount = promotions.filter(
  (p) => (p as { status?: string }).status === 'active'
).length;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>Promotions & Revenue</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '16px' }}>Manage featured listings, oversee platform earnings, and handle manual partnership boosts.</p>
      </header>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Total Platform Revenue</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#fb923c' }}>₹{totalRevenue.toLocaleString()}</div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--green)' }}>All-time earnings from visibility boosts</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Active Promotions</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-white)' }}>{activeCount}</div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-dim)' }}>📈 Active visibility slots occupied</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Avg. Transaction</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--cyan)' }}>₹{(totalRevenue / (transactions?.length || 1)).toFixed(0)}</div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}><Handshake size={14} /> Value per boosted tool</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        {/* Active Promotions List */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Rocket size={20} /> Active Promotions
          </h2>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>Listing Name</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>Plan</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>Stats (Imp / Clicks)</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>End Date</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {promotions?.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px', fontSize: '14px', fontWeight: 600 }}>{p.agents?.name}</td>
                    <td style={{ padding: '20px' }}>
                      <span style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--bg-elevated)', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {p.plan}
                      </span>
                    </td>
                    <td style={{ padding: '20px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-white)' }}>{p.impressions || 0}</span>
                      <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>/</span>
                      <span style={{ color: 'var(--cyan)' }}>{p.clicks || 0}</span>
                    </td>
                    <td style={{ padding: '20px', fontSize: '13px', color: 'var(--text-dim)' }}>
                      {new Date(p.end_date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span style={{ 
                        fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px',
                        background: p.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                        color: p.status === 'active' ? 'var(--green)' : 'var(--text-dim)'
                      }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!promotions || promotions.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No promotions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Override Form */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Manual Visibility Boost</h2>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '24px' }}>Manual overrides are used for partner launches, marketing collaborations, or conflict resolution.</p>
            <form action={async (formData) => {
              'use server';
              const agentId = Number(formData.get('agent_id'));
              const plan = formData.get('plan') as 'weekly' | 'monthly';
              const reason = formData.get('reason') as string;
              
              const res = await authorizeManualPromotion({ agent_id: agentId, plan, reason });
              if (res.success) revalidatePath('/admin/promotions');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-white)', marginBottom: '8px' }}>Target Tool</label>
                <select name="agent_id" required style={{ width: '100%', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px' }}>
                  {allAgents?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-white)', marginBottom: '8px' }}>Duration</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ flex: 1, padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="plan" value="weekly" defaultChecked />
                    <span style={{ fontSize: '14px' }}>Weekly (7d)</span>
                  </label>
                  <label style={{ flex: 1, padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="plan" value="monthly" />
                    <span style={{ fontSize: '14px' }}>Monthly (30d)</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-white)', marginBottom: '8px' }}>Reason for Manual Boost</label>
                <textarea name="reason" rows={3} placeholder="e.g., Marketing partnership with founder..." style={{ width: '100%', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#fff', fontSize: '14px', resize: 'none' }}></textarea>
              </div>

              <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--cyan)', color: 'black', fontWeight: 700, border: 'none', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Rocket size={18} /> Authorize Visibility Boost
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
