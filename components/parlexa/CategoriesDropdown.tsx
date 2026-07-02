'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bot, MessageSquare, Megaphone, Settings, ArrowRight } from 'lucide-react';

export function CategoriesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="nav-categories" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="nav-link" 
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        Categories <span style={{fontSize:'8px'}}>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div 
          className="categories-dropdown" 
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '220px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 1000,
            marginTop: '8px'
          }}
        >
          <Link href="/products?cats=AI+%26+LLMs" className="dropdown-item" onClick={() => setIsOpen(false)}><Bot className="w-4 h-4 inline mr-2 text-muted-foreground" /> AI &amp; LLMs</Link>
          <Link href="/products?cats=Customer+Experience" className="dropdown-item" onClick={() => setIsOpen(false)}><MessageSquare className="w-4 h-4 inline mr-2 text-muted-foreground" /> Customer Experience</Link>
          <Link href="/products?cats=Marketing+%26+Sales" className="dropdown-item" onClick={() => setIsOpen(false)}><Megaphone className="w-4 h-4 inline mr-2 text-muted-foreground" /> Marketing &amp; Sales</Link>
          <Link href="/products?cats=Enterprise+%26+Automation" className="dropdown-item" onClick={() => setIsOpen(false)}><Settings className="w-4 h-4 inline mr-2 text-muted-foreground" /> Enterprise &amp; Automation</Link>
          <Link href="/products" className="dropdown-item" onClick={() => setIsOpen(false)} style={{justifyContent: 'center', color: 'var(--cyan)'}}>View All Categories <ArrowRight className="w-4 h-4 inline ml-1" /></Link>
        </div>
      )}
    </div>
  );
}
