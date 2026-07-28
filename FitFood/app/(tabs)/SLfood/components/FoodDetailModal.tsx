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
  Share,
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

  // Share function
  const handleShare = async () => {
    try {
      await Share.share({
        message: `🍽️ ${food.name}\n\n${food.description || ''}\n\n🥗 Nutrition: ${food.nutrition?.calories || 0} cal | ${food.nutrition?.protein || 0}g protein\n\n📱 Shared from FitFood App`,
        title: food.name,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.7)" />
      
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Close & Share Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Hero Image Section */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }} 
              style={styles.image} 
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageGradient}
            />
            
            {/* Food Name Overlay */}
            <View style={styles.nameOverlay}>
              <Text style={styles.modalName}>{food.name}</Text>
              {food.name_si && <Text style={styles.modalNameSi}>{food.name_si}</Text>}
            </View>

            {/* Tags Overlay */}
            <View style={styles.tagsOverlay}>
              <View style={[styles.tag, styles.tagCategory]}>
                <Ionicons name="restaurant-outline" size={12} color="#FFFFFF" />
                <Text style={styles.tagTextLight}>{food.category || 'Food'}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: getDifficultyColor(food.difficulty || 'Easy') }]}>
                <Text style={styles.tagTextLight}>
                  {getDifficultyIcon(food.difficulty || 'Easy')} {food.difficulty || 'Easy'}
                </Text>
              </View>
              <View style={[styles.tag, styles.tagTime]}>
                <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                <Text style={styles.tagTextLight}>{food.cooking_time || 0}m</Text>
              </View>
            </View>
          </View>

          {/* Content Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Stats - Redesigned */}
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <View style={styles.quickStatIcon}>
                  <Ionicons name="flame" size={18} color="#E53935" />
                </View>
                <Text style={styles.quickStatValue}>{food.nutrition?.calories || 0}</Text>
                <Text style={styles.quickStatLabel}>Calories</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <View style={styles.quickStatIcon}>
                  <Ionicons name="timer" size={18} color="#E53935" />
                </View>
                <Text style={styles.quickStatValue}>{food.prep_time || 0}m</Text>
                <Text style={styles.quickStatLabel}>Prep Time</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <View style={styles.quickStatIcon}>
                  <Ionicons name="people" size={18} color="#E53935" />
                </View>
                <Text style={styles.quickStatValue}>{food.servings || 2}</Text>
                <Text style={styles.quickStatLabel}>Serves</Text>
              </View>
            </View>

            {/* Dietary Tags - Redesigned */}
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
                    <Text style={styles.dietaryChipText}>🚫 Gluten Free</Text>
                  </View>
                )}
              </View>
            )}

            {/* Description - Redesigned */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#E53935', '#C62828']}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="document-text" size={16} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Description</Text>
              </View>
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{food.description || food.short_description || 'No description available.'}</Text>
              </View>
            </View>

            {/* Nutrition - Redesigned */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#E53935', '#C62828']}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="stats-chart" size={16} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              </View>
              <View style={styles.nutritionContainer}>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{food.nutrition?.calories || 0}</Text>
                    <Text style={styles.nutritionLabel}>Cal</Text>
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

            {/* Ingredients - Redesigned */}
            {food.ingredients && food.ingredients.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#E53935', '#C62828']}
                    style={styles.sectionIconGradient}
                  >
                    <Ionicons name="list" size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                </View>
                <View style={styles.ingredientsContainer}>
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
              </View>
            )}

            {/* Preparation Steps - Redesigned */}
            {food.preparation_steps && food.preparation_steps.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#E53935', '#C62828']}
                    style={styles.sectionIconGradient}
                  >
                    <Ionicons name="cafe" size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.sectionTitle}>Preparation</Text>
                </View>
                <View style={styles.stepsContainer}>
                  {food.preparation_steps.map((step: string, index: number) => (
                    <View key={index} style={styles.stepRow}>
                      <LinearGradient
                        colors={['#E53935', '#C62828']}
                        style={styles.stepNumberGradient}
                      >
                        <Text style={styles.stepNumber}>{index + 1}</Text>
                      </LinearGradient>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Good Points - Redesigned */}
            {food.good_points && food.good_points.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#4CAF50', '#388E3C']}
                    style={styles.sectionIconGradient}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.sectionTitle}>Good Points</Text>
                </View>
                <View style={styles.pointsContainer}>
                  {food.good_points.map((point, idx) => (
                    <View key={idx} style={styles.pointRow}>
                      <View style={styles.goodBullet} />
                      <Text style={styles.goodPointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bad Points - Redesigned */}
            {food.bad_points && food.bad_points.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#F44336', '#D32F2F']}
                    style={styles.sectionIconGradient}
                  >
                    <Ionicons name="alert" size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.sectionTitle}>Bad Points</Text>
                </View>
                <View style={styles.pointsContainer}>
                  {food.bad_points.map((point, idx) => (
                    <View key={idx} style={styles.pointRow}>
                      <View style={styles.badBullet} />
                      <Text style={styles.badPointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tips - Redesigned */}
            {food.tips && food.tips.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#FF9800', '#F57C00']}
                    style={styles.sectionIconGradient}
                  >
                    <Ionicons name="bulb" size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.sectionTitle}>Tips</Text>
                </View>
                <View style={styles.tipsContainer}>
                  {food.tips.map((tip, idx) => (
                    <View key={idx} style={styles.tipRow}>
                      <Text style={styles.tipBullet}>💡</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Cultural Significance */}
            {food.cultural_significance && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#9C27B0', '#7B1FA2']}
                    style={styles.sectionIconGradient}
                  >
                    <Ionicons name="ribbon" size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.sectionTitle}>Cultural Significance</Text>
                </View>
                <View style={styles.culturalContainer}>
                  <Text style={styles.culturalText}>{food.cultural_significance}</Text>
                </View>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🏷️ {food.region || 'Sri Lankan'} Cuisine
              </Text>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '94%',
    overflow: 'hidden',
  },
  actionButtons: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
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
    height: 140,
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
  },
  modalName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  modalNameSi: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
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
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  tagCategory: {
    backgroundColor: 'rgba(229, 57, 53, 0.9)',
  },
  tagTime: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  tagTextLight: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  quickStatLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  quickStatDivider: {
    width: 1,
    height: 35,
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
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  vegetarianChip: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  veganChip: {
    backgroundColor: '#C8E6C9',
    borderColor: '#81C784',
  },
  glutenFreeChip: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFCC80',
  },
  dietaryChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E293B',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  sectionIconGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  descriptionContainer: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  ingredientsContainer: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ingredientRowLast: {
    borderBottomWidth: 0,
  },
  ingredientBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E53935',
    marginRight: 10,
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  ingredientAmount: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  stepsContainer: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  stepRowLast: {
    marginBottom: 0,
  },
  stepNumberGradient: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
  },
  nutritionContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '30%',
    alignItems: 'center',
    marginVertical: 3,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E53935',
  },
  nutritionLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 1,
  },
  pointsContainer: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    color: '#2E7D32',
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
    color: '#C62828',
  },
  tipsContainer: {
    backgroundColor: '#FFF8E1',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
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
    color: '#1E293B',
    lineHeight: 20,
  },
  culturalContainer: {
    backgroundColor: '#F3E5F5',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CE93D8',
  },
  culturalText: {
    fontSize: 14,
    color: '#4A148C',
    lineHeight: 22,
  },
  footer: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default FoodDetailModal;