import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchOpenApi() {
  console.log('Fetching OpenAPI spec from Supabase REST API root...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  if (!res.ok) {
    console.error('Failed to fetch spec:', res.status, res.statusText);
    return;
  }

  const spec = await res.json();
  console.log('OpenAPI Spec Title:', spec.info?.title);
  console.log('\n--- Available Paths (Tables & RPCs) ---');
  const paths = Object.keys(spec.paths || {});
  paths.sort().forEach(p => console.log('  ', p));
}

fetchOpenApi();
