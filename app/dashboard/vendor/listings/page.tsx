/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Script from 'next/script';
import { redirect } from 'next/navigation';
import { Calendar, Star } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { deleteTool } from './actions';
import { Toast } from '@/components/parlexa/ui/Toast';

interface Listing {
  id: number;
  name: string;
  one_liner: string;
  logo_url: string | null;
  category: string;
  approval_status: string;
  rating: number | null;
  is_verified: boolean;
  slug: string | null;
  rejection_reason?: string;
  subscription_id?: string | null;
  subscription_status?: string | null;
  listing_expires_at?: string | null;
  company_name?: string | null;
}

export default function VendorListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchListings = useCallback(async () => {
    const supabase = createClient() as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { redirect('/login'); return; }

    const query = supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('id', { ascending: false });

    const { data } = await query;
    setListings(data || []);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await deleteTool(id);
      if (!res.success) throw new Error(res.error || 'Failed to delete');
      setListings(prev => prev.filter(l => l.id !== id));
      setToast({ message: 'Tool deleted successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Delete failed: ' + (err as Error).message, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCancel(id: number) {
    if (!confirm('Are you sure you want to cancel your subscription? Your listing will remain active until the end of your current billing cycle, but will not auto-renew.')) return;
    setCancellingId(id);
    try {
      const res = await fetch(`/api/subscriptions/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setListings(prev => prev.map(l => l.id === id ? { ...l, subscription_status: 'cancelled' } : l));
      alert('Subscription cancelled successfully. It will not auto-renew.');
    } catch (err) {
      alert('Cancellation failed: ' + (err as Error).message);
    } finally {
      setCancellingId(null);
    }
  }

  async function handlePay(id: number, companyName: string) {
    setPayingId(id);
    try {
      const res = await fetch('/api/create-listing-subscription', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName })
      });
      const subData = await res.json();

      if (!res.ok) throw new Error(subData.error || 'Failed to initialize subscription');

      if (subData.is_mock) {
        console.log('💳 MOCK SUBSCRIPTION: Simulating success...');
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('/api/verify-listing-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_subscription_id: subData.subscription_id,
                razorpay_payment_id: 'mock_pay_123',
                razorpay_signature: 'mock_signature',
                listing_id: id
              })
            });

            if (!verifyRes.ok) throw new Error((await verifyRes.json()).error);
            alert('Payment Successful!');
            fetchListings();
          } catch (err: unknown) {
            alert('Error verifying mock subscription: ' + (err as Error).message);
          } finally { setPayingId(null); }
        }, 1500);
        return;
      }

      const options = {
        key: subData.key_id,
        subscription_id: subData.subscription_id,
        name: 'Parlexa Marketplace',
        description: 'Annual Listing Fee ₹1,999 + 18% GST — ₹2,359/year',
        handler: async function (response: { razorpay_subscription_id: string; razorpay_payment_id: string; razorpay_signature: string; }) {
          try {
            const verifyRes = await fetch('/api/verify-listing-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                listing_id: id
              })
            });

            if (!verifyRes.ok) throw new Error((await verifyRes.json()).error);
            alert('Payment Successful! Your listing is now live.');
            fetchListings();
          } catch (err: unknown) {
            alert('Error verifying subscription: ' + (err as Error).message);
          } finally { setPayingId(null); }
        },
        prefill: { name: companyName },
        theme: { color: '#fb923c' },
        modal: { ondismiss: function() { setPayingId(null); } }
      };

      const RazorpaySDK = (window as unknown as { Razorpay: new (options: unknown) => { on: (event: string, callback: (res: unknown) => void) => void; open: () => void } }).Razorpay;
      if (!RazorpaySDK) throw new Error('Razorpay SDK failed to load.');
      
      const rzp = new RazorpaySDK(options);
      rzp.on('payment.failed', function (response: unknown) {
        const res = response as { error: { description: string } };
        alert('Payment failed: ' + res.error.description);
        setPayingId(null);
      });
      rzp.open();

    } catch (err: unknown) {
      alert('Error initiating payment: ' + (err as Error).message);
      setPayingId(null);
    }
  }

  return (
    <section>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>My Listings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your AI tool presence and submission status.</p>
        </div>
        <Link 
          href="/dashboard/vendor/listings/new?fresh=true" 
          className="btn-get-started" 
          style={{ padding: '12px 24px', textDecoration: 'none', fontSize: '14px' }}
        >
          + Add New Tool
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {listings.length === 0 ? (
          <div style={{ padding: '80px 40px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
            <p style={{ color: 'var(--text-dim)' }}>You haven&apos;t submitted any tools yet.</p>
          </div>
        ) : (
          listings.map(listing => {
            const isLive = listing.approval_status === 'approved';
            const isPending = listing.approval_status === 'pending';
            const isRejected = listing.approval_status === 'rejected';
            
            return (
              <div key={listing.id} style={{ 
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
                borderRadius: '24px', padding: '32px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', minWidth: 0, flex: 1 }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-secondary)', overflow: 'hidden', flexShrink: 0 }}>
                      {listing.logo_url ? <img src={listing.logo_url} alt={`${listing.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🤖</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '20px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.name}</h3>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{listing.category}</span>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-dim)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ 
                            width: '8px', height: '8px', borderRadius: '50%', 
                            background: isLive ? '#10b981' : isPending ? '#f59e0b' : '#ef4444' 
                          }} />
                          <span style={{ 
                            fontSize: '12px', fontWeight: 600, 
                            color: isLive ? '#10b981' : isPending ? '#f59e0b' : '#ef4444' 
                          }}>
                            {isLive ? 'Approved' : isPending ? 'Pending' : 'Action Required'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {isLive && (
                      <Link 
                        href={`/products/${listing.slug || listing.id}`}
                        style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', color: 'var(--text-white)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}
                      >
                        Preview
                      </Link>
                    )}
                    <Link 
                      href={`/dashboard/vendor/listings/${listing.id}/edit`}
                      style={{ padding: '10px 18px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-white)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={deletingId === listing.id}
                      style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: deletingId === listing.id ? 0.6 : 1 }}
                    >
                      {deletingId === listing.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {isRejected && (
                  <div style={{ 
                    padding: '16px 20px', background: 'rgba(239, 68, 68, 0.05)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#ef4444', marginRight: '8px' }}>Rejected:</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {listing.rejection_reason || 'Does not meet our community guidelines for AI clarity.'}
                      </span>
                    </div>
                    <Link 
                       href={`/dashboard/vendor/listings/${listing.id}/edit?resubmit=true`}
                       style={{ color: '#ef4444', fontSize: '13px', fontWeight: 800, textDecoration: 'underline' }}
                    >
                      Modify & Resubmit
                    </Link>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: '40px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Views (30d)</div>
                      <div style={{ fontWeight: 600 }}>0</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Rating</div>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} /> {listing.rating || 'N/A'}</div>
                    </div>
                  </div>
                  

                  {listing.is_verified && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
                      <span className="verified-badge" /> 
                      Verified Tool
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
