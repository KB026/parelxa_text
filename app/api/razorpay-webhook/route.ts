import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // 1. Verify webhook signature
    if (webhookSecret) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSig !== signature) {
        console.warn('Razorpay webhook: invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    const supabase = createClient();

    // 2. Handle subscription.charged â†’ extend listing by 1 year
    if (event.event === 'subscription.charged') {
      const subscriptionId = event.payload?.subscription?.entity?.id as string;

      if (subscriptionId) {
        // Find the agent with this subscription_id
        const { data: agent } = await supabase
          .from('agents')
          .select('id, listing_expires_at')
          .eq('subscription_id', subscriptionId)
          .maybeSingle();

        if (agent) {
          // Extend from current expiry or now, whichever is later
          const currentExpiry = agent.listing_expires_at
            ? new Date(agent.listing_expires_at)
            : new Date();

          const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()));
          newExpiry.setFullYear(newExpiry.getFullYear() + 1);

          await supabase
            .from('agents')
            .update({ listing_expires_at: newExpiry.toISOString() })
            .eq('id', agent.id);

          console.log(`Renewed listing ${agent.id} until ${newExpiry.toISOString()}`);
        }
      }
    }

    // 3. Handle subscription.cancelled â†’ leave listing until natural expiry
    if (event.event === 'subscription.cancelled') {
      const subscriptionId = event.payload?.subscription?.entity?.id as string;
      console.log(`Subscription ${subscriptionId} cancelled. Listing will expire at its current date.`);
      // No action needed â€” listing stays visible until listing_expires_at
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Razorpay webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
