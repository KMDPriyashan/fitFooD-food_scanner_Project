import { GoogleGenerativeAI } from '@google/generative-ai';

// 🔑 Get your API key from: https://aistudio.google.com/
// Replace with your actual API key
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('EXPO_PUBLIC_GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

export const analyzeFoodImage = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  try {
    // Remove data:image/jpeg;base64, prefix if present
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

    const result = await model.generateContent([
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

    // Parse JSON response
    try {
      const parsedResult = JSON.parse(text);
      
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
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return {
        foodName: 'Unknown Food',
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
        healthScore: 50,
        goodPoints: ['Unable to analyze fully'],
        badPoints: ['Please try again with a clearer image'],
        allergens: [],
        servingSize: 'Unknown',
        cuisine: 'Unknown',
      };
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze food. Please try again.');
  }
};

// Get food alternatives
export const getFoodAlternatives = async (foodName: string): Promise<string[]> => {
  try {
    const prompt = `
      Suggest 3 healthier alternatives for ${foodName}.
      Return as JSON: {"alternatives": ["alternative1", "alternative2", "alternative3"]}
      Make alternatives specific and practical.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = JSON.parse(text);
    return parsed.alternatives || ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
  } catch (error) {
    console.error('Error getting alternatives:', error);
    return ['Grilled Chicken Salad', 'Steamed Vegetables', 'Quinoa Bowl'];
  }
};