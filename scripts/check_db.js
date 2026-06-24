const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('./.env.local', 'utf8');
const lines = envFile.split('\\n');
const env = {};
lines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key] = value.trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDb() {
  const { data: tables, error } = await supabase.from('agents').select('*').limit(1);
  if (error) {
    if (error.code === '42P01') {
      console.log('No agents table found.');
    } else {
      console.error('Error fetching agents:', error);
    }
  } else {
    console.log('Agents table exists:', tables);
  }
}

checkDb();
