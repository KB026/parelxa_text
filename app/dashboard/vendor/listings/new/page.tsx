'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Tags, CreditCard, Building2, Eye, Check, ArrowLeft } from 'lucide-react';
import { ImageUpload } from '@/components/parlexa/ui/ImageUpload';
import PlanPickerScreen from '@/components/parlexa/vendor/PlanPickerScreen';
const STORAGE_KEY = 'parlexa_listing_draft';
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

interface FormData {
  // Step 1
  name: string;
  one_liner: string;
  summary: string;
  website: string;
  demo_url: string;
  video_url: string;
  logo_url: string;
  screenshots: string[];
  // Step 2
  category: string;
  tags: string[];
  industries: string[];
  use_cases: string;
  raw_industry: string;
  // Step 3
  pricing_model: string;
  pricing: string;
  price_range: string;
  free_trial: string;
  has_india_pricing: boolean;
  inr_price: string;
  // Step 4
  company_name: string;
  founded_year: string;
  team_size: string;
  city: string;
  founders: string;
  company_linkedin: string;
  company_gstin: string;
  contact_name: string;
  contact_phone: string;
  how_did_you_hear: string;
  how_did_you_hear_custom: string;
  external_reviews: Array<{ platform: string; url: string }>;
}

const defaultForm: FormData = {
  name: '', one_liner: '', summary: '', website: '', demo_url: '', video_url: '', logo_url: '', screenshots: [],
  category: 'AI & LLMs', tags: [], industries: [], use_cases: '', raw_industry: '',
  pricing_model: '', pricing: '', price_range: '', free_trial: '', has_india_pricing: false, inr_price: '',
  company_name: '', founded_year: '', team_size: '', city: '', founders: '', company_linkedin: '', company_gstin: '',
  contact_name: '', contact_phone: '', how_did_you_hear: '', how_did_you_hear_custom: '',
  external_reviews: [],
};

