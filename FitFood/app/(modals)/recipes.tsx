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
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/Colors';
import { 
  UserProfile, 
  Recipe, 
  filterRecipesFromDB,
  getAllRecipes
} from '../services/recipeService';

const { width } = Dimensions.get('window');

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: '🌱 Vegetarian' },
  { id: 'vegan', label: '🌿 Vegan' },
  { id: 'gluten_free', label: '🚫 gluten_free' },
  { id: 'high-protein', label: '💪 High Protein' },
  { id: 'low-carb', label: '🥑 Low Carb' },
  { id: 'high-fiber', label: '🌾 High Fiber' },
  { id: 'low-fat', label: '🥗 Low Fat' },
];

const HEALTH_GOALS = [
  { id: 'weight-loss', label: '⚖️ Weight Loss' },
  { id: 'muscle-gain', label: '💪 Muscle Gain' },
  { id: 'diabetes-management', label: '🩸 Diabetes_Management' },
  { id: 'heart-health', label: '❤️ Heart Health' },
  { id: 'general-wellness', label: '😊 General_Wellness' },
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

      let filteredRecipes = await filterRecipesFromDB(profile);
      
      if (filteredRecipes.length > 0) {
        setRecipes(filteredRecipes);
        setShowFallback(false);
      } else {
        setShowFallback(true);
        const allRecipes = await getAllRecipes();
        setRecipes(allRecipes.slice(0, 10));
      }
      
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
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
  // RENDER FORM - REDESIGNED
  // ============================================
  const renderForm = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* ✅ Redesigned Header with Gradient */}
        <LinearGradient
          colors={['#E53935', '#C62828']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>🍽️ Smart Recipes</Text>
              <Text style={styles.headerSubtitle}>Find recipes based on your health profile</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <View style={styles.form}>
          {/* ✅ Redesigned Personal Info Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionIconRow}>
              <Ionicons name="person-circle-outline" size={24} color="#E53935" />
              <Text style={styles.sectionTitle}>Personal Info</Text>
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Age *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 25"
                    placeholderTextColor="#94A3B8"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Weight (kg) *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="fitness-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 70"
                    placeholderTextColor="#94A3B8"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* ✅ Redesigned Dietary Preferences */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionIconRow}>
              <Ionicons name="restaurant-outline" size={24} color="#E53935" />
              <Text style={styles.sectionTitle}>Dietary Preferences</Text>
            </View>
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

          {/* ✅ Redesigned Health Goals */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionIconRow}>
              <Ionicons name="flag-outline" size={24} color="#E53935" />
              <Text style={styles.sectionTitle}>Health Goals</Text>
            </View>
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

          {/* ✅ Redesigned Health Conditions */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionIconRow}>
              <Ionicons name="medical-outline" size={24} color="#E53935" />
              <Text style={styles.sectionTitle}>Health Conditions</Text>
            </View>
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

          {/* ✅ Redesigned Ingredients */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionIconRow}>
              <Ionicons name="basket-outline" size={24} color="#E53935" />
              <Text style={styles.sectionTitle}>Available Ingredients</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Separate with commas (e.g., chicken, rice)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., chicken, rice, vegetables, eggs"
                placeholderTextColor="#94A3B8"
                value={ingredients}
                onChangeText={setIngredients}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* ✅ Redesigned Generate Button */}
          <TouchableOpacity
            style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
            onPress={handleGenerateRecipes}
            disabled={loading}
          >
            <LinearGradient
              colors={['#E53935', '#C62828']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={22} color="#FFFFFF" />
                  <Text style={styles.generateBtnText}>Find Recipes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* ✅ Redesigned Tips Card */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={20} color="#F57C00" />
              <Text style={styles.tipsTitle}>Quick Tips</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Select at least one dietary preference for better results</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Add ingredients you have at home</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>The more you select, the better the matches</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ============================================
  // RENDER RECIPES - REDESIGNED
  // ============================================
  const renderRecipes = () => (
    <View style={styles.resultsContainer}>
      {/* ✅ Redesigned Results Header */}
      <LinearGradient
        colors={['#E53935', '#C62828']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.resultsHeaderGradient}
      >
        <View style={styles.resultsHeaderContent}>
          <TouchableOpacity 
            style={styles.resultsBackBtn} 
            onPress={() => {
              setShowResults(false);
              setRecipes([]);
              setShowFallback(false);
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.resultsTitle}>Your Recipes</Text>
          <TouchableOpacity 
            style={styles.modifyBtn}
            onPress={() => setShowResults(false)}
          >
            <Ionicons name="pencil-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.resultsSubtitle}>
          🎯 Found {recipes.length} recipes for you
        </Text>
      </LinearGradient>

      {/* Results Info Section */}
      <View style={styles.resultsInfoSection}>
        {showFallback ? (
          <View style={styles.fallbackContainer}>
            <Ionicons name="alert-circle" size={20} color="#FF9800" />
            <View style={styles.fallbackContent}>
              <Text style={styles.fallbackText}>No exact matches found</Text>
              <Text style={styles.fallbackHint}>Showing popular recipes instead</Text>
            </View>
          </View>
        ) : (
          <View style={styles.matchedCriteriaContainer}>
            <Text style={styles.criteriaLabel}>✅ Matched Criteria:</Text>
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
            <Ionicons name="restaurant-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No recipes available</Text>
            <Text style={styles.emptyStateHint}>Try adjusting your preferences</Text>
          </View>
        ) : (
          recipes.map((recipe, index) => (
            <TouchableOpacity 
              key={recipe.id} 
              style={styles.recipeCard}
              activeOpacity={0.9}
            >
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
                  <Ionicons name="time-outline" size={16} color="#94A3B8" />
                  <Text style={styles.quickStatText}>{recipe.cooking_time}m</Text>
                </View>
                <View style={styles.quickStat}>
                  <Ionicons name="people-outline" size={16} color="#94A3B8" />
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
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.modifySearchBtn}
          onPress={() => setShowResults(false)}
        >
          <LinearGradient
            colors={['#E53935', '#C62828']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modifySearchGradient}
          >
            <Ionicons name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.modifySearchBtnText}>Modify Search</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />
      {showResults ? renderRecipes() : renderForm()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginTop: 35,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
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
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
  },
  row: { flexDirection: 'row' },
  inputGroup: { marginBottom: 0 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    paddingRight: 4,
  },
  textArea: { minHeight: 56, textAlignVertical: 'top' },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  chipActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#E53935',
  },
  chipText: { fontSize: 13, color: '#64748B' },
  chipTextActive: { color: '#E53935', fontWeight: '600' },
  
  generateBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  generateBtnDisabled: { opacity: 0.7 },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  tipsCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F57C00',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F57C00',
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#4A3000',
    lineHeight: 20,
  },

  // ============================================
  // RESULTS STYLES - REDESIGNED
  // ============================================
  resultsContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  resultsHeaderGradient: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  resultsHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modifyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  
  resultsInfoSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fallbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  fallbackContent: {
    flex: 1,
  },
  fallbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E65100',
  },
  fallbackHint: {
    fontSize: 12,
    color: '#BF360C',
    marginTop: 2,
  },
  matchedCriteriaContainer: {
    marginTop: 4,
  },
  criteriaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  criteriaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  criteriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  criteriaText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '500',
  },
  
  recipesList: { 
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rankBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#E53935',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  rankText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  recipeTitleContainer: { flex: 1, marginRight: 8 },
  recipeName: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  recipeNameSi: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
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
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  dietaryTagText: { fontSize: 10, color: '#E53935', fontWeight: '600' },
  
  recipeDescription: { fontSize: 14, color: '#64748B', marginTop: 8, lineHeight: 20 },
  
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  nutritionItem: { alignItems: 'center' },
  nutritionValue: { fontSize: 15, fontWeight: '700', color: '#E53935' },
  nutritionLabel: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  
  recommendationBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recommendationLabel: { fontSize: 12, fontWeight: '600', color: '#2E7D32', marginBottom: 2 },
  recommendationText: { fontSize: 13, color: '#1E293B', lineHeight: 18 },
  
  quickStats: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 16 },
  quickStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickStatText: { fontSize: 12, color: '#94A3B8' },
  
  detailsBtn: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailsBtnText: { fontSize: 13, fontWeight: '600', color: '#E53935' },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyStateHint: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
  },
  
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modifySearchBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modifySearchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  modifySearchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});