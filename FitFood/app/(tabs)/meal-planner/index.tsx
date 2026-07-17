// app/(tabs)/meal-planner/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MealPlannerService from '../../services/meal-planner/mealPlannerService';
import { DailyMealPlan, Meal } from '../../../types/meal-planner.types';
import { getMealTypeColor, getMealTypeIcon } from '../../services/meal-planner/mealPlannerService';

const { width } = Dimensions.get('window');

export default function MealPlannerScreen() {
  const [plan, setPlan] = useState<DailyMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const todayPlan = await MealPlannerService.getOrCreateTodayPlan();
      setPlan(todayPlan);
      const progressData = await MealPlannerService.getNutritionProgress();
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddMeal = () => {
    router.push('/(tabs)/meal-planner/create-meal');
  };

  const handleViewMeal = (meal: Meal) => {
    router.push({
      pathname: '/(tabs)/meal-planner/create-meal',
      params: { mealId: meal.id },
    });
  };

  const handleToggleComplete = async (mealId: string) => {
    if (plan) {
      const updatedPlan = await MealPlannerService.toggleMealComplete(mealId);
      setPlan(updatedPlan);
      const progressData = await MealPlannerService.getNutritionProgress();
      setProgress(progressData);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (plan) {
              const updatedPlan = await MealPlannerService.deleteMeal(mealId);
              setPlan(updatedPlan);
              const progressData = await MealPlannerService.getNutritionProgress();
              setProgress(progressData);
            }
          },
        },
      ]
    );
  };

  const renderMealCard = (meal: Meal) => (
    <TouchableOpacity
      key={meal.id}
      style={[styles.mealCard, meal.completed && styles.mealCardCompleted]}
      onPress={() => handleViewMeal(meal)}
    >
      <View style={styles.mealHeader}>
        <View style={[styles.mealTypeDot, { backgroundColor: getMealTypeColor(meal.type) }]} />
        <Text style={styles.mealType}>{getMealTypeIcon(meal.type)} {meal.type.toUpperCase()}</Text>
        <Text style={styles.mealTime}>{meal.time}</Text>
      </View>
      
      <View style={styles.mealBody}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealFoods}>{meal.foods.join(', ')}</Text>
        <View style={styles.mealNutrition}>
          <Text style={styles.mealCalories}>🔥 {meal.calories} kcal</Text>
          <Text style={styles.mealMacro}>💪 {meal.protein}g</Text>
          <Text style={styles.mealMacro}>🌾 {meal.carbs}g</Text>
          <Text style={styles.mealMacro}>🧈 {meal.fat}g</Text>
        </View>
      </View>

      <View style={styles.mealActions}>
        <TouchableOpacity
          style={[styles.completeBtn, meal.completed && styles.completeBtnActive]}
          onPress={() => handleToggleComplete(meal.id)}
        >
          <Ionicons
            name={meal.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={22}
            color={meal.completed ? '#4CAF50' : '#999'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteMeal(meal.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyMealSlot = (type: string, icon: string) => (
    <TouchableOpacity
      style={styles.emptySlot}
      onPress={handleAddMeal}
    >
      <Text style={styles.emptySlotIcon}>{icon}</Text>
      <Text style={styles.emptySlotText}>Add {type}</Text>
      <Ionicons name="add-circle-outline" size={24} color="#E53935" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Loading your meal plan...</Text>
      </SafeAreaView>
    );
  }

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { key: 'lunch', label: 'Lunch', icon: '☀️' },
    { key: 'dinner', label: 'Dinner', icon: '🌙' },
    { key: 'snack', label: 'Snack', icon: '🍿' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🍽️ Meal Planner</Text>
          <Text style={styles.headerSubtitle}>Plan your meals for today</Text>
        </View>

        {/* Progress Section */}
        {progress && (
          <View style={styles.progressContainer}>
            <LinearGradient
              colors={['#E53935', '#C62828']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Today's Progress</Text>
                <Text style={styles.progressCalories}>
                  {plan?.totalCalories || 0} / {plan?.caloriesGoal || 2000} kcal
                </Text>
              </View>
              
              {/* Calorie Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min((plan?.totalCalories || 0) / (plan?.caloriesGoal || 2000) * 100, 100)}%` },
                  ]}
                />
              </View>

              {/* Macro Summary */}
              <View style={styles.macroRow}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{plan?.totalProtein || 0}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroDivider} />
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{plan?.totalCarbs || 0}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroDivider} />
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{plan?.totalFat || 0}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Meals Section */}
        <View style={styles.mealsContainer}>
          <View style={styles.mealsHeader}>
            <Text style={styles.mealsTitle}>Today's Meals</Text>
            <TouchableOpacity style={styles.addMealBtn} onPress={handleAddMeal}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addMealBtnText}>Add Meal</Text>
            </TouchableOpacity>
          </View>

          {mealTypes.map(({ key, label, icon }) => {
            const meals = plan?.meals.filter(m => m.type === key) || [];
            return (
              <View key={key} style={styles.mealSection}>
                <Text style={styles.mealSectionTitle}>{icon} {label}</Text>
                {meals.length > 0 ? (
                  meals.map(renderMealCard)
                ) : (
                  renderEmptyMealSlot(label, icon)
                )}
              </View>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => router.push('/(tabs)/meal-planner/shopping-list')}
          >
            <Ionicons name="list-outline" size={24} color="#E53935" />
            <Text style={styles.quickActionText}>Shopping List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => router.push('/(tabs)/meal-planner/favorites')}
          >
            <Ionicons name="heart-outline" size={24} color="#E53935" />
            <Text style={styles.quickActionText}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => router.push('/(tabs)/meal-planner/progress')}
          >
            <Ionicons name="stats-chart-outline" size={24} color="#E53935" />
            <Text style={styles.quickActionText}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => router.push('/(tabs)/meal-planner/history')}
          >
            <Ionicons name="time-outline" size={24} color="#E53935" />
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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

  // Header
  header: {
    marginBottom: 20,
    marginTop: 65,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },

  // Progress
  progressContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressGradient: {
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressCalories: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  macroLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  macroDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Meals
  mealsContainer: {
    flex: 1,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  addMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addMealBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  mealSection: {
    marginBottom: 16,
  },
  mealSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },

  // Meal Card
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  mealCardCompleted: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  mealTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  mealType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  mealTime: {
    fontSize: 12,
    color: '#64748B',
  },
  mealBody: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  mealFoods: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  mealNutrition: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  mealCalories: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E53935',
  },
  mealMacro: {
    fontSize: 12,
    color: '#64748B',
  },
  mealActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 12,
  },
  completeBtn: {
    padding: 4,
  },
  completeBtnActive: {
    padding: 4,
  },
  deleteBtn: {
    padding: 4,
  },

  // Empty Slot
  emptySlot: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptySlotIcon: {
    fontSize: 20,
  },
  emptySlotText: {
    fontSize: 14,
    color: '#64748B',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  quickActionBtn: {
    flex: 1,
    minWidth: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: '#1E293B',
    marginTop: 4,
  },
});