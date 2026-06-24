/**
 * Apply SQL migration to Supabase using the Management API
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 * 
 * If service key is not available, outputs the SQL for manual execution.
 */

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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '002_fix_profiles_rls_recursion.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

async function runViaRest() {
  // Try using the pg_query approach via RPC
  const key = SERVICE_KEY || ANON_KEY;
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));
  
  console.log(`Attempting to run ${statements.length} SQL statements...`);
  console.log(`Using key type: ${SERVICE_KEY ? 'SERVICE_ROLE' : 'ANON'}`);
  console.log('');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt || stmt.startsWith('--')) continue;

    // Use the REST SQL execution endpoint
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({})
      });

      // This won't work via REST API, we need direct SQL access
      if (i === 0) {
        console.log('NOTE: Direct SQL execution requires service role key or psql access.');
        console.log('');
        break;
      }
    } catch (err) {
      if (i === 0) {
        console.log('Cannot execute SQL via REST API.');
        break;
      }
    }
  }

  // Output instructions for manual execution
  console.log('='.repeat(60));
  console.log('MANUAL MIGRATION REQUIRED');
  console.log('='.repeat(60));
  console.log('');
  console.log('Option 1: Supabase Dashboard SQL Editor');
  console.log(`  URL: https://supabase.com/dashboard/project/cxjwtswbhznjmtxccxug/sql/new`);
  console.log(`  Copy-paste the contents of: supabase/migrations/002_fix_profiles_rls_recursion.sql`);
  console.log('');
  console.log('Option 2: Add SUPABASE_SERVICE_ROLE_KEY to .env.local');
  console.log('  Find it in: Supabase Dashboard > Settings > API > service_role key');
  console.log('  Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=eyJ...');
  console.log('');
  console.log('Option 3: Supabase CLI');
  console.log('  npx supabase db push --linked');
  console.log('');
  console.log('='.repeat(60));
  console.log('');
  console.log('Migration SQL preview (first 500 chars):');
  console.log(sql.substring(0, 500));
  console.log('...');
}

runViaRest();
