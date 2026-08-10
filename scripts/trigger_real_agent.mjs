import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log('--- Triggering weekly-blog-agent Netlify Scheduled Function ---');
  const funcModule = await import('../netlify/functions/weekly-blog-agent.ts');
  const handler = funcModule.default;

  const fakeReq = new Request('https://localhost/weekly-blog-agent');
  const response = await handler(fakeReq);

  console.log('Response Status:', response.status);
  const data = await response.json();
  console.log('\n--- Scheduled Function Execution Output ---');
  console.log(JSON.stringify(data, null, 2));

  if (data.inserted_post) {
    console.log('\n====================================================');
    console.log('📄 FULL GENERATED DRAFT BLOG POST REPORT');
    console.log('====================================================');
    console.log('TITLE:', data.inserted_post.title);
    console.log('SLUG:', data.inserted_post.slug);
    console.log('EXCERPT:', data.inserted_post.excerpt);
    console.log('AUTHOR:', data.inserted_post.author);
    console.log('STATUS:', data.inserted_post.status);
    console.log('SOURCE:', data.inserted_post.source);
    console.log('META TITLE:', data.inserted_post.meta_title);
    console.log('META DESCRIPTION:', data.inserted_post.meta_description);
    console.log('READ TIME:', data.inserted_post.read_time_minutes, 'minutes');
    console.log('\n--- FAQS ---');
    console.log(JSON.stringify(data.inserted_post.faqs, null, 2));
    console.log('\n--- BODY CONTENT ---');
    console.log(data.inserted_post.body);
    console.log('====================================================\n');
  }
}

run().catch(console.error);
