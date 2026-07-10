// ============================================
// OPEN FOOD FACTS API - COMPLETELY FREE!
// 1.7M+ products, no authentication needed!
// ============================================

export interface BarcodeProduct {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  ingredients: string;
  allergens: string[];
  image: string;
  additives: string[];
  nutritionGrade: string; // A, B, C, D, E
}

export const getProductByBarcode = async (barcode: string): Promise<BarcodeProduct | null> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await response.json();
    
    if (data.status !== 1) return null;
    
    const p = data.product;
    return {
      name: p.product_name || 'Unknown Product',
      brand: p.brands || 'Unknown Brand',
      calories: p.nutriments?.['energy-kcal'] || 0,
      protein: p.nutriments?.proteins || 0,
      carbs: p.nutriments?.carbohydrates || 0,
      fat: p.nutriments?.fat || 0,
      fiber: p.nutriments?.fiber || 0,
      sugar: p.nutriments?.sugars || 0,
      sodium: p.nutriments?.sodium || 0,
      ingredients: p.ingredients_text || 'Not available',
      allergens: p.allergens?.split(',') || [],
      image: p.image_url || 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Product',
      additives: p.additives_tags || [],
      nutritionGrade: p.nutrition_grade_fr?.toUpperCase() || 'Unknown',
    };
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const searchProducts = async (query: string): Promise<BarcodeProduct[]> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&json=1&page_size=10`
    );
    const data = await response.json();
    
    if (!data.products || data.products.length === 0) return [];
    
    return data.products.map((p: any) => ({
      name: p.product_name || 'Unknown',
      brand: p.brands || 'Unknown',
      calories: p.nutriments?.['energy-kcal'] || 0,
      protein: p.nutriments?.proteins || 0,
      carbs: p.nutriments?.carbohydrates || 0,
      fat: p.nutriments?.fat || 0,
      fiber: p.nutriments?.fiber || 0,
      sugar: p.nutriments?.sugars || 0,
      sodium: p.nutriments?.sodium || 0,
      ingredients: p.ingredients_text || 'Not available',
      allergens: p.allergens?.split(',') || [],
      image: p.image_url || 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Product',
      additives: p.additives_tags || [],
      nutritionGrade: p.nutrition_grade_fr?.toUpperCase() || 'Unknown',
    }));
    
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
};