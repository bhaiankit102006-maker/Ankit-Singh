export interface FoodSeed {
  name: string;
  brand?: string;
  category: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  source: string;
}

export const SEED_FOODS: FoodSeed[] = [
  // Grains & Cereals
  { name: 'Oatmeal (Rolled Oats, Dry)', category: 'Grains & Cereals', serving_size: 100, serving_unit: 'g', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0, sodium: 2, source: 'USDA FoodData' },
  { name: 'Brown Rice (Cooked)', category: 'Grains & Cereals', serving_size: 100, serving_unit: 'g', calories: 123, protein: 2.7, carbs: 25.6, fat: 1.0, fiber: 1.6, sugar: 0.2, sodium: 5, source: 'USDA FoodData' },
  { name: 'White Rice (Cooked)', category: 'Grains & Cereals', serving_size: 100, serving_unit: 'g', calories: 130, protein: 2.4, carbs: 28.2, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1, source: 'USDA FoodData' },
  { name: 'Whole Wheat Bread', brand: 'Bakery', category: 'Grains & Cereals', serving_size: 50, serving_unit: 'g (1 slice)', calories: 125, protein: 5.0, carbs: 22.0, fat: 1.8, fiber: 3.5, sugar: 2.5, sodium: 220, source: 'USDA FoodData' },
  { name: 'Whole Wheat Roti / Chapati', category: 'Grains & Cereals', serving_size: 40, serving_unit: 'g (1 roti)', calories: 110, protein: 3.5, carbs: 21.0, fat: 1.5, fiber: 2.8, sugar: 0.3, sodium: 90, source: 'NutriTrack Nutrition DB' },
  { name: 'Quinoa (Cooked)', category: 'Grains & Cereals', serving_size: 100, serving_unit: 'g', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7, source: 'USDA FoodData' },
  { name: 'Whole Grain Pasta (Cooked)', category: 'Grains & Cereals', serving_size: 100, serving_unit: 'g', calories: 124, protein: 5.3, carbs: 26.5, fat: 0.5, fiber: 3.9, sugar: 0.6, sodium: 4, source: 'USDA FoodData' },
  { name: 'Sweet Potato (Baked)', category: 'Vegetables & Roots', serving_size: 100, serving_unit: 'g', calories: 90, protein: 2.0, carbs: 20.7, fat: 0.1, fiber: 3.3, sugar: 6.5, sodium: 36, source: 'USDA FoodData' },

  // Proteins & Meats
  { name: 'Chicken Breast (Grilled/Cooked)', category: 'Meat & Poultry', serving_size: 100, serving_unit: 'g', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0, sugar: 0.0, sodium: 74, source: 'USDA FoodData' },
  { name: 'Whole Egg (Boiled)', category: 'Eggs & Poultry', serving_size: 50, serving_unit: 'g (1 large)', calories: 74, protein: 6.3, carbs: 0.4, fat: 5.0, fiber: 0.0, sugar: 0.2, sodium: 62, source: 'USDA FoodData' },
  { name: 'Egg White (Boiled)', category: 'Eggs & Poultry', serving_size: 33, serving_unit: 'g (1 egg white)', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, fiber: 0.0, sugar: 0.2, sodium: 55, source: 'USDA FoodData' },
  { name: 'Atlantic Salmon (Baked)', category: 'Seafood', serving_size: 100, serving_unit: 'g', calories: 206, protein: 22.1, carbs: 0.0, fat: 12.3, fiber: 0.0, sugar: 0.0, sodium: 61, source: 'USDA FoodData' },
  { name: 'Canned Tuna in Water (Drained)', category: 'Seafood', serving_size: 100, serving_unit: 'g', calories: 116, protein: 26.0, carbs: 0.0, fat: 1.0, fiber: 0.0, sugar: 0.0, sodium: 330, source: 'USDA FoodData' },
  { name: 'Lean Ground Beef (90/10, Cooked)', category: 'Meat & Poultry', serving_size: 100, serving_unit: 'g', calories: 215, protein: 26.1, carbs: 0.0, fat: 11.5, fiber: 0.0, sugar: 0.0, sodium: 70, source: 'USDA FoodData' },

  // Dairy & Vegetarian Proteins
  { name: 'Greek Yogurt (Plain, Non-Fat)', category: 'Dairy & Alternatives', serving_size: 100, serving_unit: 'g', calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4, fiber: 0.0, sugar: 3.2, sodium: 36, source: 'USDA FoodData' },
  { name: 'Paneer (Indian Cottage Cheese)', category: 'Dairy & Alternatives', serving_size: 100, serving_unit: 'g', calories: 265, protein: 18.3, carbs: 3.4, fat: 20.8, fiber: 0.0, sugar: 2.6, sodium: 22, source: 'NutriTrack Nutrition DB' },
  { name: 'Tofu (Firm)', category: 'Plant Protein', serving_size: 100, serving_unit: 'g', calories: 83, protein: 10.0, carbs: 2.3, fat: 5.3, fiber: 1.0, sugar: 0.5, sodium: 14, source: 'USDA FoodData' },
  { name: 'Cow Milk (Toned 2% Milk)', category: 'Dairy & Alternatives', serving_size: 240, serving_unit: 'ml (1 cup)', calories: 122, protein: 8.0, carbs: 12.0, fat: 4.8, fiber: 0.0, sugar: 12.0, sodium: 115, source: 'USDA FoodData' },
  { name: 'Almond Milk (Unsweetened)', category: 'Dairy & Alternatives', serving_size: 240, serving_unit: 'ml (1 cup)', calories: 30, protein: 1.0, carbs: 1.0, fat: 2.5, fiber: 0.5, sugar: 0.0, sodium: 170, source: 'NutriTrack Nutrition DB' },
  { name: 'Whey Protein Powder', brand: 'Standard', category: 'Supplements', serving_size: 30, serving_unit: 'g (1 scoop)', calories: 120, protein: 24.0, carbs: 2.0, fat: 1.5, fiber: 0.5, sugar: 1.0, sodium: 130, source: 'NutriTrack Nutrition DB' },
  { name: 'Yellow Lentils / Moong Dal (Cooked)', category: 'Plant Protein', serving_size: 100, serving_unit: 'g', calories: 116, protein: 7.9, carbs: 20.2, fat: 0.4, fiber: 4.5, sugar: 1.2, sodium: 6, source: 'NutriTrack Nutrition DB' },
  { name: 'Chickpeas / Garbanzo (Cooked)', category: 'Plant Protein', serving_size: 100, serving_unit: 'g', calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6, sugar: 4.8, sodium: 7, source: 'USDA FoodData' },
  { name: 'Black Beans (Cooked)', category: 'Plant Protein', serving_size: 100, serving_unit: 'g', calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7, sugar: 0.3, sodium: 2, source: 'USDA FoodData' },

  // Vegetables & Greens
  { name: 'Broccoli (Steamed)', category: 'Vegetables & Roots', serving_size: 100, serving_unit: 'g', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3, sugar: 1.4, sodium: 41, source: 'USDA FoodData' },
  { name: 'Spinach (Raw)', category: 'Vegetables & Roots', serving_size: 100, serving_unit: 'g', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79, source: 'USDA FoodData' },
  { name: 'Cucumber (Raw with peel)', category: 'Vegetables & Roots', serving_size: 100, serving_unit: 'g', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2, source: 'USDA FoodData' },
  { name: 'Tomatoes (Ripe, Raw)', category: 'Vegetables & Roots', serving_size: 100, serving_unit: 'g', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5, source: 'USDA FoodData' },
  { name: 'Mixed Green Salad (No dressing)', category: 'Vegetables & Roots', serving_size: 100, serving_unit: 'g', calories: 17, protein: 1.5, carbs: 3.3, fat: 0.2, fiber: 1.9, sugar: 1.2, sodium: 25, source: 'NutriTrack Nutrition DB' },

  // Fruits
  { name: 'Banana (Raw)', category: 'Fruits', serving_size: 118, serving_unit: 'g (1 medium)', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.4, fiber: 3.1, sugar: 14.4, sodium: 1, source: 'USDA FoodData' },
  { name: 'Apple (With skin, Raw)', category: 'Fruits', serving_size: 150, serving_unit: 'g (1 medium)', calories: 78, protein: 0.4, carbs: 21.0, fat: 0.3, fiber: 3.6, sugar: 15.5, sodium: 2, source: 'USDA FoodData' },
  { name: 'Blueberries (Fresh)', category: 'Fruits', serving_size: 100, serving_unit: 'g', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 9.9, sodium: 1, source: 'USDA FoodData' },
  { name: 'Orange (Raw)', category: 'Fruits', serving_size: 131, serving_unit: 'g (1 medium)', calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1, sugar: 12.2, sodium: 0, source: 'USDA FoodData' },
  { name: 'Avocado (Raw)', category: 'Fruits', serving_size: 100, serving_unit: 'g', calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7, sodium: 7, source: 'USDA FoodData' },

  // Healthy Fats & Nuts
  { name: 'Almonds (Raw)', category: 'Nuts & Seeds', serving_size: 28, serving_unit: 'g (approx 23 nuts)', calories: 164, protein: 6.0, carbs: 6.1, fat: 14.2, fiber: 3.5, sugar: 1.2, sodium: 1, source: 'USDA FoodData' },
  { name: 'Walnuts (Raw)', category: 'Nuts & Seeds', serving_size: 28, serving_unit: 'g', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, sugar: 0.7, sodium: 1, source: 'USDA FoodData' },
  { name: 'Peanut Butter (Natural)', category: 'Nuts & Seeds', serving_size: 32, serving_unit: 'g (2 tbsp)', calories: 188, protein: 8.0, carbs: 7.0, fat: 16.0, fiber: 2.0, sugar: 2.0, sodium: 150, source: 'USDA FoodData' },
  { name: 'Extra Virgin Olive Oil', category: 'Oils & Fats', serving_size: 14, serving_unit: 'g (1 tbsp)', calories: 119, protein: 0.0, carbs: 0.0, fat: 13.5, fiber: 0.0, sugar: 0.0, sodium: 0, source: 'USDA FoodData' },
  { name: 'Chia Seeds', category: 'Nuts & Seeds', serving_size: 15, serving_unit: 'g (1 tbsp)', calories: 73, protein: 2.5, carbs: 6.3, fat: 4.6, fiber: 5.1, sugar: 0.0, sodium: 2, source: 'USDA FoodData' },

  // Beverages & Hydration
  { name: 'Green Tea (Brewed, Unsweetened)', category: 'Beverages', serving_size: 240, serving_unit: 'ml (1 cup)', calories: 2, protein: 0.5, carbs: 0.0, fat: 0.0, fiber: 0.0, sugar: 0.0, sodium: 2, source: 'USDA FoodData' },
  { name: 'Black Coffee (No Sugar/Milk)', category: 'Beverages', serving_size: 240, serving_unit: 'ml (1 cup)', calories: 2, protein: 0.3, carbs: 0.0, fat: 0.0, fiber: 0.0, sugar: 0.0, sodium: 5, source: 'USDA FoodData' },
  { name: 'Coconut Water (Natural)', category: 'Beverages', serving_size: 240, serving_unit: 'ml (1 cup)', calories: 45, protein: 1.7, carbs: 8.9, fat: 0.5, fiber: 2.6, sugar: 6.3, sodium: 252, source: 'NutriTrack Nutrition DB' }
];
