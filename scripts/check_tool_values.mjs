import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data } = await supabase
    .from('agents')
    .select('name, slug, category, rating, pricing_model, pricing, has_india_pricing')
    .eq('approval_status', 'approved')
    .not('slug', 'is', null)
    .limit(10);

  console.log('Sample tools from DB:');
  console.log(JSON.stringify(data, null, 2));
}

check();
