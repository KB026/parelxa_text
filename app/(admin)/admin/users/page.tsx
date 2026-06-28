import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  industry: string | null;
  created_at: string;
  is_suspended: boolean;
  agents?: {
    count: number;
  }[];
};

export const dynamic = 'force-dynamic';

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  const query = searchParams.q || '';

  let fetchQuery = supabase
    .from('profiles')
    .select('*, agents:agents(count)')
    .order('created_at', { ascending: false });

  if (query) {
    fetchQuery = fetchQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  const { data: profiles } = await fetchQuery;

  // FIX: Added 'unknown' to safely cast the complex Supabase relational response
  const typedProfiles = (profiles ?? []) as unknown as Profile[];

  async function toggleSuspension(formData: FormData) {
    'use server';
    // FIX: Cast formData value to string
    const id = formData.get('id') as string;
    const isSuspended = formData.get('is_suspended') === 'true';
    const supabase = createClient();
    await supabase.from('profiles').update({ is_suspended: !isSuspended }).eq('id', id);
    revalidatePath('/admin/users');
  }

  async function verifyEmail(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    
    // Using service role for administrative tasks
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email_confirm: true
    });

    if (error) {
      console.error('Manual verification failed:', error);
      return;
    }

    revalidatePath('/admin/users');
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and moderate consumers and listers across the platform.</p>
        </div>
        <form style={{ display: 'flex', gap: '12px' }}>
          <input 
            name="q" 
            defaultValue={query}
            placeholder="Search name or email..." 
            style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'white', minWidth: '320px' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Search</button>
        </form>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>User Profile</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Industry</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Listings</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Joined</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {typedProfiles.map((profile: Profile) => (
              <tr key={profile.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                      overflow: 'hidden'
                    }}>
                      {profile.avatar_url ? <img src={profile.avatar_url} alt={`${profile.full_name || 'User'}'s avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'ðŸ‘¤'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'white' }}>{profile.full_name || 'Anonymous User'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--cyan)' }}>{profile.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>{profile.industry || 'Not set'}</td>
                <td style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>{(profile as unknown as { agents: { count: number }[] }).agents?.[0]?.count || 0}</td>
                {/* FIX: Handled the possibility of profile.created_at being null */}
                <td style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '13px' }}>{new Date(profile.created_at || Date.now()).toLocaleDateString()}</td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                    background: profile.is_suspended ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    color: profile.is_suspended ? '#f87171' : '#10b981'
                  }}>
                    {profile.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
                  </span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <form action={toggleSuspension}>
                      <input type="hidden" name="id" value={profile.id} />
                      <input type="hidden" name="is_suspended" value={String(profile.is_suspended)} />
                      <button type="submit" style={{ 
                        background: profile.is_suspended ? '#059669' : '#dc2626', 
                        color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', 
                        cursor: 'pointer', fontSize: '12px', fontWeight: 600 
                      }}>
                        {profile.is_suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </form>
                    <form action={verifyEmail}>
                      <input type="hidden" name="id" value={profile.id} />
                      <button type="submit" style={{ 
                        background: 'rgba(56,189,248,0.1)', 
                        color: 'var(--cyan)', border: '1px solid rgba(56,189,248,0.2)', padding: '8px 16px', borderRadius: '8px', 
                        cursor: 'pointer', fontSize: '12px', fontWeight: 600 
                      }}>
                        Verify
                      </button>
                    </form>
                    <Link href={`/admin/users/${profile.id}`} style={{ fontSize: '12px', color: 'var(--text-dim)', textDecoration: 'none' }}>Detail →</Link>
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
