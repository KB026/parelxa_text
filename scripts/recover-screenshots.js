require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// 1. Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Utility to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility to fetch JSON from Microlink API
const fetchMicrolink = (urlToScreenshot) => {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(urlToScreenshot)}&screenshot=true&meta=false`;
    https.get(apiUrl, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Microlink API returned status ${res.statusCode}`));
      }
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

// Utility to fetch image buffer from a URL
const fetchImageBuffer = (imageUrl) => {
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
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
};



async function run() {
  console.log('--- Starting Screenshot Recovery ---');

  // 2. Fetch Target Agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, website, screenshots')
    .not('website', 'is', null);

  if (error) {
    console.error('Error fetching agents:', error);
    process.exit(1);
  }

  // Filter for agents with empty, null, or missing screenshots
  const targetAgents = agents.filter(agent => !agent.screenshots || agent.screenshots.length === 0);
  console.log(`Found ${targetAgents.length} agents requiring screenshot recovery.`);

  let successCount = 0;
  let failCount = 0;

  // 3. The Processing Loop
  for (const agent of targetAgents) {
    console.log(`\nProcessing: ${agent.name} (ID: ${agent.id})`);
    
    // Clean up website url just in case
    let urlToScreenshot = agent.website.trim();
    if (!urlToScreenshot.startsWith('http')) {
      urlToScreenshot = 'https://' + urlToScreenshot;
    }

    try {
      // 4. Fetch, Upload, and Update Logic
      console.log(`  Fetching screenshot for ${urlToScreenshot}...`);
      const microlinkData = await fetchMicrolink(urlToScreenshot);
      
      if (!microlinkData.data || !microlinkData.data.screenshot || !microlinkData.data.screenshot.url) {
        throw new Error("Microlink response did not contain a valid screenshot URL.");
      }
      
      const screenshotUrl = microlinkData.data.screenshot.url;
      console.log(`  Downloading image buffer from Microlink...`);
      const imageBuffer = await fetchImageBuffer(screenshotUrl);

      const filePath = `${agent.id}-hero.jpg`;
      console.log(`  Uploading to Supabase Storage (agent-screenshots/${filePath})...`);
      
      const { error: uploadError } = await supabase.storage
        .from('agent-screenshots')
        .upload(filePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('agent-screenshots')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      console.log(`  Updating database with URL: ${publicUrl}`);

      const { error: updateError } = await supabase
        .from('agents')
        .update({ screenshots: [publicUrl] })
        .eq('id', agent.id);

      if (updateError) throw updateError;

      console.log(`  âœ“ Success: Recovered screenshot for ${agent.name}`);
      successCount++;
    } catch (e) {
      console.error(`  âœ— Error processing ${agent.name}: ${e.message}`);
      failCount++;
    }

    // Mandatory 2000ms delay to prevent rate-limiting
    console.log(`  Sleeping for 2000ms...`);
    await sleep(2000);
  }

  // 5. Console Logging Summary
  console.log('\n--- Recovery Summary ---');
  console.log(`Total Target Agents: ${targetAgents.length}`);
  console.log(`Successfully Recovered: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log('------------------------');
}

run();
