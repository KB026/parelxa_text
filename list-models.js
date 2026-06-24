const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
async function run() {
  const models = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log(models);
}
run();
