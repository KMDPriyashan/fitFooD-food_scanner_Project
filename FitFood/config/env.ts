import Constants from 'expo-constants';

// ============================================
// Get API keys from environment
// ============================================
const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const ENVIRONMENT = Constants.expoConfig?.extra?.environment || process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';

// ============================================
// Validate API keys
// ============================================
if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not found in environment variables!');
  console.warn('Please add GEMINI_API_KEY to your .env file');
  console.warn('Get your API key from: https://aistudio.google.com/');
}

// ============================================
// Export ENV object
// ============================================
export const ENV = {
  GEMINI_API_KEY,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  ENVIRONMENT,
  IS_DEV: ENVIRONMENT === 'development',
  IS_PROD: ENVIRONMENT === 'production',
};

export default ENV;