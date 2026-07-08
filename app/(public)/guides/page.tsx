import React from 'react';

export default function GuidesIndex() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white/[0.08] selection:text-[#EDEDED] py-24 px-6 sm:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        
        {/* --- Sticky Side Navigation Matrix --- */}
        <aside className="w-full md:w-64 shrink-0 h-auto md:h-[calc(100vh-12rem)] md:sticky md:top-24 border-b md:border-b-0 md:border-r border-white/[0.08] pb-6 md:pb-0 md:pr-6">
          <span className="text-[#71717A] text-xs uppercase tracking-widest font-mono block mb-4">
            Documentation Sections
          </span>
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 md:gap-1 text-sm whitespace-nowrap">
            <a href="#getting-started" className="px-3 py-2 text-[#EDEDED] bg-white/[0.04] rounded-md font-medium text-left">Getting Started</a>
            <a href="#vendor-listings" className="px-3 py-2 text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-white/[0.02] rounded-md text-left transition-colors">Vendor Listings</a>
            <a href="#analytics-metrics" className="px-3 py-2 text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-white/[0.02] rounded-md text-left transition-colors">Analytics & Metrics</a>
            <a href="#compliance" className="px-3 py-2 text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-white/[0.02] rounded-md text-left transition-colors">Compliance Rules</a>
          </nav>
        </aside>

        {/* --- Core Informational Area --- */}
        <div className="flex-1 space-y-16">
          
          <header className="border-b border-white/[0.08] pb-8">
            <h1 className="text-[#EDEDED] text-4xl font-semibold tracking-tight mb-2">
              Platform Guides
            </h1>
            <p className="text-[#A1A1AA] text-base">
              Technical walkthroughs for configuring your agent pipelines and mastering the Parlexa environment.
            </p>
          </header>

          {/* Section: Getting Started */}
          <section id="getting-started" className="scroll-mt-24">
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              Getting Started with Parlexa
            </h2>
            <p className="text-[#A1A1AA] leading-relaxed mb-6">
              Welcome to the central AI Agent marketplace directory. As an ecosystem architect, you can traverse active tooling cards or set up vendor workspaces to monitor user discovery.
            </p>
            
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
              <h3 className="text-[#EDEDED] text-lg font-semibold mb-2">Initial Account Setup</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Connect your organization endpoint via our auth loop. If you are registering as a tool provider, ensure your developer tokens match your organization’s domain constraints before running programmatic listing updates.
              </p>
            </div>
          </section>

          {/* Section: Vendor Listings */}
          <section id="vendor-listings" className="scroll-mt-24">
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              Managing Vendor Listings
            </h2>
            <p className="text-[#A1A1AA] leading-relaxed mb-4">
              When launching metadata modifications, please keep structural pipeline parameters in mind.
            </p>
            <ul className="list-none space-y-4 pl-4 border-l border-white/[0.08]">
              <li className="text-[#A1A1AA] text-sm leading-relaxed">
                <strong className="text-[#EDEDED] font-medium block mb-1">Preventing Broken Wrappers:</strong> Card headers restrict category tag loops. Ensure custom badges respect the truncate configurations to avoid grid misalignment.
              </li>
              <li className="text-[#A1A1AA] text-sm leading-relaxed">
                <strong className="text-[#EDEDED] font-medium block mb-1">Administrative Re-evaluation:</strong> Any update made to live descriptions shifts the visibility state. The asset instantly transitions to pending tracking modes until security validations finish.
              </li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}
