import { createClient } from '@/lib/supabase/server';
import { DollarSign } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type SiteSetting = {
  key: string;
  value: {
    enabled?: boolean;
    text?: string;
    link?: string;
    weekly?: number;
    monthly?: number;
  };
};

export default async function AdminSettings() {
  const supabase = createClient();

  // Fetch all settings
  const { data: settings } = await supabase.from('site_settings').select('*');
  const siteSettings = (settings ?? []) as unknown as SiteSetting[];
  
  const banner =
    siteSettings.find((s: SiteSetting) => s.key === 'announcement_banner')?.value ||
    { enabled: false, text: '', link: '' };
    
  const pricing = 
    siteSettings.find((s: SiteSetting) => s.key === 'featured_pricing')?.value || 
    { weekly: 0, monthly: 0 };

  async function updateBanner(formData: FormData) {
    'use server';
    const supabase = createClient();
    
    // FIX: Cast formData values to strings so they are valid JSON
    const value = {
      enabled: formData.get('enabled') === 'on',
      text: formData.get('text') as string,
      link: formData.get('link') as string
    };
    
    await supabase.from('site_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', 'announcement_banner');
    revalidatePath('/admin/settings');
    revalidatePath('/');
  }

  async function updatePricing(formData: FormData) {
    'use server';
    const supabase = createClient();
    
    // FIX: Cast formData to strings before wrapping in Number()
    const value = {
      weekly: Number(formData.get('weekly') as string),
      monthly: Number(formData.get('monthly') as string)
    };
    
    await supabase.from('site_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', 'featured_pricing');
    revalidatePath('/admin/settings');
    revalidatePath('/');
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Global Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure site-wide parameters and operational configurations.</p>
        </div>
        <Link href="/admin/settings/admins" className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}> Manage Admins → </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Announcement Banner */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <span>📢</span> Announcement Banner
          </h3>
          <form action={updateBanner}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  name="enabled" 
                  defaultChecked={banner.enabled} 
                  id="banner_enabled"
                />
                <label htmlFor="banner_enabled" style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Enable Banner Visibility</label>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Banner Text</label>
                <input 
                  name="text" 
                  defaultValue={banner.text}
                  placeholder="e.g. Special Launch Offer: Get 50% off featured listings!"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Action Link (Optional)</label>
                <input 
                  name="link" 
                  defaultValue={banner.link}
                  placeholder="https://parlexa.in/promo"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }}
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px' }}
              >
                Save Banner Config
              </button>
            </div>
          </form>
        </div>

        {/* Featured Listing Pricing */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <span><DollarSign size={14} /></span> Promotion Pricing (USD)
          </h3>
          <form action={updatePricing}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Weekly Rate</label>
                <input 
                  name="weekly" 
                  type="number"
                  defaultValue={pricing.weekly}
                  placeholder="$"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Monthly Rate</label>
                <input 
                  name="monthly" 
                  type="number"
                  defaultValue={pricing.monthly}
                  placeholder="$"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }}
                />
              </div>
            </div>
            <button 
              type="submit"
              className="btn-primary" style={{ marginTop: '24px', padding: '12px 24px' }}
            >
              Update Pricing
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
