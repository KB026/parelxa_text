'use client';
import { CompanySize, useAIFinderWizard } from '@/lib/hooks/useAIFinderWizard';
import { ArrowLeft, Loader2 } from 'lucide-react';

const sizes: { id: CompanySize; label: string; emoji: string; range: string }[] = [
  { id: 'solo', label: 'Solo / Freelancer', emoji: '🧑‍💻', range: 'Just me' },
  { id: 'startup', label: 'Startup', emoji: '🚀', range: '2–20 people' },
  { id: 'smb', label: 'Small Business', emoji: '🏪', range: '20–200 people' },
  { id: 'midmarket', label: 'Mid-Market', emoji: '🏢', range: '200–1000 people' },
  { id: 'enterprise', label: 'Enterprise', emoji: '🏛️', range: '1000+ people' },
];

export function Step3Size({ onBack }: { onBack: () => void }) {
  const { state, selectSize } = useAIFinderWizard();

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-sm text-blue-400 font-medium mb-1">Step 3 of 3</p>
        <h2 className="text-3xl font-bold mb-2">How big is your team?</h2>
        <p className="text-gray-400">We tailor recommendations to your scale</p>
      </div>
      <div className="space-y-3">
        {sizes.map(size => (
          <button
            key={size.id}
            onClick={() => selectSize(size.id)}
            disabled={state.loading}
            className="w-full p-4 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{size.emoji}</span>
              <div>
                <div className="font-semibold text-white group-hover:text-blue-400">
                  {size.label}
                </div>
                <div className="text-sm text-gray-500">{size.range}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {state.loading && (
        <div className="flex items-center justify-center gap-3 py-6 text-blue-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Finding your best matches...</span>
        </div>
      )}
      {state.error && (
        <div className="text-red-400 text-sm text-center">{state.error}</div>
      )}
    </div>
  );
}
