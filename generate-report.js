const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const { rows: agents } = await client.query(`
      SELECT a.id, a.name, a.description, a.website, a.category, 
             COUNT(er.id) as review_count
      FROM agents a
      LEFT JOIN external_reviews er ON a.id = er.agent_id
      GROUP BY a.id
      ORDER BY a.name ASC
    `);

    const incomplete = agents.filter(a => 
      !a.description || a.description.length < 500 || 
      !a.website || 
      !a.category || 
      a.review_count == 0
    );

    console.log(`TOTAL AGENTS: ${agents.length}`);
    console.log(`INCOMPLETE AGENTS: ${incomplete.length}`);
    console.log("\n--- TOP 20 INCOMPLETE TOOLS ---");
    incomplete.slice(0, 20).forEach(a => {
      let issues = [];
      if (!a.description || a.description.length < 500) issues.push("Short/No Description");
      if (!a.website) issues.push("No Website");
      if (!a.category) issues.push("No Category");
      if (a.review_count == 0) issues.push("No Social Proof");
      console.log(`- ${a.name} (ID: ${a.id}): ${issues.join(", ")}`);
    });
  } catch (err) { console.error(err); }
  finally { await client.end(); }
}
run();
