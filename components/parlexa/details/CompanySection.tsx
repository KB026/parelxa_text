'use client';

interface CompanySectionProps {
  companyName?: string;
  foundingYear?: number;
  city?: string;
  teamSize?: string;
  companyLinkedin?: string;
  companyBlurb?: string;
}

export function CompanySection({ 
  companyName, 
  foundingYear, 
  city, 
  teamSize, 
  companyLinkedin, 
  companyBlurb 
}: CompanySectionProps) {
  return (
    <section style={{ marginBottom: '64px' }}>
      <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Built by {companyName || 'the Team'}</h3>
      
      <div style={{ 
        padding: '32px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', 
        borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px'
      }}>
        {/* Company Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '4px' }}>Founded In</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{foundingYear || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '4px' }}>Headquarters</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{city || 'India'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '4px' }}>Team Size</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{teamSize || '1-10'} members</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '4px' }}>Presence</div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>
              <a href={companyLinkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>LinkedIn â†—</a>
            </div>
          </div>
        </div>

        {/* Company Blurb */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '15px' }}>
            {companyBlurb || `A forward-thinking company focused on pushing the boundaries of AI in India. Founded in ${city}, they have been building innovative tools since ${foundingYear}.`}
          </p>
        </div>
      </div>
    </section>
  );
}
