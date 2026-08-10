import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

async function testModels() {
  console.log('Testing models with API Key:', apiKey.substring(0, 10));
  const models = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-latest', 'gemini-pro'];

  for (const m of models) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Say hello in 3 words.');
      console.log(`✅ Model '${m}' works! Response: ${res.response.text().trim()}`);
      return m;
    } catch (err) {
      console.log(`❌ Model '${m}' failed: ${err.message}`);
    }
  }
}

testModels();
