import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function AdminManagementPage() {
  const supabase = createClient();
  
  // Fetch all admins
  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .eq('is_admin', true)
    .order('created_at', { ascending: true });

  // Fetch all vendors to potentially promote
  const { data: otherProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('is_admin', false)
    .limit(20);

  async function toggleAdmin(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const makeAdmin = formData.get('action') === 'promote';
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_admin: makeAdmin,
        role: makeAdmin ? 'admin' : 'user'
      })
      .eq('id', id);

    if (error) {
      console.error('Role update failed:', error);
      return;
    }

    revalidatePath('/admin/settings/admins');
  }

  return (
    <section>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/settings" style={{ color: 'var(--text-dim)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          ← Back to Settings
        </Link>
        <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Admin Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Revoke or grant platform-wide administrative privileges.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Active Admins List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Active Team Members</h3>
          </div>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Name / Email</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Joined</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(adminProfiles || []).map(admin => (
                <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600, color: 'white' }}>{admin.full_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--cyan)' }}>{admin.email}</div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '13px' }}>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <form action={toggleAdmin}>
                      <input type="hidden" name="id" value={admin.id} />
                      <button 
                        name="action" value="demote"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        onClick={e => !confirm('Revoke admin access for this user?') && e.preventDefault()}
                      >
                        Revoke Access
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Promote New Admins */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Add Admin</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '20px' }}>Select a user to promote to the admin team.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(otherProfiles || []).map(profile => (
              <div key={profile.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{profile.full_name || 'No Name'}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '11px' }}>{profile.email}</div>
                </div>
                <form action={toggleAdmin}>
                  <input type="hidden" name="id" value={profile.id} />
                  <button 
                    name="action" value="promote"
                    style={{ background: 'var(--blue-primary)', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                  >
                    Add
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
