'use client';

import { Agent } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      
      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
      });
      
      setGlareStyle({
        background: `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
        opacity: 1,
        transition: 'opacity 0.2s',
      });
    };

    const handleMouseLeave = () => {
      setStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.5s ease',
      });
      setGlareStyle({ opacity: 0, transition: 'opacity 0.5s' });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return { ref, style, glareStyle };
}

interface HeroSectionProps {
  agent: Agent;
  hasVerifiedReviews?: boolean;
}

export function HeroSection({ 
  agent,
  hasVerifiedReviews = false
}: HeroSectionProps) {
  const [featuredImgError, setFeaturedImgError] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});

  const tilt = useTilt();

  const mediaItems: { type: 'video' | 'image', url: string }[] = [];
  if (agent.videoUrl) mediaItems.push({ type: 'video', url: agent.videoUrl });
  if (agent.screenshots) {
    agent.screenshots.forEach(src => mediaItems.push({ type: 'image', url: src }));
  }

  const activeMedia = mediaItems[activeMediaIndex] || null;

  return (
    <section style={{ position: 'relative', marginBottom: '64px', paddingTop: '24px' }}>
      {/* Decorative Orbs */}
      <div 
        className="animate-float-orb"
        style={{ 
          position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', 
          background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)', 
          filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 
        }} 
      />
      <div 
        className="animate-float-orb"
        style={{ 
          position: 'absolute', bottom: '-10%', right: '-5%', width: '300px', height: '300px', 
          background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)', 
          filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0, animationDelay: '-6s'
        }} 
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
        
        {/* HEADER AREA */}
        <div className="animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            {agent.logoUrl ? (
              <div className="w-12 h-12 rounded-xl border border-white/10 shadow-sm overflow-hidden bg-white shrink-0 relative">
                <Image 
                  src={agent.logoUrl} 
                  alt={`${agent.name} logo`} 
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl border border-white/10 shadow-sm bg-white/5 flex items-center justify-center text-lg font-bold text-white/50 shrink-0">
                {agent.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex items-center gap-4 flex-wrap max-w-full overflow-hidden">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold m-0 tracking-tight leading-tight text-white break-words max-w-full">{agent.name}</h1>
              {agent.isVerified && (
                <span className="badge-tooltip" style={{ flexShrink: 0 }}>
                  <span className="verified-badge" />
                  <span className="tooltip-text">Verified by Parlexa</span>
                </span>
              )}
            </div>
          </div>
          
          <p style={{ fontSize: '20px', color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.5 }}>
            {agent.oneLiner || agent.summary.split('.')[0] + '.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span className="px-3 py-1 flex items-center justify-center bg-white/[0.05] border border-white/10 rounded-full text-[13px] font-semibold text-white">
              {agent.category}
            </span>
            {agent.tags?.map(tag => (
              <span key={tag} className="px-3 py-1 flex items-center justify-center bg-white/[0.02] border border-white/[0.06] rounded-full text-[13px] text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* MEDIA SECTION */}
        {mediaItems.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div 
              ref={tilt.ref}
              style={{ 
                position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', 
                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-xl)', ...tilt.style
              }}
            >
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, ...tilt.glareStyle }} />
              
              <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', backgroundColor: '#000' }}>
                {activeMedia?.type === 'video' ? (
                  <iframe 
                    src={activeMedia.url} 
                    title={`${agent.name} video`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activeMedia?.type === 'image' && !featuredImgError ? (
                  <Image 
                    src={activeMedia.url} 
                    alt={`${agent.name} preview`}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    style={{ objectFit: 'cover' }}
                    onError={() => setFeaturedImgError(true)}
                    unoptimized
                    priority={activeMediaIndex === 0}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'var(--text-muted)' }}>
                    Preview not available
                  </div>
                )}
              </div>
            </div>

            {/* THUMBNAILS ROW */}
            {mediaItems.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveMediaIndex(idx);
                      setFeaturedImgError(false);
                    }}
                    style={{
                      width: '96px', height: '54px', borderRadius: '8px', overflow: 'hidden',
                      border: activeMediaIndex === idx ? '2px solid var(--accent)' : '1px solid var(--border)',
                      padding: 0, background: 'none', cursor: 'pointer', flexShrink: 0,
                      opacity: activeMediaIndex === idx ? 1 : 0.6, transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    {item.type === 'video' ? (
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                        ▶ Video
                      </div>
                    ) : !thumbErrors[idx] ? (
                      <Image 
                        src={item.url} 
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        sizes="96px"
                        style={{ objectFit: 'cover' }}
                        onError={() => setThumbErrors(prev => ({ ...prev, [idx]: true }))}
                        unoptimized
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '10px' }}>
                        Image
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
