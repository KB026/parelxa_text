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
          className="absolute top-full mt-4 -left-4 w-72 bg-[#09090B]/95 backdrop-blur-3xl border border-white/[0.10] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.12)] z-[100] overflow-hidden flex flex-col p-2 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <Link href="/products?cats=AI+%26+LLMs" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group" onClick={() => setIsOpen(false)}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:bg-brand-violet/20 group-hover:border-brand-violet/30 text-gray-400 group-hover:text-brand-violet transition-all duration-300">
              <Bot className="w-4 h-4" />
            </div>
            AI &amp; LLMs
          </Link>
          <Link href="/products?cats=Customer+Experience" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group" onClick={() => setIsOpen(false)}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:bg-brand-violet/20 group-hover:border-brand-violet/30 text-gray-400 group-hover:text-brand-violet transition-all duration-300">
              <MessageSquare className="w-4 h-4" />
            </div>
            Customer Experience
          </Link>
          <Link href="/products?cats=Marketing+%26+Sales" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group" onClick={() => setIsOpen(false)}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:bg-brand-violet/20 group-hover:border-brand-violet/30 text-gray-400 group-hover:text-brand-violet transition-all duration-300">
              <Megaphone className="w-4 h-4" />
            </div>
            Marketing &amp; Sales
          </Link>
          <Link href="/products?cats=Enterprise+%26+Automation" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group" onClick={() => setIsOpen(false)}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:bg-brand-violet/20 group-hover:border-brand-violet/30 text-gray-400 group-hover:text-brand-violet transition-all duration-300">
              <Settings className="w-4 h-4" />
            </div>
            Enterprise &amp; Automation
          </Link>
          
          <div className="h-px bg-white/[0.05] w-full my-1"></div>
          
          <Link href="/products" className="flex items-center justify-between px-4 py-3 text-sm font-medium text-brand-violet hover:text-white hover:bg-brand-violet/10 rounded-xl transition-all duration-200 group" onClick={() => setIsOpen(false)}>
            View All Categories 
            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
          </Link>
        </div>
      )}
    </div>
  );
}
