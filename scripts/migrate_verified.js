const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('placeholder')) {
    console.error('ERROR: DATABASE_URL is missing or placeholder in .env.local');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('1. Ensuring is_verified column exists...');
    await client.query(`
      ALTER TABLE public.agents 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
    `);

    console.log('2. Marking top Indian AI Tools as verified...');
    const verifiedTools = ['Krutrim', 'Sarvam AI', 'Wysa', 'Zia', 'Freddy AI'];
    await client.query(`
      UPDATE public.agents 
      SET is_verified = true 
      WHERE name = ANY($1);
    `, [verifiedTools]);

    console.log('3. Ensuring approval_status exists...');
    await client.query(`
      ALTER TABLE public.agents 
      ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
    `);

    console.log('SUCCESS: Migration completed.');
    await client.end();
  } catch (err) {
    console.error('MIGRATION FAILED:', err.message);
    process.exit(1);
  }
}

migrate();
