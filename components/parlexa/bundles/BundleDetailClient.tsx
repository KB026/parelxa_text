'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { BundleToolFull } from '@/lib/bundles-service';
import { trackBundleView, trackBundleToolClick } from '@/lib/analytics/bundle-analytics';

interface BundleDetailClientProps {
  bundleId: number;
  bundleSlug: string;
  bundleName: string;
  tools: BundleToolFull[];
}

export const BundleDetailClient: React.FC<BundleDetailClientProps> = ({
  bundleId,
  bundleSlug,
  bundleName,
  tools
}) => {
  useEffect(() => {
    // Fire bundle_view event on page load
    trackBundleView({
      bundle_id: bundleId,
      bundle_slug: bundleSlug
    });
  }, [bundleId, bundleSlug]);

  const handleToolClick = (agentId: number | string, toolSlug: string) => {
    trackBundleToolClick({
      bundle_id: bundleId,
      bundle_slug: bundleSlug,
      agent_id: agentId,
      tool_slug: toolSlug
    });
  };

  // Sort tools strictly by role_order
  const sortedTools = [...tools].sort((a, b) => a.role_order - b.role_order);

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-extrabold text-white">What's Included in this Kit</h2>
          <p className="text-sm text-gray-400 mt-1">Simple 2-line breakdown of each tool's role in the {bundleName} workflow.</p>
        </div>
        <span className="text-xs font-bold text-[#38BDF8] bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 px-3 py-1.5 rounded-full">
          {sortedTools.length} Sequential Steps
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedTools.map((tool) => (
          <div
            key={tool.agent_id}
            className="group bg-[#121215] border border-white/10 hover:border-[#0EA5E9]/50 rounded-2xl p-6 transition-all duration-300 space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Role Step Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 text-[#38BDF8] text-xs font-extrabold uppercase tracking-wider">
                  <span>Step {tool.role_order}:</span>
                  <span>{tool.role_name}</span>
                </span>

                <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 text-xs text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{tool.rating}</span>
                </div>
              </div>

              {/* Tool Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#18181C] p-1.5 border border-white/10 flex items-center justify-center shrink-0">
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="font-bold text-[#38BDF8] text-lg">{tool.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors duration-200">
                    {tool.name}
                  </h3>
                  <span className="text-xs text-gray-400 truncate block">
                    {tool.category || 'AI Software'}
                  </span>
                </div>
              </div>

              {/* 2 SIMPLE LINES OF INFORMATION */}
              <div className="p-4 rounded-xl bg-[#18181C] border border-white/5 space-y-3">
                {/* Line 1: What it does */}
                <div className="flex items-start gap-2.5 text-xs text-gray-200">
                  <Zap className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-[11px] uppercase tracking-wider mb-0.5">What it does:</span>
                    <span className="leading-relaxed text-gray-300 font-medium">{tool.what_it_does}</span>
                  </div>
                </div>

                {/* Line 2: Why in this step */}
                <div className="flex items-start gap-2.5 text-xs text-gray-200 pt-2 border-t border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-[11px] uppercase tracking-wider mb-0.5">Why in Step {tool.role_order}:</span>
                    <span className="leading-relaxed text-gray-300 font-medium">{tool.why_in_step}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Link & Pricing */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
              <span className="text-gray-400">
                Pricing: <strong className="text-white">{tool.pricing || 'Custom / Contact'}</strong>
              </span>

              <Link
                href={`/products/${tool.slug}`}
                onClick={() => handleToolClick(tool.agent_id, tool.slug)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0EA5E9]/10 text-[#38BDF8] font-bold text-xs hover:bg-gradient-to-r hover:from-[#38BDF8] hover:to-[#0EA5E9] hover:text-slate-950 transition-all duration-200"
              >
                <span>View Product Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
