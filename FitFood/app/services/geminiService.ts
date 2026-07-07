import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

const initializeModel = () => {
  if (!API_KEY) {
    return null;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }

  if (!model) {
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  return model;
};

const parseJsonResponse = (text: string) => {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const payload = fencedMatch ? fencedMatch[1] : trimmed;
  return JSON.parse(payload);
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

const getFallbackAnalysis = (): FoodAnalysisResult => ({
  foodName: 'Food Image',
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  },
  healthScore: 60,
  goodPoints: ['Image captured successfully', 'AI analysis is unavailable right now'],
  badPoints: ['Nutritional values are estimated'],
  allergens: [],
  servingSize: '1 serving',
  cuisine: 'Unknown',
});

export const analyzeFoodImage = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  if (!imageBase64) {
    return getFallbackAnalysis();
  }

  const modelInstance = initializeModel();
  if (!modelInstance) {
    console.warn('Gemini API key is not configured. Returning fallback analysis.');
    return getFallbackAnalysis();
  }

  try {
    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const prompt = `
      You are a professional nutritionist and food analyst. Analyze this food image carefully.
      Return ONLY valid JSON with the following structure:

      {
        "foodName": "Name of the food (be specific)",
        "nutrition": {
          "calories": number (approximate calories per serving),
          "protein": number (grams),
          "carbs": number (grams),
          "fat": number (grams),
          "fiber": number (grams),
          "sugar": number (grams),
          "sodium": number (milligrams)
        },
        "healthScore": number (0-100, based on nutritional value),
        "goodPoints": ["List 2-4 health benefits or positive aspects"],
        "badPoints": ["List 2-4 health concerns or negative aspects"],
        "allergens": ["List any potential allergens (peanuts, dairy, gluten, etc.)"],
        "servingSize": "Approximate serving size description",
        "cuisine": "Type of cuisine (e.g., Sri Lankan, Italian, etc.)"
      }

      If you cannot identify the food, set foodName to "Unknown Food" and provide best guess.
      Be honest about what you can and cannot identify.
    `;

    const result = await modelInstance.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
    ]);

    const response = await result.response;
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
    console.error('Gemini API Error:', error);
    return getFallbackAnalysis();
  }
};

export const getFoodAlternatives = async (foodName: string): Promise<string[]> => {
  const modelInstance = initializeModel();
  if (!modelInstance) {
    return ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
  }

  try {
    const prompt = `
      Suggest 3 healthier alternatives for ${foodName}.
      Return as JSON: {"alternatives": ["alternative1", "alternative2", "alternative3"]}
      Make alternatives specific and practical.
    `;

    const result = await modelInstance.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJsonResponse(text);
    return parsed.alternatives || ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
  } catch (error) {
    console.error('Error getting alternatives:', error);
    return ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
  }
};
