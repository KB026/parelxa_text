import pg from 'pg';
const { Client } = pg;

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

async function main() {
  const projectRef = 'quhctuntkvwvjgxebhst';
  const pass = 'Parlexa%402026';
  
  for (const reg of regions) {
    for (const port of [6543, 5432]) {
      const host = `aws-0-${reg}.pooler.supabase.com`;
      const user = `postgres.${projectRef}`;
      const connStr = `postgresql://${user}:${pass}@${host}:${port}/postgres`;
      const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 2000 });
      try {
        await client.connect();
        console.log(`\n🎉🎉🎉 SUCCESS CONNECTED TO ${reg} on port ${port}! 🎉🎉🎉`);
        console.log(`Connection string: ${connStr}`);
        const res = await client.query('SELECT current_database(), current_user;');
        console.log('Result:', res.rows);
        await client.end();
        return;
      } catch (err) {
        if (!err.message.includes('not found') && !err.message.includes('ENOTFOUND')) {
          console.log(`[${reg}:${port}] -> ${err.message}`);
        }
      }
    }
  }
  console.log('Done scanning regions.');
}

main();
