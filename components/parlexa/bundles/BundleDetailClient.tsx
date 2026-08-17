'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ArrowRight, CheckCircle2, Zap, Sparkles, BookOpen, Lock } from 'lucide-react';
import { BundleToolFull } from '@/lib/bundles-service';
import { trackBundleView, trackBundleToolClick } from '@/lib/analytics/bundle-analytics';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from '@/components/parlexa/AuthModal';
import { BundlePlaybookModal } from './BundlePlaybookModal';

interface BundleDetailClientProps {
  bundleId: number;
  bundleSlug: string;
  bundleName: string;
  bundleTagline?: string;
  bundleCategory?: string;
  tools: BundleToolFull[];
}

export const BundleDetailClient: React.FC<BundleDetailClientProps> = ({
  bundleId,
  bundleSlug,
  bundleName,
  bundleTagline = '',
  bundleCategory = '',
  tools
}) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPlaybookModalOpen, setIsPlaybookModalOpen] = useState(false);

  useEffect(() => {
    // Fire bundle_view event on page load
    trackBundleView({
      bundle_id: bundleId,
      bundle_slug: bundleSlug
    });

    // Check user auth state
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [bundleId, bundleSlug]);

  const setBundleIntent = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('parlexa_bundle_intent', bundleSlug);
    }
  };

  const handleToolClick = (e: React.MouseEvent, agentId: number | string, toolSlug: string) => {
    trackBundleToolClick({
      bundle_id: bundleId,
      bundle_slug: bundleSlug,
      agent_id: agentId,
      tool_slug: toolSlug
    });

    if (!user) {
      // Guest: block direct navigation, force Auth Modal
      e.preventDefault();
      setBundleIntent();
      setIsAuthModalOpen(true);
    }
  };

  const handleDocsClick = () => {
    if (user) {
      router.push(`/bundles/${bundleSlug}/docs`);
    } else {
      setBundleIntent();
      setIsAuthModalOpen(true);
    }
  };

  const handleGetPlaybookClick = () => {
    if (user) {
      // Logged in: Open Playbook directly
      setIsPlaybookModalOpen(true);
    } else {
      // Guest: Open Auth Modal
      setBundleIntent();
      setIsAuthModalOpen(true);
    }
  };

  // Sort tools strictly by role_order
  const sortedTools = [...tools].sort((a, b) => a.role_order - b.role_order);

  return (
    <section className="mb-20 space-y-12">
      {/* PLAYBOOK ACTION CTA BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0EA5E9]/15 via-[#8B5CF6]/10 to-[#121215] border border-[#0EA5E9]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9]/20 text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Bundle Documentation Hub
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            {bundleName} Deployment Guide & Playbook
          </h3>
          <p className="text-sm text-gray-300 max-w-xl">
            Access full architecture documentation, step-by-step role specs, and instant email delivery.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDocsClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all"
          >
            <BookOpen className="w-4 h-4 text-[#38BDF8]" />
            <span>Read Bundle Docs</span>
          </button>

          <button
            onClick={handleGetPlaybookClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-extrabold text-xs hover:brightness-110 shadow-lg shadow-[#0EA5E9]/25 transition-all"
          >
            {!user && <Lock className="w-3.5 h-3.5" />}
            <span>{user ? 'View Playbook' : 'Sign In to Unlock'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WHAT'S INCLUDED IN THIS KIT */}
      <div>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-extrabold text-white">What's Included in this Kit</h2>
            <p className="text-sm text-gray-400 mt-1">Simple breakdown of each tool's role in the {bundleName} workflow.</p>
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
                  onClick={(e) => handleToolClick(e, tool.agent_id, tool.slug)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0EA5E9]/10 text-[#38BDF8] font-bold text-xs hover:bg-gradient-to-r hover:from-[#38BDF8] hover:to-[#0EA5E9] hover:text-slate-950 transition-all duration-200"
                >
                  {!user && <Lock className="w-3 h-3" />}
                  <span>{user ? 'View Product Page' : 'Sign In to Explore'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AUTH MODAL (FOR GUEST USERS) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="register"
      />

      {/* LIVE PLAYBOOK MODAL */}
      <BundlePlaybookModal
        isOpen={isPlaybookModalOpen}
        onClose={() => setIsPlaybookModalOpen(false)}
        bundleName={bundleName}
        bundleTagline={bundleTagline}
        bundleCategory={bundleCategory}
        tools={tools}
        userEmail={user?.email}
      />
    </section>
  );
};
