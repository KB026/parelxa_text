require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
async function run() {
  const { data, error } = await supabase
    .from('agents')
    .select('id, name, logo_url')
    .like('logo_url', '%dicebear%');

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  console.log(`Exact count: ${data.length}`);
  console.log('Full list:');
  data.forEach(a => {
    console.log(`ID: ${a.id}, Name: ${a.name}`);
  });
}
run();
