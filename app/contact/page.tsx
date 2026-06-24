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
    <main style={{ minHeight: '100vh', padding: '120px 20px', background: 'var(--bg-default)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ maxWidth: '600px', width: '100%', marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--cyan)', borderRadius: '20px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
          Get In Touch
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 800, color: 'var(--text-white)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Contact Parlexa
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Have a question about an AI tool, need help listing your enterprise software, or want to explore partnership opportunities? We&apos;re here to help.
        </p>
      </div>

      <div style={{ maxWidth: '600px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)' }} />
        
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(52, 211, 153, 0.1)', color: '#34D399', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>
              âœ“
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-white)', marginBottom: '12px' }}>Message Received!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>We&apos;ve successfully received your inquiry and our support team will get back to you within 24 hours.</p>
            <button 
              onClick={() => setStatus('')}
              style={{ marginTop: '30px', padding: '12px 24px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-white)', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Your Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Work Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@company.com"
                  style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Inquiry Type</label>
              <select 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="" disabled>Select a topic...</option>
                <option value="General Support">General Support</option>
                <option value="Vendor Listing Help">Listing My Tool / Vendor Help</option>
                <option value="Billing Issue">Billing & Upgrades</option>
                <option value="Partnerships">Business Partnerships</option>
                <option value="Report Issue">Report a Bug / Issue</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>How can we help you?</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Please describe your request in detail..."
                rows={5}
                style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {status === 'error' && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#EF4444', fontSize: '14px', textAlign: 'center' }}>
                Something went wrong. Please try again or email us directly.
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'loading'}
              style={{ 
                width: '100%', padding: '16px', background: 'var(--cyan)', color: 'black', 
                borderRadius: '12px', fontSize: '16px', fontWeight: 700, border: 'none', 
                cursor: status === 'loading' ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                opacity: status === 'loading' ? 0.7 : 1, marginTop: '8px'
              }}
            >
              {status === 'loading' ? 'Sending Message...' : 'Send Message'}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '4px' }}>
              Secured by Formspree API. We respect your privacy.
            </p>

          </form>
        )}
      </div>

    </main>
  );
}
