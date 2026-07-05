export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium?: number;
  sugar?: number;
}

export interface Food {
  id: string;
  name: string;
  name_si?: string;
  name_ta?: string;
  category: string;
  short_description: string;
  description: string;
  image_url: string;
  image_urls?: string[];
  ingredients: Ingredient[];
  preparation_steps: string[];
  cooking_time: number;
  prep_time: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  nutrition: Nutrition;
  good_points: string[];
  bad_points: string[];
  tips: string[];
  serving_suggestions: string[];
  cultural_significance?: string;
  region?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';