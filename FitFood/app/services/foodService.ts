import { supabase } from '../../src/lib/supabase';
import type { Food } from '../(tabs)/SLfood/types';

export const foodService = {
  // Get foods by category (breakfast, lunch, dinner)
  async getFoodsByCategory(category: string): Promise<Food[]> {
    try {
      // Map category to correct table name
      const tableMap: Record<string, string> = {
        'breakfast': 'breakfast_meals',
        'lunch': 'lunch_meals',
        'dinner': 'dinner_meals',
      };

      // Get the correct table name
      const table = tableMap[category] || 'breakfast_meals';
      
      console.log(`🔍 Fetching from table: ${table}`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('name');

      if (error) {
        console.error(`❌ Error fetching ${category} foods:`, error);
        return [];
      }
      
      console.log(`✅ Found ${data?.length || 0} items in ${table}`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getFoodsByCategory:', error);
      return [];
    }
  },

  // Get food by ID from specific table
  async getFoodById(id: string, table: string = 'breakfast_meals'): Promise<Food | null> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching food by ID:', error);
      return null;
    }
  },

  // Search foods in specific table
  async searchInTable(table: string, query: string): Promise<Food[]> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .ilike('name', `%${query}%`)
        .or(`name_si.ilike.%${query}%,description.ilike.%${query}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching foods:', error);
      return [];
    }
  },

  // Search across all tables
  async searchAllFoods(query: string): Promise<Food[]> {
    try {
      const tables = ['breakfast_meals', 'lunch_meals', 'dinner_meals'];
      let allResults: Food[] = [];

      for (const table of tables) {
        const results = await this.searchInTable(table, query);
        allResults = [...allResults, ...results];
      }

      return allResults;
    } catch (error) {
      console.error('Error searching all foods:', error);
      return [];
    }
  },

  // Get all foods from all tables
  async getAllFoods(): Promise<Food[]> {
    try {
      const tables = ['breakfast_meals', 'lunch_meals', 'dinner_meals'];
      let allFoods: Food[] = [];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) {
          console.error(`Error fetching from ${table}:`, error);
          continue;
        }
        if (data) {
          allFoods = [...allFoods, ...data];
        }
      }

      return allFoods;
    } catch (error) {
      console.error('Error fetching all foods:', error);
      return [];
    }
  },

  // Get all categories (tables)
  async getCategories(): Promise<string[]> {
    return ['breakfast', 'lunch', 'dinner'];
  },

  // Check if table exists
  async tableExists(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`Table ${tableName} does not exist or has no data`);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
};

export default foodService;