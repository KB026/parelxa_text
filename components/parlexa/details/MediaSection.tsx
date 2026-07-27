'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ImageIcon } from 'lucide-react';

interface MediaSectionProps {
  screenshots?: string[];
  videoUrl?: string;
}

export function MediaSection({ screenshots = [], videoUrl }: MediaSectionProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  // HeroSection displays the video if present, otherwise it displays the first screenshot.
  // Therefore, the gallery should show all screenshots if there's a video,
  // or slice(1) if there's no video.
  const galleryScreenshots = videoUrl ? screenshots : screenshots.slice(1);
  
  // Filter out broken images client-side
  const visibleScreenshots = galleryScreenshots.filter((_, idx) => !imgErrors[idx]);

  if (visibleScreenshots.length === 0) {
    return (
      <section style={{ marginBottom: '64px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-white)' }}>Product Media</h3>
        <div style={{ 
          width: '100%', padding: '64px 20px', borderRadius: '24px', 
          background: 'var(--bg-secondary)', border: '1px dashed var(--border-subtle)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)'
        }}>
          <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', margin: 0 }}>No preview images available yet</p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: '64px' }}>
      <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-white)' }}>Product Media</h3>
      
      {/* Screenshot Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {galleryScreenshots.map((src, idx) => {
          if (imgErrors[idx]) return null;
          
          return (
            <div 
              key={idx}
              onClick={() => setActiveImage(src)}
              style={{ 
                aspectRatio: '16/10', borderRadius: '16px', overflow: 'hidden', 
                border: '1px solid var(--border-subtle)', cursor: 'zoom-in',
                background: '#090a0f',
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Simple loading shimmer background */}
              <div className="absolute inset-0 animate-pulse bg-slate-800" />
              
              <Image 
                src={src} 
                alt={`Screenshot ${idx + 1}`} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                style={{ objectFit: 'contain', position: 'relative', zIndex: 1 }} 
                onError={() => setImgErrors(prev => ({ ...prev, [idx]: true }))}
                unoptimized // In case external URLs break Next.js image optimization
              />
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {activeImage && (
        <div 
          onClick={() => setActiveImage(null)}
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', 
            alignItems: 'center', justifyContent: 'center', padding: '40px',
            animation: 'fadeIn 0.2s ease-out forwards'
          }}
        >
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={activeImage} 
              alt="Enlarged screenshot"
              width={1920}
              height={1080}
              style={{ maxWidth: '100%', maxHeight: '85vh', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} 
              unoptimized
            />
            <button 
              onClick={() => setActiveImage(null)}
              style={{ 
                position: 'absolute', top: '-20px', right: '-20px', 
                background: 'var(--bg-card)', color: 'var(--text-white)', 
                border: '1px solid var(--border-subtle)', borderRadius: '50%', 
                width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.color = 'var(--cyan)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.color = 'var(--text-white)';
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(8px); }
        }
      `}} />
    </section>
  );
}
