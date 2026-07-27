import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function testApi() {
  const urls = [
    `https://api.supabase.com/v1/projects/quhctuntkvwvjgxebhst/query`,
    `https://quhctuntkvwvjgxebhst.supabase.co/rest/v1/query`,
    `https://quhctuntkvwvjgxebhst.supabase.co/pg`
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: 'SELECT 1;' })
      });
      console.log(`${u} -> Status: ${res.status}`);
      const text = await res.text();
      console.log('   Body:', text.substring(0, 200));
    } catch (e) {
      console.log(`${u} -> Error: ${e.message}`);
    }
  }
}

testApi();
