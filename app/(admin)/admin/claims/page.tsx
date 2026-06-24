import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendClaimApproved } from '@/lib/email/actions';

type ClaimRow = {
  id: string;
  work_email: string;
  role: string;
  status: string;
  created_at: string;
  agent_id: number;
  user_id: string;
  agents?: { name?: string; website?: string; slug?: string; id?: number } | null;
};

export default async function AdminClaimsPage() {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('listing_claims')
    .select('*, agents(name, website, slug, id)')
    .order('created_at', { ascending: false });

  const claims = (data || []) as ClaimRow[];

  async function resolveClaim(formData: FormData) {
    'use server';
    const id = formData.get('id');
    const action = formData.get('action'); // 'approve', 'reject'
    const supabase = createClient();

    // 1. Fetch claim details
    const { data: claim } = await supabase
      .from('listing_claims')
      .select('*, agents(name)')
      .eq('id', id)
      .single();

    if (!claim) return;

    if (action === 'approve') {
      // Transfer ownership
      await supabase
        .from('agents')
        .update({ user_id: claim.user_id, is_maker_claimed: true })
        .eq('id', claim.agent_id);

      // Update status
      await supabase
        .from('listing_claims')
        .update({ status: 'approved' })
        .eq('id', id);

      // Notify user
      const agentName = (claim.agents as unknown as { name: string })?.name || 'your tool';
      await sendClaimApproved(claim.work_email, agentName);

      // Reject all other claims for this agent
      await supabase
        .from('listing_claims')
        .update({ status: 'rejected' })
        .eq('agent_id', claim.agent_id)
        .neq('id', id);

    } else {
      await supabase
        .from('listing_claims')
        .update({ status: 'rejected' })
        .eq('id', id);
    }

    revalidatePath('/admin/claims');
    revalidatePath('/admin/listings');
  }

  return (
    <section>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Listing Claims Queue</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage ownership requests and resolve maker disputes.</p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Tool / Website</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Claimant</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Submitted</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!claims || claims.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)' }}>No claim requests found.</td>
              </tr>
            ) : (claims || []).map(claim => (
              <tr key={claim.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 700, color: 'white' }}>{(claim.agents as unknown as { name: string })?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--cyan)' }}>{(claim.agents as unknown as { website: string })?.website}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ color: 'white', fontSize: '14px' }}>{claim.work_email}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{claim.role}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    background: claim.status === 'approved' ? 'rgba(16,185,129,0.1)' : 
                               claim.status === 'disputed' ? 'rgba(245,158,11,0.1)' : 'rgba(21,101,192,0.1)',
                    color: claim.status === 'approved' ? '#10b981' : 
                          claim.status === 'disputed' ? '#fb923c' : '#60a5fa'
                  }}>
                    {claim.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '13px' }}>
                  {new Date(claim.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '20px 24px' }}>
                  {['approved', 'rejected'].includes(claim.status) ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Resolved</span>
                  ) : (
                    <form action={resolveClaim} style={{ display: 'flex', gap: '8px' }}>
                      <input type="hidden" name="id" value={claim.id} />
                      <button name="action" value="approve" style={{ padding: '6px 12px', borderRadius: '6px', background: '#10b981', color: 'black', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Approve</button>
                      <button 
                        name="action" 
                        value="reject" 
                        style={{ 
                          padding: '6px 12px', borderRadius: '6px', background: 'transparent', 
                          color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', 
                          cursor: 'pointer', fontSize: '12px' 
                        }}
                      >
                        Reject
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
