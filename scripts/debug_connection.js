const { Client } = require('pg');
const fetch = require('node-fetch'); // If not available, use native fetch (Node 18+)

// 1. Database Connection (Direct - IPv6 ONLY)
const connectionString = 'postgresql://postgres:Parlexa%402026@db.cxjwtswbhznjmtxccxug.supabase.co:5432/postgres';

// 2. REST API URL
const supabaseUrl = 'https://cxjwtswbhznjmtxccxug.supabase.co';

async function testConnection() {
  console.log('--- CONNECTION TEST ---');

  // TEST 1: Direct DB
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    console.log('1. Testing Direct DB (db.cxjwtswbhznjmtxccxug.supabase.co)...');
    await client.connect();
    console.log('   SUCCESS: Connected to PostgreSQL.');
    await client.end();
  } catch (err) {
    console.log('   FAILED: DB Connection failed. Reason:', err.code === 'ENOTFOUND' ? 'Host unreachable (IPv6 issue?)' : err.message);
    console.log('   TIP: Use the Session Pooler Host from Supabase Dashboard for IPv4 compatibility.');
  }

  // TEST 2: REST API Reachability
  console.log(`\n2. Testing REST API (${supabaseUrl})...`);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/agents?select=id`, {
        method: 'GET',
        headers: { 'apiKey': 'placeholder' }
    });
    console.log('   STATUS:', res.status, res.statusText);
    if (res.status === 401) {
        console.log('   SUCCESS: API reachable (401 Unauthorized is expected without ANON_KEY).');
    }
  } catch (err) {
    console.log('   FAILED: API unreachable. Reason:', err.message);
  }
}

testConnection();
