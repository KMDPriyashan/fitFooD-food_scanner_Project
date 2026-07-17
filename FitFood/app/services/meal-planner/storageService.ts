// app/services/meal-planner/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyMealPlan, Meal, MealTemplate, ShoppingItem, NutritionGoal } from '../../../types/meal-planner.types';

const STORAGE_KEYS = {
  MEAL_PLANS: '@meal_plans',
  TEMPLATES: '@meal_templates',
  SHOPPING_LIST: '@shopping_list',
  FAVORITES: '@favorite_meals',
  NUTRITION_GOAL: '@nutrition_goal',
  WATER_INTAKE: '@water_intake',
};

// ============================================
// MEAL PLANS
// ============================================
export const saveMealPlans = async (plans: DailyMealPlan[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(plans));
  } catch (error) {
    console.error('Error saving meal plans:', error);
  }
};

export const getMealPlans = async (): Promise<DailyMealPlan[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MEAL_PLANS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting meal plans:', error);
    return [];
  }
};

export const getTodayMealPlan = async (): Promise<DailyMealPlan | null> => {
  try {
    const plans = await getMealPlans();
    const today = new Date().toISOString().split('T')[0];
    return plans.find(plan => plan.date === today) || null;
  } catch (error) {
    console.error('Error getting today meal plan:', error);
    return null;
  }
};

export const saveTodayMealPlan = async (plan: DailyMealPlan): Promise<void> => {
  try {
    const plans = await getMealPlans();
    const index = plans.findIndex(p => p.date === plan.date);
    if (index !== -1) {
      plans[index] = plan;
    } else {
      plans.push(plan);
    }
    await saveMealPlans(plans);
  } catch (error) {
    console.error('Error saving today meal plan:', error);
  }
};

// ============================================
// SHOPPING LIST
// ============================================
export const saveShoppingList = async (items: ShoppingItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving shopping list:', error);
  }
};

export const getShoppingList = async (): Promise<ShoppingItem[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting shopping list:', error);
    return [];
  }
};

// ============================================
// FAVORITES
// ============================================
export const getFavoriteMeals = async (): Promise<Meal[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const saveFavoriteMeals = async (meals: Meal[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(meals));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

export const toggleFavorite = async (meal: Meal): Promise<boolean> => {
  try {
    const favorites = await getFavoriteMeals();
    const index = favorites.findIndex(m => m.id === meal.id);
    if (index !== -1) {
      favorites.splice(index, 1);
      await saveFavoriteMeals(favorites);
      return false;
    } else {
      favorites.push({ ...meal, isFavorite: true });
      await saveFavoriteMeals(favorites);
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};

// ============================================
// NUTRITION GOAL
// ============================================
export const getNutritionGoal = async (): Promise<NutritionGoal> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION_GOAL);
    if (data) {
      return JSON.parse(data);
    }
    return {
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: 250,
      dailyFat: 65,
      waterGoal: 8,
    };
  } catch (error) {
    console.error('Error getting nutrition goal:', error);
    return {
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: 250,
      dailyFat: 65,
      waterGoal: 8,
    };
  }
};

export const saveNutritionGoal = async (goal: NutritionGoal): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NUTRITION_GOAL, JSON.stringify(goal));
  } catch (error) {
    console.error('Error saving nutrition goal:', error);
  }
};

// ============================================
// WATER INTAKE
// ============================================
export const getWaterIntake = async (date: string): Promise<number> => {
  try {
    const key = `@water_intake_${date}`;
    const data = await AsyncStorage.getItem(key);
    return data ? parseInt(data, 10) : 0;
  } catch (error) {
    console.error('Error getting water intake:', error);
    return 0;
  }
};

export const saveWaterIntake = async (date: string, amount: number): Promise<void> => {
  try {
    const key = `@water_intake_${date}`;
    await AsyncStorage.setItem(key, amount.toString());
  } catch (error) {
    console.error('Error saving water intake:', error);
  }
};

export const addWaterIntake = async (date: string, amount: number): Promise<number> => {
  try {
    const current = await getWaterIntake(date);
    const newAmount = current + amount;
    await saveWaterIntake(date, newAmount);
    return newAmount;
  } catch (error) {
    console.error('Error adding water intake:', error);
    return 0;
  }
};