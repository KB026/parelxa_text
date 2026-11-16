import type { Config } from "@netlify/functions";
import { generateDynamicBlogPost } from "../../lib/blog-generator";

// Ensure WebSocket compatibility in serverless environments
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class WebSocket {} as any;
}

export default async (req: Request) => {
  const timestamp = Date.now();
  console.log(`====================================================`);
  console.log(`🤖 WEEKLY BLOG AGENT — Execution Started at ${new Date(timestamp).toISOString()}`);
  console.log(`====================================================`);

  const results: any[] = [];

  try {
    // 1. Generate First Dynamic Trend Post
    console.log('\n--- Generating Post #1 from Live Market Radar / Discourse ---');
    const post1 = await generateDynamicBlogPost({
      autoPublish: false,
      authorName: 'Parlexa Weekly Research Agent'
    });
    results.push(post1);
    console.log(`✅ Post #1 generated: "${post1.title}" (${post1.slug})`);

    // 2. Pause to allow DB state to register and avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Generate Second Dynamic Trend Post (Guaranteed distinct category & topic)
    console.log('\n--- Generating Post #2 (Deduplicating against existing DB) ---');
    const post2 = await generateDynamicBlogPost({
      autoPublish: false,
      authorName: 'Parlexa Weekly Research Agent'
    });
    results.push(post2);
    console.log(`✅ Post #2 generated: "${post2.title}" (${post2.slug})`);

    console.log(`\n====================================================`);
    console.log(`🎉 WEEKLY BLOG AGENT FINISHED: ${results.length} posts generated`);
    console.log(`====================================================\n`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Weekly blog agent executed successfully and created ${results.length} distinct draft blog posts`,
        posts: results
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    console.error('[weekly-blog-agent] Fatal execution error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Weekly blog agent failed'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const config: Config = {
  schedule: "0 6 * * 1" // Scheduled for Mondays at 06:00 UTC
};
