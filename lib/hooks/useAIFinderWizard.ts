'use client';
import { useState, useCallback } from 'react';
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
  results: any[] | null;
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

  const selectIndustry = useCallback((industry: Industry) => {
    console.log('🔧 selectIndustry called with:', industry);
    setState(prev => {
      const newState = {
        ...prev,
        step: 2 as const,
        answers: { ...prev.answers, industry },
      };
      console.log('🔧 State updated to:', newState);
      return newState;
    });
  }, []);

  const selectProblem = useCallback((problem: BusinessProblem) => {
    console.log('🔧 selectProblem called with:', problem);
    setState(prev => ({
      ...prev,
      step: 3 as const,
      answers: { ...prev.answers, problem },
    }));
  }, []);

  const selectSize = useCallback(async (size: CompanySize) => {
    console.log('🔧 selectSize called with:', size);
    const answers = { ...state.answers, size };
    setState(prev => ({ ...prev, answers, loading: true, error: null }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch('/api/ai-finder-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'System temporarily unavailable');
      }
      
      const { results } = await res.json();
      console.log('✅ Results received:', results);
      setState(prev => ({ ...prev, results, loading: false }));
    } catch (err) {
      console.error('❌ Error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error && err.name === 'AbortError' 
          ? 'Request timed out. Please try again.' 
          : 'System temporarily unavailable. Please try again.',
      }));
    }
  }, [state.answers]);

  const goBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: prev.step > 1 ? ((prev.step - 1) as 1 | 2 | 3) : 1,
      error: null
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      step: 1,
      answers: { industry: null, problem: null, size: null },
      results: null,
      loading: false,
      error: null,
    });
  }, []);

  return { state, selectIndustry, selectProblem, selectSize, goBack, reset };
}
