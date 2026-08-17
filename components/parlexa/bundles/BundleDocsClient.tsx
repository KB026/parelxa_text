'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Mail, 
  BookOpen, 
  Layers, 
  Zap, 
  FileText,
  Check
} from 'lucide-react';
import { BundleToolFull } from '@/lib/bundles-service';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from '@/components/parlexa/AuthModal';

interface BundleDocsClientProps {
  bundleSlug: string;
  bundleName: string;
  bundleTagline: string;
  bundleHeadline: string;
  bundleDescription: string;
  bundleCategory: string;
  benefits: string[];
  whoNeedsIt: string[];
  useCase: string;
  tools: BundleToolFull[];
}

export const BundleDocsClient: React.FC<BundleDocsClientProps> = ({
  bundleSlug,
  bundleName,
  bundleTagline,
  bundleHeadline,
  bundleDescription,
  bundleCategory,
  benefits,
  whoNeedsIt,
  useCase,
  tools
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const hasDispatchedRef = React.useRef(false);

  const triggerEmailDispatch = async (email: string) => {
    if (!email || hasDispatchedRef.current) return;

    // Check if user specifically clicked a bundle CTA to trigger signup/login
    if (typeof window !== 'undefined') {
      const intentSlug = sessionStorage.getItem('parlexa_bundle_intent');
      if (intentSlug !== bundleSlug) {
        // User signed in normally (e.g., from navbar) -> DO NOT SEND BUNDLE EMAIL
        return;
      }
      // Consume the intent key so it only sends ONCE
      sessionStorage.removeItem('parlexa_bundle_intent');
    }

    const storageKey = `parlexa_docs_email_${bundleSlug}_${email}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(storageKey)) {
      return;
    }

    hasDispatchedRef.current = true;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, 'true');
    }

    try {
      await fetch('/api/bundles/send-docs-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          bundleName,
          bundleSlug
        })
      });
      setEmailSent(true);
    } catch (e) {
      console.error('Error dispatching docs email:', e);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setLoading(false);
      if (data?.user?.email) {
        triggerEmailDispatch(data.user.email);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u?.email) {
        triggerEmailDispatch(u.email);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [bundleSlug, bundleName]);

  const handleManualEmailSend = async () => {
    if (!user?.email) return;
    setSendingEmail(true);
    try {
      await fetch('/api/bundles/send-docs-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          bundleName,
          bundleSlug
        })
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (e) {
      console.error('Error sending manual docs email:', e);
    } finally {
      setSendingEmail(false);
    }
  };

  const sortedTools = [...tools].sort((a, b) => a.role_order - b.role_order);

  return (
    <div className="relative min-h-screen bg-[#09090B] text-white selection:bg-[#0EA5E9]/30 selection:text-white pb-24">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#0EA5E9]/15 via-[#8B5CF6]/10 to-transparent blur-3xl pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* HEADER */}
        <div className="space-y-4 mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Official Parlexa Bundle Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {bundleName} Playbook & Deployment Guide
          </h1>

          <p className="text-lg text-gray-300 font-medium leading-relaxed max-w-3xl">
            {bundleTagline}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <span className="px-3 py-1 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 text-[#38BDF8] text-xs font-extrabold uppercase">
              {bundleCategory}
            </span>
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Tool Architecture ({sortedTools.length} Steps)
            </span>
          </div>
        </div>

        {/* MAIN DOCUMENTATION CONTENT */}
        <div className="relative">
          {/* GUEST AUTH LOCK OVERLAY */}
          {!loading && !user && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 bg-[#09090B]/85 backdrop-blur-md rounded-3xl border border-white/10 text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0EA5E9]/20 to-[#8B5CF6]/20 border border-[#0EA5E9]/30 flex items-center justify-center text-[#38BDF8]">
                <Lock className="w-7 h-7" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-extrabold text-white">Unlock Full Bundle Documentation</h3>
                <p className="text-sm text-gray-300 font-medium">
                  Sign in or create a free Parlexa account to view full tool deployment steps, API specs, and receive an instant email copy.
                </p>
              </div>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-extrabold text-sm hover:brightness-110 shadow-lg shadow-[#0EA5E9]/25 transition-all"
              >
                <span>Sign In to Unlock Documentation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* DOCUMENTATION BODY */}
          <div className={`space-y-12 transition-all ${!user ? 'blur-sm select-none pointer-events-none opacity-40' : ''}`}>
            {/* OVERVIEW SECTION */}
            <section className="p-8 rounded-3xl bg-[#121215] border border-white/10 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#38BDF8]" />
                1. System Overview & Objective
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed font-medium">
                {bundleDescription}
              </p>
              <div className="p-4 rounded-2xl bg-[#18181C] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider block">Primary Use Case:</span>
                <p className="text-xs text-gray-300 font-medium">{useCase}</p>
              </div>
            </section>

            {/* STEP BY STEP DEPLOYMENT SEQUENCE */}
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#38BDF8]" />
                  2. Sequential Tool Architecture & Roles
                </h2>
                <span className="text-xs text-gray-400 font-bold">
                  {sortedTools.length} Integrated Tools
                </span>
              </div>

              <div className="space-y-6">
                {sortedTools.map((tool, idx) => (
                  <div
                    key={tool.agent_id}
                    className="p-6 rounded-3xl bg-[#121215] border border-white/10 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                          <span className="text-xs text-gray-400">{tool.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-md bg-[#0EA5E9]/10 text-[#38BDF8] text-xs font-bold border border-[#0EA5E9]/20">
                          Role: {tool.role_name}
                        </span>
                        <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 text-xs text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{tool.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#18181C] border border-white/5 space-y-1">
                        <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider block">What it does in the stack:</span>
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">{tool.what_it_does}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#18181C] border border-white/5 space-y-1">
                        <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider block">Integration Rationale (Step {tool.role_order}):</span>
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">{tool.why_in_step}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs border-t border-white/5">
                      <span className="text-gray-400">Pricing Model: <strong className="text-white">{tool.pricing || 'Freemium / Paid'}</strong></span>
                      {user && (
                        <Link
                          href={`/products/${tool.slug}`}
                          className="inline-flex items-center gap-1 text-[#38BDF8] font-bold hover:underline"
                        >
                          <span>Explore Tool Specs</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* KEY ADVANTAGES & WHO NEEDS IT */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-[#121215] border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#38BDF8]" />
                  Key Kit Advantages
                </h3>
                <div className="space-y-3">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs text-gray-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[#121215] border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#38BDF8]" />
                  Target Audience
                </h3>
                <div className="space-y-3">
                  {whoNeedsIt.map((who, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs text-gray-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>{who}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* EMAIL BACKUP ACTION BAR */}
            {user && (
              <section className="p-6 rounded-3xl bg-gradient-to-r from-[#0EA5E9]/10 via-[#8B5CF6]/10 to-[#121215] border border-[#0EA5E9]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-white">Need an Email Copy for your team?</h4>
                  <p className="text-xs text-gray-400">Send a direct link to this documentation to {user.email}.</p>
                </div>

                <button
                  onClick={handleManualEmailSend}
                  disabled={sendingEmail || emailSent}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all disabled:opacity-50 shrink-0"
                >
                  {emailSent ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Email Dispatched!</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 text-[#38BDF8]" />
                      <span>{sendingEmail ? 'Sending...' : 'Email Me Link'}</span>
                    </>
                  )}
                </button>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="register"
      />
    </div>
  );
};
