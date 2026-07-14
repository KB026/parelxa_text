import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { agent_id, vendor_id, tool_name, feedback } = await req.json();

    if (!agent_id || !vendor_id || !tool_name || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update agent status
    const { error: updateError } = await supabase
      .from('agents')
      .update({ approval_status: 'rejected' })
      .eq('id', agent_id);

    if (updateError) throw updateError;

    // Clear Next.js cache
    revalidatePath('/', 'layout');

    // Get vendor email
    const { data: vendor, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', vendor_id)
      .single();

    if (profileError || !vendor?.email) {
      console.error('Could not find vendor email:', profileError);
      return NextResponse.json({ error: 'Vendor email not found' }, { status: 404 });
    }

    const vendor_email = vendor.email;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #09090B; color: #fff; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 28px; font-weight: bold; color: #38bdf8; margin-bottom: 30px; }
    .warning { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #EF4444; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #38bdf8; color: #09090B; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 15px 0; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">PARLEXA</div>
    <div class="warning">
      <h2 style="margin: 0; color: #FCA5A5;">Tool Needs Review</h2>
    </div>
    <p>Thank you for submitting <strong>${tool_name}</strong> to Parlexa. After review, we found some areas that need improvement:</p>
    <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border-left: 2px solid #FCA5A5; margin: 15px 0;">
      <strong>Feedback:</strong>
      <p>${feedback}</p>
    </div>
    <p>Please update your listing and resubmit. Our team will review again within 24 hours.</p>
    <center>
      <a href="https://parlexa.in/dashboard/vendor/listings" class="button">Edit Your Listing</a>
    </center>
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
      Questions? Contact us at <a href="mailto:support@parlexa.in" style="color: #38bdf8; text-decoration: none;">support@parlexa.in</a>
    </p>
  </div>
</body>
</html>
    `;

    const response = await resend.emails.send({
      from: 'noreply@parlexa.in',
      to: vendor_email,
      subject: `${tool_name} needs review - Parlexa`,
      html,
    });

    return NextResponse.json({ success: true, emailId: response.data?.id });
  } catch (error) {
    console.error('Rejection email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
