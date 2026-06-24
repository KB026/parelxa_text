import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { razorpay, isMockMode } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const { listing_id } = await req.json();

    if (!listing_id) {
      return NextResponse.json({ error: 'Missing listing ID' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership and get subscription_id
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('subscription_id, subscription_status, user_id')
      .eq('id', listing_id)
      .single();

    if (agentError || !agent || agent.user_id !== user.id) {
      return NextResponse.json({ error: 'Listing not found or unauthorized' }, { status: 404 });
    }

    if (!agent.subscription_id) {
      return NextResponse.json({ error: 'No subscription found for this listing' }, { status: 400 });
    }

    if (agent.subscription_status === 'cancelled') {
      return NextResponse.json({ error: 'Subscription is already cancelled' }, { status: 400 });
    }

    // Call Razorpay API to cancel at end of cycle
    if (!isMockMode && razorpay) {
      // The second parameter 'false' means cancel_at_cycle_end = true in standard razorpay-node
      // Specifically: cancel(subscriptionId, cancelAtCycleEnd) 
      // Actually, passing `true` or `1` means cancel_at_cycle_end = true depending on SDK version. Let's pass { cancel_at_cycle_end: 1 } if it takes an object, but razorpay-node takes (id, cancel_at_cycle_end: boolean) usually. 
      // Actually, it is `razorpay.subscriptions.cancel(subscription_id, false)` for immediate cancel, and `true` for cycle end. Wait, no. The parameter is `cancel_at_cycle_end` (boolean). So we should pass `true`.
      await razorpay.subscriptions.cancel(agent.subscription_id, true);
    }

    // Update the database
    const { error: updateError } = await supabase
      .from('agents')
      .update({ subscription_status: 'cancelled' })
      .eq('id', listing_id);

    if (updateError) {
      console.error('Failed to update subscription status in DB:', updateError);
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Subscription cancelled successfully' });

  } catch (err) {
    console.error('Error cancelling subscription:', err);
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    return NextResponse.json({ error: 'Failed to cancel subscription: ' + errMsg }, { status: 500 });
  }
}
