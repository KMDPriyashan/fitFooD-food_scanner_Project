import { supabase } from '../../src/lib/supabase';

export interface Recipe {
  id: string;
  name: string;
  name_si?: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number;
  prep_time: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  health_score: number;
  dietary_tags: string[];
  health_goals: string[];
  health_conditions: string[];
  suitable_for: string[];
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  image_url: string;
  why_recommended: string;
  tips: string[];
}

export interface UserProfile {
  age: string;
  weight: string;
  healthConditions: string[];
  dietaryPreferences: string[];
  healthGoals: string[];
  availableIngredients: string[];
  pastEatingHabits?: string;
}

// ============================================
// SCORE RECIPE BASED ON USER PROFILE
// ============================================
const scoreRecipe = (recipe: Recipe, profile: UserProfile): { score: number; matchedCriteria: number } => {
  let score = recipe.health_score || 70; // Base score from recipe health_score
  let matchedCriteria = 0;
  
  // ============================================
  // 1. DIETARY PREFERENCES MATCHING (0-30 points)
  // ============================================
  if (profile.dietaryPreferences && profile.dietaryPreferences.length > 0) {
    let dietaryMatches = 0;
    
    profile.dietaryPreferences.forEach(pref => {
      if (pref === 'vegetarian' && recipe.is_vegetarian) {
        dietaryMatches++;
        matchedCriteria++;
      }
      else if (pref === 'vegan' && recipe.is_vegan) {
        dietaryMatches++;
        matchedCriteria++;
      }
      else if (pref === 'gluten-free' && recipe.is_gluten_free) {
        dietaryMatches++;
        matchedCriteria++;
      }
      else if (pref === 'high-protein' && recipe.dietary_tags?.includes('high-protein')) {
        dietaryMatches++;
        matchedCriteria++;
      }
      else if (pref === 'low-carb' && recipe.dietary_tags?.includes('low-carb')) {
        dietaryMatches++;
        matchedCriteria++;
      }
      else if (pref === 'high-fiber' && recipe.dietary_tags?.includes('high-fiber')) {
        dietaryMatches++;
        matchedCriteria++;
      }
      else if (pref === 'low-fat' && recipe.dietary_tags?.includes('low-fat')) {
        dietaryMatches++;
        matchedCriteria++;
      }
    });
    
    // Award points for dietary preference matches
    if (profile.dietaryPreferences.length > 0) {
      score += (dietaryMatches / profile.dietaryPreferences.length) * 30;
    }
  }
  
  // ============================================
  // 2. HEALTH GOALS MATCHING (0-25 points)
  // ============================================
  if (profile.healthGoals && profile.healthGoals.length > 0) {
    let goalMatches = 0;
    
    profile.healthGoals.forEach(goal => {
      if (goal === 'weight-loss' && recipe.nutrition?.calories && recipe.nutrition.calories < 350) {
        goalMatches++;
        matchedCriteria++;
      }
      else if (goal === 'muscle-gain' && recipe.nutrition?.protein && recipe.nutrition.protein >= 20) {
        goalMatches++;
        matchedCriteria++;
      }
      else if (goal === 'diabetes-management' && recipe.health_conditions?.some(c => c.toLowerCase().includes('diabetes'))) {
        goalMatches++;
        matchedCriteria++;
      }
      else if (goal === 'heart-health' && recipe.health_conditions?.some(c => c.toLowerCase().includes('heart'))) {
        goalMatches++;
        matchedCriteria++;
      }
      else if (goal === 'general-wellness' && recipe.health_score >= 70) {
        goalMatches++;
        matchedCriteria++;
      }
    });
    
    if (profile.healthGoals.length > 0) {
      score += (goalMatches / profile.healthGoals.length) * 25;
    }
  }
  
  // ============================================
  // 3. HEALTH CONDITIONS MATCHING (0-20 points)
  // ============================================
  if (profile.healthConditions && profile.healthConditions.length > 0 && recipe.health_conditions) {
    let conditionMatches = 0;
    
    profile.healthConditions.forEach(cond => {
      if (recipe.health_conditions?.some(rc => rc.toLowerCase().includes(cond.toLowerCase()))) {
        conditionMatches++;
        matchedCriteria++;
      }
    });
    
    if (profile.healthConditions.length > 0) {
      score += (conditionMatches / profile.healthConditions.length) * 20;
    }
  }
  
  // ============================================
  // 4. AVAILABLE INGREDIENTS MATCHING (0-15 points)
  // ============================================
  if (profile.availableIngredients && profile.availableIngredients.length > 0 && recipe.ingredients) {
    let ingredientMatches = 0;
    const availableLower = profile.availableIngredients.map(i => i.toLowerCase());
    
    recipe.ingredients.forEach((ingredient: string) => {
      const ingredientLower = ingredient.toLowerCase();
      if (availableLower.some(avail => ingredientLower.includes(avail) || avail.includes(ingredientLower))) {
        ingredientMatches++;
      }
    });
    
    if (recipe.ingredients.length > 0) {
      score += (ingredientMatches / recipe.ingredients.length) * 15;
    }
  }
  
  return { score, matchedCriteria };
};

// ============================================
// FILTER RECIPES FROM DATABASE - IMPROVED
// ============================================
export const filterRecipesFromDB = async (profile: UserProfile): Promise<Recipe[]> => {
  try {
    console.log('🔍 Filtering recipes with profile:', profile);
    
    // Fetch all recipes
    const { data, error } = await supabase
      .from('recipes')
      .select('*');

    if (error) {
      console.error('❌ Error fetching recipes:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No recipes found in database');
      return [];
    }

    console.log(`📊 Fetched ${data.length} recipes from database`);

    // ============================================
    // SCORE AND FILTER RECIPES
    // ============================================
    let filteredRecipes: (Recipe & { matchScore: number })[] = [];

    data.forEach((recipe: Recipe) => {
      const { score, matchedCriteria } = scoreRecipe(recipe, profile);
      
      // Include recipes that match at least one criterion
      // or have a good health score if no criteria selected
      const hasUserSelections = 
        profile.dietaryPreferences.length > 0 || 
        profile.healthGoals.length > 0 || 
        profile.healthConditions.length > 0 ||
        profile.availableIngredients.length > 0;

      if (hasUserSelections) {
        // Only include recipes that improve upon base health score (indicates a match)
        if (score > (recipe.health_score || 70)) {
          filteredRecipes.push({ ...recipe, matchScore: score });
        }
      } else {
        // No preferences selected, include all recipes
        filteredRecipes.push({ ...recipe, matchScore: score });
      }
    });

    // ============================================
    // SORT BY MATCH SCORE (BEST MATCHES FIRST)
    // ============================================
    filteredRecipes.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`✅ Found ${filteredRecipes.length} matching recipes`);
    
    // Return top 10 matches for variety (user can scroll)
    return filteredRecipes.slice(0, 10);
    
  } catch (error) {
    console.error('❌ Error in filterRecipesFromDB:', error);
    return [];
  }
};

// ============================================
// GET ALL RECIPES
// ============================================
export const getAllRecipes = async (): Promise<Recipe[]> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('health_score', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all recipes:', error);
    return [];
  }
};

// ============================================
// GET RECIPE BY ID
// ============================================
export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
};

// ============================================
// SEARCH RECIPES BY NAME
// ============================================
export const searchRecipes = async (query: string): Promise<Recipe[]> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('health_score', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
};