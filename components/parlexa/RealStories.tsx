'use client';

import React from 'react';

const themes = {
  emerald: { main: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', shadow: '0 0 40px rgba(16, 185, 129, 0.15)', badgeBg: 'rgba(16, 185, 129, 0.15)' },
  blue: { main: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', shadow: '0 0 40px rgba(56, 189, 248, 0.15)', badgeBg: 'rgba(56, 189, 248, 0.15)' },
  amber: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', shadow: '0 0 40px rgba(245, 158, 11, 0.15)', badgeBg: 'rgba(245, 158, 11, 0.15)' }
};

const stories = [
  {
    themeColor: 'emerald',
    caseId: 'CASE 01',
    category: 'D2C - FUNDRAISING',
    avatarStr: 'RK',
    name: 'Riya K.',
    role: 'D2C Skincare Founder • Pre-Series A',
    headline: 'The founder who needed to raise, but didn\'t know where to start',
    steps: [
      <React.Fragment key="1">Riya needs to raise ₹2Cr but doesn&apos;t know if she needs a pitch deck AI or investor database. <strong>She lands on Parlexa and searches &quot;fundraising&quot;.</strong></React.Fragment>,
      <React.Fragment key="2">Parlexa surfaces a curated set of AI tools — pitch deck generators, investor CRMs, and valuation assistants — each tagged by funding stage.</React.Fragment>,
      <React.Fragment key="3">She picks a <strong>pitch deck AI</strong> built for early-stage consumer brands, connects her metrics, and gets an investor-ready narrative in under an hour.</React.Fragment>,
      <React.Fragment key="4">She walks into investor meetings with a polished deck and the confidence she was missing before.</React.Fragment>
    ],
    outcome: 'Riya closes her seed round 6 weeks later. Parlexa helped her find the right tool for the right problem — fast.'
  },
  {
    themeColor: 'blue',
    caseId: 'CASE 02',
    category: 'B2B - LEAD GENERATION',
    avatarStr: 'AS',
    name: 'Arjun S.',
    role: 'Head of Sales, B2B SaaS - 40-person team',
    headline: 'The sales team with a pipeline problem they couldn\'t diagnose',
    steps: [
      <React.Fragment key="1">Arjun&apos;s team spends hours on cold outreach with poor conversion. <strong>He opens Parlexa and browses the &quot;lead generation&quot; category.</strong></React.Fragment>,
      <React.Fragment key="2">He explores three tools — a prospecting engine, a LinkedIn automator, and a lead scoring platform — comparing them side by side with Parlexa&apos;s comparison view.</React.Fragment>,
      <React.Fragment key="3">He selects the <strong>AI prospecting tool</strong> after reading reviews from similar B2B SaaS companies. Pilots it with his team in week one.</React.Fragment>,
      <React.Fragment key="4">The tool surfaces high-intent accounts his team had been missing entirely. Outreach volume drops, but <strong>qualified meetings double.</strong></React.Fragment>
    ],
    outcome: 'Pipeline quality improves within 30 days. The team stops chasing cold leads and starts closing warm ones.'
  },
  {
    themeColor: 'amber',
    caseId: 'CASE 03',
    category: 'LOGISTICS - OPERATIONS',
    avatarStr: 'PM',
    name: 'Priya M.',
    role: 'VP Operations, Logistics Co - 3 warehouses',
    headline: 'The ops director scaling fast with no AI roadmap in place',
    steps: [
      <React.Fragment key="1">Priya&apos;s company is expanding to two new cities. Manual routing won&apos;t scale. <strong>She opens Parlexa and searches &quot;logistics AI&quot;.</strong></React.Fragment>,
      <React.Fragment key="2">Parlexa surfaces tools for route optimisation, demand forecasting, warehouse automation, and fleet management — filterable by company size and deployment complexity.</React.Fragment>,
      <React.Fragment key="3">She reads <strong>verified reviews</strong> from ops teams at similar-sized companies. Two tools rise to the top based on real deployment experiences.</React.Fragment>,
      <React.Fragment key="4">She shortlists a <strong>route optimisation AI</strong> and a <strong>demand forecasting platform</strong>, pilots both, and rolls out the winner across all three warehouses.</React.Fragment>
    ],
    outcome: 'Delivery efficiency improves 22% in Q1. The expansion launches on schedule — no AI consultant needed.'
  }
];

export function RealStories() {
  return (
    <section style={{ maxWidth: '1440px', margin: '80px auto', padding: '0 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{ 
          display: 'inline-flex', padding: '6px 16px', background: 'rgba(56, 189, 248, 0.1)', 
          border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '20px', color: 'var(--cyan)', 
          fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px'
        }}>
          <span>✦</span> <span style={{ marginLeft: '6px' }}>Real Stories</span>
        </div>
        
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 800, color: '#fff', marginBottom: '16px', fontFamily: '"Space Grotesk", sans-serif' }}>
          How Businesses Win with Parlexa
        </h2>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
          From founders raising funds to logistics teams scaling operations — see Parlexa in action
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {stories.map((story, i) => {
          const t = themes[story.themeColor as keyof typeof themes];
          return (
            <div key={i} style={{ 
              background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
              borderTop: `3px solid ${t.main}`, position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', boxShadow: t.shadow
            }}>
              {/* Top ambient glow */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: `linear-gradient(to bottom, ${t.bg}, transparent)`, pointerEvents: 'none' }} />
              
              <div style={{ padding: '32px 32px 24px', flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <span style={{ background: t.main, color: '#000', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px' }}>{story.caseId}</span>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>{story.category}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: t.main, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '18px', fontWeight: 800, flexShrink: 0 }}>
                    {story.avatarStr}
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: 0 }}>{story.name}</h4>
                    <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: '4px 0 0' }}>{story.role}</p>
                  </div>
                </div>

                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '32px', lineHeight: 1.4 }}>
                  {story.headline}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {story.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', background: t.badgeBg, color: t.main, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 
                      }}>
                        {idx + 1}
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: t.badgeBg, padding: '24px 32px', position: 'relative', zIndex: 1 }}>
                <h5 style={{ color: t.main, fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✦</span> OUTCOME
                </h5>
                <p style={{ color: t.main, fontSize: '15px', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                  {story.outcome}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
