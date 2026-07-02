/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST: Create folder
export async function POST(request: NextRequest) {
  try {
    const { folderName } = await request.json();

    if (!folderName || folderName.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('saved_tool_folders' as any)
      .insert({
        user_id: user.id,
        folder_name: folderName.trim(),
      })
      .select();

    if (error) {
      console.error('Folder create error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Folder created:', folderName);
    return NextResponse.json({ folder: data[0] }, { status: 200 });
  } catch (err) {
    console.error('❌ Create error:', err);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

// GET: Fetch user's folders
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: folders, error } = await supabase
      .from('saved_tool_folders' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Folder fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Fetched folders:', folders?.length);
    return NextResponse.json({ folders: folders || [] }, { status: 200 });
  } catch (err) {
    console.error('❌ Fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}
