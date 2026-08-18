'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AgentBundleCrossSell } from '@/lib/bundles-service';
import { trackBundleToolClick } from '@/lib/analytics/bundle-analytics';

interface BundleCrossSellProps {
  crossSell: AgentBundleCrossSell;
}

export const BundleCrossSell: React.FC<BundleCrossSellProps> = ({ crossSell }) => {
  const { bundle, currentToolRole, otherTools } = crossSell;

  if (!otherTools || otherTools.length === 0) return null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D11] border border-[#0EA5E9]/30 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            WORKS BEST WITH • {bundle.name.toUpperCase()}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Works Best With the <span className="text-[#38BDF8]">{bundle.name}</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
            This tool handles <strong className="text-white font-bold">{currentToolRole}</strong> in this journey — grab the whole kit instead of hunting for tools one by one.
          </p>
        </div>

        <Link
          href={`/bundles/${bundle.slug}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#0284C7] text-slate-950 font-extrabold text-xs transition-all duration-200 shadow-lg shadow-[#0EA5E9]/20 shrink-0"
        >
          <span>Get the Full Kit</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Ultra-Clean Minimalist Tool Grid (Logo + Name + Step) */}
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
            className="group flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#141419] hover:bg-[#1A1A22] border border-white/10 hover:border-[#0EA5E9]/50 transition-all duration-200 space-y-4"
          >
            <div className="space-y-3">
              {/* Step & Role Pill */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#38BDF8] uppercase tracking-wider truncate">
                  STEP {tool.role_order} • {tool.role_name}
                </span>
              </div>

              {/* Logo + Tool Name + Category */}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-11 h-11 rounded-xl bg-[#09090B] p-1.5 border border-white/10 flex items-center justify-center shrink-0 shadow-md relative overflow-hidden">
                  {tool.logo_url ? (
                    <Image src={tool.logo_url} alt={tool.name} width={44} height={44} className="w-full h-full object-cover rounded-lg" unoptimized loading="lazy" />
                  ) : (
                    <span className="font-bold text-[#38BDF8] text-base">{tool.name.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors truncate">
                    {tool.name}
                  </h4>
                  <span className="text-xs text-gray-400 block truncate mt-0.5">
                    {tool.category || 'AI Tool'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <span className="text-gray-400 truncate">{tool.pricing || 'Custom / Contact'}</span>
              <span className="text-[#38BDF8] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0">
                View <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
