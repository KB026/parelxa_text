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
    if (user.role === 'vendor' || user.role === 'admin') {
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
    
    // User is logged in but not a vendor. Send them to dashboard with the upgrade prompt
    return (
      <Link 
        href="/dashboard?auth_err=vendor_required" 
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
