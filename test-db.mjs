import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://quhctuntkvwvjgxebhst.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function test() {
  const { data, error } = await supabase.from('profiles').select('company_name').limit(1);
  console.log('Error:', error?.message || 'None');
  console.log('Data:', data);
}

test();
