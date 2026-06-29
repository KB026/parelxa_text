'use client';
import { useAIFinderWizard } from '@/lib/hooks/useAIFinderWizard';
import { Step1Industry } from '@/components/parlexa/ai-finder/Step1Industry';
import { Step2Problem } from '@/components/parlexa/ai-finder/Step2Problem';
import { Step3Size } from '@/components/parlexa/ai-finder/Step3Size';
import { AIFinderResults } from '@/components/parlexa/ai-finder/AIFinderResults';
import { useEffect } from 'react';

export default function AIFinderPage() {
  const { state, goBack, reset } = useAIFinderWizard();

  useEffect(() => {
    console.log('📍 AIFinderPage: Current step =', state.step);
    console.log('📍 AIFinderPage: Current answers =', state.answers);
    console.log('📍 AIFinderPage: Has results =', !!state.results);
  }, [state.step, state.answers, state.results]);

  return (
    <div className="min-h-screen bg-gray-900 pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1 text-blue-400 text-sm font-medium mb-4">
            AI-Powered Discovery
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect AI Tool
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Answer 3 quick questions and our AI will match you with the best tools from Parlexa for your exact business needs.
          </p>
        </div>

        {/* Progress bar */}
        {!state.results && (
          <div className="flex gap-2 mb-10 max-w-xs mx-auto">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= state.step ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        )}

        {/* Wizard steps */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8" key={state.step}>
          {state.results ? (
            <AIFinderResults results={state.results} onReset={reset} />
          ) : (
            <>
              {state.step === 1 && <Step1Industry key="step1" />}
              {state.step === 2 && <Step2Problem key="step2" onBack={goBack} />}
              {state.step === 3 && <Step3Size key="step3" onBack={goBack} />}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
