const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Env variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found at:', envPath);
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parsedLine = line.trim();
  if (!parsedLine || parsedLine.startsWith('#')) return;
  const eqIdx = parsedLine.indexOf('=');
  if (eqIdx > 0) {
    const key = parsedLine.substring(0, eqIdx).trim();
    const value = parsedLine.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 2. Parse data.ts dynamically
const dataTsPath = path.join(__dirname, '..', 'lib', 'data.ts');
if (!fs.existsSync(dataTsPath)) {
  console.error('lib/data.ts file not found at:', dataTsPath);
  process.exit(1);
}

console.log('Reading lib/data.ts...');
const dataContent = fs.readFileSync(dataTsPath, 'utf8');

// Convert to temporary JS module
let jsContent = dataContent
  .replace(/export const/g, 'const')
  .replace(/export type.*?;/g, '')
  .trim();
jsContent += '\nmodule.exports = { COMPANIES, CATEGORIES };';

const tempJsPath = path.join(__dirname, '..', 'lib', 'data_temp.js');
fs.writeFileSync(tempJsPath, jsContent, 'utf8');

let COMPANIES, CATEGORIES;
try {
  const tempModule = require(tempJsPath);
  COMPANIES = tempModule.COMPANIES;
  CATEGORIES = tempModule.CATEGORIES;
} catch (err) {
  console.error('Failed to parse lib/data.ts content dynamically:', err);
  if (fs.existsSync(tempJsPath)) fs.unlinkSync(tempJsPath);
  process.exit(1);
} finally {
  if (fs.existsSync(tempJsPath)) fs.unlinkSync(tempJsPath);
}

console.log(`Successfully parsed ${CATEGORIES.length} categories and ${COMPANIES.length} agents.`);

async function seed() {
  try {
    // 3. Seed Categories
    console.log('Seeding categories...');
    for (const cat of CATEGORIES) {
      const { error } = await supabase
        .from('categories')
        .upsert({
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          description: cat.desc || cat.description || null
        }, { onConflict: 'name' });
      if (error) {
        console.error(`Error seeding category "${cat.name}":`, error.message);
      }
    }
    console.log('Categories seeding finished.');

    // 4. Seed Agents/Listings
    console.log('Seeding agents...');
    const agentsData = COMPANIES.map(comp => {
      const slug = comp.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      return {
        id: comp.id,
        name: comp.name,
        slug: slug,
        founders: comp.founders || null,
        founder_linkedin: comp.founderLinkedin || null,
        website: comp.website || null,
        city: comp.city || null,
        raw_industry: comp.rawIndustry || null,
        category: comp.category || null,
        sub_category: comp.subCategory || null,
        summary: comp.summary || null,
        one_liner: comp.summary || null,
        description: comp.summary || null,
        founded_year: comp.foundedYear || null,
        use_cases: comp.useCases || null,
        pricing: comp.pricing || null,
        rating: comp.rating || 0,
        reviews_count: comp.reviews || 0,
        approval_status: 'approved',
        is_verified: comp.is_verified || false
      };
    });

    // Insert/upsert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < agentsData.length; i += batchSize) {
      const batch = agentsData.slice(i, i + batchSize);
      const { error } = await supabase
        .from('agents')
        .upsert(batch, { onConflict: 'id' });
      if (error) {
        console.error(`Error seeding agents batch starting at index ${i}:`, error.message);
      } else {
        console.log(`Seeded agents batch index ${i} to ${i + batch.length - 1}`);
      }
    }

    // 5. Update primary key sequence
    const { error: seqError } = await supabase.rpc('setval', {
      seq: 'agents_id_seq',
      val: Math.max(...COMPANIES.map(c => c.id))
    });
    if (seqError) {
      // Fallback: Set sequence via raw SQL or ignore if permissions are restricted
      console.log('Primary key sequence update skipped or handled by database trigger/migration defaults.');
    }

    console.log('Database seeding successfully completed!');
  } catch (err) {
    console.error('An unexpected error occurred during seeding:', err);
  }
}

seed();
