import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { review_id, rating, reviews_count } = body;

    if (!review_id) {
      return NextResponse.json(
        { error: 'Missing required field: review_id' },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    const numericCount = Number(reviews_count ?? 0);

    if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
      return NextResponse.json(
        { error: 'rating must be a valid number between 0.0 and 5.0' },
        { status: 400 }
      );
    }

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

    // 2. Verify admin role via profiles.role
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

    // 3. Initialize service-role Supabase client for update
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Update external_reviews row to status = 'verified'
    const { data: updated, error: updateError } = await adminSupabase
      .from('external_reviews')
      .update({
        status: 'verified',
        rating: numericRating,
        reviews_count: numericCount,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', Number(review_id))
      .select();

    if (updateError || !updated || updated.length === 0) {
      console.error('External review verification update error:', updateError);
      return NextResponse.json(
        { error: `Failed to verify external review: ${updateError?.message || 'Row not found'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'External review successfully verified',
      review: updated[0],
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/admin/verify-external-review:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}
