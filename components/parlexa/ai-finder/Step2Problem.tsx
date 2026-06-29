'use client';
import { BusinessProblem, useAIFinderWizard } from '@/lib/hooks/useAIFinderWizard';
import { ArrowLeft } from 'lucide-react';

const problems: { id: BusinessProblem; label: string; emoji: string; desc: string }[] = [
  { id: 'generate-leads', label: 'Generate More Leads', emoji: '🎯', desc: 'Find and convert new customers' },
  { id: 'automate-support', label: 'Automate Customer Support', emoji: '🤖', desc: 'Handle queries 24/7 without human agents' },
  { id: 'create-content', label: 'Create Content Faster', emoji: '✍️', desc: 'Blog, social, video, ad copy at scale' },
  { id: 'hire-talent', label: 'Hire Better Talent', emoji: '🔍', desc: 'Screen resumes, shortlist, interview smarter' },
  { id: 'optimize-operations', label: 'Optimize Operations', emoji: '⚙️', desc: 'Cut costs, reduce manual work, streamline' },
  { id: 'analyze-data', label: 'Analyze Data & Reports', emoji: '📊', desc: 'Turn raw data into actionable insights' },
  { id: 'build-software', label: 'Build Software Faster', emoji: '💻', desc: 'AI coding, debugging, deployment tools' },
  { id: 'reduce-costs', label: 'Reduce Operating Costs', emoji: '💰', desc: 'Do more with less using AI automation' },
  { id: 'improve-compliance', label: 'Improve Compliance', emoji: '🛡️', desc: 'Stay audit-ready, reduce risk' },
  { id: 'scale-business', label: 'Scale My Business', emoji: '🚀', desc: 'Grow faster without growing headcount' },
];

export function Step2Problem({ onBack }: { onBack: () => void }) {
  const { selectProblem } = useAIFinderWizard();

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-sm text-blue-400 font-medium mb-1">Step 2 of 3</p>
        <h2 className="text-3xl font-bold mb-2">What is your biggest challenge?</h2>
        <p className="text-gray-400">Pick the problem you most urgently need to solve</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {problems.map(prob => (
          <button
            key={prob.id}
            onClick={() => selectProblem(prob.id)}
            className="p-4 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{prob.emoji}</span>
              <div>
                <div className="font-semibold text-sm text-white group-hover:text-blue-400">
                  {prob.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{prob.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
