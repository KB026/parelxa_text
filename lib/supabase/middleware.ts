import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const protectedRoutes = ['/admin', '/vendor', '/dashboard'];
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));
    
    if (isProtectedRoute) {
        console.error('CRITICAL: Supabase Environment Variables are MISSING for Protected Route:', request.nextUrl.pathname);
        return new NextResponse('Configuration Error: Missing environment variables on server.', { status: 500 });
    }
    
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Fetch authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Prevent logged-in users from accessing login page (fixes loop)
  if (user && request.nextUrl.pathname.startsWith('/login')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      const response = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(c => response.cookies.set(c));
      return response;
  }

  // 3. RBAC & Protection
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isVendorPath = request.nextUrl.pathname.startsWith('/vendor');
  const isProtectedRoute = isAdminPath || isVendorPath || request.nextUrl.pathname.startsWith('/dashboard');

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'login');
    url.searchParams.set('next', request.nextUrl.pathname);
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(c => response.cookies.set(c));
    return response;
  }

  if (user && (isAdminPath || isVendorPath)) {
    const metadataRole = user.user_metadata?.role;
    let actualRole = metadataRole;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile?.role) {
        actualRole = profile.role;
      }
    } catch (err) {
      console.error('Middleware: DB role check failed', err);
    }

    const hasAdminAccess = actualRole === 'admin';
    const hasVendorAccess = actualRole === 'vendor' || actualRole === 'admin';

    if (isAdminPath && !hasAdminAccess) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('auth_err', 'admin_required');
      const response = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(c => response.cookies.set(c));
      return response;
    }

    if (isVendorPath && !hasVendorAccess) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('auth_err', 'vendor_required');
      const response = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(c => response.cookies.set(c));
      return response;
    }
  }

  return supabaseResponse;
}
