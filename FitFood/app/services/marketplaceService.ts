import { supabase } from '../../src/lib/supabase';
import { Product, Category, FilterOptions, CartItem } from '../../types/marketplace.types';
import { SAMPLE_PRODUCTS, CATEGORIES } from '../../constants/marketplaceData';

// ============================================
// DATABASE TABLE NAME CONFIGURATION
// ============================================
// ✅ FIXED: Changed from 'products' to 'food_items'
// If your table has a different name, update this constant
const TABLE_NAME = 'food_items'; // ← UPDATE THIS to match your Supabase table name

// ============================================
// PRODUCT SERVICES
// ============================================
export const marketplaceService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)  // ← Using the constant
        .select('*')
        .eq('available', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || SAMPLE_PRODUCTS;
    } catch (error) {
      console.error('Error fetching products:', error);
      return SAMPLE_PRODUCTS;
    }
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)  // ← Using the constant
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return SAMPLE_PRODUCTS.find(p => p.id === id) || null;
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)  // ← Using the constant
        .select('*')
        .eq('category', category)
        .eq('available', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || SAMPLE_PRODUCTS.filter(p => p.category === category);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return SAMPLE_PRODUCTS.filter(p => p.category === category);
    }
  },

  // Filter products with advanced filters
  async filterProducts(filters: FilterOptions): Promise<Product[]> {
    try {
      let query = supabase
        .from(TABLE_NAME)  // ← Using the constant
        .select('*')
        .eq('available', true);

      // Category filter
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      // Price range
      if (filters.priceRange) {
        query = query.gte('price', filters.priceRange.min)
          .lte('price', filters.priceRange.max);
      }

      // Organic filter
      if (filters.isOrganic) {
        query = query.eq('isOrganic', true);
      }

      // Local filter
      if (filters.isLocal) {
        query = query.eq('isLocal', true);
      }

      // Seasonal filter
      if (filters.isSeasonal) {
        query = query.eq('isSeasonal', true);
      }

      // Search query
      if (filters.searchQuery) {
        query = query.or(
          `name.ilike.%${filters.searchQuery}%,` +
          `description.ilike.%${filters.searchQuery}%`
        );
      }

      query = query.order('rating', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || SAMPLE_PRODUCTS;
    } catch (error) {
      console.error('Error filtering products:', error);
      // Apply filters manually on sample data
      let filtered = [...SAMPLE_PRODUCTS];
      
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      if (filters.isOrganic) {
        filtered = filtered.filter(p => p.isOrganic);
      }
      if (filters.isLocal) {
        filtered = filtered.filter(p => p.isLocal);
      }
      
      return filtered;
    }
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)  // ← Using the constant
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('available', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || SAMPLE_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return SAMPLE_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)  // ← Using the constant
        .select('category')
        .order('category');

      if (error) throw error;
      
      const categories = [...new Set(data.map(item => item.category))];
      return categories.map(cat => ({
        id: cat.toLowerCase(),
        name: cat,
        icon: 'leaf',
        count: data.filter(item => item.category === cat).length,
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return CATEGORIES;
    }
  },

  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)  // ← Using the constant
        .select('*')
        .eq('available', true)
        .eq('isOrganic', true)
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || SAMPLE_PRODUCTS.filter(p => p.isOrganic).slice(0, 6);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return SAMPLE_PRODUCTS.filter(p => p.isOrganic).slice(0, 6);
    }
  },

  // ============================================
  // CART SERVICES (Local)
  // ============================================
  
  // Save cart to AsyncStorage
  async saveCart(cartItems: CartItem[]): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('marketplace_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

  // Get cart from AsyncStorage
  async getCart(): Promise<CartItem[]> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const data = await AsyncStorage.getItem('marketplace_cart');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  },

  // Clear cart
  async clearCart(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('marketplace_cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  // ============================================
  // ADDITIONAL HELPER FUNCTIONS
  // ============================================

  // Check if table exists (for debugging)
  async checkTableExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Table does not exist or is inaccessible:', error.message);
        return false;
      }
      
      console.log('✅ Table exists and is accessible!');
      return true;
    } catch (error) {
      console.error('❌ Error checking table:', error);
      return false;
    }
  },

  // Initialize with sample data (if table is empty)
  async initializeProducts(): Promise<void> {
    try {
      // First check if we already have data
      const { count, error: countError } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error checking product count:', countError);
        return;
      }

      // If no products exist, insert sample data
      if (count === 0) {
        console.log('📦 Inserting sample products...');
        
        // Remove the id field from sample products to let Supabase generate UUIDs
        const productsToInsert = SAMPLE_PRODUCTS.map(({ id, ...product }) => product);
        
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .insert(productsToInsert)
          .select();

        if (error) {
          console.error('Error inserting sample products:', error);
        } else {
          console.log(`✅ Inserted ${data?.length || 0} sample products`);
        }
      } else {
        console.log(`📊 Table already has ${count} products`);
      }
    } catch (error) {
      console.error('Error initializing products:', error);
    }
  },

  // Get product count
  async getProductCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting product count:', error);
      return SAMPLE_PRODUCTS.length;
    }
  },

  // Get products by IDs (for cart)
  async getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .in('id', ids)
        .eq('available', true);

      if (error) throw error;
      return data || SAMPLE_PRODUCTS.filter(p => ids.includes(p.id));
    } catch (error) {
      console.error('Error fetching products by IDs:', error);
      return SAMPLE_PRODUCTS.filter(p => ids.includes(p.id));
    }
  },

  // Update product availability
  async updateProductAvailability(id: string, available: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({ available, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating product availability:', error);
      return false;
    }
  },

  // Get products by health score (for health app integration)
  async getProductsByHealthScore(minScore: number = 70): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .gte('health_score', minScore)
        .eq('available', true)
        .order('health_score', { ascending: false });

      if (error) throw error;
      return data || SAMPLE_PRODUCTS.filter(p => {
        // ✅ FIXED: Check if health_score exists before comparing
        const score = (p as any).health_score || 0;
        return score >= minScore;
      });
    } catch (error) {
      console.error('Error fetching products by health score:', error);
      // ✅ FIXED: Safe filtering with fallback
      return SAMPLE_PRODUCTS.filter(p => {
        const score = (p as any).health_score || 0;
        return score >= minScore;
      });
    }
  },

  // ============================================
  // TABLE NAME GETTER (for debugging)
  // ============================================
  
  getTableName(): string {
    return TABLE_NAME;
  },
};

// ============================================
// EXPORT DEFAULT
// ============================================
export default marketplaceService;