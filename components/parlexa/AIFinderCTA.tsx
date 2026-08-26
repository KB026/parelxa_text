'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function AIFinderCTA() {
  return (
    <section className="relative w-[calc(100%-2rem)] sm:w-full max-w-5xl mx-auto my-16 sm:my-24 md:my-32 rounded-3xl sm:rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] p-6 sm:p-12 md:p-20 overflow-hidden text-center flex flex-col items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[radial-gradient(circle_at_center,rgba(18,184,134,0.15)_0%,transparent_60%)] pointer-events-none blur-3xl z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-full">
        <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-brand-violet mb-4 sm:mb-6" />
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#EDEDED] mb-3 sm:mb-4">Command your AI Stack.</h2>
        <p className="text-sm sm:text-base md:text-lg text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-10 px-2">
          Our intelligent engine scans 10,000+ enterprise models to construct the perfect automated workflow for your specific use case.
        </p>
        
        <Link 
          href="/ai-finder" 
          className="bg-brand-violet text-white hover:bg-brand-violet-dark font-medium text-sm sm:text-base md:text-lg px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-lg hover:-translate-y-1 transition-all duration-300 shadow-[0_0_25px_rgba(139,92,246,0.3)]"
        >
          Run AI Matching Engine
        </Link>
      </div>
    </section>
  );
}
