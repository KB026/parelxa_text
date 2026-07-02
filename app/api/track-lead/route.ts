/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { agentId, userId } = await request.json();

    const supabase = createClient();

    // Insert lead record
    const { error } = await supabase
      .from('lead_clicks' as any)
      .insert({
        agent_id: agentId,
        user_id: userId || null,
        clicked_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Lead tracking error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Lead tracked:', agentId);
    return NextResponse.json({ tracked: true }, { status: 200 });
  } catch (err) {
    console.error('❌ Track error:', err);
    return NextResponse.json({ error: 'Failed to track lead' }, { status: 500 });
  }
}
