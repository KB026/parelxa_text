import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// 1. Define explicit interfaces for your data
interface Listing {
  id: string | number;
  name: string;
  category: string;
  approval_status: string;
}

interface Review {
  id: string | number;
  content: string;
  rating_overall: number;
  created_at: string;
  agents?: { name: string } | null;
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)  
    .single();

  if (!profile) {
    return redirect('/admin/users');
  }

  // 2. Fetch and cast user's listings to an array of Listing objects
  const { data: rawListings } = await supabase
    .from('agents')
    .select('id, name, category, approval_status')
    .eq('user_id', params.id);
  
  const listings: Listing[] = (rawListings as unknown as Listing[]) || [];

  // 3. Fetch and cast user's reviews to an array of Review objects
  const { data: rawReviews } = await supabase
    .from('reviews')
    .select('id, content, rating_overall, created_at, agents(name)')
    .eq('user_id', params.id);

  const reviews: Review[] = (rawReviews as unknown as Review[]) || [];

  return (
    <section>
      <div style={{ marginBottom: '40px' }}>
        <Link href="/admin/users" style={{ color: 'var(--text-dim)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          ← Back to Users
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-card)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
            border: '2px solid var(--border)', overflow: 'hidden'
          }}>
            {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: '32px', margin: 0 }}>{profile.full_name || 'Anonymous User'}</h1>
            <p style={{ color: 'var(--cyan)', fontSize: '16px' }}>{profile.email} · <span style={{ color: 'var(--text-dim)' }}>ID: {profile.id}</span></p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        {/* Sidebar: Profile Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>Account Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>Role</div>
                <div style={{ color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>{profile.role}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>Industry</div>
                <div style={{ color: 'white' }}>{profile.industry || 'Not specified'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>Member Since</div>
                {/* FIX: Handled the possibility of profile.created_at being null */}
                <div style={{ color: 'white' }}>{new Date(profile.created_at || Date.now()).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
              </div>
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ 
                  display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                  background: profile.is_suspended ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  color: profile.is_suspended ? '#f87171' : '#10b981'
                }}>
                  {profile.is_suspended ? 'SUSPENDED' : 'ACTIVE STATUS'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Listings & Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Listings */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
            {/* 4. JSX is much cleaner now since 'listings' is definitely an array */}
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Listings ({listings.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {listings.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>No tools listed by this user.</p>
              ) : listings.map((item: Listing) => (
                <Link key={item.id} href={`/admin/listings/${item.id}/edit`} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', textDecoration: 'none', border: '1px solid transparent'
                }}>
                  <div>
                    <div style={{ color: 'white', fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{item.category}</div>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>{item.approval_status} →</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Platform Reviews ({reviews.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>User has not written any reviews yet.</p>
              ) : reviews.map((review: Review) => (
                <div key={review.id} style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    {/* Simplified Agent name display since it is typed in the interface */}
                    <div style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: '14px' }}>
                      {review.agents?.name || 'Unnamed Agent'}
                    </div>
                    <div style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 700 }}>★ {review.rating_overall}</div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-white)', lineHeight: 1.6, marginBottom: '12px' }}>&quot;{review.content}&quot;</p>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Posted on {new Date(review.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}