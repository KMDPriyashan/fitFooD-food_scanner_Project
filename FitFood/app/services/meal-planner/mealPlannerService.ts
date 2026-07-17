// app/services/meal-planner/mealPlannerService.ts
import { DailyMealPlan, Meal, ShoppingItem, MealTemplate, NutritionGoal } from '../../../types/meal-planner.types';
import * as Storage from './storageService';
import { getTemplatesByType } from './mealTemplates';

// ✅ Keep ONLY ONE generateUUID function at the top
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ============================================
// MEAL PLAN CRUD OPERATIONS
// ============================================

export const createDailyPlan = async (date?: string): Promise<DailyMealPlan> => {
  const today = date || new Date().toISOString().split('T')[0];
  const goal = await Storage.getNutritionGoal();
  
  return {
    id: generateUUID(),
    date: today,
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    waterIntake: 0,
    caloriesGoal: goal.dailyCalories,
  };
};

export const getOrCreateTodayPlan = async (): Promise<DailyMealPlan> => {
  const today = new Date().toISOString().split('T')[0];
  let plan = await Storage.getTodayMealPlan();
  
  if (!plan) {
    plan = await createDailyPlan(today);
    await Storage.saveTodayMealPlan(plan);
  }
  
  return plan;
};

export const addMealToPlan = async (meal: Meal): Promise<DailyMealPlan> => {
  const plan = await getOrCreateTodayPlan();
  plan.meals.push(meal);
  updateTotals(plan);
  await Storage.saveTodayMealPlan(plan);
  return plan;
};

export const updateMeal = async (mealId: string, updatedMeal: Meal): Promise<DailyMealPlan> => {
  const plan = await getOrCreateTodayPlan();
  const index = plan.meals.findIndex(m => m.id === mealId);
  if (index !== -1) {
    plan.meals[index] = updatedMeal;
    updateTotals(plan);
    await Storage.saveTodayMealPlan(plan);
  }
  return plan;
};

export const deleteMeal = async (mealId: string): Promise<DailyMealPlan> => {
  const plan = await getOrCreateTodayPlan();
  plan.meals = plan.meals.filter(m => m.id !== mealId);
  updateTotals(plan);
  await Storage.saveTodayMealPlan(plan);
  return plan;
};

export const toggleMealComplete = async (mealId: string): Promise<DailyMealPlan> => {
  const plan = await getOrCreateTodayPlan();
  const meal = plan.meals.find(m => m.id === mealId);
  if (meal) {
    meal.completed = !meal.completed;
    await Storage.saveTodayMealPlan(plan);
  }
  return plan;
};

export const clearTodayPlan = async (): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  const plans = await Storage.getMealPlans();
  const filtered = plans.filter(p => p.date !== today);
  await Storage.saveMealPlans(filtered);
};

// ============================================
// NUTRITION CALCULATIONS
// ============================================

export const updateTotals = (plan: DailyMealPlan): void => {
  plan.totalCalories = plan.meals.reduce((sum, m) => sum + m.calories, 0);
  plan.totalProtein = plan.meals.reduce((sum, m) => sum + m.protein, 0);
  plan.totalCarbs = plan.meals.reduce((sum, m) => sum + m.carbs, 0);
  plan.totalFat = plan.meals.reduce((sum, m) => sum + m.fat, 0);
};

export const getNutritionProgress = async (): Promise<any> => {
  const plan = await getOrCreateTodayPlan();
  const goal = await Storage.getNutritionGoal();
  
  return {
    calories: {
      current: plan.totalCalories,
      goal: goal.dailyCalories,
      percentage: Math.min((plan.totalCalories / goal.dailyCalories) * 100, 100),
    },
    protein: {
      current: plan.totalProtein,
      goal: goal.dailyProtein,
      percentage: Math.min((plan.totalProtein / goal.dailyProtein) * 100, 100),
    },
    carbs: {
      current: plan.totalCarbs,
      goal: goal.dailyCarbs,
      percentage: Math.min((plan.totalCarbs / goal.dailyCarbs) * 100, 100),
    },
    fat: {
      current: plan.totalFat,
      goal: goal.dailyFat,
      percentage: Math.min((plan.totalFat / goal.dailyFat) * 100, 100),
    },
    water: {
      current: plan.waterIntake,
      goal: goal.waterGoal,
      percentage: Math.min((plan.waterIntake / goal.waterGoal) * 100, 100),
    },
  };
};

