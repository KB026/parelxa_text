import React from 'react';

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white/[0.08] selection:text-[#EDEDED] py-24 px-6 sm:px-12">
      <div className="max-w-5xl mx-auto">
        
        {/* --- Header --- */}
        <header className="mb-16 border-b border-white/[0.08] pb-10">
          <h1 className="text-[#EDEDED] text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            The Parlexa Blog
          </h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed max-w-2xl">
            Insights on enterprise AI agents, multi-tenant directory infrastructure, and the evolution of digital workforces.
          </p>
        </header>

        {/* --- Featured Article (Hero Slot) --- */}
        <div className="mb-12 group cursor-pointer border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] rounded-xl overflow-hidden transition-all duration-300">
          <div className="p-8 md:p-12 flex flex-col justify-between min-h-[320px]">
            <div>
              <span className="text-[#71717A] text-xs uppercase tracking-widest font-mono block mb-4">
                Featured Article • July 2026
              </span>
              <h2 className="text-[#EDEDED] text-2xl md:text-4xl font-semibold tracking-tight group-hover:text-white transition-colors max-w-3xl mb-4">
                The Architecture Behind Zero-Latency B2B Analytics Trackers
              </h2>
              <p className="text-[#A1A1AA] leading-relaxed max-w-2xl text-sm md:text-base">
                How we decoupled tracking interactions from the UI execution loop using asynchronous fire-and-forget processes to eliminate frame drops for end users.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-[#71717A] text-sm">By Parlexa Engineering</span>
              <span className="text-[#EDEDED] text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Read Article →
              </span>
            </div>
          </div>
        </div>

        {/* --- Secondary Article Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Post 2 */}
          <div className="group cursor-pointer bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.04] transition-colors duration-300 flex flex-col justify-between min-h-[240px]">
            <div>
              <span className="text-[#71717A] text-xs uppercase tracking-widest font-mono block mb-3">
                Security • June 2026
              </span>
              <h3 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-2 group-hover:text-white">
                Securing Multi-Tenant Marketplaces with Supabase RLS
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed line-clamp-3">
                Deep dive into building isolated vendor scopes, mapping parameters to the user session contexts, and securing critical dashboard datasets against accidental leaks.
              </p>
            </div>
            <span className="text-[#EDEDED] text-sm font-medium mt-6 inline-block">Read post →</span>
          </div>

          {/* Post 3 */}
          <div className="group cursor-pointer bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.04] transition-colors duration-300 flex flex-col justify-between min-h-[240px]">
            <div>
              <span className="text-[#71717A] text-xs uppercase tracking-widest font-mono block mb-3">
                Operations • May 2026
              </span>
              <h3 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-2 group-hover:text-white">
                Preventing Unauthorized Changes: Status Sync Pipelines
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed line-clamp-3">
                Exploring the operational necessity of our Security Override logic—why updating an approved tool instantly reverts it to a pending verification queue.
              </p>
            </div>
            <span className="text-[#EDEDED] text-sm font-medium mt-6 inline-block">Read post →</span>
          </div>
        </div>

      </div>
    </main>
  );
}
