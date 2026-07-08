'use client';

import React from 'react';

const themes = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  blue: { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
};

const stories = [
  {
    themeColor: 'emerald',
    caseId: 'CASE 01',
    category: 'D2C - FUNDRAISING',
    avatarStr: 'RK',
    name: 'Riya K.',
    role: 'D2C Skincare Founder',
    challenge: 'Struggling to raise ₹2Cr without a clear narrative or access to a warm investor network.',
    solution: 'Instantly found an AI pitch deck generator and investor CRM, building a data-backed, investor-ready narrative in under an hour.'
  },
  {
    themeColor: 'blue',
    caseId: 'CASE 02',
    category: 'B2B - LEAD GENERATION',
    avatarStr: 'AS',
    name: 'Arjun S.',
    role: 'Head of Sales',
    challenge: 'Sales pipeline was drying up while the team wasted hours on manual cold outreach with poor conversion rates.',
    solution: 'Used the side-by-side comparison view to evaluate and deploy a high-intent AI prospecting engine within a single week.'
  },
  {
    themeColor: 'amber',
    caseId: 'CASE 03',
    category: 'LOGISTICS - OPERATIONS',
    avatarStr: 'PM',
    name: 'Priya M.',
    role: 'VP Operations',
    challenge: 'Rapidly expanding into two new cities where manual route planning and fleet management could no longer scale.',
    solution: 'Filtered tools by deployment complexity to find a route optimization AI backed by verified reviews from similar-sized logistics operations.'
  }
];

export function RealStories() {
  return (
    <section className="max-w-7xl mx-auto py-24 px-5 md:px-10">
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-1.5 bg-brand-violet-bg border border-brand-violet-border rounded-full text-brand-violet text-[10px] md:text-xs font-medium tracking-widest uppercase mb-6">
          <span className="mr-2">✦</span> Real Stories
        </div>
        
        <h2 className="text-4xl md:text-5xl font-semibold text-[#EDEDED] mb-4 tracking-tight">
          How Businesses Win with Parlexa
        </h2>
        <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
          From founders raising funds to logistics teams scaling operations — see Parlexa in action
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((story, i) => {
          const t = themes[story.themeColor as keyof typeof themes];
          return (
            <div key={i} className="flex flex-col bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.04] transition-colors duration-300">
              
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-md ${t.bg} ${t.text} ${t.border} border`}>{story.caseId}</span>
                <span className="text-[#71717A] text-[10px] tracking-widest uppercase">{story.category}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white/[0.08] ${t.bg} ${t.text}`}>
                  {story.avatarStr}
                </div>
                <div>
                  <h4 className="text-[#EDEDED] text-base font-semibold tracking-tight">{story.name}</h4>
                  <p className="text-[#A1A1AA] text-sm mt-0.5 leading-relaxed">{story.role}</p>
                </div>
              </div>

              <div className="border-t border-white/[0.08] my-4"></div>

              <div className="flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="text-[#71717A] text-[10px] font-bold tracking-widest uppercase mb-2 block">The Challenge</span>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed m-0">
                    {story.challenge}
                  </p>
                </div>

                <div className="mt-4">
                  <span className="text-[#71717A] text-[10px] font-bold tracking-widest uppercase mb-2 block">Parlexa Solution</span>
                  <p className="text-[#EDEDED] font-medium leading-relaxed m-0">
                    {story.solution}
                  </p>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    </section>
  );
}
