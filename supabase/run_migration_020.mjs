/**
 * Run Admin Panel Step 1 migration against remote Supabase.
 * Usage: node supabase/run_migration_020.mjs
 *
 * Uses the service-role key so every DDL statement executes
 * with superuser-equivalent privileges via the Postgres RPC.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  || 'https://quhctuntkvwvjgxebhst.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || '';

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Read the migration SQL file
const sqlPath = path.join(__dirname, 'migrations', '020_admin_panel_step1.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// Split into individual statements (skip comments and empty lines)
const statements = sql
  .split(/;\s*$/m)
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`\n📋 Migration: 020_admin_panel_step1.sql`);
console.log(`   Found ${statements.length} SQL statements\n`);

let success = 0;
let skipped = 0;
let errors = 0;

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
  
  try {
    const { error } = await supabase.rpc('exec_sql', { query: stmt });
    
    if (error) {
      // Try direct postgres approach via REST
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: stmt })
      });
      
      if (!res.ok) {
        const errText = await res.text();
        if (errText.includes('already exists') || errText.includes('IF NOT EXISTS')) {
          console.log(`  ⏭️  [${i+1}/${statements.length}] SKIPPED (already exists): ${preview}...`);
          skipped++;
        } else {
          console.error(`  ❌ [${i+1}/${statements.length}] ERROR: ${preview}...`);
          console.error(`     ${errText}\n`);
          errors++;
        }
      } else {
        console.log(`  ✅ [${i+1}/${statements.length}] OK: ${preview}...`);
        success++;
      }
    } else {
      console.log(`  ✅ [${i+1}/${statements.length}] OK: ${preview}...`);
      success++;
    }
  } catch (err) {
    console.error(`  ❌ [${i+1}/${statements.length}] EXCEPTION: ${preview}...`);
    console.error(`     ${err.message}\n`);
    errors++;
  }
}

console.log(`\n════════════════════════════════════`);
console.log(`✅ Success: ${success}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`❌ Errors:  ${errors}`);
console.log(`════════════════════════════════════\n`);

if (errors > 0) {
  console.log('⚠️  Some statements failed. You may need to run them manually in the Supabase SQL Editor.');
  console.log('   Copy the SQL from: supabase/migrations/020_admin_panel_step1.sql');
  console.log('   Paste into: Supabase Dashboard > SQL Editor > New Query > Run\n');
}

process.exit(errors > 0 ? 1 : 0);
