/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyUnsubscribeToken } from '@/lib/signed-tokens';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  // âœ… SECURITY FIX: Require valid signed token instead of allowing any userId
  if (!token) {
    return new NextResponse(`
      <html>
        <head>
          <title>Invalid Unsubscribe Link | Parlexa</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #080d1a; color: white; margin: 0; }
            .card { background: #111c2e; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
            h1 { color: #f87171; margin-bottom: 16px; }
            p { color: #7a90b0; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Invalid Link</h1>
            <p>This unsubscribe link is invalid or missing a token.</p>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' }, status: 400 });
  }

  const verified = verifyUnsubscribeToken(token);
  if (!verified) {
    return new NextResponse(`
      <html>
        <head>
          <title>Invalid or Expired Link | Parlexa</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #080d1a; color: white; margin: 0; }
            .card { background: #111c2e; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
            h1 { color: #f87171; margin-bottom: 16px; }
            p { color: #7a90b0; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Link Expired</h1>
            <p>This unsubscribe link has expired (valid for 7 days). Please contact support.</p>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' }, status: 401 });
  }

  const { userId, type } = verified;
  const supabase = createClient() as any;

  // 1. Fetch current prefs
  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_prefs')
    .eq('id', userId)
    .single();

  if (!profile) {
    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #080d1a; color: white;">
          <div style="text-align: center; background: #111c2e; padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">
            <h1 style="color: #f87171;">Profile Not Found</h1>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' }, status: 404 });
  }

  // 2. Update specific pref to false
  const updatedPrefs = {
    ...(profile.notification_prefs || {}),
    [type]: false
  };

  const { error } = await supabase
    .from('profiles')
    .update({
      notification_prefs: updatedPrefs,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update notification prefs:', error);
    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #080d1a; color: white;">
          <div style="text-align: center; background: #111c2e; padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">
            <h1 style="color: #f87171;">Error</h1>
            <p>Failed to update your preferences. Please try again later.</p>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' }, status: 500 });
  }

  // 3. Return success response
  return new NextResponse(`
    <html>
      <head>
        <title>Unsubscribe Successful | Parlexa</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #080d1a; color: white; margin: 0; }
          .card { background: #111c2e; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
          h1 { color: #38bdf8; margin-bottom: 16px; }
          p { color: #7a90b0; line-height: 1.6; }
          .btn { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #1565c0; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Successfully Unsubscribed</h1>
          <p>We've updated your preferences. You will no longer receive <b>${type.replace(/_/g, ' ')}</b> emails from Parlexa.</p>
          <a href="https://parlexa.in" class="btn">Back to Parlexa</a>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}
