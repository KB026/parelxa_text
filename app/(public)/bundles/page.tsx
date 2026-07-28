import React from 'react';
import Link from 'next/link';
import { getBundlesList } from '@/lib/bundles-service';
import { BundlesFilterClient } from '@/components/parlexa/bundles';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'AI Kits for Every Team | Parlexa',
  description: 'Ready-made kits of tools that work well together — grab the whole kit instead of picking one by one.'
};

export default async function BundlesOverviewPage() {
  const bundles = await getBundlesList();

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans selection:bg-[#0EA5E9]/30 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#0EA5E9]/15 via-[#8B5CF6]/10 to-transparent blur-3xl pointer-events-none" />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 text-[#38BDF8] text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            10 Ready-Made Kits
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI Kits for Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#0EA5E9] to-[#8B5CF6]">Team</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 font-medium leading-relaxed">
            Ready-made kits of tools that work well together — grab the whole kit instead of picking one by one.
          </p>

          {/* Quick Stats Grid */}
          <div className="pt-6 grid grid-cols-2 gap-4 max-w-lg mx-auto border-t border-white/10 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#38BDF8]">{bundles.length}</div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium mt-1">Ready-Made Kits</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#38BDF8]">1-Click</div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium mt-1">Click Straight Through to Every Tool</div>
            </div>
          </div>
        </div>

        {/* CLIENT FILTER & GRID COMPONENT */}
        <BundlesFilterClient bundles={bundles} />

        {/* VALUE PROPOSITION BANNER */}
        <div className="mt-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#121216] to-[#09090B] border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0EA5E9]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Looking for Specific AI Capabilities?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg mb-8">
            Explore our interactive AI finder to search, filter, and discover software solutions tailored to your team's workflow requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/ai-finder"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#0284C7] text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-[#0EA5E9]/20"
            >
              Use Interactive AI Finder
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all duration-200"
            >
              Browse All Agents
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
