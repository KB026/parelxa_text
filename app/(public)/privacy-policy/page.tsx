'use client';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white/[0.08] selection:text-[#EDEDED] py-24 px-6 sm:px-12">
      <article className="max-w-3xl mx-auto">
        
        <header className="mb-16 border-b border-white/[0.08] pb-10">
          <h1 className="text-[#EDEDED] text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#71717A] text-sm uppercase tracking-widest">
            Last Updated: July 8, 2026
          </p>
        </header>

        <div className="space-y-12">
          
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              1. Introduction
            </h2>
            <p className="text-[#A1A1AA] leading-relaxed mb-4">
              Parlexa ("we," "us," "our," or the "Company") operates the AI Agent Marketplace platform at parlexa.in (the "Service"). This Privacy Policy explains how we collect, use, disclose, and otherwise handle your information when you visit our website, use our platform, list your tools, or interact with our services.
            </p>
            <p className="text-[#A1A1AA] leading-relaxed">
              We are committed to protecting your privacy. If you have any questions about this Privacy Policy or our privacy practices, please contact us at <strong className="text-[#EDEDED]">privacy@parlexa.in</strong> or <strong className="text-[#EDEDED]">a@parlexa.in</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              2. Information We Collect
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-3">
                  2.1 Information You Provide Directly
                </h3>
                <ul className="list-none space-y-3 pl-4 border-l border-white/[0.08]">
                  <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Account Registration:</strong> Name, email address, password, company name, website, industry, contact email</li>
                  <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Vendor Listings:</strong> Tool name, description, screenshots, logo, pricing, website URL, category, tags, features</li>
                  <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Communications:</strong> Messages via support/messaging, feedback, email correspondence</li>
                  <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Payment Information:</strong> Vendor subscription data, payout preferences (future feature)</li>
                </ul>
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-6 mt-6">
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">
                    <strong className="text-[#EDEDED]">Note:</strong> Modifications to existing listings automatically trigger automated verification pipelines and re-routing to administrative queues to ensure platform integrity.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-3">
                  2.2 Information Collected Automatically
                </h3>
                <ul className="list-none space-y-3 pl-4 border-l border-white/[0.08]">
                  <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Usage & Analytics:</strong> Page views, clicks, time spent, scroll depth, feature interactions (PostHog)</li>
                  <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Click Tracking:</strong> Tool ID, timestamp, user ID, referrer page, UTM parameters, device type. We utilize performance-optimized background processes to decouple interaction logging from the active user interface thread. Client-side state restrictions prevent automated click duplication.</li>
                  <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Device & Technical:</strong> IP address, browser type, OS, device type, approximate location (country/region)</li>
                  <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Cookies & Tracking:</strong> Session cookies (authentication), preference cookies, analytics cookies (PostHog)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              3. Third-Party Services & Data Sharing
            </h2>
            <div className="space-y-6">
              <div className="border-l-2 border-white/[0.2] pl-4">
                <h3 className="text-[#EDEDED] font-semibold mb-1">3.1 Supabase (Database & Authentication)</h3>
                <p className="text-[#A1A1AA] text-sm">Core platform infrastructure. Data encrypted in transit.</p>
              </div>
              <div className="border-l-2 border-white/[0.2] pl-4">
                <h3 className="text-[#EDEDED] font-semibold mb-1">3.2 Sentry (Error Tracking)</h3>
                <p className="text-[#A1A1AA] text-sm">Monitor stability, debug issues. Passwords and payment info filtered.</p>
              </div>
              <div className="border-l-2 border-white/[0.2] pl-4">
                <h3 className="text-[#EDEDED] font-semibold mb-1">3.3 PostHog (Analytics)</h3>
                <p className="text-[#A1A1AA] text-sm">Understand user behavior, measure feature adoption. We do NOT sell data.</p>
              </div>
              <div className="border-l-2 border-white/[0.2] pl-4">
                <h3 className="text-[#EDEDED] font-semibold mb-1">3.4 Microlink API (Screenshot Generation)</h3>
                <p className="text-[#A1A1AA] text-sm">One-time fetch for screenshots → stored in Supabase Storage only. Microlink URL never persisted. Once processed, the generated asset becomes subject to our Supabase Storage access rules and security policies.</p>
              </div>
              <div className="border-l-2 border-white/[0.2] pl-4">
                <h3 className="text-[#EDEDED] font-semibold mb-1">3.5 Resend (Email Service)</h3>
                <p className="text-[#A1A1AA] text-sm">Transactional emails only: welcome, approval status, vendor messages, password reset.</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#EDEDED]">We do NOT:</strong> Sell user data, share with advertisers, expose passwords, share payment info with third parties.
              </p>
              <p className="text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#EDEDED]">Vendor Dashboards:</strong> While we do not sell data, aggregated interaction metrics (e.g., total clicks, total saves) are visible to the specific vendor hosting that tool through their secure, sandboxed dashboard.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              4. Your Privacy Rights & Choices
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-2">4.1 Access & Portability</h3>
                <p className="text-[#A1A1AA] leading-relaxed">Request a copy of your personal data in CSV/JSON format. Contact: <strong className="text-[#EDEDED]">privacy@parlexa.in</strong></p>
              </div>
              <div>
                <h3 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-2">4.2 Deletion / Right to Be Forgotten</h3>
                <p className="text-[#A1A1AA] leading-relaxed">Request account and data deletion. Some data retained for legal/tax reasons (7 years).</p>
              </div>
              <div>
                <h3 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-2">4.3 Opt-Out of Analytics</h3>
                <p className="text-[#A1A1AA] leading-relaxed">Disable PostHog tracking via browser's "Do Not Track" signal or contact us.</p>
              </div>
              <div>
                <h3 className="text-[#EDEDED] text-xl font-semibold tracking-tight mb-2">4.4 Cookie Preferences</h3>
                <p className="text-[#A1A1AA] leading-relaxed">Session cookies required for auth. Preference & analytics cookies can be disabled in browser settings.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              5. Data Security
            </h2>
            <ul className="list-none space-y-3 pl-4 border-l border-white/[0.08] mb-6">
              <li className="text-[#A1A1AA] leading-relaxed">✅ <strong className="text-[#EDEDED]">Encryption in Transit:</strong> HTTPS/TLS for all data</li>
              <li className="text-[#A1A1AA] leading-relaxed">✅ <strong className="text-[#EDEDED]">Encryption at Rest:</strong> Database-level encryption</li>
              <li className="text-[#A1A1AA] leading-relaxed">✅ <strong className="text-[#EDEDED]">Access Control:</strong> Role-based access (RLS)</li>
              <li className="text-[#A1A1AA] leading-relaxed">✅ <strong className="text-[#EDEDED]">Monitoring:</strong> Sentry & logging for unauthorized access</li>
            </ul>
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-6">
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                ⚠️ <strong className="text-[#EDEDED]">Note:</strong> No security system is 100% impenetrable. If you share your password, we're not responsible for unauthorized access.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              6. Data Retention
            </h2>
            <ul className="list-none space-y-3 pl-4 border-l border-white/[0.08]">
              <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Account profile:</strong> Until deletion</li>
              <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Click/interaction logs:</strong> 24 months (vendor analytics)</li>
              <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Error logs (Sentry):</strong> 90 days</li>
              <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Backups:</strong> 30 days (rolling)</li>
              <li className="text-[#A1A1AA] leading-relaxed"><strong className="text-[#EDEDED]">Transaction logs:</strong> 7 years (legal requirement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              7. International Users & Compliance
            </h2>
            <ul className="list-none space-y-3 pl-4 border-l border-white/[0.08]">
              <li className="text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#EDEDED]">EU (GDPR):</strong> You have rights to rectification, restriction, objection, and complaint to your Data Protection Authority.
              </li>
              <li className="text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#EDEDED]">California (CCPA):</strong> You have rights to know, delete, opt-out, and non-discrimination.
              </li>
              <li className="text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#EDEDED]">India, Brazil, Other:</strong> We comply with local privacy laws where applicable.
              </li>
            </ul>
          </section>

          <section className="pt-12 mt-12 border-t border-white/[0.08]">
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              8. Contact Information
            </h2>
            <div className="flex flex-col space-y-2 mb-4">
              <p className="text-[#A1A1AA] leading-relaxed flex items-center">
                <span className="text-[#71717A] uppercase tracking-widest text-xs w-24">Email</span>
                <a href="mailto:privacy@parlexa.in" className="text-[#EDEDED] hover:text-white transition-colors duration-300">
                  privacy@parlexa.in
                </a>
              </p>
              <p className="text-[#A1A1AA] leading-relaxed flex items-center">
                <span className="text-[#71717A] uppercase tracking-widest text-xs w-24">Alternative</span>
                <a href="mailto:a@parlexa.in" className="text-[#EDEDED] hover:text-white transition-colors duration-300">
                  a@parlexa.in
                </a>
              </p>
              <p className="text-[#A1A1AA] leading-relaxed flex items-center">
                <span className="text-[#71717A] uppercase tracking-widest text-xs w-24">Website</span>
                <a href="https://parlexa.in" className="text-[#EDEDED] hover:text-white transition-colors duration-300">
                  parlexa.in
                </a>
              </p>
            </div>
            <p className="text-[#71717A] text-sm italic">
              Response time: We aim to respond to all privacy inquiries within 5-7 business days.
            </p>
          </section>

        </div>
      </article>
    </main>
  );
}
