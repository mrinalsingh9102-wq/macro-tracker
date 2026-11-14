// USDA FoodData Central Integration & Enhanced Comprehensive Offline Database

// USDA Nutrient ID Mapping Table
const USDA_NUTRIENT_MAP = {
  1008: 'calories',        // Energy (kcal)
  1003: 'protein',         // Protein (g)
  1004: 'fat',             // Total lipid (fat) (g)
  1005: 'carbs',           // Carbohydrate, by difference (g)
  1079: 'fiber',           // Fiber, total dietary (g)
  2000: 'sugars',          // Sugars, total (g)
  1235: 'addedSugars',     // Sugars, added (g)
  1258: 'saturatedFat',    // Fatty acids, total saturated (g)
  1292: 'monounsaturatedFat', // Fatty acids, total monounsaturated (g)
  1293: 'polyunsaturatedFat', // Fatty acids, total polyunsaturated (g)
  1253: 'cholesterol',     // Cholesterol (mg)
  1093: 'sodium',          // Sodium (mg)
  1092: 'potassium',       // Potassium (mg)
  1087: 'calcium',         // Calcium (mg)
  1089: 'iron',            // Iron (mg)
  1090: 'magnesium',       // Magnesium (mg)
  1091: 'phosphorus',      // Phosphorus (mg)
  1095: 'zinc',            // Zinc (mg)
  1098: 'copper',          // Copper (mg)
  1101: 'manganese',       // Manganese (mg)
  1103: 'selenium',        // Selenium (mcg)
  1106: 'vitaminA',        // Vitamin A, RAE (mcg)
  1162: 'vitaminC',        // Vitamin C (mg)
  1114: 'vitaminD',        // Vitamin D (D2 + D3) (mcg)
  1109: 'vitaminE',        // Vitamin E (mg)
  1185: 'vitaminK',        // Vitamin K (mcg)
  1165: 'thiamin',         // Thiamin B1 (mg)
  1166: 'riboflavin',      // Riboflavin B2 (mg)
  1167: 'niacin',          // Niacin B3 (mg)
  1175: 'vitaminB6',       // Vitamin B-6 (mg)
  1177: 'folate',          // Folate (mcg)
  1178: 'vitaminB12',      // Vitamin B-12 (mcg)
  1051: 'water',           // Water (g)
};

