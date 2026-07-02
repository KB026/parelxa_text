const fs = require('fs');

const envFile = fs.readFileSync('./.env.local', 'utf8');
const env = {};
envFile.split(/\\r?\\n/).forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key] = rest.join('=').trim();
});

async function run() {
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/agents?select=id,name`;
  const res = await fetch(url, {
    headers: {
      'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    }
  });
  
  if (!res.ok) {
    console.error('FAILED', res.status, await res.text());
  } else {
    const data = await res.json();
    console.log('SUCCESS, count:', data.length);
  }
}

run();
