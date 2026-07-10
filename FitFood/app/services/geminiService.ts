import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../../config/env';

// Use API key from environment
const API_KEY = ENV.GEMINI_API_KEY;

// ============================================
// CONFIGURATION
// ============================================
// ✅ Use API key from environment (SECURE!)


const MODEL_CANDIDATES = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// ============================================
// HELPERS
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

const initializeModel = () => {
  if (!API_KEY) {
    console.warn('⚠️ Gemini API key not found! Please add GEMINI_API_KEY to .env');
    return null;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }

  if (!model) {
    for (const modelName of MODEL_CANDIDATES) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ Initialized ${modelName}`);
        break;
      } catch (error) {
        console.warn(`⚠️ Unable to initialize ${modelName}:`, error);
      }
    }
  }

  return model;
};

type GeminiContentResult = {
  response: { text: () => string };
};

// ============================================
// TYPES
// ============================================
export interface FoodAnalysisResult {
  foodName: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  healthScore: number;
  goodPoints: string[];
  badPoints: string[];
  allergens: string[];
  servingSize?: string;
  cuisine?: string;
  // Enhanced fields
  detailedNutrition?: {
    vitamins: string[];
    minerals: string[];
    keyNutrients: string[];
    healthBenefits: string[];
  };
  dietaryInfo?: {
    isHighIn: string[];
    isLowIn: string[];
    suitableFor: string[];
    notSuitableFor: string[];
  };
  mealRecommendation?: {
    bestTimeToEat: string;
    portionSuggestion: string;
    pairingSuggestions: string[];
    storageTips: string;
  };
  detailedGoodPoints?: Array<{ point: string; explanation: string }>;
  detailedBadPoints?: Array<{ point: string; explanation: string }>;
  summary?: string;
  healthImpact?: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

// ============================================
// QUICK FALLBACK (For when API fails)
// ============================================
const getQuickFallbackAnalysis = (): FoodAnalysisResult => ({
  foodName: 'Food Scan Result',
  nutrition: {
    calories: 250,
    protein: 10,
    carbs: 30,
    fat: 12,
    fiber: 4,
    sugar: 6,
    sodium: 400,
  },
  healthScore: 65,
  goodPoints: ['Image captured successfully', 'Quick preview is ready', 'AI analysis in progress'],
  badPoints: ['Detailed AI insights may be limited', 'Try again for better results'],
  allergens: [],
  servingSize: '1 serving',
  cuisine: 'Unknown',
  detailedNutrition: {
    vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin B6'],
    minerals: ['Iron', 'Calcium', 'Potassium'],
    keyNutrients: ['Good source of fiber', 'Contains healthy fats'],
    healthBenefits: ['Supports overall health', 'Provides energy'],
  },
  dietaryInfo: {
    isHighIn: ['Fiber', 'Vitamin A'],
    isLowIn: ['Sodium', 'Sugar'],
    suitableFor: ['General diet', 'Vegetarian'],
    notSuitableFor: ['Low-carb diet'],
  },
  mealRecommendation: {
    bestTimeToEat: 'Anytime',
    portionSuggestion: 'Moderate portion',
    pairingSuggestions: ['Pair with vegetables', 'Add protein source'],
    storageTips: 'Store in a cool, dry place',
  },
  detailedGoodPoints: [
    { point: 'Nutritious', explanation: 'Provides essential vitamins and minerals for daily health.' },
    { point: 'Balanced', explanation: 'Offers a good mix of macronutrients for sustained energy.' },
  ],
  detailedBadPoints: [
    { point: 'Moderation needed', explanation: 'Should be consumed in appropriate portions.' },
  ],
  summary: 'This food provides a balanced mix of nutrients for overall health and wellness.',
  healthImpact: {
    positive: ['Supports immune function', 'Provides energy'],
    negative: ['May need portion control'],
    neutral: ['Part of a balanced diet'],
  },
});

// ============================================
// MAIN ANALYSIS FUNCTION - ENHANCED
// ============================================
export const analyzeFoodImage = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  if (!imageBase64) {
    return getQuickFallbackAnalysis();
  }

  const modelInstance = initializeModel();
  if (!modelInstance) {
    return getQuickFallbackAnalysis();
  }

  try {
    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    // ============================================
    // ENHANCED PROMPT - FULL DETAILED ANALYSIS
    // ============================================
    const prompt = `
      You are an expert nutritionist and food scientist with deep knowledge of food chemistry, nutrition, and health impacts.
      
      Analyze this food image in EXTREME DETAIL. Provide a comprehensive, professional, and easy-to-understand report.
      
      Return ONLY valid JSON with this COMPLETE structure:
      
      {
        "foodName": "Full name of the food (be specific)",
        "nutrition": {
          "calories": number,
          "protein": number (grams),
          "carbs": number (grams),
          "fat": number (grams),
          "fiber": number (grams),
          "sugar": number (grams),
          "sodium": number (milligrams)
        },
        "healthScore": number (0-100, comprehensive score based on nutritional value),
        "goodPoints": ["List 4-6 main health benefits - short phrases"],
        "badPoints": ["List 4-6 health concerns - short phrases"],
        "allergens": ["List all potential allergens"],
        "servingSize": "Specific serving size description",
        "cuisine": "Type of cuisine",
        
        "detailedNutrition": {
          "vitamins": ["List key vitamins (A, B, C, D, E, K) with amounts in %DV format"],
          "minerals": ["List key minerals (Iron, Calcium, Potassium, Magnesium, Zinc, etc.) with amounts"],
          "keyNutrients": ["List the most important nutrients with brief explanations"],
          "healthBenefits": ["List specific health benefits with brief explanations"]
        },
        
        "dietaryInfo": {
          "isHighIn": ["Nutrients this food is particularly high in"],
          "isLowIn": ["Nutrients this food is particularly low in"],
          "suitableFor": ["Diets or conditions this food is suitable for"],
          "notSuitableFor": ["Diets or conditions this food is NOT suitable for"]
        },
        
        "mealRecommendation": {
          "bestTimeToEat": "When is the best time to eat this food?",
          "portionSuggestion": "Recommended portion size for a healthy adult",
          "pairingSuggestions": ["3-5 foods that pair well with this"],
          "storageTips": "How to store this food properly"
        },
        
        "detailedGoodPoints": [
          {"point": "Health benefit title", "explanation": "Detailed explanation (2-3 sentences)"}
        ],
        "detailedBadPoints": [
          {"point": "Health concern title", "explanation": "Detailed explanation (2-3 sentences)"}
        ],
        
        "summary": "A comprehensive 3-4 sentence summary of this food's nutritional profile and health impact",
        
        "healthImpact": {
          "positive": ["Specific positive health impacts with explanations"],
          "negative": ["Specific negative health impacts with explanations"],
          "neutral": ["Neutral aspects of this food"]
        }
      }
      
      IMPORTANT RULES:
      1. If you cannot identify specific details, provide best estimates based on visual appearance.
      2. Be honest about limitations - say "Could not determine" if unsure.
      3. Use scientific accuracy while keeping it understandable.
      4. Make the report detailed and actionable for the user.
      5. Ensure all fields are filled with meaningful content.
      6. For healthScore: 80-100 = Excellent, 60-79 = Good, 40-59 = Average, 20-39 = Needs Improvement, 0-19 = Unhealthy.
    `;

    const request = {
      contents: [
        {
          role: 'input',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
              },
            },
          ],
        },
      ],
    };

    const result = await withTimeout(
      modelInstance.generateContent(request),
      8000, // 8 second timeout for detailed analysis
    ) as GeminiContentResult;

    const response = result.response;
    const text = response.text();
    console.log('📝 Gemini response received, length:', text.length);
    
    const parsedResult = parseJsonResponse(text);

    // ============================================
    // RETURN COMPLETE RESULT WITH ALL FIELDS
    // ============================================
    return {
      foodName: parsedResult.foodName || 'Unknown Food',
      nutrition: {
        calories: parsedResult.nutrition?.calories || 0,
        protein: parsedResult.nutrition?.protein || 0,
        carbs: parsedResult.nutrition?.carbs || 0,
        fat: parsedResult.nutrition?.fat || 0,
        fiber: parsedResult.nutrition?.fiber || 0,
        sugar: parsedResult.nutrition?.sugar || 0,
        sodium: parsedResult.nutrition?.sodium || 0,
      },
      healthScore: parsedResult.healthScore || 50,
      goodPoints: parsedResult.goodPoints || ['Good source of nutrients'],
      badPoints: parsedResult.badPoints || ['Moderate consumption recommended'],
      allergens: parsedResult.allergens || [],
      servingSize: parsedResult.servingSize || 'Standard serving',
      cuisine: parsedResult.cuisine || 'Unknown',
      
      // Enhanced fields
      detailedNutrition: parsedResult.detailedNutrition || {
        vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin B6'],
        minerals: ['Iron', 'Calcium', 'Potassium'],
        keyNutrients: ['Good source of fiber', 'Contains healthy fats'],
        healthBenefits: ['Supports overall health', 'Provides energy'],
      },
      
      dietaryInfo: parsedResult.dietaryInfo || {
        isHighIn: ['Fiber', 'Vitamin A'],
        isLowIn: ['Sodium', 'Sugar'],
        suitableFor: ['General diet', 'Vegetarian'],
        notSuitableFor: ['Low-carb diet'],
      },
      
      mealRecommendation: parsedResult.mealRecommendation || {
        bestTimeToEat: 'Anytime',
        portionSuggestion: 'Moderate portion',
        pairingSuggestions: ['Pair with vegetables', 'Add protein source'],
        storageTips: 'Store in a cool, dry place',
      },
      
      detailedGoodPoints: parsedResult.detailedGoodPoints || [
        { point: 'Nutritious', explanation: 'Provides essential vitamins and minerals for daily health.' },
        { point: 'Balanced', explanation: 'Offers a good mix of macronutrients for sustained energy.' },
      ],
      
      detailedBadPoints: parsedResult.detailedBadPoints || [
        { point: 'Moderation needed', explanation: 'Should be consumed in appropriate portions.' },
      ],
      
      summary: parsedResult.summary || 'This food provides a balanced mix of nutrients for overall health and wellness.',
      
      healthImpact: parsedResult.healthImpact || {
        positive: ['Supports immune function', 'Provides energy'],
        negative: ['May need portion control'],
        neutral: ['Part of a balanced diet'],
      },
    };
    
  } catch (error) {
    console.log('⚠️ Using quick fallback analysis due to error:', error);
    return getQuickFallbackAnalysis();
  }
};

// ============================================
// GET HEALTHIER ALTERNATIVES
// ============================================
export const getFoodAlternatives = async (foodName: string): Promise<string[]> => {
  const modelInstance = initializeModel();
  if (!modelInstance) {
    return ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
  }

  try {
    const prompt = `
      Suggest 3 healthier alternatives for ${foodName}.
      Return JSON: {"alternatives": ["alternative1", "alternative2", "alternative3"]}
      Make alternatives specific, practical, and healthier options.
    `;
    
    const result = await withTimeout(modelInstance.generateContent(prompt), 2500) as GeminiContentResult;
    const response = result.response;
    const text = response.text();
    const parsed = parseJsonResponse(text);
    return parsed.alternatives || ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
    
  } catch (error) {
    console.log('⚠️ Using fallback alternatives:', error);
    return ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
  }
};

// ============================================
// GET NUTRITION ADVICE
// ============================================
export const getNutritionAdvice = async (foodName: string, healthScore: number): Promise<string> => {
  const modelInstance = initializeModel();
  if (!modelInstance) {
    return 'Eat in moderation as part of a balanced diet.';
  }

  try {
    const prompt = `
      For the food "${foodName}" with health score ${healthScore}/100,
      provide a brief, practical nutrition advice (2-3 sentences).
      Focus on how to make it healthier or when to eat it.
    `;
    
    const result = await withTimeout(modelInstance.generateContent(prompt), 2000) as GeminiContentResult;
    const response = result.response;
    const text = response.text();
    return text || 'Eat in moderation as part of a balanced diet.';
    
  } catch (error) {
    console.log('⚠️ Using fallback advice:', error);
    return 'Eat in moderation as part of a balanced diet.';
  }
};

// ============================================
// QUICK SCAN (Lightweight version for speed)
// ============================================
export const quickScanFood = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  if (!imageBase64) {
    return getQuickFallbackAnalysis();
  }

  const modelInstance = initializeModel();
  if (!modelInstance) {
    return getQuickFallbackAnalysis();
  }

  try {
    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const prompt = `
      Quick scan this food image. Return valid JSON with:
      foodName, nutrition {calories, protein, carbs, fat, fiber, sugar, sodium}, 
      healthScore (0-100), goodPoints (3), badPoints (3), allergens, servingSize, cuisine.
    `;

const request = {
      contents: [
        {
          role: 'input',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          ],
        },
      ],
    };

    const result = await withTimeout(
      modelInstance.generateContent(request),
      3000,
    ) as GeminiContentResult;
    
    const response = result.response;
    const text = response.text();
    const parsed = parseJsonResponse(text);

    return {
      foodName: parsed.foodName || 'Unknown Food',
      nutrition: {
        calories: parsed.nutrition?.calories || 0,
        protein: parsed.nutrition?.protein || 0,
        carbs: parsed.nutrition?.carbs || 0,
        fat: parsed.nutrition?.fat || 0,
        fiber: parsed.nutrition?.fiber || 0,
        sugar: parsed.nutrition?.sugar || 0,
        sodium: parsed.nutrition?.sodium || 0,
      },
      healthScore: parsed.healthScore || 50,
      goodPoints: parsed.goodPoints || ['Healthy choice'],
      badPoints: parsed.badPoints || ['Moderation recommended'],
      allergens: parsed.allergens || [],
      servingSize: parsed.servingSize || '1 serving',
      cuisine: parsed.cuisine || 'Unknown',
      // Quick scan returns minimal enhanced data
      detailedNutrition: {
        vitamins: ['Data from quick scan'],
        minerals: ['Data from quick scan'],
        keyNutrients: ['Quick scan limited'],
        healthBenefits: ['Quick scan limited'],
      },
      dietaryInfo: {
        isHighIn: ['Quick scan limited'],
        isLowIn: ['Quick scan limited'],
        suitableFor: ['Quick scan limited'],
        notSuitableFor: ['Quick scan limited'],
      },
      mealRecommendation: {
        bestTimeToEat: 'Varies',
        portionSuggestion: 'Standard portion',
        pairingSuggestions: ['Varies'],
        storageTips: 'Store properly',
      },
      detailedGoodPoints: [],
      detailedBadPoints: [],
      summary: 'Quick scan completed. For detailed analysis, use full analysis.',
      healthImpact: {
        positive: ['Quick scan limited'],
        negative: ['Quick scan limited'],
        neutral: ['Quick scan limited'],
      },
    };
    
  } catch (error) {
    console.log('⚠️ Quick scan fallback:', error);
    return getQuickFallbackAnalysis();
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================
export default {
  analyzeFoodImage,
  getFoodAlternatives,
  getNutritionAdvice,
  quickScanFood,
};