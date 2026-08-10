import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Authenticate caller using server Supabase client
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // 2. Verify user is admin by checking profiles.role column in DB
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // 3. Initialize service-role Supabase client to bypass client RLS for admin list
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await adminSupabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[blog-review-list] Error fetching draft posts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[blog-review-list] Successfully fetched ${data?.length || 0} pending draft posts for admin review`);
    return NextResponse.json({ drafts: data || [] });
  } catch (error: any) {
    console.error('[blog-review-list] Internal server error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
