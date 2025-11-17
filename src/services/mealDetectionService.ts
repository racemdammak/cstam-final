// Simulated AI meal detection service
// In production, this would connect to your ML model or API

export interface MealItem {
  name: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealAnalysis {
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealName: string;
  suggestion: string;
}

// Simulated meal database for demonstration
const MEAL_DATABASE: Record<string, MealItem> = {
  chicken: { name: "Grilled Chicken Breast", confidence: 0.95, calories: 231, protein: 43, carbs: 0, fat: 5 },
  rice: { name: "Steamed White Rice", confidence: 0.92, calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  quinoa: { name: "Quinoa", confidence: 0.88, calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
  broccoli: { name: "Steamed Broccoli", confidence: 0.85, calories: 25, protein: 3, carbs: 5, fat: 0.4 },
  salmon: { name: "Grilled Salmon", confidence: 0.93, calories: 206, protein: 28, carbs: 0, fat: 10 },
  pasta: { name: "Pasta", confidence: 0.90, calories: 131, protein: 5, carbs: 25, fat: 1 },
  salad: { name: "Green Salad", confidence: 0.82, calories: 15, protein: 1, carbs: 3, fat: 0.2 },
  eggs: { name: "Scrambled Eggs", confidence: 0.91, calories: 140, protein: 12, carbs: 1, fat: 10 },
  avocado: { name: "Avocado", confidence: 0.87, calories: 160, protein: 2, carbs: 9, fat: 15 },
  yogurt: { name: "Greek Yogurt", confidence: 0.89, calories: 100, protein: 10, carbs: 6, fat: 5 },
  bread: { name: "Whole Wheat Bread", confidence: 0.86, calories: 81, protein: 4, carbs: 15, fat: 1 },
  oatmeal: { name: "Oatmeal", confidence: 0.88, calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
};

// Simulated AI detection function
function detectFoodItems(imageData: string): MealItem[] {
  // In a real implementation, this would call your ML model
  // For now, we'll simulate random detection based on common combinations
  
  const commonMeals = [
    [MEAL_DATABASE.chicken, MEAL_DATABASE.rice, MEAL_DATABASE.broccoli],
    [MEAL_DATABASE.salmon, MEAL_DATABASE.quinoa, MEAL_DATABASE.salad],
    [MEAL_DATABASE.eggs, MEAL_DATABASE.bread, MEAL_DATABASE.avocado],
    [MEAL_DATABASE.pasta, MEAL_DATABASE.salad],
    [MEAL_DATABASE.oats, MEAL_DATABASE.yogurt],
  ];

  const randomMeal = commonMeals[Math.floor(Math.random() * commonMeals.length)];
  
  // Add some randomness to portion sizes
  return randomMeal.map(item => ({
    ...item,
    calories: Math.round(item.calories * (0.8 + Math.random() * 0.4)),
    protein: Math.round(item.protein * (0.8 + Math.random() * 0.4) * 10) / 10,
    carbs: Math.round(item.carbs * (0.8 + Math.random() * 0.4) * 10) / 10,
    fat: Math.round(item.fat * (0.8 + Math.random() * 0.4) * 10) / 10,
  }));
}

function generateMealName(items: MealItem[]): string {
  const itemNames = items.map(item => item.name);
  
  if (items.length === 1) {
    return itemNames[0];
  }
  
  // Create a descriptive meal name
  const mainItems = itemNames.slice(0, 2);
  if (items.length > 2) {
    return `${mainItems.join(" with ")} and ${items.length - 2} more items`;
  }
  return mainItems.join(" with ");
}

function generateSuggestion(analysis: MealAnalysis): string {
  const { totalCalories, totalProtein, totalCarbs, totalFat } = analysis;
  
  const suggestions = [];
  
  if (totalCalories < 300) {
    suggestions.push("This is a light meal. Consider adding more protein or healthy carbs for sustained energy.");
  } else if (totalCalories > 800) {
    suggestions.push("This is a hearty meal! Great for replenishing energy after exercise.");
  } else {
    suggestions.push("Well-balanced portion size! This meal provides good nutrition.");
  }
  
  const proteinPercentage = (totalProtein * 4 / totalCalories) * 100;
  if (proteinPercentage < 15) {
    suggestions.push("Consider adding more protein sources like chicken, fish, or legumes.");
  } else if (proteinPercentage > 30) {
    suggestions.push("High protein content! Great for muscle maintenance and satiety.");
  }
  
  if (totalCarbs < 20) {
    suggestions.push("Low in carbohydrates. Add whole grains or fruits for balanced nutrition.");
  }
  
  return suggestions.join(" ");
}

export async function analyzeMealImage(
  imageData: string,
  description?: string
): Promise<MealAnalysis> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Detect food items from image
  const items = detectFoodItems(imageData);
  
  // Calculate totals
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  
  // Generate meal name and suggestion
  const mealName = generateMealName(items);
  const suggestion = generateSuggestion({
    items,
    ...totals,
    mealName,
    suggestion: "",
  });
  
  return {
    items,
    ...totals,
    mealName,
    suggestion,
  };
}
