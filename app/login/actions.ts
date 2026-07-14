'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/email/actions';

export async function signInWithGoogle() {
  try {
    const supabase = createClient();
    const origin = headers().get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || `${origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      return redirect(`/login?message=Could not authenticate with Google: ${error.message}`);
    }

    if (data.url) {
      return redirect(data.url);
    }
    
    return redirect(`/login?message=OAuth configuration error. Missing redirect URL.`);
  } catch (err) {
    console.error('Unexpected OAuth Error:', err);
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return redirect(`/login?message=An unexpected error occurred during Google Sign In: ${errMsg}`);
  }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?message=Could not authenticate user: ${error.message}`);
  }

  revalidatePath('/', 'layout');
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
  const role = profile?.role;

  if (role === 'vendor') {
    redirect('/dashboard/vendor/listings');
  } else if (role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;
  const role = formData.get('role') as string || 'user';
  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const phone = formData.get('phone') as string;

  if (password !== passwordConfirm) {
    return redirect('/login?mode=register&message=Passwords do not match');
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      first_name,
      last_name,
      phone,
      full_name: `${first_name} ${last_name}`.trim(),
    }
  });

  if (adminError) {
    return redirect(`/login?mode=register&message=Could not create user: ${adminError.message}`);
  }
  
  const user = adminData.user;

  // Fallback: Manually insert into profiles table just in case the Postgres trigger failed
  if (user) {
    await supabaseAdmin.from('profiles').upsert({
      id: user.id,
      email: email,
      first_name: first_name,
      last_name: last_name,
      role: role,
      is_admin: false,
      phone: phone
    }, { onConflict: 'id' });
  }

  // Now log the user in to set their local cookies
  const supabase = createClient();
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Trigger Welcome Email
  try {
    await sendWelcomeEmail(email, `${first_name} ${last_name}`.trim(), role as 'user' | 'vendor');
  } catch (e) {
    console.error('Failed to send welcome email:', e);
  }

  revalidatePath('/', 'layout');
  
  if (role === 'vendor') {
    redirect('/dashboard/vendor/listings');
  } else if (role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export async function registerUserAjax(data: { email: string; password: string; role: string; first_name: string; last_name: string; phone?: string }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase Environment Variables for Admin Client');
      return { error: 'Server configuration error: Missing API keys.' };
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || '',
        full_name: `${data.first_name} ${data.last_name}`.trim(),
      }
    });

    if (adminError) {
      console.error('createUser error:', adminError);
      return { error: adminError.message };
    }

    const user = adminData?.user;

    if (user) {
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        is_admin: false,
        phone: data.phone || ''
      }, { onConflict: 'id' });

      if (profileError) {
        console.error('profiles upsert error:', profileError);
        // We do not return error here to avoid blocking login, but we log it.
      }
    }

    // Set cookies
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      console.error('signInWithPassword error:', signInError);
      return { error: signInError.message };
    }

    try {
      await sendWelcomeEmail(data.email, `${data.first_name} ${data.last_name}`.trim(), data.role as 'user' | 'vendor');
    } catch (e) {
      console.error('Failed to send welcome email:', e);
    }

    revalidatePath('/', 'layout');
    return { success: true, role: data.role };
  } catch (err: any) {
    console.error('Unexpected error in registerUserAjax:', err);
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = createClient();
  const origin = headers().get('origin');

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=recovery`,
  });

  if (error) {
    return redirect(`/forgot-password?message=Could not reset password: ${error.message}`);
  }

  // Trigger Password Reset Notification (Custom Branded)
  try {
    await sendPasswordResetEmail(email, `${origin}/auth/callback?type=recovery`);
  } catch (e) {
    console.error('Failed to send custom reset email:', e);
  }

  return redirect('/forgot-password?message=Check your email for the password reset link.');
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;

  if (password !== passwordConfirm) {
    return redirect('/reset-password?message=Passwords do not match');
  }

  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return redirect(`/reset-password?message=Could not update password: ${error.message}`);
  }

  return redirect('/login?message=Password updated successfully. You can now sign in.');
}