// ============================================
// SHOPPING LIST
// ============================================

export const generateShoppingList = async (): Promise<ShoppingItem[]> => {
  const plan = await getOrCreateTodayPlan();
  const items: ShoppingItem[] = [];
  const foodMap = new Map<string, { quantity: number; category: string; unit: string }>();
  
  plan.meals.forEach(meal => {
    meal.foods.forEach(food => {
      const existing = foodMap.get(food);
      if (existing) {
        existing.quantity += 0.5;
      } else {
        foodMap.set(food, {
          quantity: 1,
          category: 'other',
          unit: 'unit',
        });
      }
    });
  });
  
  foodMap.forEach((value, key) => {
    items.push({
      id: generateUUID(),
      name: key,
      category: getCategoryForFood(key),
      quantity: value.quantity,
      unit: value.unit,
      checked: false,
    });
  });
  
  await Storage.saveShoppingList(items);
  return items;
};

const getCategoryForFood = (food: string): ShoppingItem['category'] => {
  const vegetable = ['Carrot', 'Tomato', 'Lettuce', 'Broccoli', 'Spinach', 'Potato', 'Onion', 'Garlic'];
  const fruits = ['Apple', 'Banana', 'Orange', 'Strawberry', 'Mango', 'Avocado'];
  const grains = ['Rice', 'Pasta', 'Bread', 'Oats', 'Quinoa'];
  const dairy = ['Milk', 'Yogurt', 'Cheese', 'Butter'];
  const meat = ['Chicken', 'Fish', 'Salmon', 'Minced Meat', 'Tofu'];
  const spices = ['Curry Powder', 'Soy Sauce', 'Olive Oil', 'Honey', 'Peanut Butter'];
  
  if (vegetable.includes(food)) return 'vegetables';
  if (fruits.includes(food)) return 'fruits';
  if (grains.includes(food)) return 'grains';
  if (dairy.includes(food)) return 'dairy';
  if (meat.includes(food)) return 'meat';
  if (spices.includes(food)) return 'spices';
  return 'other';
};

// ============================================
// MEAL TEMPLATE OPERATIONS
// ============================================

export const createMealFromTemplate = (template: MealTemplate): Meal => {
  return {
    id: generateUUID(),
    name: template.name,
    time: getDefaultTime(template.type),
    type: template.type,
    foods: template.foods,
    calories: template.calories,
    protein: template.protein,
    carbs: template.carbs,
    fat: template.fat,
    preparationTime: template.preparationTime,
    recipe: template.recipe,
    isFavorite: false,
    completed: false,
  };
};

const getDefaultTime = (type: string): string => {
  const times: Record<string, string> = {
    breakfast: '07:00',
    lunch: '12:00',
    dinner: '19:00',
    snack: '10:00',
  };
  return times[type] || '12:00';
};

// ============================================
// FAVORITE MEALS
// ============================================

export const toggleFavorite = async (meal: Meal): Promise<boolean> => {
  return await Storage.toggleFavorite(meal);
};

export const getFavorites = async (): Promise<Meal[]> => {
  return await Storage.getFavoriteMeals();
};

export const addFavoriteFromPlan = async (mealId: string): Promise<void> => {
  const plan = await getOrCreateTodayPlan();
  const meal = plan.meals.find(m => m.id === mealId);
  if (meal) {
    await Storage.toggleFavorite(meal);
  }
};

// ============================================
// WATER INTAKE
// ============================================

export const addWater = async (amount: number): Promise<DailyMealPlan> => {
  const plan = await getOrCreateTodayPlan();
  plan.waterIntake += amount;
  await Storage.saveTodayMealPlan(plan);
  return plan;
};

export const getWaterProgress = async (): Promise<number> => {
  const plan = await getOrCreateTodayPlan();
  const goal = await Storage.getNutritionGoal();
  return Math.min((plan.waterIntake / goal.waterGoal) * 100, 100);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// ✅ Keep ONLY ONE getMealTypeColor and getMealTypeIcon
export const getMealTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    breakfast: '#FF6B6B',
    lunch: '#4ECDC4',
    dinner: '#45B7D1',
    snack: '#96CEB4',
  };
  return colors[type] || '#999';
};

export const getMealTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍿',
  };
  return icons[type] || '🍽️';
};

// ❌ REMOVED duplicate generateUUID at the bottom