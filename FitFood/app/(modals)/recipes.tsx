import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/Colors';
import { 
  UserProfile, 
  Recipe, 
  filterRecipesFromDB,
  getAllRecipes
} from '../services/recipeService';

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: '🌱 Vegetarian' },
  { id: 'vegan', label: '🌿 Vegan' },
  { id: 'gluten-free', label: '🚫 Gluten-Free' },
  { id: 'high-protein', label: '💪 High Protein' },
  { id: 'low-carb', label: '🥑 Low Carb' },
  { id: 'high-fiber', label: '🌾 High Fiber' },
  { id: 'low-fat', label: '🥗 Low Fat' },
];

const HEALTH_GOALS = [
  { id: 'weight-loss', label: '⚖️ Weight Loss' },
  { id: 'muscle-gain', label: '💪 Muscle Gain' },
  { id: 'diabetes-management', label: '🩸 Diabetes Management' },
  { id: 'heart-health', label: '❤️ Heart Health' },
  { id: 'general-wellness', label: '😊 General Wellness' },
];

const HEALTH_CONDITIONS = [
  'Diabetes',
  'High Blood Pressure',
  'High Cholesterol',
  'Heart Disease',
  'Anemia',
];

export default function RecipesScreen() {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  
  // Form state
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleGenerateRecipes = async () => {
    if (!age || !weight) {
      Alert.alert('⚠️ Missing Information', 'Age and weight are required to find recipes');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setShowFallback(false);
    
    try {
      const profile: UserProfile = {
        age,
        weight,
        healthConditions: selectedConditions,
        dietaryPreferences: selectedDietary,
        healthGoals: selectedGoals,
        availableIngredients: ingredients.split(',').map(i => i.trim()).filter(i => i),
      };

      console.log('📋 Searching recipes for profile:', profile);
      let filteredRecipes = await filterRecipesFromDB(profile);
      
      // ✅ If we have filtered results, show them
      if (filteredRecipes.length > 0) {
        console.log(`✅ Found ${filteredRecipes.length} matching recipes`);
        setRecipes(filteredRecipes);
        setShowFallback(false);
      } else {
        // If no matches found, get all top recipes and show fallback message
        console.log('⚠️ No recipes matched all criteria, showing popular recipes');
        setShowFallback(true);
        const allRecipes = await getAllRecipes();
        setRecipes(allRecipes.slice(0, 10));
      }
      
      setShowResults(true);
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Failed to generate recipes. Please try again.');
      setShowFallback(true);
      try {
        const allRecipes = await getAllRecipes();
        setRecipes(allRecipes.slice(0, 10));
        setShowResults(true);
      } catch (fallbackError) {
        Alert.alert('Error', 'Could not load recipes');
      }
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#4CAF50';
    }
  };

  // ============================================
  // RENDER FORM - IMPROVED
  // ============================================
  const renderForm = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🍽️ Smart Recipes</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.headerSubtitle}>Find recipes based on your health profile</Text>
        </View>

        <View style={styles.form}>
          {/* Personal Info - Improved */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>👤 Personal Info</Text>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Age *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 25"
                  placeholderTextColor={colors.textLight}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Weight (kg) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 70"
                  placeholderTextColor={colors.textLight}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Dietary Preferences - Improved */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🥗 Dietary Preferences</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
            <View style={styles.chipContainer}>
              {DIETARY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.chip,
                    selectedDietary.includes(option.id) && styles.chipActive,
                  ]}
                  onPress={() => toggleSelection(option.id, selectedDietary, setSelectedDietary)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedDietary.includes(option.id) && styles.chipTextActive,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Health Goals - Improved */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🎯 Health Goals</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
            <View style={styles.chipContainer}>
              {HEALTH_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.chip,
                    selectedGoals.includes(goal.id) && styles.chipActive,
                  ]}
                  onPress={() => toggleSelection(goal.id, selectedGoals, setSelectedGoals)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedGoals.includes(goal.id) && styles.chipTextActive,
                  ]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Health Conditions - Improved */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🩺 Health Conditions</Text>
            <Text style={styles.sectionSubtitle}>Select any that apply</Text>
            <View style={styles.chipContainer}>
              {HEALTH_CONDITIONS.map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.chip,
                    selectedConditions.includes(condition) && styles.chipActive,
                  ]}
                  onPress={() => toggleSelection(condition, selectedConditions, setSelectedConditions)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedConditions.includes(condition) && styles.chipTextActive,
                  ]}>
                    {condition}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Available Ingredients - Improved */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🛒 Available Ingredients</Text>
            <Text style={styles.sectionSubtitle}>Separate with commas (e.g., chicken, rice)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., chicken, rice, vegetables, eggs"
              placeholderTextColor={colors.textLight}
              value={ingredients}
              onChangeText={setIngredients}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Generate Button - Improved */}
          <TouchableOpacity
            style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
            onPress={handleGenerateRecipes}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="sparkles" size={22} color="#FFFFFF" />
                <Text style={styles.generateBtnText}>Find Recipes</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Quick Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
            <Text style={styles.tipText}>• Select at least one dietary preference for better results</Text>
            <Text style={styles.tipText}>• Add ingredients you have at home</Text>
            <Text style={styles.tipText}>• The more you select, the better the matches</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ============================================
  // RENDER RECIPES - IMPROVED
  // ============================================
  const renderRecipes = () => (
    <View style={styles.resultsContainer}>
      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => {
            setShowResults(false);
            setRecipes([]);
            setShowFallback(false);
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.resultsTitle}>Your Recipes</Text>
        <TouchableOpacity 
          style={styles.modifyBtn}
          onPress={() => setShowResults(false)}
        >
          <Ionicons name="pencil-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Results Info Section */}
      <View style={styles.resultsInfoSection}>
        <Text style={styles.resultsSubtitle}>
          🎯 Found {recipes.length} recipes for you
        </Text>
        
        {showFallback ? (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>
              ⚠️ No exact matches found. Showing popular recipes instead.
            </Text>
            <Text style={styles.fallbackHint}>
              Try adjusting your preferences for better matches
            </Text>
          </View>
        ) : (
          <View style={styles.matchedCriteriaContainer}>
            <Text style={styles.criteriaLabel}>Matched Criteria:</Text>
            <View style={styles.criteriaChips}>
              {selectedDietary.length > 0 && (
                <View style={styles.criteriaChip}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.criteriaText}>
                    {selectedDietary.length} dietary preference{selectedDietary.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {selectedGoals.length > 0 && (
                <View style={styles.criteriaChip}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.criteriaText}>
                    {selectedGoals.length} health goal{selectedGoals.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {selectedConditions.length > 0 && (
                <View style={styles.criteriaChip}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.criteriaText}>
                    {selectedConditions.length} condition{selectedConditions.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {ingredients.trim().length > 0 && (
                <View style={styles.criteriaChip}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.criteriaText}>Your ingredients included</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Recipes List */}
      <ScrollView style={styles.recipesList} showsVerticalScrollIndicator={false}>
        {recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyStateText}>No recipes available</Text>
            <Text style={styles.emptyStateHint}>Try adjusting your preferences</Text>
          </View>
        ) : (
          recipes.map((recipe, index) => (
            <View key={recipe.id} style={styles.recipeCard}>
              {/* Rank Badge */}
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>

              {/* Recipe Header */}
              <View style={styles.recipeHeader}>
                <View style={styles.recipeTitleContainer}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  {recipe.name_si && (
                    <Text style={styles.recipeNameSi}>{recipe.name_si}</Text>
                  )}
                </View>
                <View style={[styles.healthScoreBadge, { 
                  backgroundColor: recipe.health_score >= 80 ? '#4CAF50' : 
                                 recipe.health_score >= 60 ? '#FF9800' : '#F44336' 
                }]}>
                  <Text style={styles.healthScoreText}>{recipe.health_score}</Text>
                </View>
              </View>

              {/* Dietary Tags */}
              {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                <View style={styles.dietaryTags}>
                  {recipe.dietary_tags.slice(0, 3).map((tag) => (
                    <View key={tag} style={styles.dietaryTag}>
                      <Text style={styles.dietaryTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.recipeDescription}>{recipe.description}</Text>

              {/* Nutrition */}
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutrition?.calories || 0}</Text>
                  <Text style={styles.nutritionLabel}>Cal</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutrition?.protein || 0}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutrition?.carbs || 0}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutrition?.fat || 0}g</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              </View>

              {/* Why Recommended */}
              {recipe.why_recommended && (
                <View style={styles.recommendationBox}>
                  <Text style={styles.recommendationLabel}>💡 Why This is Recommended</Text>
                  <Text style={styles.recommendationText}>{recipe.why_recommended}</Text>
                </View>
              )}

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStat}>
                  <Ionicons name="time-outline" size={16} color={colors.textLight} />
                  <Text style={styles.quickStatText}>{recipe.cooking_time}m</Text>
                </View>
                <View style={styles.quickStat}>
                  <Ionicons name="people-outline" size={16} color={colors.textLight} />
                  <Text style={styles.quickStatText}>{recipe.servings} servings</Text>
                </View>
                <View style={styles.quickStat}>
                  <Text style={[styles.quickStatText, { color: getDifficultyColor(recipe.difficulty) }]}>
                    {recipe.difficulty}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.detailsBtn} onPress={() => Alert.alert(
                '📖 Recipe Details',
                `${recipe.name}\n\n${'━'.repeat(30)}\n\n📋 INGREDIENTS:\n${recipe.ingredients?.map((i: string, idx: number) => `  ${idx + 1}. ${i}`).join('\n') || 'Not available'}\n\n${'━'.repeat(30)}\n\n👨‍🍳 INSTRUCTIONS:\n${recipe.instructions?.map((i: string, idx: number) => `  ${idx + 1}. ${i}`).join('\n') || 'Not available'}`
              )}>
                <Text style={styles.detailsBtnText}>View Full Recipe →</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modify Search Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.modifySearchBtn}
          onPress={() => setShowResults(false)}
        >
          <Ionicons name="pencil" size={18} color="#FFFFFF" />
          <Text style={styles.modifySearchBtnText}>Modify Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {showResults ? renderRecipes() : renderForm()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },

  // ============================================
  // FORM STYLES
  // ============================================
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  form: { padding: 16, paddingBottom: 40 },
  
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', marginBottom: 0 },
  inputGroup: { marginBottom: 0 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FFFFFF',
  },
  textArea: { minHeight: 56, textAlignVertical: 'top' },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  chipActive: {
    backgroundColor: colors.primaryLight + '30',
    borderColor: colors.primary,
  },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.primary, fontWeight: '500' },
  
  generateBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  generateBtnDisabled: { opacity: 0.7 },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  tipsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 3,
    lineHeight: 20,
  },

  // ============================================
  // RESULTS STYLES
  // ============================================
  resultsContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  resultsSubtitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultsSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  fallbackText: {
    fontSize: 13,
    color: '#FF9800',
    marginTop: 4,
  },
  filterInfoContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterTag: {
    fontSize: 11,
    backgroundColor: '#E3F2FD',
    color: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '500',
  },
  recipesList: { paddingHorizontal: 16, paddingBottom: 20 },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  rankText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  recipeTitleContainer: { flex: 1, marginRight: 8 },
  recipeName: { fontSize: 18, fontWeight: '700', color: colors.text },
  recipeNameSi: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  healthScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  healthScoreText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  dietaryTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 4 },
  dietaryTag: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dietaryTagText: { fontSize: 11, color: colors.primary, fontWeight: '500' },
  recipeDescription: { fontSize: 14, color: colors.textLight, marginTop: 8, lineHeight: 20 },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  nutritionItem: { alignItems: 'center' },
  nutritionValue: { fontSize: 15, fontWeight: '700', color: colors.primary },
  nutritionLabel: { fontSize: 10, color: colors.textLight },
  recommendationBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  recommendationLabel: { fontSize: 12, fontWeight: '600', color: '#2E7D32', marginBottom: 2 },
  recommendationText: { fontSize: 13, color: '#333', lineHeight: 18 },
  quickStats: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 16 },
  quickStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickStatText: { fontSize: 12, color: colors.textLight },
  detailsBtn: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailsBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  
  // ============================================
  // NEW RESULTS STYLES
  // ============================================
  modifyBtn: {
    padding: 6,
  },
  resultsInfoSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fallbackContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  fallbackHint: {
    fontSize: 12,
    color: '#E65100',
    marginTop: 6,
    fontStyle: 'italic',
  },
  matchedCriteriaContainer: {
    marginTop: 10,
  },
  criteriaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  criteriaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  criteriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  criteriaText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  emptyStateHint: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 6,
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
  },
  modifySearchBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  modifySearchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});