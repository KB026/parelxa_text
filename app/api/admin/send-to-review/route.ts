import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { scoreToolWithAI } from '@/lib/ai-scoring';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const body = await req.json().catch(() => ({}));
    const { agent_id } = body;

    if (!agent_id) {
      return NextResponse.json(
        { error: 'Missing required field: agent_id' },
        { status: 400 }
      );
    }

    const agentIdNum = Number(agent_id);
    if (isNaN(agentIdNum)) {
      return NextResponse.json(
        { error: 'Invalid agent_id format' },
        { status: 400 }
      );
    }

    // 2. Authenticate caller using server Supabase client
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

    // 3. Verify user is admin by checking profiles.role column in DB
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

    // 4. Initialize service-role Supabase client for database updates
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 5. Fetch agent details from agents table
    const { data: agent, error: agentError } = await adminSupabase
      .from('agents')
      .select('id, summary, website, screenshots')
      .eq('id', agentIdNum)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: `Agent not found (ID: ${agentIdNum})` },
        { status: 404 }
      );
    }

    // 6. Score the tool using Gemini API
    let scoreResult;
    try {
      scoreResult = await scoreToolWithAI({
        summary: agent.summary,
        website: agent.website,
        screenshots: agent.screenshots,
      });
    } catch (err: any) {
      console.error('Gemini scoring failed:', err);
      return NextResponse.json(
        { error: `Gemini scoring failed: ${err?.message || String(err)}` },
        { status: 500 }
      );
    }

    // 7. Update ONLY ai_score and ai_scores columns on the agents table
    const { data: updatedRows, error: updateError } = await adminSupabase
      .from('agents')
      .update({
        ai_score: scoreResult.ai_score,
        ai_scores: scoreResult.ai_scores,
      })
      .eq('id', agentIdNum)
      .select();

    if (updateError || !updatedRows || updatedRows.length === 0) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: `Failed to save scores to database: ${updateError?.message || 'No row updated'}` },
        { status: 500 }
      );
    }

    // 8. Return structured JSON response
    return NextResponse.json({
      success: true,
      ai_score: scoreResult.ai_score,
      ai_scores: scoreResult.ai_scores,
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/admin/send-to-review:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}
