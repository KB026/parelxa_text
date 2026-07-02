const { chromium } = require('@playwright/test');

async function simulateAgentJourney(id) {
  const browser = await chromium.launch({ headless: true });
  // Create an isolated context so each agent looks like a unique visitor
  const context = await browser.newContext({
    userAgent: `PostHog-Test-Agent-${id}`,
    viewport: { width: Math.floor(Math.random() * 800) + 400, height: 800 }
  });
  const page = await context.newPage();
  
  console.log(`Agent ${id} connecting to platform...`);
  
  try {
    // 1. Visit homepage
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1500);
    
    // 2. Perform some clicks to trigger events
    if (id % 2 === 0) {
      await page.goto('http://localhost:3000/products');
      await page.waitForTimeout(2000);
    } else {
      await page.goto('http://localhost:3000/ai-finder');
      await page.waitForTimeout(2000);
    }

    // 3. Visit login/auth form
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(1000);
    
    console.log(`Agent ${id} completed journey successfully.`);
  } catch (err) {
    console.log(`Agent ${id} encountered an issue: ${err.message.split('\\n')[0]}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function runTrafficSpike() {
  const numAgents = 10;
  const promises = [];
  
  console.log(`Spawning ${numAgents} concurrent headless tracking agents...`);
  for (let i = 1; i <= numAgents; i++) {
    promises.push(
      new Promise(resolve => setTimeout(resolve, i * 400)) // Stagger starts slightly
        .then(() => simulateAgentJourney(i))
    );
  }
  
  await Promise.all(promises);
  console.log('âœ… Traffic simulation complete! PostHog analytics should now be populated.');
}

runTrafficSpike();
