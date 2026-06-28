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
      .eq('approval_status', 'approved'); // Only approved agents can be boosted
    
    agents = (vendorListings || []).map(a => ({
      id: a.id,
      name: a.name,
      category: a.category,
      pricing: a.pricing,
      rating: a.rating,
      isVerified: a.is_verified
    } as Agent));

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
                    <td style={{ padding: '16px 12px', fontWeight: 600 }}>₹{t.amount}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                        background: t.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: t.status === 'paid' ? '#10b981' : '#f59e0b'
                      }}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.gateway_payment_id || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: '32px', padding: '32px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Frequently Asked Questions</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>Can I cancel anytime?</div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>Yes, you can cancel your paid subscription at any time from your &quot;My Listings&quot; page. Your listing will remain active until the end of the billing cycle.</p>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>How does billing work?</div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>We process payments through secure gateways like Razorpay. Invoices will be generated and sent to your registered email address.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
