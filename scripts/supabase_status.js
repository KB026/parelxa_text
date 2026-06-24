const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkSupabaseStatus() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('placeholder')) {
    console.error('ERROR: DATABASE_URL is missing.');
    return;
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('--- SUPABASE STATUS CHECK ---');
    console.log('✅ PostgreSQL Connection: SUCCESS (using Session Pooler)');
    
    // 1. Check agents table
    const agentsRes = await client.query('SELECT COUNT(*) FROM agents');
    console.log(`📊 Agents in database: ${agentsRes.rows[0].count}`);
    
    // 2. Check is_verified column
    const verifiedRes = await client.query('SELECT name FROM agents WHERE is_verified = true LIMIT 3');
    console.log('🛡️ Verified Agents sync:', verifiedRes.rows.map(r => r.name).join(', '));

    // 3. Check for any users in auth schema (if accessible)
    try {
        const usersRes = await client.query('SELECT COUNT(*) FROM auth.users');
        console.log(`👤 Users in auth.users: ${usersRes.rows[0].count}`);
    } catch (e) {
        console.log('⚠️ Could not check auth.users directly (expected if using a non-superuser).');
    }

    console.log('\n--- VERDICT ---');
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-anon-key')) {
        console.log('❌ AUTH IS BLOCKED: Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
        console.log('❌ SIGNUPS WILL FAIL in the browser until the key is added.');
    } else {
        console.log('✅ AUTH IS READY: ANON_KEY is present.');
    }

  } catch (err) {
    console.error('❌ Connection FAILED:', err.message);
  } finally {
    await client.end();
  }
}

checkSupabaseStatus();
