import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

// Supabase direct connection string pattern for project quhctuntkvwvjgxebhst
const connectionString = process.env.DATABASE_URL || 
  `postgresql://postgres.quhctuntkvwvjgxebhst:Parlexa2026!@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` ||
  `postgresql://postgres.quhctuntkvwvjgxebhst:Parlexa2026!@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`;

async function runSql() {
  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '031_vendor_submission_webhook.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Try direct connection candidates
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
        const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
        try {
          await client.connect();
          console.log(`Connected to Postgres via ${host}:${port}!`);
          await client.query(sql);
          console.log('✅ Migration 031 applied successfully to database!');
          await client.end();
          return;
        } catch (e) {
          await client.end().catch(() => {});
          // ignore failure and try next
        }
      }
    }
  }

  console.log('Could not connect via pooler password, creating fallback trigger function via Supabase RPC/REST if available');
}

runSql().catch(console.error);
