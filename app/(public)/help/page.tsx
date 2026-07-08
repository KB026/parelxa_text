import React from 'react';

export default function HelpCenter() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white/[0.08] selection:text-[#EDEDED] py-24 px-6 sm:px-12">
      <article className="max-w-4xl mx-auto">
        
        {/* --- Header Section --- */}
        <header className="mb-16 border-b border-white/[0.08] pb-10">
          <h1 className="text-[#EDEDED] text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Help Center
          </h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed max-w-2xl">
            Everything you need to know about discovering, deploying, and listing AI agents on Parlexa.
          </p>
        </header>

        {/* --- Document Content --- */}
        <div className="space-y-12">
          
          {/* Section 1: For Users */}
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-6">
              For Users & Enterprises
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.04] transition-colors duration-300">
                <h3 className="text-[#EDEDED] text-lg font-semibold tracking-tight mb-2">
                  How do I compare tools?
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed text-sm">
                  Use the Parlexa comparison view to evaluate tools side-by-side. You can filter by deployment complexity, pricing models, and specific use cases like lead generation or route optimization.
                </p>
              </div>
              {/* Card 2 */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.04] transition-colors duration-300">
                <h3 className="text-[#EDEDED] text-lg font-semibold tracking-tight mb-2">
                  Saving & Bookmarking
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed text-sm">
                  Click the "Save" icon on any agent card to add it to your private dashboard. This allows you to build a curated stack of AI tools for your workforce.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: For Vendors */}
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-6">
              For Tool Vendors
            </h2>
            <div className="space-y-6">
              <div className="border-l border-white/[0.08] pl-6">
                <h3 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-3">
                  The Submission & Approval Process
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed mb-4">
                  To maintain the quality of the Parlexa directory, all submitted tools undergo a manual administrative review. Once submitted, your tool will appear in your vendor dashboard as <code className="text-[#71717A] bg-[#111111] px-2 py-1 rounded">pending</code> until approved.
                </p>
              </div>

              {/* Highlighted System Rule */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 ml-6">
                <h3 className="text-[#EDEDED] text-lg font-semibold tracking-tight mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Listing Edits & Status Syncing
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed text-sm">
                  If you edit the description, links, or media of an already approved tool, its status will automatically revert to pending for a quick security review. This protects our users from unauthorized link swapping.
                </p>
              </div>

              <div className="border-l border-white/[0.08] pl-6">
                <h3 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-3">
                  Understanding Your Analytics
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed">
                  Your vendor dashboard tracks two main metrics: <strong>Clicks</strong> (when a user clicks "Visit Website") and <strong>Leads</strong> (when a user saves your tool to their dashboard). These metrics operate on a zero-latency system and update in real-time.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: API & Other Resources */}
          <section className="pt-12 mt-12 border-t border-white/[0.08]">
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-6">
              Developer Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/docs" className="block p-4 border border-white/[0.08] rounded-lg text-center hover:bg-white/[0.04] transition-all">
                <span className="text-[#EDEDED] font-medium block mb-1">API Docs</span>
                <span className="text-[#71717A] text-xs uppercase tracking-widest">View Endpoints</span>
              </a>
              <a href="/guides" className="block p-4 border border-white/[0.08] rounded-lg text-center hover:bg-white/[0.04] transition-all">
                <span className="text-[#EDEDED] font-medium block mb-1">Guides</span>
                <span className="text-[#71717A] text-xs uppercase tracking-widest">Read Tutorials</span>
              </a>
              <a href="/blog" className="block p-4 border border-white/[0.08] rounded-lg text-center hover:bg-white/[0.04] transition-all">
                <span className="text-[#EDEDED] font-medium block mb-1">Blog</span>
                <span className="text-[#71717A] text-xs uppercase tracking-widest">Latest Updates</span>
              </a>
            </div>
          </section>

          {/* Contact Support */}
          <section className="pt-12">
            <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-8 text-center">
              <h2 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-2">
                Still need help?
              </h2>
              <p className="text-[#A1A1AA] mb-6">
                Our support team is available to help with custom enterprise deployments and vendor inquiries.
              </p>
              <a href="mailto:support@parlexa.in" className="inline-flex items-center justify-center px-6 py-3 bg-[#EDEDED] text-[#0A0A0A] font-medium rounded-lg hover:bg-white transition-colors">
                Contact Support
              </a>
            </div>
          </section>

        </div>
      </article>
    </main>
  );
}
