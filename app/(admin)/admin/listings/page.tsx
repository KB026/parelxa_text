import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { sendListingStatusUpdate, sendFeaturedAlert } from '@/lib/email/actions';

export const dynamic = 'force-dynamic';

export default async function AdminListings({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const supabase = createClient();
  const statusFilter = searchParams.status || 'all';
  const query = searchParams.q || '';

  let fetchQuery = supabase
    .from('agents')
    .select('id, name, category, website, approval_status, is_verified, is_featured, is_pinned_trending, created_at, user_id, is_maker_claimed, listing_expires_at')
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    fetchQuery = fetchQuery.eq('approval_status', statusFilter);
  }
  if (query) {
    fetchQuery = fetchQuery.ilike('name', `%${query}%`);
  }

  const { data: listings } = await fetchQuery;

  async function updateStatus(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (!id) return;
    const status = formData.get('status') as 'approved' | 'rejected' | 'changes_requested';
    const feedback = formData.get('feedback') as string;
    const supabase = createClient();
    
    // 1. Force the status update FIRST so the UI always reflects approval
    const { error: updateError } = await supabase.from('agents').update({ 
      approval_status: status,
      admin_feedback: feedback || null
    }).eq('id', id);

    if (updateError) {
      console.error('Status Update Failed:', updateError);
      return;
    }

    // 2. Fetch the agent securely to see if a human author exists
    const { data: agentData } = await supabase
      .from('agents')
      .select('name, user_id')
      .eq('id', id)
      .single();

    const agent = agentData as { name?: string; user_id?: string | null } | null;

    if (agent?.user_id) {
       // Only query profiles if user_id formally exists (avoids null foreign key crashes for bot tools)
       const { data: profileData } = await supabase.from('profiles').select('email').eq('id', agent.user_id).single();
       const profile = profileData as { email?: string } | null;
       const vendorEmail = profile?.email;

       if (vendorEmail && (status === 'approved' || status === 'rejected' || status === 'changes_requested')) {
         const liveUrl = status === 'approved' ? `https://parlexa.in/products/${id}` : undefined;
         await sendListingStatusUpdate(vendorEmail, agent.name || 'your listing', status, { liveUrl, reason: feedback });
       }
    }

    revalidatePath('/admin/listings');
  }

  async function toggleFeatured(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (!id) return;
    const isFeatured = formData.get('is_featured') === 'true';
    const supabase = createClient();

    // 1. Fetch listing and user details
    const { data: agentData } = await supabase
      .from('agents')
      .select('name, user_id, profiles(email)')
      .eq('id', id)
      .single();

    const agent = agentData as { name?: string; user_id?: string | null; profiles?: { email?: string } | null } | null;

    if (!agent) return;

    // 2. Update status
    await supabase.from('agents').update({ is_featured: !isFeatured }).eq('id', id);
    
    // 3. Trigger Email if activating
    const vendorEmail = agent.profiles?.email;
    if (!isFeatured && vendorEmail) {
      await sendFeaturedAlert(vendorEmail, agent.name, false);
    }

    revalidatePath('/admin/listings');
  }

  async function toggleTrending(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (!id) return;
    const isPinned = formData.get('is_pinned') === 'true';
    const supabase = createClient();
    await supabase.from('agents').update({ is_pinned_trending: !isPinned }).eq('id', id);
    revalidatePath('/admin/listings');
    revalidatePath('/');
  }

  async function deleteListing(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (!id) return;
    const supabase = createClient();
    await supabase.from('agents').delete().eq('id', id);
    revalidatePath('/admin/listings');
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Manage Listings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Oversee all AI tool submissions and marketplace placement.</p>
        </div>
        <form style={{ display: 'flex', gap: '12px' }}>
          <input 
            name="q" 
            defaultValue={query}
            placeholder="Search tools..." 
            style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'white', minWidth: '240px' }}
          />
          <select 
            name="status" 
            defaultValue={statusFilter}
            style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'white' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="flagged">Flagged</option>
          </select>
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Filter</button>
        </form>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Tool Name</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase' }}>Source</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase' }}>Validity</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Trending</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Featured</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(listings || []).map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '20px 24px', maxWidth: '300px' }}>
                  <div style={{ fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name || ''}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ID: {item.id}</div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{item.category}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                    background: item.is_maker_claimed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 146, 60, 0.1)',
                    color: item.is_maker_claimed ? '#10b981' : '#fb923c',
                    border: `1px solid ${item.is_maker_claimed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 146, 60, 0.2)'}`
                  }}>
                    {item.is_maker_claimed ? 'MAKER CLAIMED' : 'SYSTEM LISTED'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '11px', color: item.listing_expires_at ? '#10b981' : 'var(--text-dim)' }}>
                    {item.listing_expires_at ? new Date(item.listing_expires_at).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    background: item.approval_status === 'approved' ? 'rgba(16,185,129,0.1)' : 
                                item.approval_status === 'changes_requested' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                    color: item.approval_status === 'approved' ? '#10b981' : 
                           item.approval_status === 'changes_requested' ? '#eab308' : '#f87171'
                  }}>
                    {item.approval_status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <form action={toggleTrending}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="is_pinned" value={String(item.is_pinned_trending)} />
                    <button type="submit" style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px',
                      color: item.is_pinned_trending ? '#fb923c' : 'var(--text-dim)'
                    }}>
                      {item.is_pinned_trending ? '🔥' : '⏻'}
                    </button>
                  </form>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <form action={toggleFeatured}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="is_featured" value={String(item.is_featured)} />
                    <button type="submit" style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px',
                      color: item.is_featured ? '#fb923c' : 'var(--text-dim)'
                    }}>
                      {item.is_featured ? '★' : '☆'}
                    </button>
                  </form>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <form action={updateStatus} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input type="hidden" name="id" value={item.id} />
                      <input 
                        name="feedback" 
                        placeholder="Reason/Feedback..." 
                        style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'white' }}
                      />
                      <button name="status" value="approved" style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '13px' }}>Approve</button>
                      <button name="status" value="changes_requested" style={{ background: 'none', border: 'none', color: '#eab308', cursor: 'pointer', fontSize: '13px' }}>Request</button>
                      <button name="status" value="rejected" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px' }}>Reject</button>
                    </form>
                    <Link href={`/admin/listings/${item.id}/edit`} style={{ color: 'var(--cyan)', fontSize: '13px', textDecoration: 'none' }}>Edit</Link>
                    <form action={deleteListing}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
