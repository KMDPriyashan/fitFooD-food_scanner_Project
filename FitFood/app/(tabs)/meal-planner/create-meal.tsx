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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MealPlannerService from '../../services/meal-planner/mealPlannerService';
import { getTemplatesByType } from '../../services/meal-planner/mealTemplates';
import { Meal, MealTemplate } from '../../../types/meal-planner.types';
import { getMealTypeColor, getMealTypeIcon } from '../../services/meal-planner/mealPlannerService';

// ✅ Generate UUID locally instead of importing
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const MEAL_TYPES = [
  { value: 'breakfast', label: '🌅 Breakfast' },
  { value: 'lunch', label: '☀️ Lunch' },
  { value: 'dinner', label: '🌙 Dinner' },
  { value: 'snack', label: '🍿 Snack' },
];

export default function CreateMealScreen() {
  const params = useLocalSearchParams();
  const editMealId = params.mealId as string;
  const templateId = params.templateId as string;

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

  useEffect(() => {
    if (editMealId) {
      loadMealForEdit();
    } else if (templateId) {
      loadTemplate();
    }
    loadTemplates();
  }, []);

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    if (foods.length === 0) {
      Alert.alert('Error', 'Please add at least one food item');
      return;
    }

    // ✅ FIXED: Create meal with correct structure
    const meal: Meal = {
      id: editMealId || generateUUID(),
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

    try {
      if (editMealId) {
        await MealPlannerService.updateMeal(editMealId, meal);
      } else {
        await MealPlannerService.addMealToPlan(meal);
      }

      if (isFavorite) {
        await MealPlannerService.toggleFavorite(meal);
      }

      Alert.alert('✅ Success', 'Meal saved successfully!');
      router.back();
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal');
    }
  };

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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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
              <View key={index} style={styles.foodTag}>
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
    marginTop: 50,
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
});