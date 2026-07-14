require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const url = require('url');
const https = require('https');
const http = require('http');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function getDomain(websiteUrl) {
  if (!websiteUrl) return null;
  try {
    let parsedUrl = websiteUrl.trim();
    if (!parsedUrl.startsWith('http')) {
      parsedUrl = 'https://' + parsedUrl;
    }
    const hostname = new url.URL(parsedUrl).hostname;
    return hostname.replace(/^www\./, '');
  } catch (e) {
    return null;
  }
}

// Function to check if Clearbit logo exists
function checkImageExists(urlStr) {
  return new Promise((resolve) => {
    https.get(urlStr, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

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
  const { data: agents } = await supabase.from('agents').select('id, name, website, logo_url, screenshots');

  console.log(`Found ${agents.length} agents. Processing...`);

  let updatedCount = 0;

  for (const agent of agents) {
    if (!agent.website) continue;

    let websiteUrl = agent.website.trim();
    if (!websiteUrl.startsWith('http')) {
      websiteUrl = 'https://' + websiteUrl;
    }

    const domain = getDomain(websiteUrl);

    // 1. Fetch Microlink data
    let microlinkData = null;
    try {
      console.log(`[${agent.name}] Fetching Microlink data...`);
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(websiteUrl)}&meta=true&screenshot=true`;
      microlinkData = await new Promise((resolve, reject) => {
        https.get(apiUrl, (res) => {
          let raw = '';
          res.on('data', c => raw += c);
          res.on('end', () => {
            try { resolve(JSON.parse(raw)); } catch(e) { resolve(null); }
          });
        }).on('error', reject);
      });
    } catch (e) {
      console.error(`[${agent.name}] Microlink fetch failed:`, e.message);
    }

    let generatedScreenshotUrl = microlinkData?.data?.screenshot?.url || `https://s0.wp.com/mshots/v1/${encodeURIComponent(websiteUrl)}?w=1200&h=800`;
    let generatedLogoUrl = microlinkData?.data?.logo?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=1565c0&color=fff&size=256`;

    let finalLogoUrl = agent.logo_url;
    let finalScreenshots = agent.screenshots || [];
    let updated = false;

    // 2. Download and Upload Logo
    // We update the logo if it's not already in supabase, or if the user explicitly wants to update them (since "logos are not updating").
    // We will always update the logo if we got a new one from Microlink!
    if (!finalLogoUrl || !finalLogoUrl.includes('supabase.co') || microlinkData?.data?.logo?.url) {
      console.log(`[${agent.name}] Uploading logo to Supabase...`);
      try {
        const { buffer, contentType } = await fetchImageBuffer(generatedLogoUrl);
        const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : (contentType.includes('ico') ? 'ico' : 'png');
        const fileName = `${agent.id}/logo-${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage.from('agent-logos').upload(fileName, buffer, {
          contentType: contentType,
          upsert: true
        });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('agent-logos').getPublicUrl(fileName);
          finalLogoUrl = publicUrlData.publicUrl;
          updated = true;
        } else {
          console.error(`[${agent.name}] Logo upload failed:`, uploadError.message);
        }
      } catch (e) {
        console.error(`[${agent.name}] Logo fetch failed:`, e.message);
      }
    }

    // 3. Download and Upload Screenshot
    if (finalScreenshots.length === 0 || !finalScreenshots[0].includes('supabase.co') || microlinkData?.data?.screenshot?.url) {
      console.log(`[${agent.name}] Uploading screenshot to Supabase...`);
      try {
        const { buffer, contentType } = await fetchImageBuffer(generatedScreenshotUrl);
        const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
        const fileName = `${agent.id}/screenshot-${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage.from('agent-screenshots').upload(fileName, buffer, {
          contentType: contentType,
          upsert: true
        });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('agent-screenshots').getPublicUrl(fileName);
          finalScreenshots = [publicUrlData.publicUrl];
          updated = true;
        } else {
          console.error(`[${agent.name}] Screenshot upload failed:`, uploadError.message);
        }
      } catch (e) {
        console.error(`[${agent.name}] Screenshot fetch failed:`, e.message);
      }
    }

    // 4. Update Database
    if (updated) {
      const { error } = await supabase.from('agents').update({
        screenshots: finalScreenshots,
        logo_url: finalLogoUrl
      }).eq('id', agent.id);

      if (error) {
        console.error(`❌ Failed to update ${agent.name}:`, error.message);
      } else {
        console.log(`✅ Updated ${agent.name} with permanent storage URLs!`);
        updatedCount++;
      }
    }
    
    // Add a 1 second delay to avoid rate limiting from Microlink
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\nDone! Successfully updated ${updatedCount} tools with permanent screenshots and logos!`);
}

run().catch(console.error);
