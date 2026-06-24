'use client';

import Link from 'next/link';
import { Agent } from '@/lib/types';
import { StarRating } from '../reviews/ReviewStats';

interface SimilarToolsProps {
  tools: Agent[];
}

export function SimilarTools({ tools }: SimilarToolsProps) {
  if (tools.length === 0) return null;

  return (
    <section style={{ marginTop: '80px', borderTop: '1px solid var(--border-subtle)', paddingTop: '80px' }}>
      <h3 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px' }}>Similar AI Tools</h3>
      
      <div style={{ 
        display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '32px',
        scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}>
        {tools.map(tool => (
          <Link 
            key={tool.id}
            href={`/products/${tool.slug}`}
            style={{ 
              minWidth: '280px', maxWidth: '280px', background: 'var(--bg-card)', 
              border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px',
              textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex', flexDirection: 'column', gap: '16px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = 'var(--cyan)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '12px', background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                flexShrink: 0, overflow: 'hidden'
              }}>
                {tool.logoUrl ? <img src={tool.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : tool.name[0]}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</h4>
                <div style={{ color: 'var(--cyan)', fontSize: '12px', marginTop: '2px' }}>{tool.category}</div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
              {tool.oneLiner || tool.summary?.split('.')[0] + '.'}
            </p>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <StarRating rating={tool.rating} size="sm" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-white)' }}>{tool.rating ? tool.rating.toFixed(1) : '0.0'}</span>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--cyan)', 
                fontWeight: 600,
                maxWidth: '120px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }} title={tool.pricing}>
                {tool.pricing}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
