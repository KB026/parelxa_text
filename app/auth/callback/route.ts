import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/actions';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      // Password recovery flow
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      
      const role = data.user.user_metadata?.role;
      const email = data.user.email;
      const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'User';

      // Welcome Email trigger for NEW users
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', data.user.id)
          .single();

        if (profile && email) {
          const createdAt = new Date(profile.created_at || '').getTime();
          const now = new Date().getTime();
          if (now - createdAt < 10000) { // 10 seconds threshold
            await sendWelcomeEmail(email, fullName, (role as 'user' | 'vendor') || 'user');
          }
        }
      } catch (e) {
        console.error('Welcome email failed:', e);
      }

      // Determine redirect path
      let redirectPath = next;
      if (next === '/dashboard' || next === '/') {
        if (role === 'vendor') redirectPath = '/vendor/listings';
        else if (role === 'admin') redirectPath = '/admin';
        else redirectPath = '/dashboard';
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    } else {
      console.error('Exchange error:', error);
    }
  }

  // Auth code exchange error
  return NextResponse.redirect(`${origin}/?auth_error=true`);
}
