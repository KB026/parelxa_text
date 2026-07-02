/**
 * PARLEXA AUTH FLOW E2E TEST SCRIPT
 * Tests: Signup, Login, Session, Protected Routes, Logout, Password Reset
 * Runs against the local dev server at http://localhost:3005
 */

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'Test@1234!';
const BASE_URL = 'http://localhost:3005';

const results = [];

function log(test, status, detail) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  results.push({ test, status, detail });
  console.log(`${icon} ${test}: ${status} — ${detail}`);
}

async function testSupabaseConnectivity() {
  console.log('\n--- PRE-FLIGHT: Supabase Connectivity ---');
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envFile.split('\n').forEach(line => {
    const l = line.trim();
    if (!l || l.startsWith('#')) return;
    const eqIdx = l.indexOf('=');
    if (eqIdx > 0) env[l.substring(0, eqIdx).trim()] = l.substring(eqIdx + 1).trim();
  });

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log(`  URL: ${url}`);
  console.log(`  Key: ${key ? key.substring(0, 20) + '...' : 'MISSING'}`);

  if (!url || !key) {
    log('Pre-flight', 'FAIL', 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    return { url: null, key: null, ok: false };
  }

  // Test REST API reachability
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    log('Pre-flight: Supabase REST API', 'PASS', `Status ${res.status}`);
    return { url, key, ok: true };
  } catch (err) {
    log('Pre-flight: Supabase REST API', 'FAIL', err.message);
    return { url, key, ok: false };
  }
}

async function testSignup(supabaseUrl, supabaseKey) {
  console.log('\n--- TEST 1: Signup Flow ---');
  
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        data: { role: 'user', first_name: 'Test', last_name: 'User', full_name: 'Test User' }
      })
    });

    const data = await res.json();

    if (res.status === 200 && data.id) {
      log('Signup: User created in auth.users', 'PASS', `User ID: ${data.id}`);

      // Check if email confirmation is required
      if (data.confirmation_sent_at) {
        log('Signup: Email confirmation required', 'WARN', 'Supabase requires email confirmation. User cannot login until email is verified.');
        return { userId: data.id, needsConfirmation: true };
      }

      // Check if session was returned (auto-confirm mode)
      if (data.access_token) {
        log('Signup: Session created (auto-confirm)', 'PASS', 'Access token received');
        return { userId: data.id, accessToken: data.access_token, needsConfirmation: false };
      }

      return { userId: data.id, needsConfirmation: false };
    } else if (res.status === 422 && data.msg === 'User already registered') {
      log('Signup: User already exists', 'WARN', 'User already registered — proceeding to login');
      return { userId: null, needsConfirmation: false };
    } else {
      log('Signup: User creation', 'FAIL', `Status ${res.status}: ${data.msg || data.error || JSON.stringify(data)}`);
      return { userId: null, needsConfirmation: false };
    }
  } catch (err) {
    log('Signup: Network', 'FAIL', err.message);
    return { userId: null, needsConfirmation: false };
  }
}

async function testProfileAutoCreate(supabaseUrl, supabaseKey, userId) {
  console.log('\n--- TEST 1b: Profile Auto-Creation (DB Trigger) ---');
  
  if (!userId) {
    log('Profile auto-creation', 'SKIP', 'No userId available');
    return;
  }

  // Wait a moment for the trigger to fire
  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const profiles = await res.json();
    
    if (Array.isArray(profiles) && profiles.length > 0) {
      log('Profile auto-creation via DB trigger', 'PASS', `Profile found: ${JSON.stringify(profiles[0]).substring(0, 100)}`);
    } else {
      log('Profile auto-creation via DB trigger', 'FAIL', `No profile found for user ${userId}. Check if handle_new_user() trigger is configured in Supabase.`);
    }
  } catch (err) {
    log('Profile auto-creation', 'FAIL', err.message);
  }
}

async function testLogin(supabaseUrl, supabaseKey) {
  console.log('\n--- TEST 2: Login Flow ---');

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });

    const data = await res.json();

    if (res.status === 200 && data.access_token) {
      log('Login: JWT token obtained', 'PASS', `Token: ${data.access_token.substring(0, 30)}...`);
      log('Login: Refresh token', data.refresh_token ? 'PASS' : 'FAIL', data.refresh_token ? 'Present' : 'Missing');
      log('Login: User identity', 'PASS', `email=${data.user?.email}, role=${data.user?.user_metadata?.role || 'user'}`);
      return { accessToken: data.access_token, refreshToken: data.refresh_token, user: data.user };
    } else {
      log('Login', 'FAIL', `Status ${res.status}: ${data.error_description || data.msg || JSON.stringify(data)}`);
      return null;
    }
  } catch (err) {
    log('Login: Network', 'FAIL', err.message);
    return null;
  }
}

