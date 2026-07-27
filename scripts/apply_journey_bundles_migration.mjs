import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://quhctuntkvwvjgxebhst.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log('📋 Migration: 029_journey_bundles.sql');
  const sql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '029_journey_bundles.sql'), 'utf8');

  if (process.env.DATABASE_URL) {
    try {
      console.log('Connecting to PostgreSQL via DATABASE_URL...');
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      await client.query(sql);
      await client.query("NOTIFY pgrst, 'reload schema';");
      await client.end();
      console.log('✅ Migration executed successfully via DATABASE_URL.');
    } catch (err) {
      console.warn('DATABASE_URL execution failed:', err.message);
    }
  }

  // Confirm tables accessibility via Supabase client
  const { error: bErr } = await supabase.from('bundles').select('id').limit(1);
  const { error: rErr } = await supabase.from('bundle_roles').select('id').limit(1);
  const { error: tErr } = await supabase.from('bundle_tools').select('id').limit(1);

  if (bErr) console.log('ℹ️ Bundles table check:', bErr.message);
  else console.log('✅ Table public.bundles confirmed present.');

  if (rErr) console.log('ℹ️ Bundle_roles table check:', rErr.message);
  else console.log('✅ Table public.bundle_roles confirmed present.');

  if (tErr) console.log('ℹ️ Bundle_tools table check:', tErr.message);
  else console.log('✅ Table public.bundle_tools confirmed present.');

  console.log('Migration verification step complete.');
}

main();
