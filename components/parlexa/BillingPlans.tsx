'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import { createPromotionOrder, verifyPromotionPayment } from '@/app/actions/payments';
import { Agent } from '@/lib/types';

interface BillingPlansProps {
  initialAgents: Agent[];
}

type PlanId = 'free' | 'growth' | 'pro';
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

// Brand palette from globals.css + logo
const BRAND_GRAD = 'linear-gradient(135deg, #c026d3 0%, #7c3aed 50%, #2563eb 100%)';
const BRAND_CYAN = '#38bdf8';

const PLANS: Plan[] = [
  {
    id: 'free',
    listingNum: 'LISTING / 01',
    name: 'Launch',
    tagline: 'A bare entry in the directory. Get on the map, free forever.',
    price: 'Free',
    priceNote: '/ forever',
    priceSub: 'No card required',
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
    cta: 'Current plan',
  },
  {
    id: 'growth',
    listingNum: 'LISTING / 02',
    name: 'Growth',
    tagline: 'A complete, trusted profile buyers can act on.',
    price: '\u20b9499',
    priceNote: '/ month',
    priceSub: 'Billed monthly',
    reachRightLabel: 'YOUR SITE',
    reachPercent: 60,
    reachDescription: 'Buyers can click through \u2014',
    reachBold: 'dofollow link, live and reachable.',
    badge: 'MOST LISTINGS',
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
    name: 'Scale',
    tagline: 'Promoted placement and leads routed straight to you.',
    price: '\u20b9899',
    priceNote: '/ month',
    priceSub: 'Billed monthly',
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

export default function BillingPlans({ initialAgents }: BillingPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgents[0]?.id?.toString() || '');
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (planId: 'growth' | 'pro') => {
    if (!selectedAgentId) {
      setError('Please select a listing to upgrade');
      return;
    }
    setLoading(planId);
    setError(null);
    try {
      const res = await createPromotionOrder(Number(selectedAgentId), planId);
      if (!res.success || !res.orderId) throw new Error(res.error || 'Failed to initiate payment');
      const orderData = res as { isMock?: boolean; orderId: string; keyId?: string; amount?: number };
      if (orderData.isMock) {
        setTimeout(async () => {
          const verifyRes = await verifyPromotionPayment({
            razorpay_order_id: res.orderId,
            razorpay_payment_id: 'mock_pay_123',
            razorpay_signature: 'mock_signature',
            agentId: Number(selectedAgentId),
            plan: planId,
          });
          if (verifyRes.success) window.location.href = '/vendor?boost=success';
          else { setError(verifyRes.error || 'Mock payment failed'); setLoading(null); }
        }, 1500);
        return;
      }
      const options = {
        key: res.keyId, amount: res.amount, currency: 'INR',
        name: 'Parlexa',
        description: `${planId === 'growth' ? 'Verified' : 'Featured'} Plan`,
        order_id: res.orderId,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          setLoading(planId);
          const verifyRes = await verifyPromotionPayment({ ...response, agentId: Number(selectedAgentId), plan: planId });
          if (verifyRes.success) window.location.href = '/vendor?boost=success';
          else { setError(verifyRes.error || 'Payment verification failed'); setLoading(null); }
        },
        theme: { color: '#7c3aed' },
        modal: { ondismiss: () => setLoading(null) },
      };
      const RazorpaySDK = (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay;
      if (!RazorpaySDK) throw new Error('Razorpay SDK not loaded. Try refreshing.');
      new RazorpaySDK(options).open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
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

      {/* Agent selector */}
      {initialAgents.length > 0 && (
        <div style={{
          marginBottom: '28px', padding: '20px 22px',
          background: 'rgba(124,58,237,0.05)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '12px',
        }}>
          <label style={{
            display: 'block', fontSize: '13px', fontWeight: 600,
            color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.02em',
          }}>
            Select listing to upgrade:
          </label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: '8px',
              background: 'var(--bg-secondary)', border: '1px solid rgba(124,58,237,0.2)',
              color: 'var(--text-white)', fontSize: '14px', outline: 'none',
            }}
          >
            {initialAgents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
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

      {/* 3-card grid */}
      <div
        className="bp-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '18px',
          alignItems: 'stretch',
        }}
      >
        {PLANS.map((plan, idx) => (
          <BillingCard
            key={plan.id}
            plan={plan}
            delay={idx * 0.06}
            loading={loading}
            onSelect={() => plan.id !== 'free' && handleUpgrade(plan.id as 'growth' | 'pro')}
          />
        ))}
      </div>
    </>
  );
}

function BillingCard({ plan, delay, loading, onSelect }: {
  plan: Plan; delay: number; loading: string | null; onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isActive = loading === plan.id;
  const isDisabled = !!loading;
  const hl = !!plan.highlighted;
  const isPro = plan.id === 'pro';
  const isFree = plan.id === 'free';

  return (
    <div
      className="bp-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${delay}s`,
        borderRadius: '16px',
        padding: hl ? '30px 24px 24px' : '26px 22px 22px',
        background: hl
          ? 'linear-gradient(160deg, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.06) 100%)'
          : isPro
          ? 'linear-gradient(160deg, rgba(56,189,248,0.04) 0%, rgba(255,255,255,0.02) 100%)'
          : 'var(--bg-card)',
        border: hl
          ? `1.5px solid ${hovered ? 'rgba(124,58,237,0.55)' : 'rgba(124,58,237,0.25)'}`
          : isPro
          ? `1.5px solid ${hovered ? 'rgba(56,189,248,0.35)' : 'rgba(56,189,248,0.12)'}`
          : `1.5px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'var(--border-subtle)'}`,
        boxShadow: hl
          ? hovered ? '0 16px 48px rgba(124,58,237,0.25)' : '0 6px 24px rgba(124,58,237,0.12)'
          : isPro && hovered
          ? '0 12px 36px rgba(56,189,248,0.1)'
          : 'none',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Top accent line */}
      {(hl || isPro) && (
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
          background: hl
            ? 'linear-gradient(90deg, transparent, rgba(192,38,211,0.7), rgba(37,99,235,0.7), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent)',
          borderRadius: '1px',
          opacity: hovered ? 1 : 0.5,
          transition: 'opacity 0.3s ease',
        }} />
      )}

      {/* MOST LISTINGS badge */}
      {plan.badge && (
        <div style={{
          position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
          background: BRAND_GRAD, color: '#fff',
          fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.12em',
          padding: '4px 14px', borderRadius: '100px', whiteSpace: 'nowrap',
          boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
        }}>
          {plan.badge}
        </div>
      )}

      {/* Current plan badge (free) */}
      {isFree && (
        <div style={{
          position: 'absolute', top: '-12px', left: '18px',
          background: 'var(--cyan)', color: '#000',
          fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.1em',
          padding: '4px 12px', borderRadius: '100px',
        }}>
          CURRENT PLAN
        </div>
      )}

      {/* Listing number */}
      <div style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em',
        color: hl ? 'rgba(192,38,211,0.65)' : 'var(--text-dim)',
        marginBottom: '10px', fontFamily: 'monospace',
      }}>
        {plan.listingNum}
      </div>

      {/* Plan name */}
      <div style={{
        fontSize: '26px', fontWeight: 700,
        fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
        lineHeight: 1.1, marginBottom: '6px', letterSpacing: '-0.3px',
        background: hl ? BRAND_GRAD : undefined,
        WebkitBackgroundClip: hl ? 'text' : undefined,
        WebkitTextFillColor: hl ? 'transparent' : 'var(--text-white)',
        backgroundClip: hl ? 'text' : undefined,
        color: hl ? undefined : 'var(--text-white)',
      }}>
        {plan.name}
      </div>

      {/* Tagline */}
      <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginBottom: '18px', lineHeight: 1.5, minHeight: '36px' }}>
        {plan.tagline}
      </p>

      {/* Price */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '3px' }}>
          <span style={{
            fontSize: '36px', fontWeight: 700, lineHeight: 1, letterSpacing: '-1px',
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
            color: hl ? '#c026d3' : isPro ? BRAND_CYAN : 'var(--text-white)',
          }}>
            {plan.price}
          </span>
          <span style={{ fontSize: '12.5px', color: 'var(--text-dim)' }}>{plan.priceNote}</span>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', opacity: 0.7 }}>{plan.priceSub}</div>
      </div>

      {/* Reach bar */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--text-dim)', fontFamily: 'monospace' }}>REACH</span>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', color: hl ? 'rgba(192,38,211,0.6)' : 'var(--text-dim)', fontFamily: 'monospace' }}>
            {plan.reachRightLabel}
          </span>
        </div>
        <div style={{ width: '100%', height: '2.5px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '9px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${plan.reachPercent}%`,
            background: hl ? BRAND_GRAD : isPro ? BRAND_CYAN : 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
          }} />
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
          {plan.reachDescription}{' '}
          <strong style={{ color: 'var(--text-white)' }}>{plan.reachBold}</strong>
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '16px' }} />

      {/* Features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <BpIcon type={f.icon} hl={hl} />
            <span style={{
              fontSize: '12.5px', lineHeight: 1.4,
              color: f.icon === 'cross' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.65)',
            }}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        className="bp-cta"
        disabled={isFree || isDisabled}
        onClick={onSelect}
        style={{
          width: '100%', padding: '13px 16px',
          borderRadius: '10px', border: 'none',
          fontWeight: 600, fontSize: '13.5px',
          fontFamily: "'DM Sans', sans-serif",
          cursor: isFree || isDisabled ? 'default' : 'pointer',
          opacity: isDisabled && !isActive ? 0.4 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: isFree
            ? 'rgba(255,255,255,0.05)'
            : hl ? BRAND_GRAD
            : isPro ? `linear-gradient(135deg, ${BRAND_CYAN} 0%, #0284c7 100%)`
            : 'rgba(255,255,255,0.06)',
          color: isFree ? 'var(--text-dim)' : '#fff',
          boxShadow: hl && !isFree ? '0 4px 18px rgba(124,58,237,0.3)' : isPro ? '0 4px 18px rgba(56,189,248,0.18)' : 'none',
        }}
      >
        {isActive
          ? <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'bp-spin 0.65s linear infinite', display: 'inline-block' }} />
          : plan.cta}
      </button>
    </div>
  );
}

function BpIcon({ type, hl }: { type: FeatureIcon; hl: boolean }) {
  const base: React.CSSProperties = { flexShrink: 0, width: '16px', textAlign: 'center' as const, fontSize: '12px', lineHeight: 1 };
  if (type === 'check') return <span style={{ ...base, color: hl ? '#c026d3' : BRAND_CYAN }}>&#10003;</span>;
  if (type === 'dash') return <span style={{ ...base, color: 'rgba(255,255,255,0.22)', fontSize: '14px' }}>&#8212;</span>;
  return <span style={{ ...base, color: 'rgba(255,255,255,0.14)', fontSize: '10px' }}>&#10005;</span>;
}
