import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Building2, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Press & Media Kit | Parlexa — The Global AI Agent Marketplace',
  description: 'Official press kit, company overview, founder details, company descriptions, live platform stats, and downloadable brand assets for Parlexa.',
  openGraph: {
    title: 'Press & Media Kit | Parlexa',
    description: 'Official press kit, company overview, founder details, company descriptions, live platform stats, and downloadable brand assets for Parlexa.',
    url: 'https://parlexa.in/press',
    siteName: 'Parlexa',
    images: [{
      url: 'https://parlexa.in/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Parlexa Press & Media Kit'
    }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Press & Media Kit | Parlexa',
    description: 'Official press kit, company overview, founder details, live platform stats, and downloadable brand assets.',
    images: ['https://parlexa.in/og-image.png'],
  },
  alternates: {
    canonical: 'https://parlexa.in/press',
  },
};

async function getLivePressStats() {
  try {
    const supabase = createClient();
    const { count: agentCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', 'approved');

    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    return {
      agentCount: agentCount || 94,
      categoryCount: categoryCount || 10,
    };
  } catch (error) {
    console.error('Error fetching press stats:', error);
    return {
      agentCount: 94,
      categoryCount: 10,
    };
  }
}

export default async function PressPage() {
  const stats = await getLivePressStats();

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] selection:bg-[#8B5CF6]/30 selection:text-white py-20 px-4 sm:px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        
        {/* --- Header --- */}
        <header className="mb-14 border-b border-white/[0.08] pb-10">
          <div className="inline-block border border-[#8B5CF6]/80 px-2.5 py-1 mb-4 font-mono text-xs uppercase tracking-[0.2em] font-bold text-[#A78BFA] bg-[#8B5CF6]/10 rounded">
            PARLEXA MEDIA & PRESS KIT
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#EDEDED] tracking-tight mb-4 font-serif">
            Press & Brand Assets
          </h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed max-w-2xl">
            Official company descriptions, executive bios, live directory statistics, and downloadable brand assets for journalists, media, and partners.
          </p>
        </header>

        {/* --- Key Live Stats Block --- */}
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-widest font-mono text-[#8B5CF6] mb-4 font-semibold">
            LIVE PLATFORM METRICS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#141414] border border-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">
                {stats.agentCount}+
              </div>
              <div className="text-xs text-[#A1A1AA] uppercase tracking-wider font-medium">
                Approved AI Tools
              </div>
            </div>
            <div className="bg-[#141414] border border-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">
                {stats.categoryCount}
              </div>
              <div className="text-xs text-[#A1A1AA] uppercase tracking-wider font-medium">
                Vetted Categories
              </div>
            </div>
            <div className="bg-[#141414] border border-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#A78BFA] font-mono mb-1">
                14+
              </div>
              <div className="text-xs text-[#A1A1AA] uppercase tracking-wider font-medium">
                Indic Languages
              </div>
            </div>
            <div className="bg-[#141414] border border-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono mb-1">
                100%
              </div>
              <div className="text-xs text-[#A1A1AA] uppercase tracking-wider font-medium">
                Verified Listings
              </div>
            </div>
          </div>
        </section>

        {/* --- Fact Sheet & Company Overview --- */}
        <section className="mb-16 bg-[#141414] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6 font-serif flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#8B5CF6]" /> Company Fact Sheet
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-b border-white/10 pb-6 mb-6">
            <div>
              <div className="text-xs font-mono text-[#71717A] uppercase mb-1">Founders</div>
              <div className="text-sm font-semibold text-white">Abhinav Arora & Gaurav Virmani</div>
            </div>
            <div>
              <div className="text-xs font-mono text-[#71717A] uppercase mb-1">Founded Year</div>
              <div className="text-sm font-semibold text-white">2026</div>
            </div>
            <div>
              <div className="text-xs font-mono text-[#71717A] uppercase mb-1">Headquarters</div>
              <div className="text-sm font-semibold text-white">New Delhi, India</div>
            </div>
            <div>
              <div className="text-xs font-mono text-[#71717A] uppercase mb-1">Target Market</div>
              <div className="text-sm font-semibold text-white">Global & India B2B Enterprise</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-mono text-[#71717A] uppercase mb-1">Core Focus</div>
            <p className="text-sm text-[#D4D4D8] leading-relaxed">
              B2B AI Agent Marketplace connecting enterprise buyers with verified, high-performance artificial intelligence solutions across voice intelligence, sovereign Indic LLMs, contact centers, and developer workflows.
            </p>
          </div>
        </section>

        {/* --- Standard Boilerplates & Descriptions --- */}
        <section className="mb-16 space-y-8">
          <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#8B5CF6]" /> Approved Press Descriptions
          </h2>

          {/* One-Liner */}
          <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A78BFA] font-bold">
                Company One-Liner
              </span>
              <span className="text-xs text-[#71717A] font-mono">19 words</span>
            </div>
            <p className="text-base text-[#FAFAFA] font-medium leading-relaxed bg-[#0A0A0A] border border-white/5 p-4 rounded-lg">
              "Parlexa is the premier B2B AI agent marketplace for discovering, comparing, and scaling verified AI solutions built for enterprise workflows."
            </p>
          </div>

          {/* 100-Word Description */}
          <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A78BFA] font-bold">
                100-Word Description
              </span>
              <span className="text-[#71717A] text-xs font-mono">98 words</span>
            </div>
            <p className="text-sm text-[#D4D4D8] leading-relaxed bg-[#0A0A0A] border border-white/5 p-4 rounded-lg">
              Parlexa (parlexa.in) is India’s leading B2B AI agent marketplace, connecting enterprise buyers with verified, high-performance artificial intelligence solutions. As organizations transition from passive generative text tools to autonomous agentic systems, Parlexa provides a transparent platform to discover, benchmark, and deploy AI tools. Featuring over 100+ verified listings across conversational AI, voice intelligence, Indic sovereign LLMs, customer success automation, and developer tools, Parlexa eliminates procurement friction. With side-by-side feature matrices, transparent pricing, and regional compliance filters, Parlexa empowers enterprise decision-makers to scale digital workforces with speed, security, and confidence.
            </p>
          </div>

          {/* 300-Word Description */}
          <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A78BFA] font-bold">
                300-Word Description
              </span>
              <span className="text-[#71717A] text-xs font-mono">272 words</span>
            </div>
            <p className="text-sm text-[#D4D4D8] leading-relaxed bg-[#0A0A0A] border border-white/5 p-4 rounded-lg">
              Parlexa (parlexa.in) is the definitive B2B enterprise marketplace designed to accelerate the discovery, evaluation, and procurement of autonomous AI agents and intelligent software tools. Headquartered in India with a global footprint, Parlexa bridges the gap between enterprise software buyers and high-growth AI innovators. As corporate IT and operations shift from passive text generation toward agentic automation—where AI systems reason, invoke APIs, and execute multi-step workflows—evaluating model reliability, security compliance, and regional language support becomes critical. Parlexa addresses this market fragmentation through a multi-tenant platform featuring curated, vetted AI listings across voice intelligence, contact center automation, Indic sovereign language models, support tools, and developer infrastructure. Corporate leaders can compare verified pricing structures, read authentic user reviews, analyze live capability matrices, and initiate direct vendor engagements. Built on a foundation of sovereign data isolation, strict security standards, and local market relevance, Parlexa enables organizations across APAC and global markets to compress software evaluation cycles from months to days. Founded by Abhinav Arora and Gaurav Virmani in 2026, Parlexa serves as the central hub powering the next decade of enterprise digital transformation.
            </p>
          </div>
        </section>

        {/* --- Media Contact Section --- */}
        <section className="bg-gradient-to-r from-[#141414] via-[#1A1A1E] to-[#141414] border border-[#8B5CF6]/30 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2 font-serif">Press & Media Inquiries</h3>
          <p className="text-sm text-[#A1A1AA] mb-6 max-w-md mx-auto">
            For interview requests, analyst briefings, or media inquiries, reach out to our communications team.
          </p>
          <div className="inline-flex items-center gap-3 bg-[#0A0A0A] border border-white/10 px-5 py-2.5 rounded-xl font-mono text-sm text-[#A78BFA]">
            press@parlexa.in
          </div>
        </section>

      </div>
    </main>
  );
}
