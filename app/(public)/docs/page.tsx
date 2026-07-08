import React from 'react';

export default function ApiDocs() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white/[0.08] selection:text-[#EDEDED] py-24 px-6 sm:px-12">
      <article className="max-w-4xl mx-auto">
        
        {/* --- Header Section --- */}
        <header className="mb-16 border-b border-white/[0.08] pb-10">
          <h1 className="text-[#EDEDED] text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            API Documentation
          </h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed max-w-2xl">
            Integrate Parlexa's enterprise AI directory and real-time vendor analytics directly into your workflows.
          </p>
        </header>

        {/* --- Document Content --- */}
        <div className="space-y-16">
          
          {/* Authentication Section */}
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4 border-b border-white/[0.08] pb-2">
              Authentication
            </h2>
            <p className="text-[#A1A1AA] leading-relaxed mb-6">
              All API requests require an active Bearer token. Vendor endpoints are strictly protected by Supabase Row Level Security (RLS) to ensure you can only access analytics and data for tools you own.
            </p>
            <div className="bg-[#111111] border border-white/[0.08] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <span className="text-[#71717A]">Authorization:</span> <span className="text-[#EDEDED]">Bearer YOUR_API_KEY</span>
            </div>
          </section>

          {/* Endpoints Section */}
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-6 border-b border-white/[0.08] pb-2">
              Core Endpoints
            </h2>
            <div className="space-y-8">
              
              {/* GET /agents */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest rounded uppercase">
                    Get
                  </span>
                  <code className="text-[#EDEDED] font-mono">/api/v1/agents</code>
                </div>
                <p className="text-[#A1A1AA] leading-relaxed mb-4 text-sm">
                  Retrieve a paginated list of all globally approved AI agents in the directory. You can filter by category, pricing model, or deployment complexity.
                </p>
              </div>

              {/* POST /vendor/tools */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold tracking-widest rounded uppercase">
                    Post
                  </span>
                  <code className="text-[#EDEDED] font-mono">/api/v1/vendor/tools</code>
                </div>
                <p className="text-[#A1A1AA] leading-relaxed mb-4 text-sm">
                  Submit a new AI tool for review. Note: Tools submitted via the API are automatically assigned a <code className="text-[#71717A] bg-[#111111] px-1 rounded">pending</code> status. If you update an existing approved tool, its status will temporarily revert to pending until administratively cleared.
                </p>
              </div>

              {/* GET /vendor/analytics */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest rounded uppercase">
                    Get
                  </span>
                  <code className="text-[#EDEDED] font-mono">/api/v1/vendor/analytics</code>
                </div>
                <p className="text-[#A1A1AA] leading-relaxed mb-4 text-sm">
                  Fetch your zero-latency interaction metrics. This endpoint returns aggregated <code className="text-[#EDEDED]">cta_click</code> (Top-of-Funnel Visits) and <code className="text-[#EDEDED]">lead_capture</code> (Saves/Bookmarks) events over a rolling 30-day window.
                </p>
              </div>

            </div>
          </section>

          {/* Rate Limiting & Usage Section */}
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4 border-b border-white/[0.08] pb-2">
              Rate Limits & Architecture
            </h2>
            <ul className="list-none space-y-4 pl-4 border-l border-white/[0.08]">
              <li className="text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#EDEDED] font-semibold">Client-Side Throttling:</strong> To prevent duplicate analytics logging, interaction endpoints enforce a strict 2000ms client-side execution lock.
              </li>
              <li className="text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#EDEDED] font-semibold">API Limits:</strong> Standard API requests are limited to 100 requests per minute per authenticated IP address. Exceeding this limit will trigger a 429 Too Many Requests response.
              </li>
            </ul>
          </section>

          {/* Code Example Section */}
          <section className="pt-8">
            <h2 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-4">
              Example Request
            </h2>
            <div className="bg-[#050505] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="bg-[#111111] px-4 py-2 border-b border-white/[0.08] flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                <span className="ml-4 text-xs text-[#71717A] font-mono">fetch-analytics.ts</span>
              </div>
              <pre className="p-4 text-sm font-mono text-[#A1A1AA] overflow-x-auto">
<code>{`const fetchMetrics = async () => {
  const response = await fetch('https://parlexa.in/api/v1/vendor/analytics', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  console.log(data);
  // { clicks: 1240, leads: 84, status: 200 }
};`}</code>
              </pre>
            </div>
          </section>

        </div>
      </article>
    </main>
  );
}
