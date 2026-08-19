/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { razorpay, validatePaymentVerification } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendFeaturedAlert } from '@/lib/email/actions';
import { validateCoupon } from '@/lib/coupons';
import { processListingPlanUpgrade } from '@/lib/payments/upgrade-plan';

/**
 * Creates a Razorpay order for boosting a listing
 */
export async function createPromotionOrder(
  agentId: number, 
  plan: 'growth' | 'pro' | 'growth_annual' | 'pro_annual',
  couponCode?: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  // Define pricing logic
  const amounts = {
    growth: 49900,        // ₹499 in paise
    pro: 89900,           // ₹899 in paise
    growth_annual: 499900, // ₹4,999 in paise
    pro_annual: 849900,    // ₹8,499 in paise
  };

  const basePrices = {
    growth: 499,
    pro: 899,
    growth_annual: 4999,
    pro_annual: 8499,
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

  let amountInPaise = amounts[plan];
  let couponResult = null;

  if (couponCode && couponCode.trim()) {
    const base = basePrices[plan] || 4999;
    couponResult = await validateCoupon(couponCode, base);
    if (!couponResult.valid) {
      throw new Error(couponResult.error || 'Invalid coupon code');
    }
    amountInPaise = couponResult.breakdown?.amountInPaise || amountInPaise;
  }
  
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
        userId: user.id,
        coupon_code: couponResult?.coupon?.code || '',
        discount_amount: couponResult?.breakdown?.discountAmount ? String(couponResult.breakdown.discountAmount) : '0',
        gst_amount: couponResult?.breakdown?.gstAmount ? String(couponResult.breakdown.gstAmount) : '0',
      }
    });
    
    return { 
      success: true, 
      orderId: order.id, 
      amount: amountInPaise,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || ''
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
  plan: 'growth' | 'pro' | 'growth_annual' | 'pro_annual';
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
  const isAnnual = data.plan.endsWith('_annual');
  endDate.setDate(startDate.getDate() + (isAnnual ? 365 : 30));
  
  const amounts = { 
    growth: 499, 
    pro: 899, 
    growth_annual: 4999, 
    pro_annual: 8499 
  };
  
  try {
    // 3. Process Listing Plan Upgrade with full database atomicity & transaction logging
    const upgradeResult = await processListingPlanUpgrade({
      agentId: data.agentId,
      plan: data.plan,
      paymentId: data.razorpay_payment_id,
      subscriptionOrOrderId: data.razorpay_order_id,
      userId: user.id,
      userEmail: user.email,
      amountPaise: amounts[data.plan] * 100,
    });

    if (!upgradeResult.success) {
      throw new Error(upgradeResult.error || 'Failed to update listing plan in database');
    }

    // 4. Send Confirmation Email Alert
    const { data: agentData } = await supabase.from('agents').select('name').eq('id', data.agentId).single();
    if (agentData && user.email) {
      await sendFeaturedAlert(user.email, agentData.name, data.plan.startsWith('pro'));
    }

    revalidatePath('/dashboard/vendor/billing');
    revalidatePath('/dashboard/vendor/listings');
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
