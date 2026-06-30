import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { agent_id, folder_name } = await request.json();
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('saved_tools')
    .insert({ user_id: user.id, agent_id, folder_name: folder_name || 'All Tools' })
    .select();

  if (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ saved: true, data });
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: savedTools } = await supabase
    .from('saved_tools')
    .select('*, agents:agent_id(id, name, summary, rating, slug, logo_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ savedTools });
}

export async function DELETE(request: NextRequest) {
  const { agent_id } = await request.json();
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('saved_tools')
    .delete()
    .eq('user_id', user.id)
    .eq('agent_id', agent_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ deleted: true });
}
