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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };
    client.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
         return fetchImageBuffer(res.headers.location.startsWith('http') ? res.headers.location : `https://${parsedUrl.hostname}${res.headers.location}`).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Failed with status '+res.statusCode));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({
        buffer: Buffer.concat(chunks),
        contentType: res.headers['content-type'] || 'image/png'
      }));
    }).on('error', reject);
  });
}

async function run() {
  const cutoff = '2026-07-14T11:00:00+00:00';
  const { data: agents } = await supabase.from('agents').select('id, name, website, logo_url, updated_at').lt('updated_at', cutoff);
  console.log(`Found ${agents.length} tools that still need proper logos.`);

  for (const agent of agents) {
    if (!agent.website) continue;
    let websiteUrl = agent.website.trim();
    if (!websiteUrl.startsWith('http')) websiteUrl = 'https://' + websiteUrl;

    const faviconUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(websiteUrl)}&size=128`;
    try {
      const { buffer, contentType } = await fetchImageBuffer(faviconUrl);
      const ext = contentType.includes('jpeg') ? 'jpg' : 'png';
      const fileName = `${agent.id}/favicon-${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from('agent-logos').upload(fileName, buffer, {
        contentType: contentType,
        upsert: true
      });
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('agent-logos').getPublicUrl(fileName);
        const finalUrl = publicUrlData.publicUrl;
        await supabase.from('agents').update({ logo_url: finalUrl }).eq('id', agent.id);
        console.log('✅ Updated '+agent.name+' with Google Favicon');
      }
    } catch(e) {
      console.log('❌ Failed '+agent.name+': '+e.message);
    }
  }
  
  console.log("All done!");
}
run();
