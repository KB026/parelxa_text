'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function VendorUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('SaaS/Tech');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-vendor-upgrade', handleOpen);
    return () => window.removeEventListener('open-vendor-upgrade', handleOpen);
  }, []);

  const onClose = () => {
    setIsOpen(false);
    setError('');
  };

  const industries = [
    'SaaS/Tech', 'Marketing & Sales', 'E-Commerce/Retail', 'Healthcare',
    'FinTech', 'HR/Recruitment', 'Logistics', 'AgriTech', 'EdTech',
    'Content Creation', 'Real Estate', 'Other'
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/upgrade-to-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, companyWebsite, industry, contactEmail })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upgrade');
      }

      onClose();
      window.location.assign('/dashboard/vendor');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-md flex items-center justify-center p-5" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#0d1524] border border-white/10 rounded-2xl p-8 max-w-[480px] w-full max-h-[90vh] overflow-y-auto relative shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border-none text-slate-400 text-xl cursor-pointer flex items-center justify-center transition-colors hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Close">×</button>
        
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold m-0 text-slate-100">Become a Vendor on Parlexa</h2>
          <p className="text-slate-500 text-sm mt-2">List your AI tool in front of thousands of businesses. Tell us about your company to get started.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg text-sm mb-5 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-300">Company Name *</label>
            <input className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc." />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-300">Company Website *</label>
            <input className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type="url" required value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="https://acme.com" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-300">Industry *</label>
            <select className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" value={industry} onChange={e => setIndustry(e.target.value)} required>
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-300">Contact Email</label>
            <input className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contact@acme.com" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 text-sm font-semibold mt-4 transition-colors">
            {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin" /> : 'Upgrade to Vendor'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
