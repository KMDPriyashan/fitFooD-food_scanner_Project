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
  Image,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/Colors';
import { analyzeFoodImage, FoodAnalysisResult, getFoodAlternatives } from '../services/geminiService';

const { width } = Dimensions.get('window');

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
    if (score >= 80) return { text: 'Excellent! 🎉', color: '#4CAF50', emoji: '🌟' };
    if (score >= 60) return { text: 'Good! 👍', color: '#8BC34A', emoji: '😊' };
    if (score >= 40) return { text: 'Average 😐', color: '#FFC107', emoji: '🤔' };
    if (score >= 20) return { text: 'Needs Improvement 😕', color: '#FF9800', emoji: '⚠️' };
    return { text: 'Unhealthy 😢', color: '#F44336', emoji: '🚫' };
  };

  const handleRetry = () => {
    analyzeFood();
  };

  const handleSave = () => {
    Alert.alert(
      '✅ Saved!',
      'Food analysis saved to history successfully!',
      [
        {
          text: 'Go Home',
          onPress: () => {
            // Navigate to home page
            router.push('/(tabs)/home');
          },
        },
        {
          text: 'Stay Here',
          style: 'cancel',
        },
      ]
    );
  };

  const handleShare = () => {
    if (!result) return;
    Alert.alert('📤 Share', 'Share this result with others', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Copy', onPress: () => Alert.alert('📋 Copied!', 'Result copied to clipboard') },
    ]);
  };

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing your food...</Text>
        <Text style={styles.loadingSubtext}>Using Gemini AI to detect nutrition</Text>
      </SafeAreaView>
    );
  }

  // Error State
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
  const isHealthy = result.healthScore >= 60;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Full Report</Text>
          <TouchableOpacity style={styles.shareHeaderButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Food Image */}
        {imageBase64 && (
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: `data:image/jpeg;base64,${
                  imageBase64.includes('base64,') ? imageBase64.split('base64,')[1] : imageBase64
                }`,
              }}
              style={styles.foodImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageGradient}
            />
          </View>
        )}

        {/* Food Name & Summary */}
        <View style={styles.foodNameContainer}>
          <Text style={styles.foodName}>{result.foodName}</Text>
          {result.summary && <Text style={styles.summaryText}>{result.summary}</Text>}
          {result.cuisine && (
            <View style={styles.cuisineTag}>
              <Text style={styles.cuisineTagText}>🍽️ {result.cuisine}</Text>
            </View>
          )}
          {result.servingSize && (
            <Text style={styles.servingText}>📏 {result.servingSize}</Text>
          )}
        </View>

        {/* Health Score */}
        <View style={[styles.scoreContainer, { backgroundColor: healthStatus.color + '12' }]}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Health Score</Text>
            <View style={[styles.healthBadge, { backgroundColor: isHealthy ? '#4CAF50' : '#F44336' }]}>
              <Text style={styles.healthBadgeText}>{isHealthy ? '✅ Healthy' : '⚠️ Unhealthy'}</Text>
            </View>
          </View>

          <View style={styles.scoreCircle}>
            <LinearGradient
              colors={[healthStatus.color, healthStatus.color + 'CC']}
              style={styles.scoreGradient}
            >
              <Text style={[styles.scoreValue, { color: '#FFFFFF' }]}>{result.healthScore}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </LinearGradient>
          </View>

          <Text style={[styles.scoreStatus, { color: healthStatus.color }]}>
            {healthStatus.emoji} {healthStatus.text}
          </Text>
        </View>

        {/* ============================================
            ENHANCED SECTIONS - FULL DETAILED REPORT
            ============================================ */}

        {/* 1. Detailed Good Points */}
        {result.detailedGoodPoints && result.detailedGoodPoints.length > 0 && (
          <View style={[styles.section, styles.goodSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#4CAF50" />
              <Text style={[styles.sectionTitle, { color: '#4CAF50' }]}>✅ Detailed Good Points</Text>
            </View>
            {result.detailedGoodPoints.map((item, index) => (
              <View key={index} style={styles.detailItem}>
                <View style={styles.goodBulletLarge} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailTitle}>{item.point}</Text>
                  <Text style={styles.detailExplanation}>{item.explanation}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 2. Detailed Bad Points */}
        {result.detailedBadPoints && result.detailedBadPoints.length > 0 && (
          <View style={[styles.section, styles.badSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle-outline" size={22} color="#F44336" />
              <Text style={[styles.sectionTitle, { color: '#F44336' }]}>⚠️ Detailed Bad Points</Text>
            </View>
            {result.detailedBadPoints.map((item, index) => (
              <View key={index} style={styles.detailItem}>
                <View style={styles.badBulletLarge} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailTitle, { color: '#F44336' }]}>{item.point}</Text>
                  <Text style={styles.detailExplanation}>{item.explanation}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 3. Detailed Nutrition - Vitamins & Minerals */}
        {result.detailedNutrition && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="stats-chart-outline" size={22} color={colors.primary} />
              <Text style={styles.sectionTitle}>📊 Detailed Nutrition</Text>
            </View>

            {/* Vitamins */}
            {result.detailedNutrition.vitamins && result.detailedNutrition.vitamins.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>💊 Vitamins</Text>
                <View style={styles.tagContainer}>
                  {result.detailedNutrition.vitamins.map((v, i) => (
                    <View key={i} style={[styles.tag, styles.vitaminTag]}>
                      <Text style={styles.tagText}>{v}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Minerals */}
            {result.detailedNutrition.minerals && result.detailedNutrition.minerals.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>🧪 Minerals</Text>
                <View style={styles.tagContainer}>
                  {result.detailedNutrition.minerals.map((m, i) => (
                    <View key={i} style={[styles.tag, styles.mineralTag]}>
                      <Text style={styles.tagText}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Key Nutrients */}
            {result.detailedNutrition.keyNutrients && result.detailedNutrition.keyNutrients.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>⭐ Key Nutrients</Text>
                {result.detailedNutrition.keyNutrients.map((n, i) => (
                  <Text key={i} style={styles.bulletText}>• {n}</Text>
                ))}
              </View>
            )}

            {/* Health Benefits */}
            {result.detailedNutrition.healthBenefits && result.detailedNutrition.healthBenefits.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>💪 Health Benefits</Text>
                {result.detailedNutrition.healthBenefits.map((b, i) => (
                  <Text key={i} style={styles.bulletText}>• {b}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 4. Dietary Information */}
        {result.dietaryInfo && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant-outline" size={22} color="#9C27B0" />
              <Text style={[styles.sectionTitle, { color: '#9C27B0' }]}>🥗 Dietary Information</Text>
            </View>

            {/* High In */}
            {result.dietaryInfo.isHighIn && result.dietaryInfo.isHighIn.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>📈 High In</Text>
                <View style={styles.tagContainer}>
                  {result.dietaryInfo.isHighIn.map((item, i) => (
                    <View key={i} style={[styles.tag, styles.highTag]}>
                      <Text style={styles.tagText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Low In */}
            {result.dietaryInfo.isLowIn && result.dietaryInfo.isLowIn.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>📉 Low In</Text>
                <View style={styles.tagContainer}>
                  {result.dietaryInfo.isLowIn.map((item, i) => (
                    <View key={i} style={[styles.tag, styles.lowTag]}>
                      <Text style={styles.tagText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Suitable For */}
            {result.dietaryInfo.suitableFor && result.dietaryInfo.suitableFor.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>✅ Suitable For</Text>
                {result.dietaryInfo.suitableFor.map((item, i) => (
                  <Text key={i} style={styles.bulletText}>✅ {item}</Text>
                ))}
              </View>
            )}

            {/* Not Suitable For */}
            {result.dietaryInfo.notSuitableFor && result.dietaryInfo.notSuitableFor.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>🚫 Not Suitable For</Text>
                {result.dietaryInfo.notSuitableFor.map((item, i) => (
                  <Text key={i} style={[styles.bulletText, { color: '#F44336' }]}>❌ {item}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 5. Meal Recommendations */}
        {result.mealRecommendation && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cafe-outline" size={22} color="#FF6F00" />
              <Text style={[styles.sectionTitle, { color: '#FF6F00' }]}>🍽️ Meal Recommendations</Text>
            </View>

            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationLabel}>⏰ Best Time to Eat</Text>
              <Text style={styles.recommendationText}>{result.mealRecommendation.bestTimeToEat}</Text>
            </View>

            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationLabel}>📏 Portion Suggestion</Text>
              <Text style={styles.recommendationText}>{result.mealRecommendation.portionSuggestion}</Text>
            </View>

            {result.mealRecommendation.pairingSuggestions &&
              result.mealRecommendation.pairingSuggestions.length > 0 && (
                <View style={styles.recommendationItem}>
                  <Text style={styles.recommendationLabel}>🍴 Pairing Suggestions</Text>
                  {result.mealRecommendation.pairingSuggestions.map((p, i) => (
                    <Text key={i} style={styles.bulletText}>• {p}</Text>
                  ))}
                </View>
              )}

            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationLabel}>🧊 Storage Tips</Text>
              <Text style={styles.recommendationText}>{result.mealRecommendation.storageTips}</Text>
            </View>
          </View>
        )}

        {/* 6. Health Impact */}
        {result.healthImpact && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={22} color="#E91E63" />
              <Text style={[styles.sectionTitle, { color: '#E91E63' }]}>❤️ Health Impact</Text>
            </View>

            {result.healthImpact.positive && result.healthImpact.positive.length > 0 && (
              <View style={styles.subSection}>
                <Text style={[styles.subSectionTitle, { color: '#4CAF50' }]}>✅ Positive Impacts</Text>
                {result.healthImpact.positive.map((item, i) => (
                  <Text key={i} style={styles.bulletText}>✅ {item}</Text>
                ))}
              </View>
            )}

            {result.healthImpact.negative && result.healthImpact.negative.length > 0 && (
              <View style={styles.subSection}>
                <Text style={[styles.subSectionTitle, { color: '#F44336' }]}>⚠️ Negative Impacts</Text>
                {result.healthImpact.negative.map((item, i) => (
                  <Text key={i} style={[styles.bulletText, { color: '#F44336' }]}>⚠️ {item}</Text>
                ))}
              </View>
            )}

            {result.healthImpact.neutral && result.healthImpact.neutral.length > 0 && (
              <View style={styles.subSection}>
                <Text style={[styles.subSectionTitle, { color: '#FF9800' }]}>• Neutral Aspects</Text>
                {result.healthImpact.neutral.map((item, i) => (
                  <Text key={i} style={styles.bulletText}>• {item}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 7. Allergens */}
        {result.allergens && result.allergens.length > 0 && (
          <View style={[styles.section, styles.allergenSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning-outline" size={22} color="#FF9800" />
              <Text style={[styles.sectionTitle, { color: '#FF9800' }]}>⚠️ Allergens</Text>
            </View>
            <View style={styles.tagContainer}>
              {result.allergens.map((allergen, index) => (
                <View key={index} style={styles.allergenTag}>
                  <Text style={styles.allergenTagText}>{allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 8. Healthier Alternatives */}
        {alternatives.length > 0 && (
          <View style={[styles.section, styles.alternativeSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="swap-horizontal-outline" size={22} color="#2196F3" />
              <Text style={[styles.sectionTitle, { color: '#2196F3' }]}>💡 Healthier Alternatives</Text>
            </View>
            <Text style={styles.alternativeIntro}>
              Here are some healthier alternatives to try instead of {result.foodName}:
            </Text>
            {alternatives.map((alt, index) => (
              <View key={index} style={styles.alternativeItem}>
                <View style={styles.alternativeNumberContainer}>
                  <Text style={styles.alternativeNumber}>{index + 1}</Text>
                </View>
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeText}>{alt}</Text>
                  <Text style={styles.alternativeBenefit}>
                    {index === 0
                      ? '🥗 Lower in calories, higher in nutrients'
                      : index === 1
                      ? '🌿 Rich in vitamins and minerals'
                      : '🍽️ Balanced nutrition profile'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 9. Nutrition Breakdown (Basic) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>📊 Nutrition Facts</Text>
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

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Full Report</Text>
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
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },

  // Error Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
  },
  errorEmoji: {
    fontSize: 60,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goBackText: {
    color: colors.primary,
    fontSize: 16,
    marginTop: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 40,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  shareHeaderButton: {
    padding: 4,
  },

  // Food Image
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  // Food Name
  foodNameContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  foodName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  cuisineTag: {
    marginTop: 10,
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'center',
  },
  cuisineTagText: {
    color: colors.primary,
    fontWeight: '600',
  },
  servingText: {
    marginTop: 8,
    color: colors.textLight,
    fontSize: 14,
    textAlign: 'center',
  },

  // Score
  scoreContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  healthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  healthBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    overflow: 'hidden',
  },
  scoreGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreMax: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  scoreStatus: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },

  // Good Section
  goodSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  badSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  allergenSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alternativeSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },

  // Detail Items
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  goodBulletLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginTop: 4,
    marginRight: 12,
    flexShrink: 0,
  },
  badBulletLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F44336',
    marginTop: 4,
    marginRight: 12,
    flexShrink: 0,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  detailExplanation: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
    lineHeight: 18,
  },

  // Sub Section
  subSection: {
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },

  // Tags
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  vitaminTag: {
    backgroundColor: '#E3F2FD',
  },
  mineralTag: {
    backgroundColor: '#F3E5F5',
  },
  highTag: {
    backgroundColor: '#E8F5E9',
  },
  lowTag: {
    backgroundColor: '#FFF3E0',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },

  // Bullet Text
  bulletText: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 3,
    lineHeight: 20,
  },

  // Nutrition Grid
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '30%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  nutritionLabel: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 1,
  },

  // Alternatives
  alternativeIntro: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: '#F5F9FF',
    borderRadius: 12,
    padding: 12,
  },
  alternativeNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  alternativeNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  alternativeContent: {
    flex: 1,
  },
  alternativeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  alternativeBenefit: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },

  // Allergens
  allergenTag: {
    backgroundColor: '#FFF3E0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  allergenTagText: {
    color: '#F57C00',
    fontSize: 13,
    fontWeight: '600',
  },

  // Recommendations
  recommendationItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recommendationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.textLight,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 24,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '700',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  shareButtonText: {
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '700',
  },
});