import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[subscriptions/cancel] CRITICAL: Missing Supabase credentials');
      return NextResponse.json({ error: 'Server misconfiguration: Supabase credentials missing' }, { status: 500 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);

    // Verify ownership and fetch listing subscription details
    const { data: agent, error: agentError } = await adminSupabase
      .from('agents')
      .select('id, subscription_id, subscription_status, user_id, vendor_plan')
      .eq('id', listing_id)
      .single();

    if (agentError || !agent || agent.user_id !== user.id) {
      return NextResponse.json({ error: 'Listing not found or unauthorized' }, { status: 404 });
    }

    const subscriptionId = agent.subscription_id;

    if (agent.subscription_status === 'cancelled') {
      return NextResponse.json({ error: 'Subscription is already cancelled' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Call Razorpay REST API to cancel subscription at current cycle end
    if (keyId && keySecret && subscriptionId && subscriptionId.startsWith('sub_')) {
      try {
        const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rzpRes = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cancel_at_cycle_end: 1, // Cancel auto-renewal at end of current paid billing cycle
          }),
        });

        if (!rzpRes.ok) {
          const errData = await rzpRes.json().catch(() => ({}));
          console.warn('[subscriptions/cancel] Razorpay cancel returned warning:', errData);
        }
      } catch (rzpErr) {
        console.error('[subscriptions/cancel] Razorpay API error:', rzpErr);
      }
    }

    // Update DB status to cancelled
    const { error: updateError } = await adminSupabase
      .from('agents')
      .update({
        subscription_status: 'cancelled',
      })
      .eq('id', listing_id);

    if (updateError) {
      console.error('Failed to update subscription status in DB:', updateError);
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription auto-renewal cancelled successfully. Your plan features remain active until the end of your current billing period.',
    });

  } catch (err) {
    console.error('Error cancelling subscription:', err);
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    return NextResponse.json({ error: 'Failed to cancel subscription: ' + errMsg }, { status: 500 });
  }
}
