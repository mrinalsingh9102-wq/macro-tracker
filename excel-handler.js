// Excel (.xlsx, .xls) and CSV Import & Export using SheetJS (XLSX)

function normalizeHeader(h) {
  return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Find key in row matching variations
function getRowValue(row, variations) {
  const normalizedKeys = Object.keys(row).reduce((acc, k) => {
    acc[normalizeHeader(k)] = row[k];
    return acc;
  }, {});

  for (const v of variations) {
    const nv = normalizeHeader(v);
    if (normalizedKeys[nv] !== undefined && normalizedKeys[nv] !== null && normalizedKeys[nv] !== '') {
      return normalizedKeys[nv];
    }
  }
  return null;
}

// Parse an Excel or CSV file buffer
async function parseExcelFile(fileBuffer, activeDate = 'today') {
  if (!window.XLSX) {
    throw new Error('SheetJS (XLSX) library is not loaded');
  }

  const workbook = window.XLSX.read(fileBuffer, { type: 'binary', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = window.XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rows || rows.length === 0) {
    return [];
  }

  const parsedEntries = [];

  for (const row of rows) {
    const foodName = getRowValue(row, ['food', 'foodname', 'item', 'description', 'name', 'ingredient']);
    if (!foodName) continue; // Skip blank lines

    // Parse date if present
    let rawDate = getRowValue(row, ['date', 'day', 'logdate']);
    let entryDate = activeDate;
    if (rawDate instanceof Date) {
      entryDate = rawDate.toISOString().split('T')[0];
    } else if (typeof rawDate === 'string' && rawDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      entryDate = rawDate;
    }

    // Parse meal category
    let rawMeal = getRowValue(row, ['meal', 'mealcategory', 'category', 'type', 'mealtype']) || 'breakfast';
    let meal = 'breakfast';
    const mealLower = String(rawMeal).toLowerCase();
    if (mealLower.includes('lunch')) meal = 'lunch';
    else if (mealLower.includes('dinner') || mealLower.includes('supper')) meal = 'dinner';
    else if (mealLower.includes('snack') || mealLower.includes('dessert')) meal = 'snacks';

    // Parse portion & unit
    let amount = parseFloat(getRowValue(row, ['amount', 'quantity', 'qty', 'serving', 'servings'])) || 1;
    let unit = String(getRowValue(row, ['unit', 'servingunit', 'measure']) || 'serving').trim();

    // Check if macros are directly provided in Excel
    let calories = parseFloat(getRowValue(row, ['calories', 'cal', 'energy', 'kcal']));
    let protein = parseFloat(getRowValue(row, ['protein', 'p', 'proteing']));
    let carbs = parseFloat(getRowValue(row, ['carbs', 'carbohydrates', 'carbohydrate', 'c', 'carbsg']));
    let netCarbs = parseFloat(getRowValue(row, ['netcarbs', 'netcarb', 'netcarbsg']));
    let fat = parseFloat(getRowValue(row, ['fat', 'totalfat', 'f', 'fatg']));
    let fiber = parseFloat(getRowValue(row, ['fiber', 'dietaryfiber', 'fiberg'])) || 0;
    let sodium = parseFloat(getRowValue(row, ['sodium', 'sodiummg'])) || 0;
    let potassium = parseFloat(getRowValue(row, ['potassium', 'potassiummg'])) || 0;

    let grams = 100;
    if (unit.toLowerCase() === 'g' || unit.toLowerCase() === 'grams') grams = amount;
    else if (unit.toLowerCase() === 'oz') grams = Math.round(amount * 28.35);
    else if (unit.toLowerCase() === 'cup' || unit.toLowerCase() === 'cups') grams = Math.round(amount * 240);
    else if (unit.toLowerCase() === 'tbsp') grams = Math.round(amount * 15);
    else grams = Math.round(amount * 100);

    // If calories or macros were not supplied in the sheet, look up the food in USDA / Staples!
    let nutrients = null;
    let matchedFood = null;

    if (isNaN(calories) || isNaN(protein) || isNaN(fat) || isNaN(carbs)) {
      matchedFood = window.UsdaApi.findFoodOffline(foodName);
      if (!matchedFood) {
        try {
          const results = await window.UsdaApi.searchFoods({ query: foodName, pageSize: 1 });
          if (results && results.length > 0) matchedFood = results[0];
        } catch (e) {
          console.warn('Excel item lookup error:', e);
        }
      }

      if (matchedFood) {
        nutrients = window.UsdaApi.scaleNutrients(matchedFood.nutrientsPer100g, grams);
      } else {
        nutrients = {
          calories: isNaN(calories) ? 100 : calories,
          protein: isNaN(protein) ? 5 : protein,
          carbs: isNaN(carbs) ? 10 : carbs,
          netCarbs: isNaN(netCarbs) ? 8 : netCarbs,
          fat: isNaN(fat) ? 3 : fat,
          fiber: fiber,
          sodium: sodium,
          potassium: potassium
        };
      }
    } else {
      if (isNaN(netCarbs)) {
        netCarbs = Math.max(0, Math.round((carbs - fiber) * 10) / 10);
      }
      nutrients = {
        calories,
        protein,
        carbs,
        netCarbs,
        fat,
        fiber,
        sodium,
        potassium
      };
    }

    parsedEntries.push({
      date: entryDate,
      meal,
      name: foodName,
      amount,
      unit,
      grams,
      nutrients,
      source: 'Excel Import'
    });
  }

  return parsedEntries;
}

// Generate & Download Excel Template
function downloadExcelTemplate() {
  if (!window.XLSX) {
    alert('SheetJS is loading, please try again in a moment.');
    return;
  }

  const sampleData = [
    {
      Date: new Date().toISOString().split('T')[0],
      Meal: 'Breakfast',
      Food: 'Egg, whole, raw, fresh',
      Amount: 2,
      Unit: 'large egg',
      Calories: 143,
      'Protein (g)': 12.6,
      'Net Carbs (g)': 0.7,
      'Fat (g)': 9.5,
      'Fiber (g)': 0,
      'Sodium (mg)': 142
    },
    {
      Date: new Date().toISOString().split('T')[0],
      Meal: 'Breakfast',
      Food: 'Rolled Oats, dry',
      Amount: 40,
      Unit: 'g',
      Calories: 155,
      'Protein (g)': 6.7,
      'Net Carbs (g)': 22.3,
      'Fat (g)': 2.8,
      'Fiber (g)': 4.2,
      'Sodium (mg)': 2
    },
    {
      Date: new Date().toISOString().split('T')[0],
      Meal: 'Lunch',
      Food: 'Chicken Breast, grilled',
      Amount: 150,
      Unit: 'g',
      Calories: 247,
      'Protein (g)': 46.5,
      'Net Carbs (g)': 0,
      'Fat (g)': 5.4,
      'Fiber (g)': 0,
      'Sodium (mg)': 111
    },
    {
      Date: new Date().toISOString().split('T')[0],
      Meal: 'Lunch',
      Food: 'White Rice, cooked',
      Amount: 1,
      Unit: 'cup',
      Calories: 205,
      'Protein (g)': 4.2,
      'Net Carbs (g)': 44.5,
      'Fat (g)': 0.4,
      'Fiber (g)': 0.6,
      'Sodium (mg)': 2
    },
    {
      Date: new Date().toISOString().split('T')[0],
      Meal: 'Dinner',
      Food: 'Atlantic Salmon, cooked',
      Amount: 150,
      Unit: 'g',
      Calories: 309,
      'Protein (g)': 33.1,
      'Net Carbs (g)': 0,
      'Fat (g)': 18.5,
      'Fiber (g)': 0,
      'Sodium (mg)': 91
    },
    {
      Date: new Date().toISOString().split('T')[0],
      Meal: 'Snacks',
      Food: 'Greek Yogurt, nonfat',
      Amount: 170,
      Unit: 'g',
      Calories: 100,
      'Protein (g)': 17.3,
      'Net Carbs (g)': 6.1,
      'Fat (g)': 0.7,
      'Fiber (g)': 0,
      'Sodium (mg)': 61
    }
  ];

  const ws = window.XLSX.utils.json_to_sheet(sampleData);
  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, 'FoodLog_Template');
  window.XLSX.writeFile(wb, 'MacroTracker_Import_Template.xlsx');
}

// Export current food diary to Excel
function exportDiaryToExcel(diary, activeDate) {
  if (!window.XLSX) {
    alert('SheetJS is not loaded');
    return;
  }

  const rows = [];
  const dates = activeDate ? [activeDate] : Object.keys(diary);

  dates.forEach(d => {
    const dayData = diary[d];
    if (!dayData) return;

    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(meal => {
      const items = dayData[meal] || [];
      items.forEach(item => {
        const n = item.nutrients || {};
        rows.push({
          Date: d,
          Meal: meal.charAt(0).toUpperCase() + meal.slice(1),
          Food: item.name,
          Category: item.category || 'General',
          Amount: item.amount || 1,
          Unit: item.unit || 'serving',
          Weight_Grams: item.grams || 100,
          Calories: n.calories || 0,
          Protein_g: n.protein || 0,
          NetCarbs_g: n.netCarbs || 0,
          TotalCarbs_g: n.carbs || 0,
          Fat_g: n.fat || 0,
          Fiber_g: n.fiber || 0,
          Sugars_g: n.sugars || 0,
          Sodium_mg: n.sodium || 0,
          Potassium_mg: n.potassium || 0,
          Calcium_mg: n.calcium || 0,
          Iron_mg: n.iron || 0,
          Magnesium_mg: n.magnesium || 0,
          VitaminA_mcg: n.vitaminA || 0,
          VitaminC_mg: n.vitaminC || 0,
          VitaminD_mcg: n.vitaminD || 0,
        });
      });
    });
  });

  if (rows.length === 0) {
    alert('No logged food items to export for this selection.');
    return;
  }

  const ws = window.XLSX.utils.json_to_sheet(rows);
  const wb = window.XLSX.utils.book_new();
  const filename = activeDate ? `MacroTracker_Log_${activeDate}.xlsx` : `MacroTracker_Full_Log.xlsx`;
  window.XLSX.utils.book_append_sheet(wb, ws, 'DailyLog');
  window.XLSX.writeFile(wb, filename);
}

window.ExcelHandler = {
  parseExcelFile,
  downloadExcelTemplate,
  exportDiaryToExcel,
};
