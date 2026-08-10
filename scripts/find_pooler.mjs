import pg from 'pg';
const { Client } = pg;

const password = 'Parlexa@2026';
const ref = 'quhctuntkvwvjgxebhst';

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'sa-east-1',
  'ca-central-1'
];

async function scan() {
  for (const prefix of ['aws-0', 'aws-1']) {
    for (const reg of regions) {
      for (const port of [6543, 5432]) {
        const host = `${prefix}-${reg}.pooler.supabase.com`;
        const user = `postgres.${ref}`;
        const connStr = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/postgres`;
        const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 1500, ssl: { rejectUnauthorized: false } });
        try {
          await client.connect();
          console.log(`\n🎉🎉🎉 FOUND POOLER: ${host}:${port}! 🎉🎉🎉`);
          const res = await client.query('SELECT current_database(), current_user;');
          console.log('Result:', res.rows);
          await client.end();
          return connStr;
        } catch (err) {
          if (!err.message.includes('not found')) {
            console.log(`[${host}:${port}] -> ${err.message}`);
          }
        }
      }
    }
  }
  console.log('Scan finished.');
}

scan();
