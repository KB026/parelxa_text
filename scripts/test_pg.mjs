import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const password = 'Parlexa@2026';
const ref = 'quhctuntkvwvjgxebhst';

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1',
  'ca-central-1'
];

async function test() {
  for (const region of regions) {
    const connStr = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 3000, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log(`✅ SUCCESS on region ${region}!`);
      const res = await client.query('SELECT current_database();');
      console.log('Result:', res.rows);
      await client.end();
      return connStr;
    } catch (err) {
      if (err.message.includes('tenant/user') && err.message.includes('not found')) {
        // Not this region
      } else {
        console.log(`Region ${region}: ${err.message}`);
      }
    }
  }
  console.log('Finished testing all regions.');
}

test();
