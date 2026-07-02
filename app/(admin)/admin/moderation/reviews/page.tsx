/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReviewModeration({
  searchParams,
}: {
  searchParams: { status?: string; agent_id?: string };
}) {
  const supabase = createClient();
  const filter = searchParams.status || 'reported';
  const agentId = searchParams.agent_id;

  let fetchQuery = supabase
    .from('reviews')
    .select('*, agents(name), profiles:user_id(full_name, email)')
    .order('created_at', { ascending: false });

  if (filter === 'reported') {
    fetchQuery = fetchQuery.eq('is_reported', true);
  }

  if (agentId) {
    fetchQuery = fetchQuery.eq('agent_id', Number(agentId));
  }

 const { data } = await fetchQuery;
const reviews = Array.isArray(data) ? data : [];;

  async function resolveReview(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const action = formData.get('action'); // 'keep' or 'remove'
    const supabase = createClient();

    if (action === 'remove') {
      // Log removal reason if we had a moderation_log table, for now just delete
      await supabase.from('reviews').delete().eq('id', id);
    } else {
       // Dismiss report
      await supabase.from('reviews').update({ is_reported: false, approval_status: 'approved' }).eq('id', id);
    }
    revalidatePath('/admin/moderation/reviews');
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Review Moderation</h1>
          <p style={{ color: 'var(--text-muted)' }}>Audit user feedback and resolve flagged content.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '4px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <a 
            href="/admin/moderation/reviews?status=reported" 
            style={{ 
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: 600,
              background: filter === 'reported' ? 'var(--bg-secondary)' : 'transparent',
              color: filter === 'reported' ? 'var(--cyan)' : 'var(--text-dim)'
            }}
          >
            Flagged
          </a>
          <a 
            href="/admin/moderation/reviews?status=all" 
            style={{ 
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: 600,
              background: filter === 'all' ? 'var(--bg-secondary)' : 'transparent',
              color: filter === 'all' ? 'var(--cyan)' : 'var(--text-dim)'
            }}
          >
            All Reviews
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {(reviews || []).length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '60px', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><Shield size={48} className="text-blue-400" /></div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>Moderation queue empty</h3>
            <p style={{ color: 'var(--text-muted)' }}>Great job! There are no flagged reviews that require attention.</p>
          </div>
        ) : (reviews || []).map(review => (
          <div key={review.id} style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '24px',
            display: 'grid', gridTemplateColumns: '1fr 200px', gap: '24px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ color: '#fbbf24' }}>★ {review.rating_overall}</span>
                <span style={{ color: 'var(--text-dim)' }}>·</span>
                <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>{(review.agents as unknown as { name: string })?.name}</span>
                <span style={{ color: 'var(--text-dim)' }}>·</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>by {(review.profiles as unknown as { full_name: string })?.full_name || 'Anonymous'}</span>
              </div>
              <p style={{ color: 'var(--text-white)', lineHeight: 1.6, marginBottom: '16px' }}>{review.content}</p>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', gap: '16px' }}>
                <span>Ease of use: {review.rating_ease_use}</span>
                <span>Value: {review.rating_value}</span>
                <span>Support: {review.rating_support}</span>
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <form action={resolveReview}>
                <input type="hidden" name="id" value={review.id} />
                <button 
                  name="action" value="keep"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}
                >
                  Keep Review
                </button>
                <input 
                  name="reason" 
                  placeholder="Reason for removal..." 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'white', fontSize: '12px', marginBottom: '8px' }}
                />
                <button 
                  name="action" value="remove"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                  onClick={e => !confirm('Delete this review permanently?') && e.preventDefault()}
                >
                  Remove Content
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
