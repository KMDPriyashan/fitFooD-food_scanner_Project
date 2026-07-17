// app/(tabs)/meal-planner/favorites.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator, // ✅ Added this import
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as MealPlannerService from '../../services/meal-planner/mealPlannerService';
import { Meal } from '../../../types/meal-planner.types';
import { getMealTypeColor, getMealTypeIcon } from '../../services/meal-planner/mealPlannerService';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await MealPlannerService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (mealId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const meal = favorites.find(m => m.id === mealId);
            if (meal) {
              await MealPlannerService.toggleFavorite(meal);
              setFavorites(favorites.filter(m => m.id !== mealId));
            }
          },
        },
      ]
    );
  };

  const handleAddToPlan = async (meal: Meal) => {
    await MealPlannerService.addMealToPlan(meal);
    Alert.alert('✅ Added', `${meal.name} added to today's plan!`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
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
        <Text style={styles.headerTitle}>❤️ Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>❤️</Text>
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>
              Save your favorite meals for quick access
            </Text>
          </View>
        ) : (
          favorites.map((meal) => (
            <View key={meal.id} style={styles.favoriteCard}>
              <View style={styles.mealHeader}>
                <View style={[styles.mealTypeDot, { backgroundColor: getMealTypeColor(meal.type) }]} />
                <Text style={styles.mealType}>{getMealTypeIcon(meal.type)} {meal.type.toUpperCase()}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealFoods}>{meal.foods.join(', ')}</Text>
              
              <View style={styles.mealNutrition}>
                <Text style={styles.mealCalories}>🔥 {meal.calories} kcal</Text>
                <Text style={styles.mealMacro}>💪 {meal.protein}g</Text>
                <Text style={styles.mealMacro}>🌾 {meal.carbs}g</Text>
                <Text style={styles.mealMacro}>🧈 {meal.fat}g</Text>
              </View>

              <View style={styles.mealActions}>
                <TouchableOpacity
                  style={styles.addToPlanBtn}
                  onPress={() => handleAddToPlan(meal)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.addToPlanBtnText}>Add to Plan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeFavBtn}
                  onPress={() => handleRemoveFavorite(meal.id)}
                >
                  <Ionicons name="heart" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  favoriteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
    marginTop: 10,
    gap: 8,
  },
  addToPlanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addToPlanBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  removeFavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});