'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateListing } from '@/app/(vendor)/vendor/listings/actions';
import { Agent } from '@/lib/types';

const STEPS = ['Basic Info', 'Classification', 'Pricing', 'Company', 'Review'];
const CATEGORIES = [
  'AI & LLMs', 'Customer Experience', 'Marketing & Sales',
  'Enterprise & Automation', 'HR & Workforce', 'Healthcare',
  'FinTech', 'Retail & E-Commerce', 'Developer Tools & Infra',
  'Logistics & Supply Chain', 'AgriTech', 'EdTech'
];
const INDUSTRIES = [
  'BFSI', 'Healthcare', 'Retail & E-Commerce', 'Education',
  'Manufacturing', 'Logistics', 'Real Estate', 'Agriculture',
  'Media & Entertainment', 'Government', 'Telecom', 'Legal',
  'SaaS & Technology', 'HR & Staffing', 'Insurance', 'Automotive'
];

export function EditListingForm({ agent }: { agent: Agent }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: agent.name || '',
    oneLiner: agent.oneLiner || '',
    summary: agent.summary || '',
    website: agent.website || '',
    demoUrl: agent.demoUrl || '',
    videoUrl: agent.videoUrl || '',
    logoUrl: agent.logoUrl || '',
    category: agent.category || 'AI & LLMs',
    tags: agent.tags || [],
    industries: agent.industries || [],
    useCases: agent.useCases || '',
    rawIndustry: agent.rawIndustry || '',
    pricingModel: agent.pricingModel || '',
    pricing: agent.pricing || '',
    priceRange: agent.priceRange || '',
    freeTrial: agent.freeTrial || '',
    globalAvailability: agent.globalAvailability || false,
    usdPrice: agent.usdPrice || '',
    companyName: agent.companyName || '',
    foundedYear: agent.foundedYear?.toString() || '',
    teamSize: agent.teamSize || '',
    city: agent.city || '',
    founders: agent.founders || '',
    companyLinkedin: agent.companyLinkedin || '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: string, value: string | string[] | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleIndustry = (ind: string) => {
    const next = form.industries.includes(ind)
      ? form.industries.filter(i => i !== ind)
      : [...form.industries, ind];
    updateField('industries', next);
  };

  async function handleSubmit() {
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) fd.set(key, JSON.stringify(value));
      else if (typeof value === 'boolean') fd.set(key, value.toString());
      else fd.set(key, (value as string) || '');
    });

    const result = await updateListing(agent.id, fd);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || 'Failed to update listing');
    }
  }

  if (submitted) {
    return (
      <div className="listing-wizard">
        <div className="listing-form-card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>âœ…</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Changes Submitted</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
            Your updates for <strong>{form.name}</strong> have been saved and sent for re-moderation.
          </p>
          <Link href="/vendor/listings" className="listing-btn-next" style={{ textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="listing-wizard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Edit Listing</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Updating: {agent.name}</p>
        </div>
        <div className="listing-progress" style={{ margin: 0, gap: '12px' }}>
          {STEPS.map((s, i) => (
            <div key={s} className={`listing-step-num ${i + 1 === step ? 'active' : i + 1 < step ? 'done' : ''}`} style={{ width: '32px', height: '32px', fontSize: '12px' }}>
              {i + 1 < step ? 'âœ“' : i + 1}
            </div>
          ))}
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

      <div className="listing-form-card">
        {step === 1 && (
          <>
            <div className="listing-field">
              <label className="listing-label">Tool Name *</label>
              <input className="listing-input" value={form.name} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div className="listing-field">
              <label className="listing-label">One-Liner *</label>
              <input className="listing-input" value={form.oneLiner} onChange={e => updateField('oneLiner', e.target.value)} />
            </div>
            <div className="listing-field">
              <label className="listing-label">Summary *</label>
              <textarea className="listing-input listing-textarea" rows={5} value={form.summary} onChange={e => updateField('summary', e.target.value)} />
            </div>
            <div className="listing-grid-2">
              <div className="listing-field">
                <label className="listing-label">Website *</label>
                <input className="listing-input" value={form.website} onChange={e => updateField('website', e.target.value)} />
              </div>
              <div className="listing-field">
                <label className="listing-label">Logo URL</label>
                <input className="listing-input" value={form.logoUrl} onChange={e => updateField('logoUrl', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="listing-field">
              <label className="listing-label">Category *</label>
              <select className="listing-input listing-select" value={form.category} onChange={e => updateField('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="listing-field">
              <label className="listing-label">Industries served</label>
              <div className="listing-chips">
                {INDUSTRIES.map(ind => (
                  <button key={ind} type="button" className={`listing-chip ${form.industries.includes(ind) ? 'selected' : ''}`} onClick={() => toggleIndustry(ind)}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>
            <div className="listing-field">
              <label className="listing-label">Use Cases</label>
              <textarea className="listing-input listing-textarea" value={form.useCases} onChange={e => updateField('useCases', e.target.value)} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="listing-field">
              <label className="listing-label">Pricing Model *</label>
              <div className="listing-pricing-grid">
                {['free', 'freemium', 'paid', 'contact'].map(opt => (
                  <div key={opt} className={`listing-pricing-card ${form.pricingModel === opt ? 'selected' : ''}`} onClick={() => updateField('pricingModel', opt)}>
                    <span className="label" style={{ textTransform: 'capitalize' }}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="listing-field">
              <label className="listing-label">Display Price</label>
              <input className="listing-input" value={form.pricing} onChange={e => updateField('pricing', e.target.value)} />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="listing-grid-2">
              <div className="listing-field">
                <label className="listing-label">Company Name</label>
                <input className="listing-input" value={form.companyName} onChange={e => updateField('companyName', e.target.value)} />
              </div>
              <div className="listing-field">
                <label className="listing-label">City</label>
                <input className="listing-input" value={form.city} onChange={e => updateField('city', e.target.value)} />
              </div>
            </div>
            <div className="listing-field">
              <label className="listing-label">Founders</label>
              <input className="listing-input" value={form.founders} onChange={e => updateField('founders', e.target.value)} />
            </div>
          </>
        )}

        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Ready to save?</h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>Your tool will be re-moderated after saving these changes.</p>
          </div>
        )}

        <div className="listing-nav">
          <button type="button" className="listing-btn-back" onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button type="button" className="listing-btn-next" onClick={() => step < 5 ? setStep(step + 1) : handleSubmit()}>
            {step === 5 ? 'Save Changes âœ“' : 'Next Step â†’'}
          </button>
        </div>
      </div>
    </div>
  );
}
