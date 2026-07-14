import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { agent_id, vendor_id, tool_name, tool_slug } = await req.json();

    if (!agent_id || !vendor_id || !tool_name) {
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
      .update({ approval_status: 'approved' })
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
    .success { background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22C55E; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #38bdf8); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">PARLEXA</div>
    <div class="success">
      <h2 style="margin: 0; color: #22C55E;">✓ Your Tool Has Been Approved!</h2>
    </div>
    <p>Great news! Your tool <strong>${tool_name}</strong> has been approved and is now live on Parlexa.</p>
    <p>Your tool is discoverable by thousands of users looking for AI solutions.</p>
    <center>
      <a href="https://parlexa.in/products/${tool_slug}" class="button">View Your Listing</a>
    </center>
    <p style="color: rgba(255,255,255,0.6); font-size: 13px;">💡 Next: Monitor clicks on your vendor dashboard, respond to messages, and track leads in real-time.</p>
    <div style="text-align: center; color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
      <p>&copy; 2026 Parlexa. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    const response = await resend.emails.send({
      from: 'noreply@parlexa.in',
      to: vendor_email,
      subject: `✓ ${tool_name} has been approved on Parlexa!`,
      html,
    });

    return NextResponse.json({ success: true, emailId: response.data?.id });
  } catch (error) {
    console.error('Approval email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
