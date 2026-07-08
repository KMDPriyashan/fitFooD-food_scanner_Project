export interface UserHealthProfile {
  age: string;
  weight: string;
  height: string;
  healthConditions: string[];
  dietaryPreferences: string[];
  healthGoals: string[];
  availableIngredients: string[];
  pastEatingHabits?: string;
}

export interface Recipe {
  id: string;
  name: string;
  nameSi?: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  prepTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  healthScore: number;
  suitabilityReason: string;
  dietaryTags: string[];
  image: string;
  tips: string[];
  whyRecommended: string;
}

export const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🌱' },
  { id: 'vegan', label: 'Vegan', icon: '🌿' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🚫' },
  { id: 'keto', label: 'Keto', icon: '🥩' },
  { id: 'low-carb', label: 'Low-Carb', icon: '🥑' },
  { id: 'high-protein', label: 'High-Protein', icon: '💪' },
];

export const HEALTH_GOALS = [
  { id: 'weight-loss', label: 'Weight Loss', icon: '⚖️' },
  { id: 'muscle-gain', label: 'Muscle Gain', icon: '💪' },
  { id: 'maintenance', label: 'Maintenance', icon: '⚖️' },
  { id: 'diabetes-management', label: 'Diabetes Management', icon: '🩸' },
  { id: 'heart-health', label: 'Heart Health', icon: '❤️' },
  { id: 'general-wellness', label: 'General Wellness', icon: '😊' },
];

export const HEALTH_CONDITIONS = [
  'Diabetes',
  'High Blood Pressure',
  'High Cholesterol',
  'Heart Disease',
  'Thyroid Issues',
  'Anemia',
  'None',
];