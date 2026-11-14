// API Sync Endpoint: Connects WhatsApp meal logs to the NutriTrack Web App
// Works with Vercel KV (free Upstash Redis) to deliver incoming WhatsApp meals into the web diary

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

  try {
    if (req.method === 'GET') {
      // Fetch all pending WhatsApp meals that haven't been synced to the browser yet
      const response = await fetch(`${kvUrl}/lrange/nutritrack_pending_meals/0/-1`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const data = await response.json();
      const rawList = data.result || [];
      const meals = rawList.map(item => {
        try { return typeof item === 'string' ? JSON.parse(item) : item; } catch (e) { return null; }
      }).filter(Boolean);

      return res.status(200).json({ connected: true, meals });
    }

    if (req.method === 'POST') {
      // Clear/Acknowledge synced meals so they don't get added twice
      const { syncedIds } = req.body || {};
      if (syncedIds && syncedIds.length > 0) {
        // Fetch current list, filter out syncedIds, and rewrite
        const response = await fetch(`${kvUrl}/lrange/nutritrack_pending_meals/0/-1`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        const data = await response.json();
        const rawList = data.result || [];
        const remaining = rawList
          .map(item => { try { return typeof item === 'string' ? JSON.parse(item) : item; } catch (e) { return null; } })
          .filter(m => m && !syncedIds.includes(m.id));

        // Delete old and write remaining
        await fetch(`${kvUrl}/del/nutritrack_pending_meals`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });

        if (remaining.length > 0) {
          for (let rem of remaining) {
            await fetch(`${kvUrl}/rpush/nutritrack_pending_meals`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${kvToken}` },
              body: JSON.stringify(rem)
            });
          }
        }
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sync endpoint error:', error);
    return res.status(500).json({ error: error.message });
  }
};
