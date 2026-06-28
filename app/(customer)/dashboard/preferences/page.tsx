/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Preferences {
  industries: string[];
  budget: string;
  useCases: string[];
  teamFocus?: string;
}

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Preferences>({
    industries: [],
    budget: 'Any',
    useCases: [],
    teamFocus: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient() as any;

  useEffect(() => {
    async function loadPrefs() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('ai_finder_prefs')
        .eq('id', user.id)
        .single();

      if (data?.ai_finder_prefs) setPrefs(data.ai_finder_prefs as Preferences);
      setLoading(false);
    }
    loadPrefs();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        ai_finder_prefs: prefs,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);
      alert('Preferences saved! Your recommendations will now be more personalized.');
    }
    setSaving(false);
  };

  const toggleSelection = (key: 'industries' | 'useCases', value: string) => {
    const current = prefs[key] || [];
    const updated = current.includes(value) 
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setPrefs({ ...prefs, [key]: updated });
  };

  if (loading) return <p style={{ color: 'var(--text-dim)' }}>Loading your preferences...</p>;

  return (
    <section style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>AI Finder Preferences</h1>
        <p style={{ color: 'var(--text-muted)' }}>Fine-tune how Parlexa recommends agents to your business.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* Industry Focus */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Target Industries</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '20px' }}>Select the industries you are most interested in for AI tool discovery.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['E-Commerce', 'FinTech', 'Healthcare', 'EdTech', 'AgriTech', 'SaaS', 'Real Estate', 'Media'].map(ind => {
              const isActive = prefs.industries.includes(ind);
              return (
                <button 
                  key={ind}
                  onClick={() => toggleSelection('industries', ind)}
                  style={{ 
                    padding: '10px 18px', borderRadius: '100px', 
                    background: isActive ? 'var(--cyan)' : 'var(--bg-secondary)',
                    color: isActive ? 'black' : 'var(--text-white)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--cyan)' : 'var(--border-subtle)',
                    fontWeight: 600, cursor: 'pointer', transition: '0.2s'
                  }}
                >
                  {ind}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Preferred Budget Model</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {['Any', 'Free', 'Under ₹5k', 'Enterprise'].map(b => {
              const isActive = prefs.budget === b;
              return (
                <button 
                  key={b}
                  onClick={() => setPrefs({ ...prefs, budget: b })}
                  style={{ 
                    padding: '16px', borderRadius: '16px', 
                    background: isActive ? 'rgba(6,182,212,0.1)' : 'var(--bg-card)',
                    color: isActive ? 'var(--cyan)' : 'var(--text-muted)',
                    border: '2px solid',
                    borderColor: isActive ? 'var(--cyan)' : 'var(--border-subtle)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>
                    {b === 'Any' ? '📊' : b === 'Free' ? 'ðŸŽ' : b === 'Under ₹5k' ? 'ðŸ’°' : 'ðŸ¢'}
                  </span>
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>What problem are you solving?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              'Customer Support Automation',
              'Internal Data Search',
              'Marketing Content Gen',
              'Sales Lead Qualification',
              'Supply Chain Analytics',
              'Legal & Compliance',
              'Candidate Screening',
              'Process Documentation'
            ].map(uc => {
              const isActive = prefs.useCases.includes(uc);
              return (
                <div 
                  key={uc}
                  onClick={() => toggleSelection('useCases', uc)}
                  style={{ 
                    padding: '16px 20px', borderRadius: '16px', 
                    background: 'var(--bg-card)', border: '1px solid',
                    borderColor: isActive ? 'var(--cyan)' : 'var(--border-subtle)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer', transition: '0.2s'
                  }}
                >
                  <div style={{ 
                    width: '20px', height: '20px', borderRadius: '4px', 
                    border: '2px solid', borderColor: isActive ? 'var(--cyan)' : 'var(--border-subtle)',
                    background: isActive ? 'var(--cyan)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                  }}>
                    {isActive && '✓'}
                  </div>
                  <span style={{ color: isActive ? 'var(--text-white)' : 'var(--text-muted)', fontWeight: 500 }}>{uc}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-get-started" 
            style={{ width: '100%', padding: '18px', fontSize: '18px' }}
          >
            {saving ? 'Updating AI Preferences...' : 'Save & Personalize Feed'}
          </button>
        </div>
      </div>
    </section>
  );
}
