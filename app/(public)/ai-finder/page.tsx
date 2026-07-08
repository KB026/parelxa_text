'use client';
import { useState } from 'react';
import Link from 'next/link';

type Step = 'industry' | 'problem' | 'size' | 'results';

const industries = [
  { id: 'saas', label: 'SaaS / Tech', emoji: '💻' },
  { id: 'marketing', label: 'Marketing & Sales', emoji: '📣' },
  { id: 'ecommerce', label: 'E-Commerce', emoji: '🛒' },
  { id: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { id: 'fintech', label: 'FinTech', emoji: '💳' },
  { id: 'hr', label: 'HR / Recruitment', emoji: '👥' },
  { id: 'logistics', label: 'Logistics', emoji: '🚚' },
  { id: 'agritech', label: 'AgriTech', emoji: '🌾' },
  { id: 'edtech', label: 'EdTech', emoji: '📚' },
  { id: 'content', label: 'Content Creation', emoji: '🎨' },
  { id: 'realestate', label: 'Real Estate', emoji: '🏢' },
  { id: 'other', label: 'Other', emoji: '🔧' },
];

const problems = [
  { id: 'leads', label: 'Generate More Leads', emoji: '🎯' },
  { id: 'support', label: 'Automate Customer Support', emoji: '🤖' },
  { id: 'content', label: 'Create Content Faster', emoji: '✍️' },
  { id: 'hire', label: 'Hire Better Talent', emoji: '🔍' },
  { id: 'ops', label: 'Optimize Operations', emoji: '⚙️' },
  { id: 'data', label: 'Analyze Data', emoji: '📊' },
  { id: 'software', label: 'Build Software Faster', emoji: '💻' },
  { id: 'costs', label: 'Reduce Costs', emoji: '💰' },
  { id: 'compliance', label: 'Improve Compliance', emoji: '🛡️' },
  { id: 'scale', label: 'Scale My Business', emoji: '🚀' },
];

const sizes = [
  { id: 'solo', label: 'Solo / Freelancer', emoji: '🧑💻' },
  { id: 'startup', label: 'Startup (2-20)', emoji: '🚀' },
  { id: 'smb', label: 'Small Business (20-200)', emoji: '🏪' },
  { id: 'midmarket', label: 'Mid-Market (200-1000)', emoji: '🏢' },
  { id: 'enterprise', label: 'Enterprise (1000+)', emoji: '🏛️' },
];

export default function AIFinderPage() {
  const [step, setStep] = useState<Step>('industry');
  const [selected, setSelected] = useState({ industry: '', problem: '', size: '' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getProgress = () => {
    if (step === 'results') return 100;
    if (step === 'size') return selected.size ? 90 : 66;
    if (step === 'problem') return selected.problem ? 66 : 33;
    if (step === 'industry') return selected.industry ? 33 : 10;
    return 10;
  };

  const handleIndustry = (id: string) => {
    setSelected({ ...selected, industry: id });
    setTimeout(() => setStep('problem'), 400);
  };

  const handleProblem = (id: string) => {
    setSelected({ ...selected, problem: id });
    setTimeout(() => setStep('size'), 400);
  };

  const handleSize = async (id: string) => {
    setSelected({ ...selected, size: id });
    setLoading(true);

    try {
      const res = await fetch('/api/ai-finder-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          industry: selected.industry, 
          problem: selected.problem, 
          size: id 
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch results');
      const { results } = await res.json();
      console.log('✅ Results received:', results);
      setResults(results);
      setStep('results');
    } catch (err) {
      console.error('❌ Error:', err);
      alert('Failed to get results. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('industry');
    setSelected({ industry: '', problem: '', size: '' });
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-5">

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#EDEDED] mb-4">Find Your Perfect AI Tool</h1>
          <p className="text-lg text-[#A1A1AA]">Answer 3 questions. Get matched to the best tools for your needs.</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#131418] h-2.5 rounded-full mb-8 overflow-hidden border border-white/5 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-brand-blue to-brand-fuchsia transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${getProgress()}%` }}
          >
          </div>
        </div>

        {/* STEP 1: INDUSTRY */}
        {step === 'industry' && (
          <div className="bg-[#131418] border border-white/5 rounded-3xl p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <h2 className="text-2xl font-semibold text-[#EDEDED] tracking-tight mb-8">What industry are you in?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {industries.map(ind => {
                const isSelected = selected.industry === ind.id;
                return (
                  <button
                    key={ind.id}
                    onClick={() => handleIndustry(ind.id)}
                    className={`p-5 rounded-2xl border transition-all duration-300 text-left group shadow-sm ${
                      isSelected 
                        ? 'border-brand-emerald bg-brand-emerald/10 shadow-[0_0_20px_rgba(18,184,134,0.3)] ring-2 ring-brand-emerald/50' 
                        : 'border-white/[0.08] bg-[#1C1C21] hover:border-brand-emerald hover:bg-brand-emerald/5 hover:shadow-[0_0_20px_rgba(18,184,134,0.15)]'
                    }`}
                  >
                    <div className="text-3xl mb-3 drop-shadow-md">{ind.emoji}</div>
                    <div className="font-semibold text-sm text-[#EDEDED] group-hover:text-white transition-colors">{ind.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: PROBLEM */}
        {step === 'problem' && (
          <div className="bg-[#131418] border border-white/5 rounded-3xl p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <button 
              onClick={() => setStep('industry')} 
              className="text-brand-violet hover:text-brand-violet-light transition-colors font-medium mb-6 text-sm flex items-center gap-1"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-semibold text-[#EDEDED] tracking-tight mb-8">What&apos;s your biggest challenge?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problems.map(prob => {
                const isSelected = selected.problem === prob.id;
                return (
                  <button
                    key={prob.id}
                    onClick={() => handleProblem(prob.id)}
                    className={`p-5 rounded-2xl border transition-all duration-300 text-left group shadow-sm ${
                      isSelected 
                        ? 'border-brand-violet bg-brand-violet/10 shadow-[0_0_20px_rgba(139,92,246,0.3)] ring-2 ring-brand-violet/50' 
                        : 'border-white/[0.08] bg-[#1C1C21] hover:border-brand-violet hover:bg-brand-violet/5 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl drop-shadow-md">{prob.emoji}</div>
                      <div className="font-semibold text-[15px] text-[#EDEDED] group-hover:text-white transition-colors">{prob.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: SIZE */}
        {step === 'size' && (
          <div className="bg-[#131418] border border-white/5 rounded-3xl p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <button 
              onClick={() => setStep('problem')} 
              className="text-brand-violet hover:text-brand-violet-light transition-colors font-medium mb-6 text-sm flex items-center gap-1"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-semibold text-[#EDEDED] tracking-tight mb-8">How big is your team?</h2>
            <div className="space-y-4">
              {sizes.map(size => {
                const isSelected = selected.size === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => handleSize(size.id)}
                    disabled={loading}
                    className={`w-full p-5 rounded-2xl border disabled:opacity-80 transition-all duration-300 text-left group shadow-sm ${
                      isSelected 
                        ? 'border-brand-violet bg-brand-violet/10 shadow-[0_0_20px_rgba(139,92,246,0.3)] ring-2 ring-brand-violet/50' 
                        : 'border-white/[0.08] bg-[#1C1C21] hover:border-brand-violet hover:bg-brand-violet/5 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl drop-shadow-md">{size.emoji}</span>
                      <div className="font-semibold text-[15px] text-[#EDEDED] group-hover:text-white transition-colors">{size.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {loading && <p className="text-center text-brand-violet font-medium mt-8 animate-pulse">Running Match Engine...</p>}
          </div>
        )}

        {/* RESULTS */}
        {step === 'results' && (
          <div className="bg-[#131418] border border-white/5 rounded-3xl p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#EDEDED] tracking-tight">Your Top Matches</h2>
              <button onClick={reset} className="text-brand-violet hover:text-brand-violet-light transition-colors font-medium text-sm border border-brand-violet/30 px-4 py-2 rounded-lg hover:bg-brand-violet/10">
                Start Over
              </button>
            </div>

            {results.length === 0 ? (
              <p className="text-[#A1A1AA] text-center py-12 text-lg">No tools found matching your exact criteria. Try adjusting your selections.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.slice(0, 4).map((agent, idx) => (
                  <div key={agent.id} className="relative flex flex-col p-6 rounded-2xl border border-white/[0.08] bg-[#1C1C21] hover:border-brand-violet/50 transition-all duration-300 group shadow-lg">
                    {idx === 0 && (
                      <div className="absolute -top-3 -left-2 z-10">
                        <div className="bg-gradient-to-r from-brand-blue to-brand-fuchsia text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                          Best Match
                        </div>
                      </div>
                    )}
                    
                    <h3 className="font-bold text-white text-xl mb-2 mt-2 group-hover:text-brand-violet transition-colors">{agent.name}</h3>
                    <p className="text-sm text-[#A1A1AA] mb-6 flex-1 line-clamp-3 leading-relaxed">{agent.summary}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-white/[0.05]">
                      <span className="text-brand-violet font-bold text-lg">{agent.match_score}% Match</span>
                      <Link href={`/products/${agent.slug}`} className="inline-flex items-center justify-center font-bold text-[#0A0A0A] rounded-lg px-5 py-2.5 transition-all duration-300 shadow-sm hover:brightness-110 bg-brand-violet text-white">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
