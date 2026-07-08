'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendSubmissionConfirmation } from '@/lib/email/actions';

export async function submitNewListing(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Basic Info (Step 1)
  const name = formData.get('name') as string;
  const one_liner = formData.get('one_liner') as string;
  const summary = formData.get('summary') as string;
  const website = formData.get('website') as string;
  const demo_url = formData.get('demo_url') as string;
  const video_url = formData.get('video_url') as string;
  const logo_url = formData.get('logo_url') as string;

  // Classification (Step 2)
  const category = formData.get('category') as string;
  const raw_industry = formData.get('raw_industry') as string;
  const use_cases = formData.get('use_cases') as string;

  // Parse JSON arrays
  let tags: string[] = [];
  let industries: string[] = [];
  let screenshots: string[] = [];
  try {
    const tagsRaw = formData.get('tags') as string;
    if (tagsRaw) tags = JSON.parse(tagsRaw);
  } catch { /* ignore */ }
  try {
    const indRaw = formData.get('industries') as string;
    if (indRaw) industries = JSON.parse(indRaw);
  } catch { /* ignore */ }
  try {
    const screensRaw = formData.get('screenshots') as string;
    if (screensRaw) screenshots = JSON.parse(screensRaw);
  } catch { /* ignore */ }

  // Pricing (Step 3)
  const pricing_model = formData.get('pricing_model') as string;
  const pricing = formData.get('pricing') as string;
  const price_range = formData.get('price_range') as string;
  const free_trial = formData.get('free_trial') as string;
  const has_india_pricing = formData.get('has_india_pricing') === 'true';
  const inr_price = formData.get('inr_price') as string;

  // Company (Step 4)
  const company_name = formData.get('company_name') as string;
  const founded_year = formData.get('founded_year') as string;
  const team_size = formData.get('team_size') as string;
  const city = formData.get('city') as string;
  const founders = formData.get('founders') as string;
  const company_linkedin = formData.get('company_linkedin') as string;

  const { error } = await supabase.from('agents').insert([
    {
      name,
      one_liner: one_liner || null,
      summary,
      website,
      demo_url: demo_url || null,
      video_url: video_url || null,
      logo_url: logo_url || null,
      category: category || null,
      raw_industry: raw_industry || null,
      use_cases,
      tags: tags.length > 0 ? tags : null,
      industries: industries.length > 0 ? industries : null,
      screenshots: screenshots.length > 0 ? screenshots : null,
      pricing_model: pricing_model || null,
      pricing: pricing || null,
      price_range: price_range || null,
      free_trial: free_trial || null,
      has_india_pricing,
      inr_price: inr_price || null,
      company_name: company_name || null,
      founded_year: founded_year ? parseInt(founded_year) : null,
      team_size: team_size || null,
      city: city || null,
      founders: founders || null,
      company_linkedin: company_linkedin || null,
      user_id: user.id,
      approval_status: 'pending',
    }
  ]);

  if (error) {
    console.error('Error inserting listing', error);
    redirect('/dashboard/vendor/listings/new?error=Submission Failed');
  }

  // Trigger Email
  try {
    if (user.email) {
      await sendSubmissionConfirmation(user.email, name);
    }
  } catch (e) {
    console.error('Email trigger failed:', e);
  }

  revalidatePath('/dashboard/vendor/listings');
  redirect('/dashboard/vendor/listings?success=true');
}

export async function updateListing(agentId: number, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ownership Check
  const { data: existing, error: fetchError } = await supabase
    .from('agents')
    .select('user_id')
    .eq('id', agentId)
    .single();

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';
  if (fetchError || !existing || (existing.user_id !== user.id && !isAdmin)) {
    throw new Error('Unauthorized or Listing Not Found');
  }

  // Gather fields (syncing with New Listing structure)
  const name = formData.get('name') as string;
  const one_liner = formData.get('one_liner') as string;
  const summary = formData.get('summary') as string;
  const website = formData.get('website') as string;
  const demo_url = formData.get('demo_url') as string;
  const video_url = formData.get('video_url') as string;
  const logo_url = formData.get('logo_url') as string;
  const category = formData.get('category') as string;
  const raw_industry = formData.get('raw_industry') as string;
  const use_cases = formData.get('use_cases') as string;
  const pricing_model = formData.get('pricing_model') as string;
  const pricing = formData.get('pricing') as string;
  const price_range = formData.get('price_range') as string;
  const free_trial = formData.get('free_trial') as string;
  const has_india_pricing = formData.get('has_india_pricing') === 'true';
  const inr_price = formData.get('inr_price') as string;
  
  // Company Info
  const company_name = formData.get('company_name') as string;
  const founded_year = formData.get('founded_year') as string;
  const team_size = formData.get('team_size') as string;
  const city = formData.get('city') as string;
  const founders = formData.get('founders') as string;
  const company_linkedin = formData.get('company_linkedin') as string;

  // JSON arrays
  let tags: string[] = [];
  let industries: string[] = [];
  let screenshots: string[] = [];
  try {
    const tagsRaw = formData.get('tags') as string;
    if (tagsRaw) tags = JSON.parse(tagsRaw);
    const indRaw = formData.get('industries') as string;
    if (indRaw) industries = JSON.parse(indRaw);
    const screensRaw = formData.get('screenshots') as string;
    if (screensRaw) screenshots = JSON.parse(screensRaw);
  } catch { /* ignore */ }

  const updateData = {
    name,
    one_liner: one_liner || null,
    summary,
    website,
    demo_url: demo_url || null,
    video_url: video_url || null,
    logo_url: logo_url || null,
    category: category || null,
    raw_industry: raw_industry || null,
    use_cases,
    tags: tags.length > 0 ? tags : null,
    industries: industries.length > 0 ? industries : null,
    screenshots: screenshots.length > 0 ? screenshots : null,
    pricing_model: pricing_model || null,
    pricing: pricing || null,
    price_range: price_range || null,
    free_trial: free_trial || null,
    has_india_pricing,
    inr_price: inr_price || null,
    company_name: company_name || null,
    founded_year: founded_year ? parseInt(founded_year) : null,
    team_size: team_size || null,
    city: city || null,
    founders: founders || null,
    company_linkedin: company_linkedin || null,
    // Reset to pending if name or primary category changes (per CTO rule)
    approval_status: 'pending',
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase
    .from('agents')
    .update(updateData)
    .eq('id', agentId);

    if (error) {
      console.error('Error updating listing', error);
      return { success: false, error: 'Update Failed' };
    }

    // Trigger Email for re-submission
    try {
      if (user.email) {
        await sendSubmissionConfirmation(user.email, name);
      }
    } catch (e) {
      console.error('Email trigger failed:', e);
    }
  } catch (err: unknown) {
    console.error('UpdateListing error:', err);
    return { success: false, error: 'Database update failed' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/admin/approval-queue');
  revalidatePath('/dashboard/vendor/listings');
  revalidatePath(`/products/${agentId}`);
  
  return { success: true };
}

export async function deleteTool(agentId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Security Check: Verify Ownership
  const { data: existing, error: fetchError } = await supabase
    .from('agents')
    .select('user_id')
    .eq('id', agentId)
    .single();

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  if (fetchError || !existing || (existing.user_id !== user.id && !isAdmin)) {
    return { success: false, error: 'Unauthorized or Listing Not Found' };
  }

  // Delete Action
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId);

  if (error) {
    console.error('Delete Listing Error:', error);
    return { success: false, error: 'Database deletion failed' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/admin/approval-queue');
  revalidatePath('/dashboard/vendor/listings');
  
  return { success: true };
}
