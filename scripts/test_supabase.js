const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.log('Env vars missing');
    return;
  }
  
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('agents').select('id').limit(1);
  if (error) {
    console.log('Error querying:', error.message);
  } else {
    console.log('Success - can reach DB. Data count:', data.length);
  }
}

test();
