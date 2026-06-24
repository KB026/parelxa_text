const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error("DATABASE_URL not found in environment.");
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const seedSql = fs.readFileSync('./scripts/seed.sql', 'utf8');

    console.log("Executing seed.sql...");
    await client.query(seedSql);

    console.log("Successfully seeded database.");
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

run();
