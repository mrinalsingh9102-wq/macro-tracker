// Multi-Device Cloud Sync API for NutriTrack
// Persists and synchronizes food logs across Phone, Laptop, and WhatsApp via Upstash Redis / Vercel KV

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(200).json({
      connected: false,
      message: 'Upstash / Redis storage not connected yet.',
      meals: []
    });
  }

  const dateParam = (req.query && req.query.date) || new Date().toISOString().split('T')[0];
  const dayKey = `nutritrack_day_${dateParam}`;

  try {
    if (req.method === 'GET') {
      // 1. Fetch persistent day meals from Upstash KV (Non-destructive: Safe for Phone + Laptop)
      const response = await fetch(`${kvUrl}/get/${dayKey}`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const data = await response.json();
      let dayMeals = [];
      if (data && data.result) {
        try {
          dayMeals = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          if (!Array.isArray(dayMeals)) dayMeals = [];
        } catch (e) {
          dayMeals = [];
        }
      }

      // 2. Also check and merge legacy pending queue if any meals were written there
      const pendingRes = await fetch(`${kvUrl}/lrange/nutritrack_pending_meals/0/-1`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const pendingData = await pendingRes.json();
      if (pendingData && Array.isArray(pendingData.result) && pendingData.result.length > 0) {
        let merged = false;
        for (let raw of pendingData.result) {
          try {
            const m = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (m && !dayMeals.some(existing => existing.id === m.id)) {
              dayMeals.push(m);
              merged = true;
            }
          } catch(e) {}
        }
        if (merged) {
          // Persist the merged list back to the persistent dayKey
          await fetch(`${kvUrl}/set/${dayKey}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${kvToken}` },
            body: JSON.stringify(dayMeals)
          });
        }
      }

      return res.status(200).json({
        connected: true,
        date: dateParam,
        meals: dayMeals
      });
    }

    if (req.method === 'POST') {
      // Allow syncing new meals from client
      const { meal, meals } = req.body || {};
      const response = await fetch(`${kvUrl}/get/${dayKey}`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const data = await response.json();
      let dayMeals = [];
      if (data && data.result) {
        try {
          dayMeals = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          if (!Array.isArray(dayMeals)) dayMeals = [];
        } catch (e) {
          dayMeals = [];
        }
      }

      let updated = false;
      if (meal && meal.id) {
        if (!dayMeals.some(m => m.id === meal.id)) {
          dayMeals.push(meal);
          updated = true;
        }
      } else if (Array.isArray(meals)) {
        for (let m of meals) {
          if (m && m.id && !dayMeals.some(ex => ex.id === m.id)) {
            dayMeals.push(m);
            updated = true;
          }
        }
      }

      if (updated) {
        await fetch(`${kvUrl}/set/${dayKey}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${kvToken}` },
          body: JSON.stringify(dayMeals)
        });
      }

      return res.status(200).json({ success: true, count: dayMeals.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sync endpoint error:', error);
    return res.status(500).json({ error: error.message });
  }
};
