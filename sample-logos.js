require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
async function run() {
  const { data: allAgents } = await supabase.from('agents').select('id, name, screenshots, logo_url');
  
  console.log("Total Agents:", allAgents.length);
  console.log("Sample of logo_urls:");
  for(let i=0; i<5; i++) {
    console.log(`- ${allAgents[i].name}: ${allAgents[i].logo_url}`);
  }
}
run();
