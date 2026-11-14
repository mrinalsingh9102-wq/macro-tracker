// Pre-calculated nutrition targets & standards (based on USDA/FDA Daily Values and standard dietary guidelines)
const DAILY_VALUES = {
  // Macros & General
  calories: 2000,
  protein: 140, // g (fitness/macro baseline)
  carbs: 225,   // g
  netCarbs: 190, // g
  fat: 65,      // g
  fiber: 35,    // g (Cronometer emphasizes fiber)
  water: 2500,  // ml

  // Lipids
  saturatedFat: 20, // g (max)
  monounsaturatedFat: 30, // g
  polyunsaturatedFat: 15, // g
  omega3: 1.6,  // g
  omega6: 14,   // g
  cholesterol: 300, // mg

  // Carbohydrate breakdown
  sugars: 50,      // g
  addedSugars: 30, // g

  // Minerals & Electrolytes (Standard Cronometer focus)
  sodium: 2300,    // mg
  potassium: 3400, // mg
  calcium: 1000,   // mg
  iron: 18,        // mg
  magnesium: 420,  // mg
  phosphorus: 700, // mg
  zinc: 11,        // mg
  copper: 0.9,     // mg
  manganese: 2.3,  // mg
  selenium: 55,    // mcg

  // Vitamins
  vitaminA: 900,   // mcg RAE
  vitaminC: 90,    // mg
  vitaminD: 20,    // mcg (800 IU)
  vitaminE: 15,    // mg
  vitaminK: 120,   // mcg
  thiamin: 1.2,    // mg (B1)
  riboflavin: 1.3, // mg (B2)
  niacin: 16,      // mg (B3)
  vitaminB6: 1.7,  // mg
  folate: 400,     // mcg (B9)
  vitaminB12: 2.4, // mcg
};

// Target categories for UI display
const NUTRIENT_CATEGORIES = [
  {
    name: 'General & Energy',
    id: 'general',
    items: [
      { key: 'calories', label: 'Energy / Calories', unit: 'kcal' },
      { key: 'water', label: 'Water', unit: 'ml' },
    ]
  },
  {
    name: 'Macronutrients',
    id: 'macros',
    items: [
      { key: 'protein', label: 'Protein', unit: 'g', color: 'emerald' },
      { key: 'netCarbs', label: 'Net Carbs', unit: 'g', color: 'amber' },
      { key: 'carbs', label: 'Total Carbohydrates', unit: 'g' },
      { key: 'fiber', label: 'Dietary Fiber', unit: 'g', color: 'cyan' },
      { key: 'fat', label: 'Total Fat', unit: 'g', color: 'rose' },
      { key: 'sugars', label: 'Total Sugars', unit: 'g' },
      { key: 'addedSugars', label: 'Added Sugars', unit: 'g' },
    ]
  },
  {
    name: 'Lipids & Fats',
    id: 'lipids',
    items: [
      { key: 'saturatedFat', label: 'Saturated Fat', unit: 'g', limit: true },
      { key: 'monounsaturatedFat', label: 'Monounsaturated Fat', unit: 'g' },
      { key: 'polyunsaturatedFat', label: 'Polyunsaturated Fat', unit: 'g' },
      { key: 'omega3', label: 'Omega-3', unit: 'g' },
      { key: 'omega6', label: 'Omega-6', unit: 'g' },
      { key: 'cholesterol', label: 'Cholesterol', unit: 'mg', limit: true },
    ]
  },
  {
    name: 'Minerals & Electrolytes',
    id: 'minerals',
    items: [
      { key: 'sodium', label: 'Sodium', unit: 'mg', limit: true },
      { key: 'potassium', label: 'Potassium', unit: 'mg' },
      { key: 'calcium', label: 'Calcium', unit: 'mg' },
      { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
      { key: 'iron', label: 'Iron', unit: 'mg' },
      { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
      { key: 'zinc', label: 'Zinc', unit: 'mg' },
      { key: 'copper', label: 'Copper', unit: 'mg' },
      { key: 'manganese', label: 'Manganese', unit: 'mg' },
      { key: 'selenium', label: 'Selenium', unit: 'mcg' },
    ]
  },
  {
    name: 'Vitamins',
    id: 'vitamins',
    items: [
      { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg' },
      { key: 'vitaminC', label: 'Vitamin C', unit: 'mg' },
      { key: 'vitaminD', label: 'Vitamin D', unit: 'mcg' },
      { key: 'vitaminE', label: 'Vitamin E', unit: 'mg' },
      { key: 'vitaminK', label: 'Vitamin K', unit: 'mcg' },
      { key: 'thiamin', label: 'Thiamin (B1)', unit: 'mg' },
      { key: 'riboflavin', label: 'Riboflavin (B2)', unit: 'mg' },
      { key: 'niacin', label: 'Niacin (B3)', unit: 'mg' },
      { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg' },
      { key: 'folate', label: 'Folate (B9)', unit: 'mcg' },
      { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg' },
    ]
  }
];

// BMR and TDEE Calculator (Mifflin-St Jeor formula)
function calculateTDEE(profile) {
  const { gender, weightKg, heightCm, ageYears, activityLevel, goal } = profile;
  
  // Basal Metabolic Rate (BMR)
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Physical Activity Multiplier
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = multipliers[activityLevel] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  // Goal adjustments
  let targetCalories = tdee;
  if (goal === 'fat_loss') targetCalories = Math.round(tdee - 500);
  if (goal === 'mild_loss') targetCalories = Math.round(tdee - 250);
  if (goal === 'mild_gain') targetCalories = Math.round(tdee + 250);
  if (goal === 'muscle_gain') targetCalories = Math.round(tdee + 500);

  // Macro calculation based on diet type
  // Default: High Protein Athletic Split (Protein: 2.0g/kg, Fat: 25% cals, Carbs: remainder)
  const proteinGrams = Math.round(weightKg * 2.0);
  const proteinCals = proteinGrams * 4;
  const fatCals = Math.round(targetCalories * 0.25);
  const fatGrams = Math.round(fatCals / 9);
  const carbCals = Math.max(0, targetCalories - (proteinCals + fatCals));
  const carbGrams = Math.round(carbCals / 4);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    protein: proteinGrams,
    fat: fatGrams,
    carbs: carbGrams,
    netCarbs: Math.max(0, carbGrams - 30),
    fiber: 35,
  };
}

window.TargetsModule = {
  DAILY_VALUES,
  NUTRIENT_CATEGORIES,
  calculateTDEE,
};
