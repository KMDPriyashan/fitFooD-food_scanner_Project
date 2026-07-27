// app/(tabs)/meal-planner/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
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

  // ✅ Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // ✅ Auto refresh when screen comes into focus (after returning from create-meal)
  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {};
    }, [])
  );

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

  // ✅ Render meal card with unique key
  const renderMealCard = (meal: Meal, index: number) => (
    <TouchableOpacity
      key={`${meal.id}_${index}`}
      style={[styles.mealCard, meal.completed && styles.mealCardCompleted]}
      onPress={() => handleViewMeal(meal)}
      activeOpacity={0.7}
    >
      <View style={styles.mealHeader}>
        <View style={[styles.mealTypeDot, { backgroundColor: getMealTypeColor(meal.type) }]} />
        <Text style={styles.mealType}>{getMealTypeIcon(meal.type)} {meal.type.toUpperCase()}</Text>
        <Text style={styles.mealTime}>{meal.time}</Text>
      </View>
      
      <View style={styles.mealBody}>
        <Text style={[styles.mealName, meal.completed && styles.mealNameCompleted]}>
          {meal.name}
        </Text>
        <Text style={styles.mealFoods}>{meal.foods.join(' • ')}</Text>
        <View style={styles.mealNutrition}>
          <View style={styles.nutritionItem}>
            <Text style={styles.mealCalories}>🔥 {meal.calories}</Text>
            <Text style={styles.nutritionLabel}>kcal</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.mealMacro}>💪 {meal.protein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.mealMacro}>🌾 {meal.carbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.mealMacro}>🧈 {meal.fat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
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
          <Text style={[styles.completeBtnText, meal.completed && styles.completeBtnTextActive]}>
            {meal.completed ? 'Done' : 'Mark Done'}
          </Text>
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

  // ✅ Render empty meal slot with unique key
  const renderEmptyMealSlot = (type: string, icon: string) => (
    <TouchableOpacity
      key={`empty_${type}`}
      style={styles.emptySlot}
      onPress={handleAddMeal}
      activeOpacity={0.8}
    >
      <View style={styles.emptySlotContent}>
        <Text style={styles.emptySlotIcon}>{icon}</Text>
        <Text style={styles.emptySlotText}>Add {type}</Text>
        <View style={styles.emptySlotAddBtn}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </View>
      </View>
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

  // Calculate completion percentage
  const totalMeals = plan?.meals.length || 0;
  const completedMeals = plan?.meals.filter(m => m.completed).length || 0;
  const completionPercentage = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />
      
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ✅ Redesigned Header with Gradient */}
        <LinearGradient
          colors={['#E53935', '#C62828']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>🍽️ Meal Planner</Text>
              <Text style={styles.headerSubtitle}>Plan your meals for today</Text>
            </View>
          </View>

          {/* Progress Summary */}
          <View style={styles.progressSummary}>
            <View style={styles.progressSummaryItem}>
              <Text style={styles.progressSummaryNumber}>{completedMeals}</Text>
              <Text style={styles.progressSummaryLabel}>Completed</Text>
            </View>
            <View style={styles.progressSummaryDivider} />
            <View style={styles.progressSummaryItem}>
              <Text style={styles.progressSummaryNumber}>{totalMeals}</Text>
              <Text style={styles.progressSummaryLabel}>Total Meals</Text>
            </View>
            <View style={styles.progressSummaryDivider} />
            <View style={styles.progressSummaryItem}>
              <Text style={styles.progressSummaryNumber}>{completionPercentage}%</Text>
              <Text style={styles.progressSummaryLabel}>Done</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Progress Section */}
        {progress && (
          <View style={styles.progressContainer}>
            <LinearGradient
              colors={['#FFF5F5', '#FFEBEE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.progressCard}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>📊 Today's Progress</Text>
                <Text style={styles.progressCalories}>
                  {plan?.totalCalories || 0} / {plan?.caloriesGoal || 2000} kcal
                </Text>
              </View>
              
              {/* Calorie Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { 
                      width: `${Math.min((plan?.totalCalories || 0) / (plan?.caloriesGoal || 2000) * 100, 100)}%`,
                      backgroundColor: (plan?.totalCalories || 0) / (plan?.caloriesGoal || 2000) > 0.8 ? '#4CAF50' : '#E53935'
                    },
                  ]}
                />
              </View>

              {/* Macro Summary */}
              <View style={styles.macroRow}>
                <View style={styles.macroItem}>
                  <View style={[styles.macroIcon, { backgroundColor: '#FF6B6B' }]}>
                    <Text style={styles.macroIconText}>💪</Text>
                  </View>
                  <Text style={styles.macroValue}>{plan?.totalProtein || 0}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroDivider} />
                <View style={styles.macroItem}>
                  <View style={[styles.macroIcon, { backgroundColor: '#FFA94D' }]}>
                    <Text style={styles.macroIconText}>🌾</Text>
                  </View>
                  <Text style={styles.macroValue}>{plan?.totalCarbs || 0}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroDivider} />
                <View style={styles.macroItem}>
                  <View style={[styles.macroIcon, { backgroundColor: '#9775FA' }]}>
                    <Text style={styles.macroIconText}>🧈</Text>
                  </View>
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
              <LinearGradient
                colors={['#E53935', '#C62828']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addMealGradient}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addMealBtnText}>Add Meal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {mealTypes.map(({ key, label, icon }) => {
            const meals = plan?.meals.filter(m => m.type === key) || [];
            return (
              <View key={`section_${key}`} style={styles.mealSection}>
                <View style={styles.mealSectionHeader}>
                  <Text style={styles.mealSectionTitle}>{icon} {label}</Text>
                  <View style={styles.mealSectionCount}>
                    <Text style={styles.mealSectionCountText}>{meals.length}</Text>
                  </View>
                </View>
                {meals.length > 0 ? (
                  meals.map((meal, index) => renderMealCard(meal, index))
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
            <LinearGradient
              colors={['#FFF5F5', '#FFEBEE']}
              style={styles.quickActionGradient}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="list-outline" size={22} color="#E53935" />
              </View>
              <Text style={styles.quickActionText}>Shopping List</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => router.push('/(tabs)/meal-planner/favorites')}
          >
            <LinearGradient
              colors={['#FFF3E0', '#FFE0B2']}
              style={styles.quickActionGradient}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="heart-outline" size={22} color="#FF9800" />
              </View>
              <Text style={styles.quickActionText}>Favorites</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => router.push('/(tabs)/meal-planner/progress')}
          >
            <LinearGradient
              colors={['#E8F5E9', '#C8E6C9']}
              style={styles.quickActionGradient}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="stats-chart-outline" size={22} color="#4CAF50" />
              </View>
              <Text style={styles.quickActionText}>Progress</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => router.push('/(tabs)/meal-planner/history')}
          >
            <LinearGradient
              colors={['#E3F2FD', '#BBDEFB']}
              style={styles.quickActionGradient}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="time-outline" size={22} color="#2196F3" />
              </View>
              <Text style={styles.quickActionText}>History</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

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

  // ✅ Header
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Progress Summary
  progressSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 12,
  },
  progressSummaryItem: {
    alignItems: 'center',
  },
  progressSummaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressSummaryLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  progressSummaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Progress Card
  progressContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFEBEE',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressCalories: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
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
  macroIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroIconText: {
    fontSize: 14,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  macroLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  macroDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E8ECF0',
  },

  // Meals Section
  mealsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
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
    borderRadius: 20,
    overflow: 'hidden',
  },
  addMealGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  mealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  mealSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  mealSectionCount: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  mealSectionCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  // Meal Card
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mealCardCompleted: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
    borderColor: '#C8E6C9',
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
  mealNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  mealFoods: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  mealNutrition: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  mealCalories: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E53935',
  },
  mealMacro: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  nutritionLabel: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  mealActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  completeBtnActive: {
    backgroundColor: '#E8F5E9',
  },
  completeBtnText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  completeBtnTextActive: {
    color: '#4CAF50',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
  },

  // Empty Slot
  emptySlot: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderStyle: 'dashed',
  },
  emptySlotContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptySlotIcon: {
    fontSize: 18,
  },
  emptySlotText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  emptySlotAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  quickActionBtn: {
    flex: 1,
    minWidth: (width - 52) / 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
});