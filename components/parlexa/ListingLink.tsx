'use client';

import Link from 'next/link';
import { UserProfile } from '@/lib/types';

interface ListingLinkProps {
  user: UserProfile | null;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ListingLink({ user, children, className, style }: ListingLinkProps) {
  if (user) {
    return (
      <Link 
        href="/vendor/listings/new?fresh=true" 
        className={className} 
        style={style}
      >
        {children}
      </Link>
    );
  }

  const handleTriggerAuth = (e: React.MouseEvent) => {
    e.preventDefault();
    const event = new CustomEvent('open-auth', { 
      detail: { view: 'register', role: 'vendor' } 
    });
    window.dispatchEvent(event);
  };

  return (
    <button 
      onClick={handleTriggerAuth} 
      className={className} 
      style={{ ...style, cursor: 'pointer', background: 'none', border: 'none', padding: style?.padding || 0, textAlign: 'inherit', font: 'inherit', color: style?.color || 'inherit' }}
    >
      {children}
    </button>
  );
}
