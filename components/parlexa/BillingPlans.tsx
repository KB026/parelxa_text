'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { createPromotionOrder, verifyPromotionPayment } from '@/app/actions/payments';
import { Agent } from '@/lib/types';
import { ShieldCheck, Sparkles, Zap, Check, ArrowUpRight, Crown, Layers } from 'lucide-react';

interface ExtendedAgent extends Agent {
  vendor_plan?: string;
  vendor_plan_expires_at?: string | null;
  approval_status?: string;
}

interface BillingPlansProps {
  initialAgents: ExtendedAgent[];
}

type PlanId = 'free' | 'growth' | 'pro' | 'growth_annual' | 'pro_annual';
type FeatureIcon = 'check' | 'dash' | 'cross';

interface PlanFeature {
  text: string;
  icon: FeatureIcon;
}

interface Plan {
  id: PlanId;
  listingNum: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  priceSub: string;
  reachRightLabel: string;
  reachPercent: number;
  reachDescription: string;
  reachBold: string;
  features: PlanFeature[];
  cta: string;
  badge?: string;
  highlighted?: boolean;
}

const BRAND_GRAD = 'linear-gradient(135deg, #c026d3 0%, #7c3aed 50%, #2563eb 100%)';
const PRO_GRAD = 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)';

const ANNUAL_PLANS: Plan[] = [
  {
    id: 'free',
    listingNum: 'TIER / 01',
    name: 'Launch Plan',
    tagline: 'Basic entry in the Parlexa directory.',
    price: 'Free',
    priceNote: '/ forever',
    priceSub: 'No card required',
    reachRightLabel: 'INDEX ONLY',
    reachPercent: 20,
    reachDescription: "Buyers can discover your tool. They can’t click through —",
    reachBold: 'no direct link to your site.',
    features: [
      { text: 'Name, logo, one-line tagline', icon: 'dash' },
      { text: '1 category listing', icon: 'dash' },
      { text: 'Link to your website', icon: 'cross' },
      { text: 'Screenshots & demo video gallery', icon: 'cross' },
      { text: 'Pricing shown to buyers', icon: 'cross' },
      { text: 'Customer reviews enabled', icon: 'cross' },
      { text: 'Standard review queue', icon: 'dash' },
    ],
    cta: 'Current Plan',
  },
  {
    id: 'growth_annual',
    listingNum: 'TIER / 02',
    name: 'Growth Plan',
    tagline: 'Complete, trusted profile for a full year with direct dofollow traffic.',
    price: '₹4,999',
    priceNote: '/ year',
    priceSub: '(Taxes included)',
    reachRightLabel: 'YOUR SITE',
    reachPercent: 60,
    reachDescription: 'Buyers click through directly —',
    reachBold: 'dofollow backlink, live for 365 days.',
    badge: 'POPULAR CHOICE',
    highlighted: true,
    features: [
      { text: 'Everything in Launch', icon: 'check' },
      { text: 'Direct link to your website (dofollow SEO)', icon: 'check' },
      { text: 'Verified Vendor badge (1 Full Year)', icon: 'check' },
      { text: '3 categories + custom target audience tags', icon: 'check' },
      { text: 'Media gallery & product screenshots', icon: 'check' },
      { text: 'Pricing model & tiers displayed to buyers', icon: 'check' },
      { text: 'Customer reviews & rating enabled', icon: 'check' },
      { text: 'Priority review within 24 hours', icon: 'check' },
    ],
    cta: 'Upgrade to Growth',
  },
  {
    id: 'pro_annual',
    listingNum: 'TIER / 03',
    name: 'Scale Plan',
    tagline: 'Top-tier visibility, homepage rotation, and high-intent buyer lead capture.',
    price: '₹8,499',
    priceNote: '/ year',
    priceSub: '(Taxes included)',
    reachRightLabel: 'HOMEPAGE',
    reachPercent: 100,
    reachDescription: 'Buyers see your tool first —',
    reachBold: 'top of search, homepage rotation, 365 days.',
    badge: 'HIGHEST TIER (BEST ROI)',
    features: [
      { text: 'Everything in Growth Plan', icon: 'check' },
      { text: 'Featured Badge & Homepage Hero Rotation (1 Year)', icon: 'check' },
      { text: 'Top-of-category premium placement', icon: 'check' },
      { text: '5 categories + extended profile features', icon: 'check' },
      { text: 'Direct Buyer Lead Capture routed to your CRM/Inbox', icon: 'check' },
      { text: 'Competitor benchmarking & intent analytics', icon: 'check' },
      { text: 'Newsletter & comparison page spotlight', icon: 'check' },
      { text: 'Dedicated vendor support & 12h fast-track review', icon: 'check' },
    ],
    cta: 'Upgrade to Scale',
  },
];

