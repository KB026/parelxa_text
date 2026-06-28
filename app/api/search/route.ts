import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ agents: [] });
  }

  const supabase = createClient();
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, summary, category, rating, logo_url')
    .eq('approval_status', 'approved')
    .or(`name.ilike.%${query}%,summary.ilike.%${query}%,category.ilike.%${query}%`)
    .order('rating', { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ agents: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ agents: agents || [] });
}
