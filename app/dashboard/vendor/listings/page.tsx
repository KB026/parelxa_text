/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Script from 'next/script';
import { redirect } from 'next/navigation';
import { Calendar, Star, Shield, ShieldAlert, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { deleteTool } from './actions';
import { Toast } from '@/components/parlexa/ui/Toast';
import { CancelSubscriptionModal } from '@/components/parlexa/vendor/CancelSubscriptionModal';

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
  vendor_plan?: string | null;
  listing_expires_at?: string | null;
  company_name?: string | null;
}

export default function VendorListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [cancelModalData, setCancelModalData] = useState<{
    isOpen: boolean;
    listingId: number;
    toolName: string;
    planName: string;
    expiresAt?: string | null;
  } | null>(null);

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
    <section className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-2 tracking-tight">
            My Listings
          </h1>
          <p className="text-slate-400 text-lg font-medium">Manage your AI tool presence and submission status.</p>
        </div>
        <Link 
          href="/dashboard/vendor/listings/new?fresh=true" 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-[15px] shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
        >
          <span className="text-xl leading-none mb-0.5">+</span> Add New Tool
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {listings.length === 0 ? (
          <div className="bg-[#0b1120]/80 backdrop-blur-xl border border-slate-800 border-dashed rounded-3xl p-16 text-center shadow-lg">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
              <span className="text-4xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You haven't submitted any tools yet</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8">Publish your first AI tool to our directory and start reaching enterprise clients today.</p>
            <Link 
              href="/dashboard/vendor/listings/new?fresh=true" 
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-all inline-block"
            >
              Get Started
            </Link>
          </div>
        ) : (
          listings.map(listing => {
            const isLive = listing.approval_status === 'approved';
            const isPending = listing.approval_status === 'pending';
            const isRejected = listing.approval_status === 'rejected';
            
            return (
              <div key={listing.id} className="bg-[#0b1120]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all duration-500">
                
                {/* Subtle gradient strip on left based on status */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-50 ${isLive ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-amber-500'}`}></div>

                <div className="flex flex-col xl:flex-row justify-between items-start gap-6 mb-6">
                  <div className="flex gap-5 items-center min-w-0 flex-1 w-full">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                      {listing.logo_url ? (
                        <img src={listing.logo_url} alt={`${listing.name} logo`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl md:text-4xl">🤖</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5 truncate group-hover:text-blue-400 transition-colors">
                        {listing.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-slate-400 bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-800/50">
                          {listing.category}
                        </span>
                        
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                          isLive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          isPending ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : isPending ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
                          {isLive ? 'Approved' : isPending ? 'Pending' : 'Action Required'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto xl:justify-end border-t border-slate-800/50 xl:border-0 pt-4 xl:pt-0">
                    {isLive && (
                      <Link 
                        href={`/products/${listing.slug || listing.id}`}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all flex-1 text-center xl:flex-none"
                      >
                        Preview
                      </Link>
                    )}
                    <Link 
                      href={`/dashboard/vendor/listings/${listing.id}/edit`}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold transition-all flex-1 text-center xl:flex-none"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={deletingId === listing.id}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-sm font-semibold transition-all disabled:opacity-50 flex-1 xl:flex-none"
                    >
                      {deletingId === listing.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {isRejected && (
                  <div className="p-4 md:p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shadow-inner">
                    <div>
                      <span className="font-bold text-rose-400 mr-2 flex items-center gap-2 mb-1 sm:mb-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Rejected:
                      </span>
                      <span className="text-slate-300 text-sm block sm:inline mt-1 sm:mt-0 ml-0 sm:ml-1">
                        {listing.rejection_reason || 'Does not meet our community guidelines for AI clarity.'}
                      </span>
                    </div>
                    <Link 
                       href={`/dashboard/vendor/listings/${listing.id}/edit?resubmit=true`}
                       className="text-rose-400 hover:text-rose-300 text-sm font-bold underline underline-offset-4 decoration-rose-500/50 hover:decoration-rose-400 whitespace-nowrap transition-colors"
                    >
                      Modify & Resubmit
                    </Link>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-5 border-t border-slate-800/60">
                  <div className="flex gap-8 md:gap-12 w-full sm:w-auto border-b border-slate-800/50 sm:border-0 pb-4 sm:pb-0">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Views (30d)</div>
                      <div className="text-lg font-bold text-white">0</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Rating</div>
                      <div className="text-lg font-bold text-white flex items-center gap-1.5">
                        <Star size={16} className={listing.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"} /> 
                        {listing.rating || <span className="text-slate-500">N/A</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {listing.vendor_plan && listing.vendor_plan !== 'free' ? (
                      <div className="flex flex-wrap items-center gap-3 bg-purple-500/10 px-3.5 py-1.5 rounded-xl border border-purple-500/20">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                          <Sparkles size={13} />
                          {listing.vendor_plan === 'pro' ? 'Scale Plan (₹899/mo)' : 'Growth Plan (₹499/mo)'}
                        </span>
                        {listing.subscription_status === 'cancelled' ? (
                          <span className="text-xs text-amber-400 font-medium flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            <Calendar size={12} /> Cancels at cycle end
                          </span>
                        ) : (
                          <button
                            onClick={() => setCancelModalData({
                              isOpen: true,
                              listingId: listing.id,
                              toolName: listing.name,
                              planName: listing.vendor_plan || 'growth',
                              expiresAt: listing.listing_expires_at,
                            })}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all shadow-sm"
                          >
                            <ShieldAlert size={13} /> Cancel Auto-Renew
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-800/50">
                        Launch Plan (Free)
                      </span>
                    )}

                    {listing.is_verified && (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <Shield size={16} /> 
                        Verified Tool
                      </div>
                    )}
                  </div>
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
      {cancelModalData && (
        <CancelSubscriptionModal
          isOpen={cancelModalData.isOpen}
          listingId={cancelModalData.listingId}
          toolName={cancelModalData.toolName}
          planName={cancelModalData.planName}
          expiresAt={cancelModalData.expiresAt}
          onClose={() => setCancelModalData(null)}
          onSuccess={(id) => {
            setListings(prev => prev.map(l => l.id === id ? { ...l, subscription_status: 'cancelled' } : l));
          }}
        />
      )}
    </section>
  );
}
