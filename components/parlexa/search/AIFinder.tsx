'use client';

import { useState, useMemo } from 'react';
import { Agent, Category } from '@/lib/types';
import { AgentCard } from '@/components/parlexa/AgentCard';

interface AIFinderProps {
  agents: Agent[];
  categories: Category[];
}

export function AIFinder({ agents, categories }: AIFinderProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    category: '',
    budget: '',
    techLevel: '',
    challenges: [] as string[]
  });

  const totalSteps = 4;

  const industries = categories.map(c => c.name);
  const budgets = [
    { label: 'Free / Community', value: 'free', icon: 'ðŸŽ' },
    { label: 'Budget-friendly (Under â‚¹10k)', value: 'budget', icon: 'ðŸŽŸï¸' },
    { label: 'Mid-range (â‚¹10k - â‚¹50k)', value: 'mid', icon: 'ðŸ¢' },
    { label: 'Enterprise / Custom', value: 'enterprise', icon: 'ðŸ›ï¸' }
  ];
  const techLevels = [
    { label: 'Non-Technical (No Code)', value: 'low', icon: 'ðŸ§’' },
    { label: 'Semi-Technical (Low Code)', value: 'mid', icon: 'ðŸ‘¨â€ðŸ’»' },
    { label: 'Advanced (Full API/Dev)', value: 'high', icon: 'ðŸ§™' }
  ];
  const commonChallenges = [
    'Automating customer support',
    'Scaling content creation',
    'Indic language support',
    'Predictive analytics',
    'Lead generation',
    'Workflow automation',
    'Reducing operational costs'
  ];

  const recommendations = useMemo(() => {
    if (step <= totalSteps) return [];

    // Simple matching algorithm
    return agents
      .map(agent => {
        let score = 0;
        
        // Category match
        if (agent.category === answers.category) score += 5;
        
        // Budget match
        const pricing = (agent.pricing || '').toLowerCase();
        if (answers.budget === 'free' && (pricing.includes('free') || pricing.includes('â‚¹0'))) score += 5;
        if (answers.budget === 'enterprise' && (pricing.includes('contact') || pricing.includes('custom'))) score += 5;
        
        // Challenge match (keyword search in summary/use cases)
        const summary = (agent.summary || '').toLowerCase();
        const useCases = (agent.useCases || '').toLowerCase();
        
        answers.challenges.forEach(challenge => {
          const lowerChallenge = challenge.toLowerCase();
          if (summary.includes(lowerChallenge) || useCases.includes(lowerChallenge)) {
            score += 2;
          }
        });

        return { agent, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(r => r.agent);
  }, [step, agents, answers]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);
  const handleRestart = () => {
    setStep(1);
    setAnswers({ category: '', budget: '', techLevel: '', challenges: [] });
  };

  if (step > totalSteps) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px' }}>Your AI Matches</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '18px' }}>Based on your needs, we found these {recommendations.length} tools for you.</p>
          <button onClick={handleRestart} style={{ 
            marginTop: '24px', background: 'transparent', border: '1px solid var(--border)', 
            color: 'var(--text-dim)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' 
          }}>
            â† Start Over
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {recommendations.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Progress Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '60px' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ 
            flex: 1, height: '4px', borderRadius: '2px', 
            background: s <= step ? 'var(--cyan)' : 'var(--bg-elevated)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>

      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        {step === 1 && (
          <div className="finder-step">
            <h2 style={{ fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>Which industry are you in?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {industries.map(ind => (
                <button 
                  key={ind}
                  onClick={() => { setAnswers({ ...answers, category: ind }); handleNext(); }}
                  style={{
                    padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: '16px', color: 'var(--text-white)', textAlign: 'center', cursor: 'pointer',
                    fontSize: '15px', fontWeight: 600, transition: 'all 0.2s',
                    borderColor: answers.category === ind ? 'var(--cyan)' : 'var(--border-subtle)'
                  }}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="finder-step">
            <h2 style={{ fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>What is your monthly budget?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {budgets.map(b => (
                <button 
                  key={b.value}
                  onClick={() => { setAnswers({ ...answers, budget: b.value }); handleNext(); }}
                  style={{
                    padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: '20px', color: 'var(--text-white)', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s', fontSize: '18px', fontWeight: 700
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{b.icon}</div>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="finder-step">
            <h2 style={{ fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>Your technical expertise?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {techLevels.map(t => (
                <button 
                  key={t.value}
                  onClick={() => { setAnswers({ ...answers, techLevel: t.value }); handleNext(); }}
                  style={{
                    padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: '16px', color: 'var(--text-white)', textAlign: 'left', cursor: 'pointer',
                    fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '20px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="finder-step">
            <h2 style={{ fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '16px' }}>Top challenges to solve?</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '40px' }}>Select all that apply</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px', marginBottom: '40px' }}>
              {commonChallenges.map(c => (
                <button 
                  key={c}
                  onClick={() => {
                    const next = answers.challenges.includes(c) 
                      ? answers.challenges.filter(x => x !== c)
                      : [...answers.challenges, c];
                    setAnswers({ ...answers, challenges: next });
                  }}
                  style={{
                    padding: '16px 20px', background: 'var(--bg-card)', 
                    border: '1px solid ' + (answers.challenges.includes(c) ? 'var(--cyan)' : 'var(--border-subtle)'),
                    borderRadius: '12px', color: 'var(--text-white)', textAlign: 'left', cursor: 'pointer',
                    fontSize: '14px', transition: 'all 0.2s'
                  }}
                >
                  {answers.challenges.includes(c) ? 'âœ“ ' : '+ '} {c}
                </button>
              ))}
            </div>
            <button 
              onClick={handleNext} 
              disabled={answers.challenges.length === 0}
              style={{
                width: '100%', padding: '16px', background: 'var(--cyan)', color: '#000',
                borderRadius: '12px', fontWeight: 700, fontSize: '16px', opacity: answers.challenges.length === 0 ? 0.5 : 1
              }}
            >
              Show Recommendations â†’
            </button>
          </div>
        )}

        {step > 1 && (
          <button onClick={handleBack} style={{ 
            display: 'block', margin: '32px auto 0', background: 'transparent', 
            border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '14px' 
          }}>
            â† Back
          </button>
        )}
      </div>
    </div>
  );
}
