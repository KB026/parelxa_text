import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/actions';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';
  const roleParam = searchParams.get('role'); // Captured from AuthModal state

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      // Password recovery flow
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      
      let role = data.user.user_metadata?.role;
      const email = data.user.email;
      const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'User';

      // Welcome Email trigger & Role override for NEW users
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, welcome_email_sent')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          // If they haven't received a welcome email yet, they are a new user
          if (!profile.welcome_email_sent) { 
            
            // Override the default trigger role if they selected a specific role during signup
            if (roleParam && roleParam !== profile.role && (roleParam === 'user' || roleParam === 'vendor')) {
              await supabase
                .from('profiles')
                .update({ role: roleParam, welcome_email_sent: true })
                .eq('id', data.user.id);
              
              role = roleParam;
            } else {
              await supabase
                .from('profiles')
                .update({ welcome_email_sent: true })
                .eq('id', data.user.id);
            }

            if (email) {
              await sendWelcomeEmail(email, fullName, (role as 'user' | 'vendor') || 'user');
            }
          } else {
             // For existing users, use their established DB role rather than metadata
             role = profile.role || role;
          }
        }
      } catch (e) {
        console.error('Welcome email or role update failed:', e);
      }

      // Determine redirect path
      let redirectPath = next;
      if (next === '/dashboard' || next === '/') {
        if (role === 'vendor') redirectPath = '/dashboard/vendor/listings';
        else if (role === 'admin') redirectPath = '/admin';
        else redirectPath = next; // if next is '/', keep '/'. if '/dashboard', keep '/dashboard'.
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
