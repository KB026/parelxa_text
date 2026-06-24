import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/actions';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      // Password recovery flow
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      
      // Role-based redirect after OAuth
      const role = data.user.user_metadata?.role;
      const email = data.user.email;
      const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'User';

      // Welcome Email trigger for NEW users
      // We check if the profile was created in the last 10 seconds
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', data.user.id)
        .single();

      if (profile && email) {
        const createdAt = new Date(profile.created_at || '').getTime();
        const now = new Date().getTime();
        if (now - createdAt < 10000) { // 10 seconds threshold
          try {
            await sendWelcomeEmail(email, fullName, (role as 'user' | 'vendor') || 'user');
          } catch (e) {
            console.error('Welcome email failed:', e);
          }
        }
      }

      if (role === 'vendor') {
        return NextResponse.redirect(`${origin}/vendor/listings`);
      } else if (role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`);
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Auth code exchange error â€” redirect to homepage
  return NextResponse.redirect(`${origin}/?auth_error=true`);
}
