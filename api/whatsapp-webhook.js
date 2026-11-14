// WhatsApp Bot Serverless Webhook Handler (Twilio & Meta Cloud API compatible)
// Runs on Vercel, Netlify, or Node.js server to receive WhatsApp messages and reply with macros

const STAPLE_NUTRIENTS = {
  // Breakfast & Staples
  egg: { name: 'Egg, large', cals: 72, p: 6.3, c: 0.4, f: 4.8 },
  eggs: { name: 'Eggs, large', cals: 72, p: 6.3, c: 0.4, f: 4.8 },
  toast: { name: 'Whole wheat toast', cals: 79, p: 4.0, c: 13.0, f: 1.1 },
  bread: { name: 'Bread slice', cals: 79, p: 4.0, c: 13.0, f: 1.1 },
  oats: { name: 'Rolled oats (40g / 1/2 cup)', cals: 155, p: 6.7, c: 22.3, f: 2.8 },
  oatmeal: { name: 'Oatmeal (40g / 1/2 cup)', cals: 155, p: 6.7, c: 22.3, f: 2.8 },
  banana: { name: 'Banana, medium (118g)', cals: 105, p: 1.3, c: 24.0, f: 0.4 },
  apple: { name: 'Apple, medium (182g)', cals: 95, p: 0.5, c: 21.0, f: 0.3 },
  butter: { name: 'Butter (1 tbsp / 14g)', cals: 100, p: 0.1, c: 0.0, f: 11.4 },
  oil: { name: 'Olive / Cooking oil (1 tbsp)', cals: 124, p: 0.0, c: 0.0, f: 14.0 },
  avocado: { name: 'Avocado, medium (150g)', cals: 240, p: 3.0, c: 3.0, f: 22.0 },
  yogurt: { name: 'Greek yogurt (170g)', cals: 100, p: 17.3, c: 6.1, f: 0.7 },
  curd: { name: 'Plain curd / Dahi (1 cup)', cals: 120, p: 6.0, c: 9.0, f: 6.0 },

  // Indian Dishes & Specialties
  'rava dosa': { name: 'Rava Dosa (1 piece)', cals: 170, p: 3.5, c: 26.0, f: 5.5 },
  'masala dosa': { name: 'Masala Dosa (1 piece)', cals: 250, p: 5.0, c: 38.0, f: 9.0 },
  dosa: { name: 'Plain Dosa (1 piece)', cals: 133, p: 3.0, c: 23.0, f: 3.0 },
  idli: { name: 'Idli (1 piece / 40g)', cals: 58, p: 1.8, c: 12.0, f: 0.2 },
  sambar: { name: 'Sambar (1 cup / 200g)', cals: 110, p: 4.5, c: 18.0, f: 2.0 },
  chutney: { name: 'Coconut chutney (2 tbsp)', cals: 70, p: 1.0, c: 3.0, f: 6.5 },
  'masala chai': { name: 'Masala Chai with milk & sugar (1 cup)', cals: 85, p: 2.5, c: 12.0, f: 3.0 },
  chai: { name: 'Chai / Indian Tea with milk (1 cup)', cals: 75, p: 2.2, c: 10.0, f: 2.5 },
  tea: { name: 'Tea with milk (1 cup)', cals: 60, p: 2.0, c: 8.0, f: 2.0 },
  coffee: { name: 'Coffee with milk (1 cup)', cals: 45, p: 2.0, c: 5.0, f: 2.0 },
  roti: { name: 'Roti / Chapati (1 piece)', cals: 104, p: 3.1, c: 20.0, f: 1.2 },
  chapati: { name: 'Chapati (1 piece)', cals: 104, p: 3.1, c: 20.0, f: 1.2 },
  paratha: { name: 'Aloo / Plain Paratha (1 piece)', cals: 210, p: 4.0, c: 30.0, f: 8.5 },
  dal: { name: 'Dal / Lentil curry (1 cup / 200g)', cals: 198, p: 12.0, c: 32.0, f: 2.5 },
  paneer: { name: 'Paneer (100g)', cals: 265, p: 18.0, c: 3.0, f: 20.0 },
  chana: { name: 'Chana Masala (1 cup)', cals: 240, p: 10.0, c: 35.0, f: 7.0 },
  poha: { name: 'Poha (1 plate / 150g)', cals: 180, p: 3.5, c: 35.0, f: 3.5 },
  upma: { name: 'Upma (1 plate / 150g)', cals: 210, p: 4.5, c: 32.0, f: 7.0 },
  biryani: { name: 'Chicken Biryani (1 plate / 300g)', cals: 450, p: 28.0, c: 52.0, f: 14.0 },

  // Proteins & Meals
  chicken: { name: 'Chicken breast (100g)', cals: 165, p: 31.0, c: 0.0, f: 3.6 },
  rice: { name: 'White rice, cooked (1 cup / 158g)', cals: 205, p: 4.2, c: 44.5, f: 0.4 },
  broccoli: { name: 'Broccoli, steamed (1 cup / 91g)', cals: 34, p: 2.8, c: 4.0, f: 0.4 },
  salmon: { name: 'Atlantic salmon (100g)', cals: 206, p: 22.1, c: 0.0, f: 12.3 },
  whey: { name: 'Whey protein (1 scoop / 30g)', cals: 120, p: 25.0, c: 2.0, f: 1.0 },
  protein: { name: 'Protein powder (1 scoop / 30g)', cals: 120, p: 25.0, c: 2.0, f: 1.0 },
  creatine: { name: 'Creatine monohydrate (5g scoop)', cals: 0, p: 0.0, c: 0.0, f: 0.0 },
  milk: { name: 'Milk, whole (1 cup / 244g)', cals: 149, p: 7.7, c: 11.7, f: 8.0 },
  steak: { name: 'Sirloin steak (100g cooked)', cals: 207, p: 27.0, c: 0.0, f: 10.0 },
  beef: { name: 'Ground beef 90/10 (100g)', cals: 217, p: 26.1, c: 0.0, f: 11.8 },
  tuna: { name: 'Canned tuna in water (1 can)', cals: 130, p: 29.0, c: 0.0, f: 1.0 }
};

