import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runE2E() {
  console.log(`🧪 Starting AI Bundles E2E Verification Tests on ${BASE_URL}...\n`);

  let passed = 0;
  let failed = 0;

  // TEST 1: GET /api/bundles
  try {
    console.log('1. Testing GET /api/bundles...');
    const res = await fetch(`${BASE_URL}/api/bundles`);
    const data = await res.json();

    if (res.status === 200 && data.success && Array.isArray(data.bundles) && data.bundles.length === 12) {
      console.log(`   ✅ PASS: Returned ${data.bundles.length} active bundles.`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: Expected 12 bundles, got status ${res.status}, length: ${data.bundles?.length}`);
      failed++;
    }
  } catch (err) {
    console.error('   ❌ FAIL: Network/API error on GET /api/bundles:', err.message);
    failed++;
  }

  // TEST 2: GET /api/bundles/247-customer-support-ai-stack (4 tools)
  try {
    console.log('\n2. Testing GET /api/bundles/247-customer-support-ai-stack (4-tool bundle)...');
    const res = await fetch(`${BASE_URL}/api/bundles/247-customer-support-ai-stack`);
    const data = await res.json();

    if (res.status === 200 && data.success && data.bundle.tool_count === 4) {
      console.log(`   ✅ PASS: 4-tool bundle retrieved successfully. Tools count: ${data.bundle.tools.length}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: Expected 4 tools, got status ${res.status}, count: ${data.bundle?.tool_count}`);
      failed++;
    }
  } catch (err) {
    console.error('   ❌ FAIL: Error on GET 4-tool bundle detail:', err.message);
    failed++;
  }

  // TEST 3: GET /api/bundles/enterprise-llm-ai-infrastructure-stack (5 tools)
  try {
    console.log('\n3. Testing GET /api/bundles/enterprise-llm-ai-infrastructure-stack (5-tool bundle)...');
    const res = await fetch(`${BASE_URL}/api/bundles/enterprise-llm-ai-infrastructure-stack`);
    const data = await res.json();

    if (res.status === 200 && data.success && data.bundle.tool_count === 5) {
      console.log(`   ✅ PASS: 5-tool bundle retrieved successfully. Tools count: ${data.bundle.tools.length}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: Expected 5 tools, got status ${res.status}, count: ${data.bundle?.tool_count}`);
      failed++;
    }
  } catch (err) {
    console.error('   ❌ FAIL: Error on GET 5-tool bundle detail:', err.message);
    failed++;
  }

  // TEST 4: POST /api/bundles/request-demo (Dynamic count test with 3 selected tools)
  try {
    console.log('\n4. Testing POST /api/bundles/request-demo (Dynamic count verification)...');
    const res = await fetch(`${BASE_URL}/api/bundles/request-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bundle_id: 1,
        user_email: 'qa-tester@company.com',
        company: 'QA Enterprise Solutions',
        timeline: 'ASAP',
        selected_tools: [94, 48, 31] // 3 selected tools
      })
    });
    const data = await res.json();

    const expectedMessage = "Demo requested! We're coordinating with 3 vendors...";
    if (res.status === 200 && data.success && data.message === expectedMessage) {
      console.log(`   ✅ PASS: Dynamic message matched: "${data.message}"`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: Expected message "${expectedMessage}", got status ${res.status}, message: "${data?.message}"`);
      failed++;
    }
  } catch (err) {
    console.error('   ❌ FAIL: Error on POST /api/bundles/request-demo:', err.message);
    failed++;
  }

  console.log('\n====================================');
  console.log(`🧪 E2E Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================\n');
}

runE2E();
