require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const fetchMicrolink = (urlToScreenshot) => {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(urlToScreenshot)}&screenshot=true&meta=false`;
    https.get(apiUrl, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, rawData });
        }
      });
    }).on('error', reject);
  });
};

async function diagnose() {
  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, website, screenshots')
    .not('website', 'is', null);

  const failedAgents = agents.filter(agent => !agent.screenshots || agent.screenshots.length === 0);
  console.log(`Found ${failedAgents.length} agents still without screenshots. Diagnosing top 3...`);

  for (let i = 0; i < Math.min(3, failedAgents.length); i++) {
    const agent = failedAgents[i];
    let urlToScreenshot = agent.website.trim();
    if (!urlToScreenshot.startsWith('http')) urlToScreenshot = 'https://' + urlToScreenshot;

    console.log(`\nTesting ${agent.name} (${urlToScreenshot})`);
    try {
      const response = await fetchMicrolink(urlToScreenshot);
      console.log(`Microlink Status Code: ${response.statusCode}`);
      console.log(`Response Data:`, JSON.stringify(response.data || response.rawData, null, 2));
    } catch (e) {
      console.error(`Request Error: ${e.message}`);
    }
  }
}

diagnose();
