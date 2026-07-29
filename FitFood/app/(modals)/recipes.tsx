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
import BottomNav from '../../components/BottomNav';

const { width } = Dimensions.get('window');

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: '🌱 Vegetarian' },
  { id: 'vegan', label: '🌿 Vegan' },
  { id: 'gluten_free', label: '🚫 Gluten Free' },
  { id: 'high-protein', label: '💪 High Protein' },
  { id: 'low-carb', label: '🥑 Low Carb' },
  { id: 'high-fiber', label: '🌾 High Fiber' },
  { id: 'low-fat', label: '🥗 Low Fat' },
];

const HEALTH_GOALS = [
  { id: 'weight-loss', label: '⚖️ Weight Loss' },
  { id: 'muscle-gain', label: '💪 Muscle Gain' },
  { id: 'diabetes-management', label: '🩸 Diabetes' },
  { id: 'heart-health', label: '❤️ Heart Health' },
  { id: 'general-wellness', label: '😊 Wellness' },
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
      Alert.alert('⚠️ Missing Info', 'Age and weight are required');
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
      Alert.alert('Error', 'Failed to generate recipes');
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

  // ✅ Simplified Form
  const renderForm = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Simple Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#E53935', '#C62828']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>🍽️ Recipes</Text>
              <View style={{ width: 40 }} />
            </View>
            <Text style={styles.headerSubtitle}>Find healthy recipes for you</Text>
          </LinearGradient>
        </View>

        <View style={styles.form}>
          {/* Step 1: Personal Info */}
          <View style={styles.stepContainer}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepLabel}>Personal Info</Text>
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  placeholderTextColor="#94A3B8"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor="#94A3B8"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Step 2: Dietary Preferences */}
          <View style={styles.stepContainer}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepLabel}>Dietary Preferences</Text>
            </View>
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

          {/* Step 3: Health Goals */}
          <View style={styles.stepContainer}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepLabel}>Health Goals</Text>
            </View>
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

          {/* Step 4: Health Conditions */}
          <View style={styles.stepContainer}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepLabel}>Health Conditions</Text>
            </View>
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

          {/* Step 5: Ingredients */}
          <View style={styles.stepContainer}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>5</Text>
              <Text style={styles.stepLabel}>Your Ingredients</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="chicken, rice, vegetables"
              placeholderTextColor="#94A3B8"
              value={ingredients}
              onChangeText={setIngredients}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Find Recipes Button */}
          <TouchableOpacity
            style={[styles.findBtn, loading && styles.findBtnDisabled]}
            onPress={handleGenerateRecipes}
            disabled={loading}
          >
            <LinearGradient
              colors={['#E53935', '#C62828']}
              style={styles.findGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="search" size={22} color="#FFFFFF" />
                  <Text style={styles.findBtnText}>Find Recipes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ✅ Simplified Results
  const renderRecipes = () => (
    <View style={styles.resultsContainer}>
      {/* Results Header */}
      <LinearGradient
        colors={['#E53935', '#C62828']}
        style={styles.resultsHeader}
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
          <Text style={styles.resultsTitle}>Recipes</Text>
          <TouchableOpacity 
            style={styles.resultsModifyBtn}
            onPress={() => setShowResults(false)}
          >
            <Ionicons name="options-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.resultsCount}>
          {recipes.length} recipes found
        </Text>
      </LinearGradient>

      {/* Fallback Message */}
      {showFallback && (
        <View style={styles.fallbackBox}>
          <Ionicons name="alert-circle" size={20} color="#FF9800" />
          <Text style={styles.fallbackText}>Showing popular recipes</Text>
        </View>
      )}

      {/* Recipes List */}
      <ScrollView style={styles.recipesList} showsVerticalScrollIndicator={false}>
        {recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No recipes found</Text>
            <Text style={styles.emptyStateHint}>Try changing your preferences</Text>
          </View>
        ) : (
          recipes.map((recipe, index) => (
            <TouchableOpacity 
              key={recipe.id} 
              style={styles.recipeCard}
              activeOpacity={0.9}
            >
              <View style={styles.recipeHeader}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
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

              <Text style={styles.recipeDescription} numberOfLines={2}>
                {recipe.description}
              </Text>

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

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStat}>
                  <Ionicons name="time-outline" size={14} color="#94A3B8" />
                  <Text style={styles.quickStatText}>{recipe.cooking_time}m</Text>
                </View>
                <View style={styles.quickStat}>
                  <Ionicons name="people-outline" size={14} color="#94A3B8" />
                  <Text style={styles.quickStatText}>{recipe.servings}</Text>
                </View>
                <View style={styles.quickStat}>
                  <Text style={[styles.quickStatText, { color: getDifficultyColor(recipe.difficulty) }]}>
                    {recipe.difficulty}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.detailsBtn} 
                onPress={() => Alert.alert(
                  '📖 Recipe Details',
                  `${recipe.name}\n\n${'━'.repeat(30)}\n\n📋 INGREDIENTS:\n${recipe.ingredients?.map((i: string, idx: number) => `  ${idx + 1}. ${i}`).join('\n') || 'Not available'}\n\n${'━'.repeat(30)}\n\n👨‍🍳 INSTRUCTIONS:\n${recipe.instructions?.map((i: string, idx: number) => `  ${idx + 1}. ${i}`).join('\n') || 'Not available'}`
                )}
              >
                <Text style={styles.detailsBtnText}>View Full Recipe →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Footer */}
      <TouchableOpacity 
        style={styles.modifySearchBtn}
        onPress={() => setShowResults(false)}
      >
        <LinearGradient
          colors={['#E53935', '#C62828']}
          style={styles.modifySearchGradient}
        >
          <Ionicons name="options-outline" size={18} color="#FFFFFF" />
          <Text style={styles.modifySearchBtnText}>Modify Search</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />
      <View style={styles.content}>
        {showResults ? renderRecipes() : renderForm()}
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  content: {
    flex: 1,
  },
  
  // ===== FORM STYLES =====
  header: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
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
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  form: { 
    padding: 16, 
    paddingBottom: 40 
  },
  
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  stepNumber: {
    backgroundColor: '#E53935',
    color: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 24,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  row: { 
    flexDirection: 'row' 
  },
  inputGroup: { 
    marginBottom: 0 
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  textArea: { 
    minHeight: 56, 
    textAlignVertical: 'top' 
  },
  
  chipContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 6 
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  chipActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#E53935',
  },
  chipText: { 
    fontSize: 12, 
    color: '#64748B' 
  },
  chipTextActive: { 
    color: '#E53935', 
    fontWeight: '600' 
  },
  
  findBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  findGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  findBtnDisabled: { 
    opacity: 0.7 
  },
  findBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  tipText: {
    fontSize: 13,
    color: '#4A3000',
    flex: 1,
  },

  // ===== RESULTS STYLES =====
  resultsContainer: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  resultsHeader: {
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
  resultsModifyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  
  fallbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    gap: 8,
  },
  fallbackText: {
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
  
  recipesList: { 
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  rankText: { 
    color: '#FFFFFF', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  recipeTitleContainer: { 
    flex: 1, 
    marginRight: 8 
  },
  recipeName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1E293B' 
  },
  recipeNameSi: { 
    fontSize: 12, 
    color: '#94A3B8', 
    marginTop: 2 
  },
  healthScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 32,
    alignItems: 'center',
  },
  healthScoreText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  
  dietaryTags: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 6, 
    gap: 4 
  },
  dietaryTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dietaryTagText: { 
    fontSize: 9, 
    color: '#E53935', 
    fontWeight: '600' 
  },
  
  recipeDescription: { 
    fontSize: 13, 
    color: '#64748B', 
    marginTop: 6, 
    lineHeight: 18 
  },
  
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  nutritionItem: { 
    alignItems: 'center' 
  },
  nutritionValue: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#E53935' 
  },
  nutritionLabel: { 
    fontSize: 9, 
    color: '#94A3B8', 
    marginTop: 1 
  },
  
  quickStats: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 8, 
    gap: 12 
  },
  quickStat: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  quickStatText: { 
    fontSize: 11, 
    color: '#94A3B8' 
  },
  
  detailsBtn: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailsBtnText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#E53935' 
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
    color: '#1E293B',
    marginTop: 12,
  },
  emptyStateHint: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
  },
  
  modifySearchBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modifySearchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  modifySearchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});