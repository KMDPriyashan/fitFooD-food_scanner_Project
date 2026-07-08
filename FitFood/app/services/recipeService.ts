import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserHealthProfile, Recipe } from '../../constants/recipeTypes';

import { ENV } from '../../config/env';

// Use API key from environment
const API_KEY = ENV.GEMINI_API_KEY;

// ============================================
// CONFIGURATION - SECURE!
// ============================================


if (!API_KEY) {
  console.warn('⚠️ Gemini API key not found in recipeService!');
  console.warn('Please add GEMINI_API_KEY to your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ============================================
// HELPER FUNCTIONS
// ============================================
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timed out')), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });

const parseJsonResponse = (text: string) => {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const payload = fencedMatch ? fencedMatch[1] : trimmed;
  return JSON.parse(payload);
};

// ============================================
// MAIN GENERATE RECIPES FUNCTION
// ============================================
export const generateRecipes = async (profile: UserHealthProfile): Promise<Recipe[]> => {
  try {
    if (!API_KEY) {
      console.warn('⚠️ No API key, using fallback recipes');
      return getFallbackRecipes(profile);
    }

    const prompt = buildPrompt(profile);
    
    const result = await withTimeout(model.generateContent(prompt), 15000);
    const text = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    
    // Clean up the JSON string
    jsonStr = jsonStr.trim();
    const parsed = JSON.parse(jsonStr);
    
    return parsed.recipes.map((item: any, index: number) => ({
      id: `recipe-${index + 1}`,
      name: item.name || `Recipe ${index + 1}`,
      nameSi: item.nameSi || '',
      description: item.description || 'A delicious and healthy recipe',
      ingredients: item.ingredients || ['Ingredients not specified'],
      instructions: item.instructions || ['Instructions not specified'],
      cookingTime: item.cookingTime || 25,
      prepTime: item.prepTime || 10,
      servings: item.servings || 2,
      difficulty: item.difficulty || 'Easy',
      nutrition: {
        calories: item.nutrition?.calories || 300,
        protein: item.nutrition?.protein || 15,
        carbs: item.nutrition?.carbs || 30,
        fat: item.nutrition?.fat || 12,
        fiber: item.nutrition?.fiber || 5,
      },
      healthScore: item.healthScore || 70,
      suitabilityReason: item.suitabilityReason || 'Good for your health goals',
      dietaryTags: item.dietaryTags || ['Healthy'],
      image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      tips: item.tips || ['Enjoy your meal!'],
      whyRecommended: item.whyRecommended || 'Balanced nutrition for your goals',
    }));
    
  } catch (error) {
    console.error('Error generating recipes:', error);
    return getFallbackRecipes(profile);
  }
};

// ============================================
// ENHANCED PROMPT BUILDER
// ============================================
const buildPrompt = (profile: UserHealthProfile): string => {
  // Build dietary preferences string
  const dietaryStr = profile.dietaryPreferences?.length > 0 
    ? profile.dietaryPreferences.join(', ') 
    : 'None (eat everything)';
  
  // Build health goals string
  const goalsStr = profile.healthGoals?.length > 0 
    ? profile.healthGoals.join(', ') 
    : 'General wellness and healthy eating';
  
  // Build conditions string
  const conditionsStr = profile.healthConditions?.length > 0 
    ? profile.healthConditions.join(', ') 
    : 'None';

  return `
You are an expert nutritionist and professional chef with deep knowledge of healthy cooking, dietary requirements, and personalized meal planning.

Based on the user's profile below, suggest 5 personalized healthy recipes.

===== USER PROFILE =====
- Age: ${profile.age || 'Not specified'}
- Weight: ${profile.weight || 'Not specified'} kg
- Height: ${profile.height || 'Not specified'} cm
- Health Conditions: ${conditionsStr}
- Dietary Preferences: ${dietaryStr}
- Health Goals: ${goalsStr}
- Available Ingredients: ${profile.availableIngredients?.length > 0 ? profile.availableIngredients.join(', ') : 'Any ingredients available'}
- Past Eating Habits: ${profile.pastEatingHabits || 'Not specified'}

===== REQUIREMENTS =====
1. Each recipe must be healthy, nutritious, and delicious
2. Use available ingredients where possible (be practical)
3. Must align with dietary preferences and health goals
4. Include full nutrition info (calories, protein, carbs, fat, fiber)
5. Include clear cooking instructions
6. Include health score (0-100)
7. Explain why this recipe is suitable for the user
8. Include Sinhala name when possible (Sri Lankan focus)
9. Make recipes practical for Sri Lankan households
10. Include a brief tip for each recipe

===== OUTPUT FORMAT =====
Return ONLY valid JSON with this EXACT structure:

{
  "recipes": [
    {
      "name": "Recipe Name",
      "nameSi": "Sinhala name (if applicable)",
      "description": "Brief description (1-2 sentences)",
      "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "cookingTime": 25,
      "prepTime": 10,
      "servings": 2,
      "difficulty": "Easy or Medium or Hard",
      "nutrition": {
        "calories": 350,
        "protein": 25,
        "carbs": 30,
        "fat": 12,
        "fiber": 6
      },
      "healthScore": 85,
      "suitabilityReason": "Why this recipe is suitable for the user",
      "dietaryTags": ["vegetarian", "high-protein", "low-carb"],
      "tips": ["Tip 1", "Tip 2"],
      "whyRecommended": "Brief explanation of why this recipe is recommended"
    }
  ]
}

Make recipes practical, delicious, and tailored to the user's needs. Prioritize health, nutrition, and taste!
`;
};

// ============================================
// FALLBACK RECIPES (When API fails)
// ============================================
const getFallbackRecipes = (profile: UserHealthProfile): Recipe[] => {
  const isVegetarian = profile.dietaryPreferences?.includes('vegetarian') || false;
  const isVegan = profile.dietaryPreferences?.includes('vegan') || false;
  const isLowCarb = profile.dietaryPreferences?.includes('low-carb') || false;
  const isHighProtein = profile.dietaryPreferences?.includes('high-protein') || false;

  const fallbackRecipes: Recipe[] = [];

  // Recipe 1: Always available
  fallbackRecipes.push({
    id: 'fallback-1',
    name: isVegetarian ? 'Vegetable Stir-Fry' : 'Grilled Chicken Salad',
    description: isVegetarian 
      ? 'Fresh vegetables stir-fried with aromatic spices' 
      : 'Healthy grilled chicken with fresh vegetables',
    ingredients: isVegetarian 
      ? ['Mixed vegetables', 'Soy sauce', 'Garlic', 'Ginger', 'Olive oil']
      : ['Chicken breast', 'Lettuce', 'Tomato', 'Cucumber', 'Olive oil', 'Lemon'],
    instructions: isVegetarian
      ? ['Chop vegetables', 'Heat oil and sauté garlic', 'Add vegetables and stir-fry', 'Season with soy sauce']
      : ['Grill chicken with salt and pepper', 'Chop fresh vegetables', 'Mix and serve with lemon dressing'],
    cookingTime: isVegetarian ? 15 : 20,
    prepTime: 10,
    servings: 2,
    difficulty: 'Easy',
    nutrition: isVegetarian 
      ? { calories: 200, protein: 8, carbs: 25, fat: 8, fiber: 7 }
      : { calories: 280, protein: 30, carbs: 10, fat: 12, fiber: 4 },
    healthScore: isVegetarian ? 78 : 80,
    suitabilityReason: isVegetarian 
      ? 'Excellent source of vitamins and minerals' 
      : 'High protein, low carb - perfect for muscle health',
    dietaryTags: isVegetarian ? ['vegetarian', 'healthy'] : ['high-protein', 'low-carb'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    tips: ['Use fresh ingredients for best taste', 'Add lemon juice for freshness'],
    whyRecommended: isVegetarian 
      ? 'Great for overall health and wellness' 
      : 'Excellent for muscle gain and weight management',
  });

  // Recipe 2: Dhal Curry (Sri Lankan staple)
  fallbackRecipes.push({
    id: 'fallback-2',
    name: 'Sri Lankan Dhal Curry',
    nameSi: 'පරිප්පු කරි',
    description: 'Creamy red lentil curry with coconut milk and spices',
    ingredients: ['Red lentils', 'Coconut milk', 'Onion', 'Garlic', 'Curry leaves', 'Turmeric', 'Chili powder'],
    instructions: [
      'Wash lentils and cook until soft',
      'Sauté onions, garlic, and curry leaves',
      'Add cooked lentils and spices',
      'Add coconut milk and simmer for 10 minutes',
    ],
    cookingTime: 25,
    prepTime: 10,
    servings: 3,
    difficulty: 'Easy',
    nutrition: { calories: 220, protein: 14, carbs: 28, fat: 8, fiber: 10 },
    healthScore: 82,
    suitabilityReason: 'High in protein and fiber, good for heart health',
    dietaryTags: ['vegetarian', 'vegan', 'high-fiber'],
    image: 'https://images.unsplash.com/photo-1558582188-3c1e35f37be9?w=400',
    tips: ['Soak lentils for 1 hour before cooking', 'Add vegetables for extra nutrition'],
    whyRecommended: 'A nutritious Sri Lankan staple that\'s easy to prepare and full of flavor',
  });

  // Recipe 3: Sri Lankan Chicken Curry
  if (!isVegetarian && !isVegan) {
    fallbackRecipes.push({
      id: 'fallback-3',
      name: 'Sri Lankan Chicken Curry',
      nameSi: 'කුකුල් කරි',
      description: 'Spicy and aromatic Sri Lankan chicken curry with coconut milk',
      ingredients: ['Chicken', 'Coconut milk', 'Onion', 'Garlic', 'Ginger', 'Curry leaves', 'Chili powder', 'Turmeric'],
      instructions: [
        'Marinate chicken with spices for 15 minutes',
        'Sauté onions, garlic, and ginger',
        'Add chicken and cook until browned',
        'Add coconut milk and simmer for 20 minutes',
      ],
      cookingTime: 35,
      prepTime: 15,
      servings: 3,
      difficulty: 'Medium',
      nutrition: { calories: 320, protein: 28, carbs: 12, fat: 18, fiber: 3 },
      healthScore: 75,
      suitabilityReason: 'High in protein, rich in flavor',
      dietaryTags: ['high-protein', 'gluten-free'],
      image: 'https://images.unsplash.com/photo-1583611629270-7e7c39b98324?w=400',
      tips: ['Use bone-in chicken for more flavor', 'Adjust spice level to preference'],
      whyRecommended: 'A classic Sri Lankan dish that\'s nutritious and satisfying',
    });
  }

  // Recipe 4: Sri Lankan Vegetable Curry
  fallbackRecipes.push({
    id: 'fallback-4',
    name: 'Sri Lankan Vegetable Curry',
    nameSi: 'එළවළු කරි',
    description: 'Mixed vegetables cooked in coconut milk with aromatic spices',
    ingredients: ['Mixed vegetables (carrots, beans, pumpkin)', 'Coconut milk', 'Onion', 'Garlic', 'Curry leaves', 'Turmeric'],
    instructions: [
      'Chop vegetables into bite-sized pieces',
      'Sauté onions, garlic, and curry leaves',
      'Add vegetables and spices',
      'Add coconut milk and simmer until vegetables are tender',
    ],
    cookingTime: 25,
    prepTime: 15,
    servings: 3,
    difficulty: 'Easy',
    nutrition: { calories: 180, protein: 5, carbs: 22, fat: 10, fiber: 6 },
    healthScore: 80,
    suitabilityReason: 'Rich in vitamins and fiber, low in calories',
    dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
    image: 'https://images.unsplash.com/photo-1515343480029-43cdfe6b6aae?w=400',
    tips: ['Use seasonal vegetables for best taste', 'Add a pinch of cinnamon for extra flavor'],
    whyRecommended: 'A healthy and colorful vegetable curry that\'s perfect for any meal',
  });

  // Recipe 5: Quick Oatmeal Breakfast (if high-protein or weight loss goal)
  if (profile.healthGoals?.some(g => g.includes('weight') || g.includes('muscle'))) {
    fallbackRecipes.push({
      id: 'fallback-5',
      name: 'Protein-Packed Oatmeal Bowl',
      description: 'Hearty oatmeal with fruits, nuts, and protein boost',
      ingredients: ['Rolled oats', 'Milk or plant-based milk', 'Banana', 'Mixed nuts', 'Honey'],
      instructions: [
        'Cook oats with milk',
        'Top with sliced banana',
        'Add mixed nuts',
        'Drizzle with honey',
      ],
      cookingTime: 10,
      prepTime: 5,
      servings: 1,
      difficulty: 'Easy',
      nutrition: { calories: 350, protein: 15, carbs: 45, fat: 12, fiber: 8 },
      healthScore: 85,
      suitabilityReason: 'Great for sustained energy and muscle recovery',
      dietaryTags: ['high-protein', 'healthy'],
      image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400',
      tips: ['Add protein powder for extra protein', 'Use almond milk for vegan option'],
      whyRecommended: 'Perfect for a healthy breakfast that keeps you full longer',
    });
  } else {
    fallbackRecipes.push({
      id: 'fallback-5',
      name: 'Sri Lankan Coconut Roti',
      nameSi: 'පොල් රොටි',
      description: 'Soft and tasty coconut flatbread',
      ingredients: ['Wheat flour', 'Grated coconut', 'Water', 'Salt', 'Oil'],
      instructions: [
        'Mix flour with grated coconut and salt',
        'Add water gradually and knead into dough',
        'Roll into flat circles',
        'Cook on a hot griddle until golden',
      ],
      cookingTime: 20,
      prepTime: 15,
      servings: 3,
      difficulty: 'Easy',
      nutrition: { calories: 180, protein: 5, carbs: 25, fat: 8, fiber: 4 },
      healthScore: 72,
      suitabilityReason: 'Good source of carbohydrates and healthy fats',
      dietaryTags: ['vegetarian'],
      image: 'https://images.unsplash.com/photo-1558582188-3c1e35f37be9?w=400',
      tips: ['Serve with dhal curry or pol sambol', 'Best eaten fresh'],
      whyRecommended: 'A Sri Lankan classic that\'s simple and satisfying',
    });
  }

  return fallbackRecipes;
};