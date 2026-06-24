import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendVerificationUpdate } from '@/lib/email/actions';

export const dynamic = 'force-dynamic';

export default async function AdminVerifications() {
  const supabase = createClient();

  // Fetch all pending/submitted verification requests with agent details
  const { data: requests } = await supabase
    .from('verification_requests')
    .select('*, agents:agent_id(id, name, category, website)')
    .in('status', ['submitted', 'under_review'])
    .order('created_at', { ascending: true });

  const queue = requests || [];

  async function approveVerification(formData: FormData) {
    'use server';
    const requestId = formData.get('request_id') as string;
    const agentId = formData.get('agent_id') as string;
    const supabase = createClient();

    // Update verification request status
    const { error: reqError } = await supabase
      .from('verification_requests')
      .update({ status: 'verified', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (reqError) {
      console.error('Error approving verification:', reqError);
      return;
    }

    // Set the agent as verified
    const { error: agentError } = await supabase
      .from('agents')
      .update({ is_verified: true })
      .eq('id', agentId);

    if (agentError) {
      console.error('Error updating agent verification:', agentError);
    }

    // Trigger Email
    try {
      const { data: req } = await supabase
        .from('verification_requests')
        .select('work_email, agents:agent_id(name)')
        .eq('id', requestId)
        .single();
      
      if (req?.work_email) {
        const agentName = (req.agents as unknown as { name: string })?.name || 'Your AI Agent';
        await sendVerificationUpdate(req.work_email, agentName, true);
      }
    } catch (e) {
      console.error('Email trigger failed:', e);
    }

    revalidatePath('/admin/verifications');
    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
  }

  async function rejectVerification(formData: FormData) {
    'use server';
    const requestId = formData.get('request_id') as string;
    const reason = formData.get('rejection_reason') as string;
    const supabase = createClient();

    if (!reason || reason.trim().length === 0) {
      console.error('Rejection reason is required');
      return;
    }

    const { error } = await supabase
      .from('verification_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) {
      console.error('Error rejecting verification:', error);
    }

    // Trigger Email
    try {
      const { data: req } = await supabase
        .from('verification_requests')
        .select('work_email, agents:agent_id(name)')
        .eq('id', requestId)
        .single();
      
      if (req?.work_email) {
        const agentName = (req.agents as unknown as { name: string })?.name || 'Your AI Agent';
        await sendVerificationUpdate(req.work_email, agentName, false, reason);
      }
    } catch (e) {
      console.error('Email trigger failed:', e);
    }

    revalidatePath('/admin/verifications');
    revalidatePath('/admin');
  }

  return (
    <section>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Verification Requests</h1>
        <p style={{ color: 'var(--text-muted)' }}>Review and approve verification applications to award the ✓ Verified badge.</p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
        {queue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-white)', marginBottom: '8px' }}>No pending verifications</h3>
            <p style={{ color: 'var(--text-muted)' }}>All verification requests have been processed.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {queue.map((req: {
              id: number;
              agent_id: number;
              company_name: string;
              gst_number: string;
              company_website: string;
              work_email: string;
              product_demo_url: string;
              press_mentions?: string;
              status: string;
              created_at: string;
              agents?: { id: number; name: string; category: string; website: string };
            }) => (
              <div
                key={req.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '24px',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-white)', margin: 0 }}>
                      {req.agents?.name || `Agent #${req.agent_id}`}
                    </h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
                      {req.agents?.category} · Submitted {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="cat-pill" style={{ background: '#1e3a5f', color: '#60a5fa' }}>
                    {req.status === 'submitted' ? 'New' : 'Under Review'}
                  </span>
                </div>

                {/* Submitted Documents */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Company Name</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-white)' }}>{req.company_name}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>GST Number</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-white)', fontFamily: 'monospace' }}>{req.gst_number}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Work Email</div>
                    <div style={{ fontSize: '14px', color: 'var(--cyan)' }}>{req.work_email}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Company Website</div>
                    <a href={req.company_website} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'var(--cyan)' }}>{req.company_website.replace('https://', '')}</a>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Product Demo</div>
                    <a href={req.product_demo_url} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'var(--cyan)' }}>View Demo →</a>
                  </div>
                  {req.press_mentions && (
                    <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Press Mentions</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{req.press_mentions}</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <form action={approveVerification}>
                    <input type="hidden" name="request_id" value={req.id} />
                    <input type="hidden" name="agent_id" value={req.agent_id} />
                    <button
                      type="submit"
                      style={{
                        background: 'linear-gradient(135deg, #059669, #047857)',
                        color: 'white', border: 'none', padding: '10px 20px',
                        borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      ✓ Approve & Award Badge
                    </button>
                  </form>
                  <form action={rejectVerification} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flex: 1 }}>
                    <input type="hidden" name="request_id" value={req.id} />
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Rejection Reason (required)</label>
                      <input
                        name="rejection_reason"
                        required
                        placeholder="Enter reason for rejection..."
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '10px',
                          border: '1px solid var(--border-subtle)', background: 'var(--bg-card)',
                          color: 'var(--text-white)', fontSize: '13px', outline: 'none'
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      style={{
                        background: '#dc2626', color: 'white', border: 'none',
                        padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap'
                      }}
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