async function testSessionPersistence(supabaseUrl, supabaseKey, accessToken) {
  console.log('\n--- TEST 3: Session Persistence (getUser) ---');

  if (!accessToken) {
    log('Session persistence', 'SKIP', 'No access token available');
    return;
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await res.json();

    if (res.status === 200 && data.id) {
      log('Session persistence: getUser()', 'PASS', `User ${data.email} still authenticated`);
    } else {
      log('Session persistence', 'FAIL', `Status ${res.status}: ${data.msg || JSON.stringify(data)}`);
    }
  } catch (err) {
    log('Session persistence', 'FAIL', err.message);
  }
}

async function testTokenRefresh(supabaseUrl, supabaseKey, refreshToken) {
  console.log('\n--- TEST 4: JWT Refresh Token Rotation ---');

  if (!refreshToken) {
    log('Token refresh', 'SKIP', 'No refresh token available');
    return;
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    const data = await res.json();

    if (res.status === 200 && data.access_token) {
      log('Token refresh: New access token', 'PASS', `New token: ${data.access_token.substring(0, 30)}...`);
      log('Token refresh: New refresh token', data.refresh_token ? 'PASS' : 'FAIL', data.refresh_token ? 'Rotated' : 'Missing');
    } else {
      log('Token refresh', 'FAIL', `Status ${res.status}: ${data.error_description || JSON.stringify(data)}`);
    }
  } catch (err) {
    log('Token refresh', 'FAIL', err.message);
  }
}

async function testProtectedRoutes() {
  console.log('\n--- TEST 5: Protected Route Redirect (Anon) ---');

  try {
    // Attempt to access /vendor/listings without auth — should redirect to /login
    const res = await fetch(`${BASE_URL}/vendor/listings`, { redirect: 'manual' });
    
    if (res.status === 307 || res.status === 302 || res.status === 303) {
      const location = res.headers.get('location');
      if (location && location.includes('/login')) {
        log('Protected route /vendor/listings', 'PASS', `Redirected to ${location}`);
      } else {
        log('Protected route /vendor/listings', 'FAIL', `Redirected to ${location} (expected /login)`);
      }
    } else if (res.status === 200) {
      log('Protected route /vendor/listings', 'FAIL', 'Got 200 OK without auth — middleware not blocking');
    } else {
      log('Protected route /vendor/listings', 'WARN', `Status ${res.status}`);
    }
  } catch (err) {
    log('Protected routes', 'FAIL', err.message);
  }

  try {
    const res2 = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' });
    
    if (res2.status === 307 || res2.status === 302 || res2.status === 303) {
      const location = res2.headers.get('location');
      if (location && location.includes('/login')) {
        log('Protected route /dashboard', 'PASS', `Redirected to ${location}`);
      } else {
        log('Protected route /dashboard', 'FAIL', `Redirected to ${location} (expected /login)`);
      }
    } else if (res2.status === 200) {
      log('Protected route /dashboard', 'FAIL', 'Got 200 OK without auth — middleware not blocking');
    } else {
      log('Protected route /dashboard', 'WARN', `Status ${res2.status}`);
    }
  } catch (err) {
    log('Protected route /dashboard', 'FAIL', err.message);
  }

  try {
    const res3 = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    
    if (res3.status === 307 || res3.status === 302 || res3.status === 303) {
      const location = res3.headers.get('location');
      if (location && location.includes('/login')) {
        log('Protected route /admin', 'PASS', `Redirected to ${location}`);
      } else {
        log('Protected route /admin', 'FAIL', `Redirected to ${location} (expected /login)`);
      }
    } else if (res3.status === 200) {
      log('Protected route /admin', 'FAIL', 'Got 200 OK without auth — middleware not blocking');
    } else {
      log('Protected route /admin', 'WARN', `Status ${res3.status}`);
    }
  } catch (err) {
    log('Protected route /admin', 'FAIL', err.message);
  }
}

async function testLogout(supabaseUrl, supabaseKey, accessToken) {
  console.log('\n--- TEST 6: Logout Flow ---');

  if (!accessToken) {
    log('Logout', 'SKIP', 'No access token available');
    return;
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (res.status === 204 || res.status === 200) {
      log('Logout: Session invalidated', 'PASS', `Status ${res.status}`);

      // Verify the old token is now invalid
      const verifyRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (verifyRes.status === 401) {
        log('Logout: Token invalidated', 'PASS', 'Old token returns 401');
      } else {
        log('Logout: Token invalidation check', 'WARN', `Old token returned ${verifyRes.status} (may still be valid until JWT expiry)`);
      }
    } else {
      const data = await res.text();
      log('Logout', 'FAIL', `Status ${res.status}: ${data}`);
    }
  } catch (err) {
    log('Logout', 'FAIL', err.message);
  }
}

