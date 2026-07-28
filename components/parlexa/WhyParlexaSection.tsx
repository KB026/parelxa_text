'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, BarChart3 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const WhyParlexa3DLogo = dynamic(
  () => import('./WhyParlexa3DLogo').then((mod) => mod.WhyParlexa3DLogo),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center p-8">
        <Image
          src="/icon.png"
          alt="Parlexa 3D Logo Loading Fallback"
          width={260}
          height={260}
          priority
          className="w-56 h-56 sm:w-72 sm:h-72 object-contain opacity-50 animate-pulse"
        />
      </div>
    ),
  }
);

export function WhyParlexaSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 85%',
      end: 'bottom 15%',
      scrub: 0.5,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#09090D] border-y border-white/[0.08] py-20 px-5 md:px-8 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Main Tilted Icon Showcase Split Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
          
          {/* Left Column: 3D Three.js Procedural Pentagon Logo Stage */}
          <div className="lg:col-span-5 flex flex-col items-start text-left w-full">
            
            {/* Header matching reference: "Introducing Parlexa" */}
            <div className="mb-6">
              <span className="text-[#12B886] font-medium text-lg sm:text-xl tracking-wide block mb-1 font-mono">
                Introducing
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-none">
                Parlexa
              </h2>
            </div>

            {/* Stage Container for 3D Three.js Logo */}
            <div className="relative w-full h-[360px] sm:h-[440px] rounded-2xl bg-black/30 border border-white/[0.06] flex flex-col items-center justify-center overflow-hidden">
              
              {/* Radial Backdrop Illumination Glow */}
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tr from-purple-600/30 via-indigo-500/20 to-blue-600/30 rounded-full blur-[100px] pointer-events-none" />

              {/* Dynamic 3D Three.js Procedural Logo Canvas */}
              <div className="relative z-10 w-full h-full">
                <WhyParlexa3DLogo />
              </div>

              {/* Dynamic Ground Shadow */}
              <motion.div
                animate={{
                  scale: [0.85, 1.1, 0.85],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="w-48 sm:w-64 h-8 bg-purple-900/40 rounded-[100%] blur-xl mt-4 pointer-events-none"
              />

            </div>

          </div>

          {/* Right Column: Multi-Paragraph Structured Copy */}
          <div className="lg:col-span-7 text-left space-y-6 lg:pt-16">
            
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-light">
              Parlexa is the premier B2B marketplace and discovery platform built specifically for enterprise artificial intelligence. Designed to streamline how organizations evaluate, procure, and scale autonomous software tools, Parlexa indexes over <strong className="text-white font-semibold">200+ verified AI agents</strong> across sales automation, contact centers, software engineering, financial auditing, and HR operations.
            </p>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-light">
              Every listing on Parlexa undergoes strict administrative vetting for data privacy standards, SOC2 compliance, API integration readiness, and active vendor maintenance. Decision-makers can leverage natural language neural search to match workflow requirements, inspect transparent pricing models, and benchmark performance with zero procurement risk.
            </p>

            {/* Quick Specs / Capabilities Strip */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/[0.08]">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-xl font-bold text-white font-mono">200+</div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">Verified AI Tools</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-xl font-bold text-[#12B886] font-mono">100%</div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">Admin Vetted</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-xl font-bold text-purple-400 font-mono">Neural</div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">Workflow Search</div>
              </div>
            </div>

          </div>

        </div>

        {/* --- Bottom Feature Cards Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-10 border-t border-white/[0.08]">
          <div className="bg-[#121218] p-6 rounded-xl border border-white/[0.06] hover:border-purple-500/30 transition-all duration-300">
            <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Vetted & Verified Listings
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every AI tool undergoes strict administrative auditing before listing, guaranteeing transparent features, privacy compliance, and integration readiness.
            </p>
          </div>
          <div className="bg-[#121218] p-6 rounded-xl border border-white/[0.06] hover:border-purple-500/30 transition-all duration-300">
            <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              Contextual AI Search
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our intelligent neural search engine analyzes operational requirements to match your stack directly with specialized AI agent solutions.
            </p>
          </div>
          <div className="bg-[#121218] p-6 rounded-xl border border-white/[0.06] hover:border-purple-500/30 transition-all duration-300">
            <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Enterprise-Grade Comparison
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Compare models, deployment methods, API capabilities, pricing tiers, and peer reviews to optimize your tech stack without procurement risk.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
