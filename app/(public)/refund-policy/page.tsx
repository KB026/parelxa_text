'use client';

import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white/[0.08] selection:text-[#EDEDED] py-24 px-6 sm:px-12">
      <article className="max-w-3xl mx-auto">
        
        {/* Header */}
        <header className="mb-14 border-b border-white/[0.08] pb-10">
          <div className="inline-block px-3.5 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 border border-blue-500/20">
            Legal & Compliance
          </div>
          <h1 className="text-[#EDEDED] text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Cancellation & Refund Policy
          </h1>
          <p className="text-[#71717A] text-sm uppercase tracking-widest">
            Last Updated: August 12, 2026
          </p>
        </header>

        {/* TL;DR Executive Summary Box */}
        <div className="bg-[#0D1322] border border-emerald-500/20 rounded-2xl p-6 md:p-8 mb-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
          <h2 className="text-emerald-400 font-semibold text-lg mb-3 flex items-center gap-2">
            <span>⚡</span> Policy Overview (TL;DR)
          </h2>
          <ul className="space-y-2.5 text-sm text-[#A1A1AA] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-[#EDEDED]">Pending Review Tool:</strong> 100% refundable if requested before administrative approval.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-[#EDEDED]">Live / Approved Tool:</strong> Non-refundable once active, as digital directory placement and dofollow backlink indexing are delivered immediately.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-[#EDEDED]">Cancel Auto-Renew Anytime:</strong> Stop recurring monthly charges directly from your <Link href="/dashboard/vendor/listings" className="text-blue-400 underline hover:text-blue-300">Vendor Dashboard</Link>. Paid access remains 100% active until the end of your billing cycle.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-[#EDEDED]">Billing Exceptions:</strong> Double billing, gateway errors, or unauthorized charges are 100% refundable within 7 days.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-[#EDEDED]">Refund Processing:</strong> Approved refunds are credited back to the original payment method within 5–7 business days via Razorpay.</span>
            </li>
          </ul>
        </div>

        {/* Policy Content Sections */}
        <div className="space-y-12 text-[#A1A1AA] leading-relaxed">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              1. Overview & Subscription Tiers
            </h2>
            <p className="mb-4">
              Parlexa offers paid vendor listing subscriptions (Growth and Scale tiers) designed to provide AI tools with directory visibility, dofollow backlinks, verified badges, and buyer leads.
            </p>
            <p>
              For full details on feature inclusions and pricing for each tier, please visit our <Link href="/dashboard/vendor/listings/new" className="text-blue-400 hover:text-blue-300 underline font-medium">Listing Tier Overview</Link>.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              2. Refund Eligibility Matrix
            </h2>
            <p className="mb-4">
              Because Parlexa delivers digital promotional services, refund eligibility is determined by the status of your tool listing:
            </p>
            
            <div className="space-y-6 mt-6">
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                <h3 className="text-[#EDEDED] text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  A. Pending Review Status (100% Refundable)
                </h3>
                <p className="text-sm">
                  If your tool is currently in the review queue and has not yet been approved, you may request a 100% full refund at any point. Upon receiving your request, we will cancel the submission and issue a complete refund.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                <h3 className="text-[#EDEDED] text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  B. Live / Approved Status (Non-Refundable)
                </h3>
                <p className="text-sm mb-3">
                  <strong className="text-[#EDEDED]">Definition of Live/Approved Event:</strong> A tool listing is formally classified as &ldquo;Live / Approved&rdquo; at the moment it is published on the public Parlexa directory, or when an official approval confirmation notification is dispatched to the registered vendor.
                </p>
                <p className="text-sm">
                  Once a listing is Live / Approved, promotional benefits (directory indexing, public visibility, verified badges, and backlink benefits) are activated immediately. Therefore, standard subscription fees for live listings are non-refundable. However, vendors may turn off auto-renewal at any time.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              3. Mandatory Billing Exceptions (7-Day Window)
            </h2>
            <p className="mb-4">
              Separate from the open-ended pending-review refund rule described in Section 2, Parlexa provides a strict <strong className="text-[#EDEDED]">7-day exception window</strong> for specific billing errors regardless of listing status:
            </p>
            <ul className="list-none space-y-3 pl-4 border-l border-white/[0.08] mt-4 text-sm">
              <li>
                <strong className="text-[#EDEDED]">Duplicate Billing:</strong> If your payment method was accidentally charged twice for the same subscription period due to a system glitch.
              </li>
              <li>
                <strong className="text-[#EDEDED]">Gateway Technical Failure:</strong> Payment was debited from your bank account or card but the transaction failed to complete.
              </li>
              <li>
                <strong className="text-[#EDEDED]">Unauthorized Transaction:</strong> Proven fraudulent or unauthorized use of your payment instrument.
              </li>
            </ul>
            <p className="mt-4 text-sm text-[#71717A]">
              To claim an exception refund, notify us at <a href="mailto:billing@parlexa.in" className="text-blue-400 hover:underline font-medium">billing@parlexa.in</a> within 7 calendar days of the transaction timestamp.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              4. Cancellation vs. Refund (Cancel Auto-Renew)
            </h2>
            <p className="mb-4">
              Cancelling your subscription auto-renewal is distinct from requesting a monetary refund:
            </p>
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 space-y-4 text-sm">
              <p>
                <strong className="text-[#EDEDED]">How to Cancel Auto-Renew:</strong> Log into your account and navigate to <Link href="/dashboard/vendor/listings" className="text-blue-400 hover:underline font-medium">Vendor Dashboard &gt; My Listings</Link>. Click the <strong className="text-rose-400">&ldquo;Cancel Auto-Renew&rdquo;</strong> button on your active tool card.
              </p>
              <p>
                <strong className="text-[#EDEDED]">Access Period:</strong> When you cancel auto-renew, all future recurring debits are halted. Your verified listing, dofollow link, and promotional features will remain <strong className="text-emerald-400">100% active</strong> until the final day of your current paid billing cycle.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              5. Refund Processing & Payment Gateway Timelines
            </h2>
            <p className="mb-4 text-sm">
              All payments and refunds on Parlexa are processed via our payment partner, <strong className="text-[#EDEDED]">Razorpay</strong>:
            </p>
            <ul className="list-none space-y-3 pl-4 border-l border-white/[0.08] text-sm">
              <li>
                <strong className="text-[#EDEDED]">Destination:</strong> Refunds are automatically credited back to the exact payment method used during checkout (UPI ID, Netbanking account, Debit Card, or Credit Card).
              </li>
              <li>
                <strong className="text-[#EDEDED]">Timeframe:</strong> Once approved by Parlexa, the credited funds typically reflect in your bank account within <strong className="text-[#EDEDED]">5 to 7 business days</strong>.
              </li>
              <li>
                <strong className="text-[#EDEDED]">Confirmation:</strong> You will receive a refund reference ID via email as soon as the credit is initiated.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="border-t border-white/[0.08] pt-10">
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              6. How to Request a Refund or Contact Us
            </h2>
            <p className="mb-6 text-sm">
              If you are eligible for a refund under Section 2 or Section 3, please send your request through either of the following channels:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <div className="text-xs uppercase tracking-wider text-[#71717A] mb-1 font-semibold">Email Billing Support</div>
                <a href="mailto:billing@parlexa.in" className="text-[#EDEDED] font-semibold text-base hover:text-blue-400 transition-colors">
                  billing@parlexa.in
                </a>
                <p className="text-xs text-[#71717A] mt-2">Include tool name & Payment Reference ID</p>
              </div>

              <div className="p-5 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <div className="text-xs uppercase tracking-wider text-[#71717A] mb-1 font-semibold">Online Support Form</div>
                <Link href="/contact" className="text-blue-400 font-semibold text-base hover:underline inline-flex items-center gap-1">
                  Submit via Contact Page &rarr;
                </Link>
                <p className="text-xs text-[#71717A] mt-2">Direct contact form for billing and account inquiries</p>
              </div>
            </div>
          </section>

        </div>
      </article>
    </main>
  );
}
