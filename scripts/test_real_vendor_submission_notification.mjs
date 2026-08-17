import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://quhctuntkvwvjgxebhst.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

if (!SERVICE_ROLE_KEY || !RESEND_API_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY and RESEND_API_KEY are required in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const NOTIFICATION_RECIPIENTS = [
  'parlexa.ai@gmail.com',
  'kushal.parlexa@gmail.com'
];
const SENDER_EMAIL = 'Parlexa <notifications@parlexa.in>';

async function testRealSubmission() {
  console.log('\n🚀 Starting End-to-End Real Vendor Submission Notification Test...');
  console.log('=================================================================');

  const testTool = {
    name: `Enterprise Support Agent v${Date.now().toString().slice(-4)}`,
    category: 'Developer Tools & Infra',
    company_name: 'Parlexa Enterprise Labs',
    contact_name: 'Kushal Parlexa Test',
    user_email: 'kushal.parlexa@gmail.com',
    website: 'https://parlexa.in',
    summary: 'Real-time automated notification verification test listing submitted to test instant Resend email delivery to parlexa.ai@gmail.com & kushal.parlexa@gmail.com.',
    one_liner: 'Instant real-time alert verification listing.',
    pricing_model: 'Freemium',
    approval_status: 'pending',
  };

  console.log('1. Inserting new vendor listing into "agents" table (approval_status: pending)...');
  const { data: inserted, error: insertError } = await supabase
    .from('agents')
    .insert([testTool])
    .select()
    .single();

  if (insertError) {
    console.error('❌ Failed to insert test agent into DB:', insertError);
    process.exit(1);
  }

  console.log(`✅ Test listing inserted successfully! DB Agent ID: #${inserted.id}`);

  console.log('\n2. Triggering real-time email notification via Resend API (parlexa.in verified domain)...');

  const resend = new Resend(RESEND_API_KEY);
  const toolName = inserted.name;
  const category = inserted.category || 'General AI';
  const vendorName = inserted.contact_name || inserted.company_name || 'Vendor';
  const vendorEmail = inserted.user_email || 'Not provided';
  const submittedAt = new Date(inserted.created_at).toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  const summary = inserted.summary || 'No description provided.';
  const website = inserted.website || '';
  const adminQueueUrl = 'https://parlexa.in/admin/approval-queue';

  const subject = `🚀 New Vendor Tool Submission: ${toolName}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0F17; color: #E2E8F0; margin: 0; padding: 32px 16px; }
          .container { max-width: 600px; margin: 0 auto; background: #131B2E; border: 1px solid #1E293B; border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          .header { border-bottom: 1px solid #1E293B; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 0.05em; }
          .badge { display: inline-block; padding: 6px 14px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #60A5FA; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
          .title { font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 16px 0 24px 0; }
          .details-card { background: #0B0F17; border: 1px solid #1E293B; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; border-bottom: 1px dashed #1E293B; padding-bottom: 8px; }
          .row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
          .label { color: #94A3B8; font-weight: 500; }
          .value { color: #F8FAFC; font-weight: 600; text-align: right; }
          .summary-card { background: #1E293B; border-radius: 8px; padding: 16px; margin-top: 16px; font-size: 14px; color: #CBD5E1; line-height: 1.5; }
          .btn { display: block; width: 100%; text-align: center; background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%); color: #FFFFFF !important; font-weight: 700; text-decoration: none; padding: 14px 24px; border-radius: 10px; box-sizing: border-box; font-size: 15px; margin-top: 24px; }
          .footer { margin-top: 32px; font-size: 12px; color: #64748B; text-align: center; border-top: 1px solid #1E293B; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PARLEXA</div>
            <div class="badge">New Vendor Listing</div>
          </div>
          <div class="title">New Tool Submitted for Review</div>
          <div class="details-card">
            <div class="row">
              <span class="label">🛠️ Tool Name</span>
              <span class="value">${toolName}</span>
            </div>
            <div class="row">
              <span class="label">📂 Category</span>
              <span class="value">${category}</span>
            </div>
            <div class="row">
              <span class="label">👤 Vendor Name</span>
              <span class="value">${vendorName}</span>
            </div>
            <div class="row">
              <span class="label">✉️ Vendor Email</span>
              <span class="value">${vendorEmail}</span>
            </div>
            ${website ? `
            <div class="row">
              <span class="label">🌐 Website</span>
              <span class="value"><a href="${website}" style="color: #60A5FA; text-decoration: none;">${website}</a></span>
            </div>` : ''}
            <div class="row">
              <span class="label">🕒 Submitted At</span>
              <span class="value">${submittedAt}</span>
            </div>
            <div class="summary-card">
              <strong style="color: #94A3B8;">Tool Summary:</strong><br/>
              ${summary}
            </div>
          </div>
          <a href="${adminQueueUrl}" class="btn">Open Admin Approval Queue →</a>
          <div class="footer">
            This automated real-time notification was triggered by a new listing submission on Parlexa.<br/>
            Submitted tool ID: #${inserted.id}
          </div>
        </div>
      </body>
    </html>
  `;

  const { data: resendData, error: resendError } = await resend.emails.send({
    from: SENDER_EMAIL,
    to: NOTIFICATION_RECIPIENTS,
    subject,
    html: htmlBody,
  });

  console.log('\n=================================================================');
  console.log('📩 REAL-TIME EMAIL NOTIFICATION TEST RESULT:');
  if (resendError) {
    console.error('❌ Resend API Error:', resendError);
  } else {
    console.log('🎉 SUCCESS: Real-time notification email delivered!');
    console.log('   Sender:', SENDER_EMAIL);
    console.log('   Recipients:', NOTIFICATION_RECIPIENTS.join(', '));
    console.log('   Resend Message ID:', resendData.id);
  }
  console.log('=================================================================');

  console.log('\n3. Cleaning up temporary test record from database...');
  const { error: deleteError } = await supabase.from('agents').delete().eq('id', inserted.id);
  if (deleteError) {
    console.warn('⚠️ Warning: Failed to clean up test agent ID:', inserted.id, deleteError.message);
  } else {
    console.log(`✅ Cleaned up test listing ID: #${inserted.id}`);
  }
}

testRealSubmission().catch(console.error);
