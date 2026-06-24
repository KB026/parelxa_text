const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const client = new Client({ connectionString: process.env.DATABASE_URL });

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
}

async function run() {
  await client.connect();
  console.log('Connected to DB. Starting slug migration...');

  try {
    // Fetch all agents
    const { rows: agents } = await client.query('SELECT id, name, slug FROM agents');
    console.log(`Found ${agents.length} agents.`);

    let updatedCount = 0;
    for (const agent of agents) {
      const isNumeric = /^\d+$/.test(agent.slug);
      const isEmpty = !agent.slug || agent.slug.trim() === '';
      
      if (isNumeric || isEmpty) {
        const newSlug = slugify(agent.name);
        // Verify slug isn't just an empty string after slugifying (e.g. name was just symbols)
        const finalSlug = newSlug || `agent-${agent.id}`;
        
        await client.query('UPDATE agents SET slug = $1 WHERE id = $2', [finalSlug, agent.id]);
        updatedCount++;
        if (updatedCount % 50 === 0) console.log(`Updated ${updatedCount} slugs...`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} slugs.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
