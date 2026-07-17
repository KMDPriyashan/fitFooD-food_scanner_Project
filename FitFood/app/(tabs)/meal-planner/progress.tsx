// app/(tabs)/meal-planner/progress.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator, // ✅ Added this import
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MealPlannerService from '../../services/meal-planner/mealPlannerService';
import { getNutritionGoal, getWaterIntake } from '../../services/meal-planner/storageService';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [waterAmount, setWaterAmount] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const data = await MealPlannerService.getNutritionProgress();
      setProgress(data);
      const today = new Date().toISOString().split('T')[0];
      const water = await getWaterIntake(today);
      setWaterAmount(water);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async () => {
  const updatedPlan = await MealPlannerService.addWater(1);
  setWaterAmount(updatedPlan.waterIntake);
  await loadProgress();
};

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Loading progress...</Text>
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
        <Text style={styles.headerTitle}>📊 Progress</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {progress && (
          <View style={styles.progressContainer}>
            {/* Calories */}
            <View style={styles.progressCard}>
              <LinearGradient
                colors={['#E53935', '#C62828']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressCardGradient}
              >
                <View style={styles.progressCardHeader}>
                  <Text style={styles.progressCardTitle}>🔥 Calories</Text>
                  <Text style={styles.progressCardValue}>
                    {Math.round(progress.calories.current)} / {progress.calories.goal} kcal
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${progress.calories.percentage}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressCardPercentage}>
                  {Math.round(progress.calories.percentage)}% Complete
                </Text>
              </LinearGradient>
            </View>

            {/* Protein */}
            <View style={styles.progressCard}>
              <View style={styles.progressCardHeader}>
                <Text style={styles.progressCardTitle}>💪 Protein</Text>
                <Text style={[styles.progressCardValue, { color: '#4CAF50' }]}>
                  {Math.round(progress.protein.current)} / {progress.protein.goal}g
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progress.protein.percentage}%`, backgroundColor: '#4CAF50' },
                  ]}
                />
              </View>
              <Text style={styles.progressCardPercentage}>
                {Math.round(progress.protein.percentage)}% Complete
              </Text>
            </View>

            {/* Carbs */}
            <View style={styles.progressCard}>
              <View style={styles.progressCardHeader}>
                <Text style={styles.progressCardTitle}>🌾 Carbs</Text>
                <Text style={[styles.progressCardValue, { color: '#FF9800' }]}>
                  {Math.round(progress.carbs.current)} / {progress.carbs.goal}g
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progress.carbs.percentage}%`, backgroundColor: '#FF9800' },
                  ]}
                />
              </View>
              <Text style={styles.progressCardPercentage}>
                {Math.round(progress.carbs.percentage)}% Complete
              </Text>
            </View>

            {/* Fat */}
            <View style={styles.progressCard}>
              <View style={styles.progressCardHeader}>
                <Text style={styles.progressCardTitle}>🧈 Fat</Text>
                <Text style={[styles.progressCardValue, { color: '#9C27B0' }]}>
                  {Math.round(progress.fat.current)} / {progress.fat.goal}g
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progress.fat.percentage}%`, backgroundColor: '#9C27B0' },
                  ]}
                />
              </View>
              <Text style={styles.progressCardPercentage}>
                {Math.round(progress.fat.percentage)}% Complete
              </Text>
            </View>

            {/* Water */}
            <View style={styles.progressCard}>
              <View style={styles.progressCardHeader}>
                <Text style={styles.progressCardTitle}>💧 Water</Text>
                <Text style={[styles.progressCardValue, { color: '#2196F3' }]}>
                  {Math.round(waterAmount)} / {progress.water.goal} glasses
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progress.water.percentage}%`, backgroundColor: '#2196F3' },
                  ]}
                />
              </View>
              <View style={styles.waterActions}>
                <Text style={styles.progressCardPercentage}>
                  {Math.round(progress.water.percentage)}% Complete
                </Text>
                <TouchableOpacity style={styles.addWaterBtn} onPress={handleAddWater}>
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.addWaterBtnText}>+1 Glass</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  progressContainer: {
    gap: 12,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  progressCardGradient: {
    padding: 16,
    borderRadius: 12,
    margin: -16,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressCardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E53935',
    borderRadius: 4,
  },
  progressCardPercentage: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  waterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  addWaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  addWaterBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});