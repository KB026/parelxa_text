import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendSubmissionConfirmation, sendListingStatusUpdate } from '@/lib/email/actions';

export interface PlanUpgradeParams {
  agentId: number;
  plan: 'free' | 'growth' | 'pro' | 'growth_annual' | 'pro_annual';
  paymentId?: string | null;
  subscriptionOrOrderId?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  amountPaise?: number | null;
}

export interface PlanUpgradeResult {
  success: boolean;
  alreadyProcessed?: boolean;
  plan: string;
  autoApproved: boolean;
  approvalStatus: string;
  error?: string;
  status?: number;
}

/**
 * Process listing plan tier upgrade with full idempotency.
 * Safe to be called multiple times by either client fast-path or webhook.
 */
export async function processListingPlanUpgrade(params: PlanUpgradeParams): Promise<PlanUpgradeResult> {
  const {
    agentId,
    plan,
    paymentId,
    subscriptionOrOrderId,
    userId,
    userEmail,
    amountPaise,
  } = params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[processListingPlanUpgrade] CRITICAL: Missing Supabase environment variables');
    return {
      success: false,
      error: 'Server configuration error: Missing Supabase credentials',
      status: 500,
      plan,
      autoApproved: false,
      approvalStatus: 'pending',
    };
  }

  const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);

  // 1. Fetch the listing
  const { data: agent, error: fetchErr } = await adminSupabase
    .from('agents')
    .select('id, name, slug, ai_score, user_id, user_email, vendor_plan, vendor_plan_payment_id, listing_expires_at, vendor_plan_expires_at, approval_status')
    .eq('id', agentId)
    .single();

  if (fetchErr || !agent) {
    console.error(`[processListingPlanUpgrade] Agent ${agentId} not found:`, fetchErr);
    return {
      success: false,
      error: 'Listing not found',
      status: 404,
      plan,
      autoApproved: false,
      approvalStatus: 'pending',
    };
  }

  // 2. IDEMPOTENCY CHECK:
  // If paymentId is present, check if this payment was already processed
  if (paymentId && paymentId !== 'mock_pay_') {
    const isAgentAlreadyProcessed = agent.vendor_plan_payment_id === paymentId && agent.vendor_plan === plan;

    const { data: existingTx } = await adminSupabase
      .from('transactions')
      .select('id')
      .eq('gateway_payment_id', paymentId)
      .eq('status', 'completed')
      .maybeSingle();

    if (isAgentAlreadyProcessed || existingTx) {
      console.log(`[processListingPlanUpgrade] Payment ${paymentId} already processed for agent ${agentId} (idempotent skip).`);
      const aiScore = agent.ai_score || 0;
      const isAutoApproved = aiScore >= 7.0;
      return {
        success: true,
        alreadyProcessed: true,
        plan: agent.vendor_plan || plan,
        autoApproved: isAutoApproved,
        approvalStatus: agent.approval_status || (isAutoApproved ? 'approved' : 'pending'),
      };
    }
  }

  // 3. Determine plan expiry & badges (paid plans get 30 days for monthly, 365 days for annual)
  const isAnnual = plan.endsWith('_annual');
  const durationDays = isAnnual ? 365 : 30;
  const expiresAt = plan !== 'free'
    ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const isVerified = plan.startsWith('growth') || plan.startsWith('pro');
  const isFeatured = plan.startsWith('pro');

  // 4. Run auto-approval logic
  const aiScore = agent.ai_score || 0;
  const isAutoApproved = aiScore >= 7.0;
  const approvalStatus = isAutoApproved ? 'approved' : 'pending';
  const reviewedAt = isAutoApproved ? new Date().toISOString() : null;

  // 5. Update the listing in agents table
  const { error: updateErr } = await adminSupabase
    .from('agents')
    .update({
      vendor_plan: plan,
      vendor_plan_expires_at: expiresAt,
      vendor_plan_payment_id: paymentId || null,
      subscription_id: subscriptionOrOrderId || null,
      is_verified: isVerified,
      is_featured: isFeatured,
      approval_status: approvalStatus,
      quality_score: isAutoApproved ? aiScore : null,
      reviewed_at: reviewedAt,
    })
    .eq('id', agentId);

  if (updateErr) {
    console.error(`[processListingPlanUpgrade] Failed to update listing ${agentId}:`, updateErr);
    return {
      success: false,
      error: 'Failed to update listing plan',
      status: 500,
      plan,
      autoApproved: isAutoApproved,
      approvalStatus,
    };
  }

  const toolName = agent.name;
  const vendorEmail = userEmail || agent.user_email;
  const planLabel = plan === 'free' ? 'Indexed (Free)' 
    : plan === 'growth' ? 'Verified Growth (₹499/mo)' 
    : plan === 'pro' ? 'Featured Scale (₹899/mo)'
    : plan === 'growth_annual' ? 'Annual Growth (₹4,999/yr)'
    : 'Annual Scale (₹8,499/yr)';

  // 6. Record transaction if paid plan & paymentId exists
  if (plan !== 'free' && paymentId) {
    try {
      const defaultAmount = plan === 'growth' ? 499 
        : plan === 'pro' ? 899 
        : plan === 'growth_annual' ? 4999 
        : 8499;
      const planAmount = amountPaise ? Math.round(amountPaise / 100) : defaultAmount;
      await adminSupabase.from('transactions').insert([{
        user_id: userId || agent.user_id || null,
        agent_id: agentId,
        amount: planAmount,
        currency: 'INR',
        status: 'completed',
        gateway: 'razorpay',
        gateway_payment_id: paymentId,
        gateway_order_id: subscriptionOrOrderId || null,
        subscription_id: subscriptionOrOrderId || null,
        user_email: vendorEmail || null,
        created_at: new Date().toISOString(),
      }]);
    } catch (txErr) {
      console.error('[processListingPlanUpgrade] Failed to log transaction (non-fatal):', txErr);
    }
  }

  // 7. Fire vendor confirmation & status emails
  try {
    if (vendorEmail) {
      await sendSubmissionConfirmation(vendorEmail, toolName);

      if (isAutoApproved) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://parlexa.in';
        const liveUrl = `${baseUrl.replace(/\/$/, '')}/products/${agent.slug || agent.id}`;
        await sendListingStatusUpdate(vendorEmail, toolName, 'approved', { liveUrl });
      }
    }
  } catch (emailErr) {
    console.error('[processListingPlanUpgrade] Vendor email failed (non-fatal):', emailErr);
  }

  // 8. Fire admin webhook notification
  try {
    const { data: updatedAgent } = await adminSupabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (updatedAgent) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://parlexa.in';
      fetch(`${baseUrl.replace(/\/$/, '')}/api/webhooks/vendor-submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record: {
            ...updatedAgent,
            _plan_label: planLabel,
            _ai_score_display: aiScore > 0 ? `${aiScore.toFixed(1)}/10` : 'N/A',
            _auto_approved: isAutoApproved,
          },
        }),
      }).catch(e => console.error('[processListingPlanUpgrade] Admin notification error:', e));
    }
  } catch (webhookErr) {
    console.error('[processListingPlanUpgrade] Admin webhook failed (non-fatal):', webhookErr);
  }

  return {
    success: true,
    plan,
    autoApproved: isAutoApproved,
    approvalStatus,
  };
}
