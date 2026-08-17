'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BundleFull } from '@/lib/bundles-service';
import { CompositeBundleIcon } from './CompositeBundleIcon';
import { Star, CheckCircle2, ArrowRight, Layers, Lock } from 'lucide-react';
import { trackBundleView } from '@/lib/analytics/bundle-analytics';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from '@/components/parlexa/AuthModal';

interface BundlesFilterClientProps {
  bundles: BundleFull[];
}

export const BundlesFilterClient: React.FC<BundlesFilterClientProps> = ({ bundles }) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingBundleSlug, setPendingBundleSlug] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser && pendingBundleSlug) {
        router.push(`/bundles/${pendingBundleSlug}`);
        setPendingBundleSlug(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [pendingBundleSlug, router]);

  const categories = [
    'All',
    'Retail & E-Commerce',
    'Marketing & Sales',
    'Enterprise & Automation',
    'HR & Workforce',
    'Developer Tools & Infra',
    'FinTech',
    'Healthcare',
    'EdTech'
  ];

  const filteredBundles = selectedCategory === 'All'
    ? bundles
    : bundles.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleKitClick = (e: React.MouseEvent, bundleId: number, slug: string) => {
    trackBundleView({
      bundle_id: bundleId,
      bundle_slug: slug
    });

    if (!user) {
      e.preventDefault();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('parlexa_bundle_intent', slug);
      }
      setPendingBundleSlug(slug);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="space-y-10">
      {/* CATEGORY TABS FILTER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-white/10">
        {categories.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-bold shadow-md shadow-[#0EA5E9]/20'
                  : 'bg-[#121215] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* BUNDLE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredBundles.map((bundle) => {
          const logos = bundle.tools_full.map(t => t.logo_url);
          const names = bundle.tools_full.map(t => t.name);
          const roleNames = (bundle.roles || []).map(r => r.role_name);

          return (
            <div
              key={bundle.slug}
              className="group relative flex flex-col bg-[#121215] hover:bg-[#16161A] border border-white/10 hover:border-[#0EA5E9]/50 rounded-2xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#0EA5E9]/5"
            >
              {/* Header: Composite Icon + Category Pill */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <CompositeBundleIcon
                  logos={logos}
                  names={names}
                  toolCount={bundle.tool_count}
                  size="md"
                />

                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#18181C] text-[#38BDF8] border border-[#0EA5E9]/30 uppercase tracking-wider">
                    {bundle.type === 'journey' ? 'JOURNEY KIT' : 'DEPARTMENT KIT'}
                  </span>
                  <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 text-xs text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{bundle.rating}</span>
                    <span className="text-gray-500 font-normal">({bundle.review_count})</span>
                  </div>
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-[#38BDF8] transition-colors duration-200 mb-2">
                  {bundle.name}
                </h3>
                <p className="text-sm text-gray-300 font-medium line-clamp-2 leading-relaxed mb-3">
                  "{bundle.tagline}"
                </p>

                {/* Journey Roles Sequence Pills */}
                {roleNames.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {roleNames.map((rn, idx) => (
                      <React.Fragment key={rn}>
                        <span className="text-[10px] font-bold text-gray-300 bg-[#18181C] px-2 py-0.5 rounded border border-white/10">
                          {rn}
                        </span>
                        {idx < roleNames.length - 1 && (
                          <span className="text-[10px] text-[#38BDF8] font-bold">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* Tool Count & Included Tools Preview */}
              <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs font-medium text-gray-400">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <Layers className="w-4 h-4 text-[#38BDF8]" />
                    <strong className="text-white font-bold">{bundle.tool_count} Sequential Steps</strong>
                  </span>
                  <span className="text-[#38BDF8] font-semibold">1 Tool per Role</span>
                </div>

                {/* Benefits List Preview */}
                <div className="space-y-1.5">
                  {bundle.benefits.slice(0, 2).map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link
                  href={`/bundles/${bundle.slug}`}
                  onClick={(e) => handleKitClick(e, bundle.id, bundle.slug)}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#18181C] group-hover:bg-gradient-to-r group-hover:from-[#38BDF8] group-hover:to-[#0EA5E9] text-white group-hover:text-slate-950 font-bold text-sm transition-all duration-200 border border-white/10 group-hover:border-[#0EA5E9]"
                >
                  {!user && <Lock className="w-3.5 h-3.5" />}
                  <span>{user ? 'Get This Kit' : 'Sign In to Access Kit'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="register"
      />
    </div>
  );
};
