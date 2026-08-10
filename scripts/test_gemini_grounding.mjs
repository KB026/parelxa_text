import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

console.log('Using Gemini API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING');

async function testGrounding() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash or gemini-2.0-flash with search grounding tool
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ googleSearch: {} }]
    });

    console.log('Sending search grounded prompt to Gemini...');
    const result = await model.generateContent(
      'Research the latest enterprise AI trends, news, and releases from the past month. Identify 1 specific recent trend in enterprise AI (e.g., voice AI contact center agents, Indic sovereign AI models, AI procurement, autonomous agent security, developer tool AI agents).'
    );

    const response = await result.response;
    const text = response.text();
    console.log('\n--- Grounded Search Result (first 500 chars) ---');
    console.log(text.substring(0, 500));
    console.log('...\nFull length:', text.length);
  } catch (err) {
    console.error('Gemini Grounding Error:', err);
  }
}

testGrounding();
