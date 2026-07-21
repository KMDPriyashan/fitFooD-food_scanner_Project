import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../../constants/Colors';
import { Food } from '../types';

const { width, height } = Dimensions.get('window');

interface FoodDetailModalProps {
  visible: boolean;
  food: Food | null;
  onClose: () => void;
}

const FoodDetailModal = ({ visible, food, onClose }: FoodDetailModalProps) => {
  if (!food) return null;

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#4CAF50';
    }
  };

  // Get difficulty icon
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '😊';
      case 'medium': return '🤔';
      case 'hard': return '😅';
      default: return '😊';
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.6)" />
      
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* Hero Image Section */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }} 
              style={styles.image} 
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.imageGradient}
            />
            
            {/* Food Name Overlay */}
            <View style={styles.nameOverlay}>
              <Text style={styles.modalName}>{food.name}</Text>
              {food.name_si && <Text style={styles.modalNameSi}>{food.name_si}</Text>}
            </View>

            {/* Tags Overlay - Bottom */}
            <View style={styles.tagsOverlay}>
              <View style={[styles.tag, styles.tagCategory]}>
                <Ionicons name="restaurant-outline" size={14} color="#FFFFFF" />
                <Text style={styles.tagTextLight}>{food.category || 'Food'}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: getDifficultyColor(food.difficulty || 'Easy') }]}>
                <Text style={styles.tagTextLight}>
                  {getDifficultyIcon(food.difficulty || 'Easy')} {food.difficulty || 'Easy'}
                </Text>
              </View>
              <View style={[styles.tag, styles.tagTime]}>
                <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                <Text style={styles.tagTextLight}>{food.cooking_time || 0}m</Text>
              </View>
            </View>
          </View>

          {/* Content Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <Ionicons name="flame-outline" size={20} color={colors.primary} />
                <Text style={styles.quickStatValue}>{food.nutrition?.calories || 0}</Text>
                <Text style={styles.quickStatLabel}>Calories</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Ionicons name="timer-outline" size={20} color={colors.primary} />
                <Text style={styles.quickStatValue}>{food.prep_time || 0}m</Text>
                <Text style={styles.quickStatLabel}>Prep Time</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={styles.quickStatValue}>{food.servings || 2}</Text>
                <Text style={styles.quickStatLabel}>Serves</Text>
              </View>
            </View>

            {/* Dietary Tags */}
            {(food.is_vegetarian || food.is_vegan || food.is_gluten_free) && (
              <View style={styles.dietaryTagsRow}>
                {food.is_vegetarian && (
                  <View style={[styles.dietaryChip, styles.vegetarianChip]}>
                    <Text style={styles.dietaryChipText}>🌱 Vegetarian</Text>
                  </View>
                )}
                {food.is_vegan && (
                  <View style={[styles.dietaryChip, styles.veganChip]}>
                    <Text style={styles.dietaryChipText}>🌿 Vegan</Text>
                  </View>
                )}
                {food.is_gluten_free && (
                  <View style={[styles.dietaryChip, styles.glutenFreeChip]}>
                    <Text style={styles.dietaryChipText}>🚫 gluten_free</Text>
                  </View>
                )}
              </View>
            )}

            {/* Description */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Description</Text>
              </View>
              <Text style={styles.description}>{food.description || food.short_description || ''}</Text>
            </View>

            {/* Ingredients */}
            {food.ingredients && food.ingredients.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list-outline" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                </View>
                {food.ingredients.map((ingredient: any, index: number) => (
                  <View key={index} style={styles.ingredientRow}>
                    <View style={styles.ingredientBullet} />
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.ingredientAmount}>
                      {ingredient.amount} {ingredient.unit}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Preparation Steps */}
            {food.preparation_steps && food.preparation_steps.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="cafe-outline" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Preparation</Text>
                </View>
                {food.preparation_steps.map((step: string, index: number) => (
                  <View key={index} style={styles.stepRow}>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={styles.stepNumberGradient}
                    >
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    </LinearGradient>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Nutrition */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="stats-chart-outline" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              </View>
              <View style={styles.nutritionContainer}>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{food.nutrition?.calories || 0}</Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{food.nutrition?.protein || 0}g</Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{food.nutrition?.carbs || 0}g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{food.nutrition?.fat || 0}g</Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{food.nutrition?.fiber || 0}g</Text>
                    <Text style={styles.nutritionLabel}>Fiber</Text>
                  </View>
                  {food.nutrition?.sodium && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{food.nutrition?.sodium}mg</Text>
                      <Text style={styles.nutritionLabel}>Sodium</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Good Points */}
            {food.good_points && food.good_points.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#4CAF50" />
                  <Text style={styles.sectionTitle}>Good Points</Text>
                </View>
                {food.good_points.map((point, idx) => (
                  <View key={idx} style={styles.pointRow}>
                    <View style={styles.goodBullet} />
                    <Text style={styles.goodPointText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Bad Points */}
            {food.bad_points && food.bad_points.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="alert-circle-outline" size={22} color="#F44336" />
                  <Text style={styles.sectionTitle}>Bad Points</Text>
                </View>
                {food.bad_points.map((point, idx) => (
                  <View key={idx} style={styles.pointRow}>
                    <View style={styles.badBullet} />
                    <Text style={styles.badPointText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            {food.tips && food.tips.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bulb-outline" size={22} color="#FF9800" />
                  <Text style={styles.sectionTitle}>Tips</Text>
                </View>
                {food.tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <Text style={styles.tipBullet}>💡</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Serving Suggestions */}
            {food.serving_suggestions && food.serving_suggestions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="restaurant-outline" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Serving Suggestions</Text>
                </View>
                {food.serving_suggestions.map((suggestion, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <Text style={styles.tipBullet}>🍽</Text>
                    <Text style={styles.tipText}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Cultural Significance */}
            {food.cultural_significance && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="ribbon-outline" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Cultural Significance</Text>
                </View>
                <View style={styles.culturalContainer}>
                  <Text style={styles.description}>{food.cultural_significance}</Text>
                </View>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🏷️ {food.region || 'Sri Lankan'} Cuisine
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '94%',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 260,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  modalName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalNameSi: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagsOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  tagCategory: {
    backgroundColor: 'rgba(229, 57, 53, 0.85)',
  },
  tagTime: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  tagTextLight: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  quickStatLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8ECF0',
  },
  dietaryTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dietaryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  vegetarianChip: {
    backgroundColor: '#E8F5E9',
  },
  veganChip: {
    backgroundColor: '#C8E6C9',
  },
  glutenFreeChip: {
    backgroundColor: '#FFF3E0',
  },
  dietaryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 22,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  ingredientBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  ingredientAmount: {
    fontSize: 14,
    color: colors.textLight,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  stepNumberGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  nutritionContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '30%',
    alignItems: 'center',
    marginVertical: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  nutritionLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  goodBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  goodPointText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  badBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F44336',
    marginRight: 10,
  },
  badPointText: {
    fontSize: 14,
    color: '#F44336',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tipBullet: {
    fontSize: 14,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  culturalContainer: {
    backgroundColor: '#FFF8E1',
    padding: 14,
    borderRadius: 12,
  },
  footer: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default FoodDetailModal;