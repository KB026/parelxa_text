'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AuthCard } from './AuthCard';
import { X } from 'lucide-react';

type AuthView = 'signin' | 'register' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
  initialRole?: 'user' | 'vendor';
}

export function AuthModal({ isOpen, onClose, initialView = 'signin', initialRole = 'user' }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-w-[480px] w-full max-h-[90vh] overflow-y-auto rounded-2xl scrollbar-thin scrollbar-thumb-white/10">
        <button
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border-none cursor-pointer flex items-center justify-center transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <AuthCard initialView={initialView} initialRole={initialRole} onSuccess={onClose} />
      </div>
    </div>,
    document.body
  );
}
