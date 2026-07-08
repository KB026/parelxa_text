require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    console.log('Creating buckets...');
    const b1 = await supabase.storage.createBucket('agent-screenshots', { public: true });
    console.log('agent-screenshots:', b1.error ? b1.error.message : 'Created');
    const b2 = await supabase.storage.createBucket('agent-logos', { public: true });
    console.log('agent-logos:', b2.error ? b2.error.message : 'Created');

    console.log('Fetching agents...');
    const { data, error } = await supabase.from('agents').select('id, name, screenshots');
    if (error) throw error;
    
    const brokenAgents = data.filter(a => a.screenshots && a.screenshots.some(s => s.includes('mshots')));
    console.log('Found ' + brokenAgents.length + ' agents to clean up.');
    
    for (const agent of brokenAgents) {
      const { error: updateError } = await supabase.from('agents').update({ screenshots: [] }).eq('id', agent.id);
      if (updateError) {
        console.error('Failed to update agent', agent.name, updateError);
      } else {
        console.log('Cleaned agent:', agent.name);
      }
    }
    console.log('Done!');
  } catch(e) {
    console.error('Crash:', e);
  }
}
run();
