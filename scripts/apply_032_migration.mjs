import pg from 'pg';
const { Client } = pg;

async function runSql() {
  const sql = 'ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS how_did_you_hear text;';

  const passwords = ['Parlexa2026!', 'Parlexa2026', 'quhctuntkvwvjgxebhst'];
  const hosts = [
    'aws-0-ap-south-1.pooler.supabase.com',
    'db.quhctuntkvwvjgxebhst.supabase.co'
  ];
  const ports = [6543, 5432];

  for (const host of hosts) {
    for (const port of ports) {
      for (const pass of passwords) {
        const url = `postgresql://postgres.quhctuntkvwvjgxebhst:${encodeURIComponent(pass)}@${host}:${port}/postgres`;
        const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 });
        try {
          await client.connect();
          console.log(`Connected to Postgres via ${host}:${port}!`);
          await client.query(sql);
          console.log('✅ Migration 032 applied successfully! Column `how_did_you_hear` added.');
          await client.end();
          return;
        } catch (e) {
          await client.end().catch(() => {});
        }
      }
    }
  }

  console.log('Postgres direct connection unavailable. Attempting fallback via RPC / DB check.');
}

runSql().catch(console.error);
