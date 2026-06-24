const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const res = await client.query("SELECT name, length(description) as len FROM agents ORDER BY len ASC LIMIT 10;");
    console.log(res.rows);
  } catch (err) { console.error(err); }
  finally { await client.end(); }
}
run();
