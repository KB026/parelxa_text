require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
async function run() {
  const { data: allAgents } = await supabase.from('agents').select('id, name, screenshots, logo_url');
  
  let mshotsCount = 0;
  let emptyLogoCount = 0;
  let emptyScreenshotsCount = 0;

  for (const a of allAgents) {
    if (!a.logo_url) emptyLogoCount++;
    if (!a.screenshots || a.screenshots.length === 0) emptyScreenshotsCount++;
    if (a.screenshots && Array.isArray(a.screenshots)) {
      if (a.screenshots.some(s => s.includes('mshots'))) mshotsCount++;
    }
  }

  console.log('--- DIAGNOSTICS ---');
  console.log('Total Agents:', allAgents.length);
  console.log('Agents with empty logo_url:', emptyLogoCount);
  console.log('Agents with empty screenshots:', emptyScreenshotsCount);
  console.log('Agents STILL with mshots:', mshotsCount);
}
run();
