/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST: Save tool to wishlist
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const body = await request.json();
    const agentId = body.agentId || body.agent_id;
    const folderId = body.folderId || body.folder_id || null;

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
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
        folder_id: folderId,
      })
      .select();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Tool saved:', agentId);
    return NextResponse.json({ saved: true, data }, { status: 200 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to save tool';
    console.error('❌ Save error:', errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

// GET: Fetch user's saved tools with agent and folder joins
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;

    const { data: savedTools, error } = await supabase
      .from('saved_tools' as any)
      .select(`
        id,
        agent_id,
        folder_id,
        created_at,
        agents (
          id,
          name,
          slug,
          logo_url,
          summary,
          rating,
          category
        ),
        saved_tools_folders (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!savedTools || savedTools.length === 0) {
      console.log('ℹ️ No saved tools found for user:', user.id);
      return NextResponse.json({ savedTools: [] }, { status: 200 });
    }

    console.log('✅ Fetched saved tools:', savedTools.length);
    return NextResponse.json({ savedTools }, { status: 200 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to fetch saved tools';
    console.error('❌ Fetch error:', errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

// DELETE: Remove tool from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const body = await request.json();
    const agentId = body.agentId || body.agent_id;

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('saved_tools' as any)
      .delete()
      .eq('user_id', user.id)
      .eq('agent_id', agentId);

    if (error) {
      console.error('Supabase delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Tool removed:', agentId);
    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to remove tool';
    console.error('❌ Delete error:', errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

// PATCH: Move tool to folder
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const body = await request.json();
    const agentId = body.agentId || body.agent_id;
    const folderId = body.folderId || body.folder_id || null;

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('saved_tools' as any)
      .update({ folder_id: folderId })
      .eq('user_id', user.id)
      .eq('agent_id', agentId);

    if (error) {
      console.error('Supabase update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Tool moved to folder ID:', folderId);
    return NextResponse.json({ moved: true }, { status: 200 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to move tool';
    console.error('❌ Move error:', errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
