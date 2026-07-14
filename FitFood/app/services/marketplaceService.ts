import { supabase } from '../../src/lib/supabase';
import { Product, Category, FilterOptions, CartItem } from '../../types/marketplace.types';
import { SAMPLE_PRODUCTS, CATEGORIES } from '../../constants/marketplaceData';

// ============================================
// DATABASE TABLE NAME CONFIGURATION
// ============================================
const TABLE_NAME = 'food_items'; // ← Your actual table name

// ============================================
// PRODUCT SERVICES
// ============================================
export const marketplaceService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        // ❌ REMOVED: .eq('available', true) - column doesn't exist
        .order('created_at', { ascending: false }); // Use created_at instead of rating

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
        .from(TABLE_NAME)
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
        .from(TABLE_NAME)
        .select('*')
        .eq('category', category)
        // ❌ REMOVED: .eq('available', true)
        .order('created_at', { ascending: false });

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
        .from(TABLE_NAME)
        .select('*');
        // ❌ REMOVED: .eq('available', true)

      // Category filter
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      // Price range
      if (filters.priceRange) {
        query = query.gte('price', filters.priceRange.min)
          .lte('price', filters.priceRange.max);
      }

      // Search query
      if (filters.searchQuery) {
        query = query.or(
          `name.ilike.%${filters.searchQuery}%,` +
          `description.ilike.%${filters.searchQuery}%`
        );
      }

      // ❌ REMOVED: organic, local, seasonal filters (columns may not exist)
      query = query.order('created_at', { ascending: false });

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
      
      return filtered;
    }
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        // ❌ REMOVED: .eq('available', true)
        .order('created_at', { ascending: false });

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
        .from(TABLE_NAME)
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
        .from(TABLE_NAME)
        .select('*')
        // ❌ REMOVED: .eq('available', true)
        // ❌ REMOVED: .eq('isOrganic', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || SAMPLE_PRODUCTS.slice(0, 6);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return SAMPLE_PRODUCTS.slice(0, 6);
    }
  },

  // ============================================
  // CART SERVICES (Local)
  // ============================================
  
  async saveCart(cartItems: CartItem[]): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('marketplace_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

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

  async clearCart(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('marketplace_cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Check table structure (for debugging)
  async checkTableStructure(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Error fetching table structure:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log('✅ Table columns:', Object.keys(data[0]).join(', '));
      } else {
        console.log('📊 Table exists but is empty');
      }
    } catch (error) {
      console.error('❌ Error checking table:', error);
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
        .in('id', ids);

      if (error) throw error;
      return data || SAMPLE_PRODUCTS.filter(p => ids.includes(p.id));
    } catch (error) {
      console.error('Error fetching products by IDs:', error);
      return SAMPLE_PRODUCTS.filter(p => ids.includes(p.id));
    }
  },

  getTableName(): string {
    return TABLE_NAME;
  },
};

export default marketplaceService;