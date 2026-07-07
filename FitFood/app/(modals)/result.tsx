import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/Colors';
import { analyzeFoodImage, FoodAnalysisResult, getFoodAlternatives } from '../services/geminiService';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const imageParam = Array.isArray(params.image) ? params.image[0] : params.image;
  const imageBase64 = typeof imageParam === 'string' ? imageParam : '';
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyzeFood = useCallback(async () => {
    if (!imageBase64) {
      setError('No image found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAlternatives([]);

      const data = await analyzeFoodImage(imageBase64);
      setResult(data);

      if (data.foodName && data.foodName !== 'Food Image') {
        void getFoodAlternatives(data.foodName)
          .then(setAlternatives)
          .catch((altError) => console.log('Error getting alternatives:', altError));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze food. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [imageBase64]);

  useEffect(() => {
    if (imageBase64) {
      analyzeFood();
    } else {
      setError('No image found');
      setLoading(false);
    }
  }, [imageBase64, analyzeFood]);

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { text: 'Excellent! 🎉', color: '#4CAF50' };
    if (score >= 60) return { text: 'Good! 👍', color: '#8BC34A' };
    if (score >= 40) return { text: 'Average 😐', color: '#FFC107' };
    if (score >= 20) return { text: 'Needs Improvement 😕', color: '#FF9800' };
    return { text: 'Unhealthy 😢', color: '#F44336' };
  };

  const handleRetry = () => {
    analyzeFood();
  };

  const handleSave = () => {
    Alert.alert('✅ Saved!', 'Food analysis saved to history');
    router.back();
  };

  const handleShare = () => {
    if (!result) return;
    Alert.alert('📤 Share', 'Share this result with others', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Copy', onPress: () => Alert.alert('📋 Copied!', 'Result copied to clipboard') },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing your food...</Text>
        <Text style={styles.loadingSubtext}>Using AI to detect nutrition</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.errorEmoji}>🍽️</Text>
        <Text style={styles.errorTitle}>No Result</Text>
        <Text style={styles.errorText}>Could not analyze the food. Please try again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const healthStatus = getHealthStatus(result.healthScore);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis Result</Text>
          <TouchableOpacity style={styles.shareHeaderButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.foodNameContainer}>
          <Text style={styles.foodName}>{result.foodName}</Text>
          {result.cuisine && (
            <View style={styles.cuisineTag}>
              <Text style={styles.cuisineTagText}>{result.cuisine}</Text>
            </View>
          )}
          {result.servingSize && (
            <Text style={styles.servingText}>🍽️ {result.servingSize}</Text>
          )}
        </View>

        <View style={[styles.scoreContainer, { backgroundColor: healthStatus.color + '15' }]}>
          <View style={styles.scoreCircle}>
            <LinearGradient colors={[healthStatus.color, healthStatus.color + 'CC']} style={styles.scoreGradient}>
              <Text style={[styles.scoreValue, { color: healthStatus.color }]}>{result.healthScore}</Text>
            </LinearGradient>
          </View>
          <Text style={[styles.scoreStatus, { color: healthStatus.color }]}>{healthStatus.text}</Text>
          <Text style={styles.scoreSubtext}>
            {result.healthScore >= 60 ? 'Great choice! Keep it up! 💪' : 'Consider healthier options next time'}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart-outline" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Nutrition Breakdown</Text>
          </View>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{result.nutrition.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{result.nutrition.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{result.nutrition.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{result.nutrition.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{result.nutrition.fiber}g</Text>
              <Text style={styles.nutritionLabel}>Fiber</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{result.nutrition.sugar}g</Text>
              <Text style={styles.nutritionLabel}>Sugar</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{result.nutrition.sodium}mg</Text>
              <Text style={styles.nutritionLabel}>Sodium</Text>
            </View>
          </View>
        </View>

        {result.goodPoints && result.goodPoints.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Good Points</Text>
            </View>
            {result.goodPoints.map((point, index) => (
              <View key={index} style={styles.pointRow}>
                <View style={styles.goodBullet} />
                <Text style={styles.goodPointText}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {result.badPoints && result.badPoints.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle-outline" size={22} color="#F44336" />
              <Text style={styles.sectionTitle}>Bad Points</Text>
            </View>
            {result.badPoints.map((point, index) => (
              <View key={index} style={styles.pointRow}>
                <View style={styles.badBullet} />
                <Text style={styles.badPointText}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {result.allergens && result.allergens.length > 0 && (
          <View style={[styles.section, styles.allergenSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning-outline" size={22} color="#FF9800" />
              <Text style={styles.sectionTitle}>Allergens</Text>
            </View>
            <View style={styles.allergenContainer}>
              {result.allergens.map((allergen, index) => (
                <View key={index} style={styles.allergenTag}>
                  <Text style={styles.allergenTagText}>{allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {alternatives.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="swap-horizontal-outline" size={22} color={colors.primary} />
              <Text style={styles.sectionTitle}>Healthier Alternatives</Text>
            </View>
            {alternatives.map((alt, index) => (
              <View key={index} style={styles.alternativeItem}>
                <Text style={styles.alternativeNumber}>{index + 1}.</Text>
                <Text style={styles.alternativeText}>{alt}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save to History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={colors.primary} />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  loadingText: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 16 },
  loadingSubtext: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA', paddingHorizontal: 20 },
  errorEmoji: { fontSize: 60 },
  errorTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginTop: 12 },
  errorText: { fontSize: 16, color: colors.textLight, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  retryButton: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  goBackText: { color: colors.primary, fontSize: 16, marginTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  shareHeaderButton: { padding: 4 },
  foodNameContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  foodName: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
  cuisineTag: { marginTop: 8, backgroundColor: colors.primaryLight + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  cuisineTagText: { color: colors.primary, fontWeight: '600' },
  servingText: { marginTop: 8, color: colors.textLight, fontSize: 14 },
  scoreContainer: { padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  scoreCircle: { width: 96, height: 96, borderRadius: 48, marginBottom: 10 },
  scoreGradient: { flex: 1, borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
  scoreValue: { fontSize: 28, fontWeight: '700' },
  scoreStatus: { fontSize: 18, fontWeight: '700' },
  scoreSubtext: { fontSize: 13, color: colors.textLight, marginTop: 4, textAlign: 'center' },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginLeft: 8 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  nutritionItem: { width: '48%', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 8 },
  nutritionValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  nutritionLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  goodBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginTop: 6, marginRight: 8 },
  goodPointText: { flex: 1, color: colors.text, fontSize: 14 },
  badBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336', marginTop: 6, marginRight: 8 },
  badPointText: { flex: 1, color: colors.text, fontSize: 14 },
  allergenSection: { marginBottom: 16 },
  allergenContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  allergenTag: { backgroundColor: '#FFF3E0', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  allergenTagText: { color: '#F57C00', fontSize: 12, fontWeight: '600' },
  alternativeItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  alternativeNumber: { color: colors.primary, fontWeight: '700', marginRight: 6 },
  alternativeText: { flex: 1, color: colors.text, fontSize: 14 },
  actionsContainer: { flexDirection: 'row', gap: 12, paddingBottom: 24 },
  saveButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12 },
  saveButtonText: { color: '#FFFFFF', marginLeft: 6, fontWeight: '700' },
  shareButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  shareButtonText: { color: colors.primary, marginLeft: 6, fontWeight: '700' },
});
