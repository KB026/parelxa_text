/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import BillingPlans from '@/components/parlexa/BillingPlans';
import { Agent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function VendorBillingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let agents: Agent[] = [];
  let transactions: {
    id: number | string;
    created_at: string;
    amount: number;
    status: string;
    gateway_payment_id?: string;
  }[] = [];

  if (user) {
    const { data: vendorListings } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    
    agents = (vendorListings || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      pricing: a.pricing,
      rating: a.rating,
      isVerified: a.is_verified,
      isFeatured: a.is_featured,
      vendor_plan: (a as any).vendor_plan || 'free',
      vendor_plan_expires_at: (a as any).vendor_plan_expires_at || null,
      approval_status: a.approval_status,
    } as any));

    const { data: userTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    transactions = (userTransactions || []).map((t: any) => ({
      id: t.id,
      created_at: t.created_at || '',
      amount: t.amount,
      status: t.status,
      gateway_payment_id: t.gateway_payment_id || undefined
    }));
  }

  return (
    <section>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Billing & Plan</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your subscriptions and choose the best plan for tool growth.</p>
      </div>

      <BillingPlans initialAgents={agents} />

      <div style={{ marginTop: '56px', padding: '32px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Payment History</h4>
        
        {transactions.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
            <p style={{ color: 'var(--text-dim)', margin: 0 }}>No payment history found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Payment ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 12px' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 12px', fontWeight: 600 }}>₹{t.amount?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                        background: t.status === 'completed' || t.status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: t.status === 'completed' || t.status === 'success' ? '#4ade80' : '#f87171'
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                      {t.gateway_payment_id || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Can I cancel anytime?</div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>Yes, you can cancel your paid subscription at any time from your &quot;My Listings&quot; page. Your listing will remain active until the end of the billing cycle.</p>
        </div>
        <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>How does billing work?</div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>Annual plans are billed once per year with GST automatically calculated. All transactions are securely processed via Razorpay with encrypted payment protection.</p>
        </div>
      </div>
    </section>
  );
}
