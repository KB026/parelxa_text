import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: listing } = await supabase
    .from('agents')
    .select('*')
    .eq('id', Number(params.id))
    .single();

  if (!listing) {
    return redirect('/admin/listings');
  }

  async function updateListing(formData: FormData) {
    'use server';
    const supabase = createClient();
    const id = Number(formData.get('id') as string);
    
    // Explicitly cast FormData to strings to satisfy Supabase JSON/Text column requirements
    const updates = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      website: formData.get('website') as string,
      one_liner: formData.get('one_liner') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      sub_category: formData.get('sub_category') as string,
      pricing: formData.get('pricing') as string,
      founders: formData.get('founders') as string,
      founder_linkedin: formData.get('founder_linkedin') as string,
      founded_year: formData.get('founded_year') ? Number(formData.get('founded_year') as string) : null,
      city: formData.get('city') as string,
      logo_url: formData.get('logo_url') as string,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Update failed:', error);
      return;
    }

    revalidatePath('/admin/listings');
    revalidatePath(`/products/${listing?.slug}`);
    redirect('/admin/listings');
  }

  return (
    <section>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/listings" style={{ color: 'var(--text-dim)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          ← Back to Listings
        </Link>
        <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Edit Listing: {listing.name}</h1>
        <p style={{ color: 'var(--text-muted)' }}>Correct or update agent data to maintain high directory standards.</p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '40px' }}>
        <form action={updateListing} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <input type="hidden" name="id" value={listing.id} />
          
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Agent Name</label>
            <input name="name" defaultValue={listing.name || ''} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Slug (URL Name)</label>
            <input name="slug" defaultValue={listing.slug || ''} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Website URL</label>
            <input name="website" defaultValue={listing.website || ''} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Category</label>
            <select name="category" defaultValue={listing.category || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
              <option value="Customer Support">Customer Support</option>
              <option value="Data & Analytics">Data & Analytics</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="DevOps & IT">DevOps & IT</option>
              <option value="Generic">Generic</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>One-liner (Tagline)</label>
            <input name="one_liner" defaultValue={listing.one_liner || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Description</label>
            <textarea name="description" defaultValue={listing.description || ''} rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white', fontFamily: 'inherit' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Founders / Team</label>
            <input name="founders" defaultValue={listing.founders || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Pricing Model</label>
            <input name="pricing" defaultValue={listing.pricing || ''} placeholder="e.g. Freemium, Paid, Free Trial" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Logo URL</label>
            <input name="logo_url" defaultValue={listing.logo_url || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Founder LinkedIn</label>
            <input name="founder_linkedin" defaultValue={listing.founder_linkedin || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '14px' }}>Save All Changes</button>
            <Link href="/admin/listings" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center', textDecoration: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cancel</Link>
          </div>
        </form>
      </div>
    </section>
  );
}