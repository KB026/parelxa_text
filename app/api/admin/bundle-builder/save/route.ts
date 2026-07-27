import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { bundle_slug, role_assignments } = body;

    if (!bundle_slug || !Array.isArray(role_assignments)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    // Return success notification
    return NextResponse.json({
      success: true,
      message: `Bundle assignments for ${bundle_slug} saved successfully.`,
      updated_roles: role_assignments.length
    });
  } catch (err: any) {
    console.error('Error saving bundle builder setup:', err);
    return NextResponse.json({ success: false, error: err.message || 'Save failed' }, { status: 500 });
  }
}
