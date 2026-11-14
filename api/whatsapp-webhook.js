// WhatsApp Bot Serverless Webhook Handler (Meta Cloud API & Twilio compatible)
// Runs on Vercel to receive WhatsApp food messages, calculate macros, and sync to NutriTrack

const STAPLE_NUTRIENTS = {
  // Breakfast & Staples
  egg: {
    name: 'Egg, large',
    category: 'Dairy & Eggs',
    description: 'Whole farm-fresh large egg',
    servingUnit: 'egg',
    grams: 50,
    cals: 72, p: 6.3, c: 0.4, f: 4.8, fiber: 0
  },
  eggs: {
    name: 'Eggs, large',
    category: 'Dairy & Eggs',
    description: 'Whole farm-fresh large eggs',
    servingUnit: 'egg',
    grams: 50,
    cals: 72, p: 6.3, c: 0.4, f: 4.8, fiber: 0
  },
  toast: {
    name: 'Whole wheat toast',
    category: 'Grains & Breads',
    description: 'Toasted 100% whole grain wheat bread',
    servingUnit: 'slice',
    grams: 35,
    cals: 79, p: 4.0, c: 13.0, f: 1.1, fiber: 2.0
  },
  bread: {
    name: 'Bread slice',
    category: 'Grains & Breads',
    description: 'Soft sliced bakery bread',
    servingUnit: 'slice',
    grams: 35,
    cals: 79, p: 4.0, c: 13.0, f: 1.1, fiber: 1.5
  },
  oats: {
    name: 'Rolled oats',
    category: 'Grains & Cereals',
    description: 'Whole grain rolled oats porridge',
    servingUnit: 'cup (cooked)',
    grams: 150,
    cals: 155, p: 6.7, c: 22.3, f: 2.8, fiber: 4.0
  },
  oatmeal: {
    name: 'Oatmeal',
    category: 'Grains & Cereals',
    description: 'Hearty warm oatmeal bowl',
    servingUnit: 'bowl',
    grams: 150,
    cals: 155, p: 6.7, c: 22.3, f: 2.8, fiber: 4.0
  },
  banana: {
    name: 'Banana, medium',
    category: 'Fresh Fruits',
    description: 'Ripe yellow banana with natural potassium',
    servingUnit: 'fruit',
    grams: 118,
    cals: 105, p: 1.3, c: 24.0, f: 0.4, fiber: 3.1
  },
  apple: {
    name: 'Apple, medium',
    category: 'Fresh Fruits',
    description: 'Crisp fresh orchard apple with peel',
    servingUnit: 'fruit',
    grams: 182,
    cals: 95, p: 0.5, c: 21.0, f: 0.3, fiber: 4.4
  },
  butter: {
    name: 'Butter',
    category: 'Fats & Oils',
    description: 'Pure cream dairy butter',
    servingUnit: 'tbsp',
    grams: 14,
    cals: 100, p: 0.1, c: 0.0, f: 11.4, fiber: 0
  },
  oil: {
    name: 'Olive / Cooking oil',
    category: 'Fats & Oils',
    description: 'Extra virgin culinary oil',
    servingUnit: 'tbsp',
    grams: 14,
    cals: 124, p: 0.0, c: 0.0, f: 14.0, fiber: 0
  },
  avocado: {
    name: 'Avocado, medium',
    category: 'Healthy Fats & Fruits',
    description: 'Creamy Hass avocado with monounsaturated fats',
    servingUnit: 'avocado',
    grams: 150,
    cals: 240, p: 3.0, c: 3.0, f: 22.0, fiber: 10.0
  },
  yogurt: {
    name: 'Greek yogurt',
    category: 'Dairy & Probiotics',
    description: 'Plain nonfat thick strained Greek yogurt',
    servingUnit: 'container',
    grams: 170,
    cals: 100, p: 17.3, c: 6.1, f: 0.7, fiber: 0
  },
  curd: {
    name: 'Plain curd / Dahi',
    category: 'Dairy & Probiotics',
    description: 'Traditional home-set natural probiotic dahi',
    servingUnit: 'cup',
    grams: 200,
    cals: 120, p: 6.0, c: 9.0, f: 6.0, fiber: 0
  },

  // Indian Dishes & Specialties
  'rava dosa': {
    name: 'Rava Dosa',
    category: 'South Indian Specialties',
    description: 'Crispy tempered semolina crepe with cumin and curry leaves',
    servingUnit: 'piece',
    grams: 120,
    cals: 170, p: 3.5, c: 26.0, f: 5.5, fiber: 2.2
  },
  'masala dosa': {
    name: 'Masala Dosa',
    category: 'South Indian Specialties',
    description: 'Golden fermented rice crepe stuffed with spiced potato masala',
    servingUnit: 'piece',
    grams: 180,
    cals: 250, p: 5.0, c: 38.0, f: 9.0, fiber: 3.5
  },
  dosa: {
    name: 'Plain Dosa',
    category: 'South Indian Specialties',
    description: 'Traditional fermented rice & lentil crispy crepe',
    servingUnit: 'piece',
    grams: 90,
    cals: 133, p: 3.0, c: 23.0, f: 3.0, fiber: 1.8
  },
  idli: {
    name: 'Idli',
    category: 'South Indian Specialties',
    description: 'Soft steamed savory fermented rice & urad dal cake',
    servingUnit: 'piece',
    grams: 45,
    cals: 58, p: 1.8, c: 12.0, f: 0.2, fiber: 0.8
  },
  sambar: {
    name: 'Sambar',
    category: 'South Indian Specialties',
    description: 'Hearty spiced pigeon-pea lentil stew with drumsticks & tamarind',
    servingUnit: 'bowl',
    grams: 200,
    cals: 110, p: 4.5, c: 18.0, f: 2.0, fiber: 4.0
  },
  chutney: {
    name: 'Coconut Chutney',
    category: 'Condiments & Sides',
    description: 'Fresh grated coconut relish with mustard seed tadka',
    servingUnit: 'serving',
    grams: 30,
    cals: 70, p: 1.0, c: 3.0, f: 6.5, fiber: 1.5
  },
  'masala chai': {
    name: 'Masala Chai',
    category: 'Beverages & Tea',
    description: 'Traditional spiced brewed black tea with milk, cardamom & ginger',
    servingUnit: 'cup',
    grams: 180,
    cals: 85, p: 2.5, c: 12.0, f: 3.0, fiber: 0.2
  },
  chai: {
    name: 'Chai / Indian Tea',
    category: 'Beverages & Tea',
    description: 'Fresh brewed Indian milk tea with a touch of sugar',
    servingUnit: 'cup',
    grams: 180,
    cals: 75, p: 2.2, c: 10.0, f: 2.5, fiber: 0
  },
  tea: {
    name: 'Tea with milk',
    category: 'Beverages & Tea',
    description: 'Brewed black tea with a splash of milk',
    servingUnit: 'cup',
    grams: 180,
    cals: 60, p: 2.0, c: 8.0, f: 2.0, fiber: 0
  },
  coffee: {
    name: 'Coffee with milk',
    category: 'Beverages & Coffee',
    description: 'Fresh brewed coffee with milk',
    servingUnit: 'cup',
    grams: 180,
    cals: 45, p: 2.0, c: 5.0, f: 2.0, fiber: 0
  },
  roti: {
    name: 'Roti / Chapati',
    category: 'Indian Flatbreads',
    description: 'Fresh whole wheat unleavened flatbread puffed on open flame',
    servingUnit: 'piece',
    grams: 40,
    cals: 104, p: 3.1, c: 20.0, f: 1.2, fiber: 2.8
  },
  chapati: {
    name: 'Chapati',
    category: 'Indian Flatbreads',
    description: 'Tawa-cooked soft whole wheat chapati',
    servingUnit: 'piece',
    grams: 40,
    cals: 104, p: 3.1, c: 20.0, f: 1.2, fiber: 2.8
  },
  paratha: {
    name: 'Paratha',
    category: 'Indian Flatbreads',
    description: 'Layered whole wheat flatbread pan-toasted with ghee/oil',
    servingUnit: 'piece',
    grams: 80,
    cals: 210, p: 4.0, c: 30.0, f: 8.5, fiber: 3.0
  },
  dal: {
    name: 'Dal / Lentil Curry',
    category: 'Indian Vegetarian Curries',
    description: 'Yellow lentil stew slow-cooked with garlic, cumin & turmeric',
    servingUnit: 'bowl',
    grams: 200,
    cals: 198, p: 12.0, c: 32.0, f: 2.5, fiber: 6.5
  },
  paneer: {
    name: 'Paneer (Cottage Cheese)',
    category: 'Indian Vegetarian Curries',
    description: 'Fresh dense Indian farmer cottage cheese cubes',
    servingUnit: 'serving',
    grams: 100,
    cals: 265, p: 18.0, c: 3.0, f: 20.0, fiber: 0
  },
  chana: {
    name: 'Chana Masala',
    category: 'Indian Vegetarian Curries',
    description: 'Tender garbanzo chickpeas simmered in an aromatic onion-tomato gravy',
    servingUnit: 'bowl',
    grams: 200,
    cals: 240, p: 10.0, c: 35.0, f: 7.0, fiber: 7.5
  },
  poha: {
    name: 'Poha',
    category: 'Indian Breakfast',
    description: 'Flattened rice sauteed with onions, peanuts, mustard seeds & turmeric',
    servingUnit: 'plate',
    grams: 150,
    cals: 180, p: 3.5, c: 35.0, f: 3.5, fiber: 2.5
  },
  upma: {
    name: 'Upma',
    category: 'Indian Breakfast',
    description: 'Savory roasted semolina seasoned with curry leaves and green chillies',
    servingUnit: 'plate',
    grams: 150,
    cals: 210, p: 4.5, c: 32.0, f: 7.0, fiber: 2.8
  },
  biryani: {
    name: 'Chicken Biryani',
    category: 'Indian Entrees',
    description: 'Aromatic layered basmati rice with spiced chicken, saffron & herbs',
    servingUnit: 'plate',
    grams: 300,
    cals: 450, p: 28.0, c: 52.0, f: 14.0, fiber: 3.0
  },

  // Proteins & Meals
  chicken: {
    name: 'Chicken breast',
    category: 'Lean Meats & Poultry',
    description: 'Boneless, skinless lean chicken breast cooked tender',
    servingUnit: 'portion',
    grams: 100,
    cals: 165, p: 31.0, c: 0.0, f: 3.6, fiber: 0
  },
  rice: {
    name: 'White rice, cooked',
    category: 'Grains & Breads',
    description: 'Fluffy steamed fragrant white rice',
    servingUnit: 'cup',
    grams: 158,
    cals: 205, p: 4.2, c: 44.5, f: 0.4, fiber: 0.6
  },
  broccoli: {
    name: 'Broccoli, steamed',
    category: 'Vegetables & Greens',
    description: 'Fresh vibrant steamed broccoli florets rich in sulforaphane',
    servingUnit: 'cup',
    grams: 91,
    cals: 34, p: 2.8, c: 4.0, f: 0.4, fiber: 2.4
  },
  salmon: {
    name: 'Atlantic salmon',
    category: 'Seafood & Fish',
    description: 'Wild Atlantic salmon fillet loaded with omega-3 fatty acids',
    servingUnit: 'fillet',
    grams: 100,
    cals: 206, p: 22.1, c: 0.0, f: 12.3, fiber: 0
  },
  whey: {
    name: 'Whey protein',
    category: 'Fitness Supplements',
    description: 'Pure micro-filtered whey protein isolate powder',
    servingUnit: 'scoop',
    grams: 30,
    cals: 120, p: 25.0, c: 2.0, f: 1.0, fiber: 0
  },
  protein: {
    name: 'Protein powder',
    category: 'Fitness Supplements',
    description: 'Complete nutritional protein powder supplement',
    servingUnit: 'scoop',
    grams: 30,
    cals: 120, p: 25.0, c: 2.0, f: 1.0, fiber: 0
  },
  creatine: {
    name: 'Creatine monohydrate',
    category: 'Fitness Supplements',
    description: 'Pure micronized creatine monohydrate for strength',
    servingUnit: 'scoop',
    grams: 5,
    cals: 0, p: 0.0, c: 0.0, f: 0.0, fiber: 0
  },
  milk: {
    name: 'Whole milk',
    category: 'Dairy Products',
    description: 'Nutrient-rich pasteurized whole dairy milk',
    servingUnit: 'cup',
    grams: 244,
    cals: 149, p: 7.7, c: 11.7, f: 8.0, fiber: 0
  },
  steak: {
    name: 'Sirloin steak',
    category: 'Lean Meats & Poultry',
    description: 'Seared lean beef sirloin steak packed with heme iron',
    servingUnit: 'portion',
    grams: 100,
    cals: 207, p: 27.0, c: 0.0, f: 10.0, fiber: 0
  },
  beef: {
    name: 'Ground beef 90/10',
    category: 'Lean Meats & Poultry',
    description: 'Lean grass-fed ground beef cooked crumbles',
    servingUnit: 'portion',
    grams: 100,
    cals: 217, p: 26.1, c: 0.0, f: 11.8, fiber: 0
  },
  tuna: {
    name: 'Canned tuna in water',
    category: 'Seafood & Fish',
    description: 'Chunk light tuna packed in pure spring water',
    servingUnit: 'can',
    grams: 140,
    cals: 130, p: 29.0, c: 0.0, f: 1.0, fiber: 0
  }
};

