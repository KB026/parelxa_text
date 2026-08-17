'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Shield, Calendar, X, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  listingId: number;
  toolName: string;
  planName: string; // 'growth' | 'pro' | string
  expiresAt?: string | null;
  onClose: () => void;
  onSuccess: (listingId: number) => void;
}

export function CancelSubscriptionModal({
  isOpen,
  listingId,
  toolName,
  planName,
  expiresAt,
  onClose,
  onSuccess,
}: CancelSubscriptionModalProps) {
  const [phase, setPhase] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const planLabel = planName === 'pro' ? 'Scale Plan (₹899/mo)' : 'Growth Plan (₹499/mo)';
  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'end of current billing cycle';

  async function handleConfirmCancel() {
    setPhase('processing');
    setError(null);

    try {
      // Simulate minimum 1.2s for smooth GPay-like animation experience
      const [res] = await Promise.all([
        fetch('/api/subscriptions/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: listingId }),
        }),
        new Promise(resolve => setTimeout(resolve, 1400)),
      ]);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription');

      setPhase('success');
      onSuccess(listingId);
    } catch (err: any) {
      setError(err?.message || 'Cancellation failed. Please try again.');
      setPhase('confirm');
    }
  }

  return (
    <>
      <style>{`
        @keyframes gpay-ripple {
          0% { transform: scale(0.6); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes gpay-pop {
          0% { transform: scale(0.3); opacity: 0; }
          70% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes gpay-spin {
          to { transform: rotate(360deg); }
        }
        .gpay-badge-glow {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.35);
        }
      `}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-lg bg-[#0d1322] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden text-white">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button (only in confirm or success phase) */}
          {phase !== 'processing' && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
            >
              <X size={18} />
            </button>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              PHASE 1: CONFIRMATION PROMPT
             ───────────────────────────────────────────────────────────────── */}
          {phase === 'confirm' && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <ShieldAlert size={28} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Cancel Auto-Renewal?</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Are you sure you want to stop automatic billing for <strong className="text-white">&ldquo;{toolName}&rdquo;</strong>?
              </p>

              {/* Active Plan Pill */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Current Plan</div>
                    <div className="text-sm font-bold text-white">{planLabel}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Access Until</div>
                  <div className="text-sm font-semibold text-emerald-400">{formattedExpiry}</div>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl mb-6 flex items-start gap-3 text-xs text-slate-300">
                <Shield size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-400 block mb-0.5">Your access stays 100% active</strong>
                  You will retain your Verified status, dofollow backlink, and full directory benefits until <span className="text-white font-medium">{formattedExpiry}</span>. Razorpay will not charge you again.
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl mb-4 text-center">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/20 text-center"
                >
                  Keep My Plan Active
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-sm transition-all text-center"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              PHASE 2: GPAY-STYLE PROCESSING ANIMATION
             ───────────────────────────────────────────────────────────────── */}
          {phase === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              {/* Animated Ring */}
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Halting Auto-Renewal...</h3>
              <p className="text-slate-400 text-xs max-w-xs">
                Communicating with Razorpay gateway to stop future recurring charges for {toolName}.
              </p>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              PHASE 3: GPAY-STYLE SUCCESS CONFIRMATION
             ───────────────────────────────────────────────────────────────── */}
          {phase === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              
              {/* GPay Success Circle with Wave Animation */}
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                {/* Expanding Ripple Outer Circle */}
                <div className="absolute inset-0 rounded-full bg-emerald-500/20" style={{ animation: 'gpay-ripple 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite' }} />
                {/* Pop Checkmark Circle */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center gpay-badge-glow shadow-emerald-500/40" style={{ animation: 'gpay-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
                  <CheckCircle2 size={44} strokeWidth={2.5} />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
                <Shield size={14} /> Auto-Renewal Cancelled
              </div>

              <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
                Subscription Update Complete
              </h3>
              
              <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
                Your monthly subscription for <strong className="text-white">&ldquo;{toolName}&rdquo;</strong> has been cancelled on Razorpay.
              </p>

              {/* Receipt Summary Card */}
              <div className="w-full p-4 bg-slate-900/90 border border-slate-800 rounded-2xl mb-6 text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Tool Name</span>
                  <span className="text-white font-semibold">{toolName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Active Tier</span>
                  <span className="text-purple-400 font-semibold">{planLabel}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Current Access Active Until</span>
                  <span className="text-emerald-400 font-bold">{formattedExpiry}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 border-t border-slate-800 pt-2">
                  <span>Future Auto-Debits</span>
                  <span className="text-rose-400 font-semibold">Disabled (₹0)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Back to Listings <ArrowRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
