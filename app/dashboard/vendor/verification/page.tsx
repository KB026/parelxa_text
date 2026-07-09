'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Check, Sparkles } from 'lucide-react';
import { AgentDB } from '@/lib/types';

export default function VerificationStatusPage() {
  const [listing, setListing] = useState<AgentDB | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadListing() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('id', { ascending: false })
        .limit(1)
        .single();
      
      if (data) setListing(data as AgentDB);
    }
    loadListing();
  }, [supabase]);

  const steps = [
    { title: 'Company Identity', desc: 'Verify your business registration and founders.', status: 'completed' },
    { title: 'Security Audit', desc: 'Basic data privacy and security questionnaire.', status: 'pending' },
    { title: 'Live Product Demo', desc: 'Short recorded walkthrough of the AI agent.', status: 'locked' },
    { title: 'Compliance Check', desc: 'Adherence to Indian AI regulatory guidelines.', status: 'locked' },
  ];

  return (
    <section>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Verification Status</h1>
        <p style={{ color: 'var(--text-muted)' }}>Get the &quot;Verified by Parlexa&quot; trust badge for your listing.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '40px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map((step, i) => (
            <div key={step.title} style={{ 
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
              borderRadius: '20px', padding: '24px', opacity: step.status === 'locked' ? 0.5 : 1,
              display: 'flex', gap: '24px', alignItems: 'center'
            }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '50%', 
                background: step.status === 'completed' ? 'var(--cyan)' : 'var(--bg-secondary)',
                color: step.status === 'completed' ? 'black' : 'var(--text-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                fontSize: '18px', flexShrink: 0
              }}>
                {step.status === 'completed' ? <Check className="w-5 h-5 text-black" /> : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>{step.title}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
              <div style={{ 
                padding: '6px 14px', borderRadius: '80px', fontSize: '12px', fontWeight: 700,
                background: step.status === 'completed' ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)',
                color: step.status === 'completed' ? 'var(--cyan)' : 'var(--text-dim)',
                textTransform: 'uppercase'
              }}>
                {step.status}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Card */}
        <aside style={{ 
          background: 'linear-gradient(180deg, rgba(6,182,212,0.1) 0%, transparent 100%)', 
          border: '1px solid var(--cyan)', borderRadius: '24px', padding: '32px' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cyan)', marginBottom: '16px' }}>Benefits of Verification</h3>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Exclusive "Verified" Badge',
              'Higher Ranking in search',
              '2.5x more click-through rate',
              'Priority in AI finder results',
              'Access to Featured Tool bids'
            ].map(benefit => (
              <li key={benefit} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--text-white)', alignItems: 'center' }}>
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" /> {benefit}
              </li>
            ))}
          </ul>
          {!listing?.is_verified && (
            <button 
              className="btn-get-started" 
              style={{ width: '100%', marginTop: '32px', padding: '16px' }}
            >
              Start Next Step
            </button>
          )}
        </aside>
      </div>

      <div style={{ marginTop: '56px', padding: '32px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Security & Privacy Compliance</h4>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
          Parlexa uses industry-standard verification protocols to ensure that all agents listed on our platform meet the highest security standards for Indian enterprises.
        </p>
      </div>
    </section>
  );
}
