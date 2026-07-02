'use client';

import { useState } from 'react';
import Image from 'next/image';

interface MediaSectionProps {
  screenshots?: string[];
  videoUrl?: string;
}

export function MediaSection({ screenshots = [], videoUrl }: MediaSectionProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (screenshots.length === 0 && !videoUrl) return null;

  return (
    <section style={{ marginBottom: '64px' }}>
      <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Product Media</h3>
      
      {/* Video Highlight */}
      {videoUrl && (
        <div style={{ 
          width: '100%', aspectRatio: '16/9', borderRadius: '24px', overflow: 'hidden', 
          background: 'black', marginBottom: '24px', border: '1px solid var(--border-subtle)'
        }}>
          <iframe
            src={videoUrl.replace('watch?v=', 'embed/')}
            title="Product Demo"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Screenshot Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {screenshots.map((src, idx) => (
          <div 
            key={idx}
            onClick={() => setActiveImage(src)}
            style={{ 
              aspectRatio: '16/10', borderRadius: '16px', overflow: 'hidden', 
              border: '1px solid var(--border-subtle)', cursor: 'zoom-in',
              background: 'var(--bg-secondary)',
              position: 'relative'
            }}
          >
            <Image src={src} alt={`Screenshot ${idx + 1}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {activeImage && (
        <div 
          onClick={() => setActiveImage(null)}
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', 
            alignItems: 'center', justifyContent: 'center', padding: '40px'
          }}
        >
          <Image 
            src={activeImage} 
            alt="Enlarged screenshot"
            width={1920}
            height={1080}
            style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} 
          />
          <button 
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'white', color: 'black', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontWeight: 700, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
