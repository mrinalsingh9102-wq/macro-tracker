# NutriTrack 🥗
> A precision nutrition, macronutrient, and micronutrient tracking application inspired by **Cronometer**, powered by **4 free global databases** with live barcode scanning, natural language chat logging, and Excel spreadsheet import/export.

---

## 🌐 4 Free Integrated Nutrition Databases

NutriTrack integrates multiple public, open-source nutrition databases so you never get stuck behind rate limits or missing items:

1. **🏛️ USDA FoodData Central (Official US Standard):**
   * Gold-standard reference for whole foods, raw ingredients, and deep micronutrients (Vitamins A/C/D/E/K, B-complex, Magnesium, Potassium, Zinc, Iron, Electrolytes).
   * Live API connection (`Foundation`, `SR Legacy`, `Survey`, and `Branded`).

2. **🌍 CIQUAL / Global Food Database (5,000+ Foods Offline):**
   * Loaded directly into the app (`global-foods.js`) with **zero network latency** and **100% offline reliability**.
   * Comprehensive coverage of cooked/raw meats, poultry, seafood, grains, pasta, dairy, fruits, vegetables, baked goods, and international dishes.

3. **📦 Open Food Facts (Packaged Foods & Barcode Scanner):**
   * Crowdsourced database of millions of packaged supermarket foods from around the world.
   * **Barcode Search:** Type any 8–14 digit barcode (e.g. `3017620422003` for Nutella) into the search box to fetch instant package nutrition!

4. **⚡ Curated High-Density Staples & Fitness Nutrition:**
   * Hand-curated with rich micronutrients and instant household serving sizes:
     * **Coffees & Teas:** Black brewed coffee, Espresso shots, Cold brew, Lattes, Green tea.
     * **Dairy & Plant Milks:** Whole milk, 2%, Skim, Almond milk, Oat milk, Soy milk, Heavy cream.
     * **Gym Supplements:** Creatine Monohydrate (5g scoop), Whey Isolate, Casein, Pre-workout, Fish Oil, LMNT Electrolytes.
     * **Proteins & Produce:** Chicken breast, Eggs, Ground beef, Atlantic salmon, Tuna, Avocado, Sweet potato, Rolled oats, Jasmine rice.

---

## 🌟 Key Features

### 1. 🎯 Cronometer-Grade Macronutrient & Calorie Gauges
* **Real-time Calorie Balance Ring:** Tracks consumed calories vs. daily target and calculates remaining energy allowance.
* **Macronutrient Progress Gauges:** Circular indicators for **Protein**, **Net Carbs** (`Total Carbs – Dietary Fiber`), **Total Fat**, and **Dietary Fiber**.

### 2. 🔬 Deep Micronutrient Breakdown
Tracks complete micronutrient profiles against Recommended Daily Values (DV% / RDA):
* **Vitamins:** Vitamin A, C, D, E, K, B1, B2, B3, B6, Folate (B9), B12.
* **Minerals & Electrolytes:** Sodium, Potassium, Calcium, Magnesium, Iron, Phosphorus, Zinc, Copper, Manganese, Selenium.
* **Lipids & Fats:** Saturated Fat, Monounsaturated Fat, Polyunsaturated Fat, Omega-3, Omega-6, Cholesterol.

### 3. 💬 Natural Language "Chat Experience" Quick Log
Log meals conversationally:
> *"Breakfast: 3 large eggs, 2 slices whole wheat toast, 1 tbsp butter, 1 black coffee"*  
> *"Lunch: 150g grilled chicken breast, 1 cup jasmine rice, 100g steamed broccoli"*  
> *"Snack: 1 scoop whey protein, 5g creatine monohydrate, 1 cup oat milk"*

### 4. 📊 Excel & CSV Spreadsheet Hub
* **Import:** Upload `.xlsx`, `.xls`, or `.csv` files with automatic nutrient resolution.
* **Download Template:** Generates starter spreadsheet templates ready for batch meal logging.
* **Export Diary:** One-click export of your logs to Excel.

### 5. ⚙️ TDEE & BMR Metabolic Calculator
* Mifflin-St Jeor formula based on age, gender, weight, height, and activity level.
* Goal presets: Fat Loss (-500 kcal), Maintenance, Lean Muscle Gain (+500 kcal).

---

## 🚀 How to Run the App

* **Local Web Server (Recommended):**  
  [http://localhost:8080/](http://localhost:8080/)

* **Direct File Access:**  
  [index.html](file:///C:/Users/mrian/.gemini/antigravity/scratch/macro-tracker/index.html)
