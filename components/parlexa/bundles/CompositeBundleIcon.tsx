'use client';

import React from 'react';
import Image from 'next/image';

interface CompositeBundleIconProps {
  logos?: (string | null)[];
  names?: string[];
  toolCount?: number;
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CompositeBundleIcon: React.FC<CompositeBundleIconProps> = ({
  logos = [],
  names = [],
  toolCount,
  size = 'md',
  className = ''
}) => {
  // Determine effective count to switch between 2x2 (4 tools) and 2x3 (5 tools)
  const totalTools = toolCount || Math.max(logos.length, names.length, 4);
  const is5ToolGrid = totalTools >= 5;

  // Sizing definitions
  const dimensions = {
    sm: { container: 'w-12 h-12 p-1 gap-0.5 rounded-lg', logo: 'w-4 h-4 text-[9px]' },
    md: { container: 'w-20 h-20 p-2 gap-1.5 rounded-xl', logo: 'w-7 h-7 text-xs' },
    lg: { container: 'w-28 h-28 p-2.5 gap-2 rounded-2xl', logo: 'w-10 h-10 text-sm' }
  }[size];

  // Grid layout class based on tool count: 2 columns, 2 rows for 4 tools; 3 columns, 2 rows for 5-6 tools
  const gridClass = is5ToolGrid ? 'grid-cols-3 grid-rows-2' : 'grid-cols-2 grid-rows-2';
  const displayCount = is5ToolGrid ? 6 : 4;

  const items = Array.from({ length: displayCount }, (_, index) => {
    const logo = logos[index];
    const name = names[index] || `Tool ${index + 1}`;
    const initial = name.charAt(0).toUpperCase();

    if (index >= totalTools && is5ToolGrid) {
      // 6th cell in 2x3 grid when only 5 tools exist
      return (
        <div
          key={`empty-${index}`}
          className="flex items-center justify-center rounded-md bg-[#18181C]/40 border border-white/[0.04] opacity-30"
        >
          <span className="text-[10px] text-gray-500">+</span>
        </div>
      );
    }

    return (
      <div
        key={index}
        className="relative flex items-center justify-center rounded-md bg-[#18181C] border border-white/[0.08] overflow-hidden group hover:border-[#12B886]/50 transition-all duration-200"
      >
        {logo ? (
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-cover p-0.5 rounded-md"
            onError={(e) => {
              // Fallback to text initial if image fails
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const span = document.createElement('span');
                span.className = 'font-bold text-[#12B886]';
                span.innerText = initial;
                parent.appendChild(span);
              }
            }}
          />
        ) : (
          <span className="font-bold text-[#12B886] select-none">{initial}</span>
        )}
      </div>
    );
  });

  return (
    <div
      className={`relative grid ${gridClass} ${dimensions.container} bg-[#0D0D11] border border-white/10 shadow-lg shadow-black/50 group-hover:border-[#12B886]/60 transition-all duration-300 ${className}`}
    >
      {items}
      {/* Accent glow line */}
      <div className="absolute -inset-px rounded-[inherit] bg-gradient-to-r from-[#12B886]/20 via-transparent to-[#12B886]/20 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
