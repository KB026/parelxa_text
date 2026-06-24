const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient(url, key);

  console.log('--- Checking external_reviews Table ---');
  const { data, error, count } = await supabase
    .from('external_reviews')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching external_reviews:', error);
  } else {
    console.log(`Found ${count} reviews in cache.`);
    if (data.length > 0) {
      console.log('Sample review:', data[0]);
    }
  }

  console.log('\n--- Checking agents Table ---');
  const { data: agents, error: agentsError, count: agentsCount } = await supabase
    .from('agents')
    .select('id, name, slug')
    .limit(5);

  if (agentsError) {
    console.error('Error fetching agents:', agentsError);
  } else {
    console.log(`Found ${agentsCount} agents.`);
    agents.forEach(a => console.log(` - ${a.name} (${a.slug}) [ID: ${a.id}]`));
  }
}

debugDatabase();
