const autocannon = require('autocannon');

const targetUrl = 'https://69e00cf374874300080b3202--clever-sunflower-52c87c.netlify.app';

async function runTest() {
  console.log('\\n======================================================');
  console.log('ðŸš€ INITIATING PARLEXA LOAD TEST: STAGE 1 (FRONTEND CACHE)');
  console.log('======================================================\\n');
  console.log('Target: SSR Homepage (Hits Netlify Edge Cache)');
  console.log('Parameters: 100 Concurrent Connections / 15 seconds\\n');

  const result1 = await autocannon({
    url: targetUrl,
    connections: 100, // Roughly 4000-8000 requests per minute depending on response speed
    duration: 15,
    pipelining: 1
  });

  console.log('âœ… STAGE 1 COMPLETE.\\n');
  console.log(`â±ï¸ Avg Latency: ${result1.latency.average} ms`);
  console.log(`ðŸ”¥ Total Requests Handled: ${result1.requests.total}`);
  console.log(`âš ï¸ Errors / 5XX Responses: ${result1.errors} / ${result1.non2xx}`);
  console.log(`------------------------------------------------------\\n`);

  // Wait 3 seconds to let connections cool
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('======================================================');
  console.log('ðŸš€ INITIATING STAGE 2: DYNAMIC DATABASE LOOKUP (BACKEND)');
  console.log('======================================================\\n');
  console.log('Target: Dynamic API/Slug (Forces Supabase Database Hits)');
  console.log('Parameters: 200 Concurrent Connections / 15 seconds\\n');

  const result2 = await autocannon({
    // Simulating deep lookup that requires Next.js Serverless to ask Supabase for data
    url: `${targetUrl}/products/parlexa-ai`, 
    connections: 200, 
    duration: 15,
    pipelining: 1
  });

  console.log('âœ… STAGE 2 COMPLETE.\\n');
  console.log(`â±ï¸ Avg Latency: ${result2.latency.average} ms`);
  console.log(`ðŸ”¥ Total Requests Handled: ${result2.requests.total}`);
  console.log(`âš ï¸ Errors / 5XX Responses: ${result2.errors} / ${result2.non2xx}`);
  console.log('\\n======================================================');
  console.log('ðŸ ALL TESTS CONCLUDED.');
}

runTest().catch(console.error);
