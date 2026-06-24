'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendReviewAlert, sendReplyAlert } from '@/lib/email/actions';

export async function submitReview(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to submit a review.' };
  }

  const agentId = Number(formData.get('agentId'));
  const ratingEaseUse = Number(formData.get('ease_of_use'));
  const ratingValue = Number(formData.get('value_for_money'));
  const ratingSupport = Number(formData.get('support_quality'));
  const ratingRelevance = Number(formData.get('india_relevance'));
  const content = formData.get('content') as string;
  const recommend = formData.get('recommend') === 'true';
  const useCase = formData.get('use_case') as string;

  if (content.length < 50 || content.length > 800) {
    return { error: 'Review content must be between 50 and 800 characters.' };
  }

  const ratingOverall = (ratingEaseUse + ratingValue + ratingSupport + ratingRelevance) / 4;

  const { error } = await supabase.from('reviews').upsert({
    agent_id: agentId,
    user_id: user.id,
    rating_ease_use: ratingEaseUse,
    rating_value: ratingValue,
    rating_support: ratingSupport,
    rating_relevance: ratingRelevance,
    rating_overall: ratingOverall,
    content,
    recommend,
    use_case: useCase,
    approval_status: 'approved', // Auto-approve for now unless flagged
  }, { 
    onConflict: 'user_id, agent_id' 
  });

  if (error) {
    console.error('Submit review error:', error);
    return { error: 'Failed to submit review. Have you already reviewed this tool?' };
  }

  // Trigger Email to Tool Owner
  try {
    const { data: agent } = await supabase
      .from('agents')
      .select('name, user_id, profiles!agents_user_id_fkey(email, full_name)')
      .eq('id', agentId)
      .single();

    const vendorEmail = (agent?.profiles as unknown as { email: string })?.email;
    if (agent && vendorEmail) {
      await sendReviewAlert(vendorEmail, agent.name, ratingOverall, user.user_metadata?.full_name || 'A user');
    }
  } catch (e) {
    console.error('Email trigger failed:', e);
  }

  revalidatePath(`/products/${agentId}`);
  return { success: true };
}

export async function voteReview(reviewId: string, voteType: 'helpful' | 'unhelpful') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to vote.' };
  }

  const { error } = await supabase.from('review_votes').upsert({
    review_id: reviewId,
    user_id: user.id,
    vote_type: voteType,
  }, {
    onConflict: 'review_id, user_id'
  });

  if (error) {
    console.error('Vote error:', error);
    return { error: 'Failed to record vote.' };
  }

  return { success: true };
}

export async function reportReview(reviewId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to report a review.' };
  }

  const { error } = await supabase.from('reviews').update({
    is_reported: true
  }).eq('id', reviewId);

  if (error) {
    console.error('Report error:', error);
    return { error: 'Failed to report review.' };
  }

  return { success: true };
}

export async function respondToReview(reviewId: string, content: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // 1. Verify that the user owns the agent getting the response
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .select('agent_id, agents(user_id)')
    .eq('id', reviewId)
    .single();

  if (reviewError || !review) {
    return { error: 'Review not found' };
  }

  const agentData = review.agents as unknown as { user_id: string };
  if (agentData?.user_id !== user.id) {
    return { error: 'Only the tool owner can respond to reviews.' };
  }

  // 2. Submit the response
  const { error } = await supabase.from('review_responses').upsert({
    review_id: reviewId,
    vendor_id: user.id,
    content,
  }, {
    onConflict: 'review_id'
  });

  if (error) {
    console.error('Response error:', error);
    return { error: 'Failed to submit response.' };
  }

  // Trigger Email to Reviewer
  try {
    const { data: reviewer } = await supabase
      .from('reviews')
      .select('agent_id, agents(name), profiles:user_id(email)')
      .eq('id', reviewId)
      .single();

    const reviewerEmail = (reviewer?.profiles as unknown as { email: string })?.email;
    if (reviewer && reviewerEmail) {
      const agentName = (reviewer.agents as unknown as { name: string })?.name || 'the AI tool';
      await sendReplyAlert(reviewerEmail, agentName);
    }
  } catch (e) {
    console.error('Email trigger failed:', e);
  }

  return { success: true };
}