function parseWhatsAppMessage(text) {
  let meal = 'Breakfast';
  const lower = text.toLowerCase();
  if (lower.includes('lunch')) meal = 'Lunch';
  else if (lower.includes('dinner')) meal = 'Dinner';
  else if (lower.includes('snack')) meal = 'Snacks';

  // Split lines or commas
  const segments = text.split(/[\n,;]|(?:\band\b)/i).map(s => s.trim()).filter(Boolean);
  const items = [];
  let totalCals = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;

  for (let seg of segments) {
    if (/^(breakfast|lunch|dinner|snacks?):?$/i.test(seg)) continue;

    const numMatch = seg.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
    let qty = numMatch ? parseFloat(numMatch[1]) : 1;
    let namePart = numMatch ? numMatch[2].toLowerCase() : seg.toLowerCase();
    namePart = namePart.replace(/^(cups?|slices?|tbsp|tsp|g|grams?|oz|scoops?|pieces?)\s*(?:of\s*)?/i, '').trim();

    // Match against staple food keywords (longest match first)
    let matchedKey = Object.keys(STAPLE_NUTRIENTS).sort((a, b) => b.length - a.length).find(k => namePart.includes(k));
    if (matchedKey) {
      const base = STAPLE_NUTRIENTS[matchedKey];
      const c = Math.round(base.cals * qty);
      const p = Math.round(base.p * qty * 10) / 10;
      const cb = Math.round(base.c * qty * 10) / 10;
      const f = Math.round(base.f * qty * 10) / 10;

      items.push({
        name: `${qty}x ${base.name}`,
        cals: c,
        p,
        c: cb,
        f
      });

      totalCals += c;
      totalP += p;
      totalC += cb;
      totalF += f;
    }
  }

  return { meal, items, totalCals, totalP: Math.round(totalP * 10) / 10, totalC: Math.round(totalC * 10) / 10, totalF: Math.round(totalF * 10) / 10 };
}

