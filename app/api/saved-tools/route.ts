/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agentId = body.agentId || body.agent_id;
    const folderName = body.folderName || body.folder_name;
    
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
      .from('saved_tools' as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('agent_id', agentId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Already saved', saved: true }, { status: 200 });
    }

    // Insert new saved tool
    const { data, error } = await supabase
      .from('saved_tools' as any)
      .insert({
        user_id: user.id,
        agent_id: agentId,
        folder_name: folderName || 'All Tools',
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

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: savedTools, error } = await supabase
      .from('saved_tools' as any)
      .select(`
        id,
        agent_id,
        folder_name,
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

    console.log('✅ Fetched saved tools:', savedTools?.length);
    return NextResponse.json({ savedTools }, { status: 200 });
  } catch (err) {
    console.error('❌ Fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch saved tools' }, { status: 500 });
  }
}

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
      .from('saved_tools' as any)
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

// PATCH: Move tool to folder
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const agentId = body.agentId || body.agent_id;
    const folderName = body.folderName || body.folder_name;

    if (!agentId || !folderName) {
      return NextResponse.json({ error: 'Missing agentId or folderName' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('saved_tools' as any)
      .update({ folder_name: folderName })
      .eq('user_id', user.id)
      .eq('agent_id', agentId);

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Tool moved to folder:', folderName);
    return NextResponse.json({ moved: true }, { status: 200 });
  } catch (err) {
    console.error('❌ Move error:', err);
    return NextResponse.json({ error: 'Failed to move tool' }, { status: 500 });
  }
}