export default function NewListingPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [tagInput, setTagInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedAgentId, setSubmittedAgentId] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGstRegistered, setIsGstRegistered] = useState(false);

  // Load draft from localStorage — but clear it if ?fresh=true
  useEffect(() => {
    const isFresh = searchParams.get('fresh') === 'true';
    if (isFresh) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(prev => ({ ...prev, ...parsed.data }));
        if (parsed.data?.company_gstin) {
          setIsGstRegistered(true);
        }
        if (parsed.step) setStep(parsed.step);
      }
    } catch { /* ignore */ }
  }, [searchParams]);

  // Auto-save on change
  const autoSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: form, step }));
      setLastSaved(new Date().toLocaleTimeString());
    } catch { /* ignore */ }
  }, [form, step]);

  useEffect(() => {
    const timer = setTimeout(autoSave, 500);
    return () => clearTimeout(timer);
  }, [autoSave]);

  const updateField = (field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleIndustry = (ind: string) => {
    setForm(prev => ({
      ...prev,
      industries: prev.industries.includes(ind)
        ? prev.industries.filter(i => i !== ind)
        : [...prev.industries, ind]
    }));
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && form.tags.length < 10 && !form.tags.includes(trimmed)) {
      updateField('tags', [...form.tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (idx: number) => {
    updateField('tags', form.tags.filter((_, i) => i !== idx));
  };

  async function handleSubmit() {
    if (!form.logo_url) {
      alert('Logo Upload is required to submit your listing.');
      setStep(1);
      return;
    }
    if (!form.screenshots || form.screenshots.length === 0) {
      alert('At least 1 Product Screenshot is required to submit your listing.');
      setStep(1);
      return;
    }
    if (!form.how_did_you_hear) {
      alert('Please select how you heard about Parlexa.');
      setStep(4);
      return;
    }
    if (form.how_did_you_hear === 'Other' && !form.how_did_you_hear_custom.trim()) {
      alert('Please specify how you heard about Parlexa in the text box.');
      setStep(4);
      return;
    }

    const finalSource = form.how_did_you_hear === 'Other' && form.how_did_you_hear_custom
      ? `Other: ${form.how_did_you_hear_custom.trim()}`
      : form.how_did_you_hear;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/listings/create', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, how_did_you_hear: finalSource })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit listing');
      }

      localStorage.removeItem(STORAGE_KEY);
      setSubmittedAgentId(data.id);
      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Submission Error:', err);
      alert('Error submitting listing: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── PLAN PICKER (shown after successful submission) ──
  if (submitted && submittedAgentId) {
    return (
      <PlanPickerScreen
        toolName={form.name}
        agentId={submittedAgentId}
      />
    );
  }

  return (
    <div className="listing-wizard">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>List Your AI Tool</h1>
        {lastSaved && (
          <div className="listing-autosave">
            <span className="dot" />
            Draft saved {lastSaved}
          </div>
        )}
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '28px' }}>
        Complete all 5 steps to submit your tool for review.
      </p>

      {/* Step Progress */}
      <div className="listing-progress">
        {STEPS.map((s, i) => (
          <div key={s} className={`listing-step-item ${i + 1 === step ? 'active' : i + 1 < step ? 'done' : ''}`}>
            <div className="listing-step-num">{i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}</div>
            <div className="listing-step-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="listing-form-card">
        {/* ——— STEP 1: BASIC INFO ——— */}
        {step === 1 && (
          <>
            <div className="listing-form-title flex items-center gap-2"><FileText className="w-5 h-5" /> Basic Information</div>
            <div className="listing-form-desc">Tell us about your AI tool. This is what users see first.</div>

            <div className="listing-field">
              <label className="listing-label">Tool Name *</label>
              <input className="listing-input" placeholder="e.g. Parlexa AI" value={form.name} onChange={e => updateField('name', e.target.value)} />
            </div>

            <div className="listing-field">
              <label className="listing-label">One-Liner Description * <span className="optional">(max 120 characters)</span></label>
              <input className="listing-input" placeholder="A concise tagline for your tool..." maxLength={120} value={form.one_liner} onChange={e => updateField('one_liner', e.target.value)} />
              <div className={`listing-char-count ${form.one_liner.length > 120 ? 'over' : ''}`}>{form.one_liner.length}/120</div>
            </div>

            <div className="listing-field">
              <label className="listing-label">Full Description * <span className="optional">(max 1000 characters)</span></label>
              <textarea className="listing-input listing-textarea" placeholder="Describe what your AI tool does, its key features, and why users should choose it..." maxLength={1000} value={form.summary} onChange={e => updateField('summary', e.target.value)} rows={5} />
              <div className={`listing-char-count ${form.summary.length > 1000 ? 'over' : ''}`}>{form.summary.length}/1000</div>
            </div>

            <div className="listing-grid-2">
              <div className="listing-field">
                <label className="listing-label">Website URL *</label>
                <input className="listing-input" type="url" placeholder="https://..." value={form.website} onChange={e => updateField('website', e.target.value)} />
              </div>
              <div className="listing-field">
                <label className="listing-label">Demo Link <span className="optional">(optional)</span></label>
                <input className="listing-input" type="url" placeholder="https://demo.example.com" value={form.demo_url} onChange={e => updateField('demo_url', e.target.value)} />
              </div>
            </div>

            <div className="listing-grid-2">
              <div className="listing-field">
                <label className="listing-label">Product Video <span className="optional">(optional)</span></label>
                <input className="listing-input" type="url" placeholder="YouTube or Loom link" value={form.video_url} onChange={e => updateField('video_url', e.target.value)} />
              </div>
              <ImageUpload
                bucket="agent-logos"
                folder="logos"
                label="Logo Upload *"
                helperText="square, min 200x200 (Required)"
                value={form.logo_url}
                onChange={(url) => updateField('logo_url', url as string)}
              />
            </div>

            <ImageUpload
              bucket="agent-screenshots"
              folder="screenshots"
              multiple={true}
              maxFiles={6}
              label="Product Screenshots *"
              helperText="Upload screenshots of your product — at least 1 image is required (up to 6)"
              value={form.screenshots}
              onChange={(urls) => updateField('screenshots', urls as string[])}
            />
          </>
        )}

        {/* ——— STEP 2: CLASSIFICATION ——— */}
        {step === 2 && (
          <>
            <div className="listing-form-title flex items-center gap-2"><Tags className="w-5 h-5" /> Classification</div>
            <div className="listing-form-desc">Help users discover your tool with the right categories and tags.</div>

            <div className="listing-field">
              <label className="listing-label">Primary Category *</label>
              <select className="listing-input listing-select" value={form.category} onChange={e => updateField('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="listing-field">
              <label className="listing-label">Primary Industry Focus *</label>
              <input className="listing-input" placeholder="e.g. Artificial Intelligence, SaaS" value={form.raw_industry} onChange={e => updateField('raw_industry', e.target.value)} />
            </div>

            <div className="listing-field">
              <label className="listing-label">Tags / Keywords <span className="optional">(max 10, press Enter to add)</span></label>
              <div className="listing-tags-wrap">
                {form.tags.map((tag, i) => (
                  <span key={i} className="listing-tag">
                    {tag}
                    <button className="listing-tag-remove" onClick={() => removeTag(i)}>×</button>
                  </span>
                ))}
                {form.tags.length < 10 && (
                  <input
                    className="listing-tag-input"
                    placeholder={form.tags.length === 0 ? 'Type a tag and press Enter...' : ''}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); } }}
                    onBlur={() => { if (tagInput) addTag(tagInput); }}
                  />
                )}
              </div>
            </div>

            <div className="listing-field">
              <label className="listing-label">Industries Served <span className="optional">(select all that apply)</span></label>
              <div className="listing-chips">
                {INDUSTRIES.map(ind => (
                  <button key={ind} type="button" className={`listing-chip ${form.industries.includes(ind) ? 'selected' : ''}`} onClick={() => toggleIndustry(ind)}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="listing-field">
              <label className="listing-label">Use Case Description *</label>
              <textarea className="listing-input listing-textarea" placeholder="Describe the main use cases and scenarios where your tool adds value..." value={form.use_cases} onChange={e => updateField('use_cases', e.target.value)} rows={3} />
            </div>
          </>
        )}

        {/* ——— STEP 3: PRICING ——— */}
        {step === 3 && (
          <>
            <div className="listing-form-title flex items-center gap-2"><CreditCard className="w-5 h-5" /> Pricing & Availability</div>
            <div className="listing-form-desc">Let users know how your pricing works.</div>

            <div className="listing-field">
              <label className="listing-label">Pricing Model *</label>
              <div className="listing-pricing-grid">
                {[
                  { id: 'free', label: 'Free' },
                  { id: 'freemium', label: 'Freemium' },
                  { id: 'paid', label: 'Paid' },
                  { id: 'contact', label: 'Contact for Pricing' },
                ].map(opt => (
                  <div key={opt.id} className={`listing-pricing-card ${form.pricing_model === opt.id ? 'selected' : ''}`} onClick={() => {
                    updateField('pricing_model', opt.id);
                    if (opt.id === 'free') updateField('pricing', 'Free');
                    else if (opt.id === 'contact') updateField('pricing', 'Contact for pricing');
                    else if (form.pricing === 'Free' || form.pricing === 'Contact for pricing') updateField('pricing', '');
                  }}>
                    <span className="label">{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {(form.pricing_model === 'paid' || form.pricing_model === 'freemium') && (
              <div className="listing-field">
                <label className="listing-label">Price / Price Range *</label>
                <input className="listing-input" placeholder="e.g. $29/month, ₹2,999/month, $99-299/month" value={form.pricing} onChange={e => updateField('pricing', e.target.value)} />
              </div>
            )}



            <div className="listing-field">
              <label className="listing-label">Free Trial Available?</label>
              <div className="listing-pricing-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {['Yes', 'No', 'Free tier available'].map(opt => (
                  <div key={opt} className={`listing-pricing-card ${form.free_trial === opt ? 'selected' : ''}`} onClick={() => updateField('free_trial', opt)}>
                    <span className="label">{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="listing-field">
              <div className="listing-toggle-row">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-white)' }}>🇮🇳 India-specific Pricing</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>Do you offer pricing in INR?</div>
                </div>
                <button type="button" className={`listing-toggle ${form.has_india_pricing ? 'on' : ''}`} onClick={() => updateField('has_india_pricing', !form.has_india_pricing)} />
              </div>
            </div>

            {form.has_india_pricing && (
              <div className="listing-field">
                <label className="listing-label">INR Price</label>
                <input className="listing-input" placeholder="e.g. ₹2,999/month" value={form.inr_price} onChange={e => updateField('inr_price', e.target.value)} />
              </div>
            )}
          </>
        )}

        {/* ——— STEP 4: COMPANY ——— */}
        {step === 4 && (
          <>
            <div className="listing-form-title flex items-center gap-2"><Building2 className="w-5 h-5" /> Company Information</div>
            <div className="listing-form-desc">Tell us about the company behind this tool.</div>

            <div className="listing-grid-2">
              <div className="listing-field">
                <label className="listing-label">Company Name *</label>
                <input className="listing-input" placeholder="e.g. Parlexa Technologies" value={form.company_name} onChange={e => updateField('company_name', e.target.value)} />
              </div>
              <div className="listing-field">
                <label className="listing-label">Founding Year *</label>
                <input className="listing-input" type="number" placeholder="e.g. 2023" min={1990} max={2026} value={form.founded_year} onChange={e => updateField('founded_year', e.target.value)} />
              </div>
            </div>

            <div className="listing-grid-2">
              <div className="listing-field">
                <label className="listing-label">Team Size</label>
                <select className="listing-input listing-select" value={form.team_size} onChange={e => updateField('team_size', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
              <div className="listing-field">
                <label className="listing-label">Headquarters City *</label>
                <input className="listing-input" placeholder="e.g. Bengaluru" value={form.city} onChange={e => updateField('city', e.target.value)} />
              </div>
            </div>

            <div className="listing-field">
              <label className="listing-label">Founder(s) Name *</label>
              <input className="listing-input" placeholder="e.g. John Doe, Jane Smith" value={form.founders} onChange={e => updateField('founders', e.target.value)} />
            </div>

            <div className="listing-field">
              <label className="listing-label">Company LinkedIn <span className="optional">(optional)</span></label>
              <input className="listing-input" type="url" placeholder="https://linkedin.com/company/..." value={form.company_linkedin} onChange={e => updateField('company_linkedin', e.target.value)} />
            </div>

            <div className="listing-field">
              <div className="listing-toggle-row">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-white)' }}>🏢 Is your company GST registered?</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>Enable this if your business has a registered GSTIN in India</div>
                </div>
                <button
                  type="button"
                  className={`listing-toggle ${isGstRegistered ? 'on' : ''}`}
                  onClick={() => {
                    const next = !isGstRegistered;
                    setIsGstRegistered(next);
                    if (!next) {
                      updateField('company_gstin', '');
                    }
                  }}
                />
              </div>
            </div>

            {isGstRegistered && (
              <div className="listing-field">
                <label className="listing-label">Company GSTIN <span className="optional">(For B2B Tax Invoice & Credit)</span></label>
                <input
                  className="listing-input"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  value={form.company_gstin}
                  onChange={e => updateField('company_gstin', e.target.value.toUpperCase())}
                />
              </div>
            )}

            <div className="listing-grid-2">
              <div className="listing-field">
                <label className="listing-label">Contact Name *</label>
                <input className="listing-input" placeholder="e.g. John Doe" value={form.contact_name} onChange={e => updateField('contact_name', e.target.value)} />
              </div>
              <div className="listing-field">
                <label className="listing-label">Contact Phone *</label>
                <input className="listing-input" type="tel" placeholder="e.g. +91 9876543210" value={form.contact_phone} onChange={e => updateField('contact_phone', e.target.value)} />
              </div>
            </div>

            <div className="listing-field">
              <label className="listing-label">How did you hear about Parlexa? *</label>
              <select className="listing-input listing-select" value={form.how_did_you_hear} onChange={e => updateField('how_did_you_hear', e.target.value)}>
                <option value="">Select an option...</option>
                <option value="Google Search">Google Search</option>
                <option value="Social Media (LinkedIn, X/Twitter, Instagram, YouTube)">Social Media (LinkedIn, X / Twitter, Instagram, YouTube)</option>
                <option value="Friend / Founder Referral">Friend / Founder Referral</option>
                <option value="Blog / Article / Press">Blog / Article / Press</option>
                <option value="Product Hunt">Product Hunt</option>
                <option value="Other">Other</option>
              </select>
              {form.how_did_you_hear === 'Other' && (
                <input
                  className="listing-input"
                  style={{ marginTop: '8px' }}
                  placeholder="Please specify (e.g. Podcast, Tech Conference, Newsletter)..."
                  value={form.how_did_you_hear_custom}
                  onChange={e => updateField('how_did_you_hear_custom', e.target.value)}
                />
              )}
            </div>

            {/* Optional External Reviews Proof Section */}
            <div className="listing-field" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <label className="listing-label" style={{ marginBottom: 0 }}>External Reviews & Tractions <span className="optional">(Optional - Max 3)</span></label>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Provide links to your reviews on G2, Capterra, Trustpilot, Product Hunt, etc. Admins will verify your ratings.
                  </p>
                </div>
                {form.external_reviews.length < 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateField('external_reviews', [
                        ...form.external_reviews,
                        { platform: 'G2', url: '' },
                      ])
                    }
                    className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 rounded text-xs font-semibold"
                  >
                    + Add Link
                  </button>
                )}
              </div>

              {form.external_reviews.map((rev, idx) => (
                <div key={idx} className="listing-grid-2" style={{ marginTop: '12px', alignItems: 'center' }}>
                  <div className="listing-field" style={{ margin: 0 }}>
                    <select
                      className="listing-input listing-select"
                      value={rev.platform}
                      onChange={e => {
                        const updated = [...form.external_reviews];
                        updated[idx].platform = e.target.value;
                        updateField('external_reviews', updated);
                      }}
                    >
                      <option value="G2">G2</option>
                      <option value="Capterra">Capterra</option>
                      <option value="Trustpilot">Trustpilot</option>
                      <option value="Product Hunt">Product Hunt</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="listing-field" style={{ margin: 0, display: 'flex', gap: '8px' }}>
                    <input
                      className="listing-input"
                      type="url"
                      placeholder="https://g2.com/products/your-product/reviews"
                      value={rev.url}
                      onChange={e => {
                        const updated = [...form.external_reviews];
                        updated[idx].url = e.target.value;
                        updateField('external_reviews', updated);
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.external_reviews.filter((_, i) => i !== idx);
                        updateField('external_reviews', updated);
                      }}
                      style={{ color: '#ef4444', padding: '0 8px', fontSize: '16px', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ——— STEP 5: REVIEW ——— */}
        {step === 5 && (
          <>
            <div className="listing-form-title flex items-center gap-2"><Eye className="w-5 h-5" /> Review Your Listing</div>
            <div className="listing-form-desc">Here&apos;s how your tool will appear on Parlexa. Make sure everything looks good!</div>

            <div className="listing-preview">
              <div className="listing-preview-header">
                <div className="listing-preview-logo">
                  {form.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logo_url} alt="Logo" />
                  ) : (
                    form.name?.[0]?.toUpperCase() || 'P'
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>{form.name || 'Tool Name'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--cyan)' }}>{form.one_liner || 'One-liner description'}</div>
                </div>
                <span className="cat-pill" style={{ marginLeft: 'auto' }}>{form.category}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>{form.summary || 'Full description will appear here...'}</p>
              
              {form.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {form.tags.map((tag, i) => (
                    <span key={i} className="listing-tag">{tag}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Pricing</div>
                  <div style={{ fontSize: '14px', color: form.pricing_model === 'free' ? 'var(--green)' : 'var(--text-white)', marginTop: '2px' }}>{form.pricing || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Location</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-white)', marginTop: '2px' }}>{form.city || '-'}, India</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Founded</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-white)', marginTop: '2px' }}>{form.founded_year || '-'}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ——— NAVIGATION ——— */}
        <div className="listing-nav">
          {step > 1 ? (
            <button type="button" className="listing-btn-back" onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4 inline mr-1" /> Back</button>
          ) : (
            <Link href="/dashboard/vendor/listings" className="listing-btn-back" style={{ textDecoration: 'none' }}>Cancel</Link>
          )}

          {step < 5 ? (
            <button type="button" className="listing-btn-next" onClick={() => setStep(step + 1)}>
              Next Step &rarr;
            </button>
          ) : (
            <button 
              type="button" 
              className="listing-btn-submit" 
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review \u2713'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