// Serverless Handler (Vercel / Express / Cloud Functions)
module.exports = async (req, res) => {
  // 1. Meta WhatsApp Webhook Verification Handshake (GET)
  if (req.method === 'GET') {
    const mode = req.query && (req.query['hub.mode'] || req.query.mode);
    const token = req.query && (req.query['hub.verify_token'] || req.query.verify_token);
    const challenge = req.query && (req.query['hub.challenge'] || req.query.challenge);

    const expectedToken = process.env.META_VERIFY_TOKEN || 'nutritrack_token';

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('Meta Webhook verified successfully!');
      return res.status(200).send(challenge);
    }
  }

  // 2. Extract incoming text from Meta WhatsApp, Twilio, or direct JSON / query
  let incomingText = '';
  let fromNumber = '';
  let isMeta = false;
  let phoneNumberId = '';

  if (req.body && req.body.object === 'whatsapp_business_account') {
    // Meta Cloud API payload
    isMeta = true;
    try {
      const entry = req.body.entry && req.body.entry[0];
      const change = entry && entry.changes && entry.changes[0];
      const value = change && change.value;
      phoneNumberId = value && value.metadata && value.metadata.phone_number_id;
      const msg = value && value.messages && value.messages[0];
      if (msg && msg.type === 'text') {
        incomingText = msg.text.body;
        fromNumber = msg.from;
      }
    } catch (e) {
      console.error('Error parsing Meta payload:', e);
    }
  } else {
    // Twilio or direct GET/POST
    incomingText = (req.body && req.body.Body) || (req.query && req.query.text) || '';
  }

  if (!incomingText) {
    if (isMeta) {
      // Acknowledge non-text message (e.g. read receipt) to Meta
      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.status(200).send('NutriTrack WhatsApp Webhook is active! Send a meal text to calculate macros.');
  }

  const result = parseWhatsAppMessage(incomingText);
  let reply = '';

  if (result.items.length === 0) {
    reply = `🥗 NutriTrack WhatsApp Logger\nCould not match foods from: "${incomingText}".\nTry formatting like:\n"3 eggs, 2 toast, 1 coffee" or "Lunch: 150g chicken, 1 cup rice, broccoli"`;
  } else {
    reply = `🥗 Logged to ${result.meal}!\n━━━━━━━━━━━━━━━━━━━━━\n` +
      result.items.map(it => `• ${it.name}: ${it.cals} kcal (P: ${it.p}g, C: ${it.c}g, F: ${it.f}g)`).join('\n') +
      `\n━━━━━━━━━━━━━━━━━━━━━\n` +
      `📊 Meal Total: ${result.totalCals} kcal\n🥩 Protein: ${result.totalP}g | 🍞 Carbs: ${result.totalC}g | 🥑 Fat: ${result.totalF}g\n` +
      `🎯 Remaining allowance: ~${Math.max(0, 2000 - result.totalCals)} kcal\n\n✨ Added to your NutriTrack dashboard!`;

    // Save to Vercel KV / Upstash Redis so the NutriTrack web app automatically updates its diary & rings
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;
    if (kvUrl && kvToken) {
      try {
        const mealRecord = {
          id: `wa_msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          date: new Date().toISOString().split('T')[0],
          meal: result.meal,
          items: result.items,
          timestamp: Date.now()
        };
        await fetch(`${kvUrl}/rpush/nutritrack_pending_meals`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${kvToken}` },
          body: JSON.stringify(mealRecord)
        });
      } catch (kvErr) {
        console.error('Failed to save meal to Vercel KV:', kvErr);
      }
    }
  }

  // 3. Handle Meta WhatsApp Cloud API response
  if (isMeta && fromNumber && phoneNumberId) {
    const metaToken = process.env.META_ACCESS_TOKEN;
    if (metaToken) {
      try {
        await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${metaToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: fromNumber,
            type: 'text',
            text: { body: reply }
          })
        });
      } catch (err) {
        console.error('Failed to send Meta reply:', err);
      }
    }
    return res.status(200).send('EVENT_RECEIVED');
  }

  // 4. Handle Twilio WhatsApp webhook (TwiML XML response)
  if (req.headers && req.headers['x-twilio-signature'] || (req.body && req.body.AccountSid)) {
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${reply}</Message></Response>`);
  }

  // 5. Default JSON response (Browser or API testing)
  return res.status(200).json({ reply, parsed: result });
};
