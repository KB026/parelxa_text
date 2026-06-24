'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  full_name: string;
  email: string;
  avatar_url?: string;
  industry?: string;
  company_size?: string;
  notification_prefs: {
    [key: string]: boolean;
    new_tools: boolean;
    price_drops: boolean;
    review_responses: boolean;
  };
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) setProfile(data as Profile);
      else {
        // Fallback for new users if trigger didn't run
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          notification_prefs: { new_tools: true, price_drops: true, review_responses: true }
        });
      }
      setLoading(false);
    }
    loadProfile();
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
      });
      alert('Profile updated successfully!');
    }
    setSaving(false);
  };

  if (loading) return <p style={{ color: 'var(--text-dim)' }}>Loading profile...</p>;
  if (!profile) return <p style={{ color: 'var(--text-dim)' }}>Profile not found.</p>;

  return (
    <section style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal details and how we reach out to you.</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Personal Details */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Personal Details</h3>
          
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-secondary)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
              border: '2px solid var(--border-subtle)', overflow: 'hidden'
            }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : '👤'}
            </div>
            <button type="button" className="btn-secondary" style={{ padding: '10px 16px', borderRadius: '8px' }}>Change Photo</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-dim)' }}>Full Name</label>
              <input 
                type="text" 
                value={profile.full_name} 
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="input-field" 
                style={{ width: '100%' }} 
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-dim)' }}>Email Address</label>
              <input 
                type="email" 
                value={profile.email} 
                readOnly
                className="input-field" 
                style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} 
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-dim)' }}>Industry</label>
              <select 
                value={profile.industry || ''} 
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                className="input-field" 
                style={{ width: '100%' }}
              >
                <option value="">Select Industry</option>
                <option value="AgriTech">AgriTech</option>
                <option value="FinTech">FinTech</option>
                <option value="EdTech">EdTech</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Retail">Retail</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-dim)' }}>Company Size</label>
              <select 
                value={profile.company_size || ''} 
                onChange={(e) => setProfile({ ...profile, company_size: e.target.value })}
                className="input-field" 
                style={{ width: '100%' }}
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10 Employees</option>
                <option value="11-50">11-50 Employees</option>
                <option value="51-200">51-200 Employees</option>
                <option value="200+">200+ Employees</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Notification Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'new_tools', label: 'New tools in saved categories', desc: 'Alert me when a relevant new agent is listed.' },
              { id: 'price_drops', label: 'Price drops & offers', desc: 'Notify me of subscription discounts and trial expansions.' },
              { id: 'review_responses', label: 'Responses to my reviews', desc: 'Get alerted when a vendor replies to your feedback.' },
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

        <button 
          type="submit" 
          disabled={saving}
          className="btn-get-started" 
          style={{ width: 'fit-content', padding: '16px 40px', fontSize: '16px' }}
        >
          {saving ? 'Saving Changes...' : 'Save Settings'}
        </button>
      </form>
    </section>
  );
}
