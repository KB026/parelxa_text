const { Client } = require('pg');

async function testQuery() {
  const connectionString = 'postgresql://postgres.cxjwtswbhznjmtxccxug:Parlexa%402026@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Pooler.');
    const res = await client.query('SELECT name, is_verified FROM agents WHERE is_verified = true LIMIT 5');
    console.log('Verified agents in live DB:', res.rows);
    await client.end();
  } catch (err) {
    console.error('Query FAILED:', err.message);
  }
}

testQuery();
