/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface VendorProfile {
  full_name: string;
  email: string;
  phone: string;
  notification_prefs: {
    [key: string]: boolean;
    listings: boolean;
    reviews: boolean;
    security: boolean;
  };
}

export default function VendorSettingsPage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadVendorProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: (data as any).phone || '',
          notification_prefs: (data as any).notification_prefs || { listings: true, reviews: true, security: true }
        });
      }
      else {
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          notification_prefs: { listings: true, reviews: true, security: true }
        });
      }
      setLoading(false);
    }
    loadVendorProfile();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      } as any);
      alert('Settings updated successfully!');
    }
    setSaving(false);
  };

  if (loading) return <p style={{ color: 'var(--text-dim)' }}>Loading settings...</p>;
  if (!profile) return <p style={{ color: 'var(--text-dim)' }}>Settings not found.</p>;

  return (
    <section style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Vendor Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your vendor account and team access.</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Account Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-dim)' }}>Organization Contact Name</label>
              <input 
                type="text" 
                value={profile.full_name} 
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="input-field" 
                style={{ width: '100%' }} 
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-dim)' }}>Primary Contact Email</label>
              <input 
                type="email" 
                value={profile.email} 
                readOnly
                className="input-field" 
                style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} 
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-dim)' }}>Phone Number</label>
              <input 
                type="tel" 
                value={profile.phone || ''} 
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="input-field" 
                placeholder="+91 98765 43210"
                style={{ width: '100%' }} 
              />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Lister Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'listings', label: 'Listing Status Changes', desc: 'Get notified when your tools are approved or rejected.' },
              { id: 'reviews', label: 'New Customer Reviews', desc: 'Alert me whenever a customer leaves feedback for my tools.' },
              { id: 'security', label: 'Security & Access Alerts', desc: 'Receive warnings about login attempts or profile changes.' },
            ].map(pref => (
              <label key={pref.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>{pref.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{pref.desc}</div>
                </div>
                <input 
                  type="checkbox"
                  checked={profile.notification_prefs[pref.id] || false}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    notification_prefs: { ...profile.notification_prefs, [pref.id]: e.target.checked } 
                  })}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--cyan)' }}
                />
              </label>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Team & Co-owners</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '24px' }}>Add team members to help manage your AI listings.</p>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed var(--border-subtle)', textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Multi-user access is coming soon in the Enterprise plan.</span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="btn-get-started" 
          style={{ width: 'fit-content', padding: '16px 40px', fontSize: '16px' }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </section>
  );
}
