// app/(tabs)/meal-planner/create-meal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MealPlannerService from '../../services/meal-planner/mealPlannerService';
import { getTemplatesByType } from '../../services/meal-planner/mealTemplates';
import { Meal, MealTemplate } from '../../../types/meal-planner.types';
import { getMealTypeColor, getMealTypeIcon } from '../../services/meal-planner/mealPlannerService';

// ✅ Generate unique UUID with timestamp
const generateUUID = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}_${random}`;
};

const MEAL_TYPES = [
  { value: 'breakfast', label: '🌅 Breakfast' },
  { value: 'lunch', label: '☀️ Lunch' },
  { value: 'dinner', label: '🌙 Dinner' },
  { value: 'snack', label: '🍿 Snack' },
];

// ✅ Snack specific fields
const SNACK_TYPES = [
  { value: 'healthy', label: '🥗 Healthy Snack' },
  { value: 'protein', label: '💪 Protein Snack' },
  { value: 'fruit', label: '🍎 Fruit Snack' },
  { value: 'nut', label: '🥜 Nut Snack' },
  { value: 'smoothie', label: '🥤 Smoothie' },
  { value: 'other', label: '📦 Other' },
];

export default function CreateMealScreen() {
  const params = useLocalSearchParams();
  const editMealId = params.mealId as string;
  const templateId = params.templateId as string;

  // ✅ Form States
  const [name, setName] = useState('');
  const [type, setType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [time, setTime] = useState('12:00');
  const [foods, setFoods] = useState<string[]>([]);
  const [foodInput, setFoodInput] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [recipe, setRecipe] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // ✅ Snack specific states
  const [snackType, setSnackType] = useState('healthy');
  const [servingSize, setServingSize] = useState('');
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isSugarFree, setIsSugarFree] = useState(false);

  // ✅ Reset form when entering the screen (for new meal)
  useFocusEffect(
    React.useCallback(() => {
      if (!editMealId && !templateId) {
        resetForm();
      }
      return () => {};
    }, [editMealId, templateId])
  );

  // ✅ Load data on mount
  useEffect(() => {
    if (editMealId) {
      setIsEditMode(true);
      loadMealForEdit();
    } else if (templateId) {
      loadTemplate();
    } else {
      setIsEditMode(false);
      resetForm();
    }
    loadTemplates();
  }, [editMealId, templateId]);

  // ✅ Reset form to initial state
  const resetForm = () => {
    setName('');
    setType('breakfast');
    setTime('12:00');
    setFoods([]);
    setFoodInput('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setPrepTime('');
    setRecipe('');
    setIsFavorite(false);
    setShowTemplates(false);
    setIsEditMode(false);
    // ✅ Reset snack fields
    setSnackType('healthy');
    setServingSize('');
    setIsGlutenFree(false);
    setIsVegan(false);
    setIsSugarFree(false);
  };

  const loadMealForEdit = async () => {
    setLoading(true);
    try {
      const plan = await MealPlannerService.getOrCreateTodayPlan();
      const meal = plan.meals.find(m => m.id === editMealId);
      if (meal) {
        setName(meal.name);
        setType(meal.type);
        setTime(meal.time);
        setFoods(meal.foods);
        setCalories(meal.calories.toString());
        setProtein(meal.protein.toString());
        setCarbs(meal.carbs.toString());
        setFat(meal.fat.toString());
        setPrepTime(meal.preparationTime?.toString() || '');
        setRecipe(meal.recipe || '');
        setIsFavorite(meal.isFavorite || false);
        setIsEditMode(true);
        
        // ✅ Load snack specific data if available
        if (meal.type === 'snack') {
          setSnackType((meal as any).snackType || 'healthy');
          setServingSize((meal as any).servingSize || '');
          setIsGlutenFree((meal as any).isGlutenFree || false);
          setIsVegan((meal as any).isVegan || false);
          setIsSugarFree((meal as any).isSugarFree || false);
        }
      }
    } catch (error) {
      console.error('Error loading meal:', error);
      Alert.alert('Error', 'Failed to load meal');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = () => {
    const allTemplates = [
      ...require('../../services/meal-planner/mealTemplates').BREAKFAST_TEMPLATES,
      ...require('../../services/meal-planner/mealTemplates').LUNCH_TEMPLATES,
      ...require('../../services/meal-planner/mealTemplates').DINNER_TEMPLATES,
      ...require('../../services/meal-planner/mealTemplates').SNACK_TEMPLATES,
    ];
    const template = allTemplates.find((t: MealTemplate) => t.id === templateId);
    if (template) {
      setName(template.name);
      setType(template.type);
      setFoods(template.foods);
      setCalories(template.calories.toString());
      setProtein(template.protein.toString());
      setCarbs(template.carbs.toString());
      setFat(template.fat.toString());
      setPrepTime(template.preparationTime?.toString() || '');
      setRecipe(template.recipe || '');
    }
  };

  const loadTemplates = () => {
    setTemplates(getTemplatesByType(type));
  };

  const handleAddFood = () => {
    if (foodInput.trim()) {
      setFoods([...foods, foodInput.trim()]);
      setFoodInput('');
    }
  };

  const handleRemoveFood = (index: number) => {
    const newFoods = [...foods];
    newFoods.splice(index, 1);
    setFoods(newFoods);
  };

  // ✅ Handle Save with navigation and refresh
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    if (foods.length === 0) {
      Alert.alert('Error', 'Please add at least one food item');
      return;
    }

    // ✅ Generate unique ID
    const uniqueId = editMealId || `${Date.now()}_${generateUUID()}`;

    // ✅ Base meal object
    const meal: Meal = {
      id: uniqueId,
      name: name.trim(),
      type: type,
      time: time,
      foods: foods,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      preparationTime: parseInt(prepTime) || undefined,
      recipe: recipe.trim() || undefined,
      isFavorite: isFavorite,
      completed: false,
    };

    // ✅ Add snack specific fields if type is snack
    if (type === 'snack') {
      (meal as any).snackType = snackType;
      (meal as any).servingSize = servingSize;
      (meal as any).isGlutenFree = isGlutenFree;
      (meal as any).isVegan = isVegan;
      (meal as any).isSugarFree = isSugarFree;
    }

    try {
      if (editMealId) {
        await MealPlannerService.updateMeal(editMealId, meal);
      } else {
        await MealPlannerService.addMealToPlan(meal);
      }

      if (isFavorite) {
        await MealPlannerService.toggleFavorite(meal);
      }

      Alert.alert(
        '✅ Success!',
        `${meal.name} has been ${editMealId ? 'updated' : 'added'} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              router.push('/(tabs)/meal-planner');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal');
    }
  };

  // ✅ Handle Cancel - Reset and go back
  const handleCancel = () => {
    resetForm();
    router.back();
  };

  // ✅ Render snack specific form fields
  const renderSnackFields = () => (
    <View style={styles.snackContainer}>
      {/* Snack Type */}
      <View style={styles.section}>
        <Text style={styles.label}>Snack Type</Text>
        <View style={styles.typeContainer}>
          {SNACK_TYPES.map(({ value, label }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.typeBtn,
                snackType === value && { backgroundColor: '#FF9800' },
              ]}
              onPress={() => setSnackType(value)}
            >
              <Text style={[styles.typeBtnText, snackType === value && styles.typeBtnTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Serving Size */}
      <View style={styles.section}>
        <Text style={styles.label}>Serving Size</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 1 cup, 100g, 2 pieces"
          placeholderTextColor="#94A3B8"
          value={servingSize}
          onChangeText={setServingSize}
        />
      </View>

      {/* Dietary Preferences */}
      <View style={styles.section}>
        <Text style={styles.label}>Dietary Preferences</Text>
        <View style={styles.dietaryRow}>
          <TouchableOpacity
            style={[
              styles.dietaryBtn,
              isGlutenFree && styles.dietaryBtnActive,
            ]}
            onPress={() => setIsGlutenFree(!isGlutenFree)}
          >
            <Text style={[
              styles.dietaryBtnText,
              isGlutenFree && styles.dietaryBtnTextActive,
            ]}>
              🚫 Gluten Free
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dietaryBtn,
              isVegan && styles.dietaryBtnActive,
            ]}
            onPress={() => setIsVegan(!isVegan)}
          >
            <Text style={[
              styles.dietaryBtnText,
              isVegan && styles.dietaryBtnTextActive,
            ]}>
              🌱 Vegan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dietaryBtn,
              isSugarFree && styles.dietaryBtnActive,
            ]}
            onPress={() => setIsSugarFree(!isSugarFree)}
          >
            <Text style={[
              styles.dietaryBtnText,
              isSugarFree && styles.dietaryBtnTextActive,
            ]}>
              🍭 Sugar Free
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Loading meal...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editMealId ? 'Edit Meal' : 'Add Meal'}</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Meal Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Meal Type</Text>
          <View style={styles.typeContainer}>
            {MEAL_TYPES.map(({ value, label }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.typeBtn,
                  type === value && { backgroundColor: getMealTypeColor(value) },
                ]}
                onPress={() => setType(value as any)}
              >
                <Text style={[styles.typeBtnText, type === value && styles.typeBtnTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ✅ Snack specific fields - only show when snack is selected */}
        {type === 'snack' && renderSnackFields()}

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Meal Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter meal name..."
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Time */}
        <View style={styles.section}>
          <Text style={styles.label}>Time</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            placeholderTextColor="#94A3B8"
            value={time}
            onChangeText={setTime}
          />
        </View>

        {/* Foods */}
        <View style={styles.section}>
          <Text style={styles.label}>Food Items</Text>
          <View style={styles.foodInputContainer}>
            <TextInput
              style={[styles.input, styles.foodInput]}
              placeholder="Add food item..."
              placeholderTextColor="#94A3B8"
              value={foodInput}
              onChangeText={setFoodInput}
              onSubmitEditing={handleAddFood}
            />
            <TouchableOpacity style={styles.addFoodBtn} onPress={handleAddFood}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.foodTags}>
            {foods.map((food, index) => (
              <View key={`food_${food}_${index}`} style={styles.foodTag}>
                <Text style={styles.foodTagText}>{food}</Text>
                <TouchableOpacity onPress={() => handleRemoveFood(index)}>
                  <Ionicons name="close-circle" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Nutrition */}
        <View style={styles.section}>
          <Text style={styles.label}>Nutrition</Text>
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionInput}>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <TextInput
                style={styles.nutritionField}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.nutritionInput}>
              <Text style={styles.nutritionLabel}>Protein (g)</Text>
              <TextInput
                style={styles.nutritionField}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.nutritionInput}>
              <Text style={styles.nutritionLabel}>Carbs (g)</Text>
              <TextInput
                style={styles.nutritionField}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.nutritionInput}>
              <Text style={styles.nutritionLabel}>Fat (g)</Text>
              <TextInput
                style={styles.nutritionField}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Preparation Time */}
        <View style={styles.section}>
          <Text style={styles.label}>Preparation Time (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 15"
            placeholderTextColor="#94A3B8"
            value={prepTime}
            onChangeText={setPrepTime}
            keyboardType="numeric"
          />
        </View>

        {/* Recipe */}
        <View style={styles.section}>
          <Text style={styles.label}>Recipe (Optional)</Text>
          <TextInput
            style={[styles.input, styles.recipeInput]}
            placeholder="Describe how to prepare..."
            placeholderTextColor="#94A3B8"
            value={recipe}
            onChangeText={setRecipe}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Favorite */}
        <View style={styles.section}>
          <View style={styles.favoriteRow}>
            <Text style={styles.label}>Add to Favorites</Text>
            <Switch
              value={isFavorite}
              onValueChange={setIsFavorite}
              trackColor={{ false: '#E8ECF0', true: '#E53935' }}
            />
          </View>
        </View>

        {/* Templates */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.templateHeader}
            onPress={() => setShowTemplates(!showTemplates)}
          >
            <Text style={styles.label}>📋 Use Template</Text>
            <Ionicons
              name={showTemplates ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>

          {showTemplates && (
            <View style={styles.templateList}>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateItem}
                  onPress={() => {
                    setName(template.name);
                    setFoods(template.foods);
                    setCalories(template.calories.toString());
                    setProtein(template.protein.toString());
                    setCarbs(template.carbs.toString());
                    setFat(template.fat.toString());
                    setPrepTime(template.preparationTime?.toString() || '');
                    setRecipe(template.recipe || '');
                    setShowTemplates(false);
                  }}
                >
                  <View>
                    <Text style={styles.templateName}>{template.icon} {template.name}</Text>
                    <Text style={styles.templateFoods}>{template.foods.join(', ')}</Text>
                  </View>
                  <Text style={styles.templateCalories}>{template.calories} kcal</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingTop: 60,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  saveBtn: {
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  typeBtnText: {
    fontSize: 13,
    color: '#64748B',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  foodInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  foodInput: {
    flex: 1,
  },
  addFoodBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  foodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    gap: 6,
  },
  foodTagText: {
    fontSize: 13,
    color: '#1E293B',
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nutritionInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  nutritionLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  nutritionField: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    padding: 0,
  },
  recipeInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  favoriteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateList: {
    marginTop: 8,
    gap: 8,
  },
  templateItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  templateFoods: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  templateCalories: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E53935',
  },

  // ✅ Snack specific styles
  snackContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  dietaryBtnActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  dietaryBtnText: {
    fontSize: 12,
    color: '#64748B',
  },
  dietaryBtnTextActive: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8ECF0',
    marginVertical: 8,
  },
});