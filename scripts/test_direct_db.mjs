import pg from 'pg';
const { Client } = pg;

const password = 'Parlexa@2026';
const ref = 'quhctuntkvwvjgxebhst';

const targets = [
  { host: `db.${ref}.supabase.co`, port: 5432, user: 'postgres' },
  { host: `db.${ref}.supabase.co`, port: 6543, user: 'postgres' },
  { host: `aws-0-ap-south-1.pooler.supabase.com`, port: 6543, user: `postgres.${ref}` },
  { host: `aws-0-ap-south-1.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
  { host: `aws-0-ap-south-1.pooler.supabase.com`, port: 6543, user: `postgres` },
  { host: `aws-0-ap-south-1.pooler.supabase.com`, port: 5432, user: `postgres` }
];

async function run() {
  for (const t of targets) {
    const connStr = `postgresql://${t.user}:${encodeURIComponent(password)}@${t.host}:${t.port}/postgres`;
    console.log(`Connecting to ${t.host}:${t.port} as ${t.user}...`);
    const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 5000, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log(`🎉🎉🎉 SUCCESS: Connected to ${t.host}:${t.port} as ${t.user}! 🎉🎉🎉`);
      const res = await client.query('SELECT current_database();');
      console.log('DB:', res.rows);
      await client.end();
      return connStr;
    } catch (e) {
      console.log(`   Failed: ${e.message}`);
    }
  }
}

run();
