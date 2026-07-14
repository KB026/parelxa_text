require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');
const url = require('url');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function fetchImageBuffer(urlStr) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new url.URL(urlStr);
    const client = urlStr.startsWith('https') ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    client.get(options, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        if (res.headers.location) {
           return fetchImageBuffer(res.headers.location.startsWith('http') ? res.headers.location : `https://${parsedUrl.hostname}${res.headers.location}`).then(resolve).catch(reject);
        }
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${urlStr}: ${res.statusCode}`));
      }
      
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({
        buffer: Buffer.concat(chunks), 
        contentType: res.headers['content-type'] || 'image/png'
      }));
    }).on('error', reject);
  });
}

async function run() {
  const { data: agents } = await supabase.from('agents').select('id, name, logo_url, screenshots');
  console.log(`Checking ${agents.length} agents...`);

  let successCount = 0;

  for (const agent of agents) {
    let updated = false;
    let newLogoUrl = agent.logo_url;
    let newScreenshots = agent.screenshots || [];

    // --- Process Logo ---
    if (newLogoUrl && !newLogoUrl.includes('supabase.co')) {
      console.log(`[${agent.name}] Downloading logo...`);
      try {
        const { buffer, contentType } = await fetchImageBuffer(newLogoUrl);
        const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
        const fileName = `${agent.id}/logo-${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage.from('agent-logos').upload(fileName, buffer, {
          contentType: contentType,
          upsert: true
        });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('agent-logos').getPublicUrl(fileName);
          newLogoUrl = publicUrlData.publicUrl;
          updated = true;
        } else {
          console.error(`[${agent.name}] Logo upload failed:`, uploadError.message);
        }
      } catch (e) {
        console.error(`[${agent.name}] Logo fetch failed:`, e.message);
      }
    }

    // --- Process Screenshot ---
    if (newScreenshots.length > 0 && !newScreenshots[0].includes('supabase.co')) {
      console.log(`[${agent.name}] Downloading screenshot...`);
      try {
        const { buffer, contentType } = await fetchImageBuffer(newScreenshots[0]);
        const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
        const fileName = `${agent.id}/screenshot-${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage.from('agent-screenshots').upload(fileName, buffer, {
          contentType: contentType,
          upsert: true
        });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('agent-screenshots').getPublicUrl(fileName);
          newScreenshots = [publicUrlData.publicUrl];
          updated = true;
        } else {
          console.error(`[${agent.name}] Screenshot upload failed:`, uploadError.message);
        }
      } catch (e) {
        console.error(`[${agent.name}] Screenshot fetch failed:`, e.message);
      }
    }

    // --- Update DB if needed ---
    if (updated) {
      const { error: updateError } = await supabase.from('agents').update({
        logo_url: newLogoUrl,
        screenshots: newScreenshots
      }).eq('id', agent.id);

      if (updateError) {
        console.error(`❌ [${agent.name}] DB Update failed:`, updateError.message);
      } else {
        console.log(`✅ [${agent.name}] Migrated to Supabase Storage!`);
        successCount++;
      }
    }
  }

  console.log(`\nMigration complete. Successfully migrated ${successCount} agents.`);
}

run().catch(console.error);
