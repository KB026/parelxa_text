'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Agent } from '@/lib/types';
import { StarRating } from '../reviews/ReviewStats';

interface SimilarToolsProps {
  tools: Agent[];
}

export function SimilarTools({ tools }: SimilarToolsProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  if (tools.length === 0) return null;

  // Duplicate for seamless infinite scrolling
  const duplicatedTools = [...tools, ...tools];

  return (
    <section className="border-t border-white/5 py-12 overflow-hidden w-full">
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none !important;
            flex-wrap: wrap;
          }
        }
      `}</style>
      
      <h3 className="text-2xl font-extrabold mb-8 text-white px-4 lg:px-0">Similar AI Tools</h3>
      
      {/* Marquee Wrapper */}
      <div className="w-full relative flex group">
        <div className="flex gap-6 whitespace-nowrap will-change-transform animate-marquee">
          {duplicatedTools.map((tool, idx) => (
            <div 
              key={`${tool.id}-${idx}`} 
              className="inline-block w-[320px] shrink-0 whitespace-normal transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1"
            >
              <Link href={`/products/${tool.slug}`} className="block no-underline h-full">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 h-full flex flex-col justify-between group-card cursor-pointer">
                  
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      {/* Logo */}
                      <div className="w-14 h-14 rounded-xl bg-[#0f172a] border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                        {tool.logoUrl && !imgErrors[tool.id] ? (
                          <Image 
                            src={tool.logoUrl} 
                            alt={tool.name} 
                            width={56} height={56} 
                            style={{ objectFit: 'cover' }}
                            onError={() => setImgErrors(prev => ({ ...prev, [tool.id]: true }))}
                            unoptimized
                          />
                        ) : (
                          <div className="text-xl font-bold text-white/30">
                            {tool.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="overflow-hidden">
                        <h4 className="text-lg font-bold text-white m-0 group-hover:text-cyan-400 transition-colors line-clamp-1 truncate">{tool.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={tool.rating || 0} size="sm" />
                          <span className="text-xs text-white/50 font-bold">{tool.rating ? tool.rating.toFixed(1) : '0.0'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-white/60 line-clamp-2 leading-relaxed m-0 whitespace-normal">
                      {tool.oneLiner || (tool.summary && tool.summary.split('.')[0] + '.')}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-xs font-semibold px-2 py-1 bg-white/5 text-white/70 rounded-md uppercase tracking-wider">
                      {tool.category || 'AI Tool'}
                    </span>
                    <span className="text-cyan-400 text-sm font-semibold flex items-center gap-1 group-card-hover:gap-2 transition-all">
                      View details <span aria-hidden="true">&rarr;</span>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
