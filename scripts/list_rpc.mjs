import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
  const funcs = ['exec_sql', 'execute_sql', 'run_sql', 'exec', 'calculate_weekly_trending_scores', 'handle_new_user', 'is_admin'];
  for (const f of funcs) {
    const { data, error } = await supabase.rpc(f, {});
    console.log(`RPC '${f}':`, error ? error.message : 'SUCCESS');
  }
}

check();
