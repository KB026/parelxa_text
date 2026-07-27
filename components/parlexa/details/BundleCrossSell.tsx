'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AgentBundleCrossSell } from '@/lib/bundles-service';
import { trackBundleToolClick } from '@/lib/analytics/bundle-analytics';

interface BundleCrossSellProps {
  crossSell: AgentBundleCrossSell;
}

export const BundleCrossSell: React.FC<BundleCrossSellProps> = ({ crossSell }) => {
  const { bundle, otherTools } = crossSell;

  if (!otherTools || otherTools.length === 0) return null;

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#121216] to-[#0A0A0E] border border-[#12B886]/30 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12B886]/10 text-[#12B886] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {bundle.category.toUpperCase()}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Part of the <span className="text-[#12B886]">{bundle.category}</span> Kit
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            {bundle.headline} — grab the whole kit instead of hunting for tools one by one.
          </p>
        </div>

        <Link
          href={`/bundles/${bundle.slug}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#12B886]/10 hover:bg-[#12B886] text-[#12B886] hover:text-black font-bold text-xs transition-all duration-200 border border-[#12B886]/30 shrink-0"
        >
          <span>Get the Full Kit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Bundle Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {otherTools.map((tool) => (
          <Link
            key={tool.agent_id}
            href={`/products/${tool.slug}`}
            onClick={() =>
              trackBundleToolClick({
                bundle_id: bundle.id,
                bundle_slug: bundle.slug,
                agent_id: tool.agent_id,
                tool_slug: tool.slug
              })
            }
            className="group flex flex-col justify-between p-4 rounded-xl bg-[#18181C] hover:bg-[#1E1E24] border border-white/5 hover:border-[#12B886]/50 transition-all duration-200 space-y-3"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#09090B] p-1 border border-white/10 flex items-center justify-center shrink-0">
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover rounded" />
                  ) : (
                    <span className="font-bold text-[#12B886] text-sm">{tool.name.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-[#12B886] transition-colors truncate">
                    {tool.name}
                  </h4>
                  <span className="text-[11px] font-semibold text-[#12B886] block truncate">
                    {tool.role_in_workflow}
                  </span>
                </div>
              </div>

              {tool.one_liner && (
                <p className="text-xs text-gray-400 line-clamp-2 italic leading-snug">
                  "{tool.one_liner}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-gray-400">
              <span className="truncate">{tool.pricing || 'Custom / Contact'}</span>
              <span className="text-[#12B886] font-bold group-hover:underline flex items-center gap-1">
                View <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
