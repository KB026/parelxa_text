const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config({ path: '.env.local' });
async function run() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`;
    const res = await axios.get(url);
    console.log(res.data.models.map(m => m.name));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
