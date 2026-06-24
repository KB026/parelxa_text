'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitVerificationRequest(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const agentId = formData.get('agent_id') as string;
  const companyName = formData.get('company_name') as string;
  const gstNumber = formData.get('gst_number') as string;
  const companyWebsite = formData.get('company_website') as string;
  const workEmail = formData.get('work_email') as string;
  const productDemoUrl = formData.get('product_demo_url') as string;
  const pressMentions = formData.get('press_mentions') as string;

  // Verify the agent belongs to this user
  const { data: agent } = await supabase
    .from('agents')
    .select('id, user_id')
    .eq('id', agentId)
    .eq('user_id', user.id)
    .single();

  if (!agent) {
    redirect(`/vendor/listings?error=Unauthorized`);
  }

  // Check for existing request
  const { data: existing } = await supabase
    .from('verification_requests')
    .select('id')
    .eq('agent_id', agentId)
    .in('status', ['submitted', 'under_review'])
    .maybeSingle();

  if (existing) {
    redirect(`/vendor/listings?error=Verification already in progress`);
  }

  const { error } = await supabase.from('verification_requests').insert([{
    agent_id: parseInt(agentId),
    user_id: user.id,
    company_name: companyName,
    gst_number: gstNumber,
    company_website: companyWebsite,
    work_email: workEmail,
    product_demo_url: productDemoUrl,
    press_mentions: pressMentions || null,
    status: 'submitted',
  }]);

  if (error) {
    console.error('Error submitting verification request:', error);
    redirect(`/vendor/listings/${agentId}/verify?error=Submission failed`);
  }

  revalidatePath('/vendor/listings');
  redirect('/vendor/listings?success=verification');
}
