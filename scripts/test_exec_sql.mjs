import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testExecSql() {
  console.log('Testing exec_sql with { query: "SELECT 1;" } ...');
  const res1 = await supabase.rpc('exec_sql', { query: 'SELECT 1;' });
  console.log('exec_sql query:', res1);

  console.log('Testing exec_sql with { sql: "SELECT 1;" } ...');
  const res2 = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
  console.log('exec_sql sql:', res2);

  console.log('Testing exec_sql with { sql_query: "SELECT 1;" } ...');
  const res3 = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1;' });
  console.log('exec_sql sql_query:', res3);
}

testExecSql();
