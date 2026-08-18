import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE = 'http://localhost:3000';

async function testRoute(name, url, options, expectedStatus) {
  try {
    const res = await fetch(`${BASE}${url}`, options);
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const passed = Array.isArray(expectedStatus) 
      ? expectedStatus.includes(res.status) 
      : res.status === expectedStatus;

    console.log(`${passed ? '✅' : '❌'} [${res.status}] ${name} -> ${url}`);
    if (!passed) {
      console.log('   Expected:', expectedStatus, 'Got:', res.status);
      console.log('   Response:', typeof body === 'string' ? body.slice(0, 200) : JSON.stringify(body).slice(0, 200));
    }
    return { name, url, status: res.status, passed, body };
  } catch (err) {
    console.log(`❌ [ERR] ${name} -> ${url}: ${err.message}`);
    return { name, url, status: 0, passed: false, error: err.message };
  }
}

async function run() {
  console.log('====================================================');
  console.log('🧪 TESTING ALL PUBLIC & ADMIN API ENDPOINTS');
  console.log('====================================================\n');

  // 1. ADMIN ROUTES (Should reject without auth -> 401 or 403)
  console.log('--- 1. Admin Endpoint Security Tests (Unauthenticated) ---');
  await testRoute('Admin Blog Review List (No Auth)', '/api/admin/blog-review/list', { method: 'GET' }, [401, 403]);
  await testRoute('Admin Blog Review Approve (No Auth)', '/api/admin/blog-review/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'dummy' }) }, [401, 403]);
  await testRoute('Admin Blog Review Reject (No Auth)', '/api/admin/blog-review/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'dummy' }) }, [401, 403]);
  await testRoute('Admin Blog Review Update (No Auth)', '/api/admin/blog-review/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'dummy' }) }, [401, 403]);
  await testRoute('Admin Bundle Builder Save (No Auth)', '/api/admin/bundle-builder/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }, [401, 403]);
  await testRoute('Admin Pending Agents (No Auth)', '/api/admin/pending-agents', { method: 'GET' }, [401, 403]);
  await testRoute('Admin Review Tool (No Auth)', '/api/admin/review-tool', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }, [401, 403]);
  await testRoute('Admin Verify External Review (No Auth)', '/api/admin/verify-external-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }, [401, 403]);
  await testRoute('Admin Send To Review (No Auth)', '/api/admin/send-to-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }, [401, 403]);

  // 2. PUBLIC API ENDPOINTS (Valid & Invalid inputs)
  console.log('\n--- 2. Public API Endpoints (Validation Tests) ---');
  
  // Search API
  await testRoute('Search Agents (Valid GET)', '/api/search?q=crm', { method: 'GET' }, 200);
  await testRoute('Search Agents (Empty GET)', '/api/search', { method: 'GET' }, 200);
  
  // AI Search POST
  await testRoute('AI Search (Invalid Body - Empty)', '/api/ai-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }, 400);
  await testRoute('AI Search (Valid Query)', '/api/ai-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'best sales agents for b2b' }) }, [200, 429]);

  // AI Finder Match POST
  await testRoute('AI Finder Match (Missing fields)', '/api/ai-finder-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ industry: 'fintech' }) }, 400);
  await testRoute('AI Finder Match (Valid)', '/api/ai-finder-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ industry: 'fintech', problem: 'fraud detection', size: '10-50' }) }, 200);

  // Bundles API
  await testRoute('Bundles List (GET)', '/api/bundles', { method: 'GET' }, 200);
  await testRoute('Bundles Detail (Valid Slug)', '/api/bundles/ai-b2b-sales-kit', { method: 'GET' }, 200);
  await testRoute('Bundles Detail (Invalid Slug)', '/api/bundles/non-existent-slug-xyz', { method: 'GET' }, 404);

  // Agent Interactions Track
  await testRoute('Track Interaction (Valid POST)', '/api/agent-interactions/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agent_id: 1, action_type: 'view' }) }, 200);
  await testRoute('Track Interaction (Missing agent_id)', '/api/agent-interactions/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action_type: 'view' }) }, 400);

  // Leads
  await testRoute('Leads Capture (Missing body)', '/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }, 400);

  console.log('\n--- Test Suite Complete ---');
}

run();
