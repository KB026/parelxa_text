'use client';

interface AboutSectionProps {
  description?: string;
  features?: string[];
  useCases?: string;
}

export function AboutSection({ description, features = [], useCases }: AboutSectionProps) {
  // Simple "markdown" to HTML helper
  const formatText = (text: string) => {
    if (!text) return '';
    return text
      .split('\n\n')
      .map((para, i) => `<p key="${i}" style="margin-bottom: 20px; line-height: 1.8; color: var(--text-muted);">${para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
      .join('');
  };

  return (
    <section style={{ marginBottom: '64px' }}>
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>About the Tool</h3>
        <div 
          dangerouslySetInnerHTML={{ __html: formatText(description || '') }} 
          style={{ fontSize: '16px' }}
        />
      </div>

      {features.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Key Features</h4>
          <ul style={{ 
            listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' 
          }}>
            {features.map((feature, idx) => (
              <li key={idx} style={{ 
                display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px',
                background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>✓</span>
                <span style={{ color: 'var(--text-white)', fontSize: '15px' }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {useCases && (
        <div>
          <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Top Use Cases</h4>
          <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '16px', borderLeft: '4px solid var(--cyan)' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>{useCases}</p>
          </div>
        </div>
      )}
    </section>
  );
}
