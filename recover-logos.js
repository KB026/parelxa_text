require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const url = require('url');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function getDomain(websiteUrl) {
  if (!websiteUrl) return null;
  try {
    let parsedUrl = websiteUrl.trim();
    if (!parsedUrl.startsWith('http')) {
      parsedUrl = 'https://' + parsedUrl;
    }
    const hostname = new url.URL(parsedUrl).hostname;
    // Basic clean up: remove 'www.'
    return hostname.replace(/^www\./, '');
  } catch (e) {
    return null;
  }
}

function fetchImageBuffer(imageUrl) {
  return new Promise((resolve, reject) => {
    https.get(imageUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchImageBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch image: ${res.statusCode}`));
      }
      
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] }));
    }).on('error', reject);
  });
}

async function processAgent(agent) {
  const domain = getDomain(agent.website);
  if (!domain) {
    console.log(`Skipping ${agent.name} - no valid website domain`);
    return false;
  }

  const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  try {
    console.log(`Fetching logo for ${agent.name} (${domain})...`);
    const { buffer, contentType } = await fetchImageBuffer(logoUrl);
    
    // Upload to Supabase
    const fileExt = contentType.split('/')[1] || 'png';
    const filePath = `logos/${agent.id}_${Date.now()}.${fileExt}`;
    
    console.log(`Uploading to Supabase: ${filePath}`);
    const { error: uploadError } = await supabase.storage
      .from('agent-logos')
      .upload(filePath, buffer, {
        contentType,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('agent-logos')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;
    
    console.log(`Updating database with URL: ${publicUrl}`);
    const { error: updateError } = await supabase
      .from('agents')
      .update({ logo_url: publicUrl })
      .eq('id', agent.id);

    if (updateError) throw updateError;
    
    console.log(`Successfully recovered logo for ${agent.name}`);
    return true;
  } catch (e) {
    console.log(`Failed to recover logo for ${agent.name}: ${e.message}`);
    return false;
  }
}

async function run() {
  const testMode = process.argv.includes('--test');
  
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, website, logo_url')
    .is('logo_url', null);
    
  if (error) {
    console.error('Error fetching agents:', error);
    return;
  }
  
  console.log(`Found ${agents.length} agents without a logo.`);
  
  let successCount = 0;
  
  if (testMode) {
    console.log('--- TEST MODE ---');
    const agentToTest = agents[0];
    if (agentToTest) {
      await processAgent(agentToTest);
    }
  } else {
    for (const agent of agents) {
      const success = await processAgent(agent);
      if (success) successCount++;
      // Sleep slightly to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    }
    console.log(`\nFinished. Successfully recovered ${successCount}/${agents.length} logos.`);
  }
}

run();
