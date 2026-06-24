'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function ActiveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const filters: { key: string, value: string, label: string }[] = [];

  // Parse filters from URL
  searchParams.forEach((val, key) => {
    if (key === 'products' || key === 'sort' || key === 'page') return;
    
    if (key === 'cats' || key === 'pricing' || key === 'industries') {
      val.split(',').forEach(v => {
        filters.push({ key, value: v, label: v });
      });
    } else if (key === 'q') {
      filters.push({ key, value: val, label: `Search: "${val}"` });
    } else if (key === 'rating') {
      filters.push({ key, value: val, label: `${val}+ Stars` });
    } else if (key === 'verified' && val === 'true') {
      filters.push({ key, value: 'true', label: 'Verified Only' });
    } else if (key === 'global' && val === 'true') {
      filters.push({ key, value: 'true', label: 'Global Availability' });
    } else if (key === 'trial' && val === 'true') {
      filters.push({ key, value: 'true', label: 'Free Trial' });
    }
  });

  const removeFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (key === 'cats' || key === 'pricing' || key === 'industries') {
      const current = params.get(key)?.split(',') || [];
      const updated = current.filter(v => v !== value);
      if (updated.length > 0) params.set(key, updated.join(','));
      else params.delete(key);
    } else {
      params.delete(key);
    }
    
    router.push(`/products?${params.toString()}`);
  };

  if (filters.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
      {filters.map((f, i) => (
        <div 
          key={`${f.key}-${f.value}-${i}`}
          onClick={() => removeFilter(f.key, f.value)}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            padding: '6px 12px', background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-subtle)', borderRadius: '8px',
            fontSize: '13px', cursor: 'pointer', transition: '0.2s'
          }}
          className="filter-chip-active"
        >
          <span>{f.label}</span>
          <span style={{ fontSize: '10px', opacity: 0.5 }}>✕</span>
        </div>
      ))}
      <button 
        onClick={() => router.push('/products')}
        style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: '13px', cursor: 'pointer', padding: '6px' }}
      >
        Clear all
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .filter-chip-active:hover { border-color: var(--cyan); background: rgba(255,255,255,0.05); }
      `}} />
    </div>
  );
}
