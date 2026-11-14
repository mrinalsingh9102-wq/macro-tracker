// Natural Language Chat / Text Parser for Conversational Macro Logging

const MEAL_KEYWORDS = {
  breakfast: ['breakfast', 'morning', 'bkfast'],
  lunch: ['lunch', 'noon', 'midday'],
  dinner: ['dinner', 'supper', 'evening'],
  snacks: ['snack', 'snacks', 'dessert', 'treat', 'preworkout', 'postworkout'],
};

const UNIT_CONVERSIONS = {
  g: { grams: 1, label: 'g' },
  gram: { grams: 1, label: 'g' },
  grams: { grams: 1, label: 'g' },
  oz: { grams: 28.3495, label: 'oz' },
  ounce: { grams: 28.3495, label: 'oz' },
  ounces: { grams: 28.3495, label: 'oz' },
  lb: { grams: 453.592, label: 'lb' },
  lbs: { grams: 453.592, label: 'lb' },
  pound: { grams: 453.592, label: 'lb' },
  pounds: { grams: 453.592, label: 'lb' },
  kg: { grams: 1000, label: 'kg' },
  ml: { grams: 1, label: 'ml' },
  cup: { grams: 240, label: 'cup' },
  cups: { grams: 240, label: 'cup' },
  tbsp: { grams: 15, label: 'tbsp' },
  tablespoon: { grams: 15, label: 'tbsp' },
  tablespoons: { grams: 15, label: 'tbsp' },
  tsp: { grams: 5, label: 'tsp' },
  teaspoon: { grams: 5, label: 'tsp' },
  teaspoons: { grams: 5, label: 'tsp' },
  slice: { grams: 35, label: 'slice' },
  slices: { grams: 35, label: 'slice' },
  scoop: { grams: 30, label: 'scoop' },
  scoops: { grams: 30, label: 'scoop' },
  can: { grams: 350, label: 'can' },
  cans: { grams: 350, label: 'can' },
  piece: { grams: 80, label: 'piece' },
  pieces: { grams: 80, label: 'piece' },
  egg: { grams: 50, label: 'egg' },
  eggs: { grams: 50, label: 'egg' },
  large: { grams: 50, label: 'large' },
  medium: { grams: 120, label: 'medium' },
  small: { grams: 80, label: 'small' },
};

function parseFraction(str) {
  if (!str) return 1;
  str = str.trim();
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
    }
  }
  const val = parseFloat(str);
  return isNaN(val) ? 1 : val;
}

function detectMeal(text, defaultMeal = 'breakfast') {
  const lower = text.toLowerCase();
  for (const [meal, keywords] of Object.entries(MEAL_KEYWORDS)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(lower)) {
        return meal;
      }
    }
  }
  return defaultMeal;
}

// Parse natural food entry line (supports raw text, chat dumps, and WhatsApp exports)
function parseFoodLine(rawLine) {
  let line = rawLine.trim();
  if (!line) return null;

  // Clean WhatsApp timestamps & sender names
  // e.g. "[10:15 AM, 12/11/2026] Name: 3 eggs" or "10:15 AM - Name: 3 eggs"
  line = line.replace(/^\[?\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?(?:,\s*\d{1,2}\/\d{1,2}\/\d{2,4})?\]?\s*[-–:]?\s*(?:[^:]+:\s*)?/i, '');
  line = line.replace(/^\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:[AP]M)?\s*[-–:]?\s*(?:[^:]+:\s*)?/i, '');

  // Clean out common prefixes like "for lunch", "breakfast:", "- ", "1. ", etc.
  line = line.replace(/^(breakfast|lunch|dinner|snacks?):\s*/i, '');
  line = line.replace(/^(for\s+(breakfast|lunch|dinner|snacks?))\s*,?:?\s*/i, '');
  line = line.replace(/^[\s*\-•\d+.\)]+\s*/, '').trim();

  // Match numbers and fractions at start: "2", "1.5", "1/2", "2 1/2", "150"
  let quantity = 1;
  let unit = 'serving';
  let foodName = line;

  const qtyMatch = line.match(/^(\d+(?:\.\d+)?|\d+\s*\/\s*\d+|\d+\s+\d+\/\d+)\s*(.*)$/);
  if (qtyMatch) {
    const rawQty = qtyMatch[1].trim();
    if (rawQty.includes(' ') && rawQty.includes('/')) {
      const [whole, frac] = rawQty.split(/\s+/);
      quantity = parseFloat(whole) + parseFraction(frac);
    } else if (rawQty.includes('/')) {
      quantity = parseFraction(rawQty);
    } else {
      quantity = parseFloat(rawQty) || 1;
    }

    let remainder = qtyMatch[2].trim();

    // Check if next word is a known unit
    const words = remainder.split(/\s+/);
    if (words.length > 0) {
      const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, '');
      if (UNIT_CONVERSIONS[firstWord]) {
        unit = firstWord;
        remainder = words.slice(1).join(' ').trim();
      } else if (words.length > 1 && `${words[0]} ${words[1]}`.toLowerCase() === 'large egg') {
        unit = 'large egg';
        remainder = words.slice(2).join(' ').trim();
      }
    }
    // Remove leading prepositions like "of" ("1 cup of oats" -> "oats")
    remainder = remainder.replace(/^of\s+/i, '').trim();
    foodName = remainder || line;
  } else {
    // Check if line ends with quantity e.g. "chicken breast 150g"
    const endMatch = line.match(/^(.*?)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
    if (endMatch) {
      foodName = endMatch[1].trim();
      quantity = parseFloat(endMatch[2]) || 1;
      unit = endMatch[3] ? endMatch[3].toLowerCase() : 'g';
    }
  }

  // Calculate estimated grams
  let grams = 100;
  if (UNIT_CONVERSIONS[unit]) {
    grams = quantity * UNIT_CONVERSIONS[unit].grams;
  } else {
    grams = quantity * 100;
  }

  return {
    raw: rawLine,
    foodName: foodName || line,
    quantity,
    unit,
    estimatedGrams: Math.round(grams)
  };
}