// Comprehensive Built-in Food & Supplement Database (100% offline, zero-lag, no API key needed)
const STAPLE_FOODS = [
  // ==========================================
  // BEVERAGES, COFFEE & TEA
  // ==========================================
  {
    id: 'staple-coffee-black',
    name: 'Coffee, brewed, black (regular or decaf)',
    aliases: ['coffee', 'black coffee', 'drip coffee', 'americano', 'caffeine'],
    category: 'Beverages',
    servingSizeGrams: 240,
    servingUnit: '1 cup (8 fl oz / 240ml)',
    householdServings: [
      { name: '1 cup / mug (240ml)', grams: 240 },
      { name: '1 large mug (350ml)', grams: 350 },
      { name: '100 grams / ml', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 1,
      protein: 0.12,
      carbs: 0.0,
      netCarbs: 0.0,
      fiber: 0.0,
      fat: 0.02,
      sugars: 0.0,
      sodium: 2,
      potassium: 49,
      magnesium: 3,
      calcium: 2,
      niacin: 0.2
    }
  },
  {
    id: 'staple-espresso',
    name: 'Espresso, brewed, single or double shot',
    aliases: ['espresso', 'coffee shot', 'nespresso'],
    category: 'Beverages',
    servingSizeGrams: 30,
    servingUnit: '1 shot (30ml)',
    householdServings: [
      { name: '1 single shot (30ml)', grams: 30 },
      { name: '1 double shot (60ml)', grams: 60 },
      { name: '100 grams / ml', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 9,
      protein: 0.1,
      carbs: 1.7,
      netCarbs: 1.7,
      fiber: 0,
      fat: 0.2,
      sodium: 14,
      potassium: 115,
      magnesium: 80
    }
  },
  {
    id: 'staple-coffee-with-milk',
    name: 'Coffee with Whole Milk / Flat White / Latte',
    aliases: ['latte', 'cappuccino', 'flat white', 'coffee milk', 'coffee with milk'],
    category: 'Beverages',
    servingSizeGrams: 240,
    servingUnit: '1 cup (240ml)',
    householdServings: [
      { name: '1 cup (240ml)', grams: 240 },
      { name: '100 ml', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 33,
      protein: 1.8,
      carbs: 2.8,
      netCarbs: 2.8,
      fiber: 0,
      fat: 1.8,
      sugars: 2.7,
      calcium: 65,
      sodium: 25,
      potassium: 110
    }
  },
  {
    id: 'staple-tea-green',
    name: 'Green Tea, brewed, unsweetened',
    aliases: ['green tea', 'tea', 'matcha tea'],
    category: 'Beverages',
    servingSizeGrams: 240,
    servingUnit: '1 cup (240ml)',
    householdServings: [
      { name: '1 cup (240ml)', grams: 240 },
      { name: '100 ml', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 1,
      protein: 0,
      carbs: 0.2,
      netCarbs: 0.2,
      fiber: 0,
      fat: 0,
      potassium: 18,
      magnesium: 1
    }
  },

  // ==========================================
  // MILK & DAIRY / PLANT MILKS
  // ==========================================
  {
    id: 'staple-milk-whole',
    name: 'Milk, whole (3.25% milkfat)',
    aliases: ['milk', 'whole milk', 'cow milk', 'full cream milk'],
    category: 'Dairy and Egg Products',
    servingSizeGrams: 244,
    servingUnit: '1 cup (244g / 240ml)',
    householdServings: [
      { name: '1 cup (244g)', grams: 244 },
      { name: '1/2 cup (122g)', grams: 122 },
      { name: '1 splash / tbsp (15g)', grams: 15 },
      { name: '100 grams / ml', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 61,
      protein: 3.15,
      carbs: 4.78,
      netCarbs: 4.78,
      fiber: 0,
      fat: 3.27,
      saturatedFat: 1.86,
      sugars: 5.05,
      calcium: 113,
      potassium: 132,
      sodium: 43,
      vitaminD: 1.2,
      vitaminB12: 0.45
    }
  },
  {
    id: 'staple-milk-2percent',
    name: 'Milk, 2% reduced fat',
    aliases: ['2% milk', 'reduced fat milk', 'semi skimmed milk', 'milk 2%'],
    category: 'Dairy and Egg Products',
    servingSizeGrams: 244,
    servingUnit: '1 cup (244g)',
    householdServings: [
      { name: '1 cup (244g)', grams: 244 },
      { name: '1/2 cup (122g)', grams: 122 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 50,
      protein: 3.3,
      carbs: 4.8,
      netCarbs: 4.8,
      fiber: 0,
      fat: 1.98,
      saturatedFat: 1.25,
      sugars: 4.9,
      calcium: 120,
      potassium: 150,
      sodium: 47,
      vitaminD: 1.3
    }
  },
  {
    id: 'staple-milk-skim',
    name: 'Milk, nonfat / skim (0% fat)',
    aliases: ['skim milk', 'fat free milk', 'nonfat milk', '0% milk'],
    category: 'Dairy and Egg Products',
    servingSizeGrams: 244,
    servingUnit: '1 cup (244g)',
    householdServings: [
      { name: '1 cup (244g)', grams: 244 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 34,
      protein: 3.4,
      carbs: 4.96,
      netCarbs: 4.96,
      fiber: 0,
      fat: 0.08,
      sugars: 5.0,
      calcium: 122,
      potassium: 156,
      sodium: 52,
      vitaminD: 1.3
    }
  },
  {
    id: 'staple-milk-almond',
    name: 'Almond Milk, unsweetened (plain / vanilla)',
    aliases: ['almond milk', 'unsweetened almond milk', 'almondmilk'],
    category: 'Dairy Alternatives',
    servingSizeGrams: 240,
    servingUnit: '1 cup (240ml)',
    householdServings: [
      { name: '1 cup (240ml)', grams: 240 },
      { name: '1/2 cup (120ml)', grams: 120 },
      { name: '100 ml', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 15,
      protein: 0.55,
      carbs: 0.34,
      netCarbs: 0.14,
      fiber: 0.2,
      fat: 1.1,
      saturatedFat: 0.1,
      calcium: 184,
      potassium: 67,
      sodium: 71,
      vitaminE: 3.2,
      vitaminD: 1.0
    }
  },
  {
    id: 'staple-milk-oat',
    name: 'Oat Milk, original / barista edition',
    aliases: ['oat milk', 'oatmilk', 'oatly', 'barista oat milk'],
    category: 'Dairy Alternatives',
    servingSizeGrams: 240,
    servingUnit: '1 cup (240ml)',
    householdServings: [
      { name: '1 cup (240ml)', grams: 240 },
      { name: '1/2 cup (120ml)', grams: 120 },
      { name: '100 ml', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 50,
      protein: 1.25,
      carbs: 6.67,
      netCarbs: 5.84,
      fiber: 0.83,
      fat: 2.08,
      sugars: 2.9,
      calcium: 146,
      potassium: 162,
      sodium: 42,
      vitaminD: 1.2
    }
  },
  {
    id: 'staple-milk-soy',
    name: 'Soy Milk, unsweetened / plain',
    aliases: ['soy milk', 'soymilk'],
    category: 'Dairy Alternatives',
    servingSizeGrams: 240,
    servingUnit: '1 cup (240ml)',
    householdServings: [
      { name: '1 cup (240ml)', grams: 240 },
      { name: '100 ml', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 33,
      protein: 2.8,
      carbs: 1.6,
      netCarbs: 1.1,
      fiber: 0.5,
      fat: 1.6,
      calcium: 120,
      potassium: 140,
      sodium: 38
    }
  },
  {
    id: 'staple-heavy-cream',
    name: 'Heavy Cream / Heavy Whipping Cream',
    aliases: ['heavy cream', 'whipping cream', 'double cream'],
    category: 'Dairy and Egg Products',
    servingSizeGrams: 15,
    servingUnit: '1 tbsp (15ml)',
    householdServings: [
      { name: '1 tbsp (15g)', grams: 15 },
      { name: '2 tbsp (30g)', grams: 30 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 340,
      protein: 2.8,
      carbs: 2.7,
      netCarbs: 2.7,
      fiber: 0,
      fat: 36.1,
      saturatedFat: 23.0,
      cholesterol: 137,
      calcium: 65,
      sodium: 38
    }
  },

  // ==========================================
  // SUPPLEMENTS & FITNESS NUTRITION
  // ==========================================
  {
    id: 'staple-creatine-monohydrate',
    name: 'Creatine Monohydrate Powder (Creapure / Micronized)',
    aliases: ['creatine', 'creatine monohydrate', 'creapure', 'micronized creatine'],
    category: 'Sports Nutrition',
    servingSizeGrams: 5,
    servingUnit: '1 scoop / tsp (5g)',
    householdServings: [
      { name: '1 standard scoop (5g)', grams: 5 },
      { name: '1 loading dose (10g)', grams: 10 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 0,
      protein: 0.0,
      carbs: 0.0,
      netCarbs: 0.0,
      fiber: 0.0,
      fat: 0.0,
      sodium: 0,
      potassium: 0
    }
  },
  {
    id: 'staple-whey-protein',
    name: 'Whey Protein Isolate Powder (Vanilla / Chocolate)',
    aliases: ['whey', 'protein powder', 'whey isolate', 'whey protein', 'protein shake'],
    category: 'Sports Nutrition',
    servingSizeGrams: 30,
    servingUnit: '1 scoop (30g)',
    householdServings: [
      { name: '1 scoop (30g)', grams: 30 },
      { name: '2 scoops (60g)', grams: 60 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 370,
      protein: 82.0,
      carbs: 3.3,
      netCarbs: 2.3,
      fiber: 1.0,
      fat: 1.5,
      saturatedFat: 0.8,
      sugars: 1.0,
      sodium: 170,
      potassium: 450,
      calcium: 400,
      magnesium: 60,
      iron: 1.2
    }
  },
  {
    id: 'staple-casein-protein',
    name: 'Casein Protein Powder (Micellar Casein)',
    aliases: ['casein', 'micellar casein', 'nighttime protein'],
    category: 'Sports Nutrition',
    servingSizeGrams: 32,
    servingUnit: '1 scoop (32g)',
    householdServings: [
      { name: '1 scoop (32g)', grams: 32 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 360,
      protein: 75.0,
      carbs: 6.0,
      netCarbs: 5.0,
      fiber: 1.0,
      fat: 2.0,
      calcium: 1500,
      sodium: 250,
      potassium: 300
    }
  },
  {
    id: 'staple-preworkout',
    name: 'Pre-Workout Powder (Caffeine + Beta-Alanine + Citrulline)',
    aliases: ['preworkout', 'pre workout', 'c4', 'pre-workout'],
    category: 'Sports Nutrition',
    servingSizeGrams: 10,
    servingUnit: '1 scoop (10g)',
    householdServings: [
      { name: '1 scoop (10g)', grams: 10 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 50,
      protein: 0.0,
      carbs: 10.0,
      netCarbs: 10.0,
      fiber: 0.0,
      fat: 0.0,
      sodium: 300,
      potassium: 150
    }
  },
  {
    id: 'staple-fish-oil',
    name: 'Fish Oil Softgel (Omega-3 1000mg / EPA & DHA)',
    aliases: ['fish oil', 'omega 3', 'omega-3', 'dha epa'],
    category: 'Sports Nutrition',
    servingSizeGrams: 1.4,
    servingUnit: '1 softgel (1.4g)',
    householdServings: [
      { name: '1 softgel (1.4g)', grams: 1.4 },
      { name: '2 softgels (2.8g)', grams: 2.8 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 900,
      protein: 0,
      carbs: 0,
      netCarbs: 0,
      fiber: 0,
      fat: 100,
      omega3: 30.0,
      cholesterol: 500
    }
  },
  {
    id: 'staple-electrolyte-powder',
    name: 'Electrolyte Hydration Drink Mix (LMNT / Liquid IV style)',
    aliases: ['electrolyte', 'electrolytes', 'lmnt', 'liquid iv', 'hydration'],
    category: 'Sports Nutrition',
    servingSizeGrams: 6,
    servingUnit: '1 packet / scoop (6g)',
    householdServings: [
      { name: '1 packet (6g)', grams: 6 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 80,
      protein: 0,
      carbs: 20,
      netCarbs: 20,
      fiber: 0,
      fat: 0,
      sodium: 16500, // LMNT style high sodium
      potassium: 3300,
      magnesium: 1000
    }
  },

  // ==========================================
  // PROTEINS, EGGS, MEATS & SEAFOOD
  // ==========================================
  {
    id: 'staple-egg-large',
    name: 'Egg, whole, raw or cooked',
    aliases: ['egg', 'eggs', 'whole egg', 'boiled egg', 'fried egg', 'scrambled egg'],
    category: 'Dairy and Egg Products',
    servingSizeGrams: 50,
    servingUnit: '1 large egg (50g)',
    householdServings: [
      { name: '1 large egg', grams: 50 },
      { name: '2 large eggs', grams: 100 },
      { name: '3 large eggs', grams: 150 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 143,
      protein: 12.6,
      carbs: 0.72,
      netCarbs: 0.72,
      fiber: 0,
      fat: 9.51,
      saturatedFat: 3.1,
      monounsaturatedFat: 3.7,
      polyunsaturatedFat: 1.9,
      cholesterol: 372,
      sugars: 0.37,
      sodium: 142,
      potassium: 138,
      calcium: 56,
      iron: 1.75,
      magnesium: 12,
      phosphorus: 198,
      zinc: 1.29,
      selenium: 30.7,
      vitaminA: 160,
      vitaminD: 2.0,
      vitaminE: 1.05,
      vitaminB12: 0.89,
      folate: 47,
      riboflavin: 0.457,
      thiamin: 0.04,
      niacin: 0.075,
      vitaminB6: 0.17
    }
  },
  {
    id: 'staple-egg-whites',
    name: 'Egg Whites, liquid or cooked',
    aliases: ['egg white', 'egg whites', 'liquid egg whites'],
    category: 'Dairy and Egg Products',
    servingSizeGrams: 100,
    servingUnit: '100g (approx 3 whites)',
    householdServings: [
      { name: '100 grams / ml', grams: 100 },
      { name: '1 white (33g)', grams: 33 },
      { name: '1 cup liquid (243g)', grams: 243 }
    ],
    nutrientsPer100g: {
      calories: 52,
      protein: 10.9,
      carbs: 0.73,
      netCarbs: 0.73,
      fiber: 0,
      fat: 0.17,
      sodium: 166,
      potassium: 163,
      calcium: 7,
      magnesium: 11
    }
  },
  {
    id: 'staple-chicken-breast',
    name: 'Chicken Breast, boneless, skinless, cooked / grilled',
    aliases: ['chicken', 'chicken breast', 'grilled chicken', 'baked chicken'],
    category: 'Poultry Products',
    servingSizeGrams: 100,
    servingUnit: '100g serving',
    householdServings: [
      { name: '100 grams', grams: 100 },
      { name: '1 breast (approx 174g)', grams: 174 },
      { name: '1 oz (28.35g)', grams: 28.35 },
      { name: '4 oz cooked (113g)', grams: 113.4 },
      { name: '6 oz cooked (170g)', grams: 170 }
    ],
    nutrientsPer100g: {
      calories: 165,
      protein: 31.0,
      carbs: 0.0,
      netCarbs: 0.0,
      fiber: 0,
      fat: 3.57,
      saturatedFat: 1.01,
      monounsaturatedFat: 1.25,
      polyunsaturatedFat: 0.77,
      cholesterol: 85,
      sodium: 74,
      potassium: 256,
      calcium: 15,
      iron: 1.04,
      magnesium: 29,
      phosphorus: 228,
      zinc: 1.0,
      selenium: 27.6,
      niacin: 13.7,
      vitaminB6: 0.6,
      vitaminB12: 0.34
    }
  },
  {
    id: 'staple-ground-beef-90-10',
    name: 'Ground Beef, 90% lean / 10% fat, pan-browned',
    aliases: ['beef', 'ground beef', '90/10 beef', 'mince', 'hamburger'],
    category: 'Beef Products',
    servingSizeGrams: 100,
    servingUnit: '100g cooked',
    householdServings: [
      { name: '100 grams', grams: 100 },
      { name: '4 oz cooked (113g)', grams: 113.4 },
      { name: '1 patty (85g)', grams: 85 }
    ],
    nutrientsPer100g: {
      calories: 217,
      protein: 26.1,
      carbs: 0.0,
      netCarbs: 0.0,
      fiber: 0,
      fat: 11.8,
      saturatedFat: 4.7,
      monounsaturatedFat: 4.8,
      polyunsaturatedFat: 0.45,
      cholesterol: 86,
      sodium: 71,
      potassium: 351,
      iron: 2.7,
      zinc: 6.1,
      vitaminB12: 2.6
    }
  },
  {
    id: 'staple-salmon-atlantic',
    name: 'Atlantic Salmon, wild or farmed, cooked',
    aliases: ['salmon', 'fish', 'atlantic salmon', 'salmon fillet'],
    category: 'Finfish and Shellfish Products',
    servingSizeGrams: 100,
    servingUnit: '100g fillet',
    householdServings: [
      { name: '100 grams', grams: 100 },
      { name: '1 fillet (154g)', grams: 154 },
      { name: '4 oz (113.4g)', grams: 113.4 }
    ],
    nutrientsPer100g: {
      calories: 206,
      protein: 22.1,
      carbs: 0.0,
      netCarbs: 0.0,
      fiber: 0,
      fat: 12.35,
      saturatedFat: 2.5,
      monounsaturatedFat: 4.8,
      polyunsaturatedFat: 4.4,
      omega3: 2.2,
      cholesterol: 63,
      sodium: 61,
      potassium: 384,
      calcium: 12,
      iron: 0.8,
      magnesium: 30,
      phosphorus: 252,
      selenium: 41.4,
      vitaminD: 11.0,
      vitaminB12: 3.2,
      niacin: 8.5
    }
  },
  {
    id: 'staple-tuna-canned',
    name: 'Tuna, canned in water, drained',
    aliases: ['tuna', 'canned tuna', 'chunk light tuna', 'albacore'],
    category: 'Finfish and Shellfish Products',
    servingSizeGrams: 100,
    servingUnit: '1 can drained (112g)',
    householdServings: [
      { name: '1 can drained (112g)', grams: 112 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 116,
      protein: 25.5,
      carbs: 0.0,
      netCarbs: 0.0,
      fiber: 0,
      fat: 0.8,
      saturatedFat: 0.2,
      sodium: 338,
      potassium: 237,
      selenium: 80.4,
      vitaminB12: 2.99,
      niacin: 13.3
    }
  },
  {
    id: 'staple-greek-yogurt',
    name: 'Greek Yogurt, plain, nonfat (0%)',
    aliases: ['greek yogurt', 'yogurt', 'nonfat yogurt', 'chobani', 'fage'],
    category: 'Dairy and Egg Products',
    servingSizeGrams: 170,
    servingUnit: '1 container / cup (170g)',
    householdServings: [
      { name: '1 container (170g)', grams: 170 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 59,
      protein: 10.19,
      carbs: 3.6,
      netCarbs: 3.6,
      fiber: 0,
      fat: 0.39,
      sugars: 3.24,
      sodium: 36,
      potassium: 141,
      calcium: 110,
      phosphorus: 135,
      vitaminB12: 0.75,
      riboflavin: 0.28
    }
  },

  // ==========================================
  // CARBOHYDRATES, BREADS & GRAINS
  // ==========================================
  {
    id: 'staple-oats-rolled',
    name: 'Rolled Oats, dry / raw (Oatmeal)',
    aliases: ['oats', 'oatmeal', 'rolled oats', 'porridge', 'quaker oats'],
    category: 'Cereal Grains and Pasta',
    servingSizeGrams: 40,
    servingUnit: '1/2 cup dry (40g)',
    householdServings: [
      { name: '1/2 cup dry (40g)', grams: 40 },
      { name: '1 cup dry (80g)', grams: 80 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      netCarbs: 55.7,
      fiber: 10.6,
      fat: 6.9,
      saturatedFat: 1.2,
      monounsaturatedFat: 2.2,
      polyunsaturatedFat: 2.5,
      sugars: 0.99,
      sodium: 6,
      potassium: 429,
      calcium: 54,
      iron: 4.72,
      magnesium: 177,
      phosphorus: 523,
      zinc: 3.97,
      thiamin: 0.763,
      folate: 56
    }
  },
  {
    id: 'staple-white-rice',
    name: 'White Rice, Jasmine / Long grain, cooked',
    aliases: ['rice', 'white rice', 'jasmine rice', 'basmati rice'],
    category: 'Cereal Grains and Pasta',
    servingSizeGrams: 158,
    servingUnit: '1 cup cooked (158g)',
    householdServings: [
      { name: '1 cup cooked (158g)', grams: 158 },
      { name: '100 grams', grams: 100 },
      { name: '1/2 cup (79g)', grams: 79 }
    ],
    nutrientsPer100g: {
      calories: 130,
      protein: 2.69,
      carbs: 28.17,
      netCarbs: 27.77,
      fiber: 0.4,
      fat: 0.28,
      sugars: 0.05,
      sodium: 1,
      potassium: 35,
      calcium: 10,
      iron: 1.2,
      magnesium: 12,
      phosphorus: 43,
      folate: 58,
      thiamin: 0.16
    }
  },
  {
    id: 'staple-bread-whole-wheat',
    name: 'Whole Wheat Bread, sliced',
    aliases: ['bread', 'whole wheat bread', 'toast', 'wheat bread'],
    category: 'Baked Products',
    servingSizeGrams: 32,
    servingUnit: '1 slice (32g)',
    householdServings: [
      { name: '1 slice (32g)', grams: 32 },
      { name: '2 slices (64g)', grams: 64 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 247,
      protein: 12.0,
      carbs: 41.3,
      netCarbs: 34.5,
      fiber: 6.8,
      fat: 3.4,
      saturatedFat: 0.7,
      sugars: 5.6,
      sodium: 472,
      potassium: 254,
      calcium: 161,
      iron: 2.5,
      magnesium: 75
    }
  },
  {
    id: 'staple-sweet-potato',
    name: 'Sweet Potato, baked with skin',
    aliases: ['sweet potato', 'yam', 'baked sweet potato'],
    category: 'Vegetables and Vegetable Products',
    servingSizeGrams: 114,
    servingUnit: '1 medium sweet potato (114g)',
    householdServings: [
      { name: '1 medium (114g)', grams: 114 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 90,
      protein: 2.01,
      carbs: 20.71,
      netCarbs: 17.41,
      fiber: 3.3,
      fat: 0.15,
      sugars: 6.48,
      sodium: 36,
      potassium: 475,
      calcium: 38,
      magnesium: 27,
      vitaminA: 961,
      vitaminC: 19.6
    }
  },
  {
    id: 'staple-pasta',
    name: 'Pasta / Spaghetti, regular, cooked',
    aliases: ['pasta', 'spaghetti', 'noodles', 'penne'],
    category: 'Cereal Grains and Pasta',
    servingSizeGrams: 140,
    servingUnit: '1 cup cooked (140g)',
    householdServings: [
      { name: '1 cup cooked (140g)', grams: 140 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 158,
      protein: 5.8,
      carbs: 30.9,
      netCarbs: 29.1,
      fiber: 1.8,
      fat: 0.93,
      sodium: 1,
      potassium: 44,
      iron: 1.3
    }
  },

  // ==========================================
  // FRUITS & VEGETABLES
  // ==========================================
  {
    id: 'staple-banana',
    name: 'Banana, fresh, medium',
    aliases: ['banana', 'bananas', 'ripe banana'],
    category: 'Fruits and Fruit Juices',
    servingSizeGrams: 118,
    servingUnit: '1 medium banana (118g)',
    householdServings: [
      { name: '1 medium (118g)', grams: 118 },
      { name: '1 large (136g)', grams: 136 },
      { name: '1 small (101g)', grams: 101 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 89,
      protein: 1.09,
      carbs: 22.84,
      netCarbs: 20.24,
      fiber: 2.6,
      fat: 0.33,
      sugars: 12.23,
      sodium: 1,
      potassium: 358,
      magnesium: 27,
      vitaminC: 8.7,
      vitaminB6: 0.367,
      folate: 20
    }
  },
  {
    id: 'staple-apple',
    name: 'Apple, medium with skin',
    aliases: ['apple', 'apples', 'honeycrisp', 'fuji apple'],
    category: 'Fruits and Fruit Juices',
    servingSizeGrams: 182,
    servingUnit: '1 medium apple (182g)',
    householdServings: [
      { name: '1 medium (182g)', grams: 182 },
      { name: '1 large (223g)', grams: 223 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 52,
      protein: 0.26,
      carbs: 13.81,
      netCarbs: 11.41,
      fiber: 2.4,
      fat: 0.17,
      sugars: 10.39,
      potassium: 107,
      calcium: 6,
      vitaminC: 4.6
    }
  },
  {
    id: 'staple-blueberries',
    name: 'Blueberries, fresh, raw',
    aliases: ['blueberries', 'blueberry', 'berries'],
    category: 'Fruits and Fruit Juices',
    servingSizeGrams: 148,
    servingUnit: '1 cup (148g)',
    householdServings: [
      { name: '1 cup (148g)', grams: 148 },
      { name: '1/2 cup (74g)', grams: 74 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 57,
      protein: 0.74,
      carbs: 14.49,
      netCarbs: 12.09,
      fiber: 2.4,
      fat: 0.33,
      sugars: 9.96,
      potassium: 77,
      vitaminC: 9.7,
      vitaminK: 19.3
    }
  },
  {
    id: 'staple-broccoli',
    name: 'Broccoli, fresh or steamed',
    aliases: ['broccoli', 'steamed broccoli'],
    category: 'Vegetables and Vegetable Products',
    servingSizeGrams: 91,
    servingUnit: '1 cup chopped (91g)',
    householdServings: [
      { name: '1 cup chopped (91g)', grams: 91 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 34,
      protein: 2.82,
      carbs: 6.64,
      netCarbs: 4.04,
      fiber: 2.6,
      fat: 0.37,
      sugars: 1.7,
      sodium: 33,
      potassium: 316,
      calcium: 47,
      magnesium: 21,
      iron: 0.73,
      vitaminC: 89.2,
      vitaminK: 101.6,
      folate: 63
    }
  },
  {
    id: 'staple-spinach-fresh',
    name: 'Spinach, fresh, raw',
    aliases: ['spinach', 'baby spinach', 'raw spinach'],
    category: 'Vegetables and Vegetable Products',
    servingSizeGrams: 100,
    servingUnit: '100g (approx 3 cups)',
    householdServings: [
      { name: '100 grams', grams: 100 },
      { name: '1 cup raw (30g)', grams: 30 }
    ],
    nutrientsPer100g: {
      calories: 23,
      protein: 2.86,
      carbs: 3.63,
      netCarbs: 1.43,
      fiber: 2.2,
      fat: 0.39,
      iron: 2.71,
      calcium: 99,
      potassium: 558,
      magnesium: 79,
      vitaminA: 469,
      vitaminC: 28.1,
      vitaminK: 483,
      folate: 194
    }
  },
  {
    id: 'staple-avocado',
    name: 'Avocado, raw, California or Hass',
    aliases: ['avocado', 'hass avocado', 'guacamole'],
    category: 'Fruits and Fruit Juices',
    servingSizeGrams: 150,
    servingUnit: '1 medium avocado (150g)',
    householdServings: [
      { name: '1 medium whole (150g)', grams: 150 },
      { name: '1/2 avocado (75g)', grams: 75 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 160,
      protein: 2.0,
      carbs: 8.53,
      netCarbs: 1.83,
      fiber: 6.7,
      fat: 14.66,
      saturatedFat: 2.13,
      monounsaturatedFat: 9.8,
      polyunsaturatedFat: 1.82,
      sugars: 0.66,
      sodium: 7,
      potassium: 485,
      calcium: 12,
      magnesium: 29,
      iron: 0.55,
      folate: 81,
      vitaminC: 10,
      vitaminE: 2.07,
      vitaminK: 21
    }
  },

  // ==========================================
  // FATS, OILS, NUTS & CONDIMENTS
  // ==========================================
  {
    id: 'staple-olive-oil',
    name: 'Olive Oil, extra virgin',
    aliases: ['olive oil', 'evoo', 'oil'],
    category: 'Fats and Oils',
    servingSizeGrams: 14,
    servingUnit: '1 tbsp (14g)',
    householdServings: [
      { name: '1 tablespoon (14g)', grams: 14 },
      { name: '1 teaspoon (4.5g)', grams: 4.5 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 884,
      protein: 0,
      carbs: 0,
      netCarbs: 0,
      fiber: 0,
      fat: 100,
      saturatedFat: 13.8,
      monounsaturatedFat: 73.0,
      polyunsaturatedFat: 10.5,
      vitaminE: 14.3,
      vitaminK: 60.2,
      sodium: 2
    }
  },
  {
    id: 'staple-butter',
    name: 'Butter, salted or unsalted',
    aliases: ['butter', 'dairy butter'],
    category: 'Dairy and Egg Products',
    servingSizeGrams: 14,
    servingUnit: '1 tbsp (14g)',
    householdServings: [
      { name: '1 tablespoon (14g)', grams: 14 },
      { name: '1 pat / tsp (5g)', grams: 5 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 717,
      protein: 0.85,
      carbs: 0.06,
      netCarbs: 0.06,
      fiber: 0,
      fat: 81.1,
      saturatedFat: 51.4,
      cholesterol: 215,
      vitaminA: 684,
      sodium: 576
    }
  },
  {
    id: 'staple-peanut-butter',
    name: 'Peanut Butter, creamy or crunchy',
    aliases: ['peanut butter', 'pb', 'jif', 'natural peanut butter'],
    category: 'Legumes and Legume Products',
    servingSizeGrams: 32,
    servingUnit: '2 tbsp (32g)',
    householdServings: [
      { name: '2 tablespoons (32g)', grams: 32 },
      { name: '1 tablespoon (16g)', grams: 16 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 588,
      protein: 25.1,
      carbs: 20.0,
      netCarbs: 12.0,
      fiber: 8.0,
      fat: 50.4,
      saturatedFat: 10.1,
      monounsaturatedFat: 24.3,
      polyunsaturatedFat: 14.0,
      sugars: 4.1,
      sodium: 429,
      potassium: 649,
      magnesium: 168,
      iron: 1.9,
      niacin: 13.4,
      vitaminE: 9.0
    }
  },
  {
    id: 'staple-almonds',
    name: 'Almonds, raw / whole',
    aliases: ['almonds', 'almond', 'nuts'],
    category: 'Nut and Seed Products',
    servingSizeGrams: 28.35,
    servingUnit: '1 oz (23 almonds, 28g)',
    householdServings: [
      { name: '1 oz (28.35g)', grams: 28.35 },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: 579,
      protein: 21.15,
      carbs: 21.55,
      netCarbs: 9.05,
      fiber: 12.5,
      fat: 49.93,
      saturatedFat: 3.8,
      monounsaturatedFat: 31.5,
      polyunsaturatedFat: 12.3,
      sugars: 4.35,
      calcium: 269,
      iron: 3.71,
      magnesium: 270,
      potassium: 733,
      vitaminE: 25.6
    }
  }
];

// Helper to scale nutrients for given grams
function scaleNutrients(nutrientsPer100g, grams) {
  const factor = (grams || 100) / 100;
  const scaled = {};
  for (const [key, val] of Object.entries(nutrientsPer100g)) {
    if (typeof val === 'number') {
      scaled[key] = Math.round(val * factor * 100) / 100;
    } else {
      scaled[key] = val;
    }
  }
  return scaled;
}

// Smart Token-Based Scoring Function for Local Food Database
function scoreFoodMatch(food, query) {
  const cleanQ = query.toLowerCase().trim();
  const qTokens = cleanQ.split(/\s+/).filter(t => t.length > 0);
  if (qTokens.length === 0) return 0;

  const foodName = food.name.toLowerCase();
  const aliases = (food.aliases || []).map(a => a.toLowerCase());
  const category = (food.category || '').toLowerCase();

  let score = 0;

  // Exact match on alias or name is top priority
  if (foodName === cleanQ || aliases.includes(cleanQ)) {
    return 1000;
  }

  // Alias starts with or equals the query
  for (const a of aliases) {
    if (a === cleanQ) return 900;
    if (a.startsWith(cleanQ)) score = Math.max(score, 600);
    else if (a.includes(cleanQ)) score = Math.max(score, 400);
  }

  // Food name starts with query
  if (foodName.startsWith(cleanQ)) {
    score = Math.max(score, 500);
  } else if (foodName.includes(cleanQ)) {
    score = Math.max(score, 300);
  }

  // Check how many individual tokens match
  let tokensMatched = 0;
  for (const token of qTokens) {
    if (foodName.includes(token) || aliases.some(a => a.includes(token))) {
      tokensMatched++;
      score += 100;
    }
  }

  // Bonus if all words typed by user matched
  if (tokensMatched === qTokens.length) {
    score += 200;
  }

  // Category match bonus
  if (category.includes(cleanQ)) {
    score += 50;
  }

  return score;
}

// Convert a USDA FoodData Central Search Item into our normalized format
function parseUsdaFoodItem(fdcItem) {
  const nutrients100g = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    netCarbs: 0,
    fiber: 0,
    sugars: 0,
    sodium: 0,
    potassium: 0,
    calcium: 0,
    iron: 0,
    magnesium: 0,
    phosphorus: 0,
    zinc: 0,
    copper: 0,
    manganese: 0,
    selenium: 0,
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    vitaminE: 0,
    vitaminK: 0,
    thiamin: 0,
    riboflavin: 0,
    niacin: 0,
    vitaminB6: 0,
    folate: 0,
    vitaminB12: 0,
    saturatedFat: 0,
    monounsaturatedFat: 0,
    polyunsaturatedFat: 0,
    cholesterol: 0,
  };

  const foodNutrients = fdcItem.foodNutrients || [];
  
  foodNutrients.forEach(fn => {
    const key = USDA_NUTRIENT_MAP[fn.nutrientId] || USDA_NUTRIENT_MAP[parseInt(fn.nutrientNumber)];
    if (key && fn.value !== undefined) {
      nutrients100g[key] = Math.round(parseFloat(fn.value) * 100) / 100;
    }
  });

  // Calculate Net Carbs = Total Carbs - Fiber
  nutrients100g.netCarbs = Math.max(0, Math.round((nutrients100g.carbs - (nutrients100g.fiber || 0)) * 10) / 10);

  // Household servings
  const householdServings = [{ name: '100 grams', grams: 100 }];
  let defaultServingGrams = 100;
  let defaultServingUnit = '100g';

  if (fdcItem.servingSize && fdcItem.servingSizeUnit) {
    let g = fdcItem.servingSize;
    if (fdcItem.servingSizeUnit.toLowerCase() === 'ml') g = fdcItem.servingSize;
    const text = fdcItem.householdServingFullText || `${fdcItem.servingSize}${fdcItem.servingSizeUnit}`;
    householdServings.unshift({
      name: `${text} (${Math.round(g)}g)`,
      grams: Math.round(g)
    });
    defaultServingGrams = Math.round(g);
    defaultServingUnit = text;
  }

  if (Array.isArray(fdcItem.foodMeasures)) {
    fdcItem.foodMeasures.forEach(m => {
      if (m.gramWeight && m.disseminationText) {
        householdServings.push({
          name: `${m.disseminationText} (${Math.round(m.gramWeight)}g)`,
          grams: Math.round(m.gramWeight)
        });
      }
    });
  }

  const brand = fdcItem.brandName || fdcItem.brandOwner;
  const displayName = brand ? `${fdcItem.description} (${brand})` : fdcItem.description;

  return {
    id: `usda-${fdcItem.fdcId}`,
    fdcId: fdcItem.fdcId,
    name: displayName,
    category: fdcItem.foodCategory || fdcItem.dataType || 'General Food',
    dataType: fdcItem.dataType,
    servingSizeGrams: defaultServingGrams,
    servingUnit: defaultServingUnit,
    householdServings,
    nutrientsPer100g: nutrients100g,
    source: 'USDA'
  };
}

// Initialize Global 5,000+ Food Database from window.GLOBAL_FOODS_RAW
let GLOBAL_FOODS_LIST = [];

function initGlobalFoods() {
  if (Array.isArray(window.GLOBAL_FOODS_RAW)) {
    GLOBAL_FOODS_LIST = window.GLOBAL_FOODS_RAW.map(item => {
      const enName = (item.name && item.name.en) ? item.name.en : (item.name && item.name.fr ? item.name.fr : item.id);
      const cleanName = enName.charAt(0).toUpperCase() + enName.slice(1);
      const servingGrams = item.weight_per_unit || 100;
      const servingLabel = item.weight_per_unit ? `1 piece / serving (${item.weight_per_unit}g)` : '100g';
      
      const householdServings = [
        item.weight_per_unit ? { name: `1 piece (${item.weight_per_unit}g)`, grams: item.weight_per_unit } : null,
        { name: '100 grams', grams: 100 },
        { name: '1 oz (28.35g)', grams: 28.35 }
      ].filter(Boolean);

      const carbs = item.carbs_g || 0;
      const fiber = item.fiber_g || 0;
      const netCarbs = Math.max(0, Math.round((carbs - fiber) * 10) / 10);

      return {
        id: `global-${item.id}`,
        name: cleanName,
        category: item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : 'Global Database',
        servingSizeGrams: servingGrams,
        servingUnit: servingLabel,
        householdServings: householdServings,
        nutrientsPer100g: {
          calories: item.kcal_per_100g || 0,
          protein: item.protein_g || 0,
          fat: item.fat_g || 0,
          carbs: carbs,
          netCarbs: netCarbs,
          fiber: fiber,
          sugars: item.sugars_g || 0,
          saturatedFat: item.saturated_fat_g || 0,
          sodium: item.salt_g ? Math.round(item.salt_g * 400) : 0, // salt to sodium mg
          potassium: 0,
          calcium: 0,
          iron: 0,
        },
        source: 'CIQUAL'
      };
    });
    console.log(`NutriTrack: Loaded ${GLOBAL_FOODS_LIST.length} global foods from CIQUAL database.`);
  }
}

// Open Food Facts API Search & Barcode Lookup
async function searchOpenFoodFacts(query) {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  // Check if query is a Barcode (8 to 14 digits)
  const isBarcode = /^\d{8,14}$/.test(cleanQ);

  try {
    if (isBarcode) {
      const url = `https://world.openfoodfacts.org/api/v0/product/${cleanQ}.json`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'NutriTrackApp - Web - Version 1.0 (contact@nutritrack.app)' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 1 && data.product) {
          const p = data.product;
          const nut = p.nutriments || {};
          const cals = nut['energy-kcal_100g'] || nut['energy-kcal'] || 0;
          const prot = nut.proteins_100g || nut.proteins || 0;
          const carb = nut.carbohydrates_100g || nut.carbohydrates || 0;
          const fat = nut.fat_100g || nut.fat || 0;
          const fiber = nut.fiber_100g || nut.fiber || 0;

          return [{
            id: `off-${p.code}`,
            name: `${p.product_name || 'Product'} (${p.brands || 'Packaged'})`,
            category: 'OpenFoodFacts (Barcode)',
            servingSizeGrams: 100,
            servingUnit: p.serving_size || '100g',
            householdServings: [
              { name: p.serving_size || '1 package', grams: parseFloat(p.serving_quantity) || 100 },
              { name: '100 grams', grams: 100 }
            ],
            nutrientsPer100g: {
              calories: Math.round(cals),
              protein: Math.round(prot * 10) / 10,
              carbs: Math.round(carb * 10) / 10,
              netCarbs: Math.max(0, Math.round((carb - fiber) * 10) / 10),
              fat: Math.round(fat * 10) / 10,
              fiber: Math.round(fiber * 10) / 10,
              sugars: Math.round((nut.sugars_100g || 0) * 10) / 10,
              sodium: Math.round((nut.sodium_100g || (nut.salt_100g ? nut.salt_100g * 400 : 0))),
            },
            source: 'OpenFoodFacts'
          }];
        }
      }
    }
  } catch (err) {
    console.warn('Open Food Facts barcode lookup failed:', err);
  }

  return [];
}

// Live Search combining 4 Databases:
// 1. High-Precision Curated Staples
// 2. 5,000+ CIQUAL Global Foods
// 3. Open Food Facts Barcode & Packaged Foods
// 4. Live USDA FoodData Central
async function searchFoods({ query, apiKey, dataTypes = ['Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Branded'], pageSize = 25 }) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return STAPLE_FOODS.slice(0, 20);

  // Initialize global database if not already initialized
  if (GLOBAL_FOODS_LIST.length === 0) {
    initGlobalFoods();
  }

  // 1. Score curated staples (top priority)
  const scoredStaples = STAPLE_FOODS.map(f => ({
    food: f,
    score: scoreFoodMatch(f, cleanQuery)
  }))
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.food);

  // 2. Score CIQUAL Global Foods (5,000+ items)
  const scoredGlobal = GLOBAL_FOODS_LIST.map(f => ({
    food: f,
    score: scoreFoodMatch(f, cleanQuery)
  }))
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 20)
  .map(item => item.food);

  // Combine local matches (Staples first, then CIQUAL global)
  const localCombined = [...scoredStaples];
  const localSeen = new Set(scoredStaples.map(m => m.name.toLowerCase()));

  scoredGlobal.forEach(g => {
    if (!localSeen.has(g.name.toLowerCase())) {
      localCombined.push(g);
      localSeen.add(g.name.toLowerCase());
    }
  });

  // 3. Check Open Food Facts if query looks like a barcode
  if (/^\d{8,14}$/.test(cleanQuery)) {
    const offResults = await searchOpenFoodFacts(cleanQuery);
    if (offResults.length > 0) {
      return [...offResults, ...localCombined];
    }
  }

  // 4. Query live USDA API in parallel if online
  const activeKey = apiKey || 'DEMO_KEY';
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(activeKey)}&query=${encodeURIComponent(cleanQuery)}&pageSize=${pageSize}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: cleanQuery,
        pageSize: pageSize,
        dataType: dataTypes,
      })
    });

    if (!res.ok) {
      return localCombined;
    }

    const data = await res.json();
    const parsedUsda = (data.foods || []).map(parseUsdaFoodItem);

    // Merge: Put local curated/global first, then live USDA
    const combined = [...localCombined];
    const seen = new Set(localCombined.map(m => m.name.toLowerCase()));

    parsedUsda.forEach(item => {
      const lower = item.name.toLowerCase();
      if (!seen.has(lower)) {
        combined.push(item);
        seen.add(lower);
      }
    });

    return combined;
  } catch (err) {
    return localCombined;
  }
}

// Find food by query offline (used by Chat Parser and Excel Import)
function findFoodOffline(nameOrTerm) {
  const term = nameOrTerm.toLowerCase().trim();
  if (GLOBAL_FOODS_LIST.length === 0) initGlobalFoods();

  // Try staples first
  const scoredStaple = STAPLE_FOODS.map(f => ({
    food: f,
    score: scoreFoodMatch(f, term)
  }))
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score);

  if (scoredStaple.length > 0) return scoredStaple[0].food;

  // Try Global CIQUAL list
  const scoredGlobal = GLOBAL_FOODS_LIST.map(f => ({
    food: f,
    score: scoreFoodMatch(f, term)
  }))
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score);

  return scoredGlobal.length > 0 ? scoredGlobal[0].food : null;
}

window.UsdaApi = {
  STAPLE_FOODS,
  GLOBAL_FOODS_LIST,
  USDA_NUTRIENT_MAP,
  initGlobalFoods,
  scaleNutrients,
  scoreFoodMatch,
  parseUsdaFoodItem,
  searchOpenFoodFacts,
  searchFoods,
  findFoodOffline,
};

// Auto-initialize on script load
initGlobalFoods();
