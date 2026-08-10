import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

async function test() {
  console.log('Testing gemini-2.0-flash with search grounding...');
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: [{ googleSearch: {} }]
  });

  try {
    const res = await model.generateContent('What are the latest AI news and trends in August 2026? Give a 2 sentence summary.');
    console.log('🎉 Grounding result:', res.response.text());
  } catch (e) {
    console.log('Error:', e.message);
  }
}

test();
