import { supabase } from '../../src/lib/supabase';

export interface Expert {
  id: string;
  name: string;
  title: string;
  qualification: string;
  specialty: string;
  district: string;
  experience: string;
  rating: number;
  description?: string; // ✅ Added - optional
  profileImage?: string;
  reviews: number;
  phone: string;
  createdAt?: string;
  email: string;
  whatsapp: string;
  available: boolean;
  image_url?: string;
}

export interface ExpertFilters {
  searchQuery?: string;
  district?: string;
  specialty?: string;
}

export const expertService = {
  // Get all experts
  async getAllExperts(): Promise<Expert[]> {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching experts:', error);
      return [];
    }
  },

  // Get experts with filters
  async getFilteredExperts(filters: ExpertFilters): Promise<Expert[]> {
    try {
      let query = supabase.from('experts').select('*');

      // Search filter
      if (filters.searchQuery) {
        query = query.or(
          `name.ilike.%${filters.searchQuery}%,` +
          `title.ilike.%${filters.searchQuery}%,` +
          `specialty.ilike.%${filters.searchQuery}%`
        );
      }

      // District filter
      if (filters.district && filters.district !== 'All') {
        query = query.eq('district', filters.district);
      }

      // Specialty filter
      if (filters.specialty && filters.specialty !== 'All') {
        query = query.eq('title', filters.specialty);
      }

      // Only show available experts
      query = query.eq('available', true);

      // Order by rating
      query = query.order('rating', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering experts:', error);
      return [];
    }
  },

  // Get expert by ID
  async getExpertById(id: string): Promise<Expert | null> {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching expert:', error);
      return null;
    }
  },

  // Get all districts (for filter)
  async getDistricts(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('district')
        .order('district');

      if (error) throw error;
      
      const districts = [...new Set(data.map(item => item.district))];
      return ['All', ...districts];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return ['All'];
    }
  },

  // Get all specialties (for filter)
  async getSpecialties(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('title')
        .order('title');

      if (error) throw error;
      
      const specialties = [...new Set(data.map(item => item.title))];
      return ['All', ...specialties];
    } catch (error) {
      console.error('Error fetching specialties:', error);
      return ['All'];
    }
  },

  // Add new expert (for admin)
  async addExpert(expert: Omit<Expert, 'id'>): Promise<Expert | null> {
    try {
      const { data, error } = await supabase
        .from('experts')
        .insert([expert])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding expert:', error);
      return null;
    }
  },

  // Update expert
  async updateExpert(id: string, updates: Partial<Expert>): Promise<Expert | null> {
    try {
      const { data, error } = await supabase
        .from('experts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating expert:', error);
      return null;
    }
  },

  // Delete expert
  async deleteExpert(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('experts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting expert:', error);
      return false;
    }
  },

  async createExpert(expertData: Omit<Expert, 'id' | 'rating' | 'reviews'>): Promise<Expert> {
    try {
      // Generate a unique ID
      const id = `expert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newExpert: Expert = {
        id,
        ...expertData,
        rating: 4.5,
        reviews: 0,
        createdAt: new Date().toISOString(),
      };

      // Get existing experts
      const experts = await this.getAllExperts();
      experts.push(newExpert);
      
      // Save to storage
      await this.saveExperts(experts);
      
      return newExpert;
    } catch (error) {
      console.error('Error creating expert:', error);
      throw error;
    }
  },

  async saveExperts(experts: Expert[]): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('experts', JSON.stringify(experts));
    } catch (error) {
      console.error('Error saving experts:', error);
      throw error;
    }
  },


};