// Parse entire natural text block (supports multiple items, commas, bullet lists, etc.)
async function parseChatText(text, defaultMeal = 'breakfast') {
  if (!text || !text.trim()) return { meal: defaultMeal, items: [] };

  const meal = detectMeal(text, defaultMeal);

  // Split by newlines, semicolons, or commas (unless comma inside brackets)
  const rawSegments = text
    .split(/\n|;|\band\b|,\s*(?=\d|\w+\s+(?:cups?|tbsp|tsp|oz|grams?|g|slices?|eggs?|pieces?))/i)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const parsedItems = [];

  for (const seg of rawSegments) {
    // Skip mere meal headers like "Breakfast:" or "Lunch"
    if (/^(breakfast|lunch|dinner|snacks?):?$/i.test(seg)) continue;

    const parsed = parseFoodLine(seg);
    if (!parsed || !parsed.foodName) continue;

    // Search local or USDA database to match food
    let matchedFood = null;

    // 1. Check local staples
    matchedFood = window.UsdaApi.findFoodOffline(parsed.foodName);

    // 2. If no local staple match, try USDA search
    if (!matchedFood) {
      try {
        const searchResults = await window.UsdaApi.searchFoods({
          query: parsed.foodName,
          apiKey: localStorage.getItem('usda_api_key') || '',
          pageSize: 3
        });
        if (searchResults && searchResults.length > 0) {
          matchedFood = searchResults[0];
        }
      } catch (e) {
        console.warn('USDA search in chat parser failed:', e);
      }
    }

    // Fallback placeholder food if not found
    if (!matchedFood) {
      matchedFood = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: parsed.foodName.charAt(0).toUpperCase() + parsed.foodName.slice(1),
        category: 'Custom Entry',
        servingSizeGrams: parsed.estimatedGrams,
        servingUnit: `${parsed.quantity} ${parsed.unit}`,
        nutrientsPer100g: {
          calories: 120, // estimated default
          protein: 8,
          carbs: 12,
          netCarbs: 10,
          fat: 4,
          fiber: 2,
          sodium: 150,
          potassium: 200,
        }
      };
    }

    // Scale nutrients for estimated grams
    const scaledNutrients = window.UsdaApi.scaleNutrients(matchedFood.nutrientsPer100g, parsed.estimatedGrams);

    parsedItems.push({
      foodId: matchedFood.id,
      name: matchedFood.name,
      category: matchedFood.category,
      quantity: parsed.quantity,
      unit: parsed.unit,
      grams: parsed.estimatedGrams,
      nutrients: scaledNutrients,
      matchedFood: matchedFood,
      originalText: seg,
    });
  }

  return {
    meal,
    items: parsedItems
  };
}

window.ChatParser = {
  detectMeal,
  parseFoodLine,
  parseChatText,
  UNIT_CONVERSIONS,
};
