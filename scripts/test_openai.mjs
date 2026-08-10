import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API Key...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say hello in 3 words.' }]
    });
    console.log('🎉 OpenAI Response:', response.choices[0].message.content);
  } catch (err) {
    console.error('OpenAI Error:', err.message);
  }
}

testOpenAI();
