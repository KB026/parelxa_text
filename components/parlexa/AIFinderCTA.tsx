'use client';

import Link from 'next/link';
import { useState } from 'react';

export function AIFinderCTA() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href="/ai-finder" 
      style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '16px 40px',
        background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
        color: 'black',
        borderRadius: '16px',
        fontWeight: 800,
        fontSize: '16px',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: isHovered 
          ? '0 15px 40px rgba(249, 115, 22, 0.5)' 
          : '0 10px 30px rgba(249, 115, 22, 0.3)',
        transform: isHovered ? 'scale(1.05) translateY(-2px)' : 'scale(1) translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Try AI Matching Engine <span style={{ fontSize: '20px' }}>â†’</span>
    </Link>
  );
}
