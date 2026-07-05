'use client';
import { CheckCircle2 } from 'lucide-react';

interface UseCasesSectionProps {
  useCases?: string;
}

export function UseCasesSection({ useCases }: UseCasesSectionProps) {
  if (!useCases) return null;

  // Split use cases by newlines or bullets if formatted that way
  const casesList = useCases.split('\n').filter(c => c.trim().length > 0);

  return (
    <section className="mt-8">
      <h4 className="text-xl font-bold mb-5 text-white">Top Use Cases</h4>
      <div className="bg-white/[0.02] rounded-2xl border border-white/5 border-l-4 border-l-cyan-500 p-6 shadow-sm">
        <ul className="list-none m-0 p-0 flex flex-col gap-4">
          {casesList.map((useCase, idx) => {
            // Clean up any existing markdown bullets
            const cleanText = useCase.replace(/^[-*]\s*/, '').trim();
            return (
              <li key={idx} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm leading-relaxed">{cleanText}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
