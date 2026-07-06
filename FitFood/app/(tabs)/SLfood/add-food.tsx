import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/Colors';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/context/AuthContext';
import BottomNav from '../../../components/BottomNav';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  description: string;
}

export default function AddFoodScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [foodName, setFoodName] = useState('');
  const [foodNameSi, setFoodNameSi] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '', unit: '' }
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { description: '' }
  ]);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [goodPoints, setGoodPoints] = useState<string[]>(['']);
  const [badPoints, setBadPoints] = useState<string[]>(['']);
  const [tips, setTips] = useState<string[]>(['']);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [culturalSignificance, setCulturalSignificance] = useState('');
  const [region, setRegion] = useState('');

  const mealTypes = [
    { id: 'breakfast', label: '🌅 Breakfast' },
    { id: 'lunch', label: '☀️ Lunch' },
    { id: 'dinner', label: '🌙 Dinner' },
  ];

  const difficultyOptions = ['Easy', 'Medium', 'Hard'];

  // Ingredient handlers
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  // Step handlers
  const addStep = () => {
    setSteps([...steps, { description: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index].description = value;
    setSteps(updated);
  };

  // Points handlers
  const addGoodPoint = () => setGoodPoints([...goodPoints, '']);
  const removeGoodPoint = (index: number) => {
    if (goodPoints.length > 1) {
      setGoodPoints(goodPoints.filter((_, i) => i !== index));
    }
  };
  const updateGoodPoint = (index: number, value: string) => {
    const updated = [...goodPoints];
    updated[index] = value;
    setGoodPoints(updated);
  };

  const addBadPoint = () => setBadPoints([...badPoints, '']);
  const removeBadPoint = (index: number) => {
    if (badPoints.length > 1) {
      setBadPoints(badPoints.filter((_, i) => i !== index));
    }
  };
  const updateBadPoint = (index: number, value: string) => {
    const updated = [...badPoints];
    updated[index] = value;
    setBadPoints(updated);
  };

  const addTip = () => setTips([...tips, '']);
  const removeTip = (index: number) => {
    if (tips.length > 1) {
      setTips(tips.filter((_, i) => i !== index));
    }
  };
  const updateTip = (index: number, value: string) => {
    const updated = [...tips];
    updated[index] = value;
    setTips(updated);
  };

  // Submit form
  const handleSubmit = async () => {
    // Validation
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter food name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter description');
      return;
    }
    if (ingredients.some(i => !i.name.trim())) {
      Alert.alert('Error', 'Please fill all ingredient names');
      return;
    }
    if (steps.some(s => !s.description.trim())) {
      Alert.alert('Error', 'Please fill all preparation steps');
      return;
    }

    setLoading(true);

    try {
      const tableMap: Record<string, string> = {
        breakfast: 'breakfast_meals',
        lunch: 'lunch_meals',
        dinner: 'dinner_meals',
      };

      const table = tableMap[selectedMeal] || 'breakfast_meals';

      const foodData = {
        name: foodName.trim(),
        name_si: foodNameSi.trim() || null,
        category: selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1),
        short_description: shortDescription.trim() || description.trim().substring(0, 100),
        description: description.trim(),
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        ingredients: ingredients.filter(i => i.name.trim()),
        preparation_steps: steps.filter(s => s.description.trim()).map(s => s.description.trim()),
        cooking_time: parseInt(cookingTime) || 20,
        prep_time: parseInt(prepTime) || 10,
        servings: parseInt(servings) || 2,
        difficulty: difficulty,
        nutrition: {
          calories: parseInt(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
          fiber: parseFloat(fiber) || 0,
        },
        good_points: goodPoints.filter(p => p.trim()),
        bad_points: badPoints.filter(p => p.trim()),
        tips: tips.filter(t => t.trim()),
        serving_suggestions: ['Serve with rice', 'Enjoy with family'],
        cultural_significance: culturalSignificance.trim() || null,
        region: region.trim() || 'Sri Lanka',
        is_vegetarian: isVegetarian,
        is_vegan: isVegan,
        is_gluten_free: isGlutenFree,
        user_id: user?.id || null,
      };

      const { data, error } = await supabase
        .from(table)
        .insert([foodData])
        .select();

      if (error) throw error;

      Alert.alert(
        '🎉 Success!',
        'Your food has been added successfully!',
        [
          {
            text: 'View Foods',
            onPress: () => router.back(),
          },
        ]
      );

      // Reset form
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add food');
      console.error('Error adding food:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFoodName('');
    setFoodNameSi('');
    setDescription('');
    setShortDescription('');
    setCookingTime('');
    setPrepTime('');
    setServings('');
    setDifficulty('Easy');
    setIngredients([{ name: '', amount: '', unit: '' }]);
    setSteps([{ description: '' }]);
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setFiber('');
    setGoodPoints(['']);
    setBadPoints(['']);
    setTips(['']);
    setIsVegetarian(false);
    setIsVegan(false);
    setIsGlutenFree(false);
    setCulturalSignificance('');
    setRegion('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add Sri Lankan Food</Text>
              <View style={{ width: 40 }} />
            </View>
            <Text style={styles.headerSubtitle}>Share your favorite Sri Lankan recipe</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Meal Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Meal Type *</Text>
              <View style={styles.mealTypeContainer}>
                {mealTypes.map((meal) => (
                  <TouchableOpacity
                    key={meal.id}
                    style={[
                      styles.mealTypeBtn,
                      selectedMeal === meal.id && styles.mealTypeBtnActive,
                    ]}
                    onPress={() => setSelectedMeal(meal.id)}
                  >
                    <Text style={[
                      styles.mealTypeText,
                      selectedMeal === meal.id && styles.mealTypeTextActive,
                    ]}>
                      {meal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Food Name */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Food Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., String Hoppers"
                value={foodName}
                onChangeText={setFoodName}
              />
            </View>

            {/* Food Name Sinhala */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Food Name (Sinhala)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., ඉඳි ආප්ප"
                value={foodNameSi}
                onChangeText={setFoodNameSi}
              />
            </View>

            {/* Short Description */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Short Description *</Text>
              <TextInput
                style={styles.input}
                placeholder="Brief description (max 100 chars)"
                value={shortDescription}
                onChangeText={setShortDescription}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Full Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Detailed description of the food"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Row: Cooking Time, Prep Time, Servings */}
            <View style={styles.row}>
              <View style={[styles.section, styles.rowItem]}>
                <Text style={styles.sectionLabel}>Cooking Time (min)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 25"
                  value={cookingTime}
                  onChangeText={setCookingTime}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.section, styles.rowItem]}>
                <Text style={styles.sectionLabel}>Prep Time (min)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 15"
                  value={prepTime}
                  onChangeText={setPrepTime}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.section, styles.rowItem]}>
                <Text style={styles.sectionLabel}>Servings</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2"
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Difficulty */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Difficulty</Text>
              <View style={styles.difficultyContainer}>
                {difficultyOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.difficultyBtn,
                      difficulty === opt && styles.difficultyBtnActive,
                    ]}
                    onPress={() => setDifficulty(opt)}
                  >
                    <Text style={[
                      styles.difficultyText,
                      difficulty === opt && styles.difficultyTextActive,
                    ]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Ingredients */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Ingredients *</Text>
                <TouchableOpacity style={styles.addBtn} onPress={addIngredient}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <TextInput
                    style={[styles.input, styles.ingredientNameInput]}
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChangeText={(text) => updateIngredient(index, 'name', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.ingredientAmountInput]}
                    placeholder="Amount"
                    value={ingredient.amount}
                    onChangeText={(text) => updateIngredient(index, 'amount', text)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.ingredientUnitInput]}
                    placeholder="Unit"
                    value={ingredient.unit}
                    onChangeText={(text) => updateIngredient(index, 'unit', text)}
                  />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={ingredients.length === 1 ? colors.gray : colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Preparation Steps */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Preparation Steps *</Text>
                <TouchableOpacity style={styles.addBtn} onPress={addStep}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.stepInput]}
                    placeholder={`Step ${index + 1}`}
                    value={step.description}
                    onChangeText={(text) => updateStep(index, text)}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeStep(index)}
                    disabled={steps.length === 1}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={steps.length === 1 ? colors.gray : colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Nutrition */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Nutrition (per serving)</Text>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabelSmall}>Calories</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabelSmall}>Protein (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabelSmall}>Carbs (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabelSmall}>Fat (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabelSmall}>Fiber (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    placeholder="0"
                    value={fiber}
                    onChangeText={setFiber}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Good Points */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Good Points</Text>
                <TouchableOpacity style={styles.addBtn} onPress={addGoodPoint}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
              {goodPoints.map((point, index) => (
                <View key={index} style={styles.pointRow}>
                  <Text style={styles.goodDot}>✓</Text>
                  <TextInput
                    style={[styles.input, styles.pointInput]}
                    placeholder="Good point"
                    value={point}
                    onChangeText={(text) => updateGoodPoint(index, text)}
                  />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeGoodPoint(index)}
                    disabled={goodPoints.length === 1}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={goodPoints.length === 1 ? colors.gray : colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Bad Points */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Bad Points</Text>
                <TouchableOpacity style={styles.addBtn} onPress={addBadPoint}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
              {badPoints.map((point, index) => (
                <View key={index} style={styles.pointRow}>
                  <Text style={styles.badDot}>⚠</Text>
                  <TextInput
                    style={[styles.input, styles.pointInput]}
                    placeholder="Bad point"
                    value={point}
                    onChangeText={(text) => updateBadPoint(index, text)}
                  />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeBadPoint(index)}
                    disabled={badPoints.length === 1}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={badPoints.length === 1 ? colors.gray : colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Tips */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Tips</Text>
                <TouchableOpacity style={styles.addBtn} onPress={addTip}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
              {tips.map((tip, index) => (
                <View key={index} style={styles.pointRow}>
                  <Text style={styles.tipDot}>💡</Text>
                  <TextInput
                    style={[styles.input, styles.pointInput]}
                    placeholder="Tip"
                    value={tip}
                    onChangeText={(text) => updateTip(index, text)}
                  />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeTip(index)}
                    disabled={tips.length === 1}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={tips.length === 1 ? colors.gray : colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Dietary Options */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Dietary Options</Text>
              <View style={styles.dietaryRow}>
                <TouchableOpacity
                  style={[styles.dietaryBtn, isVegetarian && styles.dietaryBtnActive]}
                  onPress={() => setIsVegetarian(!isVegetarian)}
                >
                  <Text style={[styles.dietaryBtnText, isVegetarian && styles.dietaryBtnTextActive]}>
                    🌱 Vegetarian
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dietaryBtn, isVegan && styles.dietaryBtnActive]}
                  onPress={() => setIsVegan(!isVegan)}
                >
                  <Text style={[styles.dietaryBtnText, isVegan && styles.dietaryBtnTextActive]}>
                    🌿 Vegan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dietaryBtn, isGlutenFree && styles.dietaryBtnActive]}
                  onPress={() => setIsGlutenFree(!isGlutenFree)}
                >
                  <Text style={[styles.dietaryBtnText, isGlutenFree && styles.dietaryBtnTextActive]}>
                    🚫 Gluten-Free
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cultural Significance */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Cultural Significance</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Traditional New Year food..."
                value={culturalSignificance}
                onChangeText={setCulturalSignificance}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Region */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Region</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Southern Province"
                value={region}
                onChangeText={setRegion}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Add Food</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 60,
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
    fontSize: 25,
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
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowItem: {
    flex: 1,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  mealTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    alignItems: 'center',
  },
  mealTypeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  mealTypeTextActive: {
    color: '#FFFFFF',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    alignItems: 'center',
  },
  difficultyBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  difficultyTextActive: {
    color: '#FFFFFF',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  ingredientNameInput: {
    flex: 2,
  },
  ingredientAmountInput: {
    flex: 1,
  },
  ingredientUnitInput: {
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  stepNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stepInput: {
    flex: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  removeBtn: {
    padding: 2,
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '30%',
  },
  nutritionLabelSmall: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
  },
  nutritionInput: {
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#F8F9FA',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pointInput: {
    flex: 1,
  },
  goodDot: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    width: 20,
  },
  badDot: {
    color: '#F44336',
    fontSize: 14,
    width: 20,
  },
  tipDot: {
    fontSize: 14,
    width: 20,
  },
  dietaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  dietaryBtnActive: {
    backgroundColor: colors.primaryLight + '30',
    borderColor: colors.primary,
  },
  dietaryBtnText: {
    fontSize: 13,
    color: colors.text,
  },
  dietaryBtnTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});