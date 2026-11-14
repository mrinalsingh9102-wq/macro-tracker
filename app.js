// Main Application Controller for NutriTrack (Cronometer-inspired macro tracker)

const APP_STATE = {
  activeDate: new Date().toISOString().split('T')[0],
  diary: {}, // { 'YYYY-MM-DD': { breakfast: [], lunch: [], dinner: [], snacks: [] } }
  customFoods: [],
  profile: {
    gender: 'male',
    ageYears: 28,
    weightKg: 78,
    heightCm: 178,
    activityLevel: 'moderate',
    goal: 'fat_loss',
    customTargets: null, // If set, overrides calculated targets
  },
  apiKey: localStorage.getItem('usda_api_key') || '',
  selectedMeal: 'breakfast',
  modal: null, // 'add-food', 'targets', 'settings'
  activeAddTab: 'search', // 'search', 'chat', 'excel', 'custom'
  selectedFoodForAdd: null,
  servingAmount: 1,
  selectedMeasureIndex: 0,
};

// Storage Keys
const STORAGE_KEYS = {
  DIARY: 'nutritrack_diary_v1',
  PROFILE: 'nutritrack_profile_v1',
  CUSTOM_FOODS: 'nutritrack_custom_foods_v1',
  API_KEY: 'usda_api_key',
  THEME: 'nutritrack_theme_v1',
};

// Load Initial Data
function loadState() {
  try {
    const savedDiary = localStorage.getItem(STORAGE_KEYS.DIARY);
    if (savedDiary) APP_STATE.diary = JSON.parse(savedDiary);

    const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (savedProfile) APP_STATE.profile = { ...APP_STATE.profile, ...JSON.parse(savedProfile) };

    const savedCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
    if (savedCustom) APP_STATE.customFoods = JSON.parse(savedCustom);

    APP_STATE.apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || '';

    // If today has no entries, seed with a realistic sample day so the user sees the dashboard immediately!
    const today = APP_STATE.activeDate;
    if (!APP_STATE.diary[today] || Object.values(APP_STATE.diary[today]).every(arr => arr.length === 0)) {
      seedSampleDay(today);
    }
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(APP_STATE.diary));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(APP_STATE.profile));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FOODS, JSON.stringify(APP_STATE.customFoods));
    if (APP_STATE.apiKey) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, APP_STATE.apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }

    // Save redundancy snapshot
    const snapshot = {
      timestamp: new Date().toISOString(),
      activeDate: APP_STATE.activeDate,
      diary: APP_STATE.diary,
      profile: APP_STATE.profile,
    };
    localStorage.setItem('nutritrack_snapshot_backup', JSON.stringify(snapshot));
    updateSaveStatusDisplay();
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

// Update the visual save status indicators
function updateSaveStatusDisplay(customMessage) {
  const el = document.getElementById('save-status-indicator');
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (el) {
    el.innerHTML = customMessage || `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Saved & Protected</span> • Last updated at ${timeStr} • Stored locally`;
  }
}

// Explicit User-Triggered Manual Save
function manualSaveDiary() {
  saveState();

  // Bottom Save Button Animation & Feedback
  const btn = document.getElementById('btn-manual-save');
  const label = document.getElementById('btn-save-label');
  if (btn && label) {
    btn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
    btn.classList.add('bg-teal-700', 'ring-2', 'ring-emerald-400');
    label.innerHTML = `All Data Saved! ✓`;
    setTimeout(() => {
      btn.classList.remove('bg-teal-700', 'ring-2', 'ring-emerald-400');
      btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
      label.innerHTML = `Save Day's Diet`;
    }, 2200);
  }

  // Header Save Button Feedback
  const navBtn = document.getElementById('nav-save-btn');
  const navText = document.getElementById('nav-save-text');
  if (navBtn && navText) {
    navText.textContent = 'Saved! ✓';
    setTimeout(() => {
      navText.textContent = 'Save';
    }, 2200);
  }

  showToast(`✓ Diet for ${APP_STATE.activeDate} successfully saved to local storage!`);
}

// Floating Toast Notification
function showToast(message) {
  const toast = document.getElementById('save-toast');
  const toastText = document.getElementById('save-toast-text');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
  }, 3500);
}

