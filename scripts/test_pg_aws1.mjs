import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const password = 'Parlexa@2026';
const ref = 'quhctuntkvwvjgxebhst';

const poolers = [
  'aws-1-ap-south-1.pooler.supabase.com',
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-1-us-east-1.pooler.supabase.com',
  'aws-1-eu-central-1.pooler.supabase.com'
];

async function test() {
  for (const host of poolers) {
    for (const port of [5432, 6543]) {
      const connStr = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:${port}/postgres`;
      console.log(`Testing ${host}:${port}...`);
      const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 3000, ssl: { rejectUnauthorized: false } });
      try {
        await client.connect();
        console.log(`\n🎉🎉🎉 SUCCESS CONNECTED TO ${host}:${port}! 🎉🎉🎉`);
        const res = await client.query('SELECT current_database(), current_user;');
        console.log('Result:', res.rows);
        await client.end();
        return connStr;
      } catch (err) {
        console.log(`  Failed: ${err.message}`);
      }
    }
  }
}

test();
