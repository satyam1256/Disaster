const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Extract location from description using Gemini
exports.extractLocation = async (description) => {
  const prompt = `Extract location from: ${description}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  const { data } = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    body
  );
  // Parse Gemini response for location name
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim();
};

// Verify image authenticity using Gemini
exports.verifyImage = async (imageUrl) => {
  const prompt = `Analyze image at ${imageUrl} for signs of manipulation or disaster context.`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  const { data } = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    body
  );
  // Parse Gemini response for verification result
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim();
}; 