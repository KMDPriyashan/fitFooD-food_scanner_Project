// app/(tabs)/meal-planner/history.tsx
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
import * as Storage from '../../services/meal-planner/storageService';
import { DailyMealPlan } from '../../../types/meal-planner.types';
import { getMealTypeIcon } from '../../services/meal-planner/mealPlannerService';

export default function HistoryScreen() {
  const [history, setHistory] = useState<DailyMealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const plans = await Storage.getMealPlans();
      const sorted = plans.sort((a, b) => b.date.localeCompare(a.date));
      setHistory(sorted);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPlan = async (plan: DailyMealPlan) => {
    const today = new Date().toISOString().split('T')[0];
    const newPlan: DailyMealPlan = {
      ...plan,
      id: Date.now().toString(),
      date: today,
      meals: plan.meals.map(meal => ({
        ...meal,
        id: Date.now().toString() + Math.random().toString(),
        completed: false,
      })),
    };
    
    await Storage.saveTodayMealPlan(newPlan);
    Alert.alert('✅ Copied', 'Plan copied to today!');
    router.back();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Loading history...</Text>
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
        <Text style={styles.headerTitle}>📜 History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📜</Text>
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyText}>
              Your meal plans will appear here
            </Text>
          </View>
        ) : (
          history.map((plan) => (
            <View key={plan.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{formatDate(plan.date)}</Text>
                <Text style={styles.historyCalories}>
                  {plan.totalCalories} kcal
                </Text>
              </View>
              
              <View style={styles.historyMeals}>
                {plan.meals.map((meal) => (
                  <View key={meal.id} style={styles.historyMeal}>
                    <Text style={styles.historyMealIcon}>
                      {getMealTypeIcon(meal.type)}
                    </Text>
                    <Text style={styles.historyMealName}>{meal.name}</Text>
                    <Text style={styles.historyMealCalories}>
                      {meal.calories} kcal
                    </Text>
                  </View>
                ))}
                {plan.meals.length === 0 && (
                  <Text style={styles.historyEmptyMeals}>No meals added</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => handleCopyPlan(plan)}
              >
                <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
                <Text style={styles.copyBtnText}>Copy to Today</Text>
              </TouchableOpacity>
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
  historyCard: {
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  historyCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53935',
  },
  historyMeals: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginBottom: 10,
  },
  historyMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  historyMealIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  historyMealName: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
  },
  historyMealCalories: {
    fontSize: 12,
    color: '#64748B',
  },
  historyEmptyMeals: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 8,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});