import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDynamicBlogPost } from '@/lib/blog-generator';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Authenticate admin user
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

    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    const customTopic = body.topic || body.prompt || body.customTopicOrPrompt;
    const category = body.category;
    const autoPublish = Boolean(body.autoPublish);

    console.log(`[api/blog-review/generate] Admin triggered on-demand generation:`, {
      customTopic: customTopic || 'Dynamic Market Radar',
      category: category || 'Auto',
      autoPublish
    });

    const result = await generateDynamicBlogPost({
      customTopicOrPrompt: customTopic,
      category,
      autoPublish,
      authorName: 'Parlexa Research & Editorial'
    });

    return NextResponse.json({
      success: true,
      message: autoPublish 
        ? 'Blog post dynamically generated and published directly to Parlexa Blog!' 
        : 'Blog post dynamically generated and placed in Draft Review queue.',
      post: result
    });
  } catch (err: any) {
    console.error('[api/blog-review/generate] Generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate blog post' }, { status: 500 });
  }
}

