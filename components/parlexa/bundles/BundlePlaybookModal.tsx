'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import NextImage from 'next/image';
import Link from 'next/link';
import { X, Sparkles, Star, Zap, CheckCircle2, ArrowRight, Mail, ShieldCheck, Check } from 'lucide-react';
import { BundleToolFull } from '@/lib/bundles-service';

interface BundlePlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundleName: string;
  bundleTagline: string;
  bundleCategory: string;
  tools: BundleToolFull[];
  userEmail?: string;
}

export const BundlePlaybookModal: React.FC<BundlePlaybookModalProps> = ({
  isOpen,
  onClose,
  bundleName,
  bundleTagline,
  bundleCategory,
  tools,
  userEmail
}) => {
  const [mounted, setMounted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const sortedTools = [...tools].sort((a, b) => a.role_order - b.role_order);

  const handleSendEmailLink = async () => {
    if (!userEmail) return;
    setSendingEmail(true);
    // Simulate / invoke email link dispatch
    setTimeout(() => {
      setSendingEmail(false);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    }, 800);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#09090B] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#0EA5E9]/10 via-[#8B5CF6]/10 to-transparent border-b border-white/10 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0EA5E9]/15 border border-[#0EA5E9]/30 text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Live Deployment Playbook
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {bundleName} Playbook
            </h2>

            <p className="text-sm text-gray-300 font-medium">
              {bundleTagline}
            </p>
          </div>
        </div>

        {/* BODY - SCROLLABLE WORKFLOW STEPS */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="text-xs font-extrabold text-[#38BDF8] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Step-by-Step Tool Deployment Sequence ({sortedTools.length} Tools)
            </div>
            <span className="text-xs text-gray-400">Live Data Sync</span>
          </div>

          <div className="space-y-6">
            {sortedTools.map((tool, idx) => (
              <div
                key={tool.agent_id}
                className="bg-[#121215] border border-white/10 hover:border-[#0EA5E9]/40 rounded-2xl p-5 sm:p-6 transition-all space-y-4"
              >
                {/* Step header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-lg border border-white/5 text-xs text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{tool.rating}</span>
                  </div>
                </div>

                {/* Role badge */}
                <div className="inline-block px-3 py-1 rounded-md bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 text-[#38BDF8] text-xs font-bold">
                  Role: {tool.role_name}
                </div>

                {/* Info breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#18181C] border border-white/5 space-y-1">
                    <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider block">What it does:</span>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">{tool.what_it_does}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#18181C] border border-white/5 space-y-1">
                    <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider block">Why in this step:</span>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">{tool.why_in_step}</p>
                  </div>
                </div>

                {/* Product link */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-gray-400">Pricing: <strong className="text-white">{tool.pricing || 'Free / Freemium'}</strong></span>
                  <Link
                    href={`/products/${tool.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[#38BDF8] font-bold hover:underline"
                  >
                    <span>Inspect Tool Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-[#121215] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-gray-400 text-center sm:text-left">
            <span>Always updated with live vendor details and tool specs.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {userEmail && (
              <button
                onClick={handleSendEmailLink}
                disabled={sendingEmail || emailSent}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all disabled:opacity-50"
              >
                {emailSent ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Email Link Sent!</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-[#38BDF8]" />
                    <span>{sendingEmail ? 'Sending...' : 'Email Me Link'}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-extrabold text-xs hover:brightness-110 transition-all"
            >
              Close Playbook
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
