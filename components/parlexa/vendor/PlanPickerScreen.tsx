'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

type PlanId = 'free' | 'growth' | 'pro' | 'growth_annual' | 'pro_annual';

interface PlanPickerScreenProps {
  toolName: string;
  agentId?: number;
  formData?: any;
  onClearDraft?: () => void;
}

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
  amountPaise: number;
  reachRightLabel: string;
  reachPercent: number;
  reachDescription: string;
  reachBold: string;
  features: PlanFeature[];
  cta: string;
  badge?: string;
  highlighted?: boolean;
}

const MONTHLY_PLANS: Plan[] = [
  {
    id: 'free',
    listingNum: 'LISTING / 01',
    name: 'Launch Plan',
    tagline: 'A bare entry in the directory. Get on the map, free forever.',
    price: 'Free',
    priceNote: '/ forever',
    priceSub: 'No card required',
    amountPaise: 0,
    reachRightLabel: 'INDEX ONLY',
    reachPercent: 20,
    reachDescription: "Buyers can find you. They can\u2019t click through \u2014",
    reachBold: 'no link to your site.',
    features: [
      { text: 'Name, logo, one-line tagline', icon: 'dash' },
      { text: '1 category', icon: 'dash' },
      { text: 'Link to your website', icon: 'cross' },
      { text: 'Screenshots or demo video', icon: 'cross' },
      { text: 'Pricing shown to buyers', icon: 'cross' },
      { text: 'Reviews enabled', icon: 'cross' },
      { text: 'Manual review, up to 1 week', icon: 'dash' },
    ],
    cta: 'List for free',
  },
  {
    id: 'growth',
    listingNum: 'LISTING / 02',
    name: 'Growth Plan',
    tagline: 'A complete, trusted profile buyers can act on.',
    price: '\u20b9499',
    priceNote: '/ month',
    priceSub: '+ 18% GST billed monthly',
    amountPaise: 49900,
    reachRightLabel: 'YOUR SITE',
    reachPercent: 60,
    reachDescription: 'Buyers can click through \u2014',
    reachBold: 'dofollow link, live and reachable.',
    badge: 'MOST POPULAR',
    highlighted: true,
    features: [
      { text: 'Everything in Launch', icon: 'check' },
      { text: 'Link to your website (dofollow)', icon: 'check' },
      { text: 'Verified badge', icon: 'check' },
      { text: '3 categories + audience tags', icon: 'check' },
      { text: 'Media gallery on your profile', icon: 'check' },
      { text: 'Pricing shown to buyers', icon: 'check' },
      { text: 'Reviews enabled', icon: 'check' },
      { text: 'Review within 72 hours', icon: 'check' },
    ],
    cta: 'Start Growth',
  },
  {
    id: 'pro',
    listingNum: 'LISTING / 03',
    name: 'Scale Plan',
    tagline: 'Promoted placement and leads routed straight to you.',
    price: '\u20b9899',
    priceNote: '/ month',
    priceSub: '+ 18% GST billed monthly',
    amountPaise: 89900,
    reachRightLabel: 'HOMEPAGE',
    reachPercent: 100,
    reachDescription: 'Buyers see you first \u2014',
    reachBold: 'top of search, homepage rotation, newsletter.',
    features: [
      { text: 'Everything in Growth', icon: 'check' },
      { text: 'Featured badge + homepage rotation', icon: 'check' },
      { text: 'Top-of-category search placement', icon: 'check' },
      { text: '5 categories, extended profile', icon: 'check' },
      { text: 'Lead capture \u2192 your inbox/CRM', icon: 'check' },
      { text: 'Buyer intent & benchmarking data', icon: 'check' },
      { text: 'Newsletter + comparison-page inclusion', icon: 'check' },
      { text: 'Review within 24 hours, dedicated support', icon: 'check' },
    ],
    cta: 'Get Scale',
  },
];

