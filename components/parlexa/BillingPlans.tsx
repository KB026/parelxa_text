'use client';

import { useState } from 'react';
import Script from 'next/script';
import { createPromotionOrder, verifyPromotionPayment } from '@/app/actions/payments';
import { Agent } from '@/lib/types';

interface BillingPlansProps {
  initialAgents: Agent[];
}

export default function BillingPlans({ initialAgents }: BillingPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgents[0]?.id?.toString() || '');
  const [error, setError] = useState<string | null>(null);

  const plans = [
    { 
      id: 'free',
      name: 'Free Listing', 
      price: 'â‚¹0', 
      features: ['Basic community listing', 'Link to website', 'Standard support'],
      active: true 
    },
    { 
      id: 'weekly',
      name: 'Weekly Boost', 
      price: '$29', 
      duration: '7 days',
      features: ['2.5x more visibility', 'Featured badge on search', 'Priority moderation', 'Real-time analytics'],
      active: false
    },
    { 
      id: 'monthly',
      name: 'Featured Listing', 
      price: '$99', 
      duration: '30 days',
      features: ['Highest visibility tier', 'Homepage placement', 'SEO prioritization', 'Premium brand styling'],
      active: false
    }
  ];

  const handleUpgrade = async (planId: 'weekly' | 'monthly') => {
    if (!selectedAgentId) {
      setError('Please select a listing to boost');
      return;
    }

    setLoading(planId);
    setError(null);

    try {
      // 1. Create order on server
      const res = await createPromotionOrder(Number(selectedAgentId), planId);
      if (!res.success || !res.orderId) {
        throw new Error(res.error || 'Failed to initiate payment');
      }

      // 2. Mock or Real Razorpay flow
      const orderData = res as { isMock?: boolean; orderId: string; keyId?: string; amount?: number };
      if (orderData.isMock) {
        console.log('ðŸ’³ MOCK PAYMENT: Simulating success...');
        setTimeout(async () => {
          const verifyRes = await verifyPromotionPayment({
            razorpay_order_id: res.orderId,
            razorpay_payment_id: 'mock_pay_123',
            razorpay_signature: 'mock_signature',
            agentId: Number(selectedAgentId),
            plan: planId
          });

          if (verifyRes.success) {
            window.location.href = '/vendor?boost=success';
          } else {
            setError(verifyRes.error || 'Mock Payment verification failed');
            setLoading(null);
          }
        }, 1500);
        return;
      }

      // 2. Open Razorpay Checkout (Real Mode)
      const options = {
        key: res.keyId,
        amount: res.amount,
        currency: 'USD',
        name: 'Parlexa Marketplace',
        description: `Boost Plan: ${planId}`,
        order_id: res.orderId,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          setLoading(planId);
          // 3. Verify payment on server
          const verifyRes = await verifyPromotionPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            agentId: Number(selectedAgentId),
            plan: planId
          });

          if (verifyRes.success) {
            window.location.href = '/vendor?boost=success';
          } else {
            setError(verifyRes.error || 'Payment verification failed');
            setLoading(null);
          }
        },
        prefill: {
          name: '', 
          email: '',
          contact: ''
        },
        theme: {
          color: '#fb923c' 
        },
        modal: {
          ondismiss: function() {
            setLoading(null);
          }
        }
      };

      const RazorpaySDK = (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay;
      if (!RazorpaySDK) throw new Error('Razorpay SDK not loaded. Try refreshing.');
      
      const rzp = new RazorpaySDK(options);
      rzp.open();
    } catch (err: unknown) {
      console.error('Upgrade Error:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setLoading(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {initialAgents.length > 0 && (
        <div style={{ marginBottom: '32px', padding: '24px', background: 'rgba(251, 146, 60, 0.05)', border: '1px solid rgba(251, 146, 60, 0.2)', borderRadius: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-white)', marginBottom: '12px' }}>
            Select listing to boost:
          </label>
          <select 
            value={selectedAgentId} 
            onChange={(e) => setSelectedAgentId(e.target.value)}
            style={{ 
              width: '100%', padding: '12px', borderRadius: '10px', 
              background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-white)', fontSize: '14px', outline: 'none',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%'
            }}
          >
            {initialAgents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '10px', color: '#ef4444', fontSize: '14px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {plans.map(plan => (
          <div key={plan.name} style={{ 
            background: plan.active ? 'rgba(6,182,212,0.05)' : 'var(--bg-card)', 
            border: plan.active ? '2px solid var(--cyan)' : plan.id !== 'free' ? '1px solid rgba(251, 146, 60, 0.3)' : '1px solid var(--border-subtle)', 
            borderRadius: '24px', padding: '32px', position: 'relative'
          }}>
            {plan.active && (
              <span style={{ 
                position: 'absolute', top: '-12px', left: '20px', background: 'var(--cyan)', 
                color: 'black', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 800 
              }}>
                CURRENT PLAN
              </span>
            )}
            {plan.id !== 'free' && (
              <span style={{ 
                position: 'absolute', top: '-12px', right: '20px', background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', 
                color: 'black', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 800 
              }}>
                BOOST
              </span>
            )}
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{plan.name}</h3>
            <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-white)' }}>
              {plan.price}
              {plan.duration && <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-dim)' }}> / {plan.duration}</span>}
            </div>
            
            <ul style={{ padding: 0, margin: '0 0 32px 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {plan.features.map(f => (
                <li key={f} style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                  <span style={{ color: plan.id === 'free' ? 'var(--cyan)' : '#fb923c' }}>âœ“</span> {f}
                </li>
              ))}
            </ul>

            <button 
              disabled={plan.active || !!loading}
              onClick={() => plan.id !== 'free' && handleUpgrade(plan.id as 'weekly' | 'monthly')}
              style={{ 
                width: '100%', padding: '14px', borderRadius: '12px', 
                background: plan.active ? 'transparent' : plan.id === 'free' ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                border: plan.active ? '1px solid var(--border-subtle)' : 'none',
                color: plan.active ? 'var(--text-dim)' : 'black',
                fontWeight: 700, cursor: (plan.active || !!loading) ? 'default' : 'pointer',
                opacity: (loading && loading !== plan.id) ? 0.5 : 1,
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              onMouseEnter={(e) => !plan.active && !loading && (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {loading === plan.id ? 'Processing...' : plan.active ? 'Active' : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
