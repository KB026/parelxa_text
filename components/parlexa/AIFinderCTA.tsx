'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function AIFinderCTA() {
  return (
    <section className="relative w-full max-w-5xl mx-auto my-32 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] p-12 md:p-20 overflow-hidden text-center flex flex-col items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(18,184,134,0.15)_0%,transparent_60%)] pointer-events-none blur-3xl z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <Sparkles className="w-12 h-12 text-brand-violet mb-6" />
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#EDEDED] mb-4">Command your AI Stack.</h2>
        <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto mb-10">
          Our intelligent engine scans 10,000+ enterprise models to construct the perfect automated workflow for your specific use case.
        </p>
        
        <Link 
          href="/ai-finder" 
          className="bg-brand-violet text-white hover:bg-brand-violet-dark font-medium text-lg px-10 py-4 rounded-lg hover:-translate-y-1 transition-all duration-300"
        >
          Run AI Matching Engine
        </Link>
      </div>
    </section>
  );
}
