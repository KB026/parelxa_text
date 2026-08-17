import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://quhctuntkvwvjgxebhst.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aGN0dW50a3Z3dmpneGViaHN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcyMTU1NywiZXhwIjoyMDk4Mjk3NTU3fQ.LjF69eODrwVa47ZqpWHLtiapUacBrZdxfUa63JpApt8';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  console.log('Running migration 031_vendor_submission_webhook.sql against remote Supabase...');
  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '031_vendor_submission_webhook.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split SQL into individual statements
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  for (const stmt of statements) {
    console.log(`Executing statement:\n${stmt.substring(0, 100)}...`);
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
      console.warn(`REST exec_sql result (${res.status}): ${errText}`);
    } else {
      console.log('✅ Executed successfully!');
    }
  }
}

main().catch(console.error);
