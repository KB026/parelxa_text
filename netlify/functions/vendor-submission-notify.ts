import type { Config } from "@netlify/functions";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Ensure WebSocket compatibility for Supabase in serverless Node environments (Node < 22)
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class WebSocket {} as any;
}

// Centralized notification recipient configuration
export const NOTIFICATION_RECIPIENTS = [
  "parlexa.ai@gmail.com",
  "kushal.parlexa@gmail.com"
];

export const SENDER_EMAIL = "Parlexa <notifications@parlexa.in>";

export default async (req: Request) => {
  // Allow POST requests for webhooks
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    console.log("[vendor-submission-notify] Received webhook payload:", JSON.stringify(body));

    // Handle Supabase DB webhook payload structure: body.record or body.new or body
    const record = body.record || body.new || body;

    if (!record || (!record.name && !record.id)) {
      console.warn("[vendor-submission-notify] Invalid or missing record in payload:", body);
      return new Response(JSON.stringify({ error: "Invalid webhook payload format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const toolName = record.name || "Untitled Tool Listing";
    const category = record.category || record.raw_industry || "General AI";
    const companyName = record.company_name || "";
    let vendorName = record.contact_name || record.company_name || "";
    let vendorEmail = record.user_email || "";
    const website = record.website || "";
    const summary = record.summary || record.one_liner || "No description provided.";
    const agentId = record.id;

    const rawCreatedAt = record.created_at || new Date().toISOString();
    const formattedTimestamp = new Date(rawCreatedAt).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium"
    });

    // Enrich vendor details from profiles table if missing
    if ((!vendorEmail || !vendorName) && record.user_id) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://quhctuntkvwvjgxebhst.supabase.co";
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
        if (supabaseUrl && serviceRoleKey) {
          const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", record.user_id)
            .single();
          if (profile) {
            if (!vendorEmail && profile.email) vendorEmail = profile.email;
            if (!vendorName && profile.full_name) vendorName = profile.full_name;
          }
        }
      } catch (err) {
        console.error("[vendor-submission-notify] Profile lookup exception:", err);
      }
    }

    if (!vendorEmail) vendorEmail = "Not provided";
    if (!vendorName) vendorName = companyName || "Vendor";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://parlexa.in";
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const adminQueueUrl = `${cleanBaseUrl}/admin/approval-queue`;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[vendor-submission-notify] CRITICAL: RESEND_API_KEY is missing from environment variables");
      return new Response(JSON.stringify({ error: "Server configuration error: RESEND_API_KEY missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const resend = new Resend(resendApiKey);

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
            .btn { display: block; width: 100%; text-align: center; background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%); color: #FFFFFF !important; font-weight: 700; text-decoration: none; padding: 14px 24px; border-radius: 10px; box-sizing: border-box; font-size: 15px; margin-top: 24px; transition: opacity 0.2s; }
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
              ${companyName ? `
              <div class="row">
                <span class="label">🏢 Company</span>
                <span class="value">${companyName}</span>
              </div>` : ''}
              ${website ? `
              <div class="row">
                <span class="label">🌐 Website</span>
                <span class="value"><a href="${website}" style="color: #60A5FA; text-decoration: none;">${website}</a></span>
              </div>` : ''}
              <div class="row">
                <span class="label">🕒 Submitted At</span>
                <span class="value">${formattedTimestamp}</span>
              </div>
              <div class="summary-card">
                <strong style="color: #94A3B8;">Tool Summary:</strong><br/>
                ${summary}
              </div>
            </div>
            <a href="${adminQueueUrl}" class="btn">Open Admin Approval Queue →</a>
            <div class="footer">
              This automated real-time notification was triggered by a new listing submission on Parlexa.<br/>
              Submitted tool ID: #${agentId || 'N/A'}
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

    if (resendError) {
      console.error("[vendor-submission-notify] Resend email error:", resendError);
      return new Response(JSON.stringify({ error: resendError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log(`[vendor-submission-notify] Real-time emails successfully sent for "${toolName}" to:`, NOTIFICATION_RECIPIENTS);
    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification email sent for "${toolName}"`,
        recipients: NOTIFICATION_RECIPIENTS,
        resendId: resendData?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err: any) {
    console.error("[vendor-submission-notify] Exception error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

export const config: Config = {
  path: "/.netlify/functions/vendor-submission-notify"
};