const ANNUAL_PLANS: Plan[] = [
  {
    id: 'free',
    listingNum: 'LISTING / 01',
    name: 'Launch Plan',
    tagline: 'A bare entry in the directory. Get on the map, free forever.',
    price: 'Free',
    priceNote: '/ forever',
    priceSub: 'No card required',
    amountPaise: 0,
    reachRightLabel: 'INDEX ONLY',
    reachPercent: 20,
    reachDescription: "Buyers can find you. They can\u2019t click through \u2014",
    reachBold: 'no link to your site.',
    features: [
      { text: 'Name, logo, one-line tagline', icon: 'dash' },
      { text: '1 category', icon: 'dash' },
      { text: 'Link to your website', icon: 'cross' },
      { text: 'Screenshots or demo video', icon: 'cross' },
      { text: 'Pricing shown to buyers', icon: 'cross' },
      { text: 'Reviews enabled', icon: 'cross' },
      { text: 'Manual review, up to 1 week', icon: 'dash' },
    ],
    cta: 'List for free',
  },
  {
    id: 'growth_annual',
    listingNum: 'LISTING / 02',
    name: 'Growth Plan',
    tagline: 'A complete, trusted profile for a full year. Save \u20b9989/yr.',
    price: '₹4,999',
    priceNote: '/ year',
    priceSub: '(Taxes included)',
    amountPaise: 499900,
    reachRightLabel: 'YOUR SITE',
    reachPercent: 60,
    reachDescription: 'Buyers can click through \u2014',
    reachBold: 'dofollow link, live for 365 days.',
    badge: 'POPULAR CHOICE',
    highlighted: true,
    features: [
      { text: 'Everything in Launch', icon: 'check' },
      { text: 'Link to your website (dofollow)', icon: 'check' },
      { text: 'Verified badge (1 Full Year)', icon: 'check' },
      { text: '3 categories + audience tags', icon: 'check' },
      { text: 'Media gallery on your profile', icon: 'check' },
      { text: 'Pricing shown to buyers', icon: 'check' },
      { text: 'Reviews enabled', icon: 'check' },
      { text: 'Priority review within 24 hours', icon: 'check' },
    ],
    cta: 'Start Growth',
  },
  {
    id: 'pro_annual',
    listingNum: 'LISTING / 03',
    name: 'Scale Plan',
    tagline: 'Maximum visibility & leads for a full year. Save \u20b92,289/yr.',
    price: '₹8,499',
    priceNote: '/ year',
    priceSub: '(Taxes included)',
    amountPaise: 849900,
    reachRightLabel: 'HOMEPAGE',
    reachPercent: 100,
    reachDescription: 'Buyers see you first \u2014',
    reachBold: 'top of search, homepage rotation, 365 days.',
    badge: 'BEST VALUE (SAVE 21%)',
    features: [
      { text: 'Everything in Growth', icon: 'check' },
      { text: 'Featured badge + homepage rotation (1 Year)', icon: 'check' },
      { text: 'Top-of-category search placement', icon: 'check' },
      { text: '5 categories, extended profile', icon: 'check' },
      { text: 'Lead capture \u2192 your inbox/CRM', icon: 'check' },
      { text: 'Buyer intent & benchmarking data', icon: 'check' },
      { text: 'Newsletter + comparison-page inclusion', icon: 'check' },
      { text: 'Dedicated account manager & support', icon: 'check' },
    ],
    cta: 'Get Scale',
  },
];

// Brand colours extracted from globals.css + logo
const BRAND = {
  bg:        '#09090b',
  bgCard:    'rgba(255,255,255,0.03)',
  bgElevated:'#0f0f13',
  border:    'rgba(255,255,255,0.07)',
  cyan:      '#38bdf8',
  purple:    '#c026d3',
  blue:      '#2563eb',
  // Logo gradient: purple -> blue
  grad:      'linear-gradient(135deg, #c026d3 0%, #7c3aed 50%, #2563eb 100%)',
  gradGlow:  'rgba(192,38,211,0.25)',
  textWhite: '#f1f5f9',
  textMuted: '#7a90b0',
  textDim:   '#4a5f80',
};

