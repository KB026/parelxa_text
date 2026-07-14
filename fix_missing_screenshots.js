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
  // Target only the tools that fell back to WordPress mshots
  // We can identify them because we just gave them 'favicon' logos!
  const { data: agents } = await supabase.from('agents').select('id, name, website, screenshots, logo_url').like('logo_url', '%favicon%');
  console.log(`Found ${agents.length} tools that need screenshots fixed.`);

  for (const agent of agents) {
    if (!agent.website) continue;
    let websiteUrl = agent.website.trim();
    if (!websiteUrl.startsWith('http')) websiteUrl = 'https://' + websiteUrl;

    const thumUrl = `https://image.thum.io/get/width/1200/crop/800/${websiteUrl}`;
    try {
      const { buffer, contentType } = await fetchImageBuffer(thumUrl);
      const ext = contentType.includes('jpeg') ? 'jpg' : 'png';
      const fileName = `${agent.id}/screenshot-fixed-${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from('agent-screenshots').upload(fileName, buffer, {
        contentType: contentType,
        upsert: true
      });
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('agent-screenshots').getPublicUrl(fileName);
        const finalUrl = publicUrlData.publicUrl;
        await supabase.from('agents').update({ screenshots: [finalUrl] }).eq('id', agent.id);
        console.log('✅ Updated '+agent.name+' with real Thum.io screenshot');
      }
    } catch(e) {
      console.log('❌ Failed '+agent.name+': '+e.message);
    }
    
    // Small delay to be polite to the API
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log("All done fixing screenshots!");
}
run();
