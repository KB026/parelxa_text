import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Log search query (background-ish, don't block search if logging fails)
    try {
      if (query.trim().length >= 2) {
        await supabase.from('search_logs').insert({
          user_id: user?.id || null,
          email: user?.email || null,
          query: query.trim()
        });
      }
    } catch (logErr) {
      console.error('Failed to log search:', logErr);
    }
    
    // We search across name, category, and one_liner
    // Limit to 5 max items so the dropdown UI stays compact
    const { data, error } = await supabase
      .from('agents')
      .select('id, name, slug, category, logo_url, one_liner, is_verified')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%,one_liner.ilike.%${query}%`)
      .eq('approval_status', 'approved')
      .limit(5);

    if (error) {
      console.error('Search API Error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({ results: data || [] });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
