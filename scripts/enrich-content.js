const { Client } = require('pg');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

dotenv.config({ path: '.env.local' });

const client = new Client({ connectionString: process.env.DATABASE_URL });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

async function searchTool(name) {
  try {
    const response = await axios.post('https://google.serper.dev/search', {
      q: `${name} AI tool reviews G2 Product Hunt Trustpilot`,
    }, {
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (err) {
    console.error(`Search failed for ${name}:`, err.message);
    return null;
  }
}

async function enrichAgent(agent) {
  console.log(`\n--- Enriching: ${agent.name} ---`);
  
  const searchData = await searchTool(agent.name);
  if (!searchData) return;

  const searchContext = JSON.stringify(searchData.organic.slice(0, 5));
  
  const prompt = `
    You are an expert AI software analyst. I am providing you with search results for an AI tool called "${agent.name}".
    Current Description: ${agent.description || agent.summary || 'None'}
    
    Search Context: ${searchContext}
    
    TASK:
    1. Write a professional, high-converting Markdown description (150-200 words). Include sections for "Key Features" (bullet points) and "Best For" (who should use it).
    2. Extract external ratings if found (Source Name, Rating, Review Count, and a Short Snippet).
    
    Format your response as a JSON object:
    {
      "formatted_description": "...",
      "external_reviews": [
        { "source": "G2", "rating": 4.5, "count": 120, "snippet": "..." },
        ...
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(text);

    // Update agent description
    await client.query('UPDATE agents SET description = $1, updated_at = NOW() WHERE id = $2', [data.formatted_description, agent.id]);
    console.log(`✓ Updated description for ${agent.name}`);

    // Update external reviews (upsert)
    for (const rev of data.external_reviews) {
      await client.query(`
        INSERT INTO external_reviews (agent_id, source, rating, reviews_count, snippet, source_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (agent_id, source) DO UPDATE SET
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          snippet = EXCLUDED.snippet,
          updated_at = NOW();
      `, [agent.id, rev.source, rev.rating, rev.count, rev.snippet, 'https://google.com/search?q=' + encodeURIComponent(agent.name + ' ' + rev.source)]);
    }
    console.log(`✓ Added ${data.external_reviews.length} external reviews for ${agent.name}`);

  } catch (err) {
    console.error(`Enrichment failed for ${agent.name}:`, err.message);
  }
}

async function run() {
  await client.connect();
  
  try {
    // Fetch agents that need enrichment (batch of 5 for now)
    const { rows: agents } = await client.query(`
      SELECT a.id, a.name, a.description, a.summary 
      FROM agents a
      LEFT JOIN external_reviews er ON a.id = er.agent_id
      WHERE (a.description IS NULL OR LENGTH(a.description) < 500)
      GROUP BY a.id
      HAVING COUNT(er.id) = 0
    `);

    console.log(`Found ${agents.length} tools to enrich in this batch.`);

    for (const agent of agents) {
      await enrichAgent(agent);
    }

    console.log('\nBatch enrichment complete.');
  } finally {
    await client.end();
  }
}

run();
