import pg from 'pg';
const { Client } = pg;

const password = 'Parlexa@2026';
const ref = 'quhctuntkvwvjgxebhst';

const poolerHosts = [
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-1-ap-south-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com'
];

async function run() {
  for (const host of poolerHosts) {
    for (const port of [6543, 5432]) {
      const connConfig = {
        host: host,
        port: port,
        user: `postgres.${ref}`,
        password: password,
        database: 'postgres',
        connectionTimeoutMillis: 3000,
        ssl: { rejectUnauthorized: false }
      };

      console.log(`Connecting to ${host}:${port} with user postgres.${ref}...`);
      const client = new Client(connConfig);
      try {
        await client.connect();
        console.log(`\n🎉🎉🎉 SUCCESS: Connected to ${host}:${port}! 🎉🎉🎉`);
        const res = await client.query('SELECT current_database();');
        console.log('Result:', res.rows);
        await client.end();
        return;
      } catch (e) {
        console.log(`   Failed: ${e.message}`);
      }

      // Also try user 'postgres' with options
      const connConfigOpts = {
        host: host,
        port: port,
        user: 'postgres',
        password: password,
        database: 'postgres',
        options: `-c project=${ref}`,
        connectionTimeoutMillis: 3000,
        ssl: { rejectUnauthorized: false }
      };
      const clientOpts = new Client(connConfigOpts);
      try {
        await clientOpts.connect();
        console.log(`\n🎉🎉🎉 SUCCESS WITH OPTS: Connected to ${host}:${port}! 🎉🎉🎉`);
        const res = await clientOpts.query('SELECT current_database();');
        console.log('Result:', res.rows);
        await clientOpts.end();
        return;
      } catch (e) {
        // quiet
      }
    }
  }
}

run();