function normalizePlanTier(plan?: string): 'free' | 'growth' | 'pro' {
  if (!plan || plan === 'free' || plan === 'free_forever') return 'free';
  if (plan === 'growth' || plan === 'growth_annual') return 'growth';
  if (plan === 'pro' || plan === 'pro_annual' || plan === 'scale' || plan === 'scale_annual') return 'pro';
  return 'free';
}

export default function BillingPlans({ initialAgents }: BillingPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgents[0]?.id?.toString() || '');
  const [error, setError] = useState<string | null>(null);
  const plansGridRef = useRef<HTMLDivElement>(null);

  // Selected tool details
  const selectedAgent = initialAgents.find(a => String(a.id) === String(selectedAgentId)) || initialAgents[0];
  const currentPlanTier = normalizePlanTier(selectedAgent?.vendor_plan);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_type: 'percentage' | 'flat';
    discount_value: number;
    breakdowns: Record<string, {
      originalBase: number;
      discountAmount: number;
      discountedBase: number;
      gstAmount: number;
      finalTotal: number;
    }>;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const activePlans = ANNUAL_PLANS;

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), basePrice: 4999 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon');

      const breakdowns: Record<string, {
        originalBase: number;
        discountAmount: number;
        discountedBase: number;
        gstAmount: number;
        finalTotal: number;
      }> = {};

      const baseMap: Record<string, number> = {
        growth_annual: 4999,
        pro_annual: 8499,
      };

      for (const p of activePlans) {
        if (p.id === 'free') continue;
        const base = baseMap[p.id] || 4999;
        let disc = 0;
        if (data.discount_type === 'percentage') {
          disc = Math.round((base * data.discount_value) / 100);
        } else {
          disc = Math.min(data.discount_value, base);
        }
        const finalTotal = Math.max(0, base - disc);
        const discBase = Math.round(finalTotal / 1.18);
        const gst = finalTotal - discBase;
        breakdowns[p.id] = {
          originalBase: base,
          discountAmount: disc,
          discountedBase: discBase,
          gstAmount: gst,
          finalTotal,
        };
      }

      setAppliedCoupon({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        breakdowns,
      });
      setCouponSuccess(`Coupon "${data.code}" applied! ${data.discount_type === 'percentage' ? `${data.discount_value}% OFF` : `₹${data.discount_value} OFF`}`);
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponSuccess(null);
    setCouponError(null);
  }

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === 'free') return;
    const targetAgentId = selectedAgentId || (initialAgents[0]?.id ? String(initialAgents[0].id) : '');
    if (!targetAgentId) {
      setError('Please select or create a listing first to upgrade.');
      return;
    }
    setLoading(planId);
    setError(null);
    try {
      const res = await createPromotionOrder(Number(targetAgentId), planId, appliedCoupon?.code);
      if (!res.success || !res.orderId) throw new Error(res.error || 'Failed to initiate payment');
      
      const orderData = res as { isMock?: boolean; orderId: string; keyId?: string; amount?: number };
      if (orderData.isMock) {
        setTimeout(async () => {
          const verifyRes = await verifyPromotionPayment({
            razorpay_order_id: res.orderId,
            razorpay_payment_id: 'mock_pay_123',
            razorpay_signature: 'mock_signature',
            agentId: Number(targetAgentId),
            plan: planId,
          });
          if (verifyRes.success) window.location.href = '/dashboard/vendor/billing?upgraded=success';
          else { setError(verifyRes.error || 'Mock payment failed'); setLoading(null); }
        }, 1500);
        return;
      }

      await loadRazorpayScript();
      const RazorpaySDK = (window as any)?.Razorpay;
      if (!RazorpaySDK) throw new Error('Razorpay checkout is loading. Please try clicking again.');
      
      const options = {
        key: res.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: res.amount,
        currency: 'INR',
        name: 'Parlexa',
        description: `${planId.startsWith('growth') ? 'Growth' : 'Scale'} Annual Plan`,
        order_id: res.orderId,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          setLoading(planId);
          const verifyRes = await verifyPromotionPayment({ ...response, agentId: Number(targetAgentId), plan: planId });
          if (verifyRes.success) window.location.href = '/dashboard/vendor/billing?upgraded=success';
          else { setError(verifyRes.error || 'Payment verification failed'); setLoading(null); }
        },
        theme: { color: '#7c3aed' },
        modal: { ondismiss: () => setLoading(null) },
      };
      
      const rzpInstance = new RazorpaySDK(options);
      rzpInstance.open();
    } catch (err: unknown) {
      console.error('[BillingPlans] Upgrade error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(null);
    }
  };

  const scrollToPlans = () => {
    plansGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <style>{`
        @keyframes bp-spin { to { transform: rotate(360deg); } }
        .bp-card {
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease, border-color 0.2s ease;
        }
        .bp-card:hover { transform: translateY(-4px); }
        .bp-cta {
          transition: opacity 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease;
        }
        .bp-cta:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        @media (max-width: 880px) {
          .bp-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── TOOL SWITCHER TABS (Always visible when listings exist) ── */}
      {initialAgents.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {initialAgents.length > 1 ? 'Select Tool to Manage / Upgrade:' : 'Currently Selected Listing:'}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {initialAgents.map((agent) => {
              const tier = normalizePlanTier((agent as any).vendor_plan);
              const isSelected = String(agent.id) === String(selectedAgent?.id);
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgentId(String(agent.id))}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    border: isSelected
                      ? tier === 'pro' ? '1.5px solid #38bdf8' : '1.5px solid #a855f7'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected
                      ? tier === 'pro' ? 'rgba(56,189,248,0.15)' : 'rgba(168,85,247,0.15)'
                      : 'rgba(255,255,255,0.03)',
                    color: isSelected ? '#fff' : 'var(--text-dim)',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  {tier === 'pro' && <Crown size={14} color="#38bdf8" />}
                  {tier === 'growth' && <ShieldCheck size={14} color="#c084fc" />}
                  <span>{agent.name}</span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    background: tier === 'pro' ? 'rgba(56,189,248,0.2)' : tier === 'growth' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.08)',
                    color: tier === 'pro' ? '#38bdf8' : tier === 'growth' ? '#c084fc' : 'var(--text-dim)',
                    fontWeight: 600,
                  }}>
                    {tier === 'pro' ? 'Scale Plan' : tier === 'growth' ? 'Growth Plan' : 'Free Plan'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 1. CURRENT ACTIVE PLAN RECOGNITION HERO ── */}
      {selectedAgent ? (
        <div style={{
          marginBottom: '32px', padding: '24px 28px',
          background: currentPlanTier === 'pro'
            ? 'linear-gradient(135deg, rgba(56,189,248,0.1) 0%, rgba(129,140,248,0.08) 50%, rgba(192,132,252,0.08) 100%)'
            : currentPlanTier === 'growth'
            ? 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.08) 100%)'
            : 'rgba(255,255,255,0.03)',
          border: currentPlanTier === 'pro'
            ? '1.5px solid rgba(56,189,248,0.35)'
            : currentPlanTier === 'growth'
            ? '1.5px solid rgba(124,58,237,0.35)'
            : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          boxShadow: currentPlanTier === 'pro'
            ? '0 12px 36px rgba(56,189,248,0.1)'
            : currentPlanTier === 'growth'
            ? '0 12px 36px rgba(124,58,237,0.1)'
            : 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                  Active Listing Subscription
                </span>
                {currentPlanTier === 'pro' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 800,
                    background: PRO_GRAD, color: '#09090b', letterSpacing: '0.04em',
                  }}>
                    <Crown size={12} /> HIGHEST TIER ACTIVE
                  </span>
                )}
                {currentPlanTier === 'growth' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                    background: 'rgba(124,58,237,0.2)', color: '#c084fc', border: '1px solid rgba(124,58,237,0.4)',
                  }}>
                    <ShieldCheck size={12} /> GROWTH ACTIVE
                  </span>
                )}
                {currentPlanTier === 'free' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                    background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)', border: '1px solid rgba(255,255,255,0.12)',
                  }}>
                    LAUNCH (FREE)
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selectedAgent.name}
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>
                  — {currentPlanTier === 'pro' ? 'Scale Plan (₹8,499/yr)' : currentPlanTier === 'growth' ? 'Growth Plan (₹4,999/yr)' : 'Launch Plan (₹0)'}
                </span>
              </h2>

              <p style={{ fontSize: '13.5px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6, maxWidth: '650px' }}>
                {currentPlanTier === 'pro' && (
                  <>🎉 Your tool is on the <strong>Highest Plan (Scale Annual)</strong>. You have maximum directory prominence, homepage rotation, 5 categories, direct CRM lead routing, and priority review.</>
                )}
                {currentPlanTier === 'growth' && (
                  <>Your tool is active on the <strong>Growth Plan</strong> with a verified badge and dofollow backlink. Upgrade to <strong>Scale Plan</strong> to unlock homepage rotation, top-of-category placement, and buyer lead capture.</>
                )}
                {currentPlanTier === 'free' && (
                  <>Your tool is currently listed on the <strong>Free Launch Plan</strong> (Index only, no website link). Upgrade to <strong>Growth</strong> or <strong>Scale</strong> to enable dofollow links, verified badges, and direct buyer traffic.</>
                )}
              </p>
            </div>

            {/* Quick action button */}
            <div>
              {currentPlanTier === 'pro' ? (
                <div style={{
                  padding: '10px 18px', borderRadius: '12px',
                  background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)',
                  color: '#38bdf8', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Check size={16} /> Maximum Visibility Unlocked
                </div>
              ) : currentPlanTier === 'growth' ? (
                <button
                  type="button"
                  onClick={scrollToPlans}
                  style={{
                    padding: '12px 22px', borderRadius: '12px', border: 'none',
                    background: PRO_GRAD, color: '#09090b', fontSize: '13.5px', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 6px 20px rgba(56,189,248,0.3)',
                  }}
                >
                  <Sparkles size={16} /> Upgrade to Scale (₹8,499)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={scrollToPlans}
                  style={{
                    padding: '12px 22px', borderRadius: '12px', border: 'none',
                    background: BRAND_GRAD, color: '#fff', fontSize: '13.5px', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
                  }}
                >
                  <Zap size={16} /> Upgrade Plan
                </button>
              )}
            </div>
          </div>

          {/* Listing Selector if multiple listings exist */}
          {initialAgents.length > 1 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Switch Listing:</span>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                style={{
                  padding: '6px 12px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: '13px', outline: 'none',
                }}
              >
                {initialAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({(agent as any).vendor_plan === 'pro_annual' ? 'Scale' : (agent as any).vendor_plan === 'growth_annual' ? 'Growth' : 'Launch'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          marginBottom: '32px', padding: '32px', textAlign: 'center',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '20px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No Listings Found</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '18px' }}>Create your first AI tool listing to unlock premium promotion and verified badges.</p>
          <Link
            href="/dashboard/vendor/listings/new"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px', background: BRAND_GRAD,
              color: '#fff', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none',
            }}
          >
            + Create New Listing
          </Link>
        </div>
      )}

      {error && (
        <div style={{
          padding: '13px 18px', background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
          color: '#fca5a5', fontSize: '14px', marginBottom: '24px',
        }}>
          {error}
        </div>
      )}

      {/* ── 2. COUPON CODE BAR ── */}
      <div style={{
        maxWidth: '520px', margin: '0 auto 28px',
        background: 'rgba(255,255,255,0.03)',
        border: appliedCoupon ? '1px solid rgba(134,239,172,0.3)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '14px 18px',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            disabled={couponLoading || !!appliedCoupon}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '13px',
              letterSpacing: '0.05em',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              outline: 'none',
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
          />
          {appliedCoupon ? (
            <button
              type="button"
              onClick={handleRemoveCoupon}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.1)',
                color: '#fca5a5',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: BRAND_GRAD,
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: couponLoading || !couponInput.trim() ? 'not-allowed' : 'pointer',
                opacity: couponLoading || !couponInput.trim() ? 0.5 : 1,
                boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
              }}
            >
              {couponLoading ? 'Checking...' : 'Apply'}
            </button>
          )}
        </div>
        {couponSuccess && (
          <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#86efac', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✔</span> {couponSuccess}
          </div>
        )}
        {couponError && (
          <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✖</span> {couponError}
          </div>
        )}
      </div>

      {/* ── 3. ANNUAL PLAN UPGRADE CARDS ── */}
      <div
        ref={plansGridRef}
        className="bp-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '18px',
          alignItems: 'stretch',
        }}
      >
        {activePlans.map((plan, idx) => (
          <BillingCard
            key={plan.id}
            plan={plan}
            delay={idx * 0.06}
            loading={loading}
            currentPlanTier={currentPlanTier}
            appliedCoupon={appliedCoupon}
            onSelect={() => handleUpgrade(plan.id)}
          />
        ))}
      </div>
    </>
  );
}

function BillingCard({ plan, delay, loading, currentPlanTier, onSelect, appliedCoupon }: {
  plan: Plan;
  delay: number;
  loading: string | null;
  currentPlanTier: 'free' | 'growth' | 'pro';
  onSelect: () => void;
  appliedCoupon?: {
    code: string;
    discount_type: 'percentage' | 'flat';
    discount_value: number;
    breakdowns: Record<string, {
      originalBase: number;
      discountAmount: number;
      discountedBase: number;
      gstAmount: number;
      finalTotal: number;
    }>;
  } | null;
}) {
  const [hovered, setHovered] = useState(false);
  const isLoading = loading === plan.id;
  const isFree = plan.id === 'free';
  const isGrowth = plan.id === 'growth_annual';
  const isPro = plan.id === 'pro_annual';

  // Determine relation to current active plan
  const isCurrentPlan = (isFree && currentPlanTier === 'free') ||
                        (isGrowth && currentPlanTier === 'growth') ||
                        (isPro && currentPlanTier === 'pro');

  const isIncluded = (isFree && (currentPlanTier === 'growth' || currentPlanTier === 'pro')) ||
                     (isGrowth && currentPlanTier === 'pro');

  const isUpgradeAvailable = !isCurrentPlan && !isIncluded;

  const breakdown = appliedCoupon?.breakdowns[plan.id];

  return (
    <div
      className="bp-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${delay}s`,
        borderRadius: '18px',
        padding: isGrowth ? '30px 24px 24px' : '26px 22px 22px',
        background: isCurrentPlan
          ? 'linear-gradient(160deg, rgba(34,197,94,0.06) 0%, rgba(255,255,255,0.02) 100%)'
          : isGrowth
          ? 'linear-gradient(160deg, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.06) 100%)'
          : isPro
          ? 'linear-gradient(160deg, rgba(56,189,248,0.06) 0%, rgba(129,140,248,0.04) 100%)'
          : 'var(--bg-card)',
        border: isCurrentPlan
          ? `1.5px solid rgba(34,197,94,0.4)`
          : isGrowth
          ? `1.5px solid ${hovered ? 'rgba(124,58,237,0.55)' : 'rgba(124,58,237,0.25)'}`
          : isPro
          ? `1.5px solid ${hovered ? 'rgba(56,189,248,0.5)' : 'rgba(56,189,248,0.2)'}`
          : `1.5px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'var(--border-subtle)'}`,
        boxShadow: isCurrentPlan
          ? '0 6px 24px rgba(34,197,94,0.12)'
          : isGrowth && hovered
          ? '0 16px 48px rgba(124,58,237,0.25)'
          : isPro && hovered
          ? '0 16px 48px rgba(56,189,248,0.2)'
          : 'none',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top accent line */}
      {(isGrowth || isPro || isCurrentPlan) && (
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
          background: isCurrentPlan
            ? 'linear-gradient(90deg, transparent, rgba(34,197,94,0.7), transparent)'
            : isGrowth
            ? 'linear-gradient(90deg, transparent, rgba(192,38,211,0.7), rgba(37,99,235,0.7), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(56,189,248,0.8), rgba(192,132,252,0.8), transparent)',
          borderRadius: '1px',
          opacity: hovered || isCurrentPlan ? 1 : 0.5,
          transition: 'opacity 0.3s ease',
        }} />
      )}

      {/* Plan badge */}
      {isCurrentPlan ? (
        <div style={{
          position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', color: '#fff',
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em',
          padding: '4px 14px', borderRadius: '100px', whiteSpace: 'nowrap',
          boxShadow: '0 4px 14px rgba(34,197,94,0.35)',
        }}>
          ✔ CURRENT ACTIVE PLAN
        </div>
      ) : plan.badge ? (
        <div style={{
          position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
          background: isPro ? PRO_GRAD : BRAND_GRAD,
          color: isPro ? '#09090b' : '#fff',
          fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.12em',
          padding: '4px 14px', borderRadius: '100px', whiteSpace: 'nowrap',
          boxShadow: isPro ? '0 4px 14px rgba(56,189,248,0.3)' : '0 4px 14px rgba(124,58,237,0.35)',
        }}>
          {plan.badge}
        </div>
      ) : null}

      {/* Tier number */}
      <div style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em',
        color: isGrowth ? 'rgba(192,38,211,0.65)' : isPro ? 'rgba(56,189,248,0.7)' : 'var(--text-dim)',
        marginBottom: '10px', fontFamily: 'monospace',
      }}>
        {plan.listingNum}
      </div>

      {/* Plan name */}
      <div style={{
        fontSize: '26px', fontWeight: 700,
        fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
        lineHeight: 1.1, marginBottom: '6px', letterSpacing: '-0.3px',
        background: isGrowth ? BRAND_GRAD : isPro ? PRO_GRAD : undefined,
        WebkitBackgroundClip: isGrowth || isPro ? 'text' : undefined,
        WebkitTextFillColor: isGrowth || isPro ? 'transparent' : 'var(--text-white)',
        backgroundClip: isGrowth || isPro ? 'text' : undefined,
        color: isGrowth || isPro ? undefined : 'var(--text-white)',
      }}>
        {plan.name}
      </div>

      {/* Tagline */}
      <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginBottom: '18px', lineHeight: 1.5, minHeight: '36px' }}>
        {plan.tagline}
      </p>

      {/* Price */}
      <div style={{ marginBottom: '18px' }}>
        {breakdown && !isFree ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', textDecoration: 'line-through', color: 'var(--text-dim)', fontWeight: 600 }}>
                {plan.price}
              </span>
              <span style={{
                fontSize: '34px', fontWeight: 700, lineHeight: 1, letterSpacing: '-1px',
                fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
                color: '#86efac',
              }}>
                ₹{breakdown.finalTotal.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                {plan.priceNote}
              </span>
            </div>
            <div style={{
              fontSize: '11px', color: '#86efac', fontWeight: 600, marginTop: '3px',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: 'rgba(134,239,172,0.1)', padding: '3px 8px', borderRadius: '6px',
            }}>
              40% OFF Applied • Includes ₹{breakdown.gstAmount.toLocaleString('en-IN')} GST
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2px' }}>
              <span style={{
                fontSize: '34px', fontWeight: 700, lineHeight: 1, letterSpacing: '-1px',
                fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
                color: 'var(--text-white)',
              }}>
                {plan.price}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                {plan.priceNote}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>
              {plan.priceSub}
            </div>
          </>
        )}
      </div>

      {/* Reach Bar */}
      <div style={{
        marginBottom: '20px', padding: '12px 14px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '8px' }}>
          <span>BUYER REACH</span>
          <span style={{ color: isPro ? '#38bdf8' : isGrowth ? '#c084fc' : 'var(--text-dim)' }}>{plan.reachRightLabel}</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
          <div style={{
            height: '100%', width: `${plan.reachPercent}%`,
            background: isPro ? PRO_GRAD : isGrowth ? BRAND_GRAD : 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
          }} />
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.4 }}>
          {plan.reachDescription} <strong style={{ color: '#fff' }}>{plan.reachBold}</strong>
        </div>
      </div>

      {/* Features list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', flex: 1 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
              background: f.icon === 'check' ? 'rgba(34,197,94,0.15)' : f.icon === 'dash' ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.1)',
              color: f.icon === 'check' ? '#4ade80' : f.icon === 'dash' ? 'var(--text-dim)' : '#f87171',
              fontSize: '10px', fontWeight: 700,
            }}>
              {f.icon === 'check' ? '✓' : f.icon === 'dash' ? '—' : '✕'}
            </span>
            <span style={{
              color: f.icon === 'cross' ? 'rgba(255,255,255,0.3)' : f.icon === 'dash' ? 'var(--text-dim)' : 'var(--text-muted)',
              lineHeight: 1.4,
            }}>
              {f.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA button */}
      <div>
        {isCurrentPlan ? (
          <button
            type="button"
            disabled
            style={{
              width: '100%', padding: '13px', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.3)',
              background: 'rgba(34,197,94,0.12)', color: '#4ade80',
              fontSize: '13.5px', fontWeight: 700, cursor: 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <Check size={16} /> Current Active Plan
          </button>
        ) : isIncluded ? (
          <button
            type="button"
            disabled
            style={{
              width: '100%', padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)',
              fontSize: '13.5px', fontWeight: 600, cursor: 'default',
            }}
          >
            Included in Current Tier
          </button>
        ) : (
          <button
            type="button"
            className="bp-cta"
            disabled={!!loading}
            onClick={onSelect}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
              background: isPro ? PRO_GRAD : BRAND_GRAD,
              color: isPro ? '#09090b' : '#fff',
              fontSize: '13.5px', fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: isPro ? '0 6px 20px rgba(56,189,248,0.3)' : '0 6px 20px rgba(124,58,237,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            {isLoading ? (
              <>
                <span style={{
                  display: 'inline-block', width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                  borderRadius: '50%', animation: 'bp-spin 0.8s linear infinite',
                }} />
                Processing...
              </>
            ) : breakdown ? (
              `Pay ₹${breakdown.finalTotal.toLocaleString('en-IN')} with Razorpay`
            ) : isPro ? (
              'Upgrade to Scale Plan'
            ) : (
              'Upgrade to Growth Plan'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
