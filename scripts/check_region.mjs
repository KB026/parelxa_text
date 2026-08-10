import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(url, { headers: { apikey: key } });
  console.log('Status:', res.status);
  console.log('Headers:');
  for (const [k, v] of res.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }
}
check();
