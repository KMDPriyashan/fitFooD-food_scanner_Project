import { supabase } from '../../src/lib/supabase';
import type { Food } from '../(tabs)/SLfood/types';

const FOOD_TABLE = 'sri_lankan_foods';

export const foodService = {
  // Get foods by category (breakfast, lunch, dinner)
  async getFoodsByCategory(category: string): Promise<Food[]> {
    const { data, error } = await supabase
      .from(FOOD_TABLE)
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) {
      console.error(`Error fetching ${category} foods:`, error);
      return [];
    }
    return data || [];
  },

  // Search foods in specific table
  async searchInTable(table: string, query: string): Promise<Food[]> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .ilike('name', `%${query}%`)
      .or(`name_si.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) throw error;
    return data || [];
  },
};