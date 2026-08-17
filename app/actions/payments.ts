/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { razorpay, validatePaymentVerification } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendFeaturedAlert } from '@/lib/email/actions';

/**
 * Creates a Razorpay order for boosting a listing
 */
export async function createPromotionOrder(agentId: number, plan: 'growth' | 'pro') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  // Define pricing logic
  const amounts = {
    growth: 49900,  // ₹499 in paise
    pro: 89900,     // ₹899 in paise
  };
  
  // Verify ownership
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('user_id')
    .eq('id', agentId)
    .single();

  if (agentError || !agent || agent.user_id !== user.id) {
    throw new Error('Unauthorized: You do not own this agent listing.');
  }

  const amountInPaise = amounts[plan];
  
  try {
    if (!razorpay) {
      // Mock Order for Prototype demo
      return {
        success: true,
        orderId: `mock_order_${Date.now()}`,
        amount: amountInPaise,
        keyId: 'rzp_test_mock_key',
        isMock: true
      };
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `promo_${agentId}_${Date.now()}`,
      notes: {
        agentId: agentId.toString(),
        plan,
        userId: user.id
      }
    });
    
    return { 
      success: true, 
      orderId: order.id, 
      amount: amountInPaise,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
    };
  } catch (err: unknown) {
    console.error('Razorpay: Order creation failed:', err);
    return { success: false, error: 'Failed to create payment order' };
  }
}

/**
 * Verifies Razorpay payment and activates the promotion
 */
export async function verifyPromotionPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  agentId: number;
  plan: 'growth' | 'pro';
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  // 1. Verify Signature
  const isValid = validatePaymentVerification(
    data.razorpay_order_id,
    data.razorpay_payment_id,
    data.razorpay_signature
  );
  
  if (!isValid) {
    return { success: false, error: 'Payment verification failed' };
  }
  
  // Verify ownership before processing
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('user_id')
    .eq('id', data.agentId)
    .single();

  if (agentError || !agent || agent.user_id !== user.id) {
    return { success: false, error: 'Unauthorized: Agent ownership mismatch' };
  }
  
  // 2. Calculate Dates
  const startDate = new Date();
  const endDate = new Date();
  if (data.plan === 'growth') endDate.setDate(startDate.getDate() + 30);
  else endDate.setDate(startDate.getDate() + 30);
  
  const amounts = { growth: 499, pro: 899 };
  
  try {
    // 3. Activate Promotion via Atomic RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('activate_promotion', {
      p_agent_id: data.agentId,
      p_plan: data.plan,
      p_payment_id: data.razorpay_payment_id,
      p_amount: amounts[data.plan]
    });
      
    const promotionResult = rpcData as any;
    if (rpcError || !promotionResult?.success) {
      throw new Error(rpcError?.message || promotionResult?.error || 'Failed to activate promotion');
    }
    
    // 4. Send Confirmation Email
    const { data: agentData } = await supabase.from('agents').select('name').eq('id', data.agentId).single();
    if (agentData && user.email) {
      await sendFeaturedAlert(user.email, agentData.name, false);
    }

    revalidatePath('/admin/promotions');
    revalidatePath('/'); // For homepage featured Tools
    revalidatePath('/products');
    
    return { success: true };
  } catch (err: unknown) {
    console.error('Promotion Activation Error:', err);
    const message = err instanceof Error ? err.message : 'Payment verified but failed to activate promotion';
    return { success: false, error: message };
  }
}
