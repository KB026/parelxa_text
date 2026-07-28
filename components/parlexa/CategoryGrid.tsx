'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
}

// Custom Illustrated SVG Icon Component for Industry Categories in Parlexa Brand Violet
function CategoryIcon({ categoryName }: { categoryName: string }) {
  const name = categoryName.toLowerCase();

  // 1. AI & LLMs
  if (name.includes('ai') || name.includes('llm')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <path d="M24 14V34M14 24H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="24" r="5" className="fill-[#A78BFA]" />
        <circle cx="14" cy="24" r="3" className="fill-[#8B5CF6]" />
        <circle cx="34" cy="24" r="3" className="fill-[#8B5CF6]" />
        <circle cx="24" cy="14" r="3" className="fill-[#8B5CF6]" />
        <circle cx="24" cy="34" r="3" className="fill-[#8B5CF6]" />
        <path d="M17 17L31 31M31 17L17 31" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="2 2" />
      </svg>
    );
  }

  // 2. Customer Experience
  if (name.includes('customer') || name.includes('experience') || name.includes('support')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <path d="M16 26C16 21.5817 19.5817 18 24 18C28.4183 18 32 21.5817 32 26V30H16V26Z" stroke="currentColor" strokeWidth="2" />
        <path d="M14 26C14 26 12 26 12 28V30C12 31 13 32 14 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M34 26C34 26 36 26 36 28V30C36 31 35 32 34 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 32C28 33.6569 26.2091 35 24 35C21.7909 35 20 33.6569 20 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="14" r="2" className="fill-[#A78BFA]" />
      </svg>
    );
  }

  // 3. Marketing & Sales
  if (name.includes('marketing') || name.includes('sales')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="24" r="3" className="fill-[#A78BFA]" />
        <path d="M30 14L34 10M34 10H29M34 10V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 4. Enterprise & Automation
  if (name.includes('enterprise') || name.includes('automation')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <path d="M24 16V20M24 28V32M16 24H20M28 24H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
        <path d="M18.3431 18.3431L21.1716 21.1716M26.8284 26.8284L29.6569 29.6569" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M29.6569 18.3431L26.8284 21.1716M21.1716 26.8284L18.3431 29.6569" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 5. HR & Workforce
  if (name.includes('hr') || name.includes('workforce') || name.includes('people')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <circle cx="24" cy="18" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M16 32C16 28 19.5817 25 24 25C28.4183 25 32 28 32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="21" r="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" />
        <circle cx="33" cy="21" r="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" />
        <path d="M10 32C10 29.5 12 27.5 14.5 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
        <path d="M38 32C38 29.5 36 27.5 33.5 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      </svg>
    );
  }

  // 6. Healthcare
  if (name.includes('health') || name.includes('medical') || name.includes('bio')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <path d="M14 25H19L22 17L26 31L29 22L31 25H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 12V14M24 34V36M12 24H14M34 24H36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      </svg>
    );
  }

  // 7. FinTech
  if (name.includes('fintech') || name.includes('finance') || name.includes('bank')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <rect x="14" y="24" width="4" height="10" rx="1" fill="currentColor" fillOpacity="0.4" />
        <rect x="22" y="19" width="4" height="15" rx="1" fill="currentColor" fillOpacity="0.7" />
        <rect x="30" y="14" width="4" height="20" rx="1" fill="currentColor" />
        <path d="M14 20L22 15L30 10L34 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 8. Retail & E-Commerce
  if (name.includes('retail') || name.includes('commerce') || name.includes('shop')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <path d="M15 17H33L31 29H17L15 17Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M20 17V14C20 11.7909 21.7909 10 24 10C26.2091 10 28 11.7909 28 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="19" cy="34" r="2" className="fill-[#A78BFA]" />
        <circle cx="29" cy="34" r="2" className="fill-[#A78BFA]" />
      </svg>
    );
  }

  // 9. Developer Tools & Infra
  if (name.includes('developer') || name.includes('infra') || name.includes('code')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <path d="M17 19L12 24L17 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31 19L36 24L31 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 15L22 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 10. Logistics & Supply Chain
  if (name.includes('logistics') || name.includes('supply') || name.includes('chain')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <rect x="13" y="19" width="13" height="10" rx="1" stroke="currentColor" strokeWidth="2" />
        <path d="M26 22H32L35 25V29H26V22Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="18" cy="31" r="2.5" fill="currentColor" />
        <circle cx="30" cy="31" r="2.5" fill="currentColor" />
      </svg>
    );
  }

  // 11. AgriTech
  if (name.includes('agri') || name.includes('crop') || name.includes('farm')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <path d="M24 34V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 24C24 24 17 22 16 16C22 16 24 21 24 24Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M24 28C24 28 31 26 32 20C26 20 24 25 24 28Z" fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  // 12. EdTech
  if (name.includes('edtech') || name.includes('education') || name.includes('learn')) {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
        <path d="M12 21L24 15L36 21L24 27L12 21Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M17 23.5V30C17 30 20 33 24 33C28 33 31 30 31 30V23.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M36 21V28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Default Fallback Icon
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#A78BFA]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" className="fill-[#8B5CF6]/10 stroke-[#8B5CF6]/40" strokeWidth="1.5" />
      <polygon points="24,14 32,20 32,28 24,34 16,28 16,20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="3" className="fill-[#A78BFA]" />
    </svg>
  );
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <section className="bg-[#0A0A0A] py-20 border-b border-white/[0.08] relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        
        {/* Section Header */}
        <div className="mb-12 text-left">
          <span className="text-[#A78BFA] font-mono text-sm tracking-wider uppercase mb-2 block font-medium">
            Domain Categories
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Explore AI Agents by Industry Category
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl font-light">
            Browse verified enterprise AI software and autonomous agent tools tailored for specialized industry workflows.
          </p>
        </div>

        {/* BharatGPT Style Focus / Blur Grid Container with Parlexa Violet Brand Accent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const isHovered = hoveredCategory === cat.name;
            const isAnyHovered = hoveredCategory !== null;

            return (
              <Link
                key={cat.id || cat.name}
                href={`/products?cats=${encodeURIComponent(cat.name)}`}
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`
                  relative p-6 rounded-2xl bg-[#121218] border transition-all duration-300 flex flex-col justify-between group cursor-pointer overflow-hidden
                  ${
                    isHovered
                      ? 'border-[#8B5CF6] bg-[#171526] shadow-[0_0_30px_rgba(139,92,246,0.3)] scale-[1.02] z-20 opacity-100 filter-none'
                      : isAnyHovered
                      ? 'border-white/[0.05] opacity-40 blur-[1.5px] scale-[0.98] z-0'
                      : 'border-white/[0.08] opacity-100 filter-none hover:border-[#8B5CF6]/50'
                  }
                `}
              >
                {/* Subtle Parlexa Violet Hover Gradient Glow Fill */}
                <div
                  className={`
                    absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/15 via-transparent to-transparent pointer-events-none transition-opacity duration-300
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                  `}
                />

                <div>
                  {/* Custom Illustrated Badge Icon */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:border-[#8B5CF6]/50 transition-colors">
                      <CategoryIcon categoryName={cat.name} />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors mb-2 tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed mb-6">
                    Discover verified autonomous tools and enterprise models built for {cat.name}.
                  </p>
                </div>

                {/* Explore Link Indicator */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <span className="text-xs font-semibold text-[#A78BFA] group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                    <span>Explore Category</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
