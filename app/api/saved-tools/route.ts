import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST: Save tool to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agentId = body.agentId || body.agent_id;

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_tools')
      .select('id')
      .eq('user_id', user.id)
      .eq('agent_id', agentId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Already saved', saved: true }, { status: 200 });
    }

    // Insert new saved tool
    const { data, error } = await supabase
      .from('saved_tools')
      .insert({
        user_id: user.id,
        agent_id: agentId,
      })
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Tool saved:', agentId);
    return NextResponse.json({ saved: true, data }, { status: 200 });
  } catch (err) {
    console.error('❌ Save error:', err);
    return NextResponse.json({ error: 'Failed to save tool' }, { status: 500 });
  }
}

// GET: Fetch user's saved tools
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: savedTools, error } = await supabase
      .from('saved_tools')
      .select(`
        id,
        agent_id,
        created_at,
        agents:agent_id (
          id,
          name,
          slug,
          logo_url,
          summary,
          rating,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ savedTools }, { status: 200 });
  } catch (err) {
    console.error('❌ Fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch saved tools' }, { status: 500 });
  }
}

// DELETE: Remove tool from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const agentId = body.agentId || body.agent_id;

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('saved_tools')
      .delete()
      .eq('user_id', user.id)
      .eq('agent_id', agentId);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Tool removed:', agentId);
    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (err) {
    console.error('❌ Delete error:', err);
    return NextResponse.json({ error: 'Failed to remove tool' }, { status: 500 });
  }
}
