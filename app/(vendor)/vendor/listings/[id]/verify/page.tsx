'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { submitVerificationRequest } from './actions';

export default function VerifyListingPage() {
  const params = useParams();
  const agentId = params.id as string;
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    company_name: '',
    gst_number: '',
    company_website: '',
    work_email: '',
    product_demo_url: '',
    press_mentions: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return formData.company_name.trim() && formData.gst_number.trim();
    if (step === 2) return formData.company_website.trim() && formData.work_email.trim();
    if (step === 3) return formData.product_demo_url.trim();
    return false;
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <Link href="/vendor/listings" style={{ color: 'var(--cyan)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
        ← Back to My Listings
      </Link>

      <h1 className="page-title" style={{ marginBottom: '8px' }}>Get Verified</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
        Complete a quick 3-step verification to earn the <span style={{ color: '#60a5fa', fontWeight: 600 }}>✓ Verified</span> badge on your listing.
      </p>

      {/* Step Indicator */}
      <div className="verify-step-indicator">
        {[1, 2, 3].map(s => (
          <span key={s} style={{ display: 'contents' }}>
            <span className={`verify-step-dot ${s === step ? 'active' : s < step ? 'done' : ''}`}>
              {s < step ? '✓' : s}
            </span>
            {s < 3 && <span className={`verify-step-line ${s < step ? 'done' : ''}`} />}
          </span>
        ))}
      </div>

      <div className="verify-form-card">
        {/* Step 1: Company Details */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-white)', marginBottom: '4px' }}>
              📋 Company Details
            </h2>
            <div>
              <label className="verify-label">Company / Legal Entity Name *</label>
              <input
                className="verify-input"
                placeholder="e.g. Parlexa Technologies Pvt Ltd"
                value={formData.company_name}
                onChange={e => updateField('company_name', e.target.value)}
              />
            </div>
            <div>
              <label className="verify-label">GST Number *</label>
              <input
                className="verify-input"
                placeholder="e.g. 27AADCP0001A1Z1"
                value={formData.gst_number}
                onChange={e => updateField('gst_number', e.target.value)}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                This is used for verification purposes only and will not be publicly displayed.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-white)', marginBottom: '4px' }}>
              🌐 Contact & Web Presence
            </h2>
            <div>
              <label className="verify-label">Official Company Website *</label>
              <input
                className="verify-input"
                type="url"
                placeholder="https://www.yourcompany.com"
                value={formData.company_website}
                onChange={e => updateField('company_website', e.target.value)}
              />
            </div>
            <div>
              <label className="verify-label">Official Work Email *</label>
              <input
                className="verify-input"
                type="email"
                placeholder="you@yourcompany.com"
                value={formData.work_email}
                onChange={e => updateField('work_email', e.target.value)}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                Must be a company domain email (not Gmail/Yahoo).
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Product Proof */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-white)', marginBottom: '4px' }}>
              🎬 Product Proof
            </h2>
            <div>
              <label className="verify-label">Product Demo Video / Link *</label>
              <input
                className="verify-input"
                type="url"
                placeholder="Link to a video or live demo of your product"
                value={formData.product_demo_url}
                onChange={e => updateField('product_demo_url', e.target.value)}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                YouTube, Loom, or any public link showing your product in action.
              </p>
            </div>
            <div>
              <label className="verify-label">Press Mentions (optional)</label>
              <textarea
                className="verify-input"
                placeholder="Links to news articles, blogs, or media coverage..."
                rows={3}
                style={{ resize: 'vertical' }}
                value={formData.press_mentions}
                onChange={e => updateField('press_mentions', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}
            >
              ← Back
            </button>
          ) : <span />}

          {step < 3 ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: canProceed() ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'var(--bg-elevated)',
                color: canProceed() ? 'white' : 'var(--text-dim)',
                fontSize: '14px', fontWeight: 600, cursor: canProceed() ? 'pointer' : 'not-allowed'
              }}
            >
              Next Step →
            </button>
          ) : (
            <form action={submitVerificationRequest}>
              <input type="hidden" name="agent_id" value={agentId} />
              <input type="hidden" name="company_name" value={formData.company_name} />
              <input type="hidden" name="gst_number" value={formData.gst_number} />
              <input type="hidden" name="company_website" value={formData.company_website} />
              <input type="hidden" name="work_email" value={formData.work_email} />
              <input type="hidden" name="product_demo_url" value={formData.product_demo_url} />
              <input type="hidden" name="press_mentions" value={formData.press_mentions} />
              <button
                type="submit"
                disabled={!canProceed()}
                style={{
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: canProceed() ? 'linear-gradient(135deg, #059669, #047857)' : 'var(--bg-elevated)',
                  color: canProceed() ? 'white' : 'var(--text-dim)',
                  fontSize: '14px', fontWeight: 600, cursor: canProceed() ? 'pointer' : 'not-allowed'
                }}
              >
                Submit for Verification ✓
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
