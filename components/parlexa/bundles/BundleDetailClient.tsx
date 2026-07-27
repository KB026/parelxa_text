'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
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

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-extrabold text-white">What's Included in this Kit</h2>
          <p className="text-sm text-gray-400 mt-1">Deep-dive into each pre-vetted solution in the {bundleName} kit.</p>
        </div>
        <span className="text-xs font-bold text-[#12B886] bg-[#12B886]/10 border border-[#12B886]/30 px-3 py-1.5 rounded-full">
          {tools.length} Tools Included
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.agent_id}
            className="group bg-[#121215] border border-white/10 hover:border-[#12B886]/50 rounded-2xl p-6 transition-all duration-300 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Tool Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#18181C] p-1.5 border border-white/10 flex items-center justify-center shrink-0">
                    {tool.logo_url ? (
                      <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="font-bold text-[#12B886] text-lg">{tool.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#12B886] transition-colors duration-200">
                      {tool.name}
                    </h3>
                    <span className="text-xs font-bold text-[#12B886]">
                      {tool.role_in_workflow}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 text-xs text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{tool.rating}</span>
                </div>
              </div>

              {/* One liner */}
              {tool.one_liner && (
                <p className="text-xs text-gray-300 italic line-clamp-2">
                  "{tool.one_liner}"
                </p>
              )}

              {/* Selection Reason */}
              <div className="p-3.5 rounded-xl bg-[#18181C] border border-white/5 space-y-1">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Why Included in Kit:
                </span>
                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  {tool.reason}
                </p>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12B886]/10 text-[#12B886] font-bold text-xs hover:bg-[#12B886] hover:text-black transition-all duration-200"
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
