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
    <section className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-3 tracking-tight">
          Vendor Settings
        </h1>
        <p className="text-slate-400 text-lg font-medium">Manage your vendor account and team access.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        <div className="bg-[#0b1120]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50"></div>
          <h3 className="text-xl font-bold text-white mb-6">Account Information</h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">Organization Contact Name</label>
              <input 
                type="text" 
                value={profile.full_name} 
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">Primary Contact Email</label>
              <input 
                type="email" 
                value={profile.email} 
                readOnly
                className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <input 
                type="tel" 
                value={profile.phone || ''} 
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0b1120]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50"></div>
          <h3 className="text-xl font-bold text-white mb-6">Lister Notifications</h3>
          
          <div className="flex flex-col gap-4">
            {[
              { id: 'listings', label: 'Listing Status Changes', desc: 'Get notified when your tools are approved or rejected.' },
              { id: 'reviews', label: 'New Customer Reviews', desc: 'Alert me whenever a customer leaves feedback for my tools.' },
              { id: 'security', label: 'Security & Access Alerts', desc: 'Receive warnings about login attempts or profile changes.' },
            ].map(pref => (
              <label key={pref.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700 transition-all cursor-pointer group">
                <div>
                  <div className="font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">{pref.label}</div>
                  <div className="text-sm text-slate-400">{pref.desc}</div>
                </div>
                <div className="relative flex items-center">
                  <input 
                    type="checkbox"
                    checked={profile.notification_prefs[pref.id] || false}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      notification_prefs: { ...profile.notification_prefs, [pref.id]: e.target.checked } 
                    })}
                    className="w-6 h-6 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-[#0b1120]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50"></div>
          <h3 className="text-xl font-bold text-white mb-2">Team & Co-owners</h3>
          <p className="text-slate-400 text-sm mb-6">Add team members to help manage your AI listings.</p>
          
          <div className="p-8 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <span className="text-sm font-medium text-slate-400">Multi-user access is coming soon in the Enterprise plan.</span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="mt-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </section>
  );
}