export default function PlanPickerScreen({
  toolName,
  agentId,
  formData,
  onClearDraft,
}: PlanPickerScreenProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const activePlans = billingCycle === 'annual' ? ANNUAL_PLANS : MONTHLY_PLANS;

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!mounted) return null;

  async function createAndSubmitListing(
    planId: PlanId,
    paymentId?: string,
    subscriptionOrOrderId?: string,
    signature?: string
  ) {
    if (agentId) {
      // Existing agent upgrade flow
      const res = await fetch('/api/vendor/confirm-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          plan: planId,
          razorpay_payment_id: paymentId || null,
          razorpay_subscription_id: subscriptionOrOrderId || null,
          razorpay_signature: signature || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Plan confirmation failed');
      return data;
    } else if (formData) {
      // NEW Listing creation flow (Inserted into DB FOR THE FIRST TIME here!)
      const finalSource = formData.how_did_you_hear === 'Other' && formData.how_did_you_hear_custom
        ? `Other: ${formData.how_did_you_hear_custom.trim()}`
        : formData.how_did_you_hear;

      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          how_did_you_hear: finalSource,
          plan: planId,
          razorpay_payment_id: paymentId || null,
          razorpay_subscription_id: subscriptionOrOrderId || null,
          razorpay_signature: signature || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Listing creation failed');

      if (onClearDraft) onClearDraft();
      return data;
    } else {
      throw new Error('Missing form data or agent ID');
    }
  }

  async function handleFree() {
    setLoading('free');
    setError(null);
    try {
      await createAndSubmitListing('free');
      router.push('/dashboard/vendor/listings?submitted=true');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(null);
    }
  }

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
        growth: 499,
        pro: 899,
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

  async function handlePaid(planId: PlanId) {
    if (planId === 'free') return handleFree();
    setLoading(planId);
    setError(null);
    try {
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        setError('Payment gateway key missing. Please contact support.');
        setLoading(null);
        return;
      }
      const orderRes = await fetch('/api/vendor/create-plan-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentId || 0,
          plan: planId,
          couponCode: appliedCoupon?.code || undefined,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      // Test Mode / Sandbox handling: Bypass SDK modal and simulate instant successful payment
      if (orderData.isMock) {
        await createAndSubmitListing(
          planId,
          `mock_pay_${Date.now()}`,
          orderData.subscriptionId || orderData.orderId || `mock_sub_${Date.now()}`,
          'mock_signature'
        );
        router.push(`/dashboard/vendor/listings?submitted=true&plan=${planId}`);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RzpSDK = (window as any).Razorpay;
      if (!RzpSDK) throw new Error('Razorpay SDK not loaded. Refresh and retry.');
      const plan = activePlans.find(p => p.id === planId)!;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = {
        key: orderData.keyId || razorpayKey,
        name: 'Parlexa',
        description: `${plan.name} Plan`,
        theme: { color: '#7c3aed' },
        modal: { ondismiss: () => setLoading(null) },
        handler: async (r: { razorpay_payment_id: string; razorpay_subscription_id?: string; razorpay_order_id?: string; razorpay_signature?: string }) => {
          await createAndSubmitListing(
            planId,
            r.razorpay_payment_id,
            r.razorpay_subscription_id || r.razorpay_order_id,
            r.razorpay_signature
          );
          router.push(`/dashboard/vendor/listings?submitted=true&plan=${planId}`);
        },
      };

      if (orderData.subscriptionId) {
        options.subscription_id = orderData.subscriptionId;
      } else if (orderData.orderId) {
        options.order_id = orderData.orderId;
        options.amount = orderData.amount;
        options.currency = orderData.currency || 'INR';
      }

      if (orderData.offerId || appliedCoupon?.code === 'EARLY250') {
        options.offer_id = orderData.offerId || 'offer_TRIdCGgr6BBUWH';
      }

      const rzp = new RzpSDK(options);
      rzp.open();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Payment failed');
      setLoading(null);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <style>{`
        @keyframes pp-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pp-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pp-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .pp-overlay { animation: pp-fade-up 0.4s ease both; }
        .pp-card {
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.22s ease,
                      border-color 0.2s ease;
        }
        .pp-card:hover { transform: translateY(-5px); }
        .pp-cta {
          transition: opacity 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .pp-cta:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(192,38,211,0.3);
        }
        .pp-cta-plain:hover:not(:disabled) {
          background: rgba(255,255,255,0.06) !important;
          box-shadow: none;
        }
        .pp-scroll::-webkit-scrollbar { width: 5px; }
        .pp-scroll::-webkit-scrollbar-track { background: #09090b; }
        .pp-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        @media (max-width: 900px) {
          .pp-grid { grid-template-columns: 1fr !important; max-width: 460px !important; }
        }
      `}</style>

      {/* Full-screen overlay */}
      <div
        className="pp-scroll"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          overflowY: 'auto',
          background: BRAND.bg,
          fontFamily: "'DM Sans', sans-serif",
          color: BRAND.textWhite,
        }}
      >
        {/* Ambient background glow */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
            width: '800px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(192,38,211,0.10) 0%, transparent 65%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-100px', right: '-100px',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 65%)',
          }} />
          {/* Subtle grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        {/* â”€â”€ HEADER â”€â”€ */}
        <div
          className="pp-overlay"
          style={{ textAlign: 'center', padding: '56px 32px 40px', position: 'relative', zIndex: 1 }}
        >
          {/* Success pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '100px', padding: '6px 18px',
            fontSize: '12.5px', color: 'rgba(255,255,255,0.55)',
            marginBottom: '28px', backdropFilter: 'blur(8px)',
          }}>
            <span style={{
              width: '18px', height: '18px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 0 10px rgba(16,185,129,0.4)',
            }}>
              <svg width="9" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <strong style={{ color: BRAND.textWhite }}>&ldquo;{toolName}&rdquo;</strong>
            <span>submitted successfully</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
            fontSize: 'clamp(26px, 3.5vw, 42px)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #fff 0%, #38bdf8 60%, #c026d3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Choose your listing tier
          </h1>
          <p style={{
            color: BRAND.textMuted,
            fontSize: '15px',
            lineHeight: 1.6,
            maxWidth: '420px',
            margin: '0 auto 24px',
          }}>
            Three tiers. Each unlocks more reach, trust signals, and buyer visibility.
          </p>

          {/* Monthly / Annual Billing Toggle - Hidden (monthly payment feature hidden while code is preserved) */}
          {/*
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}>
            <div style={{
              display: 'inline-flex', padding: '4px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '100px',
            }}>
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '8px 20px', borderRadius: '100px', border: 'none',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: billingCycle === 'monthly' ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: billingCycle === 'monthly' ? '#fff' : BRAND.textDim,
                }}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '8px 20px', borderRadius: '100px', border: 'none',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: billingCycle === 'annual' ? BRAND.grad : 'transparent',
                  color: '#fff',
                  boxShadow: billingCycle === 'annual' ? '0 4px 14px rgba(192,38,211,0.3)' : 'none',
                }}
              >
                Annual Billing <span style={{ fontSize: '11px', opacity: 0.9, fontWeight: 700, marginLeft: '4px' }}>(Save up to 21%)</span>
              </button>
            </div>
          </div>
          */}
          
          {/* ── COUPON CODE BAR ── */}
          <div style={{
            maxWidth: '520px', margin: '28px auto 0',
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
                    background: BRAND.grad,
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: couponLoading || !couponInput.trim() ? 'not-allowed' : 'pointer',
                    opacity: couponLoading || !couponInput.trim() ? 0.5 : 1,
                    boxShadow: '0 4px 14px rgba(192,38,211,0.3)',
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
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={{
            maxWidth: '1020px', margin: '0 auto', padding: '0 32px 20px',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              padding: '13px 18px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', color: '#fca5a5', fontSize: '14px', textAlign: 'center',
            }}>
              {error}
            </div>
          </div>
        )}

        {/* ── CARD GRID ── */}
        <div style={{ padding: '0 32px 64px', position: 'relative', zIndex: 1 }}>
          <div
            className="pp-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              maxWidth: '1020px',
              margin: '0 auto',
              alignItems: 'stretch',
            }}
          >
            {activePlans.map((plan, idx) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                delay={idx * 0.08}
                loading={loading}
                appliedCoupon={appliedCoupon}
                onSelect={() => handlePaid(plan.id)}
              />
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          textAlign: 'center', paddingBottom: '48px',
          fontSize: '12px', color: BRAND.textDim,
          letterSpacing: '0.04em', position: 'relative', zIndex: 1,
        }}>
          Secure payments via Razorpay &nbsp;Â·&nbsp; Cancel anytime &nbsp;Â·&nbsp; No lock-in
        </div>
      </div>
    </>
  );
}

