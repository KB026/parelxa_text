const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello');
    console.log(result.response.text());
  } catch (err) {
    console.error(err);
  }
}
run();
