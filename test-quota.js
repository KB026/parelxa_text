const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
async function run() {
  const models = ['gemini-2.5-flash', 'gemini-pro-latest', 'gemini-1.5-flash'];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      await model.generateContent('ping');
      console.log(`âœ“ ${m} is working`);
    } catch (err) {
      console.log(`âœ— ${m}: ${err.message}`);
    }
  }
}
run();
