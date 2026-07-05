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
} from 'react-native';
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

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          
          <Image source={{ uri: food.image_url }} style={styles.image} />
          
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.name}>{food.name}</Text>
            {food.name_si && <Text style={styles.nameSi}>{food.name_si}</Text>}
            
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{food.category}</Text>
              </View>
              <View style={[styles.tag, styles.tagDifficulty]}>
                <Text style={styles.tagText}>{food.difficulty}</Text>
              </View>
              <View style={[styles.tag, styles.tagTime]}>
                <Text style={styles.tagText}>⏱ {food.cooking_time}m</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>📝 Description</Text>
            <Text style={styles.description}>{food.description}</Text>

            {food.ingredients && food.ingredients.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>🥘 Ingredients</Text>
                {food.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>• {ingredient.name}</Text>
                    <Text style={styles.ingredientAmount}>{ingredient.amount} {ingredient.unit}</Text>
                  </View>
                ))}
              </>
            )}

            {food.preparation_steps && food.preparation_steps.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>👨‍🍳 Preparation</Text>
                {food.preparation_steps.map((step, index) => (
                  <View key={index} style={styles.stepRow}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>📊 Nutrition</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{food.nutrition.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{food.nutrition.protein}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{food.nutrition.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{food.nutrition.fat}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{food.nutrition.fiber}g</Text>
                <Text style={styles.nutritionLabel}>Fiber</Text>
              </View>
            </View>

            {food.good_points && food.good_points.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>✅ Good Points</Text>
                {food.good_points.map((point, idx) => (
                  <Text key={idx} style={styles.pointText}>✓ {point}</Text>
                ))}
              </>
            )}

            {food.bad_points && food.bad_points.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>⚠️ Bad Points</Text>
                {food.bad_points.map((point, idx) => (
                  <Text key={idx} style={styles.badPointText}>⚠ {point}</Text>
                ))}
              </>
            )}

            {food.tips && food.tips.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>💡 Tips</Text>
                {food.tips.map((tip, idx) => (
                  <Text key={idx} style={styles.pointText}>• {tip}</Text>
                ))}
              </>
            )}

            {food.serving_suggestions && food.serving_suggestions.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>🍽 Serving Suggestions</Text>
                {food.serving_suggestions.map((suggestion, idx) => (
                  <Text key={idx} style={styles.pointText}>• {suggestion}</Text>
                ))}
              </>
            )}

            {food.cultural_significance && (
              <>
                <Text style={styles.sectionTitle}>🏛 Cultural Significance</Text>
                <Text style={styles.description}>{food.cultural_significance}</Text>
              </>
            )}

            <View style={styles.dietaryTagsContainer}>
              {food.is_vegetarian && (
                <View style={[styles.dietaryTagLarge, styles.vegetarianTag]}>
                  <Text style={styles.dietaryTagLargeText}>🌱 Vegetarian</Text>
                </View>
              )}
              {food.is_vegan && (
                <View style={[styles.dietaryTagLarge, styles.veganTag]}>
                  <Text style={styles.dietaryTagLargeText}>🌿 Vegan</Text>
                </View>
              )}
              {food.is_gluten_free && (
                <View style={[styles.dietaryTagLarge, styles.glutenFreeTag]}>
                  <Text style={styles.dietaryTagLargeText}>🚫 Gluten-Free</Text>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Serves {food.servings} • Prep: {food.prep_time}m • Cook: {food.cooking_time}m
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
  },
  body: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  nameSi: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  tag: {
    backgroundColor: colors.primaryLight + '30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  tagDifficulty: {
    backgroundColor: '#FFF3E0',
  },
  tagTime: {
    backgroundColor: '#E8F5E9',
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 22,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  ingredientName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 14,
    color: colors.textLight,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 24,
    marginRight: 10,
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 12,
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
  pointText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  badPointText: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: 4,
  },
  dietaryTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  dietaryTagLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  vegetarianTag: {
    backgroundColor: '#E8F5E9',
  },
  veganTag: {
    backgroundColor: '#C8E6C9',
  },
  glutenFreeTag: {
    backgroundColor: '#FFF3E0',
  },
  dietaryTagLargeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default FoodDetailModal;