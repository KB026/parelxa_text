const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS search_queries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        query TEXT NOT NULL,
        is_ai_powered BOOLEAN DEFAULT false,
        recommendation_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("âœ“ 'search_queries' table created successfully.");
  } catch (err) { console.error(err); }
  finally { await client.end(); }
}
run();
