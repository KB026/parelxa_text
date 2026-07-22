import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendListingStatusUpdate } from '@/lib/email/actions';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const body = await req.json().catch(() => ({}));
    const { agent_id, admin_score, notes } = body;

    // Validate agent_id
    if (agent_id === undefined || agent_id === null) {
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

    // Validate admin_score
    if (
      admin_score === undefined ||
      admin_score === null ||
      typeof admin_score !== 'number' ||
      isNaN(admin_score) ||
      admin_score < 0 ||
      admin_score > 10
    ) {
      return NextResponse.json(
        { error: 'admin_score must be a valid number between 0 and 10' },
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

    // Verify admin role via profiles.role
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

    // 3. Initialize service-role Supabase client for DB operations
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Fetch agent and ensure ai_score is NOT NULL
    const { data: agent, error: agentError } = await adminSupabase
      .from('agents')
      .select('id, name, slug, user_id, ai_score, ai_scores')
      .eq('id', agentIdNum)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: `Agent not found (ID: ${agentIdNum})` },
        { status: 404 }
      );
    }

    if (agent.ai_score === null || agent.ai_score === undefined) {
      return NextResponse.json(
        {
          error:
            'Tool must be scored first. Please click "Send to Review Queue" before submitting a final decision.',
        },
        { status: 400 }
      );
    }

    // 5. Compute final_score and non-overlapping decision
    const aiScoreNum = Number(agent.ai_score);
    const adminScoreNum = Number(admin_score);
    const finalScore = Math.round(((aiScoreNum + adminScoreNum) / 2) * 10) / 10;

    let decision: 'rejected' | 'pending' | 'approved';
    if (finalScore < 4) {
      decision = 'rejected';
    } else if (finalScore > 7) {
      decision = 'approved';
    } else {
      decision = 'pending'; // 4 <= finalScore <= 7
    }

    // Prepare quality notes
    const qualityNotes =
      notes && notes.trim().length > 0
        ? notes.trim()
        : decision === 'pending'
        ? 'Manual review required (score between 4.0 and 7.0)'
        : null;

    // 6. Update agent row in Supabase using adminSupabase
    const { data: updatedRows, error: updateError } = await adminSupabase
      .from('agents')
      .update({
        quality_score: adminScoreNum,
        quality_notes: qualityNotes,
        approval_status: decision,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', agentIdNum)
      .select();

    if (updateError || !updatedRows || updatedRows.length === 0) {
      console.error('Failed to update agent review decision:', updateError);
      return NextResponse.json(
        { error: `Failed to save review decision: ${updateError?.message || 'No row updated'}` },
        { status: 500 }
      );
    }

    // 7. If decision is 'approved' or 'rejected', send email to vendor
    if ((decision === 'approved' || decision === 'rejected') && agent.user_id) {
      try {
        const { data: vendor } = await adminSupabase
          .from('profiles')
          .select('email')
          .eq('id', agent.user_id)
          .single();

        if (vendor?.email) {
          if (decision === 'approved') {
            const liveUrl = `https://parlexa.in/products/${agent.slug || agent.id}`;
            await sendListingStatusUpdate(vendor.email, agent.name, 'approved', {
              liveUrl,
            });
          } else {
            const aiScoresObj = agent.ai_scores as Record<
              string,
              { score?: number; reason?: string }
            > | null;

            const feedbackLines: string[] = [];

            if (notes && notes.trim()) {
              feedbackLines.push(`Admin Notes: ${notes.trim()}`);
            }

            if (aiScoresObj) {
              const subReasons: string[] = [];
              if (aiScoresObj.clarity?.reason) {
                subReasons.push(`• Clarity: ${aiScoresObj.clarity.reason}`);
              }
              if (aiScoresObj.credibility?.reason) {
                subReasons.push(`• Credibility: ${aiScoresObj.credibility.reason}`);
              }
              if (aiScoresObj.visual?.reason) {
                subReasons.push(`• Visual: ${aiScoresObj.visual.reason}`);
              }
              if (subReasons.length > 0) {
                feedbackLines.push(`AI Feedback:\n${subReasons.join('\n')}`);
              }
            }

            const reasonText =
              feedbackLines.length > 0
                ? feedbackLines.join('\n\n')
                : 'Listing does not meet the required threshold for marketplace approval.';

            await sendListingStatusUpdate(vendor.email, agent.name, 'rejected', {
              reason: reasonText,
            });
          }
        }
      } catch (emailErr) {
        console.error('Non-fatal email sending error:', emailErr);
      }
    }

    // 8. Return result
    return NextResponse.json({
      success: true,
      final_score: finalScore,
      decision,
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/admin/review-tool:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}
