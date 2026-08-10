import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id, title, slug, excerpt, meta_title, meta_description, body } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const updatePayload: Record<string, any> = {};
    if (title !== undefined) updatePayload.title = title;
    if (slug !== undefined) updatePayload.slug = slug;
    if (excerpt !== undefined) updatePayload.excerpt = excerpt;
    if (meta_title !== undefined) updatePayload.meta_title = meta_title;
    if (meta_description !== undefined) updatePayload.meta_description = meta_description;
    if (body !== undefined) {
      updatePayload.body = body;
      const wordCount = body.split(/\s+/).length;
      updatePayload.read_time_minutes = Math.ceil(wordCount / 200);
    }

    const { data: updated, error: updateErr } = await adminSupabase
      .from('blog_posts')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
