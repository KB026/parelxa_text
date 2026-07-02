const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const mapping = {
  'Large Language Models': 'AI & LLMs',
  'Conversational AI': 'Customer Experience',
  'Contact Center AI': 'Customer Experience',
  'Voice AI': 'Customer Experience',
  'Healthcare Technology': 'Healthcare',
  'HR Technology': 'HR & Workforce',
  'Retail Technology': 'Retail & E-Commerce',
  'Logistics': 'Logistics & Supply Chain',
  'AgriTech': 'AgriTech',
  'EdTech': 'EdTech',
  'Enterprise Analytics': 'Enterprise & Automation',
  'Enterprise Software': 'Enterprise & Automation',
  'Financial Services': 'FinTech',
  'Cybersecurity AI': 'Developer Tools & Infra',
  'Cloud Infrastructure': 'Developer Tools & Infra',
  'Marketing Technology': 'Marketing & Sales',
  'Sales Technology': 'Marketing & Sales',
  'Retail Analytics': 'Retail & E-Commerce',
  'Agriculture Technology': 'AgriTech',
  'HR & Workforce': 'HR & Workforce',
  'Retail & E-Commerce': 'Retail & E-Commerce',
  'Logistics & Supply Chain': 'Logistics & Supply Chain',
  'Developer Tools': 'Developer Tools & Infra',
  'Cybersecurity': 'Developer Tools & Infra',
  'Education Technology': 'EdTech',
  'Productivity AI': 'Enterprise & Automation',
  'E-Commerce AI': 'Retail & E-Commerce',
  'Industrial IoT': 'Developer Tools & Infra',
  'Wellness Technology': 'Healthcare',
  'Medical Diagnostics AI': 'Healthcare',
  'Medical Imaging AI': 'Healthcare'
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i+1] === '"') { // Handle escaped quotes
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const csvData = fs.readFileSync('scripts/marketplace_directory.csv', 'utf8');
  const lines = csvData.split('\n').filter(l => l.trim().length > 0);

  try {
    await client.connect();
    console.log('Connected to DB. Truncating old agents...');
    await client.query('TRUNCATE TABLE public.agents RESTART IDENTITY CASCADE;');

    console.log('Ingesting agents...');
    for (const line of lines) {
      const row = parseCSVLine(line);
      if (row.length < 10) continue;

      const [
        id_placeholder, 
        name,           
        website,        
        city,           
        founded_year,   
        raw_industry,   
        sub_category,   
        founders,       
        one_liner,      
        use_cases,      
        pricing_model_raw, 
        pricing_details,   
        has_india_pricing_raw, 
        rating,         
        reviews,        
        in_relevance,   
        ease_use,       
        value_money,    
        total_score,    
        target_segment, 
        deployment,     
        key_features,   
        funding_blurb   
      ] = row;

      const slug = slugify(name);
      const category = mapping[raw_industry] || mapping[sub_category] || mapping[sub_category.split(' / ')[0]] || 'AI & LLMs';
      const has_india_pricing = has_india_pricing_raw.includes('âœ…') || has_india_pricing_raw.toLowerCase().includes('yes');
      const pricing_model = pricing_model_raw.toLowerCase().includes('contact') ? 'contact' : 'paid';
      const features = (key_features || '').split(';').map(f => f.trim()).filter(f => f.length > 0);
      const tags = [target_segment, deployment].filter(t => t && t.length > 0);
      
      // Clean rating/reviews
      const cleanRating = parseFloat(rating) || 0;
      const cleanReviews = parseInt(reviews.replace(/[^0-9]/g, '')) || 0;

      const query = `
        INSERT INTO public.agents (
          name, slug, website, city, founded_year, raw_industry, 
          category, sub_category, founders, one_liner, use_cases, 
          pricing_model, pricing, has_india_pricing, rating, reviews, reviews_count,
          features, tags, company_blurb, approval_status, summary, description,
          is_verified, logo_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      `;

      const values = [
        name, slug, website, city, parseInt(founded_year) || null, raw_industry,
        category, sub_category, founders, one_liner, use_cases,
        pricing_model, pricing_details, has_india_pricing, cleanRating, cleanReviews, cleanReviews,
        features, tags, funding_blurb, 'approved', one_liner, one_liner,
        true, `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      ];

      await client.query(query, values);
      console.log(`Inserted: ${name} (${slug})`);
    }

    await client.query("SELECT setval('agents_id_seq', (SELECT MAX(id) FROM public.agents));");
    console.log('Migration complete! Added ' + lines.length + ' agents.');

  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await client.end();
  }
}

run();
