import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { companyName, companyWebsite, industry, contactEmail } = await request.json();

    if (!companyName || !companyWebsite || !industry) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        role: 'vendor',
        company_name: companyName,
        company_website: companyWebsite,
        industry: industry,
        contact_email: contactEmail || user.email,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Vendor upgrade error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ User upgraded to vendor:', user.id);
    return NextResponse.json({ upgraded: true }, { status: 200 });
  } catch (err) {
    console.error('❌ Upgrade error:', err);
    return NextResponse.json({ error: 'Failed to upgrade' }, { status: 500 });
  }
}
