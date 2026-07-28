import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { getBundleBySlug, getBundlesList } from '@/lib/bundles-service';
import { CompositeBundleIcon, BundleDetailClient } from '@/components/parlexa/bundles';
import {
  Star,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  HelpCircle,
  ChevronRight,
  Sparkles,
  ArrowDown
} from 'lucide-react';

export async function generateStaticParams() {
  const bundles = await getBundlesList();
  return bundles.map((b) => ({
    slug: b.slug
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const bundle = await getBundleBySlug(params.slug);
  if (!bundle) return { title: 'Bundle Not Found | Parlexa' };

  return {
    title: `${bundle.name} Kit | Parlexa`,
    description: bundle.tagline
  };
}

export default async function BundleDetailPage({ params }: { params: { slug: string } }) {
  const bundle = await getBundleBySlug(params.slug);

  if (!bundle) {
    notFound();
  }

  const logos = bundle.tools_full.map(t => t.logo_url);
  const names = bundle.tools_full.map(t => t.name);

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans selection:bg-[#0EA5E9]/30 selection:text-white">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#0EA5E9]/15 via-[#8B5CF6]/10 to-transparent blur-3xl pointer-events-none" />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <Link href="/bundles" className="hover:text-white transition-colors">AI Bundles</Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="text-[#38BDF8] font-semibold">{bundle.name}</span>
        </div>

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              {bundle.category.toUpperCase()}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {bundle.headline}
            </h1>

            <p className="text-lg text-gray-300 font-medium leading-relaxed">
              {bundle.description}
            </p>

            {/* Stats Badge */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-gray-300">
              <div className="flex items-center gap-2 bg-[#121215] px-3.5 py-2 rounded-xl border border-white/10">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">{bundle.rating}</span>
                <span className="text-gray-500">({bundle.review_count} ratings)</span>
              </div>

              <div className="flex items-center gap-2 bg-[#121215] px-3.5 py-2 rounded-xl border border-white/10">
                <Layers className="w-4 h-4 text-[#38BDF8]" />
                <span className="font-bold text-white">{bundle.tool_count} Ready Tools</span>
              </div>
            </div>

            {/* 3 KEY BENEFITS CARDS */}
            <div className="pt-4 space-y-3">
              <h3 className="text-xs font-extrabold text-[#38BDF8] uppercase tracking-wider mb-3">
                Key Kit Advantages:
              </h3>
              {bundle.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121215] border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-[#0EA5E9]/10 text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-200 leading-snug">{benefit}</span>
                </div>
              ))}
              <p className="text-sm font-semibold text-[#38BDF8] pt-2">
                Everything above comes as one kit — no need to piece it together yourself.
              </p>
            </div>
          </div>

          {/* COMPOSITE ICON BANNER CARD */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 rounded-3xl bg-[#121215] border border-white/10 text-center space-y-6">
            <CompositeBundleIcon
              logos={logos}
              names={names}
              toolCount={bundle.tool_count}
              size="lg"
            />
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{bundle.name} Kit</h3>
              <p className="text-xs text-gray-400 font-medium">
                Pack of {bundle.tool_count} tools that work well together — grab the whole kit instead of picking one by one.
              </p>
            </div>
            <div className="w-full pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-[#38BDF8] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Ready-Made Tool Kit</span>
            </div>
          </div>
        </div>

        {/* WORKFLOW DIAGRAM SECTION */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              How These Tools Work Together
            </h2>
            <p className="text-sm text-gray-400">
              Each tool in the {bundle.name} Kit handles a step in the process seamlessly.
            </p>
          </div>

          {/* DESKTOP HORIZONTAL FLOW */}
          <div className="hidden lg:flex items-center justify-between gap-4 p-8 rounded-2xl bg-[#121215] border border-white/10">
            {bundle.tools_full.map((tool, idx) => {
              const isLast = idx === bundle.tools_full.length - 1;
              return (
                <React.Fragment key={tool.agent_id}>
                  <Link
                    href={`/products/${tool.slug}`}
                    className="flex-1 flex flex-col items-center text-center p-4 rounded-xl bg-[#18181C] border border-white/5 relative group hover:border-[#0EA5E9]/50 transition-all text-left"
                  >
                    <span className="absolute -top-3 w-6 h-6 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="w-10 h-10 mb-3 rounded-lg bg-[#09090B] p-1 border border-white/10 flex items-center justify-center mt-2 relative overflow-hidden">
                      {tool.logo_url ? (
                        <NextImage src={tool.logo_url} alt={tool.name} width={40} height={40} className="w-full h-full object-cover rounded" unoptimized loading="lazy" />
                      ) : (
                        <span className="font-bold text-[#38BDF8] text-sm">{tool.name.charAt(0)}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-[#38BDF8] transition-colors">{tool.name}</h4>
                    <span className="text-[11px] text-[#38BDF8] font-semibold">{tool.role_in_workflow}</span>
                  </Link>

                  {!isLast && (
                    <div className="flex items-center justify-center text-[#38BDF8] px-1 shrink-0">
                      <ArrowRight className="w-5 h-5 animate-pulse" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* MOBILE VERTICAL STACKED FLOW */}
          <div className="lg:hidden space-y-4">
            {bundle.tools_full.map((tool, idx) => {
              const isLast = idx === bundle.tools_full.length - 1;
              return (
                <div key={tool.agent_id} className="space-y-4">
                  <Link
                    href={`/products/${tool.slug}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#121215] border border-white/10 hover:border-[#0EA5E9]/50 transition-all relative block"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>

                    <div className="w-9 h-9 rounded-lg bg-[#18181C] p-1 border border-white/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                      {tool.logo_url ? (
                        <NextImage src={tool.logo_url} alt={tool.name} width={36} height={36} className="w-full h-full object-cover rounded" unoptimized loading="lazy" />
                      ) : (
                        <span className="font-bold text-[#38BDF8] text-sm">{tool.name.charAt(0)}</span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{tool.name}</h4>
                      <span className="text-xs text-[#38BDF8] font-medium">{tool.role_in_workflow}</span>
                    </div>
                  </Link>

                  {!isLast && (
                    <div className="flex justify-center text-[#38BDF8] py-1">
                      <ArrowDown className="w-5 h-5 animate-bounce" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* WHAT'S INCLUDED: TOOL CARDS GRID WITH ANALYTICS & DIRECT LINKS */}
        <BundleDetailClient
          bundleId={bundle.id}
          bundleSlug={bundle.slug}
          bundleName={bundle.name}
          tools={bundle.tools_full}
        />

        {/* TARGET AUDIENCE & ROI CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-[#121215] border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 text-[#38BDF8] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Who Needs This Kit?</h3>
            <div className="space-y-2">
              {bundle.who_needs_it.map((who, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-gray-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <span>{who}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#121215] border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 text-[#38BDF8] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Primary Use Case</h3>
            <p className="text-sm text-gray-300 font-medium leading-relaxed">
              {bundle.use_case}
            </p>
            <div className="pt-2">
              <span className="text-xs text-[#38BDF8] font-bold uppercase tracking-wider">
                Whole Kit Setup
              </span>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="p-8 sm:p-12 rounded-2xl bg-[#121215] border border-white/10 space-y-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#38BDF8]" />
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-[#18181C] border border-white/5 space-y-2">
              <h4 className="font-bold text-white">How do AI Kits work on Parlexa?</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Parlexa kits are ready-made tool packs built to work well together. Click any tool in the kit to view its dedicated page, pricing, and features.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#18181C] border border-white/5 space-y-2">
              <h4 className="font-bold text-white">Can I view tools individually?</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Yes! Every tool in a kit links directly to its own product page where you can read reviews, compare features, and visit vendor websites.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#18181C] border border-white/5 space-y-2">
              <h4 className="font-bold text-white">Is there any fee for browsing AI Kits?</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                No, browsing Parlexa AI Kits is 100% free for teams and software buyers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#18181C] border border-white/5 space-y-2">
              <h4 className="font-bold text-white">Are these tools tested for team workflows?</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                All tools included in Parlexa kits are curated for quality standards, integration capabilities, and real-world team productivity.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
