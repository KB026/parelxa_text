import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

async function testWithRetry() {
  console.log('Using Gemini API Key:', apiKey.substring(0, 10));
  const genAI = new GoogleGenerativeAI(apiKey);

  const models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash-8b'];

  for (const m of models) {
    try {
      console.log(`Trying model '${m}'...`);
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Say hello in 3 words.');
      console.log(`🎉 SUCCESS with '${m}':`, res.response.text().trim());
      return m;
    } catch (err) {
      console.log(`❌ '${m}': ${err.message.substring(0, 200)}...`);
    }
  }
}

testWithRetry();
