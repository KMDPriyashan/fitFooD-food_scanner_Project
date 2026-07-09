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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/Colors';
import { 
  UserHealthProfile, 
  Recipe, 
  DIETARY_OPTIONS, 
  HEALTH_GOALS, 
  HEALTH_CONDITIONS 
} from '../../constants/recipeTypes';
import { generateRecipes } from '../services/recipeService';

export default function RecipesScreen() {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Form state
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState('');
  const [eatingHabits, setEatingHabits] = useState('');

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleGenerateRecipes = async () => {
    if (!age || !weight) {
      Alert.alert('Please fill', 'Age and weight are required');
      return;
    }

    setLoading(true);
    try {
      const profile: UserHealthProfile = {
        age,
        weight,
        height: '',
        healthConditions: selectedConditions,
        dietaryPreferences: selectedDietary,
        healthGoals: selectedGoals,
        availableIngredients: ingredients.split(',').map(i => i.trim()).filter(i => i),
        pastEatingHabits: eatingHabits || 'Not specified',
      };

      const generatedRecipes = await generateRecipes(profile);
      setRecipes(generatedRecipes);
      setShowResults(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function to get display label from ID
  const getDietaryLabel = (id: string): string => {
    const option = DIETARY_OPTIONS.find(opt => opt.id === id);
    return option ? `${option.icon} ${option.label}` : id;
  };

  const getGoalLabel = (id: string): string => {
    const goal = HEALTH_GOALS.find(g => g.id === id);
    return goal ? `${goal.icon} ${goal.label}` : id;
  };

  const renderForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Smart Recipes</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSubtitle}>🍳 AI-powered personalized meal suggestions</Text>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        {/* Age & Weight */}
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

        {/* Health Conditions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Health Conditions</Text>
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

        {/* ✅ Dietary Preferences - FIXED */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dietary Preferences</Text>
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
                  {option.icon} {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Goals */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Health Goals</Text>
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
                  {goal.icon} {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Available Ingredients */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Available Ingredients</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., rice, chicken, vegetables, eggs"
            placeholderTextColor={colors.textLight}
            value={ingredients}
            onChangeText={setIngredients}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Eating Habits */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Past Eating Habits</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., I usually eat rice and curry, sometimes fast food"
            placeholderTextColor={colors.textLight}
            value={eatingHabits}
            onChangeText={setEatingHabits}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={handleGenerateRecipes}
          disabled={loading}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.generateGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.generateBtnText}>Generate Recipes</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderRecipes = () => (
    <View style={styles.resultsContainer}>
      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setShowResults(false)}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.resultsTitle}>Your Recipes</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.resultsSubtitle}>
        ✨ Based on your profile, here are {recipes.length} personalized recipes
      </Text>

      <ScrollView style={styles.recipesList} showsVerticalScrollIndicator={false}>
        {recipes.map((recipe, index) => (
          <View key={recipe.id} style={styles.recipeCard}>
            {/* Rank Badge */}
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>

            {/* Recipe Header */}
            <View style={styles.recipeHeader}>
              <View style={styles.recipeTitleContainer}>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                {recipe.nameSi && (
                  <Text style={styles.recipeNameSi}>{recipe.nameSi}</Text>
                )}
              </View>
              <View style={[styles.healthScoreBadge, { backgroundColor: recipe.healthScore >= 80 ? '#4CAF50' : recipe.healthScore >= 60 ? '#FF9800' : '#F44336' }]}>
                <Text style={styles.healthScoreText}>{recipe.healthScore}</Text>
              </View>
            </View>

            {/* Dietary Tags */}
            <View style={styles.dietaryTags}>
              {recipe.dietaryTags.map((tag) => (
                <View key={tag} style={styles.dietaryTag}>
                  <Text style={styles.dietaryTagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.recipeDescription}>{recipe.description}</Text>

            {/* Nutrition */}
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.calories}</Text>
                <Text style={styles.nutritionLabel}>Cal</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.protein}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.fat}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>

            {/* Why Recommended */}
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationLabel}>💡 Why This is Recommended</Text>
              <Text style={styles.recommendationText}>{recipe.whyRecommended}</Text>
            </View>

            {/* Suitability Reason */}
            <View style={styles.suitabilityBox}>
              <Text style={styles.suitabilityLabel}>✅ Suitable Because</Text>
              <Text style={styles.suitabilityText}>{recipe.suitabilityReason}</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Ionicons name="time-outline" size={16} color={colors.textLight} />
                <Text style={styles.quickStatText}>{recipe.cookingTime}m</Text>
              </View>
              <View style={styles.quickStat}>
                <Ionicons name="people-outline" size={16} color={colors.textLight} />
                <Text style={styles.quickStatText}>{recipe.servings} servings</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatText, { color: recipe.difficulty === 'Easy' ? '#4CAF50' : recipe.difficulty === 'Medium' ? '#FF9800' : '#F44336' }]}>
                  {recipe.difficulty}
                </Text>
              </View>
            </View>

            {/* Ingredients & Instructions - Expandable */}
            <TouchableOpacity style={styles.detailsBtn} onPress={() => Alert.alert('Recipe Details', `${recipe.name}\n\nIngredients:\n${recipe.ingredients.join('\n')}\n\nInstructions:\n${recipe.instructions.join('\n')}`)}>
              <Text style={styles.detailsBtnText}>View Full Recipe →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 52,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  form: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
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
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
  chipText: {
    fontSize: 13,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  generateBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    backgroundColor: colors.primary,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  recipesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
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
  rankText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  recipeTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  recipeNameSi: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  healthScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  healthScoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  dietaryTag: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dietaryTagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  recipeDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    lineHeight: 20,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  nutritionLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  recommendationBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  recommendationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  recommendationText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  suitabilityBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  suitabilityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 2,
  },
  suitabilityText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 16,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickStatText: {
    fontSize: 12,
    color: colors.textLight,
  },
  detailsBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});