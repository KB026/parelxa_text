const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('./.env.local', 'utf8');
const lines = envFile.split(/\r?\n/);
const env = {};
lines.forEach(line => {
  const parts = line.split('=');
  const key = parts[0];
  const value = parts.slice(1).join('=');
  if (key && value) env[key] = value.trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDb() {
  const { data: agents, error } = await supabase.from('agents').select('id, name').limit(5);

  if (error) {
    if (error.code === '42P01') {
      console.log('STATUS: tables_missing');
    } else {
      console.error('STATUS: error', error);
    }
  } else if (agents && agents.length > 0) {
    console.log('STATUS: populated', agents.length);
  } else {
    console.log('STATUS: empty');
  }
}

checkDb();
