"use client";

import React, { useRef } from "react";
import { motion, useScroll } from "framer-motion";

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Tracks the scroll progress within this specific container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  return (
    <section className="bg-[#0A0A0A] py-32 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-24">
          <span className="text-brand-violet font-mono text-sm uppercase tracking-widest mb-4 block">
            // How it works
          </span>
          <h2 className="text-[#EDEDED] text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            From search to demo in three steps
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
            The order matters — each step narrows the field until you're only talking to AI vendors worth your time.
          </p>
        </div>

        {/* Timeline Container */}
        <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
          
          {/* 
            THE ANIMATED CURVED SVG LINE 
            This SVG creates a winding "S" curve down the center of the steps.
            It is hidden on mobile (hidden md:block) because curved SVG alignment breaks on small screens.
          */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[400px] hidden md:block z-0 pointer-events-none">
            <svg
              viewBox="0 0 400 800"
              fill="none"
              className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              {/* Background Faint Track */}
              <path
                d="M 200,50 C 350,200 350,300 200,450 C 50,600 50,700 200,800"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* The Drawing Line controlled by scroll */}
              <motion.path
                d="M 200,50 C 350,200 350,300 200,450 C 50,600 50,700 200,800"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                style={{ pathLength: scrollYProgress }}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#12B886" />
                  <stop offset="100%" stopColor="#3ED6A4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* The Steps */}
          <div className="relative z-10 flex flex-col gap-24 md:gap-40">
            
            {/* Step 01 - Left Aligned */}
            <div className="flex flex-col md:flex-row items-center md:justify-start w-full">
              <div className="md:w-1/2 md:pr-16 text-center md:text-right">
                <div className="w-16 h-16 rounded-full bg-[#111111] border border-white/[0.08] flex items-center justify-center mx-auto md:ml-auto md:mr-0 mb-6 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                  <span className="text-brand-violet font-mono text-xl">01</span>
                </div>
                <h3 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-3">
                  Search or describe your need
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed">
                  Use the AI Finder or browse by category — sales, support, voice, content, and more.
                </p>
              </div>
              <div className="hidden md:block w-1/2"></div>
            </div>

            {/* Step 02 - Right Aligned (The curve points here) */}
            <div className="flex flex-col md:flex-row-reverse items-center md:justify-start w-full mt-8 md:mt-0">
              <div className="md:w-1/2 md:pl-16 text-center md:text-left">
                <div className="w-16 h-16 rounded-full bg-[#111111] border border-white/[0.08] flex items-center justify-center mx-auto md:mr-auto md:ml-0 mb-6 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                  <span className="text-brand-violet font-mono text-xl">02</span>
                </div>
                <h3 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-3">
                  Compare shortlisted tools
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed">
                  Review pricing, features, and real vendor details side by side on one page.
                </p>
              </div>
              <div className="hidden md:block w-1/2"></div>
            </div>

            {/* Step 03 - Left Aligned (The curve points back here) */}
            <div className="flex flex-col md:flex-row items-center md:justify-start w-full mt-8 md:mt-0">
              <div className="md:w-1/2 md:pr-16 text-center md:text-right">
                <div className="w-16 h-16 rounded-full bg-[#111111] border border-white/[0.08] flex items-center justify-center mx-auto md:ml-auto md:mr-0 mb-6 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                  <span className="text-brand-violet font-mono text-xl">03</span>
                </div>
                <h3 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-3">
                  Request a demo
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed">
                  One click sends your details straight to the vendor — no forms to hunt for.
                </p>
              </div>
              <div className="hidden md:block w-1/2"></div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
