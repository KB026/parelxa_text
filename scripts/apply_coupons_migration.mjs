import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log('📋 Applying Migration: 034_create_coupons_table.sql');
  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '034_create_coupons_table.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  if (process.env.DATABASE_URL) {
    try {
      console.log('Connecting to PostgreSQL via DATABASE_URL...');
      const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      await client.connect();
      await client.query(sql);
      await client.query("NOTIFY pgrst, 'reload schema';");
      await client.end();
      console.log('✅ Migration executed successfully via DATABASE_URL.');
    } catch (err) {
      console.warn('DATABASE_URL execution note:', err.message);
    }
  }

  // Check and seed via Supabase Client as well
  const { data, error } = await supabase.from('coupons').select('*');
  if (error) {
    console.error('❌ Table check failed:', error);
  } else {
    console.log(`✅ Table public.coupons is live! Found ${data.length} coupons:`);
    console.table(data);
  }
}

main().catch(console.error);
