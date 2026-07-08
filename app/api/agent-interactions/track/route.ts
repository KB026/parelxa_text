import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { agent_id, action_type, referrer_page, utm_source, utm_medium, utm_campaign, device_type } = await req.json();

    const action = action_type || 'cta_click';
    if (action !== 'cta_click' && action !== 'lead_capture') {
      return NextResponse.json({ error: 'Invalid action_type' }, { status: 400 });
    }

    console.log('Received track request:', { agent_id, action, referrer_page, device_type });

    // Validate required fields
    if (!agent_id) {
      console.log('Error: agent_id required');
      return NextResponse.json({ error: 'agent_id required' }, { status: 400 });
    }

    // Get current user (optional — if user not logged in, still track as anonymous)
    const { data: { user } } = await supabase.auth.getUser();

    // Check if agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      console.log('Agent not found or error:', agentError, 'agent_id:', agent_id);
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    console.log('Found agent, proceeding to insert click...');

    // Insert click into agent_interactions
    const { error: insertError } = await supabase
      .from('agent_interactions')
      .insert({
        agent_id,
        user_id: user?.id || null,
        action_type: action,
        referrer_page: referrer_page || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        device_type: device_type || null,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Click tracking error:', insertError);
      return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
