import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const MODEL_CANDIDATES = ['gemini-2.0-flash', 'gemini-1.5-flash'];

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

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

const initializeModel = () => {
  if (!API_KEY) {
    return null;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }

  if (!model) {
    for (const modelName of MODEL_CANDIDATES) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        break;
      } catch (error) {
        console.warn(`Unable to initialize ${modelName}:`, error);
      }
    }
  }

  return model;
};

const parseJsonResponse = (text: string) => {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const payload = fencedMatch ? fencedMatch[1] : trimmed;
  return JSON.parse(payload);
};

type GeminiContentResult = {
  response: Promise<{ text: () => string }>; 
};

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
}

const getQuickFallbackAnalysis = (): FoodAnalysisResult => ({
  foodName: 'Quick Scan Result',
  nutrition: {
    calories: 320,
    protein: 12,
    carbs: 42,
    fat: 14,
    fiber: 5,
    sugar: 7,
    sodium: 450,
  },
  healthScore: 62,
  goodPoints: ['Image captured successfully', 'Quick preview is ready'],
  badPoints: ['Detailed AI insights may be limited'],
  allergens: [],
  servingSize: '1 serving',
  cuisine: 'Unknown',
});

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

    const prompt = `Analyze this food photo briefly. Return valid JSON only with keys: foodName, nutrition {calories, protein, carbs, fat, fiber, sugar, sodium}, healthScore, goodPoints, badPoints, allergens, servingSize, cuisine.`;

    const result = await withTimeout(
      modelInstance.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        },
      ]),
      3000,
    ) as GeminiContentResult;

    const response = await withTimeout(result.response, 1500);
    const text = response.text();
    const parsedResult = parseJsonResponse(text);

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
      goodPoints: parsedResult.goodPoints || ['Healthy food choice'],
      badPoints: parsedResult.badPoints || ['Moderate consumption recommended'],
      allergens: parsedResult.allergens || [],
      servingSize: parsedResult.servingSize || '1 serving',
      cuisine: parsedResult.cuisine || 'Unknown',
    };
  } catch (error) {
    console.log('Using quick fallback analysis:', error);
    return getQuickFallbackAnalysis();
  }
};

export const getFoodAlternatives = async (foodName: string): Promise<string[]> => {
  const modelInstance = initializeModel();
  if (!modelInstance) {
    return ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
  }

  try {
    const prompt = `Suggest 3 healthier alternatives for ${foodName}. Return JSON: {"alternatives": ["alternative1", "alternative2", "alternative3"]}`;
    const result = await withTimeout(modelInstance.generateContent(prompt), 2500) as GeminiContentResult;
    const response = await withTimeout(result.response, 1500);
    const text = response.text();
    const parsed = parseJsonResponse(text);
    return parsed.alternatives || ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
  } catch (error) {
    console.log('Using fallback alternatives:', error);
    return ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
  }
};
