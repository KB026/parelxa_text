'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState<'' | 'loading' | 'success' | 'error'>('');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch('https://formspree.io/f/xlgalrzz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white/[0.08] selection:text-[#EDEDED] py-24 px-6 sm:px-12 flex flex-col items-center">
      <article className="max-w-2xl w-full mx-auto">
        
        <header className="mb-16 border-b border-white/[0.08] pb-10 text-center">
          <div className="inline-block px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 border border-blue-500/20">
            Get In Touch
          </div>
          <h1 className="text-[#EDEDED] text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Contact Parlexa
          </h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed">
            Have a question about an AI tool, need help listing your enterprise software, or want to explore partnership opportunities? We're here to help.
          </p>
        </header>

        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />
          
          {status === 'success' ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                ✓
              </div>
              <h3 className="text-2xl font-semibold text-[#EDEDED] mb-3">Message Received!</h3>
              <p className="text-[#A1A1AA] mb-8 leading-relaxed">We've successfully received your inquiry and our support team will get back to you within 24 hours.</p>
              <button 
                onClick={() => setStatus('')}
                className="px-6 py-3 bg-transparent border border-white/[0.08] text-[#EDEDED] rounded-lg hover:bg-white/[0.04] transition-colors font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#71717A] uppercase tracking-widest">Your Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full p-4 bg-[#0A0A0A] border border-white/[0.08] rounded-xl text-[#EDEDED] placeholder-[#71717A] focus:outline-none focus:border-white/[0.2] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#71717A] uppercase tracking-widest">Work Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                    className="w-full p-4 bg-[#0A0A0A] border border-white/[0.08] rounded-xl text-[#EDEDED] placeholder-[#71717A] focus:outline-none focus:border-white/[0.2] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#71717A] uppercase tracking-widest">Inquiry Type</label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-[#0A0A0A] border border-white/[0.08] rounded-xl text-[#EDEDED] focus:outline-none focus:border-white/[0.2] transition-colors cursor-pointer appearance-none"
                >
                  <option value="" disabled className="text-[#71717A]">Select a topic...</option>
                  <option value="General Support">General Support</option>
                  <option value="Vendor Listing Help">Listing My Tool / Vendor Help</option>
                  <option value="Billing Issue">Billing & Upgrades</option>
                  <option value="Partnerships">Business Partnerships</option>
                  <option value="Report Issue">Report a Bug / Issue</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#71717A] uppercase tracking-widest">How can we help you?</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Please describe your request in detail..."
                  rows={5}
                  className="w-full p-4 bg-[#0A0A0A] border border-white/[0.08] rounded-xl text-[#EDEDED] placeholder-[#71717A] focus:outline-none focus:border-white/[0.2] transition-colors resize-y"
                />
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                  Something went wrong. Please try again or email us directly.
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className={`w-full p-4 bg-[#EDEDED] text-[#0A0A0A] rounded-xl font-semibold transition-all mt-2 ${
                  status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-white'
                }`}
              >
                {status === 'loading' ? 'Sending Message...' : 'Send Message'}
              </button>
              <p className="text-xs text-[#71717A] text-center mt-2">
                Secured by Formspree API. We respect your privacy.
              </p>

            </form>
          )}
        </div>
      </article>
    </main>
  );
}