const WORD_NUMS = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'a': 1, 'an': 1, 'half': 0.5
};

function parseWhatsAppMessage(text) {
  // 1. Detect target meal category
  let meal = 'Breakfast';
  const lower = text.toLowerCase();
  if (/\blunch\b/i.test(lower)) meal = 'Lunch';
  else if (/\bdinner\b/i.test(lower)) meal = 'Dinner';
  else if (/\bsnack/i.test(lower)) meal = 'Snacks';
  else if (/\bbreakfast\b/i.test(lower)) meal = 'Breakfast';

  // 2. Clean conversational filler prefixes
  let cleanText = text
    .replace(/^(?:for\s+)?(breakfast|lunch|dinner|snacks?)\s*[:\-]?\s*/gi, '') // "Breakfast: 2 eggs" -> "2 eggs"
    .replace(/\b(?:for|at)\s+(breakfast|lunch|dinner|snacks?)\b/gi, '')         // "2 eggs for breakfast" -> "2 eggs"
    .replace(/\b(?:i\s+had|i\s+ate|had|ate|having|consumed|eating)\b/gi, '')     // "Had 2 eggs" -> "2 eggs"
    .replace(/\b(?:please\s+log|log|add)\b/gi, '')                              // "Log 2 eggs" -> "2 eggs"
    .trim();

  // 3. Split by commas, newlines, semicolons, or conjunctions (and, with, &, +)
  const segments = cleanText.split(/[\n,;]|(?:\b(?:and|with|along with|&|\+)\b)/i).map(s => s.trim()).filter(Boolean);
  const items = [];
  let totalCals = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;

  for (let seg of segments) {
    let segClean = seg.replace(/^(?:had|ate|having|i\s+had)\s+/i, '').trim();
    if (!segClean || /^(breakfast|lunch|dinner|snacks?):?$/i.test(segClean)) continue;

    // Check numeric or word-based quantity
    let qty = 1;
    let namePart = segClean.toLowerCase();

    // Check fraction (e.g. 1/2, 3/4)
    const fracMatch = namePart.match(/^(\d+)\/(\d+)\s*(.*)$/);
    if (fracMatch) {
      qty = parseFloat(fracMatch[1]) / parseFloat(fracMatch[2]);
      namePart = fracMatch[3];
    } else {
      const numMatch = namePart.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
      if (numMatch) {
        qty = parseFloat(numMatch[1]);
        namePart = numMatch[2];
      } else {
        const wordMatch = namePart.match(/^([a-z]+)\s+(.*)$/);
        if (wordMatch && WORD_NUMS[wordMatch[1]]) {
          qty = WORD_NUMS[wordMatch[1]];
          namePart = wordMatch[2];
        }
      }
    }

    // Strip units like "cups of", "slices of", "bowls of", "plates of", "pieces of"
    namePart = namePart.replace(/^(cups?|slices?|bowls?|plates?|tbsp|tsp|g|grams?|oz|scoops?|pieces?)\s*(?:of\s*)?/i, '').trim();

    // Match against staple food keywords (longest match first to prevent substring collision)
    let matchedKey = Object.keys(STAPLE_NUTRIENTS).sort((a, b) => b.length - a.length).find(k => namePart.includes(k));
    if (matchedKey) {
      const base = STAPLE_NUTRIENTS[matchedKey];
      const c = Math.round(base.cals * qty);
      const p = Math.round(base.p * qty * 10) / 10;
      const cb = Math.round(base.c * qty * 10) / 10;
      const f = Math.round(base.f * qty * 10) / 10;
      const fiber = base.fiber ? Math.round(base.fiber * qty * 10) / 10 : 0;

      items.push({
        name: base.name,
        category: base.category,
        description: base.description,
        displayName: `${qty > 1 ? qty + 'x ' : ''}${base.name}`,
        qty: qty,
        unit: base.servingUnit || 'serving',
        grams: base.grams ? Math.round(base.grams * qty) : Math.round(qty * 100),
        cals: c,
        p,
        c: cb,
        netCarbs: cb,
        f,
        fiber
      });

      totalCals += c;
      totalP += p;
      totalC += cb;
      totalF += f;
    }
  }

  return {
    meal,
    items,
    totalCals,
    totalP: Math.round(totalP * 10) / 10,
    totalC: Math.round(totalC * 10) / 10,
    totalF: Math.round(totalF * 10) / 10
  };
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
    incomingText = (req.body && req.body.Body) || (req.query && req.query.text) || '';
  }

  if (!incomingText) {
    if (isMeta) {
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
      result.items.map(it => `• ${it.displayName}: ${it.cals} kcal (P: ${it.p}g, C: ${it.c}g, F: ${it.f}g)\n  ${it.description}`).join('\n') +
      `\n━━━━━━━━━━━━━━━━━━━━━\n` +
      `📊 Meal Total: ${result.totalCals} kcal\n🥩 Protein: ${result.totalP}g | 🍞 Carbs: ${result.totalC}g | 🥑 Fat: ${result.totalF}g\n` +
      `🎯 Remaining allowance: ~${Math.max(0, 2000 - result.totalCals)} kcal\n\n✨ Added to your NutriTrack dashboard!`;

    // Save to Vercel KV / Upstash Redis for multi-device sync
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;
    if (kvUrl && kvToken) {
      try {
        const todayDate = new Date().toISOString().split('T')[0];
        const dayKey = `nutritrack_day_${todayDate}`;

        const mealRecord = {
          id: `wa_msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          date: todayDate,
          meal: result.meal,
          items: result.items,
          timestamp: Date.now()
        };

        // Fetch current day meals from Upstash KV, append, and persist
        const getRes = await fetch(`${kvUrl}/get/${dayKey}`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        const getData = await getRes.json();
        let currentMeals = [];
        if (getData && getData.result) {
          try {
            currentMeals = typeof getData.result === 'string' ? JSON.parse(getData.result) : getData.result;
          } catch(e) {}
        }
        currentMeals.push(mealRecord);

        // Save persistent multi-device day state
        await fetch(`${kvUrl}/set/${dayKey}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${kvToken}` },
          body: JSON.stringify(currentMeals)
        });

        // Also push to legacy pending queue for backwards compatibility
        await fetch(`${kvUrl}/rpush/nutritrack_pending_meals`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${kvToken}` },
          body: JSON.stringify(mealRecord)
        });
        console.log('Saved WhatsApp meal to Upstash KV persistent store for multi-device sync');
      } catch (kvErr) {
        console.error('Failed to save meal to Upstash KV:', kvErr);
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
