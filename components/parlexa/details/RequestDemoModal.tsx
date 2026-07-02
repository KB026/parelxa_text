'use client';

import { useState } from 'react';
import { Agent } from '@/lib/types';
import { CheckCircle, X } from 'lucide-react';

interface RequestDemoModalProps {
  agent: Agent;
  onClose: () => void;
}

export function RequestDemoModal({ agent, onClose }: RequestDemoModalProps) {
  const [status, setStatus] = useState<'' | 'loading' | 'success' | 'error'>('');
  const [formData, setFormData] = useState({ 
    customerName: '', 
    customerEmail: '', 
    message: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: agent.userId,
          agentId: agent.id,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          message: formData.message
        })
      });
      
      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '24px', right: '24px', background: 'transparent',
            border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer'
          }}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Request Demo</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          Get in touch with the team behind {agent.name}.
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(52, 211, 153, 0.1)', color: '#34D399', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Request Sent!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              The vendor has been notified and will contact you shortly.
            </p>
            <button 
              onClick={onClose}
              style={{ padding: '12px 24px', background: 'var(--cyan)', color: 'black', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Your Name</label>
              <input 
                type="text" 
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Work Email</label>
              <input 
                type="email" 
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="I would like to schedule a demo..."
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {status === 'error' && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#EF4444', fontSize: '14px', textAlign: 'center' }}>
                Failed to send request. Please try again.
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'loading'}
              style={{ 
                width: '100%', padding: '14px', background: 'var(--cyan)', color: 'black', 
                borderRadius: '12px', fontSize: '15px', fontWeight: 700, border: 'none', 
                cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.7 : 1,
                marginTop: '8px'
              }}
            >
              {status === 'loading' ? 'Sending...' : 'Request Demo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
