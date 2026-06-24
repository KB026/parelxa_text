const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testSerper() {
  const agentName = 'Jasper AI';
  const apiKey = process.env.SERPER_API_KEY;
  
  console.log('Testing Serper API with Key:', apiKey ? 'FOUND' : 'MISSING');
  
  if (!apiKey) {
    console.error('API Key is missing from .env.local');
    return;
  }

  try {
    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: `${agentName} software reviews ratings`,
        num: 5,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const organic = response.data.organic || [];
    console.log(`Found ${organic.length} organic results.`);
    
    organic.forEach((item, i) => {
      console.log(`\nResult ${i + 1}: ${item.title}`);
      console.log(`Source: ${item.link}`);
      console.log(`Snippet: ${item.snippet.substring(0, 100)}...`);
    });

  } catch (error) {
    console.error('Serper API call failed:', error.response ? error.response.data : error.message);
  }
}

testSerper();
