// app/types/meal-planner.types.ts

export interface Meal {
  id: string;
  name: string;
  time: string; // "07:00"
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string[]; // Food names
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  preparationTime?: number; // minutes
  recipe?: string;
  isFavorite?: boolean;
  notes?: string;
  completed: boolean;
}

export interface DailyMealPlan {
  id: string;
  date: string; // "2024-01-15"
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
  caloriesGoal: number;
  notes?: string;
}

export interface MealTemplate {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  preparationTime?: number;
  recipe?: string;
  icon?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'meat' | 'spices' | 'other';
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface MealReminder {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string; // "07:00"
  enabled: boolean;
  days: number[]; // 0=Sunday, 1=Monday, ...
}

export interface NutritionGoal {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  waterGoal: number;
}