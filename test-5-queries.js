const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test(query) {
  console.log(`\n>>> QUERY: "${query}"`);
  try {
    const res = await axios.post('http://localhost:3001/api/ai-search', { query });
    console.log(`EXPLANATION: ${res.data.explanation}`);
    console.log(`RECOMMENDATIONS: ${res.data.recommendations.map(r => r.name).join(', ')}`);
    console.log(`AI POWERED: ${res.data.isAIPowered}`);
  } catch (err) {
    console.error(`FAILED: ${err.message}`);
  }
}

async function run() {
  const queries = [
    "I need an AI for my meeting notes",
    "Help me generate social media posts for my startup",
    "I want to automate my customer support on WhatsApp",
    "Is there a tool for translating my video content to Hindi?",
    "I need an AI that can help me with legal document analysis"
  ];
  for (const q of queries) {
    await test(q);
    await new Promise(r => setTimeout(r, 2000)); // Rate limit buffer
  }
}
run();
