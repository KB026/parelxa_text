'use client';

import { useSearchParams } from 'next/navigation';
import { Category } from '@/lib/types';
import { useState } from 'react';
import { X } from 'lucide-react';

interface FilterPanelProps {
  categories: Category[];
  industries: string[];
}

export function FilterPanel({ categories, industries }: FilterPanelProps) {
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeCats = searchParams.get('cats')?.split(',') || [];
  const activePricing = searchParams.get('pricing')?.split(',') || [];
  const activeIndustries = searchParams.get('industries')?.split(',') || [];
  const activeRating = searchParams.get('rating') || 'any';

  const updateFilters = (key: string, value: string, isArray: boolean = true) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (isArray) {
      const current = params.get(key)?.split(',').filter(v => v) || [];
      const updated = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      
      if (updated.length > 0) params.set(key, updated.join(','));
      else params.delete(key);
    } else {
      if (params.get(key) === value) params.delete(key);
      else params.set(key, value);
    }
    
    params.delete('page'); // Reset pagination on filter change
    
    window.history.replaceState(null, '', `/products?${params.toString()}`);
    window.dispatchEvent(new Event('filters-changed'));
  };

  const clearAll = () => {
    window.history.replaceState(null, '', '/products');
    window.dispatchEvent(new Event('filters-changed'));
  };

  const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ marginBottom: '32px' }}>
      <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', marginBottom: '16px' }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
    </div>
  );

  const Checkbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
        style={{ width: '18px', height: '18px', borderRadius: '4px', accentColor: 'var(--cyan)' }}
      />
      <span style={{ color: checked ? 'var(--text-white)' : 'var(--text-muted)' }}>{label}</span>
    </label>
  );

  const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
      <span style={{ color: checked ? 'var(--text-white)' : 'var(--text-muted)' }}>{label}</span>
      <div 
        onClick={onChange}
        style={{ 
          width: '36px', height: '20px', borderRadius: '10px', 
          background: checked ? 'var(--cyan)' : 'var(--bg-secondary)',
          position: 'relative', transition: '0.2s'
        }}
      >
        <div style={{ 
          width: '14px', height: '14px', borderRadius: '50%', background: checked ? 'black' : 'var(--text-dim)',
          position: 'absolute', top: '3px', left: checked ? '19px' : '3px', transition: '0.2s'
        }} />
      </div>
    </label>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="filter-sidebar" style={{ width: '280px', flexShrink: 0 }}>

        <FilterSection title="Category">
          {categories.map(cat => (
            <Checkbox 
              key={cat.id} 
              label={cat.name} 
              checked={activeCats.includes(cat.name)}
              onChange={() => updateFilters('cats', cat.name)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Pricing Model">
          {['Free', 'Freemium', 'Paid'].map(model => (
            <Checkbox 
              key={model} 
              label={model}
              checked={activePricing.includes(model)}
              onChange={() => updateFilters('pricing', model)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Minimum Rating">
          {[4, 3, 2].map(r => (
            <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input 
                type="radio" 
                name="rating"
                checked={activeRating === r.toString()}
                onChange={() => updateFilters('rating', r.toString(), false)}
                style={{ accentColor: 'var(--cyan)' }}
              />
              <span style={{ color: activeRating === r.toString() ? 'var(--text-white)' : 'var(--text-muted)' }}>{r}+ Stars</span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Features">
          <Toggle 
            label="Verified Only" 
            checked={searchParams.get('verified') === 'true'}
            onChange={() => updateFilters('verified', 'true', false)}
          />
          <Toggle 
            label="Global Availability" 
            checked={searchParams.get('global') === 'true'}
            onChange={() => updateFilters('global', 'true', false)}
          />
          <Toggle 
            label="Free Trial" 
            checked={searchParams.get('trial') === 'true'}
            onChange={() => updateFilters('trial', 'true', false)}
          />
        </FilterSection>

        {industries.length > 0 && (
          <FilterSection title="Industry">
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
              {industries.map(ind => (
                <Checkbox 
                  key={ind} 
                  label={ind}
                  checked={activeIndustries.includes(ind)}
                  onChange={() => updateFilters('industries', ind)}
                />
              ))}
            </div>
          </FilterSection>
        )}
      </aside>

      {/* Mobile Bottom Sheet Trigger */}
      <div 
        className="mobile-filter-trigger"
        onClick={() => setIsMobileOpen(true)}
        style={{ 
          position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--cyan)', color: 'black', padding: '12px 24px', borderRadius: '100px',
          fontWeight: 700, boxShadow: '0 8px 16px rgba(0,0,0,0.5)', zIndex: 90,
          display: 'none', cursor: 'pointer'
        }}
      >
        Filters {searchParams.toString() && '•'}
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
          <div onClick={() => setIsMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, 
            background: 'var(--bg-card)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
            maxHeight: '85vh', overflowY: 'auto', padding: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 800 }}>Filters</h3>
              <button onClick={() => setIsMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Same content as desktop sidebar but bigger for touch */}
            <div style={{ transform: 'scale(1.1)', transformOrigin: 'top left', paddingBottom: '40px' }}>
              {/* Categories/Pricing/etc... same as above */}
              ... content rendered via a shared inner component or similar
            </div>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="btn-get-started"
              style={{ width: '100%', padding: '16px', borderRadius: '12px' }}
            >
              Show Results
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          .filter-sidebar { display: none; }
          .mobile-filter-trigger { display: block; }
        }
      `}} />
    </>
  );
}
