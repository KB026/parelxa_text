import pg from 'pg';
const { Client } = pg;

const connStr = 'postgresql://postgres.cxjwtswbhznjmtxccxug:Parlexa%402026@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

async function test() {
  console.log('Testing cxjwtswbhznjmtxccxug connection string...');
  const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 5000, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('🎉🎉🎉 SUCCESS CONNECTED TO cxjwtswbhznjmtxccxug! 🎉🎉🎉');
    const res = await client.query('SELECT current_database(), current_user;');
    console.log('Result:', res.rows);
    await client.end();
  } catch (err) {
    console.log('Failed:', err.message);
  }
}

test();