async function testPasswordReset(supabaseUrl, supabaseKey) {
  console.log('\n--- TEST 7: Password Reset Email ---');

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ email: TEST_EMAIL })
    });

    if (res.status === 200) {
      log('Password reset: Email sent', 'PASS', 'Supabase accepted the reset request');
    } else {
      const data = await res.json();
      log('Password reset', 'FAIL', `Status ${res.status}: ${data.msg || JSON.stringify(data)}`);
    }
  } catch (err) {
    log('Password reset', 'FAIL', err.message);
  }
}

async function testLocalPageRoutes() {
  console.log('\n--- TEST 8: Local Page Route Accessibility ---');

  const routes = [
    { path: '/login', expected: 200, name: 'Login page' },
    { path: '/login?mode=register', expected: 200, name: 'Register page' },
    { path: '/forgot-password', expected: 200, name: 'Forgot password page' },
    { path: '/', expected: 200, name: 'Homepage' },
    { path: '/products', expected: 200, name: 'Products page' },
  ];

  for (const route of routes) {
    try {
      const res = await fetch(`${BASE_URL}${route.path}`, { redirect: 'follow' });
      if (res.status === route.expected) {
        log(`Page: ${route.name}`, 'PASS', `Status ${res.status}`);
      } else {
        log(`Page: ${route.name}`, 'FAIL', `Expected ${route.expected}, got ${res.status}`);
      }
    } catch (err) {
      log(`Page: ${route.name}`, 'FAIL', err.message);
    }
  }
}

async function testMiddlewareHeaders() {
  console.log('\n--- TEST 9: Middleware Cookie Handling ---');

  try {
    // Check that the middleware runs and returns set-cookie headers  
    const res = await fetch(`${BASE_URL}/login`, { redirect: 'manual' });
    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    
    if (cookies.length > 0) {
      log('Middleware: Cookie handling', 'PASS', `${cookies.length} cookie(s) set`);
    } else {
      log('Middleware: Cookie handling', 'WARN', 'No set-cookie headers (expected if no session exists)');
    }
  } catch (err) {
    log('Middleware cookies', 'FAIL', err.message);
  }
}

// --- MAIN ---
async function main() {
  console.log('='.repeat(60));
  console.log('PARLEXA AUTH FLOW E2E TEST');
  console.log(`Test Email: ${TEST_EMAIL}`);
  console.log(`Server: ${BASE_URL}`);
  console.log('='.repeat(60));

  // Pre-flight
  const { url, key, ok } = await testSupabaseConnectivity();
  if (!ok) {
    console.log('\n❌ ABORTING: Cannot connect to Supabase. Fix .env.local first.');
    process.exit(1);
  }

  // Test local pages first
  await testLocalPageRoutes();

  // Test protected routes (anon)
  await testProtectedRoutes();

  // Test middleware
  await testMiddlewareHeaders();

  // Test Signup
  const signupResult = await testSignup(url, key);

  // Test Profile auto-creation
  await testProfileAutoCreate(url, key, signupResult.userId);

  if (signupResult.needsConfirmation) {
    console.log('\n⚠️  Email confirmation is required. Cannot test login flow without verified user.');
    console.log('   To continue testing, either:');
    console.log('   1. Disable "Confirm email" in Supabase Auth → Settings → Email Auth');
    console.log('   2. Manually confirm the user via SQL: UPDATE auth.users SET email_confirmed_at = now() WHERE email = \'' + TEST_EMAIL + '\';');
  }

  // Test Login
  const loginResult = await testLogin(url, key);

  if (loginResult) {
    // Test Session persistence
    await testSessionPersistence(url, key, loginResult.accessToken);

    // Test Token refresh
    await testTokenRefresh(url, key, loginResult.refreshToken);

    // Test Logout
    await testLogout(url, key, loginResult.accessToken);
  }

  // Test Password Reset
  await testPasswordReset(url, key);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 4 RESULTS');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : r.status === 'WARN' ? '⚠️' : '⏭️';
    console.log(`  ${icon} ${r.test}: ${r.status}`);
  });

  console.log(`\nTotal: ${passed} PASS, ${failed} FAIL, ${warned} WARN, ${skipped} SKIP`);

  if (failed > 0) {
    console.log('\nFailures:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.test}: ${r.detail}`);
    });
  }

  if (warned > 0) {
    console.log('\nWarnings:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`  - ${r.test}: ${r.detail}`);
    });
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
