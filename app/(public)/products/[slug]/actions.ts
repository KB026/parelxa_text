/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendClaimVerification, sendClaimApproved, sendClaimDisputed } from '@/lib/email/actions';
import crypto from 'crypto';

export async function submitClaim(
  agentId: number,
  email: string,
  role: string,
  note: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to submit a claim.' };
  }

  // 1. Check for existing approved owner
  const { data: agent } = await supabase
    .from('agents')
    .select('name, is_maker_claimed, user_id')
    .eq('id', agentId)
    .single();

  if (agent?.is_maker_claimed) {
    return { success: false, error: 'This listing has already been claimed by its maker.' };
  }

  // 2. Check for other pending claims (Dispute Detection)
  const { data: existingClaims } = await supabase
    .from('listing_claims')
    .select('id, user_id, status')
    .eq('agent_id', agentId)
    .not('status', 'in', '("rejected")');

  const token = crypto.randomBytes(32).toString('hex');
  const isDisputed = (existingClaims && existingClaims.length > 0);

  // 3. Create the claim request
  const { error } = await supabase
    .from('listing_claims')
    .insert({
      agent_id: agentId,
      user_id: user.id,
      work_email: email,
      role: role,
      note: note,
      status: isDisputed ? 'disputed' : 'pending_email',
      verification_token: token
    });

  if (error) {
    console.error('Error submitting claim:', error);
    return { success: false, error: error.message };
  }

  // 4. Update existing claims to disputed and notify if needed
  if (isDisputed) {
    await supabase
      .from('listing_claims')
      .update({ status: 'disputed' })
      .eq('agent_id', agentId)
      .neq('user_id', user.id);
    
    // Notify all existing claimants of the new dispute
    for (const claim of existingClaims || []) {
       if (claim.user_id !== user.id) {
         const { data: prof } = await supabase.from('profiles').select('email').eq('id', claim.user_id || '').single();
         if (prof?.email) await sendClaimDisputed(prof.email, agent?.name || 'Your Tool');
       }
    }
    // Also notify the current submitter
    await sendClaimDisputed(email, agent?.name || 'Your Tool');
  }

  // 5. Send Verification Email
  await sendClaimVerification(email, agent?.name || 'Your Tool', token);
  
  return { success: true };
}

export async function verifyClaim(token: string) {
  const supabase = createClient();

  // 1. Find claim by token
  const { data: claim, error: fetchError } = await supabase
    .from('listing_claims')
    .select('*, agents(website, name, id, is_maker_claimed)')
    .eq('verification_token', token)
    .single();

  if (fetchError || !claim) {
    return { success: false, error: 'Invalid or expired verification token' };
  }

  // If already disputed, don't auto-approve
  if (claim.status === 'disputed') {
      return { 
        success: true, 
        message: 'Email verified! However, this listing has multiple claims. Our admin team will review and resolve this manually.',
        isPendingAdmin: true
      };
  }

  if (claim.status !== 'pending_email') {
    return { success: true, message: 'Identity already verified' };
  }

  // 2. Domain matching logic (Auto-approval)
  const emailDomain = claim.work_email.split('@')[1]?.toLowerCase();
  const agentData = claim.agents as { website: string; name: string; id: number; slug?: string } | null;
  const agentWebsite = agentData?.website || '';
  const siteDomain = agentWebsite.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0].split(':')[0].toLowerCase();

  const isDomainMatch = emailDomain === siteDomain && siteDomain.length > 3;
  
  // Transition Plan:
  // If domain match -> 'approved'
  // If no match -> 'verified_pending_admin'
  const newStatus = isDomainMatch ? 'approved' : 'verified_pending_admin';

  // 3. Update claim status
  const { error: updateError } = await supabase
    .from('listing_claims')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', claim.id);

  if (updateError) return { success: false, error: updateError.message };

  // 4. If auto-approved, transfer ownership and notify
  if (isDomainMatch) {
    await supabase
      .from('agents')
      .update({ 
          user_id: claim.user_id, 
          is_maker_claimed: true,
          updated_at: new Date().toISOString() 
      })
      .eq('id', claim.agent_id || 0);
    
    await sendClaimApproved(claim.work_email, agentData?.name || 'Your Tool');
  }

  if (agentData) {
    revalidatePath('/admin/claims');
    revalidatePath(`/products/${agentData.slug || agentData.id}`);
  }

  return { 
    success: true, 
    isAutoApproved: isDomainMatch,
    agentName: agentData?.name
  };
}
