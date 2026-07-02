import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const listingId = parseInt(params.id);
  if (isNaN(listingId)) {
    return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
  }

  // Only allow deletion if it belongs to this user OR user is admin
  const { data: listing } = await supabase
    .from('agents')
    .select('approval_status, user_id')
    .eq('id', listingId)
    .maybeSingle();

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';
  if (listing.user_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', listingId)
    .match(isAdmin ? {} : { user_id: user.id });

  if (error) {
    console.error('Listing delete error:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
