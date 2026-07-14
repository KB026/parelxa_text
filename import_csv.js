const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');
const url = require('url');
const https = require('https');
const http = require('http');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function fetchImageBuffer(urlStr) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new url.URL(urlStr);
    const client = urlStr.startsWith('https') ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    client.get(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        if (res.headers.location) {
           return fetchImageBuffer(res.headers.location.startsWith('http') ? res.headers.location : `https://${parsedUrl.hostname}${res.headers.location}`).then(resolve).catch(reject);
        }
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${urlStr}: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({
        buffer: Buffer.concat(chunks), 
        contentType: res.headers['content-type'] || 'image/png'
      }));
    }).on('error', reject);
  });
}

async function runImport() {
  const csvPath = 'C:\\Users\\Kushal\\Downloads\\Parlexa AI - 3-Month Free Listing Onboarding (Responses) - Form Responses 1.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found at:", csvPath);
    return;
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse CSV
  const records = parse(fileContent, {
    skip_empty_lines: true,
    from_line: 2 // Skip header
  });

  console.log(`Found ${records.length} records. Beginning import...`);

  let successCount = 0;
  let errorCount = 0;

  for (const row of records) {
    const toolName = row[2]?.trim();
    if (!toolName) continue;

    console.log(`Processing: ${toolName}`);

    const categoryName = row[9]?.trim() || 'Other';
    
    // 1. Ensure category exists
    const { error: catError } = await supabase
      .from('categories')
      .upsert({ 
        name: categoryName, 
        icon: 'LayoutGrid', 
        color: 'bg-blue-100 text-blue-600',
        description: 'Imported Category'
      }, { onConflict: 'name' });
      
    if (catError) {
      console.error(`Failed to upsert category "${categoryName}":`, catError.message);
    }

    // 2. Prepare Agent Data

    let slug = generateSlug(toolName);
    
    // Ensure slug is unique by appending random chars if needed
    const { data: existingAgent } = await supabase.from('agents').select('id').eq('slug', slug).maybeSingle();
    if (existingAgent) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const tags = row[11] ? row[11].split(',').map(t => t.trim()).filter(Boolean) : [];
    const industries = row[12] ? row[12].split(',').map(t => t.trim()).filter(Boolean) : [];

    const website = row[5]?.trim();
    let microlinkData = null;
    let websiteUrl = website;

    if (websiteUrl) {
      if (!websiteUrl.startsWith('http')) websiteUrl = 'https://' + websiteUrl;
      console.log(`[${toolName}] Fetching Microlink data...`);
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(websiteUrl)}&meta=true&screenshot=true`;
      try {
        microlinkData = await new Promise((resolve, reject) => {
          https.get(apiUrl, (res) => {
            let raw = '';
            res.on('data', c => raw += c);
            res.on('end', () => {
              try { resolve(JSON.parse(raw)); } catch(e) { resolve(null); }
            });
          }).on('error', reject);
        });
      } catch (e) {
        console.error(`[${toolName}] Microlink fetch failed:`, e.message);
      }
    }

    // Determine generated URLs (fallback if microlink fails/doesn't have them)
    let generatedLogoUrl = microlinkData?.data?.logo?.url;
    if (!generatedLogoUrl) {
      // try row 8 or UI Avatar
      generatedLogoUrl = row[8]?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(toolName)}&background=1565c0&color=fff&size=256`;
    }
    
    let generatedScreenshotUrl = microlinkData?.data?.screenshot?.url;
    if (!generatedScreenshotUrl && websiteUrl) {
      generatedScreenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(websiteUrl)}?w=1200&h=800`;
    }

    // --- Upload Logo to Supabase Storage ---
    let finalLogoUrl = null;
    try {
      console.log(`[${toolName}] Uploading logo to Supabase...`);
      const { buffer, contentType } = await fetchImageBuffer(generatedLogoUrl);
      const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : (contentType.includes('ico') ? 'ico' : 'png');
      const fileName = `imported/${slug}-logo-${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from('agent-logos').upload(fileName, buffer, {
        contentType: contentType,
        upsert: true
      });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('agent-logos').getPublicUrl(fileName);
        finalLogoUrl = publicUrlData.publicUrl;
      }
    } catch (e) {
      console.error(`[${toolName}] Failed to upload logo:`, e.message);
    }

    // --- Upload Screenshot to Supabase Storage ---
    let finalScreenshots = [];
    if (generatedScreenshotUrl) {
      try {
        console.log(`[${toolName}] Uploading screenshot to Supabase...`);
        const { buffer, contentType } = await fetchImageBuffer(generatedScreenshotUrl);
        const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
        const fileName = `imported/${slug}-screenshot-${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage.from('agent-screenshots').upload(fileName, buffer, {
          contentType: contentType,
          upsert: true
        });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('agent-screenshots').getPublicUrl(fileName);
          finalScreenshots = [publicUrlData.publicUrl];
        }
      } catch (e) {
        console.error(`[${toolName}] Failed to upload screenshot:`, e.message);
      }
    }

    const agentData = {
      name: toolName,
      slug: slug,
      one_liner: row[3]?.trim(),
      description: row[4]?.trim(),
      website: website,
      demo_url: row[6]?.trim() || null,
      video_url: row[7]?.trim() || null,
      logo_url: finalLogoUrl,
      screenshots: finalScreenshots.length > 0 ? finalScreenshots : null,
      category: categoryName,
      raw_industry: row[10]?.trim(),
      use_cases: row[13]?.trim(),
      pricing_model: row[14]?.trim(),
      pricing: row[15]?.trim(),
      free_trial: row[16]?.trim() || null,
      has_india_pricing: row[17]?.trim().toLowerCase() === 'yes',
      inr_price: row[18]?.trim() || null,
      company_name: row[19]?.trim(),
      founded_year: row[20]?.trim() ? parseInt(row[20]) : null,
      team_size: row[21]?.trim(),
      city: row[22]?.trim(),
      founders: row[23]?.trim(),
      company_linkedin: row[24]?.trim() || null,
      tags: tags,
      industries: industries,
      user_id: null // Unassigned owner
    };

    // 3. Insert Agent
    const { error: agentError } = await supabase.from('agents').insert(agentData);

    if (agentError) {
      console.error(`❌ Failed to insert tool "${toolName}":`, agentError.message);
      errorCount++;
    } else {
      console.log(`✅ Successfully imported "${toolName}"`);
      successCount++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

runImport().catch(console.error);
