import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { processListingPlanUpgrade } from '@/lib/payments/upgrade-plan';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. Fail Closed: Reject all requests immediately if secret is not configured
    if (!webhookSecret) {
      console.error('[razorpay-webhook] CRITICAL: RAZORPAY_WEBHOOK_SECRET is not configured. Webhook rejected (failing closed).');
      return NextResponse.json(
        { error: 'Webhook signature verification secret is not configured' },
        { status: 500 }
      );
    }

    // 2. Verify webhook signature
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSig !== signature) {
      console.warn('[razorpay-webhook] Invalid signature received');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventName = event.event as string;
    console.log(`[razorpay-webhook] Received valid webhook event: ${eventName}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[razorpay-webhook] CRITICAL: Missing Supabase credentials');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);

    const payment = event.payload?.payment?.entity;
    const order = event.payload?.order?.entity;
    const subscription = event.payload?.subscription?.entity;

    // Extract metadata from notes across all potential entities
    const notes = payment?.notes || order?.notes || subscription?.notes || {};
    const rawAgentId = notes.agent_id;
    const plan = (notes.plan as ('growth' | 'pro' | undefined));
    const userId = (notes.user_id as string) || undefined;
    const userEmail = (notes.user_email as string) || payment?.email || undefined;
    const paymentId = (payment?.id as string) || undefined;
    const orderId = (order?.id || payment?.order_id) as string | undefined;
    const subscriptionId = (subscription?.id || payment?.subscription_id) as string | undefined;
    const amountPaise = (payment?.amount || order?.amount) as number | undefined;

    // 3. Handle initial checkout payments: order.paid or payment.captured
    if (eventName === 'order.paid' || eventName === 'payment.captured') {
      if (rawAgentId && (plan === 'growth' || plan === 'pro')) {
        const agentId = parseInt(String(rawAgentId), 10);
        if (!isNaN(agentId)) {
          const result = await processListingPlanUpgrade({
            agentId,
            plan,
            paymentId: paymentId || null,
            subscriptionOrOrderId: subscriptionId || orderId || null,
            userId: userId || null,
            userEmail: userEmail || null,
            amountPaise: amountPaise || null,
          });

          console.log(`[razorpay-webhook] ${eventName} processed plan upgrade for agent ${agentId}:`, result);
          return NextResponse.json({ received: true, processed: result });
        }
      }
    }

    // 4. Handle subscription.charged (initial charge or recurring renewals)
    if (eventName === 'subscription.charged') {
      const subId = subscriptionId || (event.payload?.subscription?.entity?.id as string);

      // If this contains initial plan notes, upgrade the plan directly
      if (rawAgentId && (plan === 'growth' || plan === 'pro')) {
        const agentId = parseInt(String(rawAgentId), 10);
        if (!isNaN(agentId)) {
          const result = await processListingPlanUpgrade({
            agentId,
            plan,
            paymentId: paymentId || null,
            subscriptionOrOrderId: subId || null,
            userId: userId || null,
            userEmail: userEmail || null,
            amountPaise: amountPaise || null,
          });

          console.log(`[razorpay-webhook] subscription.charged processed plan upgrade for agent ${agentId}:`, result);
          return NextResponse.json({ received: true, processed: result });
        }
      }

      // Otherwise, handle as recurring subscription renewal for existing agent
      if (subId) {
        const { data: agent } = await adminSupabase
          .from('agents')
          .select('id, name, user_id, user_email, vendor_plan, vendor_plan_expires_at, listing_expires_at')
          .eq('subscription_id', subId)
          .maybeSingle();

        if (agent) {
          // Check idempotency for this specific payment ID
          if (paymentId) {
            const { data: existingTx } = await adminSupabase
              .from('transactions')
              .select('id')
              .eq('gateway_payment_id', paymentId)
              .eq('status', 'completed')
              .maybeSingle();

            if (existingTx) {
              console.log(`[razorpay-webhook] Renewal payment ${paymentId} already processed for agent ${agent.id}`);
              return NextResponse.json({ received: true, alreadyProcessed: true });
            }
          }

          // Extend 30 days from current expiry or now
          const currentExpiry = agent.vendor_plan_expires_at
            ? new Date(agent.vendor_plan_expires_at)
            : (agent.listing_expires_at ? new Date(agent.listing_expires_at) : new Date());

          const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()) + 30 * 24 * 60 * 60 * 1000);

          await adminSupabase
            .from('agents')
            .update({
              vendor_plan_expires_at: newExpiry.toISOString(),
              listing_expires_at: newExpiry.toISOString(),
            })
            .eq('id', agent.id);

          if (paymentId) {
            const planAmount = amountPaise
              ? Math.round(amountPaise / 100)
              : (agent.vendor_plan === 'pro' ? 899 : 499);

            await adminSupabase.from('transactions').insert([{
              user_id: agent.user_id || null,
              agent_id: agent.id,
              amount: planAmount,
              currency: 'INR',
              status: 'completed',
              gateway: 'razorpay',
              gateway_payment_id: paymentId,
              gateway_order_id: subId,
              subscription_id: subId,
              user_email: userEmail || agent.user_email || null,
              created_at: new Date().toISOString(),
            }]);
          }

          console.log(`[razorpay-webhook] Renewed listing ${agent.id} until ${newExpiry.toISOString()}`);
          return NextResponse.json({ received: true, renewedUntil: newExpiry.toISOString() });
        }
      }
    }

    // 5. Handle subscription.cancelled → leave listing until natural expiry
    if (eventName === 'subscription.cancelled') {
      const subId = subscriptionId || (event.payload?.subscription?.entity?.id as string);
      console.log(`[razorpay-webhook] Subscription ${subId} cancelled. Listing will expire at its current date.`);
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[razorpay-webhook] Webhook processing exception:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

