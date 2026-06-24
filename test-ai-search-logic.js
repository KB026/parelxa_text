const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test(query) {
  console.log(`\n--- Testing Query: "${query}" ---`);
  try {
    const res = await axios.post('http://localhost:3001/api/ai-search', { query });
    console.log("EXPLANATION (First part should be strategy):");
    console.log(res.data.explanation.substring(0, 300) + "...");
    console.log("\nRECOMMENDATIONS:");
    res.data.recommendations.forEach(r => console.log(`- ${r.name} (${r.category})`));
    console.log("\nIS AI POWERED:", res.data.isAIPowered);
  } catch (err) {
    console.error("FAILED:", err.response?.data || err.message);
  }
}

async function run() {
  console.log("Make sure the dev server is running on port 3001!");
  await test("customer service automation");
  await test("Yellow.ai vs Observe.ai comparison");
}
run();