// Download Complete JSON Backup File to Computer
function downloadBackupJson() {
  const backupData = {
    appName: 'NutriTrack',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    activeDate: APP_STATE.activeDate,
    diary: APP_STATE.diary,
    profile: APP_STATE.profile,
    customFoods: APP_STATE.customFoods
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `NutriTrack_Diet_Backup_${APP_STATE.activeDate}.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();

  showToast(`Downloaded full JSON diet backup file!`);
}

// Seed a rich day to immediately showcase Cronometer-style charts and micronutrients
function seedSampleDay(dateStr) {
  const egg = window.UsdaApi.STAPLE_FOODS.find(f => f.id === 'staple-egg-large');
  const oats = window.UsdaApi.STAPLE_FOODS.find(f => f.id === 'staple-oats-rolled');
  const chicken = window.UsdaApi.STAPLE_FOODS.find(f => f.id === 'staple-chicken-breast');
  const rice = window.UsdaApi.STAPLE_FOODS.find(f => f.id === 'staple-white-rice');
  const broccoli = window.UsdaApi.STAPLE_FOODS.find(f => f.id === 'staple-broccoli');
  const salmon = window.UsdaApi.STAPLE_FOODS.find(f => f.id === 'staple-salmon-atlantic');
  const yogurt = window.UsdaApi.STAPLE_FOODS.find(f => f.id === 'staple-greek-yogurt');

  APP_STATE.diary[dateStr] = {
    breakfast: [
      {
        id: 'sample-1',
        name: egg.name,
        category: egg.category,
        amount: 2,
        unit: 'large egg',
        grams: 100,
        nutrients: window.UsdaApi.scaleNutrients(egg.nutrientsPer100g, 100),
      },
      {
        id: 'sample-2',
        name: oats.name,
        category: oats.category,
        amount: 50,
        unit: 'g',
        grams: 50,
        nutrients: window.UsdaApi.scaleNutrients(oats.nutrientsPer100g, 50),
      }
    ],
    lunch: [
      {
        id: 'sample-3',
        name: chicken.name,
        category: chicken.category,
        amount: 150,
        unit: 'g',
        grams: 150,
        nutrients: window.UsdaApi.scaleNutrients(chicken.nutrientsPer100g, 150),
      },
      {
        id: 'sample-4',
        name: rice.name,
        category: rice.category,
        amount: 150,
        unit: 'g',
        grams: 150,
        nutrients: window.UsdaApi.scaleNutrients(rice.nutrientsPer100g, 150),
      },
      {
        id: 'sample-5',
        name: broccoli.name,
        category: broccoli.category,
        amount: 100,
        unit: 'g',
        grams: 100,
        nutrients: window.UsdaApi.scaleNutrients(broccoli.nutrientsPer100g, 100),
      }
    ],
    dinner: [
      {
        id: 'sample-6',
        name: salmon.name,
        category: salmon.category,
        amount: 150,
        unit: 'g',
        grams: 150,
        nutrients: window.UsdaApi.scaleNutrients(salmon.nutrientsPer100g, 150),
      }
    ],
    snacks: [
      {
        id: 'sample-7',
        name: yogurt.name,
        category: yogurt.category,
        amount: 170,
        unit: 'g',
        grams: 170,
        nutrients: window.UsdaApi.scaleNutrients(yogurt.nutrientsPer100g, 170),
      }
    ]
  };
}

// Get active day data
function getActiveDayDiary() {
  const date = APP_STATE.activeDate;
  if (!APP_STATE.diary[date]) {
    APP_STATE.diary[date] = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
  }
  return APP_STATE.diary[date];
}

// Compute daily totals
function computeDailyTotals() {
  const day = getActiveDayDiary();
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    netCarbs: 0,
    fat: 0,
    fiber: 0,
    sugars: 0,
    saturatedFat: 0,
    monounsaturatedFat: 0,
    polyunsaturatedFat: 0,
    omega3: 0,
    omega6: 0,
    cholesterol: 0,
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
  };

  const mealTotals = {
    breakfast: { calories: 0, protein: 0, netCarbs: 0, fat: 0 },
    lunch: { calories: 0, protein: 0, netCarbs: 0, fat: 0 },
    dinner: { calories: 0, protein: 0, netCarbs: 0, fat: 0 },
    snacks: { calories: 0, protein: 0, netCarbs: 0, fat: 0 },
  };

  ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(m => {
    (day[m] || []).forEach(item => {
      const n = item.nutrients || {};
      mealTotals[m].calories += n.calories || 0;
      mealTotals[m].protein += n.protein || 0;
      mealTotals[m].netCarbs += n.netCarbs || 0;
      mealTotals[m].fat += n.fat || 0;

      for (const [k, v] of Object.entries(n)) {
        if (typeof v === 'number' && totals[k] !== undefined) {
          totals[k] += v;
        }
      }
    });
  });

  // Round values
  for (const k of Object.keys(totals)) {
    totals[k] = Math.round(totals[k] * 10) / 10;
  }
  for (const m of Object.keys(mealTotals)) {
    mealTotals[m].calories = Math.round(mealTotals[m].calories);
    mealTotals[m].protein = Math.round(mealTotals[m].protein * 10) / 10;
    mealTotals[m].netCarbs = Math.round(mealTotals[m].netCarbs * 10) / 10;
    mealTotals[m].fat = Math.round(mealTotals[m].fat * 10) / 10;
  }

  return { totals, mealTotals };
}

// Get Active Targets
function getActiveTargets() {
  if (APP_STATE.profile.customTargets) {
    return {
      ...window.TargetsModule.DAILY_VALUES,
      ...APP_STATE.profile.customTargets,
    };
  }
  const calculated = window.TargetsModule.calculateTDEE(APP_STATE.profile);
  return {
    ...window.TargetsModule.DAILY_VALUES,
    calories: calculated.targetCalories,
    protein: calculated.protein,
    carbs: calculated.carbs,
    netCarbs: calculated.netCarbs,
    fat: calculated.fat,
    fiber: calculated.fiber,
  };
}

// Helper: Circular Progress SVG
function renderProgressRing({ percent, size = 100, strokeWidth = 8, colorClass = 'stroke-emerald-500', trackClass = 'stroke-slate-200 dark:stroke-slate-700' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return `
    <svg width="${size}" height="${size}" class="transform -rotate-90">
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" class="${trackClass}" stroke-width="${strokeWidth}" fill="transparent" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" class="${colorClass} transition-all duration-500 ease-out" 
        stroke-width="${strokeWidth}" 
        stroke-dasharray="${circumference}" 
        stroke-dashoffset="${strokeDashoffset}" 
        stroke-linecap="round" 
        fill="transparent" />
    </svg>
  `;
}

// UI Render: Main Dashboard
function renderDashboard() {
  const { totals, mealTotals } = computeDailyTotals();
  const targets = getActiveTargets();

  // Render Top Macro & Calorie Overview
  const calPercent = Math.round((totals.calories / targets.calories) * 100) || 0;
  const calRemaining = Math.max(0, targets.calories - totals.calories);
  const proteinPercent = Math.round((totals.protein / targets.protein) * 100) || 0;
  const netCarbPercent = Math.round((totals.netCarbs / targets.netCarbs) * 100) || 0;
  const fatPercent = Math.round((totals.fat / targets.fat) * 100) || 0;
  const fiberPercent = Math.round((totals.fiber / targets.fiber) * 100) || 0;

  // Energy & Macros Cards
  const summaryEl = document.getElementById('macro-summary');
  summaryEl.innerHTML = `
    <!-- Calorie Balance Card -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row items-center gap-6">
      <div class="relative flex items-center justify-center">
        ${renderProgressRing({
          percent: calPercent,
          size: 130,
          strokeWidth: 10,
          colorClass: calPercent > 105 ? 'stroke-rose-500' : 'stroke-emerald-500',
        })}
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Remaining</span>
          <span class="text-2xl font-bold text-slate-800 dark:text-white">${calRemaining}</span>
          <span class="text-[11px] text-slate-600 dark:text-slate-400">kcal</span>
        </div>
      </div>

      <div class="flex-1 w-full grid grid-cols-3 gap-3 text-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700/60 pt-4 md:pt-0 md:pl-6">
        <div class="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl">
          <p class="text-xs text-slate-600 dark:text-slate-400">Consumed</p>
          <p class="text-lg font-bold text-slate-800 dark:text-white mt-0.5">${Math.round(totals.calories)}</p>
          <p class="text-[10px] text-slate-600 dark:text-slate-400">kcal</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl">
          <p class="text-xs text-slate-600 dark:text-slate-400">Daily Target</p>
          <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">${targets.calories}</p>
          <p class="text-[10px] text-slate-600 dark:text-slate-400">kcal</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl">
          <p class="text-xs text-slate-600 dark:text-slate-400">Completion</p>
          <p class="text-lg font-bold ${calPercent > 100 ? 'text-rose-500' : 'text-slate-800 dark:text-white'} mt-0.5">${calPercent}%</p>
          <p class="text-[10px] text-slate-600 dark:text-slate-400">of goal</p>
        </div>
      </div>
    </div>

    <!-- Macronutrient Rings Card -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/80">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Macronutrients</h3>
        <span class="text-xs px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium rounded-full">
          Net Carb Mode
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <!-- Protein -->
        <div class="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
          <div class="relative flex items-center justify-center mb-2">
            ${renderProgressRing({ percent: proteinPercent, size: 74, strokeWidth: 7, colorClass: 'stroke-emerald-500' })}
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-xs font-bold text-slate-800 dark:text-white">${proteinPercent}%</span>
            </div>
          </div>
          <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">Protein</span>
          <span class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">${totals.protein} / <span class="font-medium text-slate-600 dark:text-slate-300">${targets.protein}g</span></span>
        </div>

        <!-- Net Carbs -->
        <div class="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
          <div class="relative flex items-center justify-center mb-2">
            ${renderProgressRing({ percent: netCarbPercent, size: 74, strokeWidth: 7, colorClass: 'stroke-amber-500' })}
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-xs font-bold text-slate-800 dark:text-white">${netCarbPercent}%</span>
            </div>
          </div>
          <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">Net Carbs</span>
          <span class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">${totals.netCarbs} / <span class="font-medium text-slate-600 dark:text-slate-300">${targets.netCarbs}g</span></span>
        </div>

        <!-- Fat -->
        <div class="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
          <div class="relative flex items-center justify-center mb-2">
            ${renderProgressRing({ percent: fatPercent, size: 74, strokeWidth: 7, colorClass: 'stroke-rose-500' })}
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-xs font-bold text-slate-800 dark:text-white">${fatPercent}%</span>
            </div>
          </div>
          <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">Fat</span>
          <span class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">${totals.fat} / <span class="font-medium text-slate-600 dark:text-slate-300">${targets.fat}g</span></span>
        </div>

        <!-- Fiber -->
        <div class="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
          <div class="relative flex items-center justify-center mb-2">
            ${renderProgressRing({ percent: fiberPercent, size: 74, strokeWidth: 7, colorClass: 'stroke-cyan-500' })}
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-xs font-bold text-slate-800 dark:text-white">${fiberPercent}%</span>
            </div>
          </div>
          <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">Fiber</span>
          <span class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">${totals.fiber} / <span class="font-medium text-slate-600 dark:text-slate-300">${targets.fiber}g</span></span>
        </div>
      </div>
    </div>
  `;

  // Render Meal Diary
  renderMealDiary(mealTotals);

  // Render Micronutrient Breakdown
  renderMicronutrientDashboard(totals, targets);

  // Refresh Lucide Icons
  if (window.lucide) window.lucide.createIcons();
}

// Render Meal Diary Section
function renderMealDiary(mealTotals) {
  const day = getActiveDayDiary();
  const mealsContainer = document.getElementById('meals-container');

  const mealDefs = [
    { key: 'breakfast', label: 'Breakfast', icon: 'coffee' },
    { key: 'lunch', label: 'Lunch', icon: 'utensils' },
    { key: 'dinner', label: 'Dinner', icon: 'soup' },
    { key: 'snacks', label: 'Snacks & Supplements', icon: 'apple' },
  ];

  mealsContainer.innerHTML = mealDefs.map(m => {
    const items = day[m.key] || [];
    const sub = mealTotals[m.key] || { calories: 0, protein: 0, netCarbs: 0, fat: 0 };

    return `
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/80 overflow-hidden mb-5 transition-all">
        <!-- Meal Header -->
        <div class="px-5 py-4 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <i data-lucide="${m.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 dark:text-white text-base">${m.label}</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400">${items.length} ${items.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Meal Macro Subtotal Pills -->
            <div class="hidden sm:flex items-center gap-3 text-xs">
              <span class="font-semibold text-slate-700 dark:text-slate-300">${sub.calories} kcal</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-medium">P: ${sub.protein}g</span>
              <span class="text-amber-600 dark:text-amber-400 font-medium">NC: ${sub.netCarbs}g</span>
              <span class="text-rose-600 dark:text-rose-400 font-medium">F: ${sub.fat}g</span>
            </div>

            <button onclick="openAddFoodModal('${m.key}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Food
            </button>
          </div>
        </div>

        <!-- Meal Items Table -->
        <div class="divide-y divide-slate-100 dark:divide-slate-700/60">
          ${items.length === 0 ? `
            <div class="py-8 text-center text-slate-600 dark:text-slate-400 text-sm">
              <p>No food logged for ${m.label.toLowerCase()} yet.</p>
              <button onclick="openAddFoodModal('${m.key}')" class="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1">
                + Quick add food or paste a meal
              </button>
            </div>
          ` : items.map((item, idx) => {
            const n = item.nutrients || {};
            return `
              <div class="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition group">
                <div class="flex-1 min-w-0 pr-4">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-sm text-slate-800 dark:text-white truncate">${item.name}</span>
                    <span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 font-medium">
                      ${item.amount} ${item.unit} (${item.grams}g)
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">${item.category || 'General Food'}</p>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <div class="text-right">
                    <span class="text-sm font-bold text-slate-800 dark:text-slate-100">${Math.round(n.calories || 0)} <span class="text-xs font-normal text-slate-600 dark:text-slate-400">kcal</span></span>
                    <div class="text-[11px] text-slate-600 dark:text-slate-400 space-x-1.5">
                      <span class="text-emerald-600 dark:text-emerald-400 font-medium">P ${Math.round(n.protein || 0)}g</span>
                      <span>•</span>
                      <span class="text-amber-600 dark:text-amber-400 font-medium">C ${Math.round(n.netCarbs || 0)}g</span>
                      <span>•</span>
                      <span class="text-rose-600 dark:text-rose-400 font-medium">F ${Math.round(n.fat || 0)}g</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-1">
                    <button onclick="openEditItemModal('${m.key}', ${idx})" title="Edit portion & macros" class="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition">
                      <i data-lucide="pencil" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteDiaryItem('${m.key}', ${idx})" title="Remove item" class="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Track expanded state of micronutrient categories
const _expandedMicroCategories = {
  macros: true,
  lipids: true,
  minerals: true,
  vitamins: true,
};

function toggleMicroCategory(catId) {
  _expandedMicroCategories[catId] = !_expandedMicroCategories[catId];
  const body = document.getElementById(`micro-cat-body-${catId}`);
  const icon = document.getElementById(`micro-cat-icon-${catId}`);
  if (body) {
    if (_expandedMicroCategories[catId]) {
      body.classList.remove('hidden');
      if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
      body.classList.add('hidden');
      if (icon) icon.style.transform = 'rotate(0deg)';
    }
  }
}

function toggleAllMicros() {
  const anyOpen = Object.values(_expandedMicroCategories).some(v => v);
  const targetState = !anyOpen;
  
  for (const catId of Object.keys(_expandedMicroCategories)) {
    _expandedMicroCategories[catId] = targetState;
    const body = document.getElementById(`micro-cat-body-${catId}`);
    const icon = document.getElementById(`micro-cat-icon-${catId}`);
    if (body) {
      if (targetState) {
        body.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      } else {
        body.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
      }
    }
  }

  const btn = document.getElementById('toggle-all-micros');
  if (btn) btn.textContent = targetState ? 'Collapse All' : 'Expand All';
}

// Render Cronometer-Style Micronutrient Breakdown Drawer / Panel
function renderMicronutrientDashboard(totals, targets) {
  const container = document.getElementById('micronutrient-container');
  if (!container) return;

  const categories = window.TargetsModule.NUTRIENT_CATEGORIES.filter(c => c.id !== 'general');
  const anyOpen = Object.values(_expandedMicroCategories).some(v => v);

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/80 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i data-lucide="activity" class="w-5 h-5 text-emerald-500"></i> Full Micronutrient Breakdown
          </h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Tracking against standard Recommended Daily Values (DV)</p>
        </div>
        <button id="toggle-all-micros" onclick="toggleAllMicros()" class="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
          ${anyOpen ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div class="space-y-4">
        ${categories.map(cat => {
          const isOpen = _expandedMicroCategories[cat.id] !== false;
          return `
          <div class="border border-slate-100 dark:border-slate-700/60 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-700/20">
            <button onclick="toggleMicroCategory('${cat.id}')" class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-700/40 transition">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">${cat.name}</span>
              <i data-lucide="chevron-down" id="micro-cat-icon-${cat.id}" class="w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform duration-200" style="transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}"></i>
            </button>
            
            <div id="micro-cat-body-${cat.id}" class="px-4 pb-4 pt-1 ${isOpen ? '' : 'hidden'}">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                ${cat.items.map(item => {
                  const consumed = totals[item.key] || 0;
                  const target = targets[item.key] || 1;
                  const percent = Math.min(200, Math.round((consumed / target) * 100));
                  
                  let barColor = 'bg-emerald-500';
                  if (item.limit) {
                    barColor = percent > 100 ? 'bg-rose-500' : 'bg-slate-400 dark:bg-slate-500';
                  } else {
                    if (percent >= 100) barColor = 'bg-emerald-500';
                    else if (percent >= 50) barColor = 'bg-teal-500';
                    else barColor = 'bg-amber-400';
                  }

                  return `
                    <div>
                      <div class="flex items-center justify-between text-xs mb-1">
                        <span class="font-medium text-slate-700 dark:text-slate-300">${item.label}</span>
                        <span class="text-slate-600 dark:text-slate-400 font-mono">
                          <strong class="text-slate-800 dark:text-slate-200 font-semibold">${consumed}</strong> / ${target} ${item.unit}
                          <span class="ml-1 text-[11px] font-bold ${percent >= 100 && !item.limit ? 'text-emerald-600 dark:text-emerald-400' : ''}">(${percent}%)</span>
                        </span>
                      </div>
                      <div class="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div class="${barColor} h-full rounded-full transition-all duration-500" style="width: ${Math.min(100, percent)}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    </div>
  `;
}

// Date Navigation
function changeDate(deltaDays) {
  const current = new Date(APP_STATE.activeDate + 'T00:00:00');
  current.setDate(current.getDate() + deltaDays);
  APP_STATE.activeDate = current.toISOString().split('T')[0];
  updateDateUI();
  renderDashboard();
}

function setDate(dateStr) {
  APP_STATE.activeDate = dateStr;
  updateDateUI();
  renderDashboard();
}

function updateDateUI() {
  const input = document.getElementById('date-picker');
  if (input) input.value = APP_STATE.activeDate;

  const label = document.getElementById('date-display-label');
  if (label) {
    const todayStr = new Date().toISOString().split('T')[0];
    const dateObj = new Date(APP_STATE.activeDate + 'T00:00:00');
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const formatted = dateObj.toLocaleDateString(undefined, options);
    
    if (APP_STATE.activeDate === todayStr) {
      label.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-bold">Today</span>, ${formatted}`;
    } else {
      label.textContent = formatted;
    }
  }
}

// Delete Diary Item
function deleteDiaryItem(meal, index) {
  const day = getActiveDayDiary();
  if (day[meal] && day[meal][index]) {
    const itemName = day[meal][index].name;
    day[meal].splice(index, 1);
    saveState();
    renderDashboard();
    showToast(`Removed ${itemName}`);
  }
}

// ==========================================
// Edit Food Item Controller
// ==========================================
let _activeEditingItem = null;
let _baseNutrientsPerGram = null;

function openEditItemModal(meal, index) {
  const day = getActiveDayDiary();
  if (!day[meal] || !day[meal][index]) return;

  const item = day[meal][index];
  _activeEditingItem = { ...item, meal, index };

  const currentGrams = item.grams || 100;
  _baseNutrientsPerGram = {};
  if (item.nutrients) {
    for (const [k, v] of Object.entries(item.nutrients)) {
      if (typeof v === 'number') {
        _baseNutrientsPerGram[k] = v / currentGrams;
      }
    }
  }

  document.getElementById('edit-food-name-subtitle').textContent = `${item.name} (${item.category || 'General'})`;
  document.getElementById('edit-item-meal-orig').value = meal;
  document.getElementById('edit-item-index-orig').value = index;
  document.getElementById('edit-item-meal').value = meal;
  document.getElementById('edit-item-amount').value = item.amount || 1;
  document.getElementById('edit-item-unit').value = item.unit || 'serving';
  document.getElementById('edit-item-grams').value = currentGrams;

  const n = item.nutrients || {};
  document.getElementById('edit-item-calories').value = Math.round(n.calories || 0);
  document.getElementById('edit-item-protein').value = n.protein || 0;
  document.getElementById('edit-item-netcarbs').value = n.netCarbs || 0;
  document.getElementById('edit-item-fat').value = n.fat || 0;
  document.getElementById('edit-item-carbs').value = n.carbs || 0;
  document.getElementById('edit-item-fiber').value = n.fiber || 0;
  document.getElementById('edit-item-sodium').value = Math.round(n.sodium || 0);
  document.getElementById('edit-item-potassium').value = Math.round(n.potassium || 0);

  const modal = document.getElementById('edit-item-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) window.lucide.createIcons();
}

function closeEditItemModal() {
  const modal = document.getElementById('edit-item-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  _activeEditingItem = null;
  _baseNutrientsPerGram = null;
}

function handleEditPortionChange() {
  if (!_activeEditingItem || !_baseNutrientsPerGram) return;
  const oldAmount = _activeEditingItem.amount || 1;
  const newAmount = parseFloat(document.getElementById('edit-item-amount').value) || 1;
  const oldGrams = _activeEditingItem.grams || 100;

  const newGrams = Math.round((newAmount / oldAmount) * oldGrams);
  document.getElementById('edit-item-grams').value = newGrams;

  // Scale nutrients
  scaleNutrientInputs(newGrams);
}

function handleEditGramsChange() {
  if (!_activeEditingItem || !_baseNutrientsPerGram) return;
  const newGrams = parseFloat(document.getElementById('edit-item-grams').value) || 1;
  const oldGrams = _activeEditingItem.grams || 100;
  const oldAmount = _activeEditingItem.amount || 1;

  const newAmount = Math.round((newGrams / oldGrams) * oldAmount * 10) / 10;
  document.getElementById('edit-item-amount').value = newAmount;

  scaleNutrientInputs(newGrams);
}

function scaleNutrientInputs(grams) {
  if (!_baseNutrientsPerGram) return;
  const cals = Math.round((_baseNutrientsPerGram.calories || 0) * grams);
  const prot = Math.round((_baseNutrientsPerGram.protein || 0) * grams * 10) / 10;
  const fat = Math.round((_baseNutrientsPerGram.fat || 0) * grams * 10) / 10;
  const carbs = Math.round((_baseNutrientsPerGram.carbs || 0) * grams * 10) / 10;
  const fiber = Math.round((_baseNutrientsPerGram.fiber || 0) * grams * 10) / 10;
  const netCarbs = Math.max(0, Math.round((carbs - fiber) * 10) / 10);
  const sodium = Math.round((_baseNutrientsPerGram.sodium || 0) * grams);
  const potassium = Math.round((_baseNutrientsPerGram.potassium || 0) * grams);

  document.getElementById('edit-item-calories').value = cals;
  document.getElementById('edit-item-protein').value = prot;
  document.getElementById('edit-item-netcarbs').value = netCarbs;
  document.getElementById('edit-item-fat').value = fat;
  document.getElementById('edit-item-carbs').value = carbs;
  document.getElementById('edit-item-fiber').value = fiber;
  document.getElementById('edit-item-sodium').value = sodium;
  document.getElementById('edit-item-potassium').value = potassium;
}

function saveEditedItem() {
  if (!_activeEditingItem) return;

  const origMeal = document.getElementById('edit-item-meal-orig').value;
  const origIndex = parseInt(document.getElementById('edit-item-index-orig').value);
  const targetMeal = document.getElementById('edit-item-meal').value;

  const day = getActiveDayDiary();
  if (!day[origMeal] || !day[origMeal][origIndex]) return;

  const updatedAmount = parseFloat(document.getElementById('edit-item-amount').value) || 1;
  const updatedUnit = document.getElementById('edit-item-unit').value.trim() || 'serving';
  const updatedGrams = parseFloat(document.getElementById('edit-item-grams').value) || 100;

  const updatedNutrients = {
    ...(_activeEditingItem.nutrients || {}),
    calories: parseFloat(document.getElementById('edit-item-calories').value) || 0,
    protein: parseFloat(document.getElementById('edit-item-protein').value) || 0,
    netCarbs: parseFloat(document.getElementById('edit-item-netcarbs').value) || 0,
    fat: parseFloat(document.getElementById('edit-item-fat').value) || 0,
    carbs: parseFloat(document.getElementById('edit-item-carbs').value) || 0,
    fiber: parseFloat(document.getElementById('edit-item-fiber').value) || 0,
    sodium: parseFloat(document.getElementById('edit-item-sodium').value) || 0,
    potassium: parseFloat(document.getElementById('edit-item-potassium').value) || 0,
  };

  const updatedItem = {
    ..._activeEditingItem,
    amount: updatedAmount,
    unit: updatedUnit,
    grams: updatedGrams,
    nutrients: updatedNutrients,
  };
  delete updatedItem.meal;
  delete updatedItem.index;

  if (origMeal === targetMeal) {
    day[origMeal][origIndex] = updatedItem;
  } else {
    // Moved to another meal category (e.g. Breakfast -> Lunch)
    day[origMeal].splice(origIndex, 1);
    if (!day[targetMeal]) day[targetMeal] = [];
    day[targetMeal].push(updatedItem);
  }

  saveState();
  closeEditItemModal();
  renderDashboard();
  showToast(`✓ Updated ${updatedItem.name}!`);
}

// Open Add Food Modal
function openAddFoodModal(meal = 'breakfast') {
  APP_STATE.selectedMeal = meal;
  APP_STATE.modal = 'add-food';
  APP_STATE.activeAddTab = 'search';
  APP_STATE.selectedFoodForAdd = null;

  const modalEl = document.getElementById('add-food-modal');
  modalEl.classList.remove('hidden');
  modalEl.classList.add('flex');

  // Update modal meal title
  const title = document.getElementById('modal-meal-name');
  if (title) title.textContent = meal.charAt(0).toUpperCase() + meal.slice(1);

  switchAddTab('search');
  if (window.lucide) window.lucide.createIcons();
}

function closeAddFoodModal() {
  const modalEl = document.getElementById('add-food-modal');
  modalEl.classList.add('hidden');
  modalEl.classList.remove('flex');
  APP_STATE.modal = null;
}

// Switch Tab in Add Food Modal
function switchAddTab(tabName) {
  APP_STATE.activeAddTab = tabName;
  ['search', 'chat', 'excel', 'custom'].forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const pane = document.getElementById(`tab-pane-${t}`);
    if (btn && pane) {
      if (t === tabName) {
        btn.className = 'px-4 py-2 font-medium text-xs rounded-xl bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 transition';
        pane.classList.remove('hidden');
      } else {
        btn.className = 'px-4 py-2 font-medium text-xs rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition';
        pane.classList.add('hidden');
      }
    }
  });

  if (tabName === 'search') {
    // Show staples initially if search input is empty
    const queryInput = document.getElementById('search-food-input');
    if (queryInput && !queryInput.value.trim()) {
      renderSearchResults(window.UsdaApi.STAPLE_FOODS);
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

// Live Food Search Handler (Instant local match + Debounced USDA live query)
let searchDebounceTimer = null;
async function handleFoodSearchInput(e) {
  const query = e.target.value.trim();
  clearTimeout(searchDebounceTimer);

  if (!query) {
    renderSearchResults(window.UsdaApi.STAPLE_FOODS.slice(0, 20));
    return;
  }

  // 1. Instant local results on keystroke (zero lag!) across Staples and CIQUAL 5000+ foods
  const staples = window.UsdaApi.STAPLE_FOODS || [];
  const globals = window.UsdaApi.GLOBAL_FOODS_LIST || [];

  const instantStaples = staples.map(f => ({
    food: f,
    score: window.UsdaApi.scoreFoodMatch(f, query)
  }))
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.food);

  const instantGlobals = globals.map(f => ({
    food: f,
    score: window.UsdaApi.scoreFoodMatch(f, query)
  }))
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 15)
  .map(item => item.food);

  const instantMatches = [...instantStaples, ...instantGlobals];

  if (instantMatches.length > 0) {
    renderSearchResults(instantMatches);
  }

  // 2. Debounced background USDA cloud query
  searchDebounceTimer = setTimeout(async () => {
    try {
      const foods = await window.UsdaApi.searchFoods({
        query,
        apiKey: APP_STATE.apiKey,
        pageSize: 25
      });
      renderSearchResults(foods);
    } catch (err) {
      console.warn('Live search error:', err);
      if (instantMatches.length > 0) {
        renderSearchResults(instantMatches);
      }
    }
  }, 300);
}

// Render search results
function renderSearchResults(foods) {
  const container = document.getElementById('search-results-list');
  if (!foods || foods.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-slate-600 dark:text-slate-400 text-xs">
        No matching foods found. Try a different term or use the Custom Food tab.
      </div>
    `;
    return;
  }

  container.innerHTML = foods.map((f, idx) => {
    const p100 = f.nutrientsPer100g || {};
    return `
      <div onclick="selectFoodForPortion(${idx})" class="p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition flex items-center justify-between">
        <div class="min-w-0 flex-1 pr-3">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-xs text-slate-800 dark:text-white truncate">${f.name}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
              ${f.source || 'Staple'}
            </span>
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">${f.category || ''}</p>
        </div>

        <div class="text-right text-xs shrink-0">
          <span class="font-bold text-slate-800 dark:text-slate-200">${Math.round(p100.calories || 0)} <span class="text-[10px] font-normal text-slate-600 dark:text-slate-400">kcal/100g</span></span>
          <div class="text-[10px] text-slate-600 dark:text-slate-400 space-x-1">
            <span class="text-emerald-600 dark:text-emerald-400 font-medium">P:${Math.round(p100.protein || 0)}</span>
            <span class="text-amber-600 dark:text-amber-400 font-medium">C:${Math.round(p100.netCarbs || 0)}</span>
            <span class="text-rose-600 dark:text-rose-400 font-medium">F:${Math.round(p100.fat || 0)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Store current search food list in memory for selection index
  window._currentSearchFoods = foods;
}

// Select food and open portion adjust view
function selectFoodForPortion(index) {
  const food = window._currentSearchFoods[index];
  if (!food) return;

  APP_STATE.selectedFoodForAdd = food;
  APP_STATE.servingAmount = 1;
  APP_STATE.selectedMeasureIndex = 0;

  const portionPane = document.getElementById('portion-adjust-pane');
  portionPane.classList.remove('hidden');

  document.getElementById('portion-food-name').textContent = food.name;

  // Populate Measures dropdown
  const measuresSelect = document.getElementById('portion-measure-select');
  const measures = food.householdServings || [{ name: '100 grams', grams: 100 }];
  measuresSelect.innerHTML = measures.map((m, i) => `
    <option value="${i}">${m.name}</option>
  `).join('');

  updatePortionPreview();
}

function updatePortionPreview() {
  const food = APP_STATE.selectedFoodForAdd;
  if (!food) return;

  const qtyInput = document.getElementById('portion-amount-input');
  const qty = parseFloat(qtyInput.value) || 1;
  APP_STATE.servingAmount = qty;

  const measuresSelect = document.getElementById('portion-measure-select');
  const measureIdx = parseInt(measuresSelect.value) || 0;
  APP_STATE.selectedMeasureIndex = measureIdx;

  const measures = food.householdServings || [{ name: '100 grams', grams: 100 }];
  const measure = measures[measureIdx] || measures[0];

  const totalGrams = Math.round(qty * measure.grams);
  const scaled = window.UsdaApi.scaleNutrients(food.nutrientsPer100g, totalGrams);

  document.getElementById('portion-preview-calories').textContent = Math.round(scaled.calories);
  document.getElementById('portion-preview-protein').textContent = `${scaled.protein}g`;
  document.getElementById('portion-preview-carbs').textContent = `${scaled.netCarbs}g`;
  document.getElementById('portion-preview-fat').textContent = `${scaled.fat}g`;
  document.getElementById('portion-preview-grams').textContent = `${totalGrams}g`;
}

// Confirm Add Selected Food to Diary
function confirmAddFoodToDiary() {
  const food = APP_STATE.selectedFoodForAdd;
  if (!food) return;

  const measures = food.householdServings || [{ name: '100 grams', grams: 100 }];
  const measure = measures[APP_STATE.selectedMeasureIndex] || measures[0];
  const totalGrams = Math.round(APP_STATE.servingAmount * measure.grams);
  const scaled = window.UsdaApi.scaleNutrients(food.nutrientsPer100g, totalGrams);

  const day = getActiveDayDiary();
  const meal = APP_STATE.selectedMeal;

  day[meal].push({
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: food.name,
    category: food.category,
    amount: APP_STATE.servingAmount,
    unit: measure.name.split(' (')[0] || 'serving',
    grams: totalGrams,
    nutrients: scaled,
  });

  saveState();
  closeAddFoodModal();
  renderDashboard();
}

// ==========================================
// Chat / Natural Language Quick Log Handlers
// ==========================================
let _parsedChatResult = null;

async function handleParseChatInput() {
  const textarea = document.getElementById('chat-input-text');
  const text = textarea.value.trim();
  if (!text) {
    alert('Please enter or paste your meal log first.');
    return;
  }

  const parseBtn = document.getElementById('btn-parse-chat');
  parseBtn.disabled = true;
  parseBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Parsing...`;
  if (window.lucide) window.lucide.createIcons();

  try {
    const result = await window.ChatParser.parseChatText(text, APP_STATE.selectedMeal);
    _parsedChatResult = result;
    renderChatParsedPreview(result);
  } catch (err) {
    console.error('Chat parse error:', err);
    alert('Could not parse text. Please check format.');
  } finally {
    parseBtn.disabled = false;
    parseBtn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i> Parse Foods`;
    if (window.lucide) window.lucide.createIcons();
  }
}

function renderChatParsedPreview(result) {
  const container = document.getElementById('chat-parsed-items');
  const wrapper = document.getElementById('chat-parsed-wrapper');
  wrapper.classList.remove('hidden');

  // Set detected meal
  const mealSelect = document.getElementById('chat-meal-select');
  if (mealSelect) mealSelect.value = result.meal || APP_STATE.selectedMeal;

  if (!result.items || result.items.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-600 dark:text-slate-400 text-center py-4">No individual food items detected. Try separating items with commas or newlines.</p>`;
    return;
  }

  container.innerHTML = result.items.map((item, idx) => {
    const n = item.nutrients || {};
    return `
      <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
        <div class="min-w-0 pr-2">
          <div class="font-semibold text-slate-800 dark:text-white truncate">${item.name}</div>
          <div class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            Portion: <span class="font-medium text-emerald-600 dark:text-emerald-400">${item.quantity} ${item.unit} (${item.grams}g)</span>
          </div>
        </div>

        <div class="text-right shrink-0">
          <span class="font-bold text-slate-800 dark:text-slate-200">${Math.round(n.calories || 0)} kcal</span>
          <div class="text-[10px] text-slate-600 dark:text-slate-400 space-x-1">
            <span class="text-emerald-600 dark:text-emerald-400">P:${Math.round(n.protein || 0)}g</span>
            <span class="text-amber-600 dark:text-amber-400">C:${Math.round(n.netCarbs || 0)}g</span>
            <span class="text-rose-600 dark:text-rose-400">F:${Math.round(n.fat || 0)}g</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function confirmAddChatItemsToDiary() {
  if (!_parsedChatResult || !_parsedChatResult.items || _parsedChatResult.items.length === 0) {
    alert('No parsed items to add.');
    return;
  }

  const mealSelect = document.getElementById('chat-meal-select');
  const meal = mealSelect ? mealSelect.value : APP_STATE.selectedMeal;
  const day = getActiveDayDiary();

  _parsedChatResult.items.forEach(item => {
    day[meal].push({
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      category: item.category || 'Chat Log',
      amount: item.quantity,
      unit: item.unit,
      grams: item.grams,
      nutrients: item.nutrients,
    });
  });

  saveState();
  closeAddFoodModal();
  renderDashboard();
}

// ==========================================
// Excel / CSV Import & Export Handlers
// ==========================================
let _parsedExcelEntries = [];

async function handleExcelFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('excel-upload-status');
  statusEl.innerHTML = `<span class="text-emerald-600"><i data-lucide="loader-2" class="w-4 h-4 animate-spin inline mr-1"></i> Reading and matching ${file.name}...</span>`;
  if (window.lucide) window.lucide.createIcons();

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const data = evt.target.result;
      const entries = await window.ExcelHandler.parseExcelFile(data, APP_STATE.activeDate);
      _parsedExcelEntries = entries;
      renderExcelPreview(entries);
      statusEl.innerHTML = `<span class="text-emerald-600 font-medium">✓ Successfully parsed ${entries.length} food rows!</span>`;
    } catch (err) {
      console.error('Excel parse error:', err);
      statusEl.innerHTML = `<span class="text-rose-500 font-medium">Failed to parse spreadsheet: ${err.message}</span>`;
    }
  };
  reader.readAsBinaryString(file);
}

function renderExcelPreview(entries) {
  const container = document.getElementById('excel-preview-list');
  const wrapper = document.getElementById('excel-preview-wrapper');
  wrapper.classList.remove('hidden');

  if (entries.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-600 dark:text-slate-400 text-center py-4">No food rows found in spreadsheet.</p>`;
    return;
  }

  container.innerHTML = entries.map(item => `
    <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
      <div class="min-w-0 pr-3">
        <span class="font-semibold text-slate-800 dark:text-white truncate block">${item.name}</span>
        <span class="text-[11px] text-slate-600 dark:text-slate-400">
          ${item.meal.toUpperCase()} • ${item.amount} ${item.unit} (${item.grams}g) • Date: ${item.date}
        </span>
      </div>
      <div class="text-right shrink-0">
        <span class="font-bold text-slate-800 dark:text-slate-200">${Math.round(item.nutrients.calories || 0)} kcal</span>
        <div class="text-[10px] text-slate-600 dark:text-slate-400 space-x-1">
          <span class="text-emerald-600 dark:text-emerald-400">P:${Math.round(item.nutrients.protein || 0)}g</span>
          <span class="text-amber-600 dark:text-amber-400">C:${Math.round(item.nutrients.netCarbs || 0)}g</span>
          <span class="text-rose-600 dark:text-rose-400">F:${Math.round(item.nutrients.fat || 0)}g</span>
        </div>
      </div>
    </div>
  `).join('');
}

function confirmAddExcelToDiary() {
  if (!_parsedExcelEntries || _parsedExcelEntries.length === 0) {
    alert('No spreadsheet entries to import.');
    return;
  }

  _parsedExcelEntries.forEach(item => {
    const d = item.date || APP_STATE.activeDate;
    if (!APP_STATE.diary[d]) {
      APP_STATE.diary[d] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    }
    const meal = item.meal || 'breakfast';
    APP_STATE.diary[d][meal].push({
      id: `xl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      category: 'Excel Import',
      amount: item.amount,
      unit: item.unit,
      grams: item.grams,
      nutrients: item.nutrients,
    });
  });

  saveState();
  closeAddFoodModal();
  renderDashboard();
  alert(`Imported ${_parsedExcelEntries.length} items to your diary!`);
}

// Custom Food Form Submission
function handleCustomFoodSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('custom-name').value.trim();
  const servingGrams = parseFloat(document.getElementById('custom-grams').value) || 100;
  const calories = parseFloat(document.getElementById('custom-cals').value) || 0;
  const protein = parseFloat(document.getElementById('custom-protein').value) || 0;
  const carbs = parseFloat(document.getElementById('custom-carbs').value) || 0;
  const fat = parseFloat(document.getElementById('custom-fat').value) || 0;
  const fiber = parseFloat(document.getElementById('custom-fiber').value) || 0;
  const sodium = parseFloat(document.getElementById('custom-sodium').value) || 0;

  if (!name) {
    alert('Please enter a food name.');
    return;
  }

  // Calculate 100g base for scaling
  const factor = 100 / servingGrams;
  const customFood = {
    id: `custom-${Date.now()}`,
    name,
    category: 'Custom Foods',
    servingSizeGrams: servingGrams,
    servingUnit: `${servingGrams}g`,
    householdServings: [
      { name: `1 serving (${servingGrams}g)`, grams: servingGrams },
      { name: '100 grams', grams: 100 }
    ],
    nutrientsPer100g: {
      calories: Math.round(calories * factor),
      protein: Math.round(protein * factor * 10) / 10,
      carbs: Math.round(carbs * factor * 10) / 10,
      netCarbs: Math.round((carbs - fiber) * factor * 10) / 10,
      fat: Math.round(fat * factor * 10) / 10,
      fiber: Math.round(fiber * factor * 10) / 10,
      sodium: Math.round(sodium * factor),
    },
    source: 'Custom'
  };

  APP_STATE.customFoods.push(customFood);
  window.UsdaApi.STAPLE_FOODS.unshift(customFood);
  saveState();

  // Add directly to diary for current meal
  const day = getActiveDayDiary();
  day[APP_STATE.selectedMeal].push({
    id: `item-${Date.now()}`,
    name: customFood.name,
    category: 'Custom Foods',
    amount: 1,
    unit: 'serving',
    grams: servingGrams,
    nutrients: {
      calories,
      protein,
      carbs,
      netCarbs: Math.max(0, carbs - fiber),
      fat,
      fiber,
      sodium,
    }
  });

  saveState();
  closeAddFoodModal();
  renderDashboard();
}

// ==========================================
// Settings, Targets & Modal Handlers
// ==========================================
function openTargetsModal() {
  const modal = document.getElementById('targets-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Fill current profile values
  document.getElementById('prof-gender').value = APP_STATE.profile.gender;
  document.getElementById('prof-age').value = APP_STATE.profile.ageYears;
  document.getElementById('prof-weight').value = APP_STATE.profile.weightKg;
  document.getElementById('prof-height').value = APP_STATE.profile.heightCm;
  document.getElementById('prof-activity').value = APP_STATE.profile.activityLevel;
  document.getElementById('prof-goal').value = APP_STATE.profile.goal;

  calculateAndPreviewTargets();
  if (window.lucide) window.lucide.createIcons();
}

function closeTargetsModal() {
  const modal = document.getElementById('targets-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function calculateAndPreviewTargets() {
  const prof = {
    gender: document.getElementById('prof-gender').value,
    ageYears: parseFloat(document.getElementById('prof-age').value) || 28,
    weightKg: parseFloat(document.getElementById('prof-weight').value) || 75,
    heightCm: parseFloat(document.getElementById('prof-height').value) || 175,
    activityLevel: document.getElementById('prof-activity').value,
    goal: document.getElementById('prof-goal').value,
  };

  const calculated = window.TargetsModule.calculateTDEE(prof);
  document.getElementById('calc-bmr').textContent = `${calculated.bmr} kcal`;
  document.getElementById('calc-tdee').textContent = `${calculated.tdee} kcal`;
  document.getElementById('calc-cals').value = calculated.targetCalories;
  document.getElementById('calc-protein').value = calculated.protein;
  document.getElementById('calc-netcarbs').value = calculated.netCarbs;
  document.getElementById('calc-fat').value = calculated.fat;
}

function saveTargetsFromModal() {
  APP_STATE.profile.gender = document.getElementById('prof-gender').value;
  APP_STATE.profile.ageYears = parseFloat(document.getElementById('prof-age').value) || 28;
  APP_STATE.profile.weightKg = parseFloat(document.getElementById('prof-weight').value) || 75;
  APP_STATE.profile.heightCm = parseFloat(document.getElementById('prof-height').value) || 175;
  APP_STATE.profile.activityLevel = document.getElementById('prof-activity').value;
  APP_STATE.profile.goal = document.getElementById('prof-goal').value;

  APP_STATE.profile.customTargets = {
    calories: parseFloat(document.getElementById('calc-cals').value) || 2000,
    protein: parseFloat(document.getElementById('calc-protein').value) || 140,
    netCarbs: parseFloat(document.getElementById('calc-netcarbs').value) || 150,
    fat: parseFloat(document.getElementById('calc-fat').value) || 60,
  };

  saveState();
  closeTargetsModal();
  renderDashboard();
}

function openMobileGuideModal() {
  const modal = document.getElementById('mobile-guide-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  }
}

function closeMobileGuideModal() {
  const modal = document.getElementById('mobile-guide-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.getElementById('usda-api-key-input').value = APP_STATE.apiKey || '';
  const geminiInput = document.getElementById('gemini-api-key-input');
  if (geminiInput) {
    geminiInput.value = localStorage.getItem('gemini_api_key') || '';
  }
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function saveSettingsModal() {
  const key = document.getElementById('usda-api-key-input').value.trim();
  APP_STATE.apiKey = key;

  const geminiInput = document.getElementById('gemini-api-key-input');
  if (geminiInput) {
    const geminiKey = geminiInput.value.trim();
    if (geminiKey) {
      localStorage.setItem('gemini_api_key', geminiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }

  saveState();
  closeSettingsModal();
  showToast('Settings & API Keys saved successfully!');
}

// Clear all diary data
function clearAllData() {
  if (confirm('Are you sure you want to clear your local food diary data? This cannot be undone.')) {
    localStorage.clear();
    location.reload();
  }
}

// Theme Toggle
function toggleTheme() {
  const html = document.documentElement;
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    localStorage.setItem(STORAGE_KEYS.THEME, 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
  }
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadState();
  updateDateUI();
  renderDashboard();
  updateSaveStatusDisplay();

  // Attach search input listener
  const searchInput = document.getElementById('search-food-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleFoodSearchInput);
  }

  // Automatic WhatsApp Meal Sync: checks on load, when switching to tab, and every 10s
  syncWhatsAppMeals();
  window.addEventListener('focus', syncWhatsAppMeals);
  setInterval(syncWhatsAppMeals, 10000);
});

// ==========================================
// WhatsApp Background Auto-Sync
// ==========================================
let _isSyncingWhatsApp = false;

async function syncWhatsAppMeals() {
  if (_isSyncingWhatsApp) return;
  _isSyncingWhatsApp = true;

  const syncBtn = document.getElementById('nav-sync-btn');
  const syncIcon = syncBtn ? syncBtn.querySelector('[data-lucide="refresh-cw"], svg, i') : null;
  if (syncIcon) syncIcon.classList.add('animate-spin');

  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.connected || !data.meals || data.meals.length === 0) return;

    const day = getActiveDayDiary();
    const syncedIds = [];
    let itemsAddedCount = 0;

    for (const entry of data.meals) {
      const entryDate = entry.date || APP_STATE.activeDate;
      if (!APP_STATE.diary[entryDate]) {
        APP_STATE.diary[entryDate] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
      }
      const targetDay = APP_STATE.diary[entryDate];

      const rawMeal = (entry.meal || 'Breakfast').toLowerCase();
      let targetMeal = 'breakfast';
      if (rawMeal.includes('lunch')) targetMeal = 'lunch';
      else if (rawMeal.includes('dinner')) targetMeal = 'dinner';
      else if (rawMeal.includes('snack')) targetMeal = 'snacks';

      if (!targetDay[targetMeal]) targetDay[targetMeal] = [];

      if (Array.isArray(entry.items)) {
        for (const it of entry.items) {
          const qty = it.qty || 1;
          const foodName = it.name || it.displayName || 'Food Item';
          const unit = it.unit || 'serving';
          const grams = it.grams || Math.round(qty * 100);
          const calories = Math.round(it.cals || 0);
          const protein = Math.round((it.p || 0) * 10) / 10;
          const carbs = Math.round((it.c || 0) * 10) / 10;
          const netCarbs = Math.round((it.netCarbs !== undefined ? it.netCarbs : (it.c || 0)) * 10) / 10;
          const fat = Math.round((it.f || 0) * 10) / 10;
          const fiber = Math.round((it.fiber || 0) * 10) / 10;

          targetDay[targetMeal].push({
            id: `wa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: foodName,
            category: 'WhatsApp',
            amount: qty,
            unit: unit,
            grams: grams,
            nutrients: {
              calories: calories,
              protein: protein,
              carbs: carbs,
              netCarbs: netCarbs, // <-- Fixes Net Carbs display & calculations
              fat: fat,
              fiber: fiber
            }
          });
          itemsAddedCount++;
        }
      }
      syncedIds.push(entry.id);
    }

    if (itemsAddedCount > 0) {
      saveState();
      renderDashboard();
      showToast(`📲 Auto-synced ${itemsAddedCount} meal item(s) from WhatsApp!`);

      // Acknowledge sync so meals aren't added again
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncedIds })
      });
    }
  } catch (err) {
    // Silent fail if offline or local server
  } finally {
    if (syncIcon) syncIcon.classList.remove('animate-spin');
    _isSyncingWhatsApp = false;
  }
}
