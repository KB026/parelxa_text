const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verifyTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const tablesToCheck = [
      'profiles', 
      'categories', 
      'agents', 
      'reviews', 
      'verification_requests', 
      'moderation_reports', 
      'site_settings', 
      'listing_claims', 
      'external_reviews', 
      'promotions', 
      'transactions'
    ];

    console.log('--- Table Verification ---');
    for (const table of tablesToCheck) {
      const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE  table_schema = 'public'
          AND    table_name   = $1
        );
      `, [table]);
      
      const exists = res.rows[0].exists;
      console.log(`${table.padEnd(25)}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }

  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

verifyTables();