function PlanCard({
  plan, delay, loading, onSelect, appliedCoupon,
}: {
  plan: Plan;
  delay: number;
  loading: PlanId | null;
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
  const isActive = loading === plan.id;
  const isDisabled = !!loading;
  const hl = !!plan.highlighted;
  const isPro = plan.id === 'pro' || plan.id === 'pro_annual';

  const breakdown = appliedCoupon?.breakdowns[plan.id];

  // Per-plan accent
  const accent = hl
    ? 'linear-gradient(135deg, #c026d3 0%, #7c3aed 50%, #2563eb 100%)'   // brand gradient
    : isPro
    ? '#38bdf8'   // cyan for Featured
    : 'rgba(255,255,255,0.15)'; // subtle for Free

  const accentSolid = hl ? '#7c3aed' : isPro ? '#38bdf8' : 'rgba(255,255,255,0.2)';

  return (
    <div
      className="pp-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${delay}s`,
        borderRadius: '16px',
        padding: hl ? '30px 26px 26px' : '28px 24px 24px',
        // Highlighted card gets a subtle gradient background
        background: hl
          ? 'linear-gradient(160deg, rgba(124,58,237,0.15) 0%, rgba(37,99,235,0.08) 100%)'
          : isPro
          ? 'linear-gradient(160deg, rgba(56,189,248,0.05) 0%, rgba(15,15,19,0.8) 100%)'
          : 'rgba(255,255,255,0.02)',
        border: hl
          ? `1.5px solid ${hovered ? 'rgba(124,58,237,0.6)' : 'rgba(124,58,237,0.3)'}`
          : isPro
          ? `1.5px solid ${hovered ? 'rgba(56,189,248,0.4)' : 'rgba(56,189,248,0.15)'}`
          : `1.5px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
        boxShadow: hl
          ? hovered
            ? '0 20px 60px rgba(124,58,237,0.3), 0 0 0 1px rgba(124,58,237,0.15)'
            : '0 8px 32px rgba(124,58,237,0.15)'
          : isPro && hovered
          ? '0 16px 48px rgba(56,189,248,0.12)'
          : 'none',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top accent glow line */}
      {(hl || isPro) && (
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
          background: hl
            ? 'linear-gradient(90deg, transparent, rgba(192,38,211,0.8), rgba(37,99,235,0.8), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(56,189,248,0.6), transparent)',
          borderRadius: '1px',
          opacity: hovered ? 1 : 0.5,
          transition: 'opacity 0.3s ease',
        }} />
      )}

      {/* Badge */}
      {plan.badge && (
        <div style={{
          position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)',
          color: '#fff', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.12em', padding: '4px 16px', borderRadius: '100px',
          whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(192,38,211,0.4)',
        }}>
          {plan.badge}
        </div>
      )}

      {/* Listing number */}
      <div style={{
        fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.16em',
        color: hl ? 'rgba(192,38,211,0.7)' : BRAND.textDim,
        marginBottom: '12px', fontFamily: 'monospace',
      }}>
        {plan.listingNum}
      </div>

      {/* Plan name */}
      <div style={{
        fontSize: '30px', fontWeight: 700,
        fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
        lineHeight: 1.1, marginBottom: '8px', letterSpacing: '-0.5px',
        // Gradient name for highlighted, white for others
        background: hl ? 'linear-gradient(135deg, #c026d3, #7c3aed, #38bdf8)' : undefined,
        WebkitBackgroundClip: hl ? 'text' : undefined,
        WebkitTextFillColor: hl ? 'transparent' : BRAND.textWhite,
        backgroundClip: hl ? 'text' : undefined,
        color: hl ? undefined : BRAND.textWhite,
      }}>
        {plan.name}
      </div>

      {/* Tagline */}
      <p style={{
        fontSize: '13px', color: BRAND.textMuted,
        marginBottom: '22px', lineHeight: 1.55, minHeight: '40px',
      }}>
        {plan.tagline}
      </p>

      {/* Price */}
      <div style={{ marginBottom: '22px' }}>
        {breakdown && plan.id !== 'free' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '18px', textDecoration: 'line-through', color: BRAND.textDim, fontWeight: 600,
              }}>
                {plan.price}
              </span>
              <span style={{
                fontSize: '38px', fontWeight: 700, lineHeight: 1, letterSpacing: '-1.5px',
                fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
                color: '#86efac',
              }}>
                ₹{breakdown.finalTotal.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '13px', color: BRAND.textDim }}>
                {plan.priceNote}
              </span>
            </div>
            <div style={{
              fontSize: '11px', color: '#86efac', fontWeight: 600, marginTop: '4px',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: 'rgba(134,239,172,0.1)', padding: '3px 8px', borderRadius: '6px',
            }}>
              40% OFF Applied • Includes ₹{breakdown.gstAmount.toLocaleString('en-IN')} GST
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '42px', fontWeight: 700, lineHeight: 1, letterSpacing: '-1.5px',
                fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
                color: hl ? '#c026d3' : isPro ? BRAND.cyan : BRAND.textWhite,
              }}>
                {plan.price}
              </span>
              <span style={{ fontSize: '13px', color: BRAND.textDim }}>
                {plan.priceNote}
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: BRAND.textDim, fontWeight: 500 }}>
              {plan.priceSub}
            </div>
          </>
        )}
      </div>

      {/* Reach bar */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.16em', color: BRAND.textDim, fontFamily: 'monospace' }}>
            REACH
          </span>
          <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.16em', color: hl ? 'rgba(192,38,211,0.6)' : BRAND.textDim, fontFamily: 'monospace' }}>
            {plan.reachRightLabel}
          </span>
        </div>
        {/* Track */}
        <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '10px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${plan.reachPercent}%`,
            background: hl ? BRAND.grad : isPro ? BRAND.cyan : 'rgba(255,255,255,0.25)',
            borderRadius: '2px',
          }} />
        </div>
        <p style={{ fontSize: '12.5px', color: BRAND.textMuted, lineHeight: 1.5, margin: 0 }}>
          {plan.reachDescription}{' '}
          <strong style={{ color: BRAND.textWhite }}>{plan.reachBold}</strong>
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '18px' }} />

      {/* Features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '8.5px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <FeatureIconEl type={f.icon} accent={accentSolid} highlighted={hl} />
            <span style={{
              fontSize: '13px', lineHeight: 1.4,
              color: f.icon === 'cross' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.68)',
            }}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        id={`pp-cta-${plan.id}`}
        className={hl || isPro ? 'pp-cta' : 'pp-cta pp-cta-plain'}
        onClick={onSelect}
        disabled={isDisabled}
        style={{
          width: '100%', padding: '14px 20px',
          borderRadius: '10px', border: 'none',
          fontWeight: 600, fontSize: '14px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled && !isActive ? 0.4 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          // CTA styles per plan
          background: hl
            ? BRAND.grad
            : isPro
            ? `linear-gradient(135deg, ${BRAND.cyan} 0%, #0284c7 100%)`
            : 'rgba(255,255,255,0.06)',
          color: '#fff',
          boxShadow: hl
            ? '0 4px 20px rgba(124,58,237,0.35)'
            : plan.id === 'pro'
            ? '0 4px 20px rgba(56,189,248,0.2)'
            : 'none',
        }}
      >
        {isActive ? (
          <span style={{
            width: '17px', height: '17px',
            border: '2px solid rgba(255,255,255,0.25)',
            borderTopColor: '#fff', borderRadius: '50%',
            animation: 'pp-spin 0.65s linear infinite',
            display: 'inline-block',
          }} />
        ) : breakdown && plan.id !== 'free' ? (
          `Pay ₹${breakdown.finalTotal.toLocaleString('en-IN')} with Razorpay`
        ) : (
          plan.cta
        )}
      </button>
    </div>
  );
}

// â”€â”€â”€ FEATURE ICON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FeatureIconEl({ type, accent, highlighted }: { type: FeatureIcon; accent: string; highlighted: boolean }) {
  const base: React.CSSProperties = {
    flexShrink: 0, width: '18px',
    textAlign: 'center' as const, fontSize: '13px', lineHeight: 1,
  };
  if (type === 'check') return <span style={{ ...base, color: highlighted ? '#c026d3' : accent }}>&#10003;</span>;
  if (type === 'dash') return <span style={{ ...base, color: 'rgba(255,255,255,0.25)', fontSize: '15px' }}>&#8212;</span>;
  return <span style={{ ...base, color: 'rgba(255,255,255,0.14)', fontSize: '11px' }}>&#10005;</span>;
}
