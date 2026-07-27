require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const IMAGE_SOURCE_PATH = `C:\\Users\\Kushal\\.gemini\\antigravity-ide\\brain\\e353fb43-4f50-4521-a7ed-6e38b37b865e\\media__1785160278602.png`;

async function main() {
  console.log("=== Updating BharatGPT Screenshot ===");

  // 1. Read source image buffer
  if (!fs.existsSync(IMAGE_SOURCE_PATH)) {
    console.error("Source image file does not exist:", IMAGE_SOURCE_PATH);
    process.exit(1);
  }
  const imageBuffer = fs.readFileSync(IMAGE_SOURCE_PATH);
  console.log(`Loaded source image (${imageBuffer.length} bytes)`);

  // 2. Save copy to public/images/bharatgpt.png for local backup/static usage
  const publicDir = path.join(__dirname, 'public', 'images');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const localDestPath = path.join(publicDir, 'bharatgpt-screenshot.png');
  fs.writeFileSync(localDestPath, imageBuffer);
  console.log(`Saved local copy to ${localDestPath}`);

  // 3. Find BharatGPT in Supabase agents table
  const { data: agents, error: fetchError } = await supabase
    .from('agents')
    .select('id, name, slug, screenshots, logo_url')
    .ilike('name', '%bharatgpt%');

  if (fetchError) {
    console.error("Error fetching agent from Supabase:", fetchError);
  } else {
    console.log(`Found ${agents ? agents.length : 0} agents matching 'bharatgpt':`, agents);
  }

  if (agents && agents.length > 0) {
    for (const agent of agents) {
      console.log(`Processing Agent ID: ${agent.id}, Name: ${agent.name}, Existing screenshots:`, agent.screenshots);

      // 4. Upload screenshot to Supabase Storage bucket 'agent-screenshots'
      const fileName = `${agent.id}/screenshot-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('agent-screenshots')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      let finalUrl = `/images/bharatgpt-screenshot.png`;
      if (uploadError) {
        console.error(`Failed to upload to Supabase storage for ${agent.name}:`, uploadError.message);
        console.log(`Falling back to local static URL: ${finalUrl}`);
      } else {
        const { data: publicUrlData } = supabase.storage.from('agent-screenshots').getPublicUrl(fileName);
        finalUrl = publicUrlData.publicUrl;
        console.log(`Uploaded to Supabase storage! Public URL: ${finalUrl}`);
      }

      // 5. Update agent screenshots column in Supabase (REPLACING existing screenshots)
      const { error: updateError } = await supabase
        .from('agents')
        .update({ screenshots: [finalUrl] })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`Failed to update agent record ${agent.id}:`, updateError.message);
      } else {
        console.log(`✅ Successfully updated agent ${agent.name} (ID: ${agent.id}) screenshots with new image!`);
      }
    }
  } else {
    console.log("No agent named BharatGPT found in DB matching ilike '%bharatgpt%'. Searching all agents...");
    const { data: allAgents } = await supabase.from('agents').select('id, name, slug').limit(200);
    console.log("Existing agents sample:", allAgents ? allAgents.map(a => `${a.id}: ${a.name} (${a.slug})`) : []);
  }

  console.log("=== Done ===");
}

main().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
