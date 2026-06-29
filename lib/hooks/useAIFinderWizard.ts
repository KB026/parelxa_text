import { useState } from 'react';
import { Agent } from '../types';

export type Industry =
  | 'saas-tech'
  | 'marketing-sales'
  | 'ecommerce-retail'
  | 'healthcare'
  | 'fintech'
  | 'hr-recruitment'
  | 'logistics'
  | 'agritech'
  | 'edtech'
  | 'content-creation'
  | 'real-estate'
  | 'other';

export type BusinessProblem =
  | 'generate-leads'
  | 'automate-support'
  | 'create-content'
  | 'hire-talent'
  | 'optimize-operations'
  | 'analyze-data'
  | 'build-software'
  | 'reduce-costs'
  | 'improve-compliance'
  | 'scale-business';

export type CompanySize =
  | 'solo'
  | 'startup'
  | 'smb'
  | 'midmarket'
  | 'enterprise';

export interface WizardAnswers {
  industry: Industry | null;
  problem: BusinessProblem | null;
  size: CompanySize | null;
}

export interface AIFinderState {
  step: 1 | 2 | 3;
  answers: WizardAnswers;
  results: (Agent & { match_score?: number, match_reason?: string })[] | null;
  loading: boolean;
  error: string | null;
}

export function useAIFinderWizard() {
  const [state, setState] = useState<AIFinderState>({
    step: 1,
    answers: { industry: null, problem: null, size: null },
    results: null,
    loading: false,
    error: null,
  });

  const selectIndustry = (industry: Industry) =>
    setState(prev => ({
      ...prev,
      step: 2,
      answers: { ...prev.answers, industry },
    }));

  const selectProblem = (problem: BusinessProblem) =>
    setState(prev => ({
      ...prev,
      step: 3,
      answers: { ...prev.answers, problem },
    }));

  const selectSize = async (size: CompanySize) => {
    const answers = { ...state.answers, size };
    setState(prev => ({ ...prev, answers, loading: true, error: null }));

    try {
      const res = await fetch('/api/ai-finder-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      if (!res.ok) throw new Error('Matching failed');
      const { results } = await res.json();
      setState(prev => ({ ...prev, results, loading: false }));
    } catch (err) {
      console.error('Wizard match error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Something went wrong. Please try again.',
      }));
    }
  };

  const goBack = () =>
    setState(prev => ({
      ...prev,
      step: prev.step > 1 ? ((prev.step - 1) as 1 | 2 | 3) : 1,
    }));

  const reset = () =>
    setState({
      step: 1,
      answers: { industry: null, problem: null, size: null },
      results: null,
      loading: false,
      error: null,
    });

  return { state, selectIndustry, selectProblem, selectSize, goBack, reset };
}
