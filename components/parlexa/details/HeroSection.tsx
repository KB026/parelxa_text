'use client';

import { Agent } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';

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
}

export function HeroSection({ 
  agent
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
              <img 
                src={agent.logoUrl} 
                alt={`${agent.name} logo`} 
                className="w-12 h-12 rounded-xl border border-white/10 shadow-sm object-cover bg-white shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl border border-white/10 shadow-sm bg-white/5 flex items-center justify-center text-lg font-bold text-white/50 shrink-0">
                {agent.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex items-center gap-4">
              <h1 style={{ fontSize: '48px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{agent.name}</h1>
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
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px', animationDelay: '0.15s' }}>
          <div 
            ref={tilt.ref}
            style={{ 
              width: '100%', aspectRatio: '16/11', borderRadius: '24px', overflow: 'hidden', 
              background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(168,85,247,0.1))', 
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
              position: 'relative',
              ...tilt.style
            }}
          >
            {/* Glare Overlay */}
            <div 
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
                opacity: 0, ...tilt.glareStyle
              }} 
            />
            
            {activeMedia ? (
              activeMedia.type === 'video' ? (
                <iframe
                  src={activeMedia.url.replace('watch?v=', 'embed/')}
                  title="Product Demo"
                  width="100%" height="100%" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'relative', zIndex: 1 }}
                />
              ) : (
                !featuredImgError ? (
                  <img 
                    src={activeMedia.url} 
                    alt="Featured preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} 
                    onError={() => setFeaturedImgError(true)}
                  />
                ) : (
                  <div style={{ fontSize: '64px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }}>
                    {agent.name.substring(0, 2).toUpperCase()}
                  </div>
                )
              )
            ) : (
              <div style={{ fontSize: '64px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }}>
                {agent.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {mediaItems.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
              {mediaItems.map((item, idx) => {
                if (item.type === 'image' && thumbErrors[idx]) return null;
                const isActive = activeMediaIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => { setActiveMediaIndex(idx); setFeaturedImgError(false); }}
                    style={{
                      width: '80px', height: '50px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', padding: 0,
                      border: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
                      background: 'var(--bg-secondary)', cursor: 'pointer',
                      opacity: isActive ? 1 : 0.5, transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {item.type === 'video' ? (
                      <div style={{ color: 'var(--text-white)', fontSize: '10px', fontWeight: 700 }}>VIDEO</div>
                    ) : (
                      <img 
                        src={item.url} alt={`Thumbnail ${idx}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setThumbErrors(prev => ({ ...prev, [idx]: true }))}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
