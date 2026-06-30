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
    const toolId = Number(body.agentId || body.agent_id || body.toolId || body.tool_id);
    const folderId = body.folderId || body.folder_id || null;

    if (!toolId || isNaN(toolId)) {
      return NextResponse.json({ error: 'Missing or invalid toolId' }, { status: 400 });
    }

    // Check if already saved
    const { data: existing } = await supabase.from('saved_tools' as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Already saved', saved: true }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('saved_tools' as any)
      .insert({ user_id: user.id, tool_id: toolId, folder_id: folderId })
      .select();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ saved: true, data }, { status: 200 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to save tool';
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
        tool_id,
        folder_id,
        created_at,
        agents!fk_saved_tools_agent_id (
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

    return NextResponse.json({ savedTools: savedTools || [] }, { status: 200 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to fetch saved tools';
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
    const toolId = Number(body.agentId || body.agent_id || body.toolId || body.tool_id);

    if (!toolId || isNaN(toolId)) {
      return NextResponse.json({ error: 'Missing or invalid toolId' }, { status: 400 });
    }

    const { error } = await supabase.from('saved_tools' as any)
      .delete()
      .eq('user_id', user.id)
      .eq('tool_id', toolId);

    if (error) {
      console.error('Supabase delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to remove tool';
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
    const toolId = Number(body.agentId || body.agent_id || body.toolId || body.tool_id);
    const folderId = body.folderId || body.folder_id || null;

    if (!toolId || isNaN(toolId)) {
      return NextResponse.json({ error: 'Missing or invalid toolId' }, { status: 400 });
    }

    const { error } = await supabase.from('saved_tools' as any)
      .update({ folder_id: folderId })
      .eq('user_id', user.id)
      .eq('tool_id', toolId);

    if (error) {
      console.error('Supabase update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ moved: true }, { status: 200 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to move tool';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
