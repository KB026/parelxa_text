const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('agents').select('*');
  if (error) {
    console.error(error);
    process.exit(1);
  }
  
  console.log('Total tools count in DB:', data.length);
  
  const verified = data.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    category: t.category,
    pricing_model: t.pricing_model || t.pricing,
    description: t.description || t.tagline
  }));

  fs.writeFileSync(path.join(__dirname, '../all_verified_tools.json'), JSON.stringify(verified, null, 2));
  console.log('Successfully written all_verified_tools.json with', verified.length, 'tools');
}

main();
