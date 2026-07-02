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

  const handleIndustry = (id: string) => {
    console.log('✅ Industry selected:', id);
    setSelected({ ...selected, industry: id });
    setStep('problem');
  };

  const handleProblem = (id: string) => {
    console.log('✅ Problem selected:', id);
    setSelected({ ...selected, problem: id });
    setStep('size');
  };

  const handleSize = async (id: string) => {
    console.log('✅ Size selected:', id);
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
    <div className="min-h-screen bg-gray-900 pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Perfect AI Tool</h1>
          <p className="text-gray-400">Answer 3 questions. Get matched to the best tools for your needs.</p>
        </div>

        {/* STEP 1: INDUSTRY */}
        {step === 'industry' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">What industry are you in?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {industries.map(ind => (
                <button
                  key={ind.id}
                  onClick={() => handleIndustry(ind.id)}
                  className="p-4 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition text-left"
                >
                  <div className="text-2xl mb-2">{ind.emoji}</div>
                  <div className="font-semibold text-sm text-white">{ind.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: PROBLEM */}
        {step === 'problem' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <button onClick={() => setStep('industry')} className="text-blue-400 hover:text-blue-300 mb-4 text-sm">
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">What&apos;s your biggest challenge?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {problems.map(prob => (
                <button
                  key={prob.id}
                  onClick={() => handleProblem(prob.id)}
                  className="p-4 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition text-left"
                >
                  <div className="text-2xl mb-2">{prob.emoji}</div>
                  <div className="font-semibold text-sm text-white">{prob.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: SIZE */}
        {step === 'size' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <button onClick={() => setStep('problem')} className="text-blue-400 hover:text-blue-300 mb-4 text-sm">
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">How big is your team?</h2>
            <div className="space-y-3">
              {sizes.map(size => (
                <button
                  key={size.id}
                  onClick={() => handleSize(size.id)}
                  disabled={loading}
                  className="w-full p-4 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{size.emoji}</span>
                    <div className="font-semibold text-white">{size.label}</div>
                  </div>
                </button>
              ))}
            </div>
            {loading && <p className="text-center text-blue-400 mt-6">Finding best matches...</p>}
          </div>
        )}

        {/* RESULTS */}
        {step === 'results' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Your Best Matches</h2>
              <button onClick={reset} className="text-blue-400 hover:text-blue-300 text-sm">
                Start Over
              </button>
            </div>

            {results.length === 0 ? (
              <p className="text-gray-400 text-center">No tools found. Try different selections.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.slice(0, 5).map((agent, idx) => (
                  <div key={agent.id} className="p-6 rounded-lg border border-gray-700 bg-gray-800/30 hover:border-blue-500 transition">
                    {idx === 0 && <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded mb-2 w-fit">Best Match</div>}
                    <h3 className="font-bold text-white text-lg mb-2">{agent.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{agent.summary}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 font-bold">{agent.match_score}% match</span>
                      <Link href={`/products/${agent.slug}`}>
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold">
                          View
                        </button>
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
