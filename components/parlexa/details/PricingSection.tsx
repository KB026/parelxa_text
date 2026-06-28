'use client';

interface PricingSectionProps {
  pricing: string;
  pricingModel?: string;
  priceRange?: string;
  freeTrial?: string;
  globalAvailability?: boolean;
  usdPrice?: string;
}

export function PricingSection({ 
  pricing, 
  pricingModel, 
  priceRange, 
  freeTrial, 
  globalAvailability,
  usdPrice
}: PricingSectionProps) {
  return (
    <section style={{ marginBottom: '64px' }}>
      <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Pricing & Plans</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Main Pricing Card */}
        <div style={{ 
          padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
          borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Base Pricing
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--cyan)' }}>
              {pricing}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Model</span>
              <span style={{ fontWeight: 600 }}>{pricingModel || 'Subscription'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Range</span>
              <span style={{ fontWeight: 600 }}>{priceRange || 'Contact for details'}</span>
            </div>
          </div>

          <div style={{ 
            marginTop: 'auto', padding: '12px', background: 'rgba(56, 189, 248, 0.08)', 
            borderRadius: '12px', textAlign: 'center', color: 'var(--cyan)', fontWeight: 700, fontSize: '14px',
            border: '1px solid rgba(56, 189, 248, 0.2)'
          }}>
            {freeTrial || 'No free trial available'}
          </div>
        </div>

        {/* Global Pricing Callout */}
        {globalAvailability && (
          <div style={{ 
            padding: '32px', background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)', 
            border: '2px solid var(--cyan)', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', top: '12px', right: '-32px', background: 'var(--cyan)', 
              color: 'black', padding: '4px 40px', transform: 'rotate(45deg)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'
            }}>
              Global
            </div>
            
            <div>
              <div style={{ color: 'var(--cyan)', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
                ðŸŒ International Pricing
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-white)' }}>
                {usdPrice || '$ Custom Plans'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--cyan)', marginTop: '4px' }}>
                Optimized pricing for enterprises worldwide
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>✦</span> Multi-currency support
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>✦</span> Global tax & compliance ready
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>✦</span> Multiple payment gateways
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
