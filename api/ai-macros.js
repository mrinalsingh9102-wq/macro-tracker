// Vercel Serverless Function: AI Macro Calculator
// Powered by Google Gemini API

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { text, meal = 'breakfast' } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: 'Missing text input' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return flag indicating frontend should use client-side or fallback
    return res.status(200).json({ status: 'no_server_key' });
  }

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are a certified sports nutritionist and precision macro calculator.
The user describes what they ate: "${text}".
Deconstruct into individual items and calculate accurate portion weights, Calories (kcal), Protein (g), Net Carbs (g), Total Carbs (g), Fat (g), Dietary Fiber (g), and Sodium (mg).
Return ONLY raw valid JSON:
{
  "meal": "${meal}",
  "aiAnalysis": "1-sentence nutritional insight",
  "totalCalories": 650,
  "totalProtein": 42.5,
  "totalNetCarbs": 52,
  "totalCarbs": 60,
  "totalFat": 24,
  "totalFiber": 8,
  "items": [
    {
      "name": "Item name",
      "portion": "e.g. 1 bowl (200g)",
      "grams": 200,
      "calories": 300,
      "protein": 25.0,
      "netCarbs": 30.0,
      "carbs": 35.0,
      "fat": 8.0,
      "fiber": 5.0,
      "sodium": 420
    }
  ]
}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(500).json({ error: 'Gemini API call failed', details: errText });
    }

    const data = await geminiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('AI Macro estimation server error:', err);
    return res.status(500).json({ error: err.message });
  }
};